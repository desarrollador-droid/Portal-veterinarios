import React, { useState, useEffect } from 'react';
import { clinicApi, VETERINARY_SPECIALTIES } from '../../dashboard/services/clinicApi.js';
import { showAestheticAlert } from '../../dashboard/components/AestheticModal.jsx';

export default function RegisterVeterinarianForm({ onBackToLogin }) {
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    clinicNit: '',
    clinicId: '',
    sedeId: '',
    nombre: '',
    cedula: '',
    tarjetaProfesional: '',
    especialidad: 'Medicina General',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    aceptaComvezcol: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Estado de éxito: Pantalla de Bienvenida y Espera de Aprobación
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  useEffect(() => {
    loadAvailableClinics();
  }, []);

  const loadAvailableClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await clinicApi.getClinics();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setClinics(list);
    } catch (_) {
      setGeneralError('No se pudieron cargar las clínicas veterinarias disponibles.');
    } finally {
      setLoadingClinics(false);
    }
  };

  const cleanNumber = (v) => (v ? String(v).replace(/[^0-9]/g, '').trim() : '');

  const matchedClinic = clinics.find((c) => {
    const qClean = cleanNumber(formData.clinicNit);
    if (!qClean || qClean.length < 5) return false;
    return cleanNumber(c.nit) === qClean || cleanNumber(c.cedula) === qClean;
  }) || null;

  const handleNitChange = (e) => {
    const raw = e.target.value;
    const clean = cleanNumber(raw);
    const matched = clean.length >= 5 ? clinics.find((c) => cleanNumber(c.nit) === clean || cleanNumber(c.cedula) === clean) : null;

    setFormData((prev) => ({
      ...prev,
      clinicNit: raw,
      clinicId: matched ? matched.id : '',
      sedeId: matched?.sedes?.[0]?.id || '',
    }));

    if (validationErrors.clinicNit) {
      setValidationErrors((prev) => ({ ...prev, clinicNit: false }));
    }
    if (generalError) setGeneralError('');
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setGeneralError('');

    const errors = {};
    if (!formData.clinicNit.trim() || !matchedClinic) errors.clinicNit = true;
    if (!formData.nombre.trim()) errors.nombre = true;
    if (!formData.cedula.trim()) errors.cedula = true;
    if (!formData.tarjetaProfesional.trim()) errors.tarjetaProfesional = true;
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = true;
    if (!formData.telefono.trim()) errors.telefono = true;
    if (!formData.password || formData.password.length < 6) errors.password = true;
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = true;
    if (!formData.aceptaComvezcol) errors.aceptaComvezcol = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (errors.clinicNit) {
        setGeneralError('Debes ingresar el NIT válido de una clínica veterinaria registrada.');
      } else if (errors.confirmPassword) {
        setGeneralError('Las contraseñas no coinciden. Por favor verifica.');
      } else if (errors.password) {
        setGeneralError('La contraseña debe tener mínimo 6 caracteres.');
      } else if (errors.aceptaComvezcol) {
        setGeneralError('Debes aceptar la declaración de matrícula profesional COMVEZCOL.');
      } else {
        setGeneralError('Por favor completa todos los campos requeridos marcados en rojo.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const targetClinic = matchedClinic;
      const selectedSede = targetClinic?.sedes?.find((s) => s.id === formData.sedeId) || targetClinic?.sedes?.[0];

      const vetPayload = {
        nombre: formData.nombre.trim(),
        cedula: formData.cedula.trim(),
        tarjetaProfesional: formData.tarjetaProfesional.trim(),
        especialidad: formData.especialidad || 'Medicina General',
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        contrasena: formData.password,
        rol: 'veterinario_planta',
        sedeId: selectedSede?.id || '',
        sedeNombre: selectedSede?.nombreSede || 'Sede Principal',
        estado: 'pendiente_aprobacion', // Requiere validación del admin
        fechaSolicitud: new Date().toISOString(),
      };

      await clinicApi.addVeterinarian(targetClinic.id, vetPayload);

      setRegisteredData({
        ...vetPayload,
        clinicNombre: targetClinic?.nombreVeterinaria || targetClinic?.nombreMedico || 'Clínica Veterinaria',
        clinicNit: targetClinic?.nit || targetClinic?.cedula || '',
        clinicCiudad: targetClinic?.recoleccion?.ciudad || '',
      });
      setRegistrationSuccess(true);
    } catch (err) {
      setGeneralError(err.message || 'Error registrando la cuenta de veterinario asociado.');
      showAestheticAlert({
        title: 'Error de Registro',
        message: err.message || 'No se pudo radicar la cuenta. Intente nuevamente.',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // PANTALLA EXCLUSIVA DE BIENVENIDA Y ESPERA DE APROBACIÓN POR EL ADMINISTRADOR
  // =========================================================================
  if (registrationSuccess && registeredData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
          {/* Ícono de Bienvenida y Celebración */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#2B017C] via-[#6F2BCC] to-[#01FADA] flex items-center justify-center text-white text-4xl shadow-xl shadow-[#6F2BCC]/30 animate-bounce">
            🩺
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 inline-flex items-center gap-1.5 animate-pulse">
              <span>🟡</span> Estado: Pendiente de Aprobación
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2B017C] dark:text-white tracking-tight">
              ¡Bienvenido(a) Dr(a). {registeredData.nombre}!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
              Tu cuenta como <strong className="text-[#6F2BCC] dark:text-[#01FADA]">Médico Veterinario Asociado</strong> ha sido creada exitosamente vinculada a{' '}
              <strong className="text-slate-900 dark:text-white">{registeredData.clinicNombre}</strong>.
            </p>
          </div>

          {/* Tarjeta de Resumen de la Solicitud Radicada */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                Datos de la Solicitud Radicada
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                {new Date().toLocaleDateString('es-CO')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Veterinaria / Clínica:</span>
                <strong className="text-slate-900 dark:text-white text-xs">{registeredData.clinicNombre}</strong>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {registeredData.sedeNombre} · {registeredData.clinicCiudad}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Especialidad:</span>
                <strong className="text-slate-900 dark:text-white text-xs">{registeredData.especialidad}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Matrícula COMVEZCOL:</span>
                <strong className="font-mono text-[#6F2BCC] dark:text-[#01FADA] text-xs">
                  TP {registeredData.tarjetaProfesional}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Cédula de Ciudadanía:</span>
                <strong className="font-mono text-slate-900 dark:text-white text-xs">
                  {registeredData.cedula}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Correo Registrado:</span>
                <span className="text-slate-800 dark:text-slate-200">{registeredData.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Teléfono / WhatsApp:</span>
                <span className="text-slate-800 dark:text-slate-200">{registeredData.telefono}</span>
              </div>
            </div>
          </div>

          {/* Mensaje Informativo Oficial */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">ℹ️</span>
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1 leading-relaxed">
              <strong className="font-bold block">¿Qué sigue ahora?</strong>
              <p>
                Por normatividad médica y control de acceso en la red diagnóstica OSD, el Administrador o Director Médico de{' '}
                <strong>{registeredData.clinicNombre}</strong> debe validar tus credenciales profesionales y autorizar tu perfil en el panel de control de la clínica.
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Tan pronto el administrador apruebe tu solicitud, podrás ingresar directamente con tu número de identificación (cédula) y la contraseña que acabas de configurar.
              </p>
            </div>
          </div>

          {/* Botón para volver al Inicio de Sesión */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2B017C] to-[#6F2BCC] hover:from-[#240068] hover:to-[#5e22b0] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#6F2BCC]/30 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>←</span>
              <span>Volver a la pantalla de Inicio de Sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FORMULARIO DE REGISTRO DE VETERINARIO ASOCIADO
  // =========================================================================
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-[#2B017C] to-[#6F2BCC] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#6F2BCC]/30">
            🩺
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Registro de Médico Veterinario Asociado
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Crea tu perfil profesional vinculado a tu veterinaria de trabajo para solicitar y consultar exámenes diagnósticos.
          </p>
        </div>

        {generalError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 flex items-start gap-3 text-xs text-red-800 dark:text-red-200 animate-in fade-in duration-150">
            <span className="text-base shrink-0">⚠️</span>
            <div className="flex-1 font-semibold leading-relaxed">{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECCIÓN 1: VINCULACIÓN A CLÍNICA VETERINARIA MEDIANTE NIT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/60 dark:bg-[#1a1338]/80 border border-purple-200/80 dark:border-[#2e2358] space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6F2BCC] dark:text-[#01FADA] flex items-center gap-1.5">
              <span>🏢</span> 1. Clínica o Veterinaria de Trabajo
            </span>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  NIT de la Veterinaria / Clínica a la que perteneces *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.clinicNit}
                    onChange={handleNitChange}
                    placeholder="Ingresa el NIT de la veterinaria (ej. 900845129)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] transition-all pl-9 ${
                      validationErrors.clinicNit
                        ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🏢</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Digita el NIT sin puntos ni dígito de verificación. El sistema verificará la veterinaria en tiempo real.
                </p>
              </div>

              {/* Si la clínica fue encontrada con éxito */}
              {matchedClinic && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                        ✓
                      </span>
                      <div>
                        <strong className="text-emerald-950 dark:text-emerald-200 block text-xs">
                          {matchedClinic.nombreVeterinaria || matchedClinic.nombreMedico}
                        </strong>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                          NIT: {matchedClinic.nit || matchedClinic.cedula} · {matchedClinic.recoleccion?.ciudad || 'Colombia'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      Clínica Encontrada
                    </span>
                  </div>

                  {/* Selector de Sede si la clínica cuenta con múltiples sedes */}
                  {matchedClinic.sedes && matchedClinic.sedes.length > 1 && (
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 space-y-1">
                      <label className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">
                        Sede donde operas:
                      </label>
                      <select
                        value={formData.sedeId}
                        onChange={(e) => handleChange('sedeId', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white outline-none cursor-pointer"
                      >
                        {matchedClinic.sedes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombreSede} ({s.ciudad})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Si ingresó caracteres pero no se encontró */}
              {formData.clinicNit.trim().length >= 5 && !matchedClinic && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="text-base shrink-0">⚠️</span>
                  <span>No se encontró ninguna clínica veterinaria registrada con el NIT <strong>{formData.clinicNit}</strong>. Verifica el número con el administrador de tu clínica.</span>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL MÉDICO VETERINARIO */}
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              2. Datos Personales & Profesionales
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej. Dr(a). Camila Restrepo"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] ${
                    validationErrors.nombre
                      ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Cédula de Ciudadanía *
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => handleChange('cedula', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ej. 1020456789"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] ${
                    validationErrors.cedula
                      ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Tarjeta Profesional COMVEZCOL *
                </label>
                <input
                  type="text"
                  value={formData.tarjetaProfesional}
                  onChange={(e) => handleChange('tarjetaProfesional', e.target.value)}
                  placeholder="Ej. 24891-CO"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] ${
                    validationErrors.tarjetaProfesional
                      ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Especialidad Médica *
                </label>
                <select
                  value={formData.especialidad}
                  onChange={(e) => handleChange('especialidad', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] cursor-pointer"
                >
                  {VETERINARY_SPECIALTIES.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ej. camila.restrepo@clinicavet.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] ${
                    validationErrors.email
                      ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Teléfono Móvil / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="Ej. 3104567890"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] ${
                    validationErrors.telefono
                      ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: CONTRASEÑA DE ACCESO */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                3. Credenciales de Ingreso al Portal
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-bold text-[#6F2BCC] dark:text-[#01FADA] hover:underline cursor-pointer"
              >
                {showPassword ? '🙈 Ocultar claves' : '👁️ Ver claves'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Contraseña (mínimo 6 caracteres) *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] ${
                    validationErrors.password
                      ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Confirmar Contraseña *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#6F2BCC] ${
                    validationErrors.confirmPassword
                      ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* DECLARACIÓN COMVEZCOL */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            validationErrors.aceptaComvezcol
              ? 'border-red-500 bg-red-50/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
          }`}>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formData.aceptaComvezcol}
                onChange={(e) => handleChange('aceptaComvezcol', e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#6F2BCC] focus:ring-[#6F2BCC] cursor-pointer"
              />
              <span className="leading-snug">
                Declaro bajo juramento que cuento con Matrícula Profesional vigente expedida por COMVEZCOL y solicito mi vinculación oficial a la clínica seleccionada. Comprendo que la cuenta quedará <strong className="text-[#6F2BCC] dark:text-[#01FADA]">pendiente de aprobación por el Administrador</strong> antes de habilitar el ingreso.
              </span>
            </label>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#2B017C] to-[#6F2BCC] hover:from-[#240068] hover:to-[#5e22b0] shadow-[#6F2BCC]/30 hover:scale-[1.01]'
              }`}
            >
              <span>{isSubmitting ? 'Radicando solicitud...' : 'Crear Cuenta de Veterinario Asociado'}</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
