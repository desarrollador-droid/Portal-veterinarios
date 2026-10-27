import React, { useState, useMemo } from 'react';

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

// Lista de síntomas clínicos y signos observados (con Mucosas cianóticas)
const SYMPTOM_OPTIONS = [
  'Fiebre',
  'Anemia',
  'Mucosas pálidas',
  'Mucosas ictéricas',
  'Mucosas cianóticas',
  'Linfadenopatía generalizada',
  'Hepatomegalia',
  'Esplenomegalia',
  'Trombocitopenia',
  'Anorexia',
  'Decaimiento',
  'Vómito',
  'Diarrea',
  'Letargia',
  'Tos',
  'Estornudos',
  'Pérdida de apetito',
  'Otro',
];

export const DOCUMENT_TYPES = ['C.C.', 'C.E.', 'Pasaporte', 'NIT', 'T.I.'];
export const PREDEFINED_COHABITING_SPECIES = ['Caninos', 'Felinos', 'Aves', 'Roedores', 'Equinos / Granja'];
export const HOUSING_AREAS = ['Urbana', 'Rural'];
export const HOUSING_TYPES = [
  'Casa con jardín / patio',
  'Casa cerrada (sin patio)',
  'Apartamento',
  'Finca / Parcela / Hacienda',
  'Albergue / Refugio',
  'Otro',
];

const COLOMBIA_DEPARTMENTS = [
  'Bogotá D.C.',
  'Antioquia',
  'Cundinamarca',
  'Valle del Cauca',
  'Atlántico',
  'Santander',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Meta',
  'Tolima',
  'Risaralda',
  'Nariño',
  'Huila',
  'Norte de Santander',
  'Otro Departamento',
];

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
  // 7 Etapas requeridas:
  // 1: Registro del tutor / propietario
  // 2: Identificación de la mascota
  // 3: Factores de riesgo
  // 4: Información médica inicial
  // 5: Estado de vacunación y prevención
  // 6: Datos de ingreso (peso, antecedentes, signos vitales, qPCR)
  // 7: Resumen completo en tabla con posibilidad de editar antes de guardar
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditingFromSummary, setIsEditingFromSummary] = useState(false);
  const totalSteps = 7;

  // Lista dinámica de "Otros factores de riesgo" (Imagen media_1791475770113.png)
  const [otherRiskFactorsList, setOtherRiskFactorsList] = useState([]);
  const [newRiskFactorInput, setNewRiskFactorInput] = useState('');
  const [customCohabitingSpeciesInput, setCustomCohabitingSpeciesInput] = useState('');

  // Todos los campos inician vacíos (sin valores predefinidos engañosos), solo con ejemplos en placeholder
  const [formData, setFormData] = useState({
    // ETAPA 1: REGISTRO DEL TUTOR / PROPIETARIO
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

    // ETAPA 2: IDENTIFICACIÓN DE LA MASCOTA
    name: '',
    species: '', // Canino | Felino | Otro
    otherSpecies: '',
    breed: '',
    sex: '', // Hembra | Macho
    birthDate: '',
    isSterilized: null, // null: sin valor preseleccionado
    hasAllergies: false,
    allergies: '',

    // ETAPA 3: FACTORES DE RIESGO
    habitat: '', // Interiores | Exterior | Mixto (sin preselección)
    housingArea: '', // Urbana | Rural
    housingType: '', // Casa con jardín/patio, etc.
    otherHousingType: '',
    contactOutside: false,
    contactOutsideType: '',
    livesWithOtherAnimals: false,
    cohabitingSpecies: [], // Especies con las que convive
    recentTravel: false,
    recentTravelDetails: '', // Departamento o lugar del último viaje
    ruralAccess: false,
    parasiteExposure: false,
    outdoorWater: false,
    coastalRescue: false,
    coastalRescueLocation: '',

    // ETAPA 4: INFORMACIÓN MÉDICA INICIAL
    isAsymptomatic: null, // null: el usuario debe seleccionar explícitamente
    selectedSymptoms: [],
    otherSymptomText: '',
    physicalFindings: '',
    consultationType: '',
    generalCondition: '',
    // Carga de Cuadro Hemático / Hemograma
    hasCuadroHematico: false,
    cuadroHematicoFile: null,
    cuadroHematicoFileName: '',
    cuadroHematicoFileSize: '',
    cuadroHematicoHematocrito: '',
    cuadroHematicoHemoglobina: '',
    cuadroHematicoLeucocitos: '',
    cuadroHematicoPlaquetas: '',
    cuadroHematicoObservaciones: '',

    // ETAPA 5: ESTADO DE VACUNACIÓN Y PREVENCIÓN
    vaccinationStatus: '', // Al día, Incompleto, Desconocido
    lastVaccinationDate: '',
    dewormingStatus: '', // Al día, Incompleto, Desconocido
    lastDewormingDate: '',
    preventionNotes: '',
    hasMicrochip: null, // null: sin preselección (Sí | No)
    microchipNumber: '',
    hasTraveledAbroad: null, // null: sin preselección (Sí | No)
    lastCountryVisited: '',

    // ETAPA 6: DATOS DE INGRESO
    weight: '',
    medicalBackground: '',
    vitalSignsHeartRate: '',
    vitalSignsTemp: '',
    vitalSignsResp: '',
    vitalSignsMucosa: '',
    vitalSignsCapillaryRefillTime: '', // Tiempo de llenado capilar en segundos
    requestExam: false,
    initialExamName: 'qPCR Panel Microbiota & Disbiosis Intestinal',
  });

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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Helper para campos numéricos donde el usuario solo ingresa números y las unidades se colocan solas
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

  const handleEditSection = (stepNum) => {
    setIsEditingFromSummary(true);
    setCurrentStep(stepNum);
  };

  const handleAddRiskFactor = () => {
    if (!newRiskFactorInput.trim()) return;
    setOtherRiskFactorsList((prev) => [...prev, newRiskFactorInput.trim()]);
    setNewRiskFactorInput('');
  };

  const handleRemoveRiskFactor = (indexToRemove) => {
    setOtherRiskFactorsList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleToggleCohabitingSpecies = (speciesName) => {
    setFormData((prev) => {
      const exists = prev.cohabitingSpecies.includes(speciesName);
      return {
        ...prev,
        cohabitingSpecies: exists
          ? prev.cohabitingSpecies.filter((sp) => sp !== speciesName)
          : [...prev.cohabitingSpecies, speciesName],
      };
    });
  };

  const handleAddCustomCohabitingSpecies = () => {
    if (!customCohabitingSpeciesInput.trim()) return;
    const val = customCohabitingSpeciesInput.trim();
    if (!formData.cohabitingSpecies.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        cohabitingSpecies: [...prev.cohabitingSpecies, val],
      }));
    }
    setCustomCohabitingSpeciesInput('');
  };

  const handleRemoveCohabitingSpecies = (spToRemove) => {
    setFormData((prev) => ({
      ...prev,
      cohabitingSpecies: prev.cohabitingSpecies.filter((sp) => sp !== spToRemove),
    }));
  };

  const toggleSymptom = (symptom) => {
    setFormData((prev) => {
      const exists = prev.selectedSymptoms.includes(symptom);
      return {
        ...prev,
        selectedSymptoms: exists
          ? prev.selectedSymptoms.filter((s) => s !== symptom)
          : [...prev.selectedSymptoms, symptom],
      };
    });
  };

  const handleCuadroHematicoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        hasCuadroHematico: true,
        cuadroHematicoFile: reader.result,
        cuadroHematicoFileName: file.name,
        cuadroHematicoFileSize: sizeStr,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCuadroHematico = () => {
    setFormData((prev) => ({
      ...prev,
      hasCuadroHematico: false,
      cuadroHematicoFile: null,
      cuadroHematicoFileName: '',
      cuadroHematicoFileSize: '',
      cuadroHematicoHematocrito: '',
      cuadroHematicoHemoglobina: '',
      cuadroHematicoLeucocitos: '',
      cuadroHematicoPlaquetas: '',
      cuadroHematicoObservaciones: '',
    }));
  };

  const handleNext = () => {
    // Validaciones por etapa sin asumir datos por defecto
    if (currentStep === 1) {
      if (!formData.ownerFirstName.trim() || !formData.ownerLastName.trim() || !formData.ownerPhone.trim()) {
        alert('Por favor complete nombres, apellidos y teléfono principal del tutor.');
        return;
      }
      if (!formData.ownerDocumentType) {
        alert('Por favor seleccione el tipo de documento del tutor.');
        return;
      }
      if (!formData.ownerDocumentNumber.trim()) {
        alert('Por favor ingrese el número de documento del tutor.');
        return;
      }
      if (!formData.ownerStratum) {
        alert('Por favor seleccione el estrato socioeconómico del tutor.');
        return;
      }
      if (!formData.ownerDepartment) {
        alert('Por favor seleccione el departamento de residencia.');
        return;
      }
      if (!formData.ownerCity.trim()) {
        alert('Por favor ingrese la ciudad o municipio de residencia.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.name.trim()) {
        alert('Por favor ingrese el nombre de la mascota.');
        return;
      }
      if (!formData.species) {
        alert('Por favor seleccione la especie de la mascota.');
        return;
      }
      if (formData.species === 'Otro' && !formData.otherSpecies.trim()) {
        alert('Por favor especifique la especie.');
        return;
      }
      if (!formData.breed.trim()) {
        alert('Por favor ingrese la raza de la mascota.');
        return;
      }
      if (!formData.sex) {
        alert('Por favor seleccione el sexo de la mascota.');
        return;
      }
      if (!formData.birthDate) {
        alert('Por favor seleccione la fecha de nacimiento de la mascota.');
        return;
      }
      if (formData.isSterilized === null) {
        alert('Por favor indique si la mascota se encuentra esterilizada o castrada.');
        return;
      }
      if (formData.hasAllergies && !formData.allergies.trim()) {
        alert('Por favor especifique cuál es la alergia que presenta la mascota.');
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.habitat) {
        alert('Por favor seleccione el hábitat habitual del paciente (Interiores, Exterior o Mixto).');
        return;
      }
      if (!formData.housingArea) {
        alert('Por favor seleccione si el entorno de vivienda es Urbano o Rural.');
        return;
      }
      if (!formData.housingType) {
        alert('Por favor seleccione el tipo de vivienda.');
        return;
      }
      if (formData.housingType === 'Otro' && !formData.otherHousingType.trim()) {
        alert('Por favor especifique el tipo de vivienda.');
        return;
      }
      if (formData.contactOutside && !formData.contactOutsideType.trim()) {
        alert('Por favor describa el tipo de contacto que tiene con otros animales fuera del hogar.');
        return;
      }
      if (formData.livesWithOtherAnimals && formData.cohabitingSpecies.length === 0) {
        alert('Por favor seleccione o agregue al menos una especie con la que convive el paciente.');
        return;
      }
      if (formData.recentTravel && !formData.recentTravelDetails.trim()) {
        alert('Por favor indique el departamento o lugar al que viajó más recientemente.');
        return;
      }
      if (formData.coastalRescue && !formData.coastalRescueLocation?.trim()) {
        alert('Por favor especifique de qué zona costera fue rescatado el paciente.');
        return;
      }
    }

    if (currentStep === 4) {
      // Síntomas y signos clínicos NO obligatorios (aplica para consulta general y preventivos)
    }

    if (currentStep === 5) {
      if (formData.hasMicrochip === null) {
        alert('Por favor indique si el paciente cuenta con microchip de identificación.');
        return;
      }
      if (formData.hasMicrochip && !formData.microchipNumber.trim()) {
        alert('Por favor ingrese el número del microchip.');
        return;
      }
      if (formData.hasTraveledAbroad === null) {
        alert('Por favor indique si el paciente ha salido del país.');
        return;
      }
      if (formData.hasTraveledAbroad && !formData.lastCountryVisited.trim()) {
        alert('Por favor registre el último país que visitó el paciente.');
        return;
      }

      if (!formData.vaccinationStatus) {
        alert('Por favor seleccione el estado del esquema de vacunación.');
        return;
      }
      // Si es Desconocido, NO pide fecha. Si es Al día o Incompleto, sí se puede requerir o validar si la ingresa.
      if ((formData.vaccinationStatus === 'Al día' || formData.vaccinationStatus === 'Incompleto') && !formData.lastVaccinationDate) {
        alert('Por favor ingrese la fecha de la última vacunación.');
        return;
      }
      if (!formData.dewormingStatus) {
        alert('Por favor seleccione el estado de desparasitación.');
        return;
      }
      if ((formData.dewormingStatus === 'Al día' || formData.dewormingStatus === 'Incompleto') && !formData.lastDewormingDate) {
        alert('Por favor ingrese la fecha de la última desparasitación.');
        return;
      }

      // REQUERIMIENTO: Fechas no pueden ser futuras, solo días pasados o hoy
      const todayStr = new Date().toISOString().split('T')[0];
      if (formData.lastVaccinationDate && formData.lastVaccinationDate > todayStr) {
        alert('La fecha de vacunación no puede ser a futuro. Debe seleccionar una fecha pasada o el día de hoy.');
        return;
      }
      if (formData.lastDewormingDate && formData.lastDewormingDate > todayStr) {
        alert('La fecha de desparasitación no puede ser a futuro. Debe seleccionar una fecha pasada o el día de hoy.');
        return;
      }
    }

    if (currentStep === 6) {
      if (!formData.weight.trim()) {
        alert('Por favor ingrese el peso de ingreso de la mascota (ej. 4.2).');
        return;
      }
    }

    // REQUERIMIENTO: Si se venía editando desde el resumen, al guardar/continuar vuelve de inmediato al resumen (Paso 7)
    if (isEditingFromSummary) {
      setIsEditingFromSummary(false);
      setCurrentStep(7);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitting(true);
    try {
      const finalSpecies = formData.species === 'Otro' ? formData.otherSpecies.trim() : formData.species;
      const avatarIcon = finalSpecies.toLowerCase().includes('felin')
        ? '🐱'
        : finalSpecies.toLowerCase().includes('canin')
        ? '🐶'
        : '🐾';

      const compiledOtherRiskFactors = otherRiskFactorsList.join(', ');

      const payload = {
        name: formData.name.trim(),
        lastName: formData.ownerLastName.trim(),
        avatar: avatarIcon,
        species: finalSpecies,
        breed: formData.breed.trim(),
        sex: formData.sex,
        birthDate: formData.birthDate,
        age: calculatedAge,
        isSterilized: Boolean(formData.isSterilized),
        hasAllergies: Boolean(formData.hasAllergies),
        allergies: formData.hasAllergies ? formData.allergies.trim() : '',

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

        // Factores de riesgo
        habitat: formData.habitat,
        housingArea: formData.housingArea,
        housingType: formData.housingType === 'Otro' ? (formData.otherHousingType.trim() ? `Otro: ${formData.otherHousingType.trim()}` : 'Otro') : formData.housingType,
        contactOutside: {
          hasContact: formData.contactOutside,
          contactType: formData.contactOutside ? formData.contactOutsideType.trim() : '',
        },
        livesWithOtherAnimals: formData.livesWithOtherAnimals,
        cohabitingSpecies: formData.livesWithOtherAnimals ? formData.cohabitingSpecies : [],
        recentTravel: formData.recentTravel,
        recentTravelDetails: formData.recentTravel ? formData.recentTravelDetails.trim() : '',
        ruralAccess: formData.ruralAccess,
        parasiteExposure: formData.parasiteExposure,
        outdoorWater: formData.outdoorWater,
        coastalRescue: formData.coastalRescue,
        coastalRescueLocation: formData.coastalRescue ? formData.coastalRescueLocation.trim() : '',
        otherRiskFactors: compiledOtherRiskFactors,

        // Información médica inicial
        isAsymptomatic: Boolean(formData.isAsymptomatic),
        symptoms: formData.isAsymptomatic ? [] : formData.selectedSymptoms,
        otherSymptoms: formData.otherSymptomText.trim(),
        physicalFindings: formData.physicalFindings.trim(),
        consultationType: formData.consultationType || 'Consulta General',
        generalCondition: formData.generalCondition || 'Bueno',
        // Cuadro Hemático cargado en admisión
        cuadroHematico: {
          hasCuadroHematico: formData.hasCuadroHematico,
          file: formData.cuadroHematicoFile,
          fileName: formData.cuadroHematicoFileName,
          fileSize: formData.cuadroHematicoFileSize,
          hematocrito: formData.cuadroHematicoHematocrito,
          hemoglobina: formData.cuadroHematicoHemoglobina,
          leucocitos: formData.cuadroHematicoLeucocitos,
          plaquetas: formData.cuadroHematicoPlaquetas,
          observaciones: formData.cuadroHematicoObservaciones.trim(),
        },

        // Vacunación y prevención
        vaccinationStatus: formData.vaccinationStatus,
        lastVaccinationDate: formData.vaccinationStatus === 'Desconocido' ? '' : formData.lastVaccinationDate,
        dewormingStatus: formData.dewormingStatus,
        lastDewormingDate: formData.dewormingStatus === 'Desconocido' ? '' : formData.lastDewormingDate,
        preventionNotes: formData.preventionNotes.trim(),
        hasMicrochip: formData.hasMicrochip,
        microchipNumber: formData.hasMicrochip ? formData.microchipNumber.trim() : '',
        hasTraveledAbroad: formData.hasTraveledAbroad,
        lastCountryVisited: formData.hasTraveledAbroad ? formData.lastCountryVisited.trim() : '',

        // Datos de ingreso
        weight: formData.weight.trim() ? (formData.weight.trim().toLowerCase().includes('kg') ? formData.weight.trim() : `${formData.weight.trim()} kg`) : '',
        medicalBackground: formData.medicalBackground.trim(),
        vitalSigns: {
          heartRate: formData.vitalSignsHeartRate.trim() ? (formData.vitalSignsHeartRate.trim().toLowerCase().includes('bpm') ? formData.vitalSignsHeartRate.trim() : `${formData.vitalSignsHeartRate.trim()} bpm`) : 'No registrada',
          temperature: formData.vitalSignsTemp.trim() ? (formData.vitalSignsTemp.trim().includes('°') ? formData.vitalSignsTemp.trim() : `${formData.vitalSignsTemp.trim()} °C`) : 'No registrada',
          respiratoryRate: formData.vitalSignsResp.trim() ? (formData.vitalSignsResp.trim().toLowerCase().includes('rpm') ? formData.vitalSignsResp.trim() : `${formData.vitalSignsResp.trim()} rpm`) : 'No registrada',
          mucosa: formData.vitalSignsMucosa.trim() || 'No registrada',
          capillaryRefillTime: formData.vitalSignsCapillaryRefillTime.trim()
            ? (formData.vitalSignsCapillaryRefillTime.trim().toLowerCase().includes('seg')
                ? formData.vitalSignsCapillaryRefillTime.trim()
                : `${formData.vitalSignsCapillaryRefillTime.trim()} seg`)
            : 'No registrado',
        },

        status: formData.generalCondition === 'Crítico' ? 'critico' : 'activo',
        requestExam: formData.requestExam,
        initialExamName: formData.initialExamName,
      };

      await onCreated(payload);
      onClose();
    } catch (err) {
      alert(err.message || 'Error registrando paciente');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsMetadata = [
    { num: 1, title: 'Tutor', icon: '👤' },
    { num: 2, title: 'Mascota', icon: '🐾' },
    { num: 3, title: 'Riesgos', icon: '🌲' },
    { num: 4, title: 'Médica', icon: '🩺' },
    { num: 5, title: 'Vacunación', icon: '💉' },
    { num: 6, title: 'Ingreso', icon: '⚖️' },
    { num: 7, title: 'Resumen', icon: '📋' },
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
                Registro de Nuevo Paciente · Flujo Integral
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

        {/* Stepper horizontal con las 7 etapas */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 overflow-x-auto shrink-0">
          <div className="flex items-center justify-between min-w-[580px] gap-1">
            {stepsMetadata.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < currentStep || currentStep === 7) {
                    setCurrentStep(st.num);
                  }
                }}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
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
                <span className="truncate">{st.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido interactivo del formulario */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isEditingFromSummary && currentStep < 7 && (
            <div className="mb-5 p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs text-sky-950 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="text-base">✏️</span>
                <span>
                  <strong>Editando sección desde el Resumen:</strong> Realice los cambios necesarios y presione <strong>"Guardar y volver al Resumen 📋"</strong> para regresar directamente a la tabla sin pasar por los otros pasos.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingFromSummary(false);
                  setCurrentStep(7);
                }}
                className="text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer shrink-0 ml-3"
              >
                Volver al Resumen
              </button>
            </div>
          )}
          {/* ========================================================== */}
          {/* ETAPA 1: REGISTRO DEL TUTOR / PROPIETARIO                 */}
          {/* ========================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>👤</span> Paso 1: Datos del Tutor / Propietario
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingrese la información del tutor responsable. Los apellidos ingresados aquí se asociarán como información quemada al nombre del paciente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombres del Tutor *</label>
                  <input
                    type="text"
                    name="ownerFirstName"
                    value={formData.ownerFirstName}
                    onChange={handleChange}
                    placeholder="Ej. Carlos / María"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellidos del Tutor *</label>
                  <input
                    type="text"
                    name="ownerLastName"
                    value={formData.ownerLastName}
                    onChange={handleChange}
                    placeholder="Ej. Rodríguez / Vence"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold text-slate-800"
                  />
                  <span className="text-[10px] text-sky-600 font-medium block mt-1">
                    ℹ️ Este apellido se heredará automáticamente a la mascota al escribir su nombre.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Documento *</label>
                  <select
                    name="ownerDocumentType"
                    value={formData.ownerDocumentType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white cursor-pointer"
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    name="ownerDocumentNumber"
                    value={formData.ownerDocumentNumber}
                    onChange={handleChange}
                    placeholder="Ej. 1020304050"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono Principal *</label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    placeholder="Ej. +57 312 987 6543"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Emergencia</label>
                  <input
                    type="tel"
                    name="ownerEmergencyPhone"
                    value={formData.ownerEmergencyPhone}
                    onChange={handleChange}
                    placeholder="Ej. +57 310 888 1234 (opcional)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    placeholder="Ej. correo@ejemplo.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estrato *</label>
                  <select
                    name="ownerStratum"
                    value={formData.ownerStratum}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccione estrato socioeconómico...</option>
                    <option value="Estrato 1">Estrato 1</option>
                    <option value="Estrato 2">Estrato 2</option>
                    <option value="Estrato 3">Estrato 3 </option>
                    <option value="Estrato 4">Estrato 4</option>
                    <option value="Estrato 5">Estrato 5 </option>
                    <option value="Estrato 6">Estrato 6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento *</label>
                  <select
                    name="ownerDepartment"
                    value={formData.ownerDepartment}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccione departamento...</option>
                    {COLOMBIA_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ciudad / Municipio *</label>
                  <input
                    type="text"
                    name="ownerCity"
                    value={formData.ownerCity}
                    onChange={handleChange}
                    placeholder="Ej. Bogotá / Medellín / Cali"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dirección Residencial</label>
                  <input
                    type="text"
                    name="ownerAddress"
                    value={formData.ownerAddress}
                    onChange={handleChange}
                    placeholder="Ej. Calle 116 # 7-15, Apto 502"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 2: IDENTIFICACIÓN DE LA MASCOTA                      */}
          {/* ========================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🐾</span> Paso 2: Identificación de la Mascota
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingrese el nombre de la mascota. Al escribir el nombre, se visualizará el registro oficial completo con el apellido previamente ingresado del tutor.
                </p>
              </div>

              {/* Nombre de la Mascota */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Nombre de la Mascota *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Lola, Max, Thor, Luna..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* RECUADRO AZUL PREVIEW: SOLO SALE DESPUÉS DE HABER ESCRITO EL NOMBRE */}
              {hasTypedName ? (
                <div className="p-4 bg-sky-50 border-2 border-sky-300 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl font-bold">
                      {formData.species === 'Felino' ? '🐱' : '🐶'}
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 block">
                        Nombre Completo Registrado (Apellido heredado del tutor):
                      </span>
                      <h3 className="text-lg font-black text-sky-950 tracking-tight">
                        {fullPatientName}
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-sky-200 text-sky-900 rounded-xl text-xs font-black">
                    ✓ Heredado
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 italic flex items-center gap-2">
                  <span>💡</span>
                  <span>Escriba el nombre del paciente arriba para visualizar su nombre completo oficial con el apellido del tutor ({formData.ownerLastName || 'Tutor'}).</span>
                </div>
              )}

              {/* Especie (Canino, Felino, Otro) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Especie *</label>
                  <select
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="">Seleccione especie...</option>
                    <option value="Canino">Canino 🐶</option>
                    <option value="Felino">Felino 🐱</option>
                    <option value="Otro">Otro animal 🐾</option>
                  </select>
                </div>

                {formData.species === 'Otro' && (
                  <div className="animate-in fade-in duration-150">
                    <label className="block font-bold text-slate-700 mb-1">¿Qué especie / animal es? *</label>
                    <input
                      type="text"
                      name="otherSpecies"
                      value={formData.otherSpecies}
                      onChange={handleChange}
                      placeholder="Ej. Conejo, Hurón, Equino..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Raza *</label>
                    <span className="text-[10px] text-slate-400 font-semibold">Desplegable o escribe libremente</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="breed"
                      list="breed-options-datalist"
                      value={formData.breed}
                      onChange={handleChange}
                      onFocus={() => setShowBreedDropdown(true)}
                      placeholder={formData.species === 'Felino' ? 'Ej. Siamés, Persa, Criollo...' : 'Ej. Golden Retriever, Criollo...'}
                      className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBreedDropdown((prev) => !prev)}
                      title="Ver razas en menú desplegable"
                      className="absolute right-2.5 px-2 py-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-xs font-black"
                    >
                      {showBreedDropdown ? '▲' : '▼'}
                    </button>
                  </div>

                  {/* Datalist nativo para sugerencias automáticas */}
                  <datalist id="breed-options-datalist">
                    {availableBreeds.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>

                  {/* Menú Desplegable Flotante */}
                  {showBreedDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl divide-y divide-slate-100 animate-in fade-in duration-100">
                      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 sticky top-0 z-10">
                        <span>Razas frecuentes ({formData.species || 'Todas'})</span>
                        <button
                          type="button"
                          onClick={() => setShowBreedDropdown(false)}
                          className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded hover:bg-slate-200"
                        >
                          ✕ Cerrar
                        </button>
                      </div>

                      {/* Opción para usar el texto personalizado que el usuario escribió */}
                      {formData.breed.trim() && !availableBreeds.includes(formData.breed.trim()) && (
                        <div
                          onClick={() => setShowBreedDropdown(false)}
                          className="px-3.5 py-2.5 text-xs text-[#6F2BCC] font-bold bg-sky-50/70 hover:bg-sky-100/70 cursor-pointer flex items-center justify-between"
                        >
                          <span>Usar texto: "{formData.breed.trim()}"</span>
                          <span className="text-[10px] px-2 py-0.5 bg-sky-200 text-sky-900 rounded-full font-bold">Personalizado</span>
                        </div>
                      )}

                      {filteredBreedsList.length > 0 ? (
                        filteredBreedsList.map((breedOption) => (
                          <div
                            key={breedOption}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, breed: breedOption }));
                              setShowBreedDropdown(false);
                            }}
                            className={`px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                              formData.breed === breedOption
                                ? 'bg-sky-50 text-[#6F2BCC] font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{breedOption}</span>
                            {formData.breed === breedOption && <span className="text-[#6F2BCC] font-black">✓</span>}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 italic">
                          No hay razas predefinidas que coincidan. Puedes continuar escribiendo tu raza personalizada arriba.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sexo *</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="">Seleccione sexo...</option>
                    <option value="Hembra">Hembra ♀</option>
                    <option value="Macho">Macho ♂</option>
                  </select>
                </div>
              </div>

              {/* Fecha de Nacimiento y Edad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Edad Calculada Dinámicamente</label>
                  <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 flex items-center justify-between">
                    <span className={calculatedAge ? 'text-sky-900 font-black' : 'text-slate-400 font-normal italic'}>
                      {calculatedAge || 'Seleccione la fecha de nacimiento'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Automática</span>
                  </div>
                </div>
              </div>

              {/* Esterilizado y Alergias (Campos con colores profesionales y suaves) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                {/* ¿Es esterilizado? */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-extrabold text-slate-900 block">
                    ¿Se encuentra esterilizado / castrado? *
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isSterilized: false }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.isSterilized === false ? 'bg-slate-700 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      No (Entero)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isSterilized: true }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.isSterilized === true ? 'bg-[#6F2BCC] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Sí (Esterilizado)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Nota clínica: Una vez registrado como esterilizado, este procedimiento quirúrgico será irreversible e inmutable en su expediente.
                  </p>
                </div>

                {/* ¿Le conocen alguna alergia? */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                    <span>⚠️</span> ¿Le conocen alguna alergia? *
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, hasAllergies: false, allergies: '' }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !formData.hasAllergies ? 'bg-slate-700 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, hasAllergies: true }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.hasAllergies ? 'bg-[#6F2BCC] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Sí
                    </button>
                  </div>
                </div>
              </div>

              {/* Si presenta alergia, campo para detallar cuál con tonalidades suaves */}
              {formData.hasAllergies && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-800">
                    ¿Cuál alergia o sustancia produce reacción? *
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="Ej. Sensibilidad a cefalexina, proteína de pollo, picadura de pulga..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 3: FACTORES DE RIESGO                                */}
          {/* ========================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🌲</span> Paso 3: Factores de Riesgo (Exposición y Hábitat)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evalúe los factores de riesgo epidemiológicos y el hábitat habitual de la mascota.
                </p>
              </div>

              {/* Apartado para Tipo y Entorno de Vivienda (Rural / Urbana + Tipo de vivienda) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs block">
                    Entorno y Tipo de Vivienda *
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Caracterización epidemiológica del domicilio
                  </span>
                </div>

                {/* 1. Discriminación Rural o Urbana */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5">
                    1. Entorno de la vivienda * {!formData.housingArea && <span className="text-amber-600 font-normal">(Seleccione una opción)</span>}
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {HOUSING_AREAS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, housingArea: area }))}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          formData.housingArea === area
                            ? 'border-[#6F2BCC] bg-sky-50/80 ring-2 ring-sky-300 font-bold text-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{area === 'Urbana' ? '🏙️' : '🌾'}</span>
                          <span>{area}</span>
                        </div>
                        {formData.housingArea === area && (
                          <span className="text-[#6F2BCC] font-black">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Tipo de vivienda */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5">
                    2. Tipo de vivienda * {!formData.housingType && <span className="text-amber-600 font-normal">(Seleccione el tipo)</span>}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {HOUSING_TYPES.map((hType) => (
                      <button
                        key={hType}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, housingType: hType }))}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                          formData.housingType === hType
                            ? 'border-[#6F2BCC] bg-sky-50/90 ring-2 ring-sky-300 font-bold text-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        {hType}
                      </button>
                    ))}
                  </div>

                  {formData.housingType === 'Otro' && (
                    <div className="mt-2.5 animate-in fade-in duration-150">
                      <input
                        type="text"
                        name="otherHousingType"
                        value={formData.otherHousingType}
                        onChange={handleChange}
                        placeholder="Especifique el tipo de vivienda..."
                        className="w-full px-3.5 py-2 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Hábitat sin valor preseleccionado engañoso */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800 text-xs mb-2">
                  Hábitat del Paciente * {!formData.habitat && <span className="text-amber-600 font-normal">(Seleccione una opción)</span>}
                </label>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { id: 'Interiores', label: 'Interiores', desc: 'Vive 100% dentro de casa/apto' },
                    { id: 'Exterior', label: 'Exterior', desc: 'Patio, finca o vida libre' },
                    { id: 'Mixto', label: 'Mixto', desc: 'Interior con salidas frecuentes' },
                  ].map((hab) => (
                    <button
                      key={hab.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, habitat: hab.id }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.habitat === hab.id
                          ? 'border-[#6F2BCC] bg-sky-50/80 ring-2 ring-sky-300'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-extrabold text-slate-900 block">{hab.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{hab.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles de Exposición y Contacto */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Exposición y Contacto Epidemiológico
                </span>

                <div className="space-y-3 text-xs">
                  {/* Pregunta 1: Contacto fuera del hogar */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        1. ¿Tiene contacto con otros animales fuera del hogar?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, contactOutside: false, contactOutsideType: '' }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                            !formData.contactOutside ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, contactOutside: true }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                            formData.contactOutside ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          Sí
                        </button>
                      </div>
                    </div>

                    {formData.contactOutside && (
                      <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ¿Qué tipo de contacto tiene fuera del hogar? *
                        </label>
                        <input
                          type="text"
                          name="contactOutsideType"
                          value={formData.contactOutsideType}
                          onChange={handleChange}
                          placeholder="Ej. Parques caninos, paseos diarios en grupo, pensiones..."
                          className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Pregunta 2: Convive con otros animales */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        2. ¿Convive con otros animales en el hogar?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, livesWithOtherAnimals: false, cohabitingSpecies: [] }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${!formData.livesWithOtherAnimals ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, livesWithOtherAnimals: true }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${formData.livesWithOtherAnimals ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          Sí
                        </button>
                      </div>
                    </div>

                    {formData.livesWithOtherAnimals && (
                      <div className="pt-2 border-t border-slate-200 space-y-2.5 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Seleccione o agregue las especies con las que convive: <span className="text-rose-500">*</span>
                        </label>

                        {/* Opciones preestablecidas */}
                        <div className="flex flex-wrap gap-1.5">
                          {PREDEFINED_COHABITING_SPECIES.map((sp) => {
                            const isSelected = formData.cohabitingSpecies.includes(sp);
                            return (
                              <button
                                key={sp}
                                type="button"
                                onClick={() => handleToggleCohabitingSpecies(sp)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#6F2BCC] text-white border-[#6F2BCC] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {sp}
                              </button>
                            );
                          })}
                        </div>

                        {/* Campo de texto para escribir y agregar otras especies personalizadas */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={customCohabitingSpeciesInput}
                            onChange={(e) => setCustomCohabitingSpeciesInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomCohabitingSpecies();
                              }
                            }}
                            placeholder="Escriba otra especie (ej. Conejos, Hurones, Aves exóticas) y presione Agregar"
                            className="flex-1 px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCohabitingSpecies}
                            className="px-4 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                          >
                            + Agregar
                          </button>
                        </div>

                        {/* Chips de todas las especies seleccionadas / agregadas */}
                        {formData.cohabitingSpecies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {formData.cohabitingSpecies.map((sp) => (
                              <span
                                key={sp}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-sky-100 text-sky-900 border border-sky-200"
                              >
                                <span>🐾 {sp}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCohabitingSpecies(sp)}
                                  className="text-sky-600 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                                  title="Quitar especie"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pregunta 3: Viajes recientes */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        3. ¿Viajes recientes fuera del departamento?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, recentTravel: false, recentTravelDetails: '' }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${!formData.recentTravel ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, recentTravel: true }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${formData.recentTravel ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          Sí
                        </button>
                      </div>
                    </div>

                    {formData.recentTravel && (
                      <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Indique el departamento o lugar al que viajó más recientemente: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="recentTravelDetails"
                          value={formData.recentTravelDetails}
                          onChange={handleChange}
                          placeholder="Ej. Último viaje: Barranquilla, zona de alto impacto por filarias"
                          className="w-full px-3.5 py-2 bg-white border border-sky-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Pregunta 4: Acceso a zonas rurales */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">4. ¿Acceso a zonas rurales o boscosas?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, ruralAccess: false }))}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${!formData.ruralAccess ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, ruralAccess: true }))}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${formData.ruralAccess ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {/* Pregunta 5: Historial de parásitos */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">5. ¿Historial de pulgas, garrapatas o ácaros?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, parasiteExposure: false }))}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${!formData.parasiteExposure ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, parasiteExposure: true }))}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${formData.parasiteExposure ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {/* Pregunta 6: Agua estancada */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">6. ¿Ingesta de agua no potable o estancada?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, outdoorWater: false }))}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${!formData.outdoorWater ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, outdoorWater: true }))}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${formData.outdoorWater ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {/* Pregunta 7: Rescate costero */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">7. ¿Rescatado recientemente de zona costera?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, coastalRescue: false, coastalRescueLocation: '' }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${!formData.coastalRescue ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, coastalRescue: true }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${formData.coastalRescue ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          Sí
                        </button>
                      </div>
                    </div>

                    {formData.coastalRescue && (
                      <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ¿De qué zona costera fue rescatado? <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.coastalRescueLocation || ''}
                          onChange={(e) => setFormData((prev) => ({ ...prev, coastalRescueLocation: e.target.value }))}
                          placeholder="Ej. Santa Marta, Cartagena, Barranquilla, Buenaventura, Tumaco..."
                          className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-2xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ============================================================== */}
                {/* OTROS FACTORES DE RIESGO: EXACTAMENTE COMO EN LA IMAGEN DE USUARIO */}
                {/* Input con "+ Agregar" (media_1791475770113.png)                 */}
                {/* ============================================================== */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    OTROS FACTORES DE RIESGO
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newRiskFactorInput}
                      onChange={(e) => setNewRiskFactorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRiskFactor();
                        }
                      }}
                      placeholder="Ej. vive en finca, contacto con fauna silvestre... (Enter)"
                      className="flex-1 px-4 py-2.5 bg-white border border-sky-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddRiskFactor}
                      className="px-5 py-2.5 bg-[#00629b] hover:bg-[#004e7c] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* Tags de factores agregados */}
                  {otherRiskFactorsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in duration-150">
                      {otherRiskFactorsList.map((factor, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-200 shadow-2xs"
                        >
                          <span>• {factor}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRiskFactor(index)}
                            className="text-sky-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                            title="Eliminar factor"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 4: INFORMACIÓN MÉDICA INICIAL                       */}
          {/* ========================================================== */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🩺</span> Paso 4: Información Médica Inicial
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anamnesis inicial. Los síntomas clínicos no son obligatorios si acude por consulta general o chequeo preventivo.
                </p>
              </div>

              {/* CHIPS DE LOS 17 SÍNTOMAS (OPCIONAL) */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Seleccione los Síntomas Clínicos y Signos Observados (Opcional):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Dejar en blanco si el paciente acude por consulta preventiva o control general sin signos ni síntomas patológicos.
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {formData.selectedSymptoms.length} seleccionados
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map((sym) => {
                    const isSelected = formData.selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#6F2BCC] text-white border-[#6F2BCC] shadow-2xs scale-102'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sym}
                      </button>
                    );
                  })}
                </div>

                {formData.selectedSymptoms.includes('Otro') && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Especifique otros síntomas y signos observados
                    </label>
                    <input
                      type="text"
                      name="otherSymptomText"
                      value={formData.otherSymptomText}
                      onChange={handleChange}
                      placeholder="Ej. Salivación excesiva, ataxia, temblores..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs placeholder-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Hallazgos físicos, tipo de consulta y estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Consulta *</label>
                  <select
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white"
                  >
                    <option value="">Seleccione tipo de consulta...</option>
                    <option value="Consulta General">Consulta General</option>
                    <option value="Urgencia Médica">Urgencia Médica</option>
                    <option value="Control de Rutina">Control de Rutina</option>
                    <option value="Especialidad">Especialidad / Interconsulta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado General al Ingreso *</label>
                  <select
                    name="generalCondition"
                    value={formData.generalCondition}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white"
                  >
                    <option value="">Seleccione estado general...</option>
                    <option value="Bueno">Bueno (Estable)</option>
                    <option value="Regular">Regular (Alerta)</option>
                    <option value="Malo">Malo (Comprometido)</option>
                    <option value="Crítico">Crítico (UCI)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Hallazgos Clínicos al Examen Físico
                  </label>
                  <textarea
                    name="physicalFindings"
                    value={formData.physicalFindings}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ej. Condición corporal 3/5, auscultación cardiopulmonar normal, abdomen blando no doloroso..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* CARGAR CUADRO HEMÁTICO / HEMOGRAMA */}
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🩸</span> Cuadro Hemático / Hemograma del Paciente (Opcional)
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Cargue el reporte laboratorial (PDF o imagen) y/o registre los parámetros hematológicos observados.
                    </p>
                  </div>
                  {formData.cuadroHematicoFileName ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
                      <span>✓</span> Reporte adjunto
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Opcional para correlación clínica
                    </span>
                  )}
                </div>

                {/* Zona de Carga de Archivo */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex-1 w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 hover:border-[#6F2BCC] bg-purple-50/30 hover:bg-purple-50/60 rounded-xl cursor-pointer transition-all text-center">
                    <span className="text-2xl mb-1">📄</span>
                    <span className="text-xs font-bold text-[#6F2BCC]">
                      {formData.cuadroHematicoFileName ? 'Cambiar archivo de cuadro hemático' : 'Seleccionar o arrastrar Cuadro Hemático'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PDF, JPG, PNG, DOCX (Hasta 15MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleCuadroHematicoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.cuadroHematicoFileName && (
                    <div className="w-full sm:w-auto p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between sm:justify-start gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px]">
                          {formData.cuadroHematicoFileName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formData.cuadroHematicoFileSize || 'Archivo cargado'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCuadroHematico}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Eliminar archivo"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Parámetros Hematológicos Numéricos Opcionales */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">
                    Valores clave del hemograma (opcional para correlación diagnóstica):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Hematocrito (Hto)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          name="cuadroHematicoHematocrito"
                          value={formData.cuadroHematicoHematocrito}
                          onChange={handleNumericChange('cuadroHematicoHematocrito', true)}
                          placeholder="37.5"
                          className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold select-none">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Hemoglobina (Hb)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          name="cuadroHematicoHemoglobina"
                          value={formData.cuadroHematicoHemoglobina}
                          onChange={handleNumericChange('cuadroHematicoHemoglobina', true)}
                          placeholder="12.0"
                          className="w-full pl-3 pr-11 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold select-none">
                          g/dL
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Leucocitos Totales
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="cuadroHematicoLeucocitos"
                          value={formData.cuadroHematicoLeucocitos}
                          onChange={handleNumericChange('cuadroHematicoLeucocitos', false)}
                          placeholder="12500"
                          className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold select-none">
                          /µL
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Plaquetas
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="cuadroHematicoPlaquetas"
                          value={formData.cuadroHematicoPlaquetas}
                          onChange={handleNumericChange('cuadroHematicoPlaquetas', false)}
                          placeholder="195000"
                          className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-purple-400"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold select-none">
                          /µL
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Observaciones de Frotis Sanguíneo / Morfología Celular
                      </label>
                      <input
                        type="text"
                        name="cuadroHematicoObservaciones"
                        value={formData.cuadroHematicoObservaciones}
                        onChange={handleChange}
                        placeholder="Ej. Anisocitosis moderada, presencia de inclusiones celulares o sospecha de hemoparásitos..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 5: ESTADO DE VACUNACIÓN Y PREVENCIÓN                */}
          {/* ========================================================== */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>💉</span> Paso 5: Estado de Vacunación y Prevención
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registre el historial inmunológico y los esquemas antiparasitarios. <strong>Si el esquema es desconocido, no se requerirá fecha.</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {/* Esquema de Vacunación */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">Esquema de Vacunación</h5>
                      <span className="text-[11px] text-slate-500">Rabia, Polivalente (DHPPi/L o Triple Felina)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estado del Esquema *</label>
                    <select
                      name="vaccinationStatus"
                      value={formData.vaccinationStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          vaccinationStatus: val,
                          lastVaccinationDate: val === 'Desconocido' ? '' : prev.lastVaccinationDate,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                    >
                      <option value="">Seleccione estado...</option>
                      <option value="Al día">Al día (Completo)</option>
                      <option value="Incompleto">Incompleto / Pendiente de refuerzo</option>
                      <option value="Desconocido">Desconocido / Sin registro</option>
                    </select>
                  </div>

                  {/* REQUERIMIENTO ESTRICTO: Si es Desconocido, NO muestra ni pide fecha */}
                  {formData.vaccinationStatus && formData.vaccinationStatus !== 'Desconocido' && (
                    <div className="animate-in fade-in duration-150">
                      <label className="block font-bold text-slate-700 mb-1">Fecha de Última Vacunación *</label>
                      <input
                        type="date"
                        name="lastVaccinationDate"
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.lastVaccinationDate}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
                      />
                    </div>
                  )}

                  {formData.vaccinationStatus === 'Desconocido' && (
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 text-[11px] italic flex items-center gap-1.5 animate-in fade-in duration-150">
                      <span>ℹ️</span>
                      <span>Esquema desconocido: No se requiere registro de fecha.</span>
                    </div>
                  )}
                </div>

                {/* Desparasitación Interna y Externa */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💊</span>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">Desparasitación Interna y Externa</h5>
                      <span className="text-[11px] text-slate-500">Antiparasitarios orales y pipetas / collares</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estado de Desparasitación *</label>
                    <select
                      name="dewormingStatus"
                      value={formData.dewormingStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          dewormingStatus: val,
                          lastDewormingDate: val === 'Desconocido' ? '' : prev.lastDewormingDate,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                    >
                      <option value="">Seleccione estado...</option>
                      <option value="Al día">Al día (Vigente)</option>
                      <option value="Incompleto">Incompleto / Vencido</option>
                      <option value="Desconocido">Desconocido / Sin registro</option>
                    </select>
                  </div>

                  {/* REQUERIMIENTO ESTRICTO: Si es Desconocido, NO muestra ni pide fecha */}
                  {formData.dewormingStatus && formData.dewormingStatus !== 'Desconocido' && (
                    <div className="animate-in fade-in duration-150">
                      <label className="block font-bold text-slate-700 mb-1">Fecha de Última Desparasitación *</label>
                      <input
                        type="date"
                        name="lastDewormingDate"
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.lastDewormingDate}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
                      />
                    </div>
                  )}

                  {formData.dewormingStatus === 'Desconocido' && (
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 text-[11px] italic flex items-center gap-1.5 animate-in fade-in duration-150">
                      <span>ℹ️</span>
                      <span>Tratamiento desconocido: No se requiere registro de fecha.</span>
                    </div>
                  )}
                </div>

                {/* Identificación con Microchip */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏷️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">Microchip de Identificación</h5>
                      <span className="text-[11px] text-slate-500">Transpondedor subcutáneo ISO 11784/11785</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      ¿Cuenta con microchip implantado? * {formData.hasMicrochip === null && <span className="text-amber-600 font-normal">(Seleccione Sí o No)</span>}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, hasMicrochip: false, microchipNumber: '' }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.hasMicrochip === false
                            ? 'bg-slate-700 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, hasMicrochip: true }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.hasMicrochip === true
                            ? 'bg-[#6F2BCC] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {formData.hasMicrochip === true && (
                    <div className="animate-in fade-in duration-150 pt-1">
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                        Número de Microchip *
                      </label>
                      <input
                        type="text"
                        name="microchipNumber"
                        value={formData.microchipNumber}
                        onChange={handleChange}
                        placeholder="Ej. 900215001234567 (15 dígitos)"
                        className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl font-mono text-xs font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Salida del País / Viajes Internacionales */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✈️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">Historial Internacional</h5>
                      <span className="text-[11px] text-slate-500">Tránsito fronterizo y viajes al exterior</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      ¿El paciente ha salido del país? * {formData.hasTraveledAbroad === null && <span className="text-amber-600 font-normal">(Seleccione Sí o No)</span>}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, hasTraveledAbroad: false, lastCountryVisited: '' }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.hasTraveledAbroad === false
                            ? 'bg-slate-700 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, hasTraveledAbroad: true }))}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.hasTraveledAbroad === true
                            ? 'bg-[#6F2BCC] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {formData.hasTraveledAbroad === true && (
                    <div className="animate-in fade-in duration-150 pt-1">
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                        Último país que visitó *
                      </label>
                      <input
                        type="text"
                        name="lastCountryVisited"
                        value={formData.lastCountryVisited}
                        onChange={handleChange}
                        placeholder="Ej. Estados Unidos, México, España, Brasil, Panamá..."
                        className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Notas preventivas */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Notas y Observaciones de Prevención
                  </label>
                  <textarea
                    name="preventionNotes"
                    value={formData.preventionNotes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Ej. Marcas administradas, reacciones previas a biológicos o plan profiláctico sugerido..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 6: DATOS DE INGRESO                                  */}
          {/* ========================================================== */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>⚖️</span> Paso 6: Datos de Ingreso (Peso, Antecedentes y Signos Vitales)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ingrese el peso actual, antecedentes médicos y signos vitales. <strong>Los campos están vacíos con ejemplos en gris para evitar confusiones.</strong>
                </p>
              </div>

              {/* Peso de ingreso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peso de Ingreso *</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      name="weight"
                      value={formData.weight}
                      onChange={handleNumericChange('weight', true)}
                      placeholder="4.2"
                      className="w-full pl-3.5 pr-12 py-2.5 border border-sky-300 bg-sky-50/50 rounded-xl font-bold text-sky-950 text-sm placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 pointer-events-none select-none">
                      kg
                    </span>
                  </div>
                </div>

                {/* REQUERIMIENTO: Signos vitales solo se ingresan números, las letras se colocan solas */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frecuencia Cardíaca</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="vitalSignsHeartRate"
                      value={formData.vitalSignsHeartRate}
                      onChange={handleNumericChange('vitalSignsHeartRate', false)}
                      placeholder="120"
                      className="w-full pl-3.5 pr-14 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 pointer-events-none select-none">
                      bpm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Temperatura Corporal</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      name="vitalSignsTemp"
                      value={formData.vitalSignsTemp}
                      onChange={handleNumericChange('vitalSignsTemp', true)}
                      placeholder="38.5"
                      className="w-full pl-3.5 pr-12 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 pointer-events-none select-none">
                      °C
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frecuencia Respiratoria</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="vitalSignsResp"
                      value={formData.vitalSignsResp}
                      onChange={handleNumericChange('vitalSignsResp', false)}
                      placeholder="22"
                      className="w-full pl-3.5 pr-14 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 pointer-events-none select-none">
                      rpm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado de Mucosas</label>
                  <input
                    type="text"
                    name="vitalSignsMucosa"
                    value={formData.vitalSignsMucosa}
                    onChange={handleChange}
                    placeholder="Ej. Rosadas y húmedas, Pálidas, Ictéricas..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tiempo de Llenado Capilar (TLLC)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      name="vitalSignsCapillaryRefillTime"
                      value={formData.vitalSignsCapillaryRefillTime}
                      onChange={handleNumericChange('vitalSignsCapillaryRefillTime', true)}
                      placeholder="1-2"
                      className="w-full pl-3.5 pr-24 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 pointer-events-none select-none">
                      segundos
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Tiempo de retorno capilar medido en segundos (normal: &lt; 2 seg).
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Antecedentes Médicos / Patológicos Previos
                  </label>
                  <textarea
                    name="medicalBackground"
                    value={formData.medicalBackground}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ej. Cirugías anteriores, enfermedades crónicas, episodios previos de infecciones o tratamientos prolongados..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Solicitud qPCR (Redirección al proceso diagnóstico completo) */}
              <div className="p-4 bg-purple-50/60 border border-purple-200/90 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <span>🔬</span> Solicitar qPCR
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">
                      ¿Desea iniciar la orden de examen molecular qPCR para este paciente?
                    </span>
                  </div>

                  {/* Selector interactivo Sí / No */}
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-purple-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, requestExam: true }))}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        formData.requestExam
                          ? 'bg-[#6F2BCC] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>✓</span> Sí, solicitar qPCR
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, requestExam: false }))}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !formData.requestExam
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {formData.requestExam && (
                  <div className="pt-3 border-t border-purple-200/80 animate-in fade-in duration-150">
                    <div className="p-3 bg-white/95 border border-purple-200 rounded-xl flex items-start gap-2.5 text-xs text-purple-950">
                      <span className="text-base shrink-0">🧬</span>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">
                          Redirección inmediata al proceso diagnóstico completo:
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Al registrar al paciente, será redirigido inmediatamente al módulo de <strong>Solicitar examen</strong>. Los datos del paciente quedarán <strong>preguardados como dato quemado</strong>, y pasará por todo el proceso diagnóstico interactivo (selección de síndromes clínicos, hallazgos, perfiles qPCR recomendados y confirmación de la orden).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 7: RESUMEN DE TODA LA INFORMACIÓN EN TABLA          */}
          {/* Con posibilidad de editar antes de guardar definitivamente */}
          {/* ========================================================== */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📋</span> Paso 7: Resumen General de la Información
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Revise toda la información en la tabla a continuación. Puede pulsar en <strong>Editar ✏️</strong> en cualquier sección si necesita corregir algún dato antes de registrar al paciente.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                  ✓ Listo para confirmación
                </span>
              </div>

              {/* TABLA DE RESUMEN SECCIÓN POR SECCIÓN (ESTILO FIGMA ELEGANTE Y COLORES SUAVES) */}
              <div className="space-y-4">
                {/* 1. TUTOR / PROPIETARIO */}
                <div className="bg-white border border-sky-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-3 border-b border-sky-100 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>👤</span> Datos del tutor / propietario
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleEditSection(1)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      <span>Editar</span>
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3.5 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Tutor responsable</span>
                      <span className="text-slate-900 font-bold">{formData.ownerFirstName} {formData.ownerLastName}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Documento tutor</span>
                      <span className="text-slate-900 font-bold">{formData.ownerDocumentType} {formData.ownerDocumentNumber || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Teléfono principal</span>
                      <span className="text-slate-800 font-medium">{formData.ownerPhone || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Número emergencia</span>
                      <span className="text-slate-800 font-medium">{formData.ownerEmergencyPhone || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Correo electrónico</span>
                      <span className="text-slate-800 font-medium truncate">{formData.ownerEmail || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Departamento</span>
                      <span className="text-slate-800 font-medium">{formData.ownerDepartment || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Ciudad / Municipio</span>
                      <span className="text-slate-800 font-medium">{formData.ownerCity || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Estrato</span>
                      <span className="text-slate-800 font-medium">{formData.ownerStratum || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:col-span-2">
                      <span className="text-slate-500 w-32 shrink-0">Dirección</span>
                      <span className="text-slate-800 font-medium">{formData.ownerAddress || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. IDENTIFICACIÓN DE LA MASCOTA */}
                <div className="bg-white border border-sky-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-3 border-b border-sky-100 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>🐶</span> Identificación de la mascota
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleEditSection(2)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      <span>Editar</span>
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3.5 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Nombre de la mascota</span>
                      <span className="text-slate-800 font-medium">{formData.name}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Apellidos del tutor</span>
                      <span className="text-slate-800 font-medium">{formData.ownerLastName || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Nombre oficial</span>
                      <span className="text-[#6F2BCC] font-extrabold">{fullPatientName}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Especie</span>
                      <span className="text-slate-800 font-medium">
                        {formData.species === 'Otro' ? `Otro (${formData.otherSpecies || 'No especificado'})` : formData.species}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Raza</span>
                      <span className="text-slate-800 font-medium">{formData.breed || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Sexo</span>
                      <span className="text-slate-800 font-medium">{formData.sex || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Fecha nacimiento</span>
                      <span className="text-slate-800 font-medium">{formData.birthDate || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Edad calculada</span>
                      <span className="text-slate-800 font-bold">{calculatedAge || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-32 shrink-0">Esterilizado(a)</span>
                      <span className="text-slate-800 font-medium">
                        {formData.isSterilized ? 'Sí (Esterilizado/Castrado)' : 'No (Entero)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:col-span-3 pt-1 border-t border-slate-100">
                      <span className="text-slate-500 w-32 shrink-0">Alergia conocida</span>
                      <span className="text-slate-800 font-medium">
                        {formData.hasAllergies ? `Sí: ${formData.allergies || 'Alergia reportada'}` : 'Ninguna conocida'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. FACTORES DE RIESGO */}
                <div className="bg-white border border-sky-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-3 border-b border-sky-100 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>🌲</span> Factores de riesgo epidemiológicos
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleEditSection(3)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      <span>Editar</span>
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3.5 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Entorno vivienda</span>
                      <span className="text-slate-800 font-medium">{formData.housingArea || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Tipo de vivienda</span>
                      <span className="text-slate-800 font-medium">
                        {formData.housingType === 'Otro' ? (formData.otherHousingType || 'Otro') : (formData.housingType || '—')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Hábitat</span>
                      <span className="text-slate-800 font-medium">{formData.habitat || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Contacto exterior</span>
                      <span className="text-slate-800 font-medium">
                        {formData.contactOutside ? `Sí (${formData.contactOutsideType || 'No especificado'})` : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Convive animales</span>
                      <span className="text-slate-800 font-medium">
                        {formData.livesWithOtherAnimals
                          ? `Sí (${formData.cohabitingSpecies.length > 0 ? formData.cohabitingSpecies.join(', ') : 'Especies registradas'})`
                          : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Viaje departamental</span>
                      <span className="text-slate-800 font-medium">
                        {formData.recentTravel ? `Sí (${formData.recentTravelDetails || 'Reportado'})` : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Zonas rurales/boscosas</span>
                      <span className="text-slate-800 font-medium">{formData.ruralAccess ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Historial parásitos</span>
                      <span className="text-slate-800 font-medium">{formData.parasiteExposure ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Aguas estancadas</span>
                      <span className="text-slate-800 font-medium">{formData.outdoorWater ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:col-span-2">
                      <span className="text-slate-500 w-36 shrink-0">Rescate costero</span>
                      <span className="text-slate-800 font-medium">
                        {formData.coastalRescue ? `Sí${formData.coastalRescueLocation ? ` (${formData.coastalRescueLocation})` : ''}` : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:col-span-3 pt-1 border-t border-slate-100">
                      <span className="text-slate-500 w-36 shrink-0">Otros factores de riesgo</span>
                      <span className="text-slate-800 font-medium">
                        {otherRiskFactorsList.length > 0 ? otherRiskFactorsList.join(', ') : 'Ninguno reportado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. INFORMACIÓN MÉDICA */}
                <div className="bg-white border border-sky-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-3.5 border-b border-sky-100 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>🩺</span> Información médica inicial
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleEditSection(4)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      <span>Editar</span>
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3.5 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Estado clínico general</span>
                      <span className="text-slate-800 font-bold">{formData.generalCondition || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Tipo de atención</span>
                      <span className="text-slate-800 font-medium">{formData.consultationType || '—'}</span>
                    </div>
                    <div className="flex items-start justify-between sm:justify-start gap-4 sm:col-span-3 pt-1 border-t border-slate-100">
                      <span className="text-slate-500 w-36 shrink-0">Síntomas y signos</span>
                      <span className="text-slate-800 font-medium">
                        {formData.selectedSymptoms.length > 0
                          ? [...formData.selectedSymptoms, ...(formData.otherSymptomText?.trim() ? [formData.otherSymptomText.trim()] : [])].join(', ')
                          : 'Ninguno reportado'}
                      </span>
                    </div>
                    {formData.physicalFindings && (
                      <div className="flex items-start justify-between sm:justify-start gap-4 sm:col-span-3 pt-1 border-t border-slate-100">
                        <span className="text-slate-500 w-36 shrink-0">Hallazgos clínicos</span>
                        <span className="text-slate-800 font-medium">{formData.physicalFindings}</span>
                      </div>
                    )}
                    {formData.hasCuadroHematico && (
                      <div className="flex items-start justify-between sm:justify-start gap-4 sm:col-span-3 pt-1 border-t border-slate-100">
                        <span className="text-slate-500 w-36 shrink-0">Cuadro hemático</span>
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            <span>📄</span>
                            <span>{formData.cuadroHematicoFileName || 'Reporte adjunto'}</span>
                            {formData.cuadroHematicoFileSize && <span className="text-[10px] text-emerald-600 font-normal">({formData.cuadroHematicoFileSize})</span>}
                          </span>
                          {(formData.cuadroHematicoHematocrito || formData.cuadroHematicoHemoglobina || formData.cuadroHematicoLeucocitos || formData.cuadroHematicoPlaquetas) && (
                            <div className="text-[11px] text-slate-700 flex items-center gap-2.5 flex-wrap font-medium">
                              {formData.cuadroHematicoHematocrito && <span>Hto: <strong>{formData.cuadroHematicoHematocrito}%</strong></span>}
                              {formData.cuadroHematicoHemoglobina && <span>Hb: <strong>{formData.cuadroHematicoHemoglobina} g/dL</strong></span>}
                              {formData.cuadroHematicoLeucocitos && <span>Leucocitos: <strong>{formData.cuadroHematicoLeucocitos} /µL</strong></span>}
                              {formData.cuadroHematicoPlaquetas && <span>Plaquetas: <strong>{formData.cuadroHematicoPlaquetas} /µL</strong></span>}
                            </div>
                          )}
                          {formData.cuadroHematicoObservaciones && (
                            <p className="text-[11px] text-slate-600 italic">
                              * Observaciones: {formData.cuadroHematicoObservaciones}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. VACUNACIÓN Y PREVENCIÓN */}
                <div className="bg-white border border-sky-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-3 border-b border-sky-100 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>💉</span> Vacunación y prevención
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleEditSection(5)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      <span>Editar</span>
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Esquema vacunación</span>
                      <span className="text-slate-800 font-medium">
                        {formData.vaccinationStatus || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Fecha última vacuna</span>
                      <span className="text-slate-800 font-medium">
                        {formData.vaccinationStatus === 'Desconocido' ? 'No requerida (Desconocido)' : (formData.lastVaccinationDate || 'No registrada')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Desparasitación</span>
                      <span className="text-slate-800 font-medium">
                        {formData.dewormingStatus || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Fecha desparasitación</span>
                      <span className="text-slate-800 font-medium">
                        {formData.dewormingStatus === 'Desconocido' ? 'No requerida (Desconocido)' : (formData.lastDewormingDate || 'No registrada')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Microchip</span>
                      <span className="text-slate-800 font-medium">
                        {formData.hasMicrochip ? `Sí (N°: ${formData.microchipNumber || 'Registrado'})` : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Salida del país</span>
                      <span className="text-slate-800 font-medium">
                        {formData.hasTraveledAbroad ? `Sí (Último país: ${formData.lastCountryVisited || 'Registrado'})` : 'No'}
                      </span>
                    </div>
                    {formData.preventionNotes && (
                      <div className="sm:col-span-2 pt-1 border-t border-slate-100 flex items-start justify-between sm:justify-start gap-4">
                        <span className="text-slate-500 w-36 shrink-0">Notas de prevención</span>
                        <span className="text-slate-800 font-medium">{formData.preventionNotes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. DATOS DE INGRESO Y SIGNOS VITALES */}
                <div className="bg-white border border-sky-200/90 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-3 border-b border-sky-100 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>⚖️</span> Datos de ingreso y signos vitales
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleEditSection(6)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      <span>Editar</span>
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3.5 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Peso de ingreso</span>
                      <span className="text-[#6F2BCC] font-extrabold">
                        {formData.weight ? (formData.weight.includes('kg') ? formData.weight : `${formData.weight} kg`) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Frecuencia cardíaca</span>
                      <span className="text-slate-800 font-medium">
                        {formData.vitalSignsHeartRate ? (formData.vitalSignsHeartRate.includes('bpm') ? formData.vitalSignsHeartRate : `${formData.vitalSignsHeartRate} bpm`) : 'No registrada'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Temperatura corporal</span>
                      <span className="text-slate-800 font-medium">
                        {formData.vitalSignsTemp ? (formData.vitalSignsTemp.includes('°') ? formData.vitalSignsTemp : `${formData.vitalSignsTemp} °C`) : 'No registrada'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Frecuencia respiratoria</span>
                      <span className="text-slate-800 font-medium">
                        {formData.vitalSignsResp ? (formData.vitalSignsResp.includes('rpm') ? formData.vitalSignsResp : `${formData.vitalSignsResp} rpm`) : 'No registrada'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Estado de mucosas</span>
                      <span className="text-slate-800 font-medium">{formData.vitalSignsMucosa || 'No registrado'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Llenado capilar (TLLC)</span>
                      <span className="text-slate-800 font-medium">
                        {formData.vitalSignsCapillaryRefillTime
                          ? (formData.vitalSignsCapillaryRefillTime.includes('seg')
                              ? formData.vitalSignsCapillaryRefillTime
                              : `${formData.vitalSignsCapillaryRefillTime} segundos`)
                          : 'No registrado'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-slate-500 w-36 shrink-0">Solicitar qPCR</span>
                      <span className={`font-semibold ${formData.requestExam ? 'text-[#6F2BCC]' : 'text-slate-800'}`}>
                        {formData.requestExam ? 'Sí (Redirección al proceso diagnóstico qPCR)' : 'No'}
                      </span>
                    </div>
                    {formData.medicalBackground && (
                      <div className="sm:col-span-3 pt-2 border-t border-slate-100 flex items-start justify-between sm:justify-start gap-4">
                        <span className="text-slate-500 w-36 shrink-0">Antecedentes previos</span>
                        <span className="text-slate-800 font-medium">{formData.medicalBackground}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Navegación Inferior */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-white transition-colors cursor-pointer"
              >
                ← Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isEditingFromSummary && currentStep < 7 && (
              <button
                type="button"
                onClick={() => {
                  setIsEditingFromSummary(false);
                  setCurrentStep(7);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer mr-1"
              >
                Cancelar edición
              </button>
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{isEditingFromSummary ? 'Guardar y volver al Resumen 📋' : 'Siguiente Paso'}</span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <span>✓</span>
                <span>{submitting ? 'Registrando en Plataforma...' : 'Confirmar y Registrar Paciente'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
