import React, { useState, useEffect } from 'react';
import { patientApi } from '../services/patientApi.js';
import { clinicApi } from '../services/clinicApi.js';
import AdminSidebar from '../components/AdminSidebar.jsx';
import MiniDashboards from '../components/MiniDashboards.jsx';
import PatientTable from '../components/PatientTable.jsx';
import PatientFichaModal from '../components/PatientFichaModal.jsx';
import NewPatientWizardModal from '../components/NewPatientWizardModal.jsx';
import RequestExamModal from '../components/RequestExamModal.jsx';
import NewExamModule from '../components/NewExamModule.jsx';
import OrdersTrackingView from '../components/OrdersTrackingView.jsx';
import ResultadosView from '../components/ResultadosView.jsx';
import CatalogView from '../components/CatalogView.jsx';
import ClinicalCatalogView from '../components/ClinicalCatalogView.jsx';
import TemporalEvolutionView from '../components/TemporalEvolutionView.jsx';
import SupportView from '../components/SupportView.jsx';
import ClinicProfileView from '../components/ClinicProfileView.jsx';
import TeamPermissionsView from '../components/TeamPermissionsView.jsx';
import UnifiedClinicManagementView from '../components/UnifiedClinicManagementView.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function VeterinariansPortal() {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ species: [], breeds: [], sampleStatuses: [] });
  const [filters, setFilters] = useState({
    search: '',
    species: 'all',
    breed: 'all',
    sampleStatus: 'all',
    sedeId: 'all',
  });

  // Módulo activo en el panel administrativo: 'pacientes' | 'nuevo-examen' | 'seguimiento' | 'resultados' | 'catalogo' | 'evolucion-temporal' | 'perfil-veterinaria' | 'soporte'
  const [activeModule, setActiveModule] = useState('pacientes');
  const [activeClinic, setActiveClinic] = useState(null);
  const [examModulePatient, setExamModulePatient] = useState(null);
  const [examModuleType, setExamModuleType] = useState('nuevo');
  const [temporalEvolutionPatient, setTemporalEvolutionPatient] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPatientWizard, setShowNewPatientWizard] = useState(false);
  const [showGeneralExamModal, setShowGeneralExamModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    loadPatients();
    loadStats(filters.sedeId);
  }, [filters]);

  useEffect(() => {
    loadInitialStats();

    // Sincronización 100% automática en segundo plano:
    // 1. Al volver a enfocar la ventana / pestaña del navegador
    // 2. Periódicamente cada 45 segundos para detectar cambios externos en Kea
    const doAutoSync = () => {
      patientApi.syncKea().then((res) => {
        if (res?.data?.patients) {
          setPatients(res.data.patients);
        }
      }).catch(() => {});
    };

    window.addEventListener('focus', doAutoSync);
    const syncInterval = setInterval(doAutoSync, 45000);

    return () => {
      window.removeEventListener('focus', doAutoSync);
      clearInterval(syncInterval);
    };
  }, []);

  const loadInitialStats = async () => {
    try {
      const [s, f, clinic] = await Promise.all([
        patientApi.getStats({ sedeId: filters.sedeId }),
        patientApi.getFilters(),
        clinicApi.getActiveClinic(),
      ]);
      setStats(s);
      setFilterOptions(f);
      setActiveClinic(clinic);

      // Auto-sincronizar con Kea Tools en segundo plano
      patientApi.syncKea().then((res) => {
        if (res && res.data && res.data.patients) {
          setPatients(res.data.patients);
        }
      }).catch(() => {});
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    }
  };

  const loadStats = async (sedeId) => {
    try {
      const s = await patientApi.getStats({ sedeId });
      setStats(s);
    } catch (_) {}
  };

  const loadPatients = async () => {
    try {
      const list = await patientApi.getPatients(filters);
      setPatients(list);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apertura y gestión del Módulo "Nuevo Examen" desde el panel
  const handleOpenExamModule = (patient = null, initialType = 'nuevo') => {
    setExamModulePatient(patient);
    setExamModuleType(initialType);
    setSelectedPatient(null);
    setShowGeneralExamModal(false);
    setActiveModule('nuevo-examen');
  };

  const handleCloseExamModule = () => {
    setActiveModule('pacientes');
    setExamModulePatient(null);
    setExamModuleType('nuevo');
  };

  const handleNavigateToTracking = () => {
    setActiveModule('seguimiento');
  };

  // Crear paciente desde Wizard
  const handleCreatePatient = async (patientData) => {
    try {
      const created = await patientApi.createPatient(patientData);
      await loadPatients();
      await loadInitialStats();

      if (patientData.requestExam) {
        showToast(`¡Paciente ${created.name} (${created.id}) registrado con éxito! Redirigiendo a solicitud de examen qPCR...`);
        setShowNewPatientWizard(false);
        handleOpenExamModule(created, 'nuevo');
      } else {
        showToast(`¡Paciente ${created.name} (${created.id}) registrado con éxito!`);
        setShowNewPatientWizard(false);
        setSelectedPatient(created);
      }
    } catch (err) {
      alert(err.message || 'Error registrando paciente');
    }
  };

  // Actualizar paciente (con bloqueo de fallecido)
  const handleUpdatePatient = async (id, updatedData) => {
    try {
      const updated = await patientApi.updatePatient(id, updatedData);
      showToast(`Ficha de ${updated.name} actualizada correctamente.`);
      setSelectedPatient(updated);
      await loadPatients();
      await loadInitialStats();
    } catch (err) {
      alert(err.message || 'Error al actualizar paciente');
      throw err;
    }
  };

  // Solicitar examen (persistencia API)
  const handleRequestExam = async (id, examData) => {
    try {
      const newOrder = await patientApi.requestExam(id, examData);
      showToast(`Orden ${newOrder.id} generada con éxito.`);
      await loadPatients();
      await loadInitialStats();
      return newOrder;
    } catch (err) {
      alert(err.message || 'Error solicitando examen');
      throw err;
    }
  };

  // Obtener etiqueta de navegación / breadcrumb según el módulo actual
  const getModuleBreadcrumb = () => {
    switch (activeModule) {
      case 'nuevo-examen':
        return { section: 'Diagnóstico', title: 'Módulo de Nuevo Examen qPCR', icon: '✨' };
      case 'seguimiento':
        return { section: 'Logística', title: 'Seguimiento de Órdenes & Muestras', icon: '🚚' };
      case 'resultados':
        return { section: 'Laboratorio', title: 'Resultados Diagnósticos qPCR', icon: '🔬' };
      case 'catalogo':
        return { section: 'Base de Datos', title: 'Catálogo de Perfiles qPCR', icon: '📖' };
      case 'catalogo-clinicas':
        return { section: 'Portafolio Clínico', title: 'Catálogo de Clínicas & Pruebas Diagnósticas', icon: '🏥' };
      case 'evolucion-temporal':
        return { section: 'Analíticas', title: 'Evolución Temporal & Analíticas Longitudinales', icon: '📈' };
      case 'perfil-veterinaria':
        return { section: 'Administración', title: 'Perfil de Veterinaria & Médicos', icon: '🏥' };
      case 'equipo-permisos':
        return { section: 'Administración', title: 'Gestión de Equipo & Permisos Médicos', icon: '🛡️' };
      case 'soporte':
        return { section: 'Atención & Ayuda', title: 'Centro de Ayuda y Soporte', icon: '🎧' };
      case 'pacientes':
      default:
        return { section: 'Clínica', title: 'Módulo de Pacientes & Admisiones', icon: '🐾' };
    }
  };

  const breadcrumb = getModuleBreadcrumb();

  return (
    <div className="min-h-screen bg-[#f7f5fd] text-slate-800 flex font-body">
      {/* Toast flotante de notificación */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PANEL LATERAL ADMINISTRATIVO A LA IZQUIERDA */}
      <AdminSidebar
        activeModule={activeModule}
        activeClinic={activeClinic}
        onSelectModule={(mod) => {
          if (mod === 'nuevo-examen') {
            handleOpenExamModule(null);
          } else {
            setActiveModule(mod);
            setExamModulePatient(null);
            setTemporalEvolutionPatient(null);
          }
        }}
        onOpenNewPatientWizard={() => setShowNewPatientWizard(true)}
        onOpenNewExam={() => handleOpenExamModule(null)}
        stats={stats}
        patientCount={patients.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. CONTENEDOR PRINCIPAL DERECHO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* CONTENIDO DEL MÓDULO SELECCIONADO DESDE EL PANEL IZQUIERDO */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* MÓDULO 1: PACIENTES */}
          {activeModule === 'pacientes' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
              {/* Encabezado: Título y Botones de Acción */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B017C] tracking-tight">
                    Pacientes
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    miércoles, 7 de octubre de 2026
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Botón: + Registrar nuevo paciente (Wizard) */}
                  <button
                    onClick={() => setShowNewPatientWizard(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#6F2BCC] text-[#6F2BCC] hover:bg-[#6F2BCC]/10 font-bold text-sm transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="text-base font-bold">+</span> Registrar nuevo paciente
                  </button>

                  {/* Botón: + Solicitar nuevo examen */}
                  <button
                    onClick={() => handleOpenExamModule(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#5b20a8] text-white font-bold text-sm transition-all shadow-md shadow-[#6F2BCC]/30 border border-[#01FADA]/30 cursor-pointer"
                  >
                    <span className="text-base font-bold">+</span> Solicitar nuevo examen
                  </button>
                </div>
              </div>

              {/* 4 Mini Dashboards */}
              <MiniDashboards stats={stats} />

              {/* Listado de Pacientes con Filtros y Tabla */}
              <PatientTable
                patients={patients}
                filters={filters}
                filterOptions={filterOptions}
                sedesList={activeClinic?.sedes || []}
                onFilterChange={handleFilterChange}
                onSelectPatient={(p) => setSelectedPatient(p)}
                onRequestExam={(p) => handleOpenExamModule(p)}
              />
            </div>
          )}

          {/* MÓDULO 2: NUEVO EXAMEN (qPCR WIZARD MODULE) */}
          {activeModule === 'nuevo-examen' && (
            <NewExamModule
              patient={examModulePatient}
              initialExamType={examModuleType}
              patients={patients.filter((p) => p.status !== 'fallecido')}
              onClose={handleCloseExamModule}
              onNavigateToTracking={handleNavigateToTracking}
              onRequest={async (patientId, examData) => {
                return await handleRequestExam(patientId, examData);
              }}
            />
          )}

          {/* MÓDULO 3: SEGUIMIENTO DE ÓRDENES */}
          {activeModule === 'seguimiento' && (
            <OrdersTrackingView
              patients={patients}
              onNavigateToNewExam={() => handleOpenExamModule(null, 'nuevo')}
              onSelectPatient={(p) => setSelectedPatient(p)}
            />
          )}

          {/* MÓDULO 4: RESULTADOS DIAGNÓSTICOS qPCR */}
          {activeModule === 'resultados' && (
            <ResultadosView
              patients={patients}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onNavigateToNewExam={(p, type) => handleOpenExamModule(p || null, type || 'nuevo')}
            />
          )}

          {/* MÓDULO 5: CATÁLOGO DE AGENTES & PANELES qPCR */}
          {activeModule === 'catalogo' && (
            <CatalogView />
          )}

          {/* MÓDULO 5B: CATÁLOGO CLÍNICAS (Portafolio Diagnóstico Clínico 2026) */}
          {activeModule === 'catalogo-clinicas' && (
            <ClinicalCatalogView />
          )}

          {/* MÓDULO 6: EVOLUCIÓN TEMPORAL & ANALÍTICAS LONGITUDINALES */}
          {activeModule === 'evolucion-temporal' && (
            <TemporalEvolutionView
              patients={patients}
              initialPatient={temporalEvolutionPatient}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onNavigateToNewExam={(p, type) => handleOpenExamModule(p || null, type || 'control')}
            />
          )}

          {/* MÓDULO 7: AYUDA Y SOPORTE (FIGMA) */}
          {activeModule === 'soporte' && (
            <SupportView />
          )}

          {/* MÓDULO 8: GESTIÓN INTEGRAL DE CLÍNICA, SEDES & EQUIPO */}
          {(activeModule === 'clinica-equipo' || activeModule === 'perfil-veterinaria' || activeModule === 'equipo-permisos') && (
            <UnifiedClinicManagementView
              onNotify={showToast}
            />
          )}
        </main>
      </div>

      {/* Modal Ficha Clínica Completa del Paciente */}
      {selectedPatient && (
        <PatientFichaModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdatePatient={handleUpdatePatient}
          onRequestExam={handleRequestExam}
          onNavigateToExamModule={(p, type) => handleOpenExamModule(p, type || 'nuevo')}
          onNavigateToTemporalEvolution={(p) => {
            setTemporalEvolutionPatient(p);
            setSelectedPatient(null);
            setActiveModule('evolucion-temporal');
          }}
        />
      )}

      {/* Modal Wizard de Registro de Paciente */}
      {showNewPatientWizard && (
        <NewPatientWizardModal
          onClose={() => setShowNewPatientWizard(false)}
          onCreated={handleCreatePatient}
        />
      )}

      {/* Modal Fallback Directo si se requiere abrir como modal */}
      {showGeneralExamModal && (
        <RequestExamModal
          isModal={true}
          patients={patients.filter((p) => p.status !== 'fallecido')}
          onClose={() => setShowGeneralExamModal(false)}
          onRequest={async (patientId, examData) => {
            return await handleRequestExam(patientId, examData);
          }}
        />
      )}
    </div>
  );
}
