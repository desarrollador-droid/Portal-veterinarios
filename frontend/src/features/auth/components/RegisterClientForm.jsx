import React, { useState } from 'react';

const SPECIALTIES_LIST = [
  'Neurología',
  'Ortopedia',
  'Endocrinología',
  'Oftalmología',
  'Dermatología',
  'Neumología',
  'Gastroenterología',
  'Cardiología',
  'Nefrología',
];

const PCR_FREQUENCIES = [
  '1 - 10 PCR al mes',
  '10 - 20 PCR al mes',
  '20 - 30 PCR al mes',
  '30 - 40 PCR al mes',
  '40 - 50 PCR al mes',
  'Más de 50 PCR al mes',
];

const REFERRAL_SOURCES = [
  'Voz a voz',
  'Instagram',
  'LinkedIn',
  'Página web',
  'Anuncios de google',
  'Visita comercial',
  'Tik Tok',
];

export default function RegisterClientForm({ onRegisterSubmit, onCancel, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    nit: '',
    contrasena: '',
    confirmarContrasena: '',
    nombreEmpresa: '',
    nombreDirectorMedico: '',
    telefonoDirectorMedico: '',
    nombreResponsablePagos: '',
    telefonoPagos: '',
    ciudad: '',
    direccionFisica: '',
    correoFacturacion: '',
    rutFileName: '',
    rutFileSize: '',
    // Encuesta y caracterización OSD
    capacitacionOSD: '',
    capacitacionQpcr: '',
    capacitacionQpcrOtro: '',
    cantidadVeterinarios: '',
    cuentaConEspecialistas: '',
    especialistas: [],
    frecuenciaPcrMensual: '',
    medioConocisteOSD: '',
    observaciones: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error al editar
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleToggleSpecialty = (specialty) => {
    setFormData((prev) => {
      const exists = prev.especialistas.includes(specialty);
      return {
        ...prev,
        especialistas: exists
          ? prev.especialistas.filter((s) => s !== specialty)
          : [...prev.especialistas, specialty],
      };
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        rutFileName: file.name,
        rutFileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      }));
    }
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        rutFileName: file.name,
        rutFileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.nit.trim()) {
      errors.push('NIT o Cédula de la empresa solicitante');
    }
    if (!formData.contrasena || !formData.contrasena.trim()) {
      errors.push('Contraseña o PIN de acceso para iniciar sesión');
    } else if (formData.contrasena.trim().length < 4) {
      errors.push('La contraseña o PIN debe tener al menos 4 caracteres');
    }
    if (formData.contrasena.trim() !== formData.confirmarContrasena.trim()) {
      errors.push('Las contraseñas o PIN ingresados no coinciden');
    }
    if (!formData.nombreEmpresa.trim()) {
      errors.push('Nombre de la empresa o médico veterinario independiente');
    }
    if (!formData.nombreDirectorMedico.trim()) {
      errors.push('Nombre del responsable del área médica o director médico');
    }
    if (!formData.telefonoDirectorMedico.trim()) {
      errors.push('Teléfono del director médico');
    }
    if (!formData.nombreResponsablePagos.trim()) {
      errors.push('Nombre del responsable del área administrativa o de pagos');
    }
    if (!formData.telefonoPagos.trim()) {
      errors.push('Teléfono del responsable de pagos');
    }
    if (!formData.ciudad.trim()) {
      errors.push('Ciudad de recolección');
    }
    if (!formData.direccionFisica.trim()) {
      errors.push('Dirección física');
    }
    if (!formData.correoFacturacion.trim()) {
      errors.push('Correo electrónico para facturación');
    }
    if (!formData.rutFileName.trim()) {
      errors.push('Archivo del RUT de la empresa o médico independiente');
    }
    if (!formData.capacitacionOSD) {
      errors.push('¿Usted y/o su equipo ha sido capacitado por OSD?');
    }
    if (!formData.capacitacionQpcr) {
      errors.push('¿Usted y su equipo han sido capacitados en el uso correcto de qPCR?');
    } else if (formData.capacitacionQpcr === 'Otro' && !formData.capacitacionQpcrOtro.trim()) {
      errors.push('Por favor especifique la respuesta en la opción "Otro" de capacitación qPCR');
    }
    if (!formData.medioConocisteOSD) {
      errors.push('¿Por cuál medio conociste a OSD?');
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      // Desplazar hacia la alerta de error
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    onRegisterSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* ENCABEZADO INSTITUCIONAL OSD (Al inicio del formulario)             */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-[#2B017C] via-[#4A148C] to-[#6F2BCC] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Adorno visual de fondo */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#01FADA]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#01FADA] text-xs font-black uppercase tracking-wider">
            <span>🧬</span> On Site Diagnostic · OSD
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            OSD - Formulario de creación de clientes
          </h2>

          <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed max-w-3xl">
            Bienvenidos a OSD, este formulario tiene como fin la recopilación de la información necesaria para la codificación y creación como clientes en nuestras bases de datos, es importante que diligencien en su totalidad la información sin errores para evitar inconvenientes futuros.
          </p>

          <div className="pt-3 border-t border-white/20 mt-4">
            <p className="text-xs font-semibold text-slate-200 mb-2">
              Cualquier duda, inquietud o sugerencia, puede ponerse en contacto con nosotros a las líneas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href="tel:3005143727"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold text-white group"
              >
                <span className="text-[#01FADA] text-sm group-hover:scale-110 transition-transform">📞</span>
                <span>Asesoría general: <strong className="text-[#01FADA] font-mono">3005143727</strong></span>
              </a>
              <a
                href="tel:3005143626"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold text-white group"
              >
                <span className="text-[#01FADA] text-sm group-hover:scale-110 transition-transform">🔬</span>
                <span>Asesoría técnica científica: <strong className="text-[#01FADA] font-mono">3005143626</strong></span>
              </a>
              <a
                href="tel:3005143701"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold text-white group"
              >
                <span className="text-[#01FADA] text-sm group-hover:scale-110 transition-transform">💼</span>
                <span>Asesoría Administrativa: <strong className="text-[#01FADA] font-mono">3005143701</strong></span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BANNER DE ERRORES / CAMPOS FALTANTES (ESTILO LLAMATIVO DESTACADO)   */}
      {/* ==================================================================== */}
      {formErrors.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/60 dark:to-amber-950/40 border-2 border-red-500/80 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
              ⚠️
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-red-900 dark:text-red-200 uppercase tracking-wide">
                Por favor completa los siguientes campos obligatorios (*):
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                Para garantizar la correcta codificación y facturación electrónica, estos campos deben ser diligenciados:
              </p>
              <ul className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-red-800 dark:text-red-300 font-semibold list-disc list-inside">
                {formErrors.map((err, idx) => (
                  <li key={idx} className="truncate">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==================================================================== */}
        {/* SECCIÓN 1: DATOS DE LA EMPRESA, FACTURACIÓN Y RUT                   */}
        {/* ==================================================================== */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="w-8 h-8 rounded-xl bg-[#6F2BCC]/10 text-[#6F2BCC] dark:text-[#01FADA] flex items-center justify-center font-black text-sm">
              1
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Datos de la Empresa, Facturación y Representantes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 1. NIT o Cédula */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                NIT o Cédula <span className="text-red-500 font-black">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Identificación correspondiente de la empresa solicitante del servicio
              </p>
              <input
                type="text"
                value={formData.nit}
                onChange={(e) => handleChange('nit', e.target.value)}
                placeholder="Ej. 900845129"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                <span>⚠️</span> *Tenga precaución de evitar errores de digitación.
              </p>
            </div>

            {/* 2. Nombre de la empresa o médico veterinario independiente */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Nombre de la empresa o médico veterinario independiente <span className="text-red-500 font-black">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Razón social registrada o nombre del profesional independiente
              </p>
              <input
                type="text"
                value={formData.nombreEmpresa}
                onChange={(e) => handleChange('nombreEmpresa', e.target.value)}
                placeholder="Ej. Clínica Veterinaria San Bernardo o Dr. Carlos Valencia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* Contraseña o PIN de acceso para iniciar sesión */}
            <div className="sm:col-span-1 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Contraseña o PIN de acceso <span className="text-red-500 font-black">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-[#6F2BCC] dark:text-[#01FADA] hover:underline cursor-pointer"
                >
                  {showPassword ? '🙈 Ocultar' : '👁️ Mostrar clave'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Clave con la que iniciarás sesión en el portal OSD (mínimo 4 caracteres)
              </p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.contrasena}
                  onChange={(e) => handleChange('contrasena', e.target.value)}
                  placeholder="Ej. 1234567 o ClaveSegura2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all pl-9"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                  🔒
                </span>
              </div>
            </div>

            {/* Confirmar contraseña o PIN de acceso */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Confirmar Contraseña o PIN <span className="text-red-500 font-black">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Vuelve a escribir la contraseña para confirmar
              </p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmarContrasena}
                  onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
                  placeholder="Repite la contraseña"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formData.confirmarContrasena && formData.contrasena !== formData.confirmarContrasena
                      ? 'border-red-400 dark:border-red-600 focus:ring-red-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-[#6F2BCC]'
                  } bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all pl-9`}
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                  🔑
                </span>
              </div>
              {formData.confirmarContrasena && formData.contrasena !== formData.confirmarContrasena && (
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {/* 3. Nombre del responsable del área médica o director médico */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Nombre del responsable del área médica o director médico <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="text"
                value={formData.nombreDirectorMedico}
                onChange={(e) => handleChange('nombreDirectorMedico', e.target.value)}
                placeholder="Ej. Dr. Alejandro Morales Restrepo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* 4. Teléfono del director médico */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Teléfono del director médico <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefonoDirectorMedico}
                onChange={(e) => handleChange('telefonoDirectorMedico', e.target.value)}
                placeholder="Ej. 3104567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* 5. Nombre del responsable del área administrativa o de facturación y pagos */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Nombre del responsable del área administrativa o de facturación y pagos <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="text"
                value={formData.nombreResponsablePagos}
                onChange={(e) => handleChange('nombreResponsablePagos', e.target.value)}
                placeholder="Ej. Dra. Marcela Restrepo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* 6. Teléfono del responsable de pagos */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Teléfono del responsable de pagos <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefonoPagos}
                onChange={(e) => handleChange('telefonoPagos', e.target.value)}
                placeholder="Ej. 3157891234"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* 7. Ciudad */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Ciudad <span className="text-red-500 font-black">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cuidad desde la cual se requiere la recolección.
              </p>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                placeholder="Ej. Bogotá D.C., Medellín, Cali, Barranquilla..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* 8. Dirección física */}
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Dirección física <span className="text-red-500 font-black">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dirección exacta donde se prestará el servicio o recogerán las muestras
              </p>
              <input
                type="text"
                value={formData.direccionFisica}
                onChange={(e) => handleChange('direccionFisica', e.target.value)}
                placeholder="Ej. Calle 80 # 15-32, Consultorio 204"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* 9. Correo electrónico para facturación */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Correo electrónico para facturación <span className="text-red-500 font-black">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A este correo que proporciones se realizará la facturación electrónica correspondiente
              </p>
              <input
                type="email"
                value={formData.correoFacturacion}
                onChange={(e) => handleChange('correoFacturacion', e.target.value)}
                placeholder="facturacion@tuveterinaria.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>

            {/* 10. RUT de la empresa o médico veterinario independiente */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                RUT de la empresa o médico veterinario independiente <span className="text-red-500 font-black">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sube 1 archivo compatible. Tamaño máximo: 10 GB.
              </p>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDropFile}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDragOver
                    ? 'border-[#6F2BCC] bg-[#6F2BCC]/5 dark:bg-[#6F2BCC]/10'
                    : formData.rutFileName
                    ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-[#6F2BCC] bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <input
                  type="file"
                  id="rut-file-input"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                />

                {formData.rutFileName ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="text-3xl">📄</span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {formData.rutFileName}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Archivo cargado correctamente ({formData.rutFileSize || 'Listo para procesar'})
                      </p>
                    </div>
                    <label
                      htmlFor="rut-file-input"
                      className="ml-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all"
                    >
                      Cambiar archivo
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-[#6F2BCC]/10 text-[#6F2BCC] dark:text-[#01FADA] flex items-center justify-center text-xl">
                      📤
                    </div>
                    <div>
                      <label
                        htmlFor="rut-file-input"
                        className="text-xs font-bold text-[#6F2BCC] dark:text-[#01FADA] hover:underline cursor-pointer"
                      >
                        Haz clic aquí para seleccionar el archivo RUT
                      </label>
                      <span className="text-xs text-slate-500 dark:text-slate-400"> o arrástralo y suéltalo aquí</span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Formatos compatibles: PDF, PNG, JPG, JPEG (Máx. 10 GB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* PRIMERA IMAGEN: DESPUÉS DE SUBIR EL RUT                             */}
        {/* ==================================================================== */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-850">
          <img
            src="/osd-servicio-personalizado.png"
            alt="Servicio Personalizado On Site Diagnostic OSD"
            className="w-full h-auto object-cover max-h-[380px]"
          />
        </div>

        {/* ==================================================================== */}
        {/* SECCIÓN 2: ENCUESTA DE PERSONALIZACIÓN Y qPCR OSD                   */}
        {/* ==================================================================== */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="w-8 h-8 rounded-xl bg-[#01FADA]/20 text-[#008d7a] dark:text-[#01FADA] flex items-center justify-center font-black text-sm">
              2
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Personalización del Servicio Diagnóstico y Diagnóstico Molecular qPCR
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Te invitamos a responder estas preguntas para adaptar la asesoría técnico-científica a tus requerimientos.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 11. ¿Usted y/o su equipo ha sido capacitado por OSD? */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                ¿Usted y/o su equipo ha sido capacitado por OSD? <span className="text-red-500 font-black">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Sí', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChange('capacitacionOSD', opt)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      formData.capacitacionOSD === opt
                        ? 'bg-[#6F2BCC] text-white border-[#6F2BCC] shadow-md shadow-[#6F2BCC]/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{formData.capacitacionOSD === opt ? '🔘' : '⚪'}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 12. ¿Usted y su equipo han sido capacitados en el uso correcto de qPCR para diagnóstico veterinario? */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                ¿Usted y su equipo han sido capacitados en el uso correcto de qPCR para diagnóstico veterinario? <span className="text-red-500 font-black">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Si, pero me gustaría volver a ser capacitado',
                  'Si, por el momento no me interesa otra capacitación',
                  'No, nunca la he recibido',
                  'Otro',
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChange('capacitacionQpcr', opt)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center gap-2.5 cursor-pointer border ${
                      formData.capacitacionQpcr === opt
                        ? 'bg-[#6F2BCC] text-white border-[#6F2BCC] shadow-md shadow-[#6F2BCC]/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="shrink-0">{formData.capacitacionQpcr === opt ? '🔘' : '⚪'}</span>
                    <span>{opt === 'Otro' ? 'Otro:' : opt}</span>
                  </button>
                ))}
              </div>

              {formData.capacitacionQpcr === 'Otro' && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={formData.capacitacionQpcrOtro}
                    onChange={(e) => handleChange('capacitacionQpcrOtro', e.target.value)}
                    placeholder="Especifique su situación con respecto a capacitaciones en qPCR..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* 13. ¿Con cuántos médicos veterinarios cuenta el centro veterinario o la empresa? (menú desplegable) */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                ¿Con cuántos médicos veterinarios cuenta el centro veterinario o la empresa?
              </label>
              <select
                value={formData.cantidadVeterinarios}
                onChange={(e) => handleChange('cantidadVeterinarios', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all cursor-pointer"
              >
                <option value="">Seleccione una opción del menú desplegable...</option>
                <option value="1 médico veterinario">1 médico veterinario (profesional independiente)</option>
                <option value="2 a 3 médicos veterinarios">2 a 3 médicos veterinarios</option>
                <option value="4 a 6 médicos veterinarios">4 a 6 médicos veterinarios</option>
                <option value="7 a 10 médicos veterinarios">7 a 10 médicos veterinarios</option>
                <option value="Más de 10 médicos veterinarios">Más de 10 médicos veterinarios</option>
              </select>
            </div>

            {/* 14. ¿El centro veterinario cuenta con especialistas o usted es especialista? */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                ¿El centro veterinario cuenta con especialistas o usted es especialista?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Sí', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChange('cuentaConEspecialistas', opt)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      formData.cuentaConEspecialistas === opt
                        ? 'bg-[#6F2BCC] text-white border-[#6F2BCC] shadow-md shadow-[#6F2BCC]/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{formData.cuentaConEspecialistas === opt ? '🔘' : '⚪'}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 15. ¿Con qué especialistas cuenta el centro veterinario? */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  ¿Con qué especialistas cuenta el centro veterinario?
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Seleccione todas las que apliquen
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPECIALTIES_LIST.map((spec) => {
                  const isChecked = formData.especialistas.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleToggleSpecialty(spec)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center gap-2 cursor-pointer border ${
                        isChecked
                          ? 'bg-[#01FADA]/15 text-[#2B017C] dark:text-[#01FADA] border-[#01FADA] shadow-2xs font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm">{isChecked ? '☑️' : '⬜'}</span>
                      <span>{spec}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 16. ¿Cuál es la frecuencia promedio de uso de PCR mensual en la clínica o como profesional independiente? */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                ¿Cuál es la frecuencia promedio de uso de PCR mensual en la clínica o como profesional independiente?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PCR_FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => handleChange('frecuenciaPcrMensual', freq)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border text-left ${
                      formData.frecuenciaPcrMensual === freq
                        ? 'bg-[#6F2BCC] text-white border-[#6F2BCC] shadow-md shadow-[#6F2BCC]/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{formData.frecuenciaPcrMensual === freq ? '🔘' : '⚪'}</span>
                    <span className="truncate">{freq}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 17. ¿Por cuál medio conociste a OSD? */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                ¿Por cuál medio conociste a OSD? <span className="text-red-500 font-black">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {REFERRAL_SOURCES.map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => handleChange('medioConocisteOSD', source)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border text-left ${
                      formData.medioConocisteOSD === source
                        ? 'bg-[#6F2BCC] text-white border-[#6F2BCC] shadow-md shadow-[#6F2BCC]/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{formData.medioConocisteOSD === source ? '🔘' : '⚪'}</span>
                    <span className="truncate">{source}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 18. Observaciones */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Observaciones
              </label>
              <textarea
                rows={3}
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Indica observaciones particulares, requerimientos específicos de toma de muestras o logística..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SEGUNDA IMAGEN: AL FINALIZAR EL FORMULARIO                           */}
        {/* ==================================================================== */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-850">
          <img
            src="/osd-gracias-confianza.png"
            alt="Gracias por confiar en On Site Diagnostic"
            className="w-full h-auto object-cover max-h-[380px]"
          />
        </div>

        {/* ==================================================================== */}
        {/* ACCIONES Y BOTÓN DE ENVÍO                                           */}
        {/* ==================================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-extrabold transition-all cursor-pointer"
            >
              ← Volver a inicio de sesión
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer ml-auto ${
              isSubmitting
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#2B017C] to-[#6F2BCC] hover:from-[#240068] hover:to-[#5e22b0] shadow-[#6F2BCC]/30 hover:scale-[1.01]'
            }`}
          >
            <span>{isSubmitting ? 'Registrando cliente en base de datos...' : 'Crear cliente y acceder al portal OSD'}</span>
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
