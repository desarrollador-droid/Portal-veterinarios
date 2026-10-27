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
import TemporalEvolutionView from '../components/TemporalEvolutionView.jsx';
import SupportView from '../components/SupportView.jsx';
import ClinicProfileView from '../components/ClinicProfileView.jsx';
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
  }, [filters]);

  useEffect(() => {
    loadInitialStats();
  }, []);

  const loadInitialStats = async () => {
    const [s, f, clinic] = await Promise.all([
      patientApi.getStats(),
      patientApi.getFilters(),
      clinicApi.getActiveClinic(),
    ]);
    setStats(s);
    setFilterOptions(f);
    setActiveClinic(clinic);
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
      case 'evolucion-temporal':
        return { section: 'Analíticas', title: 'Evolución Temporal & Analíticas Longitudinales', icon: '📈' };
      case 'perfil-veterinaria':
        return { section: 'Administración', title: 'Perfil de Veterinaria & Médicos', icon: '🏥' };
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
        {/* BARRA SUPERIOR ADMINISTRATIVA (Sin selector de módulos arriba) */}
        <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200/90 sticky top-0 z-30 px-6 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          {/* Breadcrumb del Módulo Activo */}
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{breadcrumb.icon}</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                {breadcrumb.section}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-extrabold tracking-tight text-xs sm:text-sm">
                {breadcrumb.title}
              </span>
            </div>
          </div>

          {/* Información de Clínica, Notificaciones y Perfil */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              onClick={() => setActiveModule('perfil-veterinaria')}
              className="hidden md:flex items-center gap-2 text-xs text-slate-500 hover:text-[#6F2BCC] cursor-pointer transition-colors"
              title="Ver perfil de la veterinaria activa"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">
                {activeClinic?.type === 'independiente'
                  ? (activeClinic.nombreMedico || 'Dr. Alejandro Morales')
                  : (activeClinic?.nombreVeterinaria || 'VetLab Sede Central')}
              </span>
              <span className="text-[10px] text-slate-400">
                · {activeClinic?.recoleccion?.ciudad || 'Bogotá D.C.'}
              </span>
            </div>

            {/* Alternador de Modo Claro / Oscuro */}
            <ThemeToggle variant="compact" />

            {/* Campana de Notificaciones con Badge 3 */}
            <div
              onClick={() => setActiveModule('resultados')}
              title="3 Notificaciones de laboratorio pendientes"
              className="relative cursor-pointer p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
              </svg>
              <span className="absolute top-0 right-0 bg-[#e11d48] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </div>

            {/* Avatar Usuario AM */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-[#2B017C] text-white font-black text-xs flex items-center justify-center cursor-pointer shadow-xs border border-[#01FADA]/40">
                AM
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-[#2B017C] block leading-tight">
                  Dr. Alejandro Morales
                </span>
                <span className="text-[10px] text-[#6F2BCC] font-bold block leading-tight">
                  Administrador
                </span>
              </div>
            </div>
          </div>
        </header>

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

                <div className="flex items-center gap-3">
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

          {/* MÓDULO 8: PERFIL DE VETERINARIA & MÉDICOS */}
          {activeModule === 'perfil-veterinaria' && (
            <ClinicProfileView
              onClinicUpdated={(c) => setActiveClinic(c)}
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
