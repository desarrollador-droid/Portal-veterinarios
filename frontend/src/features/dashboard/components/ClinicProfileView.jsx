import React, { useState, useEffect } from 'react';
import {
  clinicApi,
  COLOMBIAN_CITIES,
  VETERINARY_SPECIALTIES,
} from '../services/clinicApi.js';

export default function ClinicProfileView({ onClinicUpdated }) {
  // Pestañas principales del perfil:
  // 'datos' (Info básica, NIT, contactos, correos)
  // 'sedes' (Gestión de múltiples sedes de recolección)
  // 'veterinarios' (Equipo médico, especialidad, TP, activar/desactivar)
  // 'directorio' (Directorio general de clínicas)
  const [activeSubTab, setActiveSubTab] = useState('datos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeClinic, setActiveClinic] = useState(null);
  const [clinicsList, setClinicsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modo edición de datos principales
  const [isEditingMainData, setIsEditingMainData] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modales
  const [showAddSedeModal, setShowAddSedeModal] = useState(false);
  const [editingSede, setEditingSede] = useState(null);
  const [showAddVetModal, setShowAddVetModal] = useState(false);
  const [editingVet, setEditingVet] = useState(null);
  const [showRegisterNewClinicModal, setShowRegisterNewClinicModal] = useState(false);

  // Formulario principal
  const [formData, setFormData] = useState({
    type: 'veterinaria',
    nit: '',
    nombreVeterinaria: '',
    tieneMultiplesSedes: true,
    directorMedicoNombre: '',
    directorMedicoTelefono: '',
    cedula: '',
    nombreMedico: '',
    tarjetaProfesional: '',
    administrativaNombre: '',
    administrativaTelefono: '',
    recoleccionCiudad: 'Bogotá D.C.',
    recoleccionDireccion: '',
    recoleccionDetalles: '',
    recoleccionIndicaciones: '',
    correoFacturacion: '',
    correoResultados: '',
    rutNumero: '',
    rutArchivoNombre: 'RUT_Actualizado.pdf',
    tarjetaProfesionalArchivoNombre: 'TP_COMVEZCOL.pdf',
    terminosAceptados: true,
  });

  // Formulario para Sede
  const [sedeForm, setSedeForm] = useState({
    nombreSede: '',
    ciudad: 'Bogotá D.C.',
    direccionFisica: '',
    detallesAdicionales: '',
    telefonoContacto: '',
    responsableSede: '',
    indicacionesRuta: 'Donde el repartidor recogerá las muestras',
    correoResultadosSede: '',
    esPrincipal: false,
  });

  // Formulario para Veterinario Asociado
  const [vetForm, setVetForm] = useState({
    nombre: '',
    especialidad: 'Medicina General',
    tarjetaProfesional: '',
    email: '',
    telefono: '',
    sedeId: '',
    estado: 'activo',
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [active, list] = await Promise.all([
        clinicApi.getActiveClinic(),
        clinicApi.getClinics(),
      ]);
      setActiveClinic(active);
      setClinicsList(list);
      populateFormFromClinic(active);
    } catch (err) {
      console.error('Error cargando perfil de veterinaria:', err);
      showNotification('Error al cargar la información de la veterinaria', 'error');
    } finally {
      setLoading(false);
    }
  };

  const populateFormFromClinic = (clinic) => {
    if (!clinic) return;
    setFormData({
      type: clinic.type || 'veterinaria',
      nit: clinic.nit || '',
      nombreVeterinaria: clinic.nombreVeterinaria || '',
      tieneMultiplesSedes: Boolean(clinic.tieneMultiplesSedes ?? ((clinic.sedes || []).length > 1)),
      directorMedicoNombre: clinic.directorMedico?.nombre || '',
      directorMedicoTelefono: clinic.directorMedico?.telefono || '',
      cedula: clinic.cedula || '',
      nombreMedico: clinic.nombreMedico || '',
      tarjetaProfesional: clinic.tarjetaProfesional || '',
      administrativaNombre: clinic.administrativa?.nombreResponsable || '',
      administrativaTelefono: clinic.administrativa?.telefonoPagos || '',
      recoleccionCiudad: clinic.recoleccion?.ciudad || 'Bogotá D.C.',
      recoleccionDireccion: clinic.recoleccion?.direccionFisica || '',
      recoleccionDetalles: clinic.recoleccion?.detallesAdicionales || '',
      recoleccionIndicaciones: clinic.recoleccion?.indicacionesRuta || 'Donde el repartidor recogerá las muestras',
      correoFacturacion: clinic.correos?.facturacion || '',
      correoResultados: clinic.correos?.resultados || '',
      rutNumero: clinic.documentos?.rutNumero || '',
      rutArchivoNombre: clinic.documentos?.rutArchivo || 'RUT_Cargado.pdf',
      tarjetaProfesionalArchivoNombre: clinic.documentos?.tarjetaProfesionalArchivo || 'Tarjeta_Profesional.pdf',
      terminosAceptados: clinic.terminosAceptados ?? true,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumericInput = (field) => (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    handleInputChange(field, val);
  };

  const handleSelectActiveClinic = async (id) => {
    try {
      const updated = await clinicApi.setActiveClinic(id);
      setActiveClinic(updated);
      populateFormFromClinic(updated);
      const list = await clinicApi.getClinics();
      setClinicsList(list);
      showNotification(`"${updated.nombreVeterinaria || updated.nombreMedico}" seleccionada como clínica activa`);
      if (onClinicUpdated) onClinicUpdated(updated);
    } catch (err) {
      showNotification(err.message || 'Error cambiando clínica activa', 'error');
    }
  };

  // Guardar Datos Principales
  const handleSaveMainProfile = async (e) => {
    if (e) e.preventDefault();
    const isVet = formData.type === 'veterinaria';

    if (isVet) {
      if (!formData.nombreVeterinaria.trim()) return showNotification('El nombre de la veterinaria es obligatorio.', 'error');
      if (!formData.nit.trim()) return showNotification('El NIT de la empresa es obligatorio (sin puntos ni guiones).', 'error');
      if (!formData.directorMedicoNombre.trim()) return showNotification('El nombre del director médico es obligatorio.', 'error');
      if (!formData.directorMedicoTelefono.trim()) return showNotification('El teléfono del director médico es obligatorio.', 'error');
    } else {
      if (!formData.nombreMedico.trim()) return showNotification('El nombre completo del médico veterinario es obligatorio.', 'error');
      if (!formData.cedula.trim()) return showNotification('La cédula del médico es obligatoria (sin puntos ni guiones).', 'error');
      if (!formData.tarjetaProfesional.trim()) return showNotification('La tarjeta profesional es obligatoria.', 'error');
    }

    if (!formData.administrativaNombre.trim()) return showNotification('El nombre del responsable administrativo es obligatorio.', 'error');
    if (!formData.administrativaTelefono.trim()) return showNotification('El teléfono del responsable de pagos es obligatorio.', 'error');
    if (!formData.recoleccionCiudad.trim()) return showNotification('Debes seleccionar una ciudad para recolección.', 'error');
    if (!formData.recoleccionDireccion.trim()) return showNotification('La dirección física de recolección es obligatoria.', 'error');
    if (!formData.correoFacturacion.trim()) return showNotification('El correo de facturación es obligatorio.', 'error');
    if (!formData.correoResultados.trim()) return showNotification('El correo de reporte de resultados es obligatorio.', 'error');
    if (!formData.rutNumero.trim()) return showNotification('El número de RUT es obligatorio (sin puntos ni guiones).', 'error');
    if (!formData.terminosAceptados) return showNotification('Debes aceptar los Términos y la Ley 1581 de 2012 (Habeas Data).', 'error');

    setSaving(true);
    const payload = {
      type: formData.type,
      nit: isVet ? formData.nit.replace(/[^0-9]/g, '') : '',
      nombreVeterinaria: isVet ? formData.nombreVeterinaria.trim() : '',
      tieneMultiplesSedes: Boolean(formData.tieneMultiplesSedes),
      directorMedico: {
        nombre: isVet ? formData.directorMedicoNombre.trim() : '',
        telefono: isVet ? formData.directorMedicoTelefono.trim() : '',
      },
      cedula: !isVet ? formData.cedula.replace(/[^0-9]/g, '') : '',
      nombreMedico: !isVet ? formData.nombreMedico.trim() : '',
      tarjetaProfesional: !isVet ? formData.tarjetaProfesional.trim() : '',
      administrativa: {
        nombreResponsable: formData.administrativaNombre.trim(),
        telefonoPagos: formData.administrativaTelefono.trim(),
      },
      recoleccion: {
        ciudad: formData.recoleccionCiudad.trim(),
        direccionFisica: formData.recoleccionDireccion.trim(),
        detallesAdicionales: formData.recoleccionDetalles.trim(),
        indicacionesRuta: formData.recoleccionIndicaciones.trim() || 'Donde el repartidor recogerá las muestras',
      },
      correos: {
        facturacion: formData.correoFacturacion.trim().toLowerCase(),
        resultados: formData.correoResultados.trim().toLowerCase(),
      },
      documentos: {
        rutNumero: formData.rutNumero.replace(/[^0-9]/g, ''),
        rutArchivo: formData.rutArchivoNombre,
        tarjetaProfesionalArchivo: !isVet ? formData.tarjetaProfesionalArchivoNombre : null,
      },
      terminosAceptados: formData.terminosAceptados,
    };

    try {
      const updated = await clinicApi.updateClinic(activeClinic.id, payload);
      setActiveClinic(updated);
      populateFormFromClinic(updated);
      const list = await clinicApi.getClinics();
      setClinicsList(list);
      setIsEditingMainData(false);
      showNotification('Perfil de la clínica actualizado correctamente');
      if (onClinicUpdated) onClinicUpdated(updated);
    } catch (err) {
      showNotification(err.message || 'Error guardando datos', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- SEDES: Agregar o Editar ---
  const handleOpenAddSedeModal = (sedeToEdit = null) => {
    if (sedeToEdit) {
      setEditingSede(sedeToEdit);
      setSedeForm({
        nombreSede: sedeToEdit.nombreSede || '',
        ciudad: sedeToEdit.ciudad || activeClinic?.recoleccion?.ciudad || 'Bogotá D.C.',
        direccionFisica: sedeToEdit.direccionFisica || '',
        detallesAdicionales: sedeToEdit.detallesAdicionales || '',
        telefonoContacto: sedeToEdit.telefonoContacto || '',
        responsableSede: sedeToEdit.responsableSede || '',
        indicacionesRuta: sedeToEdit.indicacionesRuta || 'Donde el repartidor recogerá las muestras',
        correoResultadosSede: sedeToEdit.correoResultadosSede || activeClinic?.correos?.resultados || '',
        esPrincipal: Boolean(sedeToEdit.esPrincipal),
      });
    } else {
      setEditingSede(null);
      setSedeForm({
        nombreSede: '',
        ciudad: activeClinic?.recoleccion?.ciudad || 'Bogotá D.C.',
        direccionFisica: '',
        detallesAdicionales: '',
        telefonoContacto: activeClinic?.directorMedico?.telefono || '',
        responsableSede: '',
        indicacionesRuta: 'Donde el repartidor recogerá las muestras',
        correoResultadosSede: activeClinic?.correos?.resultados || '',
        esPrincipal: false,
      });
    }
    setShowAddSedeModal(true);
  };

  const handleSaveSede = async (e) => {
    e.preventDefault();
    if (!sedeForm.nombreSede.trim()) return showNotification('El nombre de la sede es obligatorio.', 'error');
    if (!sedeForm.direccionFisica.trim()) return showNotification('La dirección física de la sede es obligatoria.', 'error');
    if (!sedeForm.ciudad.trim()) return showNotification('La ciudad de la sede es obligatoria.', 'error');

    setSaving(true);
    try {
      let updated;
      if (editingSede) {
        updated = await clinicApi.updateSede(activeClinic.id, editingSede.id, sedeForm);
        showNotification(`Sede "${sedeForm.nombreSede}" actualizada correctamente`);
      } else {
        updated = await clinicApi.addSede(activeClinic.id, sedeForm);
        showNotification(`Nueva sede "${sedeForm.nombreSede}" añadida con éxito`);
      }
      setActiveClinic(updated);
      populateFormFromClinic(updated);
      const list = await clinicApi.getClinics();
      setClinicsList(list);
      setShowAddSedeModal(false);
      setEditingSede(null);
      if (onClinicUpdated) onClinicUpdated(updated);
    } catch (err) {
      showNotification(err.message || 'Error guardando sede', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSede = async (sedeId, nombreSede) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la sede "${nombreSede}"?`)) return;
    try {
      const updated = await clinicApi.deleteSede(activeClinic.id, sedeId);
      setActiveClinic(updated);
      populateFormFromClinic(updated);
      showNotification(`Sede "${nombreSede}" eliminada`);
      if (onClinicUpdated) onClinicUpdated(updated);
    } catch (err) {
      showNotification(err.message || 'Error eliminando sede', 'error');
    }
  };

  // --- VETERINARIOS ASOCIADOS: Agregar, Editar, Toggle Activar/Desactivar ---
  const handleOpenAddVetModal = (vetToEdit = null) => {
    if (vetToEdit) {
      setEditingVet(vetToEdit);
      setVetForm({
        nombre: vetToEdit.nombre || '',
        especialidad: vetToEdit.especialidad || 'Medicina General',
        tarjetaProfesional: vetToEdit.tarjetaProfesional || '',
        email: vetToEdit.email || '',
        telefono: vetToEdit.telefono || '',
        sedeId: vetToEdit.sedeId || activeClinic?.sedes?.[0]?.id || '',
        estado: vetToEdit.estado || 'activo',
      });
    } else {
      setEditingVet(null);
      setVetForm({
        nombre: '',
        especialidad: 'Medicina General',
        tarjetaProfesional: '',
        email: '',
        telefono: '',
        sedeId: activeClinic?.sedes?.[0]?.id || '',
        estado: 'activo',
      });
    }
    setShowAddVetModal(true);
  };

  const handleSaveVet = async (e) => {
    e.preventDefault();
    if (!vetForm.nombre.trim()) return showNotification('El nombre del veterinario es obligatorio.', 'error');
    if (!vetForm.tarjetaProfesional.trim()) return showNotification('El número de tarjeta profesional es obligatorio.', 'error');

    const selectedSede = (activeClinic?.sedes || []).find((s) => s.id === vetForm.sedeId);

    const payload = {
      ...vetForm,
      sedeNombre: selectedSede ? selectedSede.nombreSede : 'Sede Principal',
    };

    setSaving(true);
    try {
      let updated;
      if (editingVet) {
        updated = await clinicApi.updateVeterinarian(activeClinic.id, editingVet.id, payload);
        showNotification(`Datos del Dr./Dra. ${vetForm.nombre} actualizados`);
      } else {
        updated = await clinicApi.addVeterinarian(activeClinic.id, payload);
        showNotification(`Veterinario asociado ${vetForm.nombre} vinculado con éxito`);
      }
      setActiveClinic(updated);
      populateFormFromClinic(updated);
      const list = await clinicApi.getClinics();
      setClinicsList(list);
      setShowAddVetModal(false);
      setEditingVet(null);
      if (onClinicUpdated) onClinicUpdated(updated);
    } catch (err) {
      showNotification(err.message || 'Error guardando veterinario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVetStatus = async (vetId, vetNombre, estadoActual) => {
    try {
      const result = await clinicApi.toggleVeterinarianStatus(activeClinic.id, vetId);
      setActiveClinic(result.clinic);
      const nuevoEstado = result.vet.estado;
      showNotification(
        `Usuario de ${vetNombre} ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`
      );
      if (onClinicUpdated) onClinicUpdated(result.clinic);
    } catch (err) {
      showNotification(err.message || 'Error cambiando estado del usuario', 'error');
    }
  };

  const handleDeleteVet = async (vetId, vetNombre) => {
    if (!window.confirm(`¿Seguro que deseas desvincular a ${vetNombre}?`)) return;
    try {
      const updated = await clinicApi.deleteVeterinarian(activeClinic.id, vetId);
      setActiveClinic(updated);
      showNotification(`Veterinario ${vetNombre} desvinculado`);
      if (onClinicUpdated) onClinicUpdated(updated);
    } catch (err) {
      showNotification(err.message || 'Error desvinculando veterinario', 'error');
    }
  };

  const filteredClinics = clinicsList.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.nombreVeterinaria || c.nombreMedico || '').toLowerCase().includes(q);
      const matchDoc = (c.nit || c.cedula || '').includes(q);
      const matchCity = (c.recoleccion?.ciudad || '').toLowerCase().includes(q);
      return matchName || matchDoc || matchCity;
    }
    return true;
  });

  const sedesList = activeClinic?.sedes || [];
  const vetsList = activeClinic?.veterinariosAsociados || [];
  const activeVetsCount = vetsList.filter((v) => v.estado === 'activo').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold transition-all animate-in slide-in-from-top-4 duration-300 ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span className="text-base">{notification.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{notification.msg}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. ENCABEZADO Y TÍTULO INSTITUCIONAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-[#6F2BCC] border border-purple-200/60">
              Panel Administrativo
            </span>
            <span className="text-xs text-slate-400 font-medium">
              · Configuración Institucional, Sedes y Cuerpo Médico
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B017C] tracking-tight">
            Perfil de la Veterinaria
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Información legal, NIT, sedes de recolección de muestras, director médico y administración de veterinarios asociados.
          </p>
        </div>

        {/* ACCIONES SUPERIORES */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('directorio')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>📋</span>
            <span>Directorio de Clínicas ({clinicsList.length})</span>
          </button>
        </div>
      </div>

      {/* 2. TARJETA DESTACADA: BANNER DE LA CLÍNICA ACTIVA */}
      {activeClinic && (
        <div className="bg-gradient-to-r from-[#2B017C] via-[#3e04aa] to-[#6F2BCC] rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#01FADA]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {activeClinic.type === 'independiente' ? '🩺' : '🏥'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#01FADA] text-[#2B017C]">
                    {activeClinic.type === 'independiente'
                      ? 'Médico Veterinario Independiente'
                      : 'Clínica Veterinaria (Empresa)'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                    Sede Activa en Sesión
                  </span>
                  {activeClinic.type === 'veterinaria' && sedesList.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-300 text-purple-950">
                      {sedesList.length} Sedes Vinculadas
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {activeClinic.type === 'independiente'
                    ? activeClinic.nombreMedico
                    : activeClinic.nombreVeterinaria}
                </h2>
                <div className="flex items-center gap-3 text-xs text-purple-100 flex-wrap">
                  <span>
                    <strong>{activeClinic.type === 'independiente' ? 'Cédula:' : 'NIT:'}</strong>{' '}
                    {activeClinic.type === 'independiente' ? activeClinic.cedula : activeClinic.nit}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>RUT:</strong> {activeClinic.documentos?.rutNumero}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Ciudad Principal:</strong> {activeClinic.recoleccion?.ciudad}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Veterinarios:</strong> {activeVetsCount} activos
                  </span>
                </div>
              </div>
            </div>

            {/* BOTÓN RÁPIDO PARA EDITAR DATOS PRINCIPALES */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('datos');
                  setIsEditingMainData(!isEditingMainData);
                  if (!isEditingMainData) populateFormFromClinic(activeClinic);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                  isEditingMainData
                    ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    : 'bg-[#01FADA] text-[#2B017C] hover:bg-[#00e3c5] font-black'
                }`}
              >
                <span>{isEditingMainData ? '✕ Cancelar Edición' : '✏️ Editar Datos Principales'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BARRA DE SUB-PESTAÑAS DEL PERFIL */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-2xs gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('datos');
            setIsEditingMainData(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'datos'
              ? 'bg-[#2B017C] text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🏢</span>
          <span>Información de la Clínica & Facturación</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sedes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'sedes'
              ? 'bg-[#2B017C] text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📍</span>
          <span>Sedes de Recolección ({sedesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('veterinarios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'veterinarios'
              ? 'bg-[#2B017C] text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🩺</span>
          <span>Veterinarios Asociados ({vetsList.length})</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-[#01FADA] text-[#2B017C]">
            {activeVetsCount} activos
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('directorio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ml-auto ${
            activeSubTab === 'directorio'
              ? 'bg-[#6F2BCC] text-white shadow-xs font-extrabold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🌐</span>
          <span>Cambiar Clínica Activa</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTENIDO SUB-PESTAÑA 1: INFORMACIÓN DE LA CLÍNICA & FACTURACIÓN */}
      {/* ========================================================================= */}
      {activeSubTab === 'datos' && activeClinic && (
        <div className="space-y-6">
          {!isEditingMainData ? (
            /* VISTA DE SOLO LECTURA ESTRUCTURADA */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Tarjeta 1: Información Legal y Directores */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-lg">🏛️</span>
                  <h3 className="text-sm font-extrabold text-[#2B017C]">
                    {activeClinic.type === 'independiente' ? 'Datos del Médico' : 'Datos de la Empresa'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {activeClinic.type === 'veterinaria' ? (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Nombre de la Veterinaria
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm">
                          {activeClinic.nombreVeterinaria}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          NIT de la Empresa
                        </span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                          {activeClinic.nit}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Sin puntos ni guiones.
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Director Médico / Responsable del Área Médica
                        </span>
                        <span className="font-bold text-slate-800">
                          {activeClinic.directorMedico?.nombre || 'No registrado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Teléfono del Director Médico
                        </span>
                        <span className="font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                          <span>📞</span>
                          <span>{activeClinic.directorMedico?.telefono || 'No registrado'}</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Nombre Completo del Médico Veterinario
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm">
                          {activeClinic.nombreMedico}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Cédula del Médico Veterinario
                        </span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                          {activeClinic.cedula}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Sin puntos ni guiones.
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Tarjeta Profesional
                        </span>
                        <span className="font-mono font-extrabold text-[#6F2BCC] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 inline-block mt-0.5">
                          {activeClinic.tarjetaProfesional}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tarjeta 2: Área Administrativa y Pagos */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-lg">💼</span>
                  <h3 className="text-sm font-extrabold text-[#2B017C]">
                    Área Administrativa
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Nombre del Responsable del Área Administrativa
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {activeClinic.administrativa?.nombreResponsable || 'No registrado'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Teléfono del Responsable de Pagos
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5 text-sm">
                      <span>💬</span>
                      <span>{activeClinic.administrativa?.telefonoPagos || 'No registrado'}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1 bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900 leading-snug">
                      ℹ️ A este número se enviarán notificaciones de facturación.
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Correo para Facturación
                    </span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span>✉️</span>
                      <span>{activeClinic.correos?.facturacion || 'facturacion@veterinaria.com'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Correo para Reporte de Resultados
                    </span>
                    <span className="font-bold text-[#6F2BCC] flex items-center gap-1.5 mt-0.5">
                      <span>🔬</span>
                      <span>{activeClinic.correos?.resultados || 'resultados@veterinaria.com'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Logística de Recolección & Documentos */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-lg">🛵</span>
                  <h3 className="text-sm font-extrabold text-[#2B017C]">
                    Ubicación de Recolección & Documentos
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Ciudad de Recolección Principal
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                      <span>📍</span>
                      <span>{activeClinic.recoleccion?.ciudad || 'No seleccionada'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Dirección Física
                    </span>
                    <span className="font-extrabold text-[#2B017C] block mt-0.5">
                      {activeClinic.recoleccion?.direccionFisica || 'No registrada'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      Donde el repartidor recogerá las muestras.
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      RUT de la Empresa / Médico
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block mt-0.5">
                      {activeClinic.documentos?.rutNumero || 'Sin registrar'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Número de RUT sin puntos ni guiones.
                    </span>
                  </div>

                  <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/80 text-[11px] text-slate-700 leading-snug">
                    <span className="font-bold text-[#6F2BCC] block mb-0.5">Habeas Data (Ley 1581 de 2012):</span>
                    Términos de servicio y política de privacidad aceptados.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE EDICIÓN EN LÍNEA DE DATOS PRINCIPALES */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#2B017C]">
                    Editar Datos de la Veterinaria
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifica los campos legales, administrativos y de recolección de muestras.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Modo Edición
                </span>
              </div>

              <form onSubmit={handleSaveMainProfile} className="space-y-6">
                {renderMainDataFields()}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingMainData(false);
                      populateFormFromClinic(activeClinic);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Cambios de la Clínica'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTENIDO SUB-PESTAÑA 2: GESTIÓN DE SEDES DE RECOLECCIÓN */}
      {/* ========================================================================= */}
      {activeSubTab === 'sedes' && activeClinic && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <h3 className="text-base font-extrabold text-[#2B017C]">
                  Sedes de Recolección de la Clínica
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Si tu veterinaria cuenta con varias sedes o consultorios, regístralas aquí. El repartidor motorizado recogerá las muestras en la dirección exacta de cada una.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddSedeModal(null)}
              className="px-4 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span className="text-sm">+</span>
              <span>Añadir Nueva Sede</span>
            </button>
          </div>

          {/* LISTADO DE SEDES EN TARJETAS COMPLETAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sedesList.map((sede) => (
              <div
                key={sede.id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                  sede.esPrincipal
                    ? 'border-[#6F2BCC] ring-2 ring-[#6F2BCC]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {sede.esPrincipal ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#01FADA] text-[#2B017C] border border-[#01FADA]">
                            ★ Sede Principal
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            Sede Sucursal
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-bold">
                          📍 {sede.ciudad}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                        {sede.nombreSede}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenAddSedeModal(sede)}
                        className="p-1.5 text-slate-400 hover:text-[#6F2BCC] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar sede"
                      >
                        ✏️
                      </button>
                      {!sede.esPrincipal && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSede(sede.id, sede.nombreSede)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar sede"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DATOS DE LA SEDE: DIRECCIÓN DONDE EL REPARTIDOR RECOGE MUESTRAS */}
                  <div className="space-y-2.5 text-xs">
                    <div className="bg-sky-50/60 p-3 rounded-2xl border border-sky-100 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1">
                        <span>🛵</span>
                        <span>Dirección de Recolección (Repartidor):</span>
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {sede.direccionFisica}
                      </span>
                      <span className="text-[11px] text-slate-600 block leading-tight">
                        {sede.indicacionesRuta || 'Donde el repartidor recogerá las muestras'}
                      </span>
                      {sede.detallesAdicionales && (
                        <span className="text-[10px] text-slate-500 italic block pt-0.5">
                          Nota: {sede.detallesAdicionales}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Responsable de la Sede
                        </span>
                        <span className="font-bold text-slate-800">
                          {sede.responsableSede || 'Director de sede'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Teléfono de Contacto
                        </span>
                        <span className="font-bold text-slate-800">
                          📞 {sede.telefonoContacto || 'No registrado'}
                        </span>
                      </div>
                    </div>

                    {sede.correoResultadosSede && (
                      <div className="text-[11px]">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Correo para Reporte de Resultados
                        </span>
                        <span className="font-bold text-[#6F2BCC]">
                          ✉️ {sede.correoResultadosSede}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PIE DE SEDE: VETERINARIOS ADSCRITOS */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Veterinarios en esta sede:{' '}
                    <strong>
                      {vetsList.filter((v) => v.sedeId === sede.id).length}
                    </strong>
                  </span>
                  {!sede.esPrincipal && (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedSede = { ...sede, esPrincipal: true };
                        clinicApi.updateSede(activeClinic.id, sede.id, updatedSede).then((c) => {
                          setActiveClinic(c);
                          showNotification(`"${sede.nombreSede}" es ahora la sede principal`);
                        });
                      }}
                      className="text-[11px] text-[#6F2BCC] hover:underline font-bold cursor-pointer"
                    >
                      Hacer Principal
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sedesList.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <span className="text-4xl block">📍</span>
              <h4 className="text-base font-bold text-slate-800">
                Aún no has registrado sedes adicionales
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Si tu clínica veterinaria tiene más de una sede o consultorio de atención, agrégalas para coordinar rutas de mensajería independientes.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddSedeModal(null)}
                className="px-4 py-2 bg-[#6F2BCC] text-white rounded-xl text-xs font-bold hover:bg-[#581ea3] transition-all cursor-pointer"
              >
                + Registrar Primera Sede
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CONTENIDO SUB-PESTAÑA 3: VETERINARIOS ASOCIADOS A ESTA VETERINARIA */}
      {/* ========================================================================= */}
      {activeSubTab === 'veterinarios' && activeClinic && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🩺</span>
                <h3 className="text-base font-extrabold text-[#2B017C]">
                  Equipo de Médicos Veterinarios Asociados
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Profesionales vinculados a <strong>{activeClinic.nombreVeterinaria || activeClinic.nombreMedico}</strong> con nombre, especialidad, tarjeta profesional y gestión de estado de usuario (activar / desactivar).
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddVetModal(null)}
              className="px-4 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span className="text-sm">+</span>
              <span>Añadir Nuevo Veterinario Asociado</span>
            </button>
          </div>

          {/* TABLA / DIRECTORIO DE VETERINARIOS */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Médico Veterinario</th>
                    <th className="py-3.5 px-4">Especialidad</th>
                    <th className="py-3.5 px-4">Tarjeta Profesional</th>
                    <th className="py-3.5 px-4">Sede Asignada</th>
                    <th className="py-3.5 px-4 text-center">Estado del Usuario</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {vetsList.map((vet) => {
                    const isActivo = vet.estado === 'activo';

                    return (
                      <tr
                        key={vet.id}
                        className={`hover:bg-purple-50/40 transition-colors ${
                          !isActivo ? 'bg-slate-50/50 opacity-75' : ''
                        }`}
                      >
                        {/* Nombre y Cargo */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6F2BCC] flex items-center justify-center font-bold text-sm shrink-0">
                              👨‍⚕️
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 text-sm">
                                  {vet.nombre}
                                </span>
                                {vet.esDirector && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-100 text-[#6F2BCC]">
                                    Director
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block">
                                {vet.email || vet.telefono || 'Sin correo directo'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Especialidad */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-[#6F2BCC] border border-purple-200 inline-block">
                            {vet.especialidad || 'Medicina General'}
                          </span>
                        </td>

                        {/* Tarjeta Profesional */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {vet.tarjetaProfesional}
                          </span>
                        </td>

                        {/* Sede Asignada */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <span>📍</span>
                            <span>{vet.sedeNombre || 'Sede Principal'}</span>
                          </span>
                        </td>

                        {/* Estado del Usuario: Activo / Inactivo */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isActivo
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-200 text-slate-600 border border-slate-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActivo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            />
                            <span>{isActivo ? 'Usuario Activo' : 'Usuario Inactivo'}</span>
                          </span>
                        </td>

                        {/* Acciones: Activar/Desactivar y Editar */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Botón Switch Activar / Desactivar Usuario */}
                            <button
                              type="button"
                              onClick={() => handleToggleVetStatus(vet.id, vet.nombre, vet.estado)}
                              title={isActivo ? 'Desactivar acceso del usuario' : 'Activar acceso del usuario'}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isActivo
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                              }`}
                            >
                              <span>{isActivo ? '⏸ Desactivar' : '▶ Activar'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenAddVetModal(vet)}
                              className="p-1 text-slate-400 hover:text-[#6F2BCC] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar veterinario"
                            >
                              ✏️
                            </button>

                            {!vet.esDirector && (
                              <button
                                type="button"
                                onClick={() => handleDeleteVet(vet.id, vet.nombre)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Desvincular veterinario"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {vetsList.length === 0 && (
              <div className="p-10 text-center space-y-2">
                <span className="text-3xl block">👨‍⚕️</span>
                <h4 className="text-sm font-bold text-slate-800">
                  No hay veterinarios asociados registrados
                </h4>
                <p className="text-xs text-slate-500">
                  Agrega a los médicos de la clínica para que puedan solicitar y recibir resultados qPCR.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CONTENIDO SUB-PESTAÑA 4: DIRECTORIO DE CLÍNICAS REGISTRADAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'directorio' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-1 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, NIT, cédula o ciudad..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#2B017C] mr-1">Tipo:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-[#6F2BCC] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({clinicsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('veterinaria')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    typeFilter === 'veterinaria'
                      ? 'bg-[#6F2BCC] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🏥</span>
                  <span>Clínicas ({clinicsList.filter((c) => c.type === 'veterinaria').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('independiente')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    typeFilter === 'independiente'
                      ? 'bg-[#6F2BCC] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🩺</span>
                  <span>Independientes ({clinicsList.filter((c) => c.type === 'independiente').length})</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredClinics.map((clinic) => {
              const isActive = clinic.id === activeClinic?.id;

              return (
                <div
                  key={clinic.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                    isActive
                      ? 'border-[#6F2BCC] ring-2 ring-[#6F2BCC]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              clinic.type === 'independiente'
                                ? 'bg-sky-100 text-sky-900 border border-sky-200'
                                : 'bg-purple-100 text-purple-900 border border-purple-200'
                            }`}
                          >
                            {clinic.type === 'independiente' ? '🩺 Médico Independiente' : '🏥 Clínica Veterinaria'}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#01FADA] text-[#2B017C] border border-[#01FADA]">
                              ★ Activa en Sesión
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                          {clinic.type === 'independiente' ? clinic.nombreMedico : clinic.nombreVeterinaria}
                        </h3>
                      </div>
                      <span className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6F2BCC] flex items-center justify-center text-lg shrink-0 border border-purple-100">
                        {clinic.type === 'independiente' ? '🩺' : '🏥'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          {clinic.type === 'independiente' ? 'Cédula' : 'NIT'}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {clinic.type === 'independiente' ? clinic.cedula : clinic.nit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Sedes Registradas
                        </span>
                        <span className="font-bold text-slate-800">
                          📍 {clinic.sedes?.length || 1} sede(s)
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Dirección de Recolección (Repartidor)
                        </span>
                        <span className="font-semibold text-slate-800 block">
                          {clinic.recoleccion?.ciudad} — {clinic.recoleccion?.direccionFisica}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Veterinarios: <strong>{clinic.veterinariosAsociados?.length || 1}</strong>
                    </span>

                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectActiveClinic(clinic.id);
                          setActiveSubTab('datos');
                        }}
                        className="px-3.5 py-1.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Seleccionar como Activa</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#2B017C] flex items-center gap-1">
                        <span>✓</span>
                        <span>En uso actual</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: AÑADIR O EDITAR SEDE */}
      {/* ========================================================================= */}
      {showAddSedeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <h3 className="text-base font-extrabold text-[#2B017C]">
                  {editingSede ? 'Editar Sede de Recolección' : 'Añadir Nueva Sede'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSedeModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSede} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  required
                  value={sedeForm.nombreSede}
                  onChange={(e) => setSedeForm({ ...sedeForm, nombreSede: e.target.value })}
                  placeholder="Ej. Sede Norte - Santa Bárbara"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ciudad de la Sede *
                  </label>
                  <select
                    value={sedeForm.ciudad}
                    onChange={(e) => setSedeForm({ ...sedeForm, ciudad: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                  >
                    {COLOMBIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={sedeForm.telefonoContacto}
                    onChange={(e) => setSedeForm({ ...sedeForm, telefonoContacto: e.target.value })}
                    placeholder="Ej. 312 456 7890"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Dirección física de recolección *
                </label>
                <input
                  type="text"
                  required
                  value={sedeForm.direccionFisica}
                  onChange={(e) => setSedeForm({ ...sedeForm, direccionFisica: e.target.value })}
                  placeholder="Ej. Calle 127 # 19-48, Local 102"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                  Donde el repartidor recogerá las muestras de esta sede.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Responsable de la Sede
                </label>
                <input
                  type="text"
                  value={sedeForm.responsableSede}
                  onChange={(e) => setSedeForm({ ...sedeForm, responsableSede: e.target.value })}
                  placeholder="Ej. Dra. Camila Torres"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detalles / Horarios para el repartidor (Opcional)
                </label>
                <input
                  type="text"
                  value={sedeForm.detallesAdicionales}
                  onChange={(e) => setSedeForm({ ...sedeForm, detallesAdicionales: e.target.value })}
                  placeholder="Ej. Recepción segundo piso, muestras refrigeradas a 4°C"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sedePrincipalCheck"
                  checked={sedeForm.esPrincipal}
                  onChange={(e) => setSedeForm({ ...sedeForm, esPrincipal: e.target.checked })}
                  className="w-4 h-4 text-[#6F2BCC] rounded border-slate-300"
                />
                <label htmlFor="sedePrincipalCheck" className="text-xs text-slate-700 font-bold cursor-pointer">
                  Establecer como Sede Principal de la clínica
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSedeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {saving ? 'Guardando...' : editingSede ? 'Actualizar Sede' : 'Añadir Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: AÑADIR O EDITAR VETERINARIO ASOCIADO */}
      {/* ========================================================================= */}
      {showAddVetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🩺</span>
                <h3 className="text-base font-extrabold text-[#2B017C]">
                  {editingVet ? 'Editar Veterinario Asociado' : 'Añadir Nuevo Veterinario Asociado'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVetModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo del Médico Veterinario *
                </label>
                <input
                  type="text"
                  required
                  value={vetForm.nombre}
                  onChange={(e) => setVetForm({ ...vetForm, nombre: e.target.value })}
                  placeholder="Ej. Dra. Camila Torres Pardo"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Especialidad *
                  </label>
                  <select
                    value={vetForm.especialidad}
                    onChange={(e) => setVetForm({ ...vetForm, especialidad: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                  >
                    {VETERINARY_SPECIALTIES.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tarjeta Profesional (COMVEZCOL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vetForm.tarjetaProfesional}
                    onChange={(e) => setVetForm({ ...vetForm, tarjetaProfesional: e.target.value })}
                    placeholder="Ej. COMVEZCOL-24519"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sede de Atención Asignada
                </label>
                <select
                  value={vetForm.sedeId}
                  onChange={(e) => setVetForm({ ...vetForm, sedeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Todas las Sedes / General</option>
                  {sedesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombreSede} ({s.ciudad})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={vetForm.email}
                    onChange={(e) => setVetForm({ ...vetForm, email: e.target.value })}
                    placeholder="doctor@veterinaria.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teléfono Móvil
                  </label>
                  <input
                    type="tel"
                    value={vetForm.telefono}
                    onChange={(e) => setVetForm({ ...vetForm, telefono: e.target.value })}
                    placeholder="Ej. 312 456 1122"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estado Inicial del Usuario
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="radio"
                      name="vetEstado"
                      value="activo"
                      checked={vetForm.estado === 'activo'}
                      onChange={() => setVetForm({ ...vetForm, estado: 'activo' })}
                      className="text-[#6F2BCC]"
                    />
                    <span>Activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="radio"
                      name="vetEstado"
                      value="inactivo"
                      checked={vetForm.estado === 'inactivo'}
                      onChange={() => setVetForm({ ...vetForm, estado: 'inactivo' })}
                      className="text-[#6F2BCC]"
                    />
                    <span>Inactivo (Desactivado)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {saving ? 'Guardando...' : editingVet ? 'Actualizar Veterinario' : 'Añadir Veterinario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Renderiza los campos de Datos Principales de la Veterinaria
   */
  function renderMainDataFields() {
    const isVet = formData.type === 'veterinaria';

    return (
      <div className="space-y-6">
        {/* SELECTOR CONDICIONAL: VETERINARIA VS MÉDICO INDEPENDIENTE */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Modalidad de la Cuenta *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'veterinaria')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                formData.type === 'veterinaria'
                  ? 'bg-purple-50/70 border-[#6F2BCC] ring-2 ring-[#6F2BCC]/30 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6F2BCC] flex items-center justify-center text-lg shrink-0">
                🏥
              </div>
              <div>
                <span className="block font-black text-xs text-[#2B017C]">
                  Clínica Veterinaria (Empresa)
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Con NIT, múltiples sedes y equipo de veterinarios.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleInputChange('type', 'independiente')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                formData.type === 'independiente'
                  ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-lg shrink-0">
                🩺
              </div>
              <div>
                <span className="block font-black text-xs text-[#2B017C]">
                  Médico Veterinario Independiente
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Profesional independiente con Cédula y Tarjeta Profesional.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* DATOS BÁSICOS SEGÚN MODALIDAD */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">{isVet ? '🏥' : '🩺'}</span>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2B017C]">
              {isVet ? 'Identificación de la Veterinaria' : 'Identificación del Médico Independiente'}
            </h4>
          </div>

          {isVet ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  NIT de la Veterinaria *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.nit}
                  onChange={handleNumericInput('nit')}
                  placeholder="900123456"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Sin puntos ni guiones (sin dígito de verificación).
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre de la Veterinaria *
                </label>
                <input
                  type="text"
                  value={formData.nombreVeterinaria}
                  onChange={(e) => handleInputChange('nombreVeterinaria', e.target.value)}
                  placeholder="Ej. Clínica Veterinaria San Martín"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre del director médico / responsable del área médica *
                </label>
                <input
                  type="text"
                  value={formData.directorMedicoNombre}
                  onChange={(e) => handleInputChange('directorMedicoNombre', e.target.value)}
                  placeholder="Ej. Dr. Alejandro Morales"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teléfono del director médico *
                </label>
                <input
                  type="text"
                  inputMode="tel"
                  value={formData.directorMedicoTelefono}
                  onChange={(e) => handleInputChange('directorMedicoTelefono', e.target.value)}
                  placeholder="Ej. 310 123 4567"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cédula del médico veterinario *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.cedula}
                  onChange={handleNumericInput('cedula')}
                  placeholder="1020123456"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Sin puntos ni guiones.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre completo del médico veterinario *
                </label>
                <input
                  type="text"
                  value={formData.nombreMedico}
                  onChange={(e) => handleInputChange('nombreMedico', e.target.value)}
                  placeholder="Ej. Dr. Alejandro Morales Restrepo"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Tarjeta profesional *
                </label>
                <input
                  type="text"
                  value={formData.tarjetaProfesional}
                  onChange={(e) => handleInputChange('tarjetaProfesional', e.target.value)}
                  placeholder="Ej. COMVEZCOL-28491"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* ÁREA ADMINISTRATIVA */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">💼</span>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2B017C]">
              Área Administrativa
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nombre del responsable del área administrativa *
              </label>
              <input
                type="text"
                value={formData.administrativaNombre}
                onChange={(e) => handleInputChange('administrativaNombre', e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Teléfono del responsable de pagos *
              </label>
              <input
                type="text"
                inputMode="tel"
                value={formData.administrativaTelefono}
                onChange={(e) => handleInputChange('administrativaTelefono', e.target.value)}
                placeholder="Ej. 300 987 6543"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                A este número se enviarán notificaciones de facturación.
              </span>
            </div>
          </div>
        </div>

        {/* UBICACIÓN DE RECOLECCIÓN PRINCIPAL */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🛵</span>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2B017C]">
              Ubicación de Recolección Principal
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ciudad *
              </label>
              <select
                value={formData.recoleccionCiudad}
                onChange={(e) => handleInputChange('recoleccionCiudad', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Selecciona tu ciudad…</option>
                {COLOMBIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dirección física *
              </label>
              <input
                type="text"
                value={formData.recoleccionDireccion}
                onChange={(e) => handleInputChange('recoleccionDireccion', e.target.value)}
                placeholder="Ej. Calle 80 # 15-32, Consultorio 204"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Donde el repartidor recogerá las muestras.
              </span>
            </div>
          </div>
        </div>

        {/* CORREOS ELECTRÓNICOS */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📧</span>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2B017C]">
              Correos Electrónicos
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Correo para facturación *
              </label>
              <input
                type="email"
                value={formData.correoFacturacion}
                onChange={(e) => handleInputChange('correoFacturacion', e.target.value)}
                placeholder="facturacion@veterinaria.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Correo para reporte de resultados *
              </label>
              <input
                type="email"
                value={formData.correoResultados}
                onChange={(e) => handleInputChange('correoResultados', e.target.value)}
                placeholder="resultados@veterinaria.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* DOCUMENTOS */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📑</span>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2B017C]">
              Documentos
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isVet ? 'RUT de la empresa *' : 'RUT del médico veterinario *'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.rutNumero}
                onChange={handleNumericInput('rutNumero')}
                placeholder="900123456"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Número de RUT sin puntos ni guiones.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Archivo de RUT en PDF
              </label>
              <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-700">
                <span>📎</span>
                <span className="truncate flex-1 font-mono text-[11px]">
                  {formData.rutArchivoNombre}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Adjuntado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LEY 1581 HABEAS DATA */}
        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/80 flex items-start gap-3">
          <input
            type="checkbox"
            id="terminosLegalCheck"
            checked={formData.terminosAceptados}
            onChange={(e) => handleInputChange('terminosAceptados', e.target.checked)}
            className="mt-1 w-4 h-4 text-[#6F2BCC] rounded border-slate-300"
          />
          <label htmlFor="terminosLegalCheck" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
            Al registrarte, aceptas los <strong>Términos de Servicio</strong> y la <strong>Política de Privacidad</strong> de <strong>VetqPCR Lab</strong>. Tu información será tratada conforme a la <strong>Ley 1581 de 2012 (Habeas Data Colombia)</strong>.
          </label>
        </div>
      </div>
    );
  }
}
