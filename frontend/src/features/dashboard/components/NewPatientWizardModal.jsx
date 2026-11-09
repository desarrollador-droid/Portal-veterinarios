import React, { useState, useMemo, useEffect } from 'react';
import { colombiaGeoApi } from '../services/colombiaGeoApi.js';
import { clinicApi } from '../services/clinicApi.js';

export const calculateAgeFromBirthDate = (birthDateString) => {
  if (!birthDateString) return '';
  const birth = new Date(birthDateString);
  const now = new Date();
  if (isNaN(birth.getTime())) return '';

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? `, ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
  }
  return `${months} ${months === 1 ? 'mes' : 'meses'}`;
};

export const DOCUMENT_TYPES = ['C.C.', 'C.E.', 'Pasaporte', 'NIT', 'T.I.'];

export const COLOMBIA_DEPARTMENTS = colombiaGeoApi.getDepartmentsSync().map((d) => d.name);

export const DOG_BREEDS = [
  'Criollo / Mestizo',
  'Labrador Retriever',
  'Golden Retriever',
  'Bulldog Francés',
  'Poodle (Caniche)',
  'Pastor Alemán',
  'Beagle',
  'Chihuahua',
  'Schnauzer',
  'Yorkshire Terrier',
  'Pitbull Terrier',
  'Shih Tzu',
  'Pug (Carlino)',
  'Rottweiler',
  'Boxer',
  'Pomerania',
  'Husky Siberiano',
  'Border Collie',
  'Dálmata',
  'Doberman',
  'Cocker Spaniel',
  'Dachshund (Teckel)',
  'Gran Danés',
  'Bichón Maltés',
  'San Bernardo',
  'Sin raza definida',
];

export const CAT_BREEDS = [
  'Criollo / Mestizo',
  'Siamés',
  'Persa',
  'Bengalí',
  'Maine Coon',
  'Angora Turco',
  'Ragdoll',
  'Sphynx (Esfinge)',
  'British Shorthair',
  'Azul Ruso',
  'Abisinio',
  'Birmano',
  'Bombay',
  'Scottish Fold',
  'Común Europeo',
  'Sin raza definida',
];

export default function NewPatientWizardModal({ onClose, onCreated }) {
  // Wizard simplificado de 3 etapas:
  // 1: Registro del tutor / propietario
  // 2: Información básica de la mascota
  // 3: Resumen y confirmación (Guardar o Guardar y Solicitar Muestra qPCR)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [activeClinic, setActiveClinic] = useState(null);

  const [formData, setFormData] = useState({
    // ETAPA 1: DATOS DEL TUTOR / PROPIETARIO
    ownerFirstName: '',
    ownerLastName: '',
    ownerDocumentType: 'C.C.',
    ownerDocumentNumber: '',
    ownerPhone: '',
    ownerEmergencyPhone: '',
    ownerEmail: '',
    ownerDepartment: '',
    ownerCity: '',
    ownerAddress: '',
    ownerStratum: '',
    ownerHasVetPlus: false,
    ownerVetPlusCode: '',

    // SEDE / SUCURSAL DE ADMISIÓN
    sedeId: '',
    sedeNombre: '',
    codigoSedeNit: '',

    // ETAPA 2: INFORMACIÓN BÁSICA DE LA MASCOTA
    name: '',
    species: '', // Canino | Felino | Otro
    otherSpecies: '',
    breed: '',
    sex: '', // Hembra | Macho
    birthDate: '',
    weight: '',
    isSterilized: null, // true | false | null
    hasAllergies: false,
    allergies: '',
    hasMicrochip: false,
    microchipNumber: '',
    medicalBackground: '',
  });

  useEffect(() => {
    clinicApi.getActiveClinic().then((c) => {
      setActiveClinic(c);
      if (c?.sedes?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          sedeId: prev.sedeId || c.sedes[0].id,
          sedeNombre: prev.sedeNombre || c.sedes[0].nombreSede,
          codigoSedeNit: prev.codigoSedeNit || c.sedes[0].codigoSedeNit || '#nit-1',
        }));
      }
    }).catch(() => {});
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);

  const availableBreeds = useMemo(() => {
    if (formData.species === 'Canino') return DOG_BREEDS;
    if (formData.species === 'Felino') return CAT_BREEDS;
    return [...DOG_BREEDS, ...CAT_BREEDS];
  }, [formData.species]);

  const filteredBreedsList = useMemo(() => {
    const q = (formData.breed || '').toLowerCase().trim();
    if (!q) return availableBreeds;
    return availableBreeds.filter((b) => b.toLowerCase().includes(q));
  }, [availableBreeds, formData.breed]);

  const calculatedAge = calculateAgeFromBirthDate(formData.birthDate);
  const hasTypedName = formData.name.trim().length > 0;
  const fullPatientName = hasTypedName
    ? `${formData.name.trim()} ${formData.ownerLastName.trim()}`.trim()
    : '';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ownerDepartment') {
      const citiesInDept = colombiaGeoApi.getCitiesByDepartmentSync(value);
      setFormData((prev) => ({
        ...prev,
        ownerDepartment: value,
        ownerCity: citiesInDept[0]?.name || '',
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumericChange = (fieldName, allowDecimal = false) => (e) => {
    let val = e.target.value;
    if (allowDecimal) {
      val = val.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) {
        val = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      val = val.replace(/\D/g, '');
    }
    setFormData((prev) => ({
      ...prev,
      [fieldName]: val,
    }));
  };

  const [formAlert, setFormAlert] = useState(null);

  const triggerAlert = (message, fieldName = null) => {
    setFormAlert({ message, fieldName });
    const modalContainer = document.getElementById('new-patient-modal-content');
    if (modalContainer) {
      modalContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    setFormAlert(null);
    if (currentStep === 1) {
      if (!formData.ownerFirstName.trim() || !formData.ownerLastName.trim() || !formData.ownerPhone.trim()) {
        triggerAlert('Por favor complete nombres, apellidos y teléfono principal del tutor.', 'ownerPhone');
        return;
      }
      if (!formData.ownerDocumentType) {
        triggerAlert('Por favor seleccione el tipo de documento del tutor.', 'ownerDocumentType');
        return;
      }
      if (!formData.ownerDocumentNumber.trim()) {
        triggerAlert('Por favor ingrese el número de documento del tutor.', 'ownerDocumentNumber');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.name.trim()) {
        triggerAlert('Por favor ingrese el nombre del paciente.', 'name');
        return;
      }
      if (!formData.species) {
        triggerAlert('Por favor seleccione la especie (Canino, Felino u Otro).', 'species');
        return;
      }
      if (formData.species === 'Otro' && !formData.otherSpecies.trim()) {
        triggerAlert('Por favor especifique la especie en el campo correspondiente.', 'otherSpecies');
        return;
      }
      if (!formData.breed.trim()) {
        triggerAlert('Por favor seleccione o escriba la raza de la mascota.', 'breed');
        return;
      }
      if (!formData.sex) {
        triggerAlert('Por favor seleccione el sexo del paciente.', 'sex');
        return;
      }
      if (!formData.birthDate) {
        triggerAlert('Por favor ingrese la fecha de nacimiento de la mascota.', 'birthDate');
        return;
      }

      // Validar fecha futura
      const today = new Date().toISOString().split('T')[0];
      if (formData.birthDate > today) {
        triggerAlert('La fecha de nacimiento no puede ser una fecha futura.', 'birthDate');
        return;
      }

      if (formData.hasAllergies && !formData.allergies.trim()) {
        triggerAlert('Por favor describa las alergias conocidas del paciente.', 'allergies');
        return;
      }

      if (formData.hasMicrochip && !formData.microchipNumber.trim()) {
        triggerAlert('Por favor ingrese el número del microchip.', 'microchipNumber');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (requestExamDirectly = false) => {
    setSubmitting(true);
    try {
      const finalSpecies = formData.species === 'Otro' ? formData.otherSpecies.trim() : formData.species;
      const avatarIcon = finalSpecies.toLowerCase().includes('felin')
        ? '🐱'
        : finalSpecies.toLowerCase().includes('canin')
        ? '🐶'
        : '🐾';

      const payload = {
        name: formData.name.trim(),
        lastName: formData.ownerLastName.trim(),
        avatar: avatarIcon,
        species: finalSpecies,
        breed: formData.breed.trim(),
        sex: formData.sex,
        birthDate: formData.birthDate,
        age: calculatedAge,
        weight: formData.weight.trim()
          ? (formData.weight.trim().toLowerCase().includes('kg') ? formData.weight.trim() : `${formData.weight.trim()} kg`)
          : '',
        isSterilized: formData.isSterilized === null ? false : Boolean(formData.isSterilized),
        hasAllergies: Boolean(formData.hasAllergies),
        allergies: formData.hasAllergies ? formData.allergies.trim() : '',
        medicalBackground: formData.medicalBackground.trim(),

        // Microchip
        hasMicrochip: Boolean(formData.hasMicrochip),
        microchipNumber: formData.hasMicrochip ? formData.microchipNumber.trim() : '',

        // Tutor
        ownerFirstName: formData.ownerFirstName.trim(),
        ownerLastName: formData.ownerLastName.trim(),
        ownerDocumentType: formData.ownerDocumentType,
        ownerDocumentNumber: formData.ownerDocumentNumber.trim(),
        ownerDocument: `${formData.ownerDocumentType} ${formData.ownerDocumentNumber.trim()}`.trim(),
        ownerName: `${formData.ownerFirstName.trim()} ${formData.ownerLastName.trim()}`.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        ownerEmergencyPhone: formData.ownerEmergencyPhone.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerDepartment: formData.ownerDepartment,
        ownerCity: formData.ownerCity.trim(),
        ownerAddress: formData.ownerAddress.trim(),
        ownerStratum: formData.ownerStratum,
        ownerHasVetPlus: Boolean(formData.ownerHasVetPlus),
        ownerVetPlusCode: formData.ownerVetPlusCode.trim(),

        // Sede / Sucursal
        sedeId: formData.sedeId || (activeClinic?.sedes?.[0]?.id || 'sede-principal-80'),
        sedeNombre: formData.sedeNombre || (activeClinic?.sedes?.[0]?.nombreSede || 'Sede Principal'),
        codigoSedeNit: formData.codigoSedeNit || (activeClinic?.sedes?.[0]?.codigoSedeNit || '#nit-1'),

        status: 'activo',
        requestExam: requestExamDirectly,
      };

      await onCreated(payload);
      onClose();
    } catch (err) {
      triggerAlert(err.message || 'Error registrando paciente');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsMetadata = [
    { num: 1, title: 'Tutor / Propietario', icon: '👤' },
    { num: 2, title: 'Información Básica', icon: '🐾' },
    { num: 3, title: 'Resumen & Confirmación', icon: '📋' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera Wizard */}
        <div className="bg-[#2B017C] text-white px-6 sm:px-8 py-4.5 border-b border-[#01FADA]/30 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                Registro de Nuevo Paciente
              </h3>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Etapa {currentStep} de {totalSteps}: <strong className="text-white">{stepsMetadata[currentStep - 1]?.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white font-bold text-2xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Stepper horizontal con las 3 etapas */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 overflow-x-auto shrink-0">
          <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
            {stepsMetadata.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < currentStep) {
                    setCurrentStep(st.num);
                  }
                }}
                className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === st.num
                    ? 'bg-[#6F2BCC] text-white shadow-xs'
                    : st.num < currentStep
                    ? 'bg-sky-100 text-sky-800 hover:bg-sky-200 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === st.num ? 'bg-white text-[#6F2BCC] font-black' : st.num < currentStep ? 'bg-sky-200 text-sky-900' : 'bg-slate-200 text-slate-500'
                }`}>
                  {st.num < currentStep ? '✓' : st.num}
                </span>
                <span>{st.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor con scroll para los formularios */}
        <div id="new-patient-modal-content" className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Banner de Alerta Visual Diseñada para Campos Pendientes */}
          {formAlert && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                  ⚠️
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Campo Requerido Pendiente
                  </h4>
                  <p className="text-xs font-bold text-amber-950 mt-0.5">
                    {formAlert.message}
                  </p>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                    Por favor complete esta información antes de avanzar a la siguiente etapa.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormAlert(null)}
                className="text-amber-500 hover:text-amber-800 font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {/* ==================================================================== */}
          {/* ETAPA 1: REGISTRO DEL TUTOR / PROPIETARIO                            */}
          {/* ==================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-2">
                  <span>👤</span> 1. Datos de Identificación y Contacto del Tutor
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ingrese la información legal y de contacto del propietario responsable.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombres del tutor *
                  </label>
                  <input
                    type="text"
                    name="ownerFirstName"
                    value={formData.ownerFirstName}
                    onChange={handleChange}
                    placeholder="Ej. María Camila"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apellidos del tutor *
                  </label>
                  <input
                    type="text"
                    name="ownerLastName"
                    value={formData.ownerLastName}
                    onChange={handleChange}
                    placeholder="Ej. González Ruiz"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    (Este apellido será asignado a la mascota)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de documento *
                  </label>
                  <select
                    name="ownerDocumentType"
                    value={formData.ownerDocumentType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none bg-white cursor-pointer"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de documento *
                  </label>
                  <input
                    type="text"
                    name="ownerDocumentNumber"
                    value={formData.ownerDocumentNumber}
                    onChange={handleNumericChange('ownerDocumentNumber', false)}
                    placeholder="Ej. 1020345678"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono celular principal *
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleNumericChange('ownerPhone', false)}
                    placeholder="Ej. 3101234567"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono de emergencia / alternativo
                  </label>
                  <input
                    type="tel"
                    name="ownerEmergencyPhone"
                    value={formData.ownerEmergencyPhone}
                    onChange={handleNumericChange('ownerEmergencyPhone', false)}
                    placeholder="Ej. 3149998877"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="tutor@ejemplo.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Departamento
                  </label>
                  <select
                    name="ownerDepartment"
                    value={formData.ownerDepartment}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccione departamento...</option>
                    {COLOMBIA_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ciudad / Municipio
                  </label>
                  <select
                    name="ownerCity"
                    value={formData.ownerCity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">
                      {formData.ownerDepartment ? 'Seleccione ciudad / municipio...' : 'Primero elija departamento'}
                    </option>
                    {colombiaGeoApi.getCitiesByDepartmentSync(formData.ownerDepartment).map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                    {formData.ownerCity && !colombiaGeoApi.getCitiesByDepartmentSync(formData.ownerDepartment).some(c => c.name.toLowerCase() === formData.ownerCity.toLowerCase()) && (
                      <option value={formData.ownerCity}>{formData.ownerCity}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estrato (Opcional)
                  </label>
                  <select
                    name="ownerStratum"
                    value={formData.ownerStratum}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Sin especificar</option>
                    <option value="Estrato 1">Estrato 1</option>
                    <option value="Estrato 2">Estrato 2</option>
                    <option value="Estrato 3">Estrato 3</option>
                    <option value="Estrato 4">Estrato 4</option>
                    <option value="Estrato 5">Estrato 5</option>
                    <option value="Estrato 6">Estrato 6</option>
                    <option value="Comercial / Rural">Comercial / Rural</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dirección física de residencia
                </label>
                <input
                  type="text"
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={handleChange}
                  placeholder="Ej. Cra 15 # 85-30, Apto 402"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* ETAPA 2: INFORMACIÓN BÁSICA DE LA MASCOTA                             */}
          {/* ==================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-2">
                  <span>🐾</span> 2. Identificación Básica del Paciente
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ingrese los datos fisiológicos y de identidad básica de la mascota.
                </p>
              </div>

              {/* Ficha rápida de previsualización del nombre */}
              <div className="p-4 bg-sky-50 border-2 border-sky-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <span className="w-11 h-11 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-2xl font-bold shadow-2xs shrink-0">
                    {formData.species === 'Felino' ? '🐱' : formData.species === 'Canino' ? '🐶' : '🐾'}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 block">
                      Nombre Completo Registrado (Apellido heredado del tutor):
                    </span>
                    <h3 className="text-lg font-black text-sky-950 tracking-tight">
                      {fullPatientName || 'Nombre de la mascota'}
                    </h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Tutor: {formData.ownerFirstName || '—'} {formData.ownerLastName || '—'} · {formData.ownerCity || 'Colombia'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {calculatedAge && (
                    <span className="px-3 py-1 bg-white border border-sky-300 text-sky-900 rounded-xl text-xs font-bold shadow-2xs">
                      {calculatedAge}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-sky-200 text-sky-900 rounded-xl text-xs font-black">
                    ✓ Heredado
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del paciente *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Bruno"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Especie *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Canino', 'Felino', 'Otro'].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            species: sp,
                            breed: sp === 'Otro' ? '' : prev.breed,
                          }));
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          formData.species === sp
                            ? 'bg-[#6F2BCC] text-white shadow-xs'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{sp === 'Canino' ? '🐶' : sp === 'Felino' ? '🐱' : '🐾'}</span>
                        <span>{sp}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formData.species === 'Otro' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Especifique la especie *
                  </label>
                  <input
                    type="text"
                    name="otherSpecies"
                    value={formData.otherSpecies}
                    onChange={handleChange}
                    placeholder="Ej. Equino, Ave exótica, Cunícola, Hurón..."
                    className="w-full px-3.5 py-2.5 border border-purple-300 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>
              )}

              {/* Raza con selector predictivo */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Raza del paciente *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={(e) => {
                      handleChange(e);
                      setShowBreedDropdown(true);
                    }}
                    onFocus={() => setShowBreedDropdown(true)}
                    placeholder="Escriba o seleccione una raza..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                  {formData.breed && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, breed: '' }))}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {showBreedDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowBreedDropdown(false)}
                    />
                    <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100">
                      {filteredBreedsList.length > 0 ? (
                        filteredBreedsList.map((breedName) => (
                          <div
                            key={breedName}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, breed: breedName }));
                              setShowBreedDropdown(false);
                            }}
                            className="px-3.5 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6F2BCC] cursor-pointer flex items-center justify-between"
                          >
                            <span>{breedName}</span>
                            {formData.breed === breedName && <span className="text-[#6F2BCC] font-bold">✓</span>}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Presione Enter para usar "{formData.breed}" como raza personalizada.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sexo *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Hembra', 'Macho'].map((sx) => (
                      <button
                        key={sx}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, sex: sx }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.sex === sx
                            ? 'bg-[#6F2BCC] text-white shadow-xs'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {sx === 'Hembra' ? '♀ Hembra' : '♂ Macho'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de nacimiento *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none bg-white cursor-pointer"
                  />
                  {calculatedAge && (
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                      Edad calculada: {calculatedAge}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peso aproximado (kg)
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleNumericChange('weight', true)}
                    placeholder="Ej. 4.5"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>
              </div>

              {/* Esterilización & Alergias iniciales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Esterilización */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    ¿El paciente está esterilizado?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isSterilized: true }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.isSterilized === true
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Sí, esterilizado
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isSterilized: false }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.isSterilized === false
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      No esterilizado
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    (Si ya está esterilizado, no se volverá a preguntar en solicitudes de exámenes posteriores)
                  </span>
                </div>

                {/* Alergias iniciales */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      ¿Presenta alergias conocidas?
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, hasAllergies: false, allergies: '' }))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          !formData.hasAllergies ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, hasAllergies: true }))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          formData.hasAllergies ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {formData.hasAllergies && (
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="Ej. Picadura de pulga, Pollo, Cefalexina..."
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  )}
                  <span className="text-[10px] text-slate-400 block">
                    (Se podrán agregar nuevas alergias en cada solicitud de examen)
                  </span>
                </div>
              </div>

              {/* Microchip */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Microchip de identificación
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ¿Cuenta con transponder / chip subcutáneo ISO?
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, hasMicrochip: false, microchipNumber: '' }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      !formData.hasMicrochip ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, hasMicrochip: true }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      formData.hasMicrochip ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    Sí
                  </button>
                </div>
              </div>

              {formData.hasMicrochip && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de Microchip (15 dígitos) *
                  </label>
                  <input
                    type="text"
                    name="microchipNumber"
                    value={formData.microchipNumber}
                    onChange={handleNumericChange('microchipNumber', false)}
                    maxLength={15}
                    placeholder="Ej. 900123456789012"
                    className="w-full px-3.5 py-2.5 border border-purple-300 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none font-mono"
                  />
                </div>
              )}

              {/* Antecedentes generales / notas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Antecedentes médicos relevantes / Observaciones generales (Opcional)
                </label>
                <textarea
                  name="medicalBackground"
                  value={formData.medicalBackground}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Cirugías previas, patologías crónicas, comportamiento..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* ETAPA 3: RESUMEN Y CONFIRMACIÓN                                      */}
          {/* ==================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-2">
                  <span>📋</span> 3. Resumen y Confirmación de Registro
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Verifique la información registrada antes de guardar el paciente en el sistema.
                </p>
              </div>

              {/* Tarjeta Resumen Tutor */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-1.5">
                    <span>👤</span> Datos del Tutor
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-[#6F2BCC] hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nombre completo</span>
                    <strong className="text-slate-800">{formData.ownerFirstName} {formData.ownerLastName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Documento</span>
                    <strong className="text-slate-800">{formData.ownerDocumentType} {formData.ownerDocumentNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Teléfono</span>
                    <strong className="text-slate-800">{formData.ownerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ciudad</span>
                    <strong className="text-slate-800">{formData.ownerCity || 'No especificada'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Dirección</span>
                    <strong className="text-slate-800">{formData.ownerAddress || 'No especificada'}</strong>
                  </div>
                </div>
              </div>

              {/* Tarjeta Resumen Paciente */}
              <div className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                  <span className="text-xs font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-1.5">
                    <span>🐾</span> Datos de la Mascota
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-[#6F2BCC] hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nombre</span>
                    <strong className="text-[#2B017C] font-black">{fullPatientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Especie / Raza</span>
                    <strong className="text-slate-800">
                      {formData.species === 'Otro' ? formData.otherSpecies : formData.species} · {formData.breed}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sexo</span>
                    <strong className="text-slate-800">{formData.sex}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Edad</span>
                    <strong className="text-slate-800">{calculatedAge || 'No calculada'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Esterilizado</span>
                    <strong className={formData.isSterilized ? 'text-emerald-700' : 'text-slate-700'}>
                      {formData.isSterilized === true ? '✓ Sí, esterilizado' : formData.isSterilized === false ? 'No' : 'Sin definir'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Alergias</span>
                    <strong className={formData.hasAllergies ? 'text-amber-800' : 'text-slate-700'}>
                      {formData.hasAllergies ? formData.allergies : 'Ninguna conocida'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Peso</span>
                    <strong className="text-slate-800">{formData.weight ? `${formData.weight} kg` : 'No registrado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Microchip</span>
                    <strong className="text-slate-800">{formData.hasMicrochip ? formData.microchipNumber : 'No'}</strong>
                  </div>
                </div>
              </div>

              {/* Banner orientador sobre el flujo de muestras y diagnósticos */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3 text-xs text-sky-900">
                <span className="text-2xl shrink-0 mt-0.5">💡</span>
                <div>
                  <strong className="font-extrabold text-[#2B017C] block mb-0.5">
                    ¿Desea solicitar un examen qPCR ahora?
                  </strong>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    Los factores de riesgo epidemiológicos, antecedentes clínicos, cuadro hemático y la historia clínica se registrarán de manera guiada en el <strong>formulario de solicitud de examen</strong> para diagnosticar y recomendar con máxima precisión el perfil molecular pertinente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones de navegación y acciones finales */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={submitting}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-white transition-all cursor-pointer"
              >
                ← Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Siguiente etapa</span>
                <span>→</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 border-2 border-[#6F2BCC] text-[#6F2BCC] hover:bg-purple-50 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                >
                  {submitting ? 'Guardando...' : 'Guardar Paciente'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>{submitting ? 'Procesando...' : 'Guardar y Solicitar Examen qPCR'}</span>
                  <span>✨</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
