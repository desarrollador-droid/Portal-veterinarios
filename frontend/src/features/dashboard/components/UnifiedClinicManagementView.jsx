import React, { useState, useEffect, useMemo } from 'react';
import { clinicApi, COLOMBIAN_CITIES, VETERINARY_SPECIALTIES } from '../services/clinicApi.js';
import { colombiaGeoApi } from '../services/colombiaGeoApi.js';

// Lista oficial de permisos clínicos disponibles
const AVAILABLE_PERMISSIONS = [
  { id: 'solicitar_examenes', label: 'Solicitar Exámenes qPCR', desc: 'Crear nuevas órdenes moleculares y solicitar recolección', icon: '🧬', category: 'Diagnóstico Molecular' },
  { id: 'solicitar_control', label: 'Solicitar Exámenes de Control', desc: 'Generar seguimiento sobre agentes positivos previos', icon: '🔄', category: 'Diagnóstico Molecular' },
  { id: 'ver_resultados', label: 'Ver Resultados qPCR', desc: 'Consultar informes, cargas virales y curvas de amplificación', icon: '📊', category: 'Resultados & Reportes' },
  { id: 'descargar_reportes', label: 'Descargar Informes PDF', desc: 'Descarga de informes oficiales validados por patólogo', icon: '📥', category: 'Resultados & Reportes' },
  { id: 'crear_pacientes', label: 'Registrar Nuevos Pacientes', desc: 'Ingresar mascotas y tutores a la base de datos de la clínica', icon: '🐾', category: 'Gestión de Pacientes' },
  { id: 'editar_pacientes', label: 'Editar Fichas de Pacientes', desc: 'Actualizar peso, constantes vitales y factores de riesgo', icon: '✏️', category: 'Gestión de Pacientes' },
  { id: 'registrar_consultas', label: 'Registrar Consultas Médicas', desc: 'Anotar evoluciones clínicas, diagnósticos presuntivos y recetas', icon: '🩺', category: 'Gestión de Pacientes' },
  { id: 'ver_trazabilidad', label: 'Rastrear Muestras & Delivery', desc: 'Ver estado en tiempo real de recolección y análisis', icon: '🚚', category: 'Logística' },
  { id: 'gestionar_equipo', label: 'Administrar Equipo Médico', desc: 'Crear usuarios, modificar sedes y asignar roles', icon: '👥', category: 'Administración' },
  { id: 'bloquear_usuarios', label: 'Bloquear y Desactivar Accesos', desc: 'Suspender cuentas por rotación, despido o auditoría', icon: '🔒', category: 'Administración' },
];

export default function UnifiedClinicManagementView({ onNotify }) {
  const [activeTab, setActiveTab] = useState('equipo'); // 'equipo' | 'sedes' | 'clinica'
  const [activeClinic, setActiveClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modales
  const [viewingVet, setViewingVet] = useState(null); // Modal "Ver" (Lectura limpia)
  const [editingVet, setEditingVet] = useState(null); // Modal "Editar" (Modificar datos, rol, sede, bloquear, cambiar password)
  const [showAddVetModal, setShowAddVetModal] = useState(false);
  const [showAddSedeModal, setShowAddSedeModal] = useState(false);
  const [editingSede, setEditingSede] = useState(null);
  const [isEditingClinicData, setIsEditingClinicData] = useState(false);

  // Estados de formularios
  const [editVetForm, setEditVetForm] = useState({
    nombre: '',
    cedula: '',
    tarjetaProfesional: '',
    especialidad: '',
    email: '',
    telefono: '',
    rol: 'veterinario_planta',
    tipoAsignacion: 'fija',
    sedeId: '',
    sedesRotativas: [],
    diasRotacion: '',
    estado: 'activo',
    bloqueadoPorAdmin: false,
    motivoBloqueo: '',
    newPassword: '',
  });

  const [newVetForm, setNewVetForm] = useState({
    nombre: '',
    cedula: '',
    tarjetaProfesional: '',
    especialidad: 'Medicina Interna',
    email: '',
    telefono: '',
    rol: 'veterinario_planta',
    tipoAsignacion: 'fija',
    sedeId: '',
    sedesRotativas: [],
    diasRotacion: '',
    password: '',
  });

  const [sedeForm, setSedeForm] = useState({
    nombreSede: '',
    departamento: 'Bogotá',
    ciudad: 'Bogotá D.C.',
    direccionFisica: '',
    detallesAdicionales: '',
    telefonoContacto: '',
    responsableSede: '',
    indicacionesRuta: 'Donde el repartidor recogerá las muestras',
    correoResultadosSede: '',
    esPrincipal: false,
    consecutivoNit: 1,
    codigoSedeNit: '#nit-1',
  });

  const [clinicFormData, setClinicFormData] = useState({
    nombreVeterinaria: '',
    nit: '',
    directorMedicoNombre: '',
    directorMedicoTelefono: '',
    correoFacturacion: '',
    correoResultados: '',
    recoleccionDepartamento: 'Bogotá',
    recoleccionCiudad: 'Bogotá D.C.',
    recoleccionDireccion: '',
  });

  useEffect(() => {
    loadClinicData();
  }, []);

  const loadClinicData = async () => {
    try {
      setLoading(true);
      const clinic = await clinicApi.getActiveClinic();
      setActiveClinic(clinic);
      if (clinic) {
        setClinicFormData({
          nombreVeterinaria: clinic.nombreVeterinaria || '',
          nit: clinic.nit || '',
          directorMedicoNombre: clinic.directorMedicoNombre || '',
          directorMedicoTelefono: clinic.directorMedicoTelefono || '',
          correoFacturacion: clinic.correoFacturacion || '',
          correoResultados: clinic.correoResultados || '',
          recoleccionDepartamento: clinic.recoleccionDepartamento || 'Bogotá',
          recoleccionCiudad: clinic.recoleccionCiudad || 'Bogotá D.C.',
          recoleccionDireccion: clinic.recoleccionDireccion || '',
        });
      }
    } catch (err) {
      console.error('Error cargando clínica:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = (msg) => {
    if (onNotify) onNotify(msg);
  };

  // Filtrado de veterinarios
  const veterinarians = activeClinic?.veterinariosAsociados || [];
  const filteredVets = useMemo(() => {
    return veterinarians.filter((vet) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        vet.nombre?.toLowerCase().includes(q) ||
        vet.tarjetaProfesional?.toLowerCase().includes(q) ||
        vet.email?.toLowerCase().includes(q) ||
        vet.especialidad?.toLowerCase().includes(q);

      const matchRole = roleFilter === 'all' || vet.rol === roleFilter;
      const isBlocked = vet.bloqueadoPorAdmin || vet.estado === 'bloqueado';
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'activo' && !isBlocked && vet.estado === 'activo') ||
        (statusFilter === 'bloqueado' && isBlocked) ||
        (statusFilter === 'inactivo' && vet.estado === 'inactivo' && !isBlocked);

      return matchSearch && matchRole && matchStatus;
    });
  }, [veterinarians, searchTerm, roleFilter, statusFilter]);

  // Abrir modal "Ver"
  const handleOpenViewModal = (vet) => {
    setViewingVet(vet);
  };

  // Abrir modal "Editar"
  const handleOpenEditModal = (vet) => {
    setEditingVet(vet);
    setEditVetForm({
      nombre: vet.nombre || '',
      cedula: vet.cedula || '',
      tarjetaProfesional: vet.tarjetaProfesional || '',
      especialidad: vet.especialidad || 'Medicina Interna',
      email: vet.email || '',
      telefono: vet.telefono || '',
      rol: vet.rol || 'veterinario_planta',
      tipoAsignacion: vet.tipoAsignacion || 'fija',
      sedeId: vet.sedeId || (activeClinic?.sedes?.[0]?.id || ''),
      sedesRotativas: Array.isArray(vet.sedesRotativas) ? [...vet.sedesRotativas] : [],
      diasRotacion: vet.diasRotacion || '',
      estado: vet.bloqueadoPorAdmin ? 'bloqueado' : (vet.estado || 'activo'),
      bloqueadoPorAdmin: Boolean(vet.bloqueadoPorAdmin),
      motivoBloqueo: vet.motivoBloqueo || '',
      newPassword: '',
    });
  };

  // Guardar cambios en el modal Editar
  const handleSaveVetEdit = async (e) => {
    e.preventDefault();
    if (!editingVet || !activeClinic) return;
    try {
      const isBlocked = editVetForm.estado === 'bloqueado';
      const selectedSede = activeClinic.sedes?.find((s) => s.id === editVetForm.sedeId);
      const rotativeNames = (activeClinic.sedes || [])
        .filter((s) => editVetForm.sedesRotativas.includes(s.id))
        .map((s) => `${s.nombreSede} (${s.codigoSedeNit || ''})`);

      const updatedVetPayload = {
        ...editingVet,
        nombre: editVetForm.nombre.trim(),
        cedula: editVetForm.cedula.trim(),
        tarjetaProfesional: editVetForm.tarjetaProfesional.trim(),
        especialidad: editVetForm.especialidad,
        email: editVetForm.email.trim(),
        telefono: editVetForm.telefono.trim(),
        rol: editVetForm.rol,
        tipoAsignacion: editVetForm.tipoAsignacion,
        sedeId: editVetForm.sedeId,
        sedeNombre: selectedSede ? selectedSede.nombreSede : 'Sede Principal',
        sedesRotativas: editVetForm.sedesRotativas,
        sedesRotativasNombres: rotativeNames,
        diasRotacion: editVetForm.diasRotacion,
        estado: isBlocked ? 'bloqueado' : editVetForm.estado,
        bloqueadoPorAdmin: isBlocked,
        motivoBloqueo: isBlocked ? (editVetForm.motivoBloqueo || 'Bloqueado por el Administrador') : '',
        fechaBloqueo: isBlocked ? (editingVet.fechaBloqueo || new Date().toISOString()) : null,
      };

      if (editVetForm.newPassword.trim()) {
        updatedVetPayload.password = editVetForm.newPassword.trim();
        updatedVetPayload.passwordUpdatedAt = new Date().toISOString();
      }

      const res = await clinicApi.updateVeterinarian(activeClinic.id, editingVet.id, updatedVetPayload);
      setActiveClinic(res.clinic);
      handleNotify(`Ficha y accesos de ${updatedVetPayload.nombre} actualizados con éxito.`);
      setEditingVet(null);
    } catch (err) {
      alert(err.message || 'Error al actualizar el profesional');
    }
  };

  // Guardar nuevo veterinario
  const handleCreateVet = async (e) => {
    e.preventDefault();
    if (!newVetForm.nombre.trim()) return alert('El nombre es obligatorio');
    if (!newVetForm.tarjetaProfesional.trim()) return alert('La tarjeta profesional COMVEZCOL es obligatoria');

    try {
      const selectedSede = activeClinic.sedes?.find((s) => s.id === newVetForm.sedeId) || activeClinic.sedes?.[0];
      const res = await clinicApi.addVeterinarian(activeClinic.id, {
        ...newVetForm,
        sedeNombre: selectedSede?.nombreSede || 'Sede Principal',
      });
      setActiveClinic(res.clinic);
      handleNotify(`Dr(a). ${newVetForm.nombre} registrado con éxito.`);
      setShowAddVetModal(false);
      setNewVetForm({
        nombre: '',
        cedula: '',
        tarjetaProfesional: '',
        especialidad: 'Medicina Interna',
        email: '',
        telefono: '',
        rol: 'veterinario_planta',
        tipoAsignacion: 'fija',
        sedeId: activeClinic?.sedes?.[0]?.id || '',
        sedesRotativas: [],
        diasRotacion: '',
        password: '',
      });
    } catch (err) {
      alert(err.message || 'Error registrando veterinario');
    }
  };

  // Guardar nueva sede
  const handleSaveSede = async (e) => {
    e.preventDefault();
    if (!sedeForm.nombreSede.trim()) return alert('El nombre de la sede es obligatorio');
    try {
      const nextConsecutive = (activeClinic.sedes?.length || 0) + 1;
      const res = await clinicApi.addSede(activeClinic.id, {
        ...sedeForm,
        consecutivoNit: nextConsecutive,
        codigoSedeNit: `#nit-${nextConsecutive}`,
      });
      setActiveClinic(res.clinic);
      handleNotify(`Sede ${sedeForm.nombreSede} (#nit-${nextConsecutive}) creada exitosamente.`);
      setShowAddSedeModal(false);
    } catch (err) {
      alert(err.message || 'Error guardando sede');
    }
  };

  // Guardar datos generales de la clínica
  const handleSaveClinicData = async (e) => {
    e.preventDefault();
    try {
      const res = await clinicApi.updateClinic(activeClinic.id, clinicFormData);
      setActiveClinic(res.clinic);
      setIsEditingClinicData(false);
      handleNotify('Información de la clínica actualizada correctamente.');
    } catch (err) {
      alert(err.message || 'Error actualizando clínica');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <span className="text-3xl animate-spin block mb-2">⏳</span>
        <p className="font-bold text-sm">Cargando información administrativa de la clínica...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. CABECERA INSTITUCIONAL */}
      <div className="bg-gradient-to-r from-[#2B017C] via-[#3d02ad] to-[#6F2BCC] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#01FADA]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#01FADA] border border-white/10 mb-2">
              <span>👑 Administración Principal Multi-sede</span>
              <span>·</span>
              <span>{activeClinic?.nombreVeterinaria || 'Clínica Veterinaria'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gestión Integral de Clínica, Sedes & Equipo
            </h1>
            <p className="text-purple-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
              Control centralizado de usuarios médicos, permisos de laboratorio, asignación de sucursales físicas (NIT único consecutivo) y datos corporativos.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-mono font-bold">
              NIT: {activeClinic?.nit || '901.458.789-3'}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#01FADA] text-[#2B017C] text-xs font-black shadow-xs">
              {activeClinic?.sedes?.length || 1} Sedes Activas
            </span>
          </div>
        </div>

        {/* SUBPESTAÑAS UNIFICADAS: EQUIPO | SEDES | DATOS CLÍNICA */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-white/15 overflow-x-auto">
          <button
            onClick={() => setActiveTab('equipo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'equipo'
                ? 'bg-white text-[#2B017C] shadow-md'
                : 'text-purple-100 hover:bg-white/10'
            }`}
          >
            <span>👥</span> Equipo Médico & Usuarios ({veterinarians.length})
          </button>
          <button
            onClick={() => setActiveTab('sedes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sedes'
                ? 'bg-white text-[#2B017C] shadow-md'
                : 'text-purple-100 hover:bg-white/10'
            }`}
          >
            <span>🏢</span> Sedes & Sucursales ({activeClinic?.sedes?.length || 1})
          </button>
          <button
            onClick={() => setActiveTab('clinica')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'clinica'
                ? 'bg-white text-[#2B017C] shadow-md'
                : 'text-purple-100 hover:bg-white/10'
            }`}
          >
            <span>🏥</span> Perfil & Datos de la Clínica
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PESTAÑA 1: EQUIPO MÉDICO & USUARIOS (DISEÑO LIMPIO: VER vs EDITAR)  */}
      {/* ==================================================================== */}
      {activeTab === 'equipo' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Barra de Filtros y Botón de Nuevo Usuario */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, tarjeta profesional o correo..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                />
              </div>

              {/* Filtro por estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
              >
                <option value="all">Estado: Todos</option>
                <option value="activo">Activos</option>
                <option value="bloqueado">Bloqueados</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddVetModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>+</span> Nuevo Profesional Médico
            </button>
          </div>

          {/* LISTADO LIMPIO DE VETERINARIOS (NO SATURADO) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVets.map((vet) => {
              const isBlocked = vet.bloqueadoPorAdmin || vet.estado === 'bloqueado';
              const isDirector = Boolean(vet.esDirector);

              return (
                <div
                  key={vet.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between gap-4 ${
                    isBlocked
                      ? 'border-rose-300 bg-rose-50/20'
                      : isDirector
                      ? 'border-purple-200 bg-purple-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar con iniciales */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base text-white shadow-xs shrink-0 ${
                        isBlocked
                          ? 'bg-rose-600'
                          : isDirector
                          ? 'bg-gradient-to-tr from-[#2B017C] to-[#6F2BCC]'
                          : 'bg-[#6F2BCC]'
                      }`}
                    >
                      {vet.nombre
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {vet.nombre}
                        </h4>
                        {isDirector ? (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#2B017C] to-[#6F2BCC] text-white text-[9px] font-black uppercase">
                            👑 Director
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6F2BCC] text-[10px] font-bold">
                            {vet.rolNombre || 'Veterinario'}
                          </span>
                        )}

                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black animate-pulse">
                            🔒 Bloqueado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            ● Activo
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        COMVEZCOL: <strong className="text-slate-800">{vet.tarjetaProfesional}</strong> · {vet.especialidad || 'Medicina General'}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#6F2BCC] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60 text-[10px]">
                          <span>🏢</span>
                          <span className="truncate max-w-[200px]">
                            {vet.tipoAsignacion === 'rotativa'
                              ? `Rotativo (${vet.sedesRotativas?.length || 2} sedes)`
                              : vet.tipoAsignacion === 'todas_las_sedes'
                              ? 'Todas las sedes'
                              : (vet.sedeNombre || 'Sede Principal')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones claras: "Ver" y "Editar" */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenViewModal(vet)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>👁️</span> Ver Ficha & Permisos
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(vet)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <span>✏️</span> Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PESTAÑA 2: SEDES & SUCURSALES (NIT CONSECUTIVO #nit-1, #nit-2...)   */}
      {/* ==================================================================== */}
      {activeTab === 'sedes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#2B017C]">
                Sedes Físicas & Puntos de Recolección de Muestras
              </h3>
              <p className="text-xs text-slate-500">
                Cada sede comparte el mismo NIT matriz de la clínica con un identificador consecutivo legal (#nit-1, #nit-2, etc.).
              </p>
            </div>
            <button
              onClick={() => setShowAddSedeModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>+</span> Agregar Sucursal / Sede
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeClinic?.sedes || []).map((s, idx) => (
              <div key={s.id || idx} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-purple-50 text-[#6F2BCC] flex items-center justify-center text-lg font-bold">
                      🏢
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {s.nombreSede}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-[#6F2BCC] bg-purple-100 px-2 py-0.5 rounded">
                        {s.codigoSedeNit || `#nit-${idx + 1}`}
                      </span>
                    </div>
                  </div>

                  {s.esPrincipal && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                      Principal
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="flex items-center gap-1.5">
                    <span>📍</span> <strong>{s.direccionFisica}</strong>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span>🌆</span> {s.ciudad}, {s.departamento}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span>📞</span> {s.telefonoContacto || 'No registrado'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span>👨‍⚕️</span> Resp: {s.responsableSede || 'Director Médico'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PESTAÑA 3: PERFIL & DATOS DE LA CLÍNICA                             */}
      {/* ==================================================================== */}
      {activeTab === 'clinica' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#2B017C]">
                Información Institucional & Facturación
              </h3>
              <p className="text-xs text-slate-500">
                Datos de razón social, NIT principal y correos de notificación de VetLab.
              </p>
            </div>
            <button
              onClick={() => setIsEditingClinicData(!isEditingClinicData)}
              className="px-4 py-2 rounded-xl bg-purple-50 text-[#6F2BCC] font-bold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
            >
              {isEditingClinicData ? '✕ Cancelar' : '✏️ Editar Datos'}
            </button>
          </div>

          <form onSubmit={handleSaveClinicData} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre o Razón Social</label>
              <input
                type="text"
                disabled={!isEditingClinicData}
                value={clinicFormData.nombreVeterinaria}
                onChange={(e) => setClinicFormData({ ...clinicFormData, nombreVeterinaria: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIT Principal</label>
              <input
                type="text"
                disabled
                value={clinicFormData.nit}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Director Médico Responsable</label>
              <input
                type="text"
                disabled={!isEditingClinicData}
                value={clinicFormData.directorMedicoNombre}
                onChange={(e) => setClinicFormData({ ...clinicFormData, directorMedicoNombre: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teléfono Dirección Médica</label>
              <input
                type="text"
                disabled={!isEditingClinicData}
                value={clinicFormData.directorMedicoTelefono}
                onChange={(e) => setClinicFormData({ ...clinicFormData, directorMedicoTelefono: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo de Facturación Electrónica</label>
              <input
                type="email"
                disabled={!isEditingClinicData}
                value={clinicFormData.correoFacturacion}
                onChange={(e) => setClinicFormData({ ...clinicFormData, correoFacturacion: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo para Envío de Resultados qPCR</label>
              <input
                type="email"
                disabled={!isEditingClinicData}
                value={clinicFormData.correoResultados}
                onChange={(e) => setClinicFormData({ ...clinicFormData, correoResultados: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold text-slate-800 disabled:bg-slate-50"
              />
            </div>

            {isEditingClinicData && (
              <div className="sm:col-span-2 pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Guardar Cambios Institucionales
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: "VER" FICHA DE VETERINARIO & PERMISOS (SOLO LECTURA LIMPIA) */}
      {/* ==================================================================== */}
      {viewingVet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-4 max-h-[90vh]">
            <div className="bg-[#2B017C] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <h3 className="font-extrabold text-base">Ficha del Profesional Médico</h3>
              </div>
              <button
                onClick={() => setViewingVet(null)}
                className="text-white/70 hover:text-white font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Encabezado del perfil */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div className="w-14 h-14 rounded-2xl bg-[#6F2BCC] text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {viewingVet.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{viewingVet.nombre}</h4>
                  <p className="text-xs text-slate-600 font-semibold">
                    COMVEZCOL: <strong className="text-[#2B017C]">{viewingVet.tarjetaProfesional}</strong> · {viewingVet.especialidad}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-[#6F2BCC] font-bold">
                      {viewingVet.rolNombre || 'Veterinario'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      viewingVet.bloqueadoPorAdmin ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {viewingVet.bloqueadoPorAdmin ? '🔒 Bloqueado' : '● Activo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sede y contacto */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Sede Asignada</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">
                    {viewingVet.sedeNombre || 'Sede Principal'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Correo Electrónico</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block truncate">
                    {viewingVet.email || 'No registrado'}
                  </span>
                </div>
              </div>

              {/* Permisos asignados */}
              <div className="space-y-2">
                <h5 className="text-xs font-black uppercase tracking-wider text-[#2B017C]">
                  Permisos de Acceso y Funcionalidades Activas
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const hasPerm = Boolean(viewingVet.permisos?.[perm.id]) && !viewingVet.bloqueadoPorAdmin;
                    return (
                      <div
                        key={perm.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          hasPerm ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{perm.icon}</span>
                          <span>{perm.label}</span>
                        </div>
                        <span className="font-bold text-xs">{hasPerm ? '✓' : '✗'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setViewingVet(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: "EDITAR" FICHA VETERINARIO (DATOS, ROL, CONTRASEÑA, BLOQUEAR)*/}
      {/* ==================================================================== */}
      {editingVet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-4 max-h-[92vh]">
            <div className="bg-[#2B017C] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="font-extrabold text-base">Editar Ficha & Accesos de Veterinario</h3>
              </div>
              <button
                onClick={() => setEditingVet(null)}
                className="text-white/70 hover:text-white font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVetEdit} className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={editVetForm.nombre}
                    onChange={(e) => setEditVetForm({ ...editVetForm, nombre: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarjeta Profesional COMVEZCOL *</label>
                  <input
                    type="text"
                    required
                    value={editVetForm.tarjetaProfesional}
                    onChange={(e) => setEditVetForm({ ...editVetForm, tarjetaProfesional: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Especialidad Clínica</label>
                  <select
                    value={editVetForm.especialidad}
                    onChange={(e) => setEditVetForm({ ...editVetForm, especialidad: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold bg-white cursor-pointer"
                  >
                    {VETERINARY_SPECIALTIES.map((sp) => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editVetForm.email}
                    onChange={(e) => setEditVetForm({ ...editVetForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editVetForm.telefono}
                    onChange={(e) => setEditVetForm({ ...editVetForm, telefono: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sede Base Asignada</label>
                  <select
                    value={editVetForm.sedeId}
                    onChange={(e) => setEditVetForm({ ...editVetForm, sedeId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold bg-white cursor-pointer"
                  >
                    {(activeClinic?.sedes || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.nombreSede} ({s.codigoSedeNit || ''})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECCIÓN DE SEGURIDAD & CONTRASEÑA */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <label className="block font-extrabold text-[#2B017C] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>🔑</span> Cambiar / Restablecer Contraseña del Usuario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editVetForm.newPassword}
                    onChange={(e) => setEditVetForm({ ...editVetForm, newPassword: e.target.value })}
                    placeholder="Dejar en blanco para no cambiarla..."
                    className="flex-1 px-3.5 py-2 border border-purple-200 rounded-xl bg-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const tempPass = 'Vet' + Math.floor(100000 + Math.random() * 900000) + '!';
                      setEditVetForm({ ...editVetForm, newPassword: tempPass });
                    }}
                    className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-[#6F2BCC] font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Generar clave temporal
                  </button>
                </div>
                <p className="text-[10px] text-purple-700/80">
                  Si escribe una contraseña aquí, el profesional deberá usarla en su próximo inicio de sesión.
                </p>
              </div>

              {/* SECCIÓN DE CONTROL DE ACCESO: DESACTIVAR O BLOQUEAR */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <label className="block font-extrabold text-rose-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>🔒</span> Estado de la Cuenta & Bloqueo de Acceso
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'activo', label: '● Activo' },
                    { id: 'inactivo', label: '○ Inactivo / Pausado' },
                    { id: 'bloqueado', label: '🔒 Bloqueado por Admin' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEditVetForm({ ...editVetForm, estado: st.id })}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        editVetForm.estado === st.id
                          ? st.id === 'bloqueado'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : st.id === 'inactivo'
                            ? 'bg-slate-700 text-white border-slate-800'
                            : 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {editVetForm.estado === 'bloqueado' && (
                  <div className="pt-2 space-y-1">
                    <label className="block text-[11px] font-bold text-rose-800">
                      Motivo del Bloqueo / Suspensión de Acceso *:
                    </label>
                    <input
                      type="text"
                      required
                      value={editVetForm.motivoBloqueo}
                      onChange={(e) => setEditVetForm({ ...editVetForm, motivoBloqueo: e.target.value })}
                      placeholder="Ej. Salida de la clínica, auditoría de historia clínica, sanción COMVEZCOL..."
                      className="w-full px-3.5 py-2 border border-rose-300 rounded-xl bg-white text-rose-950 font-medium"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingVet(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CREAR NUEVO VETERINARIO                                    */}
      {/* ==================================================================== */}
      {showAddVetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-4">
            <div className="bg-[#2B017C] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>➕</span> Registrar Nuevo Profesional Médico
              </h3>
              <button
                onClick={() => setShowAddVetModal(false)}
                className="text-white/70 hover:text-white font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVet} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dra. Valentina Ospina"
                  value={newVetForm.nombre}
                  onChange={(e) => setNewVetForm({ ...newVetForm, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarjeta Profesional *</label>
                  <input
                    type="text"
                    required
                    placeholder="COMVEZCOL..."
                    value={newVetForm.tarjetaProfesional}
                    onChange={(e) => setNewVetForm({ ...newVetForm, tarjetaProfesional: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Especialidad</label>
                  <select
                    value={newVetForm.especialidad}
                    onChange={(e) => setNewVetForm({ ...newVetForm, especialidad: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                  >
                    {VETERINARY_SPECIALTIES.map((sp) => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={newVetForm.email}
                    onChange={(e) => setNewVetForm({ ...newVetForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sede de Atención</label>
                  <select
                    value={newVetForm.sedeId}
                    onChange={(e) => setNewVetForm({ ...newVetForm, sedeId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                  >
                    {(activeClinic?.sedes || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.nombreSede}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVetModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold rounded-xl cursor-pointer"
                >
                  Registrar Médico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: CREAR NUEVA SEDE CON NIT CONSECUTIVO                       */}
      {/* ==================================================================== */}
      {showAddSedeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-4">
            <div className="bg-[#2B017C] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>🏢</span> Agregar Nueva Sede / Sucursal
              </h3>
              <button
                onClick={() => setShowAddSedeModal(false)}
                className="text-white/70 hover:text-white font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSede} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[#2B017C] font-semibold flex items-center gap-2">
                <span>ℹ️</span>
                <span>
                  Esta sede compartirá el NIT principal <strong>{activeClinic?.nit}</strong> con el consecutivo <strong>#nit-{(activeClinic?.sedes?.length || 0) + 1}</strong>.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre de la Sede / Sucursal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sede Poblado - 24 Horas"
                  value={sedeForm.nombreSede}
                  onChange={(e) => setSedeForm({ ...sedeForm, nombreSede: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={sedeForm.departamento}
                    onChange={(e) => setSedeForm({ ...sedeForm, departamento: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={sedeForm.ciudad}
                    onChange={(e) => setSedeForm({ ...sedeForm, ciudad: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección Física de Recolección *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle 10 # 43E - 20"
                  value={sedeForm.direccionFisica}
                  onChange={(e) => setSedeForm({ ...sedeForm, direccionFisica: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono Contacto</label>
                  <input
                    type="text"
                    value={sedeForm.telefonoContacto}
                    onChange={(e) => setSedeForm({ ...sedeForm, telefonoContacto: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable de Sede</label>
                  <input
                    type="text"
                    value={sedeForm.responsableSede}
                    onChange={(e) => setSedeForm({ ...sedeForm, responsableSede: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSedeModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold rounded-xl cursor-pointer"
                >
                  Guardar Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
