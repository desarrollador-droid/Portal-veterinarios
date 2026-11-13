import React, { useState, useEffect } from 'react';
import { clinicApi, AVAILABLE_PERMISSIONS, ROLE_PRESETS } from '../services/clinicApi.js';
import { showAestheticConfirm, showAestheticAlert } from './AestheticModal.jsx';

export default function TeamPermissionsView({ onNotify }) {
  const [clinics, setClinics] = useState([]);
  const [activeClinic, setActiveClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [sedeFilter, setSedeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modales
  const [modalPermissionsVet, setModalPermissionsVet] = useState(null);
  const [modalSedesVet, setModalSedesVet] = useState(null);
  const [modalBlockVet, setModalBlockVet] = useState(null);
  const [modalAddVetOpen, setModalAddVetOpen] = useState(false);

  // Form State para Bloqueo
  const [motivoBloqueo, setMotivoBloqueo] = useState('');

  // Form State para Nuevo Veterinario
  const [newVetForm, setNewVetForm] = useState({
    nombre: '',
    especialidad: 'Medicina General',
    tarjetaProfesional: '',
    email: '',
    telefono: '',
    rol: 'veterinario_planta',
    tipoAsignacion: 'fija',
    sedeId: '',
    sedesRotativas: [],
    diasRotacion: '',
    permisos: { ...ROLE_PRESETS.veterinario_planta.permisos },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allClinics, active] = await Promise.all([
        clinicApi.getAll(),
        clinicApi.getActiveClinic(),
      ]);
      setClinics(allClinics);
      setActiveClinic(active || allClinics[0]);

      if (active?.sedes?.length > 0 && !newVetForm.sedeId) {
        setNewVetForm((prev) => ({
          ...prev,
          sedeId: active.sedes[0].id,
        }));
      }
    } catch (err) {
      console.error('Error cargando equipo y clínicas:', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    if (onNotify) onNotify(msg);
  };

  const handleClinicChange = async (clinicId) => {
    try {
      const updated = await clinicApi.setActiveClinic(clinicId);
      setActiveClinic(updated);
      notify(`Administrando clínica: ${updated.nombreVeterinaria || updated.nombreMedico}`);
    } catch (err) {
      showAestheticAlert({ title: 'Error al Cambiar Clínica', message: err.message || 'Error al cambiar clínica', type: 'danger' });
    }
  };

  // --- ACCIONES DE PERMISOS ---
  const handleOpenPermissionsModal = (vet) => {
    setModalPermissionsVet({
      ...vet,
      permisos: { ...(vet.permisos || ROLE_PRESETS[vet.rol]?.permisos || {}) },
    });
  };

  const handleApplyRolePreset = (roleKey) => {
    const preset = ROLE_PRESETS[roleKey];
    if (!preset) return;
    setModalPermissionsVet((prev) => ({
      ...prev,
      rol: roleKey,
      permisos: { ...preset.permisos },
    }));
  };

  const handleTogglePermission = (permId) => {
    setModalPermissionsVet((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [permId]: !prev.permisos[permId],
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!modalPermissionsVet || !activeClinic) return;
    try {
      const res = await clinicApi.updateVeterinarianPermissions(
        activeClinic.id,
        modalPermissionsVet.id,
        {
          permisos: modalPermissionsVet.permisos,
          rol: modalPermissionsVet.rol,
        }
      );
      setActiveClinic(res.clinic);
      notify(`Permisos actualizados para ${modalPermissionsVet.nombre}`);
      setModalPermissionsVet(null);
    } catch (err) {
      showAestheticAlert({ title: 'Error al Guardar Permisos', message: err.message || 'Error al guardar permisos', type: 'danger' });
    }
  };

  // --- ACCIONES DE SEDES & ROTACIONES ---
  const handleOpenSedesModal = (vet) => {
    setModalSedesVet({
      ...vet,
      sedesRotativas: Array.isArray(vet.sedesRotativas) ? [...vet.sedesRotativas] : [],
      diasRotacion: vet.diasRotacion || '',
      tipoAsignacion: vet.tipoAsignacion || 'fija',
      sedeId: vet.sedeId || (activeClinic?.sedes?.[0]?.id || ''),
    });
  };

  const handleToggleRotativeSede = (sedeId) => {
    if (!modalSedesVet) return;
    const exists = modalSedesVet.sedesRotativas.includes(sedeId);
    let nextList;
    if (exists) {
      nextList = modalSedesVet.sedesRotativas.filter((id) => id !== sedeId);
    } else {
      nextList = [...modalSedesVet.sedesRotativas, sedeId];
    }
    setModalSedesVet((prev) => ({
      ...prev,
      sedesRotativas: nextList,
    }));
  };

  const handleSaveSedes = async () => {
    if (!modalSedesVet || !activeClinic) return;
    try {
      const primarySedeObj = (activeClinic.sedes || []).find((s) => s.id === modalSedesVet.sedeId);
      const rotativeNames = (activeClinic.sedes || [])
        .filter((s) => modalSedesVet.sedesRotativas.includes(s.id))
        .map((s) => `${s.nombreSede} (${s.codigoSedeNit || ''})`);

      const res = await clinicApi.assignVeterinarianSedes(
        activeClinic.id,
        modalSedesVet.id,
        {
          tipoAsignacion: modalSedesVet.tipoAsignacion,
          sedeId: modalSedesVet.sedeId,
          sedeNombre: primarySedeObj ? `${primarySedeObj.nombreSede} (${primarySedeObj.codigoSedeNit || ''})` : 'Sede Principal',
          sedesRotativas: modalSedesVet.sedesRotativas,
          sedesRotativasNombres: rotativeNames,
          diasRotacion: modalSedesVet.diasRotacion,
        }
      );
      setActiveClinic(res.clinic);
      notify(`Asignación de sedes actualizada para ${modalSedesVet.nombre}`);
      setModalSedesVet(null);
    } catch (err) {
      showAestheticAlert({ title: 'Error Asignando Sedes', message: err.message || 'Error asignando sedes', type: 'danger' });
    }
  };

  // --- ACCIONES DE BLOQUEO / DESBLOQUEO ---
  const handleOpenBlockModal = (vet) => {
    setModalBlockVet(vet);
    setMotivoBloqueo('Suspensión temporal de acceso por auditoría administrativa');
  };

  const handleConfirmBlock = async () => {
    if (!modalBlockVet || !activeClinic) return;
    try {
      const res = await clinicApi.blockVeterinarian(activeClinic.id, modalBlockVet.id, {
        motivoBloqueo: motivoBloqueo.trim(),
        bloqueadoPor: 'Dr. Alejandro Morales Restrepo (Admin Principal)',
      });
      setActiveClinic(res.clinic);
      notify(`Acceso bloqueado para ${modalBlockVet.nombre}`);
      setModalBlockVet(null);
      setMotivoBloqueo('');
    } catch (err) {
      showAestheticAlert({ title: 'Error al Bloquear Acceso', message: err.message || 'Error al bloquear acceso', type: 'danger' });
    }
  };

  const handleUnblock = async (vet) => {
    if (!activeClinic) return;
    const confirmed = await showAestheticConfirm({
      title: 'Restablecer Acceso',
      message: `¿Desea restablecer el acceso a ${vet.nombre}? Se restaurarán sus permisos clínicos activos.`,
      type: 'info',
      confirmText: 'Sí, restablecer acceso',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;
    try {
      const res = await clinicApi.unblockVeterinarian(activeClinic.id, vet.id);
      setActiveClinic(res.clinic);
      notify(`Acceso restablecido para ${vet.nombre}`);
    } catch (err) {
      showAestheticAlert({ title: 'Error', message: err.message || 'Error al desbloquear acceso', type: 'danger' });
    }
  };

  const handleToggleStatus = async (vet) => {
    if (!activeClinic) return;
    try {
      const res = await clinicApi.toggleVeterinarianStatus(activeClinic.id, vet.id);
      setActiveClinic(res.clinic);
      notify(`Usuario de ${vet.nombre} ${res.vet.estado === 'activo' ? 'activado' : 'desactivado'}`);
    } catch (err) {
      showAestheticAlert({ title: 'Error Alternando Estado', message: err.message || 'Error alternando estado', type: 'danger' });
    }
  };

  // --- CREAR NUEVO VETERINARIO ---
  const handleCreateVeterinarian = async (e) => {
    e.preventDefault();
    if (!newVetForm.nombre.trim()) {
      showAestheticAlert({ title: 'Campo Requerido', message: 'El nombre completo del veterinario es obligatorio', type: 'warning' });
      return;
    }
    if (!newVetForm.tarjetaProfesional.trim()) {
      showAestheticAlert({ title: 'Campo Requerido', message: 'La tarjeta profesional COMVEZCOL es obligatoria', type: 'warning' });
      return;
    }

    try {
      const primarySedeObj = (activeClinic.sedes || []).find((s) => s.id === newVetForm.sedeId);
      const rotativeNames = (activeClinic.sedes || [])
        .filter((s) => newVetForm.sedesRotativas.includes(s.id))
        .map((s) => `${s.nombreSede} (${s.codigoSedeNit || ''})`);

      const payload = {
        nombre: newVetForm.nombre.trim(),
        especialidad: newVetForm.especialidad.trim(),
        tarjetaProfesional: newVetForm.tarjetaProfesional.trim().toUpperCase(),
        email: newVetForm.email.trim(),
        telefono: newVetForm.telefono.trim(),
        rol: newVetForm.rol,
        rolNombre: ROLE_PRESETS[newVetForm.rol]?.nombre || 'Veterinario',
        tipoAsignacion: newVetForm.tipoAsignacion,
        sedeId: newVetForm.sedeId,
        sedeNombre: primarySedeObj ? `${primarySedeObj.nombreSede} (${primarySedeObj.codigoSedeNit || ''})` : 'Sede Principal',
        sedesRotativas: newVetForm.sedesRotativas,
        sedesRotativasNombres: rotativeNames,
        diasRotacion: newVetForm.diasRotacion.trim(),
        permisos: newVetForm.permisos,
        esDirector: false,
        estado: 'activo',
        bloqueadoPorAdmin: false,
      };

      const updatedClinic = await clinicApi.addVeterinarian(activeClinic.id, payload);
      setActiveClinic(updatedClinic);
      notify(`Dr(a). ${payload.nombre} vinculado exitosamente con rol ${payload.rolNombre}`);
      setModalAddVetOpen(false);
      setNewVetForm({
        nombre: '',
        especialidad: 'Medicina General',
        tarjetaProfesional: '',
        email: '',
        telefono: '',
        rol: 'veterinario_planta',
        tipoAsignacion: 'fija',
        sedeId: activeClinic?.sedes?.[0]?.id || '',
        sedesRotativas: [],
        diasRotacion: '',
        permisos: { ...ROLE_PRESETS.veterinario_planta.permisos },
      });
    } catch (err) {
      showAestheticAlert({ title: 'Error al Registrar Veterinario', message: err.message || 'Error registrando veterinario', type: 'danger' });
    }
  };

  // --- FILTRADO DE VETERINARIOS ---
  const rawVets = activeClinic?.veterinariosAsociados || [];
  const filteredVets = rawVets.filter((v) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        v.nombre.toLowerCase().includes(q) ||
        v.especialidad?.toLowerCase().includes(q) ||
        v.tarjetaProfesional?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.sedeNombre?.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Sede
    if (sedeFilter !== 'all') {
      if (sedeFilter === 'rotativos') {
        if (v.tipoAsignacion !== 'rotativa') return false;
      } else {
        const matchesPrimary = v.sedeId === sedeFilter;
        const matchesRotating = Array.isArray(v.sedesRotativas) && v.sedesRotativas.includes(sedeFilter);
        const matchesGlobal = v.tipoAsignacion === 'todas_las_sedes';
        if (!matchesPrimary && !matchesRotating && !matchesGlobal) return false;
      }
    }
    // Status
    if (statusFilter !== 'all') {
      if (statusFilter === 'bloqueado' && !v.bloqueadoPorAdmin && v.estado !== 'bloqueado') return false;
      if (statusFilter === 'activo' && (v.bloqueadoPorAdmin || v.estado !== 'activo')) return false;
      if (statusFilter === 'inactivo' && (v.bloqueadoPorAdmin || v.estado !== 'inactivo')) return false;
    }
    // Role
    if (roleFilter !== 'all') {
      if (v.rol !== roleFilter) return false;
    }
    return true;
  });

  // Métricas
  const totalVets = rawVets.length;
  const activeVets = rawVets.filter((v) => v.estado === 'activo' && !v.bloqueadoPorAdmin).length;
  const rotativeVets = rawVets.filter((v) => v.tipoAsignacion === 'rotativa' || v.tipoAsignacion === 'todas_las_sedes').length;
  const blockedVets = rawVets.filter((v) => v.bloqueadoPorAdmin || v.estado === 'bloqueado').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <span className="animate-spin text-2xl mr-3">🌀</span> Cargando módulo de equipo y permisos...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. ENCABEZADO Y PERFIL DE ADMINISTRADOR */}
      <div className="bg-gradient-to-r from-[#2B017C] via-[#3a039b] to-[#6F2BCC] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-center font-black text-9xl">
          👑
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#01FADA]/20 text-[#01FADA] text-xs font-bold uppercase tracking-wider mb-2 border border-[#01FADA]/30">
              <span>👑</span> Panel del Administrador Principal · Multi-sede IPS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gestión de Equipo & Permisos Médicos
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Supervisión de directores, especialistas y veterinarios de planta. Asigna ubicaciones fijas o rotativas entre todas las sedes, gestiona matrices granulares de permisos y suspende accesos al instante.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Clínica Activa */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
              <label className="block text-[10px] text-purple-200 font-semibold uppercase tracking-wider mb-1">
                Clínica Administrada:
              </label>
              <select
                value={activeClinic?.id || ''}
                onChange={(e) => handleClinicChange(e.target.value)}
                className="bg-white text-slate-900 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#01FADA] cursor-pointer shadow-xs"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombreVeterinaria || c.nombreMedico} ({c.type === 'veterinaria' ? `NIT ${c.nit}` : 'Independiente'})
                  </option>
                ))}
              </select>
            </div>

            {/* Botón: + Vincular Veterinario */}
            <button
              onClick={() => setModalAddVetOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#01FADA] hover:bg-[#00d6ba] text-[#2B017C] font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <span className="text-base font-bold">+</span> Vincular Veterinario
            </button>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equipo */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Equipo</span>
            <span className="p-2 rounded-lg bg-[#6F2BCC]/10 text-[#6F2BCC] text-sm">👥</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#2B017C] dark:text-white">{totalVets}</span>
            <span className="text-xs text-slate-400 font-medium">veterinarios</span>
          </div>
        </div>

        {/* Activos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accesos Activos</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm">✓</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{activeVets}</span>
            <span className="text-xs text-slate-400 font-medium">habilitados</span>
          </div>
        </div>

        {/* Rotativos Multi-sede */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación Rotativa</span>
            <span className="p-2 rounded-lg bg-[#01FADA]/20 text-[#008f7d] text-sm">🔄</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#6F2BCC] dark:text-[#01FADA]">{rotativeVets}</span>
            <span className="text-xs text-slate-400 font-medium">inter-sedes</span>
          </div>
        </div>

        {/* Bloqueados por Admin */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bloqueados / Susp.</span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-600 text-sm">🔒</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">{blockedVets}</span>
            <span className="text-xs text-slate-400 font-medium">con restricción</span>
          </div>
        </div>
      </div>

      {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Búsqueda */}
          <div className="relative md:col-span-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, especialidad, TP (COMVEZCOL), correo o sede..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por Sede / Rotación */}
          <div>
            <select
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
            >
              <option value="all">📍 Todas las Sedes (Consolidado)</option>
              {(activeClinic?.sedes || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombreSede} ({s.codigoSedeNit || ''})
                </option>
              ))}
              <option value="rotativos">🔄 Solo con Ubicación Rotativa</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
            >
              <option value="all">🔒 Todos los Estados de Acceso</option>
              <option value="activo">✓ Habilitados / Activos</option>
              <option value="bloqueado">🔒 Bloqueados por Admin</option>
              <option value="inactivo">⚪ Inactivos / Deshabilitados</option>
            </select>
          </div>
        </div>

        {/* Resumen de resultados encontrados */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">
          <span>
            Mostrando <b>{filteredVets.length}</b> de <b>{totalVets}</b> veterinarios registrados en <b>{activeClinic?.nombreVeterinaria || activeClinic?.nombreMedico}</b>
          </span>
          {(search || sedeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSedeFilter('all');
                setStatusFilter('all');
              }}
              className="text-[#6F2BCC] hover:underline font-bold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* 4. LISTADO DE VETERINARIOS (TARJETAS ADMINISTRATIVAS) */}
      <div className="space-y-4">
        {filteredVets.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-slate-600 dark:text-slate-300 font-bold text-base">
              No se encontraron veterinarios con los criterios seleccionados
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Prueba modificando la búsqueda por nombre o quitando los filtros de sede y estado.
            </p>
          </div>
        ) : (
          filteredVets.map((vet) => {
            const isBlocked = vet.bloqueadoPorAdmin || vet.estado === 'bloqueado';
            const isDirector = Boolean(vet.esDirector);
            const isRotative = vet.tipoAsignacion === 'rotativa';
            const isGlobal = vet.tipoAsignacion === 'todas_las_sedes';

            return (
              <div
                key={vet.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border transition-all shadow-xs ${
                  isBlocked
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : isDirector
                    ? 'border-[#6F2BCC]/40 bg-purple-50/20 dark:bg-purple-950/10'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Info Principal */}
                  <div className="flex items-start gap-4">
                    {/* Avatar con indicador */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md ${
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
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                          isBlocked
                            ? 'bg-rose-600'
                            : vet.estado === 'activo'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                        title={isBlocked ? 'Bloqueado por Admin' : vet.estado}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {vet.nombre}
                        </h2>

                        {/* Badge de Rol */}
                        {isDirector ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#2B017C] to-[#6F2BCC] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            👑 Director Médico · Admin Principal
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6F2BCC] dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-bold">
                            {vet.rolNombre || ROLE_PRESETS[vet.rol]?.nombre || 'Veterinario'}
                          </span>
                        )}

                        {/* Sello de Estado */}
                        {isBlocked ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 animate-pulse">
                            🔒 ACCESO BLOQUEADO POR ADMIN
                          </span>
                        ) : vet.estado === 'activo' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold">
                            ✓ Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-bold">
                            ⚪ Inactivo
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {vet.especialidad || 'Medicina General'} ·{' '}
                        <span className="font-mono text-[#6F2BCC] dark:text-[#01FADA]">
                          TP: {vet.tarjetaProfesional}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        {vet.email && (
                          <span className="flex items-center gap-1">
                            ✉️ {vet.email}
                          </span>
                        )}
                        {vet.telefono && (
                          <span className="flex items-center gap-1">
                            📞 {vet.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Asignación de Sedes */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-200/80 dark:border-slate-600 max-w-sm w-full lg:w-80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                        Ubicación & Sedes
                      </span>
                      <button
                        onClick={() => handleOpenSedesModal(vet)}
                        className="text-[#6F2BCC] dark:text-[#01FADA] font-bold text-[11px] hover:underline cursor-pointer"
                      >
                        ⚙️ Modificar
                      </button>
                    </div>

                    {isGlobal ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#01FADA]/20 text-[#007a6a] dark:text-[#01FADA] text-[11px] font-bold">
                          🌐 Cobertura Multi-sede Global
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Acceso irrestricto a todas las sedes de la clínica.
                        </p>
                      </div>
                    ) : isRotative ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#6F2BCC] dark:text-purple-300">
                          <span>🔄 Ubicación Rotativa ({vet.sedesRotativas?.length || 0} sedes):</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(vet.sedesRotativasNombres && vet.sedesRotativasNombres.length > 0
                            ? vet.sedesRotativasNombres
                            : (vet.sedesRotativas || []).map((sId) => {
                                const found = (activeClinic?.sedes || []).find((s) => s.id === sId);
                                return found ? `${found.nombreSede} (${found.codigoSedeNit || ''})` : sId;
                              })
                          ).map((nombre, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-purple-100 text-[#6F2BCC] dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-semibold"
                            >
                              📍 {nombre}
                            </span>
                          ))}
                        </div>
                        {vet.diasRotacion && (
                          <p className="text-[10px] text-slate-500 font-medium italic">
                            📅 {vet.diasRotacion}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 text-[11px] font-bold">
                          📍 Sede Fija: {vet.sedeNombre || 'Sede Principal'}
                        </span>
                        {vet.diasRotacion && (
                          <p className="text-[10px] text-slate-500">
                            📅 {vet.diasRotacion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner de Bloqueo si está suspendido */}
                {isBlocked && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-bold">
                        <span>⚠️</span>
                        <span>Motivo de Suspensión Registrado por el Administrador:</span>
                      </div>
                      <p className="font-medium italic pl-5 text-[11px]">
                        "{vet.motivoBloqueo || 'Acceso restringido temporalmente por el Administrador Principal'}"
                      </p>
                      {vet.fechaBloqueo && (
                        <p className="text-[10px] text-rose-700 dark:text-rose-300 pl-5">
                          Bloqueado el {new Date(vet.fechaBloqueo).toLocaleString('es-CO')} por {vet.bloqueadoPor || 'Admin Principal'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnblock(vet)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition-all cursor-pointer"
                    >
                      🔓 Restablecer / Desbloquear Acceso
                    </button>
                  </div>
                )}

                {/* Matriz de Permisos & Botones de Acción */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Chips de Permisos */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Permisos Clínicos Activos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const hasPerm = Boolean(vet.permisos?.[perm.id]) && !isBlocked;
                        return (
                          <span
                            key={perm.id}
                            title={perm.desc}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              hasPerm
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            {hasPerm ? '✓' : '✗'} {perm.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Botones de Control de Administrador */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Botón: Gestionar Permisos */}
                    <button
                      onClick={() => handleOpenPermissionsModal(vet)}
                      className="px-3 py-1.5 rounded-lg border border-[#6F2BCC] text-[#6F2BCC] dark:text-purple-300 dark:border-purple-400 font-bold text-xs hover:bg-[#6F2BCC]/10 transition-colors cursor-pointer"
                    >
                      🛡️ Permisos
                    </button>

                    {/* Botón: Bloquear / Desbloquear */}
                    {!isDirector && (
                      <>
                        {isBlocked ? (
                          <button
                            onClick={() => handleUnblock(vet)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            🔓 Desbloquear
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenBlockModal(vet)}
                            className="px-3 py-1.5 rounded-lg border border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs transition-colors cursor-pointer"
                          >
                            🔒 Bloquear Acceso
                          </button>
                        )}

                        {/* Alternador Activo / Inactivo */}
                        <button
                          onClick={() => handleToggleStatus(vet)}
                          className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                          title="Activar o desactivar usuario"
                        >
                          {vet.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </>
                    )}

                    {isDirector && (
                      <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                        Sesión Actual
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: GESTIÓN GRANULAR DE PERMISOS */}
      {/* ========================================================================= */}
      {modalPermissionsVet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Cabecera */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6F2BCC] bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">
                  Matriz de Permisos Médicos
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Permisos de {modalPermissionsVet.nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  TP: {modalPermissionsVet.tarjetaProfesional} · Especialidad: {modalPermissionsVet.especialidad}
                </p>
              </div>
              <button
                onClick={() => setModalPermissionsVet(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Plantillas de Rol Rápido */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Plantillas de Rol Predefinidas:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(ROLE_PRESETS).map(([roleKey, preset]) => {
                  const isSelected = modalPermissionsVet.rol === roleKey;
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleApplyRolePreset(roleKey)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#6F2BCC] bg-[#6F2BCC]/10 text-[#6F2BCC] dark:text-purple-300 font-black shadow-xs ring-2 ring-[#6F2BCC]/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{preset.nombre}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.descripcion}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matriz de 8 Permisos Individuales */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Permisos Específicos por Módulo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = Boolean(modalPermissionsVet.permisos?.[perm.id]);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-750'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // controlado por div
                        className="mt-0.5 accent-[#6F2BCC] w-4 h-4 cursor-pointer"
                      />
                      <div className="space-y-0.5 select-none">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{perm.label}</span>
                          {isChecked && <span className="text-[10px] text-emerald-600 font-bold">Activo</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {perm.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setModalPermissionsVet(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#5b20a8] text-white font-black text-xs shadow-md shadow-[#6F2BCC]/30 cursor-pointer"
              >
                Guardar y Aplicar Permisos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ASIGNACIÓN DE SEDES & UBICACIONES ROTATIVAS */}
      {/* ========================================================================= */}
      {modalSedesVet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#008f7d] bg-[#01FADA]/20 px-2 py-0.5 rounded">
                  Asignación Multi-sede
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Ubicación & Sedes de {modalSedesVet.nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define si este profesional atiende en una sede fija, rota entre sucursales o tiene cobertura multi-sede general.
                </p>
              </div>
              <button
                onClick={() => setModalSedesVet(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modalidad de Asignación */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Modalidad de Asignación:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'fija', title: '📍 Sede Fija', desc: 'Atención exclusiva en una sucursal' },
                  { id: 'rotativa', title: '🔄 Rotativo Inter-sedes', desc: 'Rota entre múltiples sedes asignadas' },
                  { id: 'todas_las_sedes', title: '🌐 Cobertura Total', desc: 'Acceso y presencia en todas las sedes' },
                ].map((mode) => {
                  const isSelected = modalSedesVet.tipoAsignacion === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setModalSedesVet((prev) => ({ ...prev, tipoAsignacion: mode.id }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#6F2BCC] bg-[#6F2BCC]/10 text-[#6F2BCC] dark:text-purple-300 font-black ring-2 ring-[#6F2BCC]/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sede Principal / Fija */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Sede Base / Principal:
              </label>
              <select
                value={modalSedesVet.sedeId}
                onChange={(e) => setModalSedesVet((prev) => ({ ...prev, sedeId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
              >
                {(activeClinic?.sedes || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombreSede} ({s.codigoSedeNit || ''}) - {s.ciudad}
                  </option>
                ))}
              </select>
            </div>

            {/* Sedes de Rotación (Si es rotativo) */}
            {modalSedesVet.tipoAsignacion === 'rotativa' && (
              <div className="space-y-2 p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-bold text-[#6F2BCC] dark:text-purple-300 block">
                  Selecciona las sedes en las que este veterinario prestará servicio:
                </label>
                <div className="space-y-1.5">
                  {(activeClinic?.sedes || []).map((s) => {
                    const isChecked = modalSedesVet.sedesRotativas.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRotativeSede(s.id)}
                          className="accent-[#6F2BCC] w-4 h-4 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{s.nombreSede}</span>{' '}
                          <span className="text-[#6F2BCC] font-mono font-bold">({s.codigoSedeNit || ''})</span>
                          <span className="text-slate-400 text-[11px] block">{s.direccionFisica} · {s.ciudad}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Días / Horario de Rotación */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Días / Horario de Rotación o Turnos:
              </label>
              <input
                type="text"
                value={modalSedesVet.diasRotacion}
                onChange={(e) => setModalSedesVet((prev) => ({ ...prev, diasRotacion: e.target.value }))}
                placeholder="Ej: Lun/Mié: Sede Norte · Mar/Jue: Sede Principal · Vie: Chía"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
              />
              <p className="text-[10px] text-slate-400">
                Esta información será visible para el equipo clínico al agendar muestras y revisar órdenes.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setModalSedesVet(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSedes}
                className="px-5 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#5b20a8] text-white font-black text-xs shadow-md shadow-[#6F2BCC]/30 cursor-pointer"
              >
                Guardar Asignación de Sedes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BLOQUEAR ACCESO INMEDIATO */}
      {/* ========================================================================= */}
      {modalBlockVet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-300 dark:border-rose-900 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-2xl">🔒</span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Bloquear Acceso Inmediato
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Acción de control administrativo para {modalBlockVet.nombre}
                </p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
              ⚠️ <b>Atención:</b> Al bloquear el acceso, este veterinario quedará <b>inhabilitado</b> para:
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                <li>Iniciar sesión o consultar expedientes de pacientes en todas las sedes.</li>
                <li>Generar o firmar nuevas solicitudes de exámenes qPCR.</li>
                <li>Descargar informes diagnósticos o visualizar curvas de laboratorio.</li>
              </ul>
              Esta acción puede revertirse en cualquier momento desde este mismo panel.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Motivo del Bloqueo / Suspensión (Obligatorio para auditoría):
              </label>
              <textarea
                rows={3}
                value={motivoBloqueo}
                onChange={(e) => setMotivoBloqueo(e.target.value)}
                placeholder="Describe el motivo de la suspensión (ej: Actualización de póliza COMVEZCOL, auditoría médica, etc.)..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalBlockVet(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                disabled={!motivoBloqueo.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Confirmar y Bloquear Acceso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VINCULAR NUEVO VETERINARIO ASOCIADO */}
      {/* ========================================================================= */}
      {modalAddVetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6F2BCC] bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">
                  Nuevo Integrante del Equipo
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Vincular Médico Veterinario a la Clínica
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registra al profesional con su tarjeta profesional COMVEZCOL, sede o rotación, y asigna sus permisos clínicos iniciales.
                </p>
              </div>
              <button
                onClick={() => setModalAddVetOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVeterinarian} className="space-y-4">
              {/* Datos Personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nombre Completo Dr(a).: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVetForm.nombre}
                    onChange={(e) => setNewVetForm((p) => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: Dra. Natalia Restrepo Villa"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tarjeta Profesional COMVEZCOL: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVetForm.tarjetaProfesional}
                    onChange={(e) => setNewVetForm((p) => ({ ...p, tarjetaProfesional: e.target.value.toUpperCase() }))}
                    placeholder="Ej: COMVEZCOL-35890"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Especialidad Médica:
                  </label>
                  <input
                    type="text"
                    value={newVetForm.especialidad}
                    onChange={(e) => setNewVetForm((p) => ({ ...p, especialidad: e.target.value }))}
                    placeholder="Ej: Medicina Felina / Oncología"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Correo Institucional:
                  </label>
                  <input
                    type="email"
                    value={newVetForm.email}
                    onChange={(e) => setNewVetForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="dr@animalhealth.com.co"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Teléfono de Contacto:
                  </label>
                  <input
                    type="tel"
                    value={newVetForm.telefono}
                    onChange={(e) => setNewVetForm((p) => ({ ...p, telefono: e.target.value }))}
                    placeholder="3101234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                  />
                </div>
              </div>

              {/* Rol y Modalidad de Sede */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Rol Inicial en la Clínica:
                  </label>
                  <select
                    value={newVetForm.rol}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      const preset = ROLE_PRESETS[newRole];
                      setNewVetForm((p) => ({
                        ...p,
                        rol: newRole,
                        tipoAsignacion: newRole === 'veterinario_rotativo' ? 'rotativa' : p.tipoAsignacion,
                        permisos: preset ? { ...preset.permisos } : p.permisos,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                  >
                    {Object.entries(ROLE_PRESETS).map(([k, p]) => (
                      <option key={k} value={k}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Modalidad de Asignación de Sedes:
                  </label>
                  <select
                    value={newVetForm.tipoAsignacion}
                    onChange={(e) => setNewVetForm((p) => ({ ...p, tipoAsignacion: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                  >
                    <option value="fija">📍 Sede Fija Única</option>
                    <option value="rotativa">🔄 Ubicación Rotativa Inter-sedes</option>
                    <option value="todas_las_sedes">🌐 Cobertura Multi-sede Global</option>
                  </select>
                </div>
              </div>

              {/* Sede Base */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sede Base Principal:
                </label>
                <select
                  value={newVetForm.sedeId}
                  onChange={(e) => setNewVetForm((p) => ({ ...p, sedeId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
                >
                  {(activeClinic?.sedes || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombreSede} ({s.codigoSedeNit || ''}) - {s.ciudad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sedes de Rotación */}
              {newVetForm.tipoAsignacion === 'rotativa' && (
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
                  <label className="text-xs font-bold text-[#6F2BCC] dark:text-purple-300 block">
                    Selecciona las sedes en las que rotará:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(activeClinic?.sedes || []).map((s) => {
                      const isChecked = newVetForm.sedesRotativas.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const exists = newVetForm.sedesRotativas.includes(s.id);
                              setNewVetForm((p) => ({
                                ...p,
                                sedesRotativas: exists
                                  ? p.sedesRotativas.filter((x) => x !== s.id)
                                  : [...p.sedesRotativas, s.id],
                              }));
                            }}
                            className="accent-[#6F2BCC] w-4 h-4"
                          />
                          <span className="font-bold text-slate-800 dark:text-white">{s.nombreSede}</span>{' '}
                          <span className="text-[#6F2BCC] font-mono">({s.codigoSedeNit || ''})</span>
                        </label>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={newVetForm.diasRotacion}
                    onChange={(e) => setNewVetForm((p) => ({ ...p, diasRotacion: e.target.value }))}
                    placeholder="Días/horarios de rotación (ej: Lun/Mié Norte, Mar/Jue Principal)"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  />
                </div>
              )}

              {/* Botones de Envío */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalAddVetOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#01FADA] hover:bg-[#00d6ba] text-[#2B017C] font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Vincular y Activar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
