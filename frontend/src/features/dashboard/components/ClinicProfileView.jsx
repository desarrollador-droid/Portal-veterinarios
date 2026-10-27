import React, { useState, useEffect } from 'react';
import { clinicApi, COLOMBIAN_CITIES } from '../services/clinicApi.js';

export default function ClinicProfileView({ onClinicUpdated }) {
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'directorio' | 'nuevo'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeClinic, setActiveClinic] = useState(null);
  const [clinicsList, setClinicsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'veterinaria' | 'independiente'

  // Modo edición en la pestaña 'perfil'
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Estado del formulario (para editar la activa o crear una nueva)
  const [formData, setFormData] = useState({
    type: 'veterinaria', // 'veterinaria' | 'independiente'
    nit: '',
    nombreVeterinaria: '',
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

  const resetFormToBlank = (initialType = 'veterinaria') => {
    setFormData({
      type: initialType,
      nit: '',
      nombreVeterinaria: '',
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
      recoleccionIndicaciones: 'Donde el repartidor recogerá las muestras',
      correoFacturacion: '',
      correoResultados: '',
      rutNumero: '',
      rutArchivoNombre: 'RUT_Nuevo.pdf',
      tarjetaProfesionalArchivoNombre: 'Tarjeta_Profesional.pdf',
      terminosAceptados: true,
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

  // Validaciones antes de guardar
  const validateForm = () => {
    const isVet = formData.type === 'veterinaria';

    if (isVet) {
      if (!formData.nombreVeterinaria.trim()) return 'El nombre de la veterinaria es obligatorio.';
      if (!formData.nit.trim()) return 'El NIT de la empresa es obligatorio (sin puntos ni guiones).';
      if (!formData.directorMedicoNombre.trim()) return 'El nombre del director médico / responsable del área médica es obligatorio.';
      if (!formData.directorMedicoTelefono.trim()) return 'El teléfono del director médico es obligatorio.';
    } else {
      if (!formData.nombreMedico.trim()) return 'El nombre completo del médico veterinario es obligatorio.';
      if (!formData.cedula.trim()) return 'La cédula del médico veterinario es obligatoria (sin puntos ni guiones).';
      if (!formData.tarjetaProfesional.trim()) return 'La tarjeta profesional es obligatoria.';
    }

    if (!formData.administrativaNombre.trim()) return 'El nombre del responsable del área administrativa es obligatorio.';
    if (!formData.administrativaTelefono.trim()) return 'El teléfono del responsable de pagos es obligatorio.';
    if (!formData.recoleccionCiudad.trim()) return 'Debes seleccionar una ciudad para la recolección.';
    if (!formData.recoleccionDireccion.trim()) return 'La dirección física de recolección es obligatoria.';
    if (!formData.correoFacturacion.trim()) return 'El correo para facturación es obligatorio.';
    if (!formData.correoResultados.trim()) return 'El correo para reporte de resultados es obligatorio.';
    if (!formData.rutNumero.trim()) return 'El número de RUT es obligatorio (sin puntos ni guiones).';
    if (!formData.terminosAceptados) return 'Debes aceptar los Términos de Servicio y la Política de Habeas Data (Ley 1581 de 2012).';

    return null;
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      showNotification(errorMsg, 'error');
      return;
    }

    setSaving(true);
    const isVet = formData.type === 'veterinaria';

    const payload = {
      type: formData.type,
      nit: isVet ? formData.nit.replace(/[^0-9]/g, '') : '',
      nombreVeterinaria: isVet ? formData.nombreVeterinaria.trim() : '',
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
      esClinicaActiva: activeTab === 'nuevo' ? true : Boolean(activeClinic?.esClinicaActiva),
    };

    try {
      let saved;
      if (activeTab === 'nuevo') {
        saved = await clinicApi.createClinic(payload);
        showNotification('¡Nueva veterinaria registrada exitosamente en VetLab!');
        setActiveTab('perfil');
      } else {
        saved = await clinicApi.updateClinic(activeClinic.id, payload);
        showNotification('Perfil de veterinaria actualizado correctamente');
        setIsEditing(false);
      }

      setActiveClinic(saved);
      populateFormFromClinic(saved);
      const list = await clinicApi.getClinics();
      setClinicsList(list);

      if (onClinicUpdated) onClinicUpdated(saved);
    } catch (err) {
      showNotification(err.message || 'Error guardando datos de la veterinaria', 'error');
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* ALERTA DE NOTIFICACIÓN FLOTANTE */}
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

      {/* 1. ENCABEZADO INSTITUCIONAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-[#6F2BCC] border border-purple-200/60">
              Panel Administrativo
            </span>
            <span className="text-xs text-slate-400 font-medium">
              · Configuración y Logística de Recolección
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B017C] tracking-tight">
            Perfil de Veterinaria & Médicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Datos legales, contactos médicos, dirección oficial para mensajería motorizada, correos de facturación y reporte de resultados qPCR.
          </p>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN SUPERIOR */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 border border-slate-300/80 text-xs font-bold self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('perfil');
              setIsEditing(false);
              populateFormFromClinic(activeClinic);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'perfil'
                ? 'bg-[#6F2BCC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏥</span>
            <span>Clínica Activa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directorio')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directorio'
                ? 'bg-[#6F2BCC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📋</span>
            <span>Directorio ({clinicsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('nuevo');
              resetFormToBlank('veterinaria');
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'nuevo'
                ? 'bg-[#01FADA] text-[#2B017C] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>➕</span>
            <span>Registrar Nueva</span>
          </button>
        </div>
      </div>

      {/* 2. PESTAÑA: FICHA Y CONFIGURACIÓN DE LA CLÍNICA ACTIVA */}
      {activeTab === 'perfil' && activeClinic && (
        <div className="space-y-6">
          {/* BANNER DE RESUMEN DE LA CLÍNICA ACTIVA */}
          <div className="bg-gradient-to-r from-[#2B017C] via-[#3d02ad] to-[#6F2BCC] rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#01FADA]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  {activeClinic.type === 'independiente' ? '🩺' : '🏥'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#01FADA] text-[#2B017C]">
                      {activeClinic.type === 'independiente' ? 'Médico Veterinario Independiente' : 'Clínica Veterinaria (Empresa)'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                      Cuenta Activa en Sesión
                    </span>
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
                      <strong>Ciudad:</strong> {activeClinic.recoleccion?.ciudad}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón para editar / cancelar edición */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (!isEditing) populateFormFromClinic(activeClinic);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                    isEditing
                      ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      : 'bg-[#01FADA] text-[#2B017C] hover:bg-[#00e3c5] font-black'
                  }`}
                >
                  <span>{isEditing ? '✕ Cancelar Edición' : '✏️ Editar Datos de Veterinaria'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* VISTA 1: MODO VISUALIZACIÓN RÁPIDA (Tarjetas limpias y organizadas) */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Tarjeta 1: Contactos y Responsables */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-lg">👨‍⚕️</span>
                  <h3 className="text-sm font-extrabold text-[#2B017C]">
                    {activeClinic.type === 'independiente' ? 'Datos Profesionales' : 'Dirección Médica'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {activeClinic.type === 'veterinaria' ? (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Director Médico / Responsable del Área Médica
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm">
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
                          Médico Veterinario
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm">
                          {activeClinic.nombreMedico}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Tarjeta Profesional (COMVEZCOL)
                        </span>
                        <span className="font-mono font-extrabold text-[#6F2BCC] bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                          {activeClinic.tarjetaProfesional || 'Sin registro'}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Responsable del Área Administrativa
                    </span>
                    <span className="font-bold text-slate-800">
                      {activeClinic.administrativa?.nombreResponsable || 'No registrado'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Teléfono Responsable de Pagos
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                      <span>💬</span>
                      <span>{activeClinic.administrativa?.telefonoPagos || 'No registrado'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 italic block mt-0.5">
                      A este número se envían notificaciones de facturación.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Ubicación de Recolección (Repartidor / Logística) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-lg">🛵</span>
                  <h3 className="text-sm font-extrabold text-[#2B017C]">
                    Ubicación de Recolección
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Ciudad
                    </span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span>📍</span>
                      <span>{activeClinic.recoleccion?.ciudad || 'No seleccionada'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Dirección Física
                    </span>
                    <span className="font-extrabold text-[#2B017C] text-sm block mt-0.5">
                      {activeClinic.recoleccion?.direccionFisica || 'No registrada'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      Donde el repartidor recogerá las muestras.
                    </span>
                  </div>

                  {activeClinic.recoleccion?.detallesAdicionales && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                      <strong className="text-slate-700 block mb-0.5">Detalles de entrega:</strong>
                      {activeClinic.recoleccion.detallesAdicionales}
                    </div>
                  )}

                  <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100 text-[11px] text-[#2B017C] flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <span>Recolección refrigerada prioritaria garantizada por motorizados VetLab.</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Correos, Facturación & Documentación Legal */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-lg">📑</span>
                  <h3 className="text-sm font-extrabold text-[#2B017C]">
                    Facturación & Resultados
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Correo para Facturación Electrónica
                    </span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span>✉️</span>
                      <span>{activeClinic.correos?.facturacion || 'facturacion@veterinaria.com'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Correo para Reporte de Resultados qPCR
                    </span>
                    <span className="font-bold text-[#6F2BCC] flex items-center gap-1.5 mt-0.5">
                      <span>🔬</span>
                      <span>{activeClinic.correos?.resultados || 'resultados@veterinaria.com'}</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Número de RUT
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block mt-0.5">
                      {activeClinic.documentos?.rutNumero || 'Sin registrar'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Número de RUT sin puntos ni guiones.
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                      <span>🛡️</span>
                      <span>Habeas Data (Ley 1581)</span>
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                      Aceptado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 2: FORMULARIO DE EDICIÓN EN LÍNEA DE LA CLÍNICA ACTIVA */}
          {isEditing && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#2B017C]">
                    Editar Información de la Veterinaria Activa
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actualiza los datos institucionales, de recolección y facturación de la clínica.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Modo Edición
                </span>
              </div>

              {renderFormContent(false)}
            </div>
          )}
        </div>
      )}

      {/* 3. PESTAÑA: REGISTRAR NUEVA VETERINARIA / MÉDICO INDEPENDIENTE */}
      {activeTab === 'nuevo' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#01FADA]/30 text-[#007a6a] border border-[#01FADA]">
              Nuevo Registro
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#2B017C] mt-2 tracking-tight">
              Registrar Nueva Veterinaria o Médico Independiente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ingresa los datos del establecimiento o profesional para habilitar la solicitud y procesamiento de paneles moleculares qPCR.
            </p>
          </div>

          {renderFormContent(true)}
        </div>
      )}

      {/* 4. PESTAÑA: DIRECTORIO DE VETERINARIAS REGISTRADAS */}
      {activeTab === 'directorio' && (
        <div className="space-y-4">
          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-1 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, NIT, cédula, ciudad o dirección..."
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

          {/* Grid de Veterinarias */}
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
                              ★ Activa
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
                          RUT Empresa/Médico
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {clinic.documentos?.rutNumero}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Ubicación de Recolección (Repartidor)
                        </span>
                        <span className="font-semibold text-slate-800 block">
                          📍 {clinic.recoleccion?.ciudad} — {clinic.recoleccion?.direccionFisica}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Resp. Administrativo / Pagos:</span>
                        <span className="font-bold text-slate-700">
                          {clinic.administrativa?.telefonoPagos || 'No registrado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Reporte de Resultados:</span>
                        <span className="font-bold text-[#6F2BCC] truncate max-w-[200px]">
                          {clinic.correos?.resultados}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Muestras procesadas: <strong>{clinic.totalMuestrasHistoricas || 0}</strong>
                    </span>

                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => handleSelectActiveClinic(clinic.id)}
                        className="px-3.5 py-1.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Activar para Sesión</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#2B017C] flex items-center gap-1">
                        <span>✓</span>
                        <span>En uso</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClinics.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <span className="text-4xl block">🔍</span>
              <h3 className="text-base font-bold text-slate-800">
                No se encontraron veterinarias con el criterio de búsqueda
              </h3>
              <p className="text-xs text-slate-500">
                Prueba ajustando los términos de búsqueda o cambiando el filtro de tipo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /**
   * Renderiza el contenido del formulario para Crear o Editar
   */
  function renderFormContent(isNew) {
    const isVet = formData.type === 'veterinaria';

    return (
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SELECTOR CONDICIONAL: VETERINARIA VS MÉDICO INDEPENDIENTE */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Tipo de Registro / Cuenta en VetLab *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'veterinaria')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                formData.type === 'veterinaria'
                  ? 'bg-purple-50/70 border-[#6F2BCC] ring-2 ring-[#6F2BCC]/30 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6F2BCC] flex items-center justify-center text-xl shrink-0">
                🏥
              </div>
              <div>
                <span className="block font-black text-sm text-[#2B017C]">
                  Clínica Veterinaria (Empresa)
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block leading-relaxed">
                  Persona jurídica, centro veterinario o IPS con NIT, director médico y equipo administrativo.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleInputChange('type', 'independiente')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                formData.type === 'independiente'
                  ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl shrink-0">
                🩺
              </div>
              <div>
                <span className="block font-black text-sm text-[#2B017C]">
                  Médico Veterinario Independiente
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block leading-relaxed">
                  Profesional independiente, consulta externa o domiciliaria con Tarjeta Profesional COMVEZCOL y Cédula.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 1: DATOS SEGÚN TIPO (VETERINARIA VS MÉDICO INDEPENDIENTE) */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">{isVet ? '🏥' : '🩺'}</span>
            <h4 className="text-sm font-extrabold text-[#2B017C]">
              {isVet ? 'Información Básica de la Veterinaria' : 'Información del Médico Veterinario Independiente'}
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
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
                  placeholder="Ej. COMVEZCOL-28491 o Matrícula Profesional"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: ÁREA ADMINISTRATIVA */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">💼</span>
            <h4 className="text-sm font-extrabold text-[#2B017C]">
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                A este número se enviarán notificaciones de facturación.
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 3: UBICACIÓN DE RECOLECCIÓN (REPARTIDOR) */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🛵</span>
            <h4 className="text-sm font-extrabold text-[#2B017C]">
              Ubicación de Recolección
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Donde el repartidor recogerá las muestras.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Detalles adicionales para la entrega / recepción de muestras (Opcional)
              </label>
              <input
                type="text"
                value={formData.recoleccionDetalles}
                onChange={(e) => handleInputChange('recoleccionDetalles', e.target.value)}
                placeholder="Ej. Segundo piso, recepción de laboratorio, portería 24h con hielera..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: CORREOS ELECTRÓNICOS */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📧</span>
            <h4 className="text-sm font-extrabold text-[#2B017C]">
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 5: DOCUMENTOS LEGALES (RUT & TARJETA PROFESIONAL) */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📑</span>
            <h4 className="text-sm font-extrabold text-[#2B017C]">
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Número de RUT sin puntos ni guiones.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Adjunto de RUT en PDF o imagen (Opcional)
              </label>
              <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-700">
                <span>📎</span>
                <span className="truncate flex-1 font-mono text-[11px]">
                  {formData.rutArchivoNombre}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  Listo
                </span>
              </div>
            </div>

            {!isVet && (
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Tarjeta profesional (Copia de carnet COMVEZCOL)
                </label>
                <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-700">
                  <span>🎓</span>
                  <span className="truncate flex-1 font-mono text-[11px]">
                    {formData.tarjetaProfesionalArchivoNombre}
                  </span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                    Verificado
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 6: TÉRMINOS Y LEY 1581 HABEAS DATA COLOMBIA */}
        {/* ========================================================================= */}
        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/80 flex items-start gap-3">
          <input
            type="checkbox"
            id="terminosCheckbox"
            checked={formData.terminosAceptados}
            onChange={(e) => handleInputChange('terminosAceptados', e.target.checked)}
            className="mt-1 w-4 h-4 text-[#6F2BCC] rounded border-slate-300 focus:ring-[#6F2BCC] cursor-pointer"
          />
          <label htmlFor="terminosCheckbox" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
            Al registrarte, aceptas los <strong>Términos de Servicio</strong> y la <strong>Política de Privacidad</strong> de <strong>VetqPCR Lab</strong>. Tu información será tratada conforme a la <strong>Ley 1581 de 2012 (Habeas Data Colombia)</strong>.
          </label>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                populateFormFromClinic(activeClinic);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Guardando datos...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>{isNew ? 'Registrar Veterinaria' : 'Guardar Cambios de Perfil'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    );
  }
}
