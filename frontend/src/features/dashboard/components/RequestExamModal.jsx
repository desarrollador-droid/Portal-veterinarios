import React, { useState, useMemo, useEffect } from 'react';
import {
  qpcrApi,
  LOCAL_QPCR_PROFILES_MASTER,
  LOCAL_INFECTIOUS_AGENTS_DB,
  CLINICAL_SYNDROMES_LIST,
  matchSyndromeTokens,
} from '../services/qpcrApi.js';
import {
  CLINICAL_CATEGORIES,
  CLINICAL_EXAMS,
} from '../data/clinicalCatalogData.js';
import MicrobiotaOrderForm from './MicrobiotaOrderForm.jsx';
import { hasReportedAllergy, isNegativeAllergyText } from '../utils/allergyHelpers.js';
import ClinicalOrderForm from './ClinicalOrderForm.jsx';
import { authService } from '../../auth/services/authService.js';


// ============================================================================
// 1. CATÁLOGO DE SÍNDROMES CLÍNICOS VINCULADOS A LA TABLA OFICIAL (12 AGENTES)
// ============================================================================
export const SYNDROMES_LIST = [
  {
    id: 'Hemotrópico/Sistémico',
    name: 'Hemotrópico/Sistémico',
    desc: 'Anemia, fiebre, trombocitopenia, petequias, linfadenopatía',
    icon: '🩸',
    symptoms: [
      'Trombocitopenia',
      'Anemia',
      'Fiebre',
      'Petequias',
      'Epistaxis',
      'Palidez de mucosas',
      'Letargia',
      'Linfadenopatía',
      'Esplenomegalia',
      'Decaimiento',
    ],
  },
  {
    id: 'Neurológico',
    name: 'Neurológico & Muscular',
    desc: 'Dolor generalizado, hiperestesia, atrofia muscular, convulsiones',
    icon: '🧠',
    symptoms: [
      'Dolor generalizado',
      'Hiperestesia',
      'Atrofia muscular',
      'Renuencia a moverse',
      'Convulsiones',
      'Poliartritis',
      'Cojera',
      'Ataxia',
      'Paresia',
    ],
  },
  {
    id: 'Ocular',
    name: 'Ocular & Oftálmico',
    desc: 'Uveítis, secreción mucopurulenta, glaucoma',
    icon: '👁️',
    symptoms: [
      'Uveítis',
      'Glaucoma',
      'Secreción ocular mucopurulenta',
      'Blefaroespasmo',
      'Edema corneal',
      'Conjuntivitis',
    ],
  },
  {
    id: 'Cardíaco',
    name: 'Cardiopulmonar & Endovascular',
    desc: 'Endocarditis, hipertensión pulmonar, soplo, arritmias',
    icon: '❤️',
    symptoms: [
      'Endocarditis',
      'Soplo',
      'Hipertensión pulmonar',
      'Arritmias',
      'Tos',
      'Disnea',
      'Intolerancia al ejercicio',
      'Edema periférico',
    ],
  },
  {
    id: 'Digestivo-Hepático',
    name: 'Síndrome Digestivo-Hepático',
    desc: 'Ictericia, hepatomegalia, anemia hemolítica, vómito, disfunción gastrointestinal y hepática',
    icon: '🟡',
    symptoms: [
      'Ictericia',
      'Anemia hemolítica',
      'Hepatomegalia',
      'Esplenomegalia',
      'Vómito',
      'Diarrea',
      'Palidez de mucosas',
      'Fiebre intermitente',
      'Decaimiento',
      'Anorexia',
    ],
  },
  {
    id: 'Nefrológico',
    name: 'Síndrome Nefrológico',
    desc: 'Glomerulonefritis mediada por inmunocomplejos, proteinuria, azotemia, hematuria, nefropatía infecciosa',
    icon: '🫘',
    symptoms: [
      'Proteinuria',
      'Azotemia / Uremia',
      'Hematuria',
      'Glomerulonefritis',
      'Poliuria / Polidipsia',
      'Oliguria / Anuria',
      'Dolor a la palpación renal',
      'Hipertensión renal',
      'Edema periférico / Ascitis',
      'Letargia urémica',
    ],
  },
  {
    id: 'Infeccioso viral',
    name: 'Infeccioso General / Fiebre',
    desc: 'Fiebre persistente, anorexia, pérdida de peso',
    icon: '🦠',
    symptoms: [
      'Fiebre',
      'Anorexia',
      'Pérdida de peso',
      'Letargia',
      'Vómito',
      'Linfadenomegalia',
      'Decaimiento',
    ],
  },
  {
    id: 'Respiratorio',
    name: 'Respiratorio & Filarial',
    desc: 'Tos, disnea, daño vascular pulmonar',
    icon: '🫁',
    symptoms: [
      'Tos',
      'Disnea',
      'Hipertensión pulmonar',
      'Epistaxis',
      'Intolerancia al ejercicio',
      'Fiebre',
    ],
  },
  {
    id: 'Dermatológico/Cutáneo',
    name: 'Dermatológico / Cutáneo (Piel)',
    desc: 'Petequias, equimosis, vasculitis dérmica, úlceras, alopecia, prurito, dermatitis',
    icon: '🩹',
    symptoms: [
      'Petequias',
      'Equimosis',
      'Vasculitis cutánea',
      'Lesiones cutáneas',
      'Úlceras dérmicas',
      'Prurito',
      'Alopecia',
      'Eritema',
      'Pápulas / Costras',
      'Edema subcutáneo',
      'Dermatitis',
      'Fragilidad capilar',
    ],
  },
];

// ============================================================================
// 2. CATÁLOGO DE PERFILES qPCR DERIVADO ESTRICTAMENTE DE LOS 12 AGENTES DE LA TABLA
// ============================================================================
export const QPCR_CATALOG = LOCAL_QPCR_PROFILES_MASTER;

// ============================================================================
// 3. BANCO DE SUGERENCIAS RÁPIDAS PARA AGENTES ALTERNATIVOS (DERIVADO DE LA BD OFICIAL)
// ============================================================================
export const AVAILABLE_ALTERNATIVE_AGENTS = LOCAL_INFECTIOUS_AGENTS_DB.map((a) => a.name);

// ============================================================================
// 4. HELPER: EXTRACCIÓN DE AGENTES Y VERIFICACIÓN DE CONTROL PREVIO (PLAZO MÁXIMO 6 MESES)
// ============================================================================
export function extractExamAgents(exam) {
  if (exam?.agents && Array.isArray(exam.agents) && exam.agents.length > 0) {
    return exam.agents;
  }

  const nameNorm = (exam?.testName || '').toLowerCase();
  if (nameNorm.includes('hemotr') || nameNorm.includes('vectorial') || nameNorm.includes('tbp')) {
    return [
      { name: 'Ehrlichia canis', isPositive: true, result: 'POSITIVO (+)', ct: '22.8', load: 'Carga genómica alta' },
      { name: 'Anaplasma platys', isPositive: true, result: 'POSITIVO (+)', ct: '27.4', load: 'Carga genómica moderada' },
      { name: 'Hepatozoon canis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Anaplasma phagocytophilum', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Rickettsia rickettsii', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Mycoplasma haemocanis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Bartonella spp. (canina)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
    ];
  }

  if (nameNorm.includes('microbiota') || nameNorm.includes('disbiosis')) {
    return [
      { name: 'Faecalibacterium', isPositive: false, result: 'Normal', ct: '19.2', load: 'Dentro de rango fisiológico' },
      { name: 'Turicibacter', isPositive: false, result: 'Normal', ct: '21.0', load: 'Dentro de rango fisiológico' },
      { name: 'Clostridium hiranonis', isPositive: false, result: 'Normal', ct: '23.4', load: 'Eubiosis adecuada' },
      { name: 'Blautia', isPositive: false, result: 'Normal', ct: '18.9', load: 'Dentro de rango fisiológico' },
      { name: 'Escherichia coli', isPositive: false, result: 'Normal', ct: '28.1', load: 'Sin sobrecrecimiento' },
      { name: 'Streptococcus', isPositive: false, result: 'Normal', ct: '29.5', load: 'Sin sobrecrecimiento' },
    ];
  }

  if (nameNorm.includes('diarrea') || nameNorm.includes('enter') || nameNorm.includes('gastro')) {
    return [
      { name: 'Cryptosporidium spp.', isPositive: true, result: 'POSITIVO (+)', ct: '24.1', load: 'Carga moderada-alta' },
      { name: 'Clostridium perfringens enterotoxin', isPositive: true, result: 'POSITIVO (+)', ct: '21.8', load: 'Carga bacteriana elevada' },
      { name: 'Giardia lamblia', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Parvovirus canino (CPV-2)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Coronavirus entérico canino (CCoV)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Salmonella enterica', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Campylobacter jejuni', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
    ];
  }

  if (exam?.targets && typeof exam.targets === 'string') {
    return exam.targets
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        isPositive: false,
        result: 'Negativo (-)',
        ct: 'N/D',
        load: 'No detectado',
      }));
  }

  return [];
}

export function getPatientExamHistoryInfo(patient) {
  if (!patient) {
    return {
      hasPreviousExam: false,
      canRequestControl: false,
      daysAgo: null,
      lastExamId: null,
      lastExamDate: null,
      lastExamName: null,
      positiveAgents: [],
      totalBasePrice: 0,
      totalDiscount: 0,
      totalWithDiscount: 0,
      reason: 'Seleccione primero un paciente para verificar si cuenta con exámenes previos',
    };
  }

  // Solo se consideran exámenes reales previos completados o históricos en qpcrExams
  const exams = Array.isArray(patient.qpcrExams) ? patient.qpcrExams : (Array.isArray(patient.exams) ? patient.exams : []);

  // Si activeExamOrder ya fue emitido y tiene resultados completos
  const emittedActiveOrder = patient.activeExamOrder && (
    patient.activeExamOrder.currentStep >= 4 ||
    patient.activeExamOrder.status === 'Resultado enviado' ||
    patient.activeExamOrder.status === 'Completado' ||
    patient.activeExamOrder.status === 'Emitido'
  ) ? patient.activeExamOrder : null;

  const validExams = [...exams];
  if (emittedActiveOrder && !validExams.some((e) => e.id === emittedActiveOrder.id)) {
    validExams.unshift(emittedActiveOrder);
  }

  // REGLA FUNDAMENTAL: De la única forma en que un paciente puede solicitar control, es que haya solicitado un examen anteriormente
  if (validExams.length === 0) {
    return {
      hasPreviousExam: false,
      canRequestControl: false,
      daysAgo: null,
      lastExamId: null,
      lastExamDate: null,
      lastExamName: null,
      positiveAgents: [],
      totalBasePrice: 0,
      totalDiscount: 0,
      totalWithDiscount: 0,
      reason: 'El paciente no ha solicitado ningún examen anteriormente. Debe solicitar un "Examen nuevo".',
    };
  }

  // 1. Buscar en los exámenes previos reales los agentes positivos detectados
  let examWithPositives = null;
  let rawPositiveAgents = [];

  for (const ex of validExams) {
    const list = extractExamAgents(ex);
    const pos = list.filter(
      (a) => a.isPositive || (typeof a.result === 'string' && (a.result.toLowerCase().includes('positivo') || a.result.includes('+')))
    );
    if (pos.length > 0) {
      examWithPositives = ex;
      rawPositiveAgents = pos;
      break;
    }
  }

  const selectedRefExam = examWithPositives || validExams[0];

  let latestDateStr = null;
  let latestId = null;
  let latestExamName = null;
  let sampleType = 'Sangre total con EDTA (2 ml) - Tubo tapón lila';

  if (selectedRefExam) {
    latestDateStr = selectedRefExam.date || selectedRefExam.requestedAt;
    latestId = selectedRefExam.id || selectedRefExam.examCode;
    latestExamName = selectedRefExam.testName || selectedRefExam.name;
    if (selectedRefExam.sampleType) {
      sampleType = selectedRefExam.sampleType;
    }
  }

  // Calcular días transcurridos
  let daysAgo = 90;
  if (latestDateStr) {
    try {
      const s = String(latestDateStr);
      if (s.includes('/')) {
        const parts = s.split(' ')[0].split('/');
        if (parts.length === 3) {
          const d = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
          if (!isNaN(d.getTime())) {
            const diff = Math.abs(new Date().getTime() - d.getTime());
            daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
          }
        }
      } else {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
          const diff = Math.abs(new Date().getTime() - d.getTime());
          daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
        }
      }
    } catch {
      daysAgo = 90;
    }
  }

  // Si el examen previo no tuvo agentes positivos:
  if (rawPositiveAgents.length === 0) {
    return {
      hasPreviousExam: true,
      canRequestControl: false,
      daysAgo,
      lastExamId: latestId || 'PREV-001',
      lastExamDate: latestDateStr || 'Reciente',
      lastExamName: latestExamName || 'Examen previo',
      sampleType,
      positiveAgents: [],
      totalBasePrice: 0,
      totalDiscount: 0,
      totalWithDiscount: 0,
      reason: 'El examen previo no reportó agentes infecciosos positivos para control de seguimiento.',
    };
  }

  // REGLA: Plazo máximo de 6 meses (180 días)
  const canRequestControl = daysAgo <= 180;
  if (!canRequestControl) {
    return {
      hasPreviousExam: true,
      canRequestControl: false,
      daysAgo,
      lastExamId: latestId,
      lastExamDate: latestDateStr,
      lastExamName: latestExamName,
      sampleType,
      positiveAgents: [],
      totalBasePrice: 0,
      totalDiscount: 0,
      totalWithDiscount: 0,
      reason: `El examen previo tiene ${daysAgo} días (supera el límite de 6 meses / 180 días para control).`,
    };
  }

  // Código exacto o derivado (como en Figma: CTRL-3-2026)
  let code = 'CTRL-3-2026';
  if (latestId) {
    const idStr = String(latestId);
    if (idStr.startsWith('CTRL')) {
      code = idStr;
    } else {
      const cleanNum = idStr.replace('ORD-', '').replace('QPCR-', '').replace('2026-', '');
      code = `CTRL-${cleanNum}-2026`;
    }
  }

  let examName = 'Panel qPCR de Control';
  if (latestExamName && typeof latestExamName === 'string') {
    if (latestExamName.toLowerCase().includes('hemotr')) {
      examName = 'Panel Hemotrópico Canino';
    } else {
      examName = latestExamName.replace('qPCR ', '');
    }
  } else if (patient.species && patient.species.toLowerCase().includes('felin')) {
    examName = 'Panel Gastrointestinal Felino';
  }

  let dateFormatted = '03/09/2026';
  if (latestDateStr) {
    const dateStr = String(latestDateStr);
    dateFormatted = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
  }

  // Agentes positivos REALES con 15% de descuento individual
  const positiveAgents = rawPositiveAgents.map((a) => {
    const isEnteric = a.name.toLowerCase().includes('crypto') || a.name.toLowerCase().includes('clostridium') || a.name.toLowerCase().includes('coli') || a.name.toLowerCase().includes('giardia');
    const basePrice = isEnteric ? 35000 : 38000;
    const discount = Math.round(basePrice * 0.15);
    return {
      id: a.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: a.name,
      ct: a.ct || 'N/D',
      load: a.load || 'Carga genómica detectable',
      basePrice,
      discount,
      finalPrice: basePrice - discount,
    };
  });

  const totalBasePrice = positiveAgents.reduce((sum, a) => sum + a.basePrice, 0);
  const totalDiscount = positiveAgents.reduce((sum, a) => sum + a.discount, 0);
  const totalWithDiscount = positiveAgents.reduce((sum, a) => sum + a.finalPrice, 0);

  return {
    hasPreviousExam: true,
    canRequestControl: true,
    daysAgo,
    lastExamId: code,
    lastExamDate: dateFormatted,
    lastExamName: examName,
    sampleType,
    positiveAgents,
    totalBasePrice,
    totalDiscount,
    totalWithDiscount,
    reason: 'Examen previo con agentes positivos dentro de los 6 meses de seguimiento',
  };
}

// Lista oficial de departamentos de Colombia para viajes epidemiológicos
export const COLOMBIAN_DEPARTMENTS_LIST = [
  'Antioquia (Medellín, Rionegro, Urabá)',
  'Bogotá D.C. / Cundinamarca (Girardot, La Vega, Anapoima)',
  'Valle del Cauca (Cali, Palmira, Buenaventura)',
  'Santander (Bucaramanga, San Gil, Barrancabermeja)',
  'Tolima (Ibagué, Melgar, Flandes, Espinal)',
  'Meta (Villavicencio, Acacías, Llanos)',
  'Bolívar (Cartagena, Magangué)',
  'Magdalena (Santa Marta, Ciénaga)',
  'Atlántico (Barranquilla, Soledad)',
  'Huila (Neiva, Pitalito, Garzón)',
  'Caldas / Risaralda / Quindío (Eje Cafetero)',
  'Boyacá (Tunja, Duitama, Villa de Leyva)',
  'Cesar (Valledupar, Aguachica)',
  'Córdoba (Montería, Cereté, Lorica)',
  'La Guajira (Riohacha, Maicao)',
  'San Andrés y Providencia',
  'Casanare (Yopal, Aguazul)',
  'Norte de Santander (Cúcuta, Ocaña)',
  'Nariño (Pasto, Tumaco, Ipiales)',
  'Cauca (Popayán, Santander de Quilichao)',
  'Chocó (Quibdó, Bahía Solano)',
  'Sucre (Sincelejo, Coveñas)',
  'Arauca (Arauca, Saravena)',
  'Caquetá / Putumayo / Amazonía',
  'Viaje Internacional',
  'Otro departamento / Región',
];

// Metadatos visuales oficiales e iconos específicos por tipo de muestra biológica
export const getSampleIconAndColor = (sampleName = '') => {
  const s = (sampleName || '').toLowerCase();
  if (s.includes('edta') || s.includes('lila') || s.includes('sangre')) {
    return { icon: '🩸', badge: 'Tubo Lila (EDTA)', color: 'bg-purple-100 text-purple-900 border-purple-200' };
  }
  if (s.includes('suero') || s.includes('plasma') || s.includes('rojo') || s.includes('amarillo') || s.includes('gel')) {
    return { icon: '🟡', badge: 'Tubo Tapa Roja / Amarilla (Suero)', color: 'bg-amber-100 text-amber-900 border-amber-200' };
  }
  if (s.includes('orina')) {
    return { icon: '🧪', badge: 'Frasco Estéril (Orina)', color: 'bg-yellow-100 text-yellow-900 border-yellow-200' };
  }
  if (s.includes('conjuntiv') || s.includes('ocular') || s.includes('ojo')) {
    return { icon: '👁️', badge: 'Hisopo Conjuntival Estéril', color: 'bg-sky-100 text-sky-900 border-sky-200' };
  }
  if (s.includes('nasal') || s.includes('respirator') || s.includes('orofar') || s.includes('faring')) {
    return { icon: '👃', badge: 'Hisopo Respiratorio Estéril', color: 'bg-teal-100 text-teal-900 border-teal-200' };
  }
  if (s.includes('lcr') || s.includes('cefalorraqu') || s.includes('sinovial') || s.includes('liquido') || s.includes('líquido') || s.includes('efusion')) {
    return { icon: '💧', badge: 'Líquido Biológico Estéril', color: 'bg-cyan-100 text-cyan-900 border-cyan-200' };
  }
  if (s.includes('fecal') || s.includes('heces') || s.includes('rectal')) {
    return { icon: '💩', badge: 'Muestra Fecal en Tubo Estéril', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
  }
  if (s.includes('piel') || s.includes('pelo') || s.includes('raspado') || s.includes('cutane') || s.includes('cutáne')) {
    return { icon: '🔬', badge: 'Raspado / Muestra Cutánea', color: 'bg-rose-100 text-rose-900 border-rose-200' };
  }
  if (s.includes('biopsia') || s.includes('tejido') || s.includes('formol')) {
    return { icon: '🥩', badge: 'Tejido Biopsia en Formol', color: 'bg-orange-100 text-orange-900 border-orange-200' };
  }
  return { icon: '📦', badge: 'Muestra Biológica Específica', color: 'bg-slate-100 text-slate-800 border-slate-200' };
};

export default function RequestExamModal({
  patient: initialPatient,
  patients = [],
  currentUser = null,
  initialExamType = 'nuevo',
  initialRequestCategory = null,
  initialClinicalExam = null,
  onClose,
  onRequest,
  isModal = true,
  onNavigateToTracking,
}) {
  // Función para resolver el nombre del doctor autenticado desde la sesión actual
  const getLoggedInDoctorName = () => {
    const user = currentUser || authService.getCurrentUser();
    if (user) {
      if (user.isVeterinarioAsociado && user.vetNombre) return user.vetNombre;
      if (user.nombreMedico) return user.nombreMedico;
      if (user.director && user.director !== 'Responsable Médico') return user.director;
      if (user.directorMedico?.nombre) return user.directorMedico.nombre;
      if (user.nombreCompleto) return user.nombreCompleto;
      if (user.nombre && !user.nombre.toLowerCase().includes('clinica') && !user.nombre.toLowerCase().includes('veterinaria')) {
        return user.nombre;
      }
      if (user.director) return user.director;
    }
    if (activePatient?.attendingVet && activePatient.attendingVet !== 'Dr. Asignado') {
      return activePatient.attendingVet;
    }
    return 'Dr. Alejandro Morales';
  };

  // Estado de paso actual (Inicia en 1 para validar paciente, esterilización y alergias)
  const [currentStep, setCurrentStep] = useState(1);

  // ============================================================================
  // REQUERIMIENTO PRINCIPAL: El usuario primero debe escoger qué examen va a solicitar.
  // Orden oficial de exámenes:
  // 1. Portafolio Clínico (Clínicas - 223 Pruebas)
  // 2. Biología Molecular (qPCR)
  // 3. Microbiota Gastrointestinal
  // ============================================================================
  const [requestCategory, setRequestCategory] = useState(
    initialRequestCategory || (initialExamType === 'control' ? 'qpcr' : null)
  );

  // ============================================================================
  // ESTADOS PARA SOLICITUD DE CLÍNICAS (PORTAFOLIO OFICIAL 2026 - 223 PRUEBAS)
  // ============================================================================
  const [clinicalSearchTerm, setClinicalSearchTerm] = useState('');
  const [clinicalCategoryFilter, setClinicalCategoryFilter] = useState('all');
  const [selectedClinicalExams, setSelectedClinicalExams] = useState([]);
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [clinicalStep, setClinicalStep] = useState(1); // 1: Selección pruebas, 2: Resumen y despacho
  // Código VetPlus individual por cada examen de clínicas
  // { [examId]: { hasVetPlus: boolean, code: string } }
  const [clinicalExamVetPlus, setClinicalExamVetPlus] = useState({});

  // ============================================================================
  // ESTADOS PARA AGENTES ADICIONALES EN PERFILES qPCR & CHECKLIST DE MUESTRAS
  // ============================================================================
  // Agentes extra añadidos manualmente por perfil: { [profileId]: Array<string> }
  const [addedAgentsByProfile, setAddedAgentsByProfile] = useState({});
  const [isAddingAgentByProfile, setIsAddingAgentByProfile] = useState({});
  const [newAgentInputByProfile, setNewAgentInputByProfile] = useState({});
  // Checklist de confirmación obligatoria de muestras biológicas: { [sampleName]: boolean }
  const [confirmedSamplesChecklist, setConfirmedSamplesChecklist] = useState({});

  // ============================================================================
  // ESTADOS PARA SOLICITUD DE MICROBIOTA (KIT O RECOLECCIÓN)
  // ============================================================================
  const [microbiotaSubtype, setMicrobiotaSubtype] = useState('kit'); // 'kit' | 'recoleccion'
  const [microbiotaKitQuantity, setMicrobiotaKitQuantity] = useState(1);
  const [microbiotaDeliverySede, setMicrobiotaDeliverySede] = useState('Sede Principal - Calle 80');
  const [microbiotaDeliveryAddress, setMicrobiotaDeliveryAddress] = useState('Cra 80 # 45-12, Bogotá');
  const [microbiotaRecipientContact, setMicrobiotaRecipientContact] = useState('Dr. Alejandro Morales');
  const [microbiotaRecipientPhone, setMicrobiotaRecipientPhone] = useState('310 456 7890');
  const [microbiotaDeliveryNotes, setMicrobiotaDeliveryNotes] = useState('');
  const [microbiotaCollectionDate, setMicrobiotaCollectionDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [microbiotaCollectionSede, setMicrobiotaCollectionSede] = useState('Sede Principal - Calle 80');
  const [microbiotaSampleCondition, setMicrobiotaSampleCondition] = useState('Tubo con buffer estabilizador de ADN fecal (4°C)');
  const [microbiotaCollectionNotes, setMicrobiotaCollectionNotes] = useState('');

  // ============================================================================
  // REQUERIMIENTO DEL USUARIO: TODO COMIENZA EN BLANCO PARA EVITAR CONFUSIÓN
  // ============================================================================
  const [examType, setExamType] = useState(() => {
    if (initialExamType === 'control' && initialPatient) {
      const info = getPatientExamHistoryInfo(initialPatient);
      return info.canRequestControl ? 'control' : 'nuevo';
    }
    return 'nuevo';
  });
  const [previousExamCode, setPreviousExamCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Selección de paciente única (solo 1 a la vez, con posibilidad de deseleccionar)
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatient?.id || '');

  // Vista de revisión y confirmación de control directo (Exacto Figma imagen media_1791558838111.png)
  const [isControlReviewOpen, setIsControlReviewOpen] = useState(() => {
    if (initialExamType === 'control' && initialPatient) {
      const info = getPatientExamHistoryInfo(initialPatient);
      return info.canRequestControl;
    }
    return false;
  });

  // Aseguramiento VetPlus (solicitado en la orden del examen, no en el registro)
  const [hasVetPlusInsurance, setHasVetPlusInsurance] = useState(() => {
    return Boolean(initialPatient?.owner?.hasVetPlus);
  });
  const [vetPlusCode, setVetPlusCode] = useState(() => {
    return initialPatient?.owner?.vetPlusCode || '';
  });

  // Estado Clínico del paciente: Asintomático vs Sintomático
  const [isAsymptomatic, setIsAsymptomatic] = useState(() => {
    const val = initialPatient?.isAsymptomatic ?? initialPatient?.medicalAdmission?.isAsymptomatic;
    if (typeof val === 'boolean') return val;
    return null;
  });

  // ============================================================================
  // ESTERILIZACIÓN Y ALERGIAS (Paso 1)
  // Requerimiento: Preguntar esterilización si no está esterilizado previamente;
  // si ya lo está, NO volver a preguntar. Alergias con opción de agregar nuevas.
  // ============================================================================
  const [examIsSterilized, setExamIsSterilized] = useState(() => {
    if (initialPatient?.isSterilized === true) return true;
    if (initialPatient?.isSterilized === false) return false;
    return null;
  });
  const [patientAllergiesList, setPatientAllergiesList] = useState(() => {
    if (Array.isArray(initialPatient?.allergies)) return initialPatient.allergies.filter(Boolean);
    if (typeof initialPatient?.allergies === 'string' && initialPatient.allergies.trim()) {
      return initialPatient.allergies.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  });
  const [hasAllergiesOption, setHasAllergiesOption] = useState(() => {
    if (Array.isArray(initialPatient?.allergies) && initialPatient.allergies.length > 0) return true;
    if (initialPatient?.hasAllergies !== undefined) return Boolean(initialPatient.hasAllergies);
    return null;
  });
  const [newAllergyInput, setNewAllergyInput] = useState('');

  // ============================================================================
  // FACTORES DE RIESGO EPIDEMIOLÓGICOS (Paso 2)
  // Requerimiento: Desde riesgos en adelante es la solicitud de muestra porque
  // estos factores modulan el diagnóstico y recomendación del perfil qPCR.
  // ============================================================================
  const [riskFactors, setRiskFactors] = useState(() => {
    const rf = initialPatient?.riskFactors || {};
    return {
      habitat: rf.habitat || '',
      housingArea: rf.housingArea || '',
      housingType: rf.housingType || '',
      otherHousingType: rf.otherHousingType || '',
      livesWithOtherAnimals: typeof rf.livesWithOtherAnimals === 'boolean' ? rf.livesWithOtherAnimals : null,
      cohabitingSpecies: Array.isArray(rf.cohabitingSpecies) ? rf.cohabitingSpecies : [],
      recentTravel: typeof rf.recentTravel === 'boolean' ? rf.recentTravel : null,
      recentTravelDetails: rf.recentTravelDetails || '',
      ruralAccess: Boolean(rf.ruralAccess),
      parasiteExposure: Boolean(rf.parasiteExposure),
      outdoorWater: Boolean(rf.outdoorWater),
      coastalRescue: Boolean(rf.coastalRescue),
      coastalRescueLocation: rf.coastalRescueLocation || '',
    };
  });
  const [otherRiskFactorsList, setOtherRiskFactorsList] = useState(() => {
    if (initialPatient?.riskFactors?.otherRiskFactors && typeof initialPatient.riskFactors.otherRiskFactors === 'string') {
      return initialPatient.riskFactors.otherRiskFactors.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  });
  const [newRiskFactorInput, setNewRiskFactorInput] = useState('');
  const [customCohabitingSpeciesInput, setCustomCohabitingSpeciesInput] = useState('');

  // ============================================================================
  // CONSTANTES VITALES & TLLC EN SEGUNDOS (Paso 3)
  // ============================================================================
  const [vitalSignsCapillaryRefillTime, setVitalSignsCapillaryRefillTime] = useState(() => {
    const vs = initialPatient?.vitalSigns || initialPatient?.healthMetrics?.vitalSigns;
    return vs?.capillaryRefillTime ? String(vs.capillaryRefillTime).replace(/[^0-9.]/g, '') : '';
  });
  const [vitalSignsHeartRate, setVitalSignsHeartRate] = useState(() => {
    const vs = initialPatient?.vitalSigns || initialPatient?.healthMetrics?.vitalSigns;
    return vs?.heartRate ? String(vs.heartRate).replace(/\D/g, '') : '';
  });
  const [vitalSignsTemp, setVitalSignsTemp] = useState(() => {
    const vs = initialPatient?.vitalSigns || initialPatient?.healthMetrics?.vitalSigns;
    return vs?.temperature ? String(vs.temperature).replace(/[^0-9.]/g, '') : '';
  });
  const [vitalSignsResp, setVitalSignsResp] = useState(() => {
    const vs = initialPatient?.vitalSigns || initialPatient?.healthMetrics?.vitalSigns;
    return vs?.respiratoryRate ? String(vs.respiratoryRate).replace(/\D/g, '') : '';
  });
  const [vitalSignsMucosa, setVitalSignsMucosa] = useState(() => {
    const vs = initialPatient?.vitalSigns || initialPatient?.healthMetrics?.vitalSigns;
    return vs?.mucosa || '';
  });

  // ============================================================================
  // CUADRO HEMÁTICO (HEMOGRAMA) Y EXAMEN CLÍNICO PREVIO (Paso 3)
  // ============================================================================
  const [currentClinicalExam, setCurrentClinicalExam] = useState(initialClinicalExam || null);
  const [hasPreviousClinicalExam, setHasPreviousClinicalExam] = useState(() => {
    const ch = initialPatient?.cuadroHematico || initialPatient?.medicalAdmission?.cuadroHematico;
    if (ch?.hasPreviousClinicalExam === false) return 'no';
    if (ch?.hasCuadroHematico || ch?.fileName || ch?.hematocrito) return 'si';
    return null;
  });
  const [clinicalRiskDisclaimerAccepted, setClinicalRiskDisclaimerAccepted] = useState(false);
  const [isClinicalDeclinedConfirmed, setIsClinicalDeclinedConfirmed] = useState(false);
  const [hasCuadroHematico, setHasCuadroHematico] = useState(false);
  const [cuadroHematicoFile, setCuadroHematicoFile] = useState(null);
  const [cuadroHematicoFileName, setCuadroHematicoFileName] = useState('');
  const [cuadroHematicoFileSize, setCuadroHematicoFileSize] = useState('');
  const [cuadroHematicoHematocrito, setCuadroHematicoHematocrito] = useState('');
  const [cuadroHematicoHemoglobina, setCuadroHematicoHemoglobina] = useState('');
  const [cuadroHematicoLeucocitos, setCuadroHematicoLeucocitos] = useState('');
  const [cuadroHematicoPlaquetas, setCuadroHematicoPlaquetas] = useState('');
  const [cuadroHematicoObservaciones, setCuadroHematicoObservaciones] = useState('');

  // ============================================================================
  // HISTORIA CLÍNICA (DIRECTAMENTE ABAJO DEL CUADRO HEMÁTICO) (Paso 3)
  // Requerimiento: Donde ingresamos cuadro hemático, abajo abrir campo para
  // subir la historia clínica.
  // ============================================================================
  const [hasHistoriaClinica, setHasHistoriaClinica] = useState(false);
  const [historiaClinicaFile, setHistoriaClinicaFile] = useState(null);
  const [historiaClinicaFileName, setHistoriaClinicaFileName] = useState('');
  const [historiaClinicaFileSize, setHistoriaClinicaFileSize] = useState('');
  const [historiaClinicaNotes, setHistoriaClinicaNotes] = useState('');

  // Sincronización reactiva si initialPatient o initialExamType cambian en modo módulo
  useEffect(() => {
    if (initialPatient) {
      setSelectedPatientId(initialPatient.id);
      setHasVetPlusInsurance(Boolean(initialPatient.owner?.hasVetPlus));
      setVetPlusCode(initialPatient.owner?.vetPlusCode || '');
      const patientIsAsymp = Boolean(
        initialPatient.isAsymptomatic ?? initialPatient.medicalAdmission?.isAsymptomatic
      );
      setIsAsymptomatic(patientIsAsymp);

      // Precargar síntomas y signos del ingreso clínico si el paciente no es asintomático
      if (!patientIsAsymp) {
        const admissionSymptoms = [
          ...(Array.isArray(initialPatient.symptoms) ? initialPatient.symptoms : []),
          ...(Array.isArray(initialPatient.medicalAdmission?.symptoms) ? initialPatient.medicalAdmission.symptoms : []),
          ...(Array.isArray(initialPatient.clinicalSymptoms) ? initialPatient.clinicalSymptoms : []),
        ].filter(Boolean);

        const uniqueSymptoms = Array.from(new Set(admissionSymptoms));
        if (uniqueSymptoms.length > 0) {
          setSelectedFindings((prev) => Array.from(new Set([...prev, ...uniqueSymptoms])));
        }

        const customSym = initialPatient.otherSymptoms || initialPatient.medicalAdmission?.otherSymptoms;
        if (customSym && typeof customSym === 'string' && customSym.trim()) {
          const trimmed = customSym.trim();
          setCustomFindings((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
          setSelectedFindings((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
        }
      }

      if (initialExamType === 'control') {
        const info = getPatientExamHistoryInfo(initialPatient);
        if (info.canRequestControl) {
          setExamType('control');
          if (info.lastExamId) setPreviousExamCode(info.lastExamId);
          setIsControlReviewOpen(true);
        } else {
          setExamType('nuevo');
          setIsControlReviewOpen(false);
          setCurrentStep(1);
        }
      } else {
        setExamType('nuevo');
        setIsControlReviewOpen(false);
        setCurrentStep(1);
      }
    } else {
      setSelectedPatientId('');
      setCurrentStep(1);
      setExamType('nuevo');
      setIsControlReviewOpen(false);
    }
  }, [initialPatient, initialExamType]);

  // Paso 2: Síndromes clínicos seleccionados (TOTALMENTE EN BLANCO: [])
  const [selectedSyndromes, setSelectedSyndromes] = useState([]);

  // Paso 3: Sintomatología y hallazgos (TOTALMENTE EN BLANCO: [])
  const [selectedFindings, setSelectedFindings] = useState([]);
  const [manualFindingInput, setManualFindingInput] = useState('');
  const [customFindings, setCustomFindings] = useState([]);

  // Paso 4: Perfiles qPCR seleccionados (TOTALMENTE EN BLANCO: [])
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  // Paso 4: Filtro interactivo por síndrome clínico
  const [step4SyndromeFilter, setStep4SyndromeFilter] = useState('all');

  // Estado para desplegar/recoger la explicación: "¿A qué se deben los síntomas del paciente?"
  const [expandedAttributionProfiles, setExpandedAttributionProfiles] = useState({});

  const handleToggleAttribution = (profileKey) => {
    setExpandedAttributionProfiles((prev) => ({
      ...prev,
      [profileKey]: !prev[profileKey],
    }));
  };

  // Paso 5: Reemplazo de agentes en los perfiles
  // REQUERIMIENTO: La lista de agentes SOLO aparece cuando se da clic en "Editar agentes"
  const [showAgentsEdit, setShowAgentsEdit] = useState(false);
  const [replacedAgents, setReplacedAgents] = useState({}); // { [profileId]: { [agentIdx]: newAgentName } }

  // Estado para la edición manual individual de cada agente
  const [editingAgentIndex, setEditingAgentIndex] = useState(null); // índice del agente que se está editando
  const [manualAgentInput, setManualAgentInput] = useState(''); // texto tipeado manualmente

  // Paso 5: Checkbox de confirmación obligatorio
  const [confirmedSamples, setConfirmedSamples] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // PANTALLA FINAL: RESUMEN INTEGRAL Y DASHBOARD TRAS CONFIRMAR Y ENVIAR
  // ============================================================================
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [submittedOrderData, setSubmittedOrderData] = useState(null);

  // Paciente activo actual (garantiza que solo sea uno)
  const activePatient = useMemo(() => {
    if (!selectedPatientId) return null;
    if (initialPatient && initialPatient.id === selectedPatientId) return initialPatient;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [initialPatient, patients, selectedPatientId]);

  // Información y elegibilidad de control para el paciente activo
  const controlHistoryInfo = useMemo(() => {
    return getPatientExamHistoryInfo(activePatient);
  }, [activePatient]);

  // ============================================================================
  // RECTIFICACIÓN DE AGENTES POSITIVOS PARA SOLICITUD DE CONTROL
  // El veterinario puede seleccionar/deseleccionar qué agentes positivos re-evaluar
  // Descuento del 15% aplicado a cada agente individual
  // ============================================================================
  const [selectedControlAgentIds, setSelectedControlAgentIds] = useState([]);

  // Al cargar o cambiar los agentes positivos de control, por defecto todos se seleccionan
  useEffect(() => {
    if (controlHistoryInfo?.positiveAgents && controlHistoryInfo.positiveAgents.length > 0) {
      setSelectedControlAgentIds(controlHistoryInfo.positiveAgents.map((a) => a.id));
    } else {
      setSelectedControlAgentIds([]);
    }
  }, [controlHistoryInfo?.positiveAgents]);

  const handleToggleControlAgent = (agentId) => {
    setSelectedControlAgentIds((prev) => {
      if (prev.includes(agentId)) {
        return prev.filter((id) => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const handleSelectAllControlAgents = () => {
    if (controlHistoryInfo?.positiveAgents) {
      setSelectedControlAgentIds(controlHistoryInfo.positiveAgents.map((a) => a.id));
    }
  };

  const handleDeselectAllControlAgents = () => {
    setSelectedControlAgentIds([]);
  };

  // Agentes rectificados activos y totales calculados reactivamente
  const activeControlAgents = useMemo(() => {
    if (!controlHistoryInfo?.positiveAgents) return [];
    return controlHistoryInfo.positiveAgents.filter((a) => selectedControlAgentIds.includes(a.id));
  }, [controlHistoryInfo?.positiveAgents, selectedControlAgentIds]);

  const activeControlBasePrice = useMemo(() => {
    return activeControlAgents.reduce((sum, a) => sum + a.basePrice, 0);
  }, [activeControlAgents]);

  const activeControlDiscount = useMemo(() => {
    return activeControlAgents.reduce((sum, a) => sum + a.discount, 0);
  }, [activeControlAgents]);

  const activeControlTotal = useMemo(() => {
    return activeControlAgents.reduce((sum, a) => sum + a.finalPrice, 0);
  }, [activeControlAgents]);

  // Helper para verificar si el paciente ya fue esterilizado previamente
  const isAlreadySterilized = Boolean(activePatient?.isSterilized === true);

  // Sincronizar si cambia el paciente seleccionado
  useEffect(() => {
    if (activePatient) {
      if (activePatient.owner?.hasVetPlus !== undefined) {
        setHasVetPlusInsurance(Boolean(activePatient.owner.hasVetPlus));
        setVetPlusCode(activePatient.owner.vetPlusCode || '');
      }
      if (typeof activePatient.isAsymptomatic === 'boolean') {
        setIsAsymptomatic(activePatient.isAsymptomatic);
      } else if (typeof activePatient.medicalAdmission?.isAsymptomatic === 'boolean') {
        setIsAsymptomatic(activePatient.medicalAdmission.isAsymptomatic);
      } else {
        setIsAsymptomatic(null);
      }
      setIsClinicalDeclinedConfirmed(false);

      // 1. Estado de esterilización
      if (activePatient.isSterilized === true) {
        setExamIsSterilized(true);
      } else if (activePatient.isSterilized === false) {
        setExamIsSterilized(false);
      } else {
        setExamIsSterilized(null);
      }

      // 2. Alergias del paciente (solo si tiene alergias reportadas reales)
      let initialAllergiesList = [];
      if (hasReportedAllergy(activePatient)) {
        if (Array.isArray(activePatient.allergies)) {
          initialAllergiesList = activePatient.allergies.filter((s) => s && !isNegativeAllergyText(String(s)));
        } else if (typeof activePatient.allergies === 'string' && activePatient.allergies.trim()) {
          initialAllergiesList = activePatient.allergies
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s && !isNegativeAllergyText(s));
        }
      }
      setPatientAllergiesList(initialAllergiesList);
      setHasAllergiesOption(initialAllergiesList.length > 0);

      // 3. Factores de riesgo previos si los tuviera
      if (activePatient.riskFactors) {
        const rf = activePatient.riskFactors;
        setRiskFactors((prev) => ({
          ...prev,
          habitat: rf.habitat || prev.habitat,
          housingArea: rf.housingArea || prev.housingArea,
          housingType: rf.housingType || prev.housingType,
          livesWithOtherAnimals: typeof rf.livesWithOtherAnimals === 'boolean' ? rf.livesWithOtherAnimals : null,
          cohabitingSpecies: Array.isArray(rf.cohabitingSpecies) ? rf.cohabitingSpecies : prev.cohabitingSpecies,
          recentTravel: typeof rf.recentTravel === 'boolean' ? rf.recentTravel : null,
          recentTravelDetails: rf.recentTravelDetails || prev.recentTravelDetails,
          ruralAccess: Boolean(rf.ruralAccess ?? prev.ruralAccess),
          parasiteExposure: Boolean(rf.parasiteExposure ?? prev.parasiteExposure),
          outdoorWater: Boolean(rf.outdoorWater ?? prev.outdoorWater),
          coastalRescue: Boolean(rf.coastalRescue ?? prev.coastalRescue),
          coastalRescueLocation: rf.coastalRescueLocation || prev.coastalRescueLocation,
        }));
        if (rf.otherRiskFactors && typeof rf.otherRiskFactors === 'string' && rf.otherRiskFactors.trim()) {
          const parts = rf.otherRiskFactors.split(',').map((s) => s.trim()).filter(Boolean);
          if (parts.length > 0) setOtherRiskFactorsList(parts);
        }
      }

      // 4. Constantes vitales previas si las tuviera (no volver a pedir)
      const vs = activePatient.vitalSigns || activePatient.healthMetrics?.vitalSigns || activePatient.medicalAdmission?.vitalSigns;
      if (vs) {
        if (vs.capillaryRefillTime) setVitalSignsCapillaryRefillTime(String(vs.capillaryRefillTime).replace(/[^0-9.]/g, ''));
        if (vs.heartRate) setVitalSignsHeartRate(String(vs.heartRate).replace(/\D/g, ''));
        if (vs.temperature) setVitalSignsTemp(String(vs.temperature).replace(/[^0-9.]/g, ''));
        if (vs.respiratoryRate) setVitalSignsResp(String(vs.respiratoryRate).replace(/\D/g, ''));
        if (vs.mucosa) setVitalSignsMucosa(String(vs.mucosa));
      }

      // 5. Cuadro hemático previo si lo tuviera (no volver a pedir)
      const ch = activePatient.cuadroHematico || activePatient.medicalAdmission?.cuadroHematico;
      if (ch) {
        if (ch.hasPreviousClinicalExam !== undefined) {
          setHasPreviousClinicalExam(ch.hasPreviousClinicalExam ? 'si' : 'no');
        } else if (ch.hasCuadroHematico || ch.fileName || ch.hematocrito) {
          setHasPreviousClinicalExam('si');
        }
        if (ch.clinicalRiskDisclaimerAccepted) {
          setClinicalRiskDisclaimerAccepted(true);
        }
        if (ch.hasCuadroHematico !== undefined) setHasCuadroHematico(Boolean(ch.hasCuadroHematico));
        if (ch.hematocrito) setCuadroHematicoHematocrito(String(ch.hematocrito));
        if (ch.hemoglobina) setCuadroHematicoHemoglobina(String(ch.hemoglobina));
        if (ch.leucocitos) setCuadroHematicoLeucocitos(String(ch.leucocitos));
        if (ch.plaquetas) setCuadroHematicoPlaquetas(String(ch.plaquetas));
        if (ch.observaciones) setCuadroHematicoObservaciones(ch.observaciones);
        if (ch.fileName) setCuadroHematicoFileName(ch.fileName);
      }

      // 6. Historia clínica previa si la tuviera (no volver a pedir)
      const hc = activePatient.historiaClinica || activePatient.medicalAdmission?.historiaClinica;
      if (hc) {
        if (hc.hasHistoriaClinica !== undefined) setHasHistoriaClinica(Boolean(hc.hasHistoriaClinica));
        if (hc.fileName) setHistoriaClinicaFileName(hc.fileName);
        if (hc.notes) setHistoriaClinicaNotes(hc.notes);
      }
    } else {
      setExamIsSterilized(null);
      setPatientAllergiesList([]);
      setHasAllergiesOption(null);
      setHasPreviousClinicalExam(null);
      setClinicalRiskDisclaimerAccepted(false);
      setIsClinicalDeclinedConfirmed(false);
    }
  }, [activePatient?.id, activePatient?.isSterilized]);

  // Handlers para Alergias
  const handleAddAllergy = () => {
    if (!newAllergyInput.trim()) return;
    const clean = newAllergyInput.trim();
    if (!patientAllergiesList.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      setPatientAllergiesList((prev) => [...prev, clean]);
    }
    setNewAllergyInput('');
    setHasAllergiesOption(true);
  };

  const handleRemoveAllergy = (indexToRemove) => {
    setPatientAllergiesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handlers para Factores de Riesgo
  const handleRiskChange = (name, value) => {
    setRiskFactors((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleCohabitingSpecies = (sp) => {
    setRiskFactors((prev) => {
      const exists = prev.cohabitingSpecies.includes(sp);
      return {
        ...prev,
        cohabitingSpecies: exists
          ? prev.cohabitingSpecies.filter((item) => item !== sp)
          : [...prev.cohabitingSpecies, sp],
      };
    });
  };

  const handleAddCustomCohabitingSpecies = () => {
    if (!customCohabitingSpeciesInput.trim()) return;
    const val = customCohabitingSpeciesInput.trim();
    if (!riskFactors.cohabitingSpecies.includes(val)) {
      setRiskFactors((prev) => ({
        ...prev,
        cohabitingSpecies: [...prev.cohabitingSpecies, val],
      }));
    }
    setCustomCohabitingSpeciesInput('');
  };

  const handleAddRiskFactor = () => {
    if (!newRiskFactorInput.trim()) return;
    setOtherRiskFactorsList((prev) => [...prev, newRiskFactorInput.trim()]);
    setNewRiskFactorInput('');
  };

  const handleRemoveRiskFactor = (idx) => {
    setOtherRiskFactorsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handlers para Cuadro Hemático
  const handleCuadroHematicoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setHasCuadroHematico(true);
      setCuadroHematicoFile(reader.result);
      setCuadroHematicoFileName(file.name);
      setCuadroHematicoFileSize(sizeStr);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCuadroHematico = () => {
    setHasCuadroHematico(false);
    setCuadroHematicoFile(null);
    setCuadroHematicoFileName('');
    setCuadroHematicoFileSize('');
    setCuadroHematicoHematocrito('');
    setCuadroHematicoHemoglobina('');
    setCuadroHematicoLeucocitos('');
    setCuadroHematicoPlaquetas('');
    setCuadroHematicoObservaciones('');
  };

  // Handlers para Historia Clínica
  const handleHistoriaClinicaFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setHasHistoriaClinica(true);
      setHistoriaClinicaFile(reader.result);
      setHistoriaClinicaFileName(file.name);
      setHistoriaClinicaFileSize(sizeStr);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveHistoriaClinica = () => {
    setHasHistoriaClinica(false);
    setHistoriaClinicaFile(null);
    setHistoriaClinicaFileName('');
    setHistoriaClinicaFileSize('');
  };

  // ============================================================================
  // REQUERIMIENTO: LOS NOMBRES COMIENZAN A SALIR A MEDIDA QUE SE ESCRIBE
  // ============================================================================
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) {
      return []; // Si no ha escrito nada, no se despliega la lista completa
    }
    const q = searchTerm.toLowerCase().trim();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.lastName && p.lastName.toLowerCase().includes(q)) ||
        (p.owner?.name && p.owner.name.toLowerCase().includes(q)) ||
        (p.species && p.species.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q)
    );
  }, [patients, searchTerm]);

  // REQUERIMIENTO: Pacientes limpios sin ruido visual.
  // Al seleccionar el paciente, se quitan todos los demás y queda SOLO el seleccionado.
  // Si se vuelve a presionar sobre él para deseleccionar, vuelven a aparecer todos los demás.
  const displayedPatients = useMemo(() => {
    // Si hay un paciente seleccionado, se muestra ÚNICAMENTE ese paciente
    if (activePatient) {
      return [activePatient];
    }
    // Si no hay paciente seleccionado y se escribió en el buscador, se muestran los coincidentes
    if (searchTerm.trim() !== '') {
      return filteredPatients;
    }
    return [];
  }, [activePatient, searchTerm, filteredPatients]);

  // Helper para mostrar edad en formato Figma: "4 años" / "X meses"
  const getPatientAgeDisplay = (patient) => {
    if (!patient) return '';
    if (patient.age) return patient.age;
    if (patient.birthDate) {
      const birth = new Date(patient.birthDate);
      const now = new Date();
      const years = now.getFullYear() - birth.getFullYear();
      if (years > 0) return `${years} año${years > 1 ? 's' : ''}`;
      const months = Math.max(1, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
      return `${months} meses`;
    }
    return '4 años';
  };

  // Hallazgos disponibles basados en los síndromes seleccionados
  const availableFindingsFromSyndromes = useMemo(() => {
    const findingsSet = new Set();
    selectedSyndromes.forEach((synName) => {
      const synObj = SYNDROMES_LIST.find((s) => s.name === synName || s.id === synName);
      if (synObj && synObj.symptoms) {
        synObj.symptoms.forEach((s) => findingsSet.add(s));
      }
    });
    return Array.from(findingsSet);
  }, [selectedSyndromes]);

  // Perfiles filtrados desde el backend / motor biomédico de patógenos
  const [backendProfiles, setBackendProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchFilteredProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const patientSymptoms = [
          ...(Array.isArray(activePatient?.clinicalSymptoms) ? activePatient.clinicalSymptoms : []),
          ...(Array.isArray(activePatient?.symptoms) ? activePatient.symptoms : []),
          ...(Array.isArray(activePatient?.medicalAdmission?.symptoms) ? activePatient.medicalAdmission.symptoms : []),
        ];
        const results = await qpcrApi.filterProfiles({
          syndromes: selectedSyndromes,
          findings: selectedFindings,
          symptoms: Array.from(new Set(patientSymptoms)).filter(Boolean),
          species: activePatient?.species || 'Canino',
          isAsymptomatic: Boolean(isAsymptomatic),
          riskFactors: {
            ...(activePatient?.riskFactors || {}),
            ...riskFactors,
            otherRiskFactors: otherRiskFactorsList.join(', '),
          },
          cuadroHematico: {
            hasCuadroHematico,
            hematocrito: cuadroHematicoHematocrito,
            hemoglobina: cuadroHematicoHemoglobina,
            leucocitos: cuadroHematicoLeucocitos,
            plaquetas: cuadroHematicoPlaquetas,
            observaciones: cuadroHematicoObservaciones,
          },
          patient: activePatient,
        });
        if (active && Array.isArray(results) && results.length > 0) {
          setBackendProfiles(results);
        }
      } catch (err) {
        console.error('Error al filtrar perfiles qPCR con backend:', err);
      } finally {
        if (active) setLoadingProfiles(false);
      }
    };

    fetchFilteredProfiles();
    return () => {
      active = false;
    };
  }, [
    selectedSyndromes,
    selectedFindings,
    activePatient?.id,
    activePatient?.species,
    isAsymptomatic,
    riskFactors,
    otherRiskFactorsList,
    cuadroHematicoHematocrito,
    cuadroHematicoPlaquetas,
    cuadroHematicoLeucocitos,
  ]);

  // Perfiles recomendados con cálculo de coincidencia (%) enriquecidos por backend
  const recommendedProfiles = useMemo(() => {
    if (backendProfiles && backendProfiles.length > 0) {
      return backendProfiles;
    }

    const isCat = activePatient?.species?.toLowerCase().includes('felin');
    const isDog = activePatient?.species?.toLowerCase().includes('canin');

    return QPCR_CATALOG.map((profile) => {
      let speciesMatch = true;
      if (profile.species === 'Felino' && !isCat) speciesMatch = false;
      if (profile.species === 'Canino' && !isDog) speciesMatch = false;

      let matchPercentage;
      if (isAsymptomatic) {
        matchPercentage = profile.type === 'Amplio' ? 96 : 90;
      } else {
        const matchedSyndromes = profile.syndromes.filter((s) => selectedSyndromes.includes(s));
        const syndromeRatio = selectedSyndromes.length > 0
          ? matchedSyndromes.length / selectedSyndromes.length
          : 0;

        matchPercentage = Math.round(syndromeRatio * 70);
        if (matchedSyndromes.length >= 1) matchPercentage += 15;
        if (speciesMatch) matchPercentage += 10;
        else matchPercentage -= 30;
      }

      matchPercentage = Math.min(99, Math.max(50, matchPercentage));

      return {
        ...profile,
        matchPercentage,
        speciesCompatible: speciesMatch,
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [backendProfiles, activePatient, selectedSyndromes, isAsymptomatic]);

  // Síndromes disponibles en los perfiles recomendados para este paciente
  const availableStep4Syndromes = useMemo(() => {
    const synMap = new Map();
    recommendedProfiles.forEach((p) => {
      (p.syndromes || []).forEach((syn) => {
        const found = CLINICAL_SYNDROMES_LIST.find((cs) => matchSyndromeTokens(cs.id, syn));
        const canonicalId = found ? found.id : syn;
        const icon = found ? found.icon : '🩺';
        const label = found ? found.label : syn;
        if (!synMap.has(canonicalId)) {
          synMap.set(canonicalId, { id: canonicalId, label, icon, count: 0 });
        }
        synMap.get(canonicalId).count += 1;
      });
    });
    return Array.from(synMap.values());
  }, [recommendedProfiles]);

  const displayedRecommendedProfiles = useMemo(() => {
    return recommendedProfiles;
  }, [recommendedProfiles]);

  // Perfiles actualmente añadidos a la orden
  const selectedProfiles = useMemo(() => {
    return recommendedProfiles.filter((p) => selectedProfileIds.includes(p.id));
  }, [recommendedProfiles, selectedProfileIds]);

  // Cálculo de reemplazos de agentes y costos
  // Regla: 1er cambio gratis ($0). Cambios adicionales: +$25.000 c/u
  const replacementMetrics = useMemo(() => {
    let totalReplacementsCount = 0;
    const modificationsList = [];

    selectedProfiles.forEach((profile) => {
      const panelMods = replacedAgents[profile.id] || {};
      Object.entries(panelMods).forEach(([idxStr, newName]) => {
        const idx = parseInt(idxStr, 10);
        const originalName = profile.agents[idx] || `Agente #${idx + 1}`;
        totalReplacementsCount += 1;
        modificationsList.push({
          profileTitle: profile.title,
          originalName,
          newName,
          index: totalReplacementsCount,
          isFree: totalReplacementsCount === 1,
        });
      });
    });

    const freeReplacements = totalReplacementsCount > 0 ? 1 : 0;
    const paidReplacements = Math.max(0, totalReplacementsCount - 1);
    const additionalCost = paidReplacements * 25000;

    return {
      totalReplacementsCount,
      freeReplacements,
      paidReplacements,
      additionalCost,
      modificationsList,
    };
  }, [selectedProfiles, replacedAgents]);

  // Conteo total de agentes adicionales agregados a los perfiles qPCR
  const addedAgentsCount = useMemo(() => {
    return Object.values(addedAgentsByProfile).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  }, [addedAgentsByProfile]);

  // Total de la orden con reemplazos y agentes adicionales
  const orderFinancials = useMemo(() => {
    const baseTotal = selectedProfiles.reduce((acc, p) => acc + p.basePrice, 0);
    const addedAgentsCost = addedAgentsCount * 25000;
    const finalTotal = baseTotal + replacementMetrics.additionalCost + addedAgentsCost;
    return {
      baseTotal,
      additionalCost: replacementMetrics.additionalCost,
      addedAgentsCost,
      addedAgentsCount,
      finalTotal,
    };
  }, [selectedProfiles, replacementMetrics, addedAgentsCount]);

  // Muestras requeridas consolidadas
  const consolidatedSamples = useMemo(() => {
    const sampleMap = new Map();
    selectedProfiles.forEach((p) => {
      p.samples.forEach((s) => {
        if (!sampleMap.has(s.name)) {
          sampleMap.set(s.name, s.desc);
        }
      });
    });
    return Array.from(sampleMap.entries()).map(([name, desc]) => ({ name, desc }));
  }, [selectedProfiles]);

  // Verificación estricta: ¿Están todas las muestras requeridas marcadas en el checklist?
  const areAllSamplesConfirmed = useMemo(() => {
    if (consolidatedSamples.length === 0) return true;
    return consolidatedSamples.every((s) => Boolean(confirmedSamplesChecklist[s.name]));
  }, [consolidatedSamples, confirmedSamplesChecklist]);

  // Handlers para agregar y quitar agentes adicionales en un perfil qPCR
  const handleAddAgentToProfile = (profileId, agentName) => {
    if (!agentName || !agentName.trim()) return;
    const clean = agentName.trim();
    setAddedAgentsByProfile((prev) => {
      const existing = prev[profileId] || [];
      if (existing.includes(clean)) return prev;
      return {
        ...prev,
        [profileId]: [...existing, clean],
      };
    });
    setNewAgentInputByProfile((prev) => ({ ...prev, [profileId]: '' }));
    setIsAddingAgentByProfile((prev) => ({ ...prev, [profileId]: false }));
  };

  const handleRemoveAddedAgent = (profileId, indexToRemove) => {
    setAddedAgentsByProfile((prev) => {
      const existing = prev[profileId] || [];
      return {
        ...prev,
        [profileId]: existing.filter((_, idx) => idx !== indexToRemove),
      };
    });
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // REQUERIMIENTO: Solo se selecciona 1 paciente. Clic resalta borde; volver a hacer clic deselecciona.
  const handleTogglePatientSelection = (p) => {
    if (p.status === 'fallecido') {
      alert('Acceso denegado: El paciente ' + (p.name || '') + ' se encuentra registrado como fallecido y su ficha médica no admite nuevas solicitudes de examen.');
      return;
    }
    if (selectedPatientId === p.id) {
      setSelectedPatientId('');
      if (examType === 'control') {
        setIsControlReviewOpen(false);
      }
    } else {
      setSelectedPatientId(p.id);
      const info = getPatientExamHistoryInfo(p);
      if (examType === 'control') {
        if (!info.canRequestControl) {
          alert(`El paciente ${p.name} no cuenta con examen previo dentro de los 6 meses requeridos para control.\nSe cambiará a la modalidad "Examen nuevo".`);
          setExamType('nuevo');
          setPreviousExamCode('');
          setIsControlReviewOpen(false);
        } else {
          if (info.lastExamId) {
            setPreviousExamCode(info.lastExamId);
          }
          // REQUERIMIENTO: Al seleccionar paciente en modo control, abre DIRECTAMENTE la revisión de control con agentes positivos
          setIsControlReviewOpen(true);
        }
      }
    }
  };

  const handleSelectPatient = (p) => {
    handleTogglePatientSelection(p);
  };

  const handleDeselectPatient = () => {
    setSelectedPatientId('');
    if (examType === 'control') {
      setIsControlReviewOpen(false);
    }
  };

  const handleToggleExamType = (type) => {
    if (type === 'control') {
      if (!activePatient) {
        alert('Debe seleccionar primero un paciente para evaluar si cuenta con exámenes previos y califica para control.');
        return;
      }
      if (!controlHistoryInfo.canRequestControl) {
        alert(`Este paciente no tiene habilitada la opción de seguimiento / control.\n\nMotivo: ${controlHistoryInfo.reason}.\nDebe solicitar un "Examen nuevo".`);
        return;
      }
      setExamType('control');
      if (controlHistoryInfo.lastExamId && !previousExamCode) {
        setPreviousExamCode(controlHistoryInfo.lastExamId);
      }
      // Si ya hay paciente seleccionado y califica, abre la revisión de control con sus agentes positivos reales
      setIsControlReviewOpen(true);
    } else {
      setExamType('nuevo');
      setPreviousExamCode('');
      setIsControlReviewOpen(false);
    }
  };

  const [isImportedFromHistory, setIsImportedFromHistory] = useState(false);

  const handleImportFromClinicalDocuments = () => {
    if (!activePatient) return;
    const docs = activePatient.clinicalDocuments || [];
    if (docs.length === 0) return;

    // Extraer hallazgos y valores de laboratorio
    const extractedFindings = [];
    docs.forEach((doc) => {
      if (Array.isArray(doc.keyFindings)) {
        extractedFindings.push(...doc.keyFindings);
      }
      if (doc.hematocrito) setHematocrito(String(doc.hematocrito));
      if (doc.plaquetas) setPlaquetas(String(doc.plaquetas));
      if (doc.leucocitos) setLeucocitos(String(doc.leucocitos));
    });

    const textCorpus = docs
      .map((d) => `${d.title} ${d.notes || ''} ${(d.keyFindings || []).join(' ')}`)
      .join(' ')
      .toLowerCase();

    setSelectedSyndromes((prev) => {
      const next = [...prev];
      if (
        (textCorpus.includes('anemia') ||
          textCorpus.includes('plaquet') ||
          textCorpus.includes('garrapat') ||
          textCorpus.includes('trombocit') ||
          textCorpus.includes('hemotr')) &&
        !next.includes('Síndrome Hemotrópico / Vectorial')
      ) {
        next.push('Síndrome Hemotrópico / Vectorial');
      }
      if (
        (textCorpus.includes('vómit') ||
          textCorpus.includes('vomit') ||
          textCorpus.includes('diarrea') ||
          textCorpus.includes('digestiv') ||
          textCorpus.includes('fecal')) &&
        !next.includes('Síndrome Digestivo / Hepático')
      ) {
        next.push('Síndrome Digestivo / Hepático');
      }
      if (
        (textCorpus.includes('tos') || textCorpus.includes('respirat') || textCorpus.includes('pulmon')) &&
        !next.includes('Síndrome Respiratorio / Filarial')
      ) {
        next.push('Síndrome Respiratorio / Filarial');
      }
      return next;
    });

    setSelectedFindings((prev) => {
      const next = [...prev];
      extractedFindings.forEach((f) => {
        const clean = f.replace(/\(.*?\)/g, '').trim();
        if (clean && !next.includes(clean)) {
          next.push(clean);
        }
      });
      return next;
    });

    setIsImportedFromHistory(true);
    setIsAsymptomatic(false);
  };

  const handleToggleSyndrome = (syndromeName) => {
    setSelectedSyndromes((prev) => {
      if (prev.includes(syndromeName)) {
        return prev.filter((s) => s !== syndromeName);
      } else {
        return [...prev, syndromeName];
      }
    });
  };

  const handleToggleFinding = (finding) => {
    setSelectedFindings((prev) => {
      if (prev.includes(finding)) {
        return prev.filter((f) => f !== finding);
      } else {
        return [...prev, finding];
      }
    });
  };

  const handleAddManualFinding = (e) => {
    e.preventDefault();
    if (!manualFindingInput.trim()) return;
    const clean = manualFindingInput.trim();
    if (!customFindings.includes(clean)) {
      setCustomFindings((prev) => [...prev, clean]);
    }
    if (!selectedFindings.includes(clean)) {
      setSelectedFindings((prev) => [...prev, clean]);
    }
    setManualFindingInput('');
  };

  const handleToggleProfile = (profileId) => {
    setSelectedProfileIds((prev) => {
      if (prev.includes(profileId)) {
        return prev.filter((id) => id !== profileId);
      } else {
        return [...prev, profileId];
      }
    });
  };

  // Edición manual de agentes:
  const handleStartEditingAgent = (idx, currentVal) => {
    setEditingAgentIndex(idx);
    setManualAgentInput(currentVal);
  };

  const handleSaveManualAgent = (profileId, idx) => {
    if (!manualAgentInput.trim()) {
      alert('Por favor ingrese el nombre del agente o patógeno de reemplazo.');
      return;
    }
    setReplacedAgents((prev) => ({
      ...prev,
      [profileId]: {
        ...(prev[profileId] || {}),
        [idx]: manualAgentInput.trim(),
      },
    }));
    setEditingAgentIndex(null);
    setManualAgentInput('');
  };

  const handleRevertAgentReplacement = (profileId, idx) => {
    setReplacedAgents((prev) => {
      const copy = { ...(prev[profileId] || {}) };
      delete copy[idx];
      return {
        ...prev,
        [profileId]: copy,
      };
    });
    if (editingAgentIndex === idx) {
      setEditingAgentIndex(null);
      setManualAgentInput('');
    }
  };

  // Confirmar y enviar la orden -> Lleva a la pantalla final de resumen integral
  const handleSubmitFinalOrder = async () => {
    if (!areAllSamplesConfirmed || !confirmedSamples) {
      alert('Por favor complete el checklist confirmando todas las muestras biológicas requeridas antes de enviar.');
      return;
    }
    if (!activePatient) return;

    setIsSubmitting(true);
    try {
      const profilesData = selectedProfiles.map((p) => {
        const customAgents = p.agents.map((origAgent, idx) => {
          return replacedAgents[p.id]?.[idx] || origAgent;
        });
        const extraAgents = addedAgentsByProfile[p.id] || [];
        const allAgents = [...customAgents, ...extraAgents];
        return {
          id: p.id,
          title: p.title,
          type: p.type || 'Amplio',
          price: p.basePrice,
          agents: allAgents,
          customAgents,
          extraAgents,
          originalAgents: p.agents,
          samples: p.samples,
        };
      });

      const payload = {
        requestCategory: 'qpcr',
        category: 'Biología Molecular Cuantitativa (qPCR)',
        examType,
        previousExamCode: examType === 'control' ? previousExamCode : null,
        testName: selectedProfiles.map((p) => p.title).join(' + '),
        profiles: profilesData,
        syndromes: selectedSyndromes,
        findings: selectedFindings,
        samples: consolidatedSamples,
        sampleType: consolidatedSamples.map((s) => s.name).join(', '),
        totalPrice: `$${orderFinancials.finalTotal.toLocaleString('es-CO')}`,
        replacementCount: replacementMetrics.totalReplacementsCount,
        additionalCost: replacementMetrics.additionalCost,
        addedAgentsCount,
        addedAgentsCost: orderFinancials.addedAgentsCost,
        hasVetPlusInsurance: Boolean(hasVetPlusInsurance),
        vetPlusCode: hasVetPlusInsurance ? (vetPlusCode.trim() || 'VETP-REG') : null,
        isAsymptomatic: Boolean(isAsymptomatic),
        urgency: 'Normal (24-48h)',
        logistics: 'Toma en clínica',
        requestedBy: getLoggedInDoctorName(),
        targets: profilesData.flatMap((p) => p.agents).join(', '),

        // Actualizaciones de esterilización y alergias
        isSterilized: isAlreadySterilized ? true : (examIsSterilized !== null ? examIsSterilized : activePatient.isSterilized),
        allergies: patientAllergiesList.join(', '),
        hasAllergies: patientAllergiesList.length > 0,

        // Factores de riesgo epidemiológicos y constantes vitales
        riskFactors: {
          ...riskFactors,
          otherRiskFactors: otherRiskFactorsList.join(', '),
        },
        vitalSigns: {
          heartRate: vitalSignsHeartRate.trim() ? (vitalSignsHeartRate.trim().toLowerCase().includes('bpm') ? vitalSignsHeartRate.trim() : `${vitalSignsHeartRate.trim()} bpm`) : 'No registrada',
          temperature: vitalSignsTemp.trim() ? (vitalSignsTemp.trim().includes('°') ? vitalSignsTemp.trim() : `${vitalSignsTemp.trim()} °C`) : 'No registrada',
          respiratoryRate: vitalSignsResp.trim() ? (vitalSignsResp.trim().toLowerCase().includes('rpm') ? vitalSignsResp.trim() : `${vitalSignsResp.trim()} rpm`) : 'No registrada',
          mucosa: vitalSignsMucosa.trim() || 'No registrada',
          capillaryRefillTime: vitalSignsCapillaryRefillTime.trim()
            ? (vitalSignsCapillaryRefillTime.trim().toLowerCase().includes('seg')
                ? vitalSignsCapillaryRefillTime.trim()
                : `${vitalSignsCapillaryRefillTime.trim()} seg`)
            : 'No registrado',
        },

        // Cuadro Hemático e Historia Clínica
        cuadroHematico: {
          hasPreviousClinicalExam: hasPreviousClinicalExam === 'si',
          clinicalRiskDisclaimerAccepted: hasPreviousClinicalExam === 'no' ? Boolean(clinicalRiskDisclaimerAccepted) : null,
          hasCuadroHematico: hasPreviousClinicalExam === 'si' ? hasCuadroHematico : false,
          file: hasPreviousClinicalExam === 'si' ? cuadroHematicoFile : null,
          fileName: hasPreviousClinicalExam === 'si' ? cuadroHematicoFileName : '',
          fileSize: hasPreviousClinicalExam === 'si' ? cuadroHematicoFileSize : '',
          hematocrito: hasPreviousClinicalExam === 'si' ? cuadroHematicoHematocrito : '',
          hemoglobina: hasPreviousClinicalExam === 'si' ? cuadroHematicoHemoglobina : '',
          leucocitos: hasPreviousClinicalExam === 'si' ? cuadroHematicoLeucocitos : '',
          plaquetas: hasPreviousClinicalExam === 'si' ? cuadroHematicoPlaquetas : '',
          observaciones: hasPreviousClinicalExam === 'si'
            ? cuadroHematicoObservaciones.trim()
            : (hasPreviousClinicalExam === 'no' ? 'Sin examen clínico previo (Continuó bajo criterio y responsabilidad médica)' : ''),
        },
        historiaClinica: {
          hasHistoriaClinica,
          file: historiaClinicaFile,
          fileName: historiaClinicaFileName,
          fileSize: historiaClinicaFileSize,
          notes: historiaClinicaNotes.trim(),
        },
      };

      const resultOrder = await onRequest(activePatient.id, payload);

      const generatedCode = resultOrder?.id
        ? (resultOrder.id.startsWith('QPCR') ? resultOrder.id : `QPCR-${resultOrder.id.replace('ORD-', '')}`)
        : `QPCR-2026-${Math.floor(100 + Math.random() * 900)}`;

      // Guardar el resumen completo para la pantalla final
      setSubmittedOrderData({
        ...payload,
        orderId: resultOrder?.id || `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
        examCode: generatedCode,
        patient: { ...activePatient },
      });

      setIsOrderSuccess(true);
    } catch (err) {
      alert(`Error al generar la orden qPCR: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar y solicitar orden de control directamente (Exacto Figma media_1791558838111.png)
  const handleConfirmControlOrder = async () => {
    if (!activePatient) return;
    if (activeControlAgents.length === 0) {
      alert('Por favor selecciona al menos un agente positivo de la lista para solicitar el control.');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = previousExamCode || controlHistoryInfo.lastExamId || 'CTRL-3-2026';
      const examName = controlHistoryInfo.lastExamName || 'Panel Hemotrópico Canino';
      const examDate = controlHistoryInfo.lastExamDate || '03/09/2026';

      const payload = {
        requestCategory: 'qpcr',
        category: 'Biología Molecular Cuantitativa (qPCR)',
        examType: 'control',
        previousExamCode: code,
        previousExamName: examName,
        previousExamDate: examDate,
        testName: `Control qPCR — ${examName}`,
        positiveAgents: activeControlAgents,
        totalBasePrice: activeControlBasePrice,
        totalDiscount: activeControlDiscount,
        totalWithDiscount: activeControlTotal,
        totalPrice: `$${activeControlTotal.toLocaleString('es-CO')}`,
        samples: [
          { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila para reevaluación molecular' },
          { name: 'Hisopado rectal / Heces', desc: 'Hisopo estéril sin medio de cultivo o en medio molecular' },
        ],
        sampleType: controlHistoryInfo.sampleType || 'Sangre total con EDTA (2 ml) / Hisopado rectal',
        hasVetPlusInsurance: Boolean(hasVetPlusInsurance),
        vetPlusCode: hasVetPlusInsurance ? (vetPlusCode.trim() || 'VETP-REG') : null,
        isAsymptomatic: Boolean(isAsymptomatic),
        urgency: 'Control ambulatorio (24-48h)',
        logistics: 'Toma en clínica',
        requestedBy: getLoggedInDoctorName(),
        targets: activeControlAgents.map((a) => a.name).join(', '),
        isSterilized: isAlreadySterilized ? true : (examIsSterilized !== null ? examIsSterilized : activePatient.isSterilized),
        allergies: patientAllergiesList.join(', '),
        hasAllergies: patientAllergiesList.length > 0,
        riskFactors: {
          ...riskFactors,
          otherRiskFactors: otherRiskFactorsList.join(', '),
        },
        cuadroHematico: {
          hasPreviousClinicalExam: hasPreviousClinicalExam === 'si',
          clinicalRiskDisclaimerAccepted: hasPreviousClinicalExam === 'no' ? Boolean(clinicalRiskDisclaimerAccepted) : null,
          hasCuadroHematico: hasPreviousClinicalExam === 'si' ? hasCuadroHematico : false,
          file: hasPreviousClinicalExam === 'si' ? cuadroHematicoFile : null,
          fileName: hasPreviousClinicalExam === 'si' ? cuadroHematicoFileName : '',
          fileSize: hasPreviousClinicalExam === 'si' ? cuadroHematicoFileSize : '',
          hematocrito: hasPreviousClinicalExam === 'si' ? cuadroHematicoHematocrito : '',
          hemoglobina: hasPreviousClinicalExam === 'si' ? cuadroHematicoHemoglobina : '',
          leucocitos: hasPreviousClinicalExam === 'si' ? cuadroHematicoLeucocitos : '',
          plaquetas: hasPreviousClinicalExam === 'si' ? cuadroHematicoPlaquetas : '',
          observaciones: hasPreviousClinicalExam === 'si'
            ? cuadroHematicoObservaciones.trim()
            : (hasPreviousClinicalExam === 'no' ? 'Sin examen clínico previo (Continuó bajo criterio y responsabilidad médica)' : ''),
        },
        historiaClinica: {
          hasHistoriaClinica,
          file: historiaClinicaFile,
          fileName: historiaClinicaFileName,
          fileSize: historiaClinicaFileSize,
          notes: historiaClinicaNotes.trim(),
        },
      };

      const resultOrder = await onRequest(activePatient.id, payload);

      setSubmittedOrderData({
        ...payload,
        orderId: resultOrder?.id || `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
        examCode: code,
        patient: { ...activePatient },
      });

      setIsControlReviewOpen(false);
      setIsOrderSuccess(true);
    } catch (err) {
      alert(`Error al generar la orden de control: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToNewExam = () => {
    setIsOrderSuccess(false);
    setSubmittedOrderData(null);
    setCurrentStep(1);
    setSelectedPatientId('');
    setSelectedSyndromes([]);
    setSelectedFindings([]);
    setManualFindingInput('');
    setCustomFindings([]);
    setSelectedProfileIds([]);
    setExamType('nuevo');
    setIsControlReviewOpen(false);
    setReplacementCount(0);
    setReplacedAgentsMap({});
    setSelectedSampleType('Hisopado nasal');
    setHasVetPlusInsurance(false);
    setVetPlusCode('');
    setIsAsymptomatic(false);
    setSelectedClinicalExams([]);
    setClinicalSearchTerm('');
    setClinicalCategoryFilter('all');
    setClinicalObservations('');
    setClinicalStep(1);
    setMicrobiotaSubtype('kit');
  };

  // ============================================================================
  // LÓGICA DE SOLICITUD DE CLÍNICAS (PORTAFOLIO OFICIAL 223 PRUEBAS - SIN AYUDAS)
  // ============================================================================
  const filteredClinicalExams = useMemo(() => {
    let list = CLINICAL_EXAMS;
    if (clinicalCategoryFilter !== 'all') {
      const catObj = CLINICAL_CATEGORIES.find((c) => c.id === clinicalCategoryFilter);
      if (catObj) {
        list = list.filter((e) => e.categoria.toLowerCase() === catObj.nombre.toLowerCase());
      }
    }
    if (clinicalSearchTerm.trim()) {
      const term = clinicalSearchTerm.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.nombre.toLowerCase().includes(term) ||
          e.cups.toLowerCase().includes(term) ||
          e.id.toLowerCase().includes(term) ||
          (e.matrizMuestra && e.matrizMuestra.toLowerCase().includes(term))
      );
    }
    return list;
  }, [clinicalCategoryFilter, clinicalSearchTerm]);

  const totalClinicalPrice = useMemo(() => {
    return selectedClinicalExams.reduce((sum, e) => sum + (e.precioIva || 0), 0);
  }, [selectedClinicalExams]);

  const consolidatedClinicalMatrices = useMemo(() => {
    const list = selectedClinicalExams.map((e) => e.matrizMuestra).filter(Boolean);
    return Array.from(new Set(list));
  }, [selectedClinicalExams]);

  const handleToggleSelectClinicalExam = (exam) => {
    setSelectedClinicalExams((prev) => {
      const exists = prev.some((e) => e.id === exam.id);
      if (exists) {
        return prev.filter((e) => e.id !== exam.id);
      } else {
        if (!clinicalExamVetPlus[exam.id] && activePatient?.owner?.vetPlusCode) {
          setClinicalExamVetPlus((vPrev) => ({
            ...vPrev,
            [exam.id]: {
              hasVetPlus: true,
              code: activePatient.owner.vetPlusCode,
            },
          }));
        }
        return [...prev, exam];
      }
    });
  };

  const handleRemoveClinicalExam = (examId) => {
    setSelectedClinicalExams((prev) => prev.filter((e) => e.id !== examId));
  };

  const handleSubmitClinicalOrder = async (customPayload) => {
    setIsSubmitting(true);
    try {
      let payload;
      let targetPatientId = activePatient?.id;

      if (customPayload) {
        payload = {
          requestCategory: 'clinicas',
          examType: customPayload.testDetails?.isPcrOrOtherControl ? 'control' : 'nuevo',
          testName: customPayload.testDetails?.catalogExams?.length > 0
            ? customPayload.testDetails.catalogExams.map((e) => e.name).join(' + ')
            : customPayload.testDetails?.customTestName || 'Solicitud de Laboratorio Clínico OSD',
          category: 'Portafolio Clínico OSD (223 Pruebas)',
          ...customPayload,
          selectedClinicalExams: (customPayload.testDetails?.catalogExams || []).map((e) => ({
            id: e.id,
            nombre: e.name,
            categoria: e.categoria,
            cups: e.cups || null,
            matrizMuestra: e.sampleMatrix,
            tiempoEntrega: e.deliveryTime,
            precioIva: e.price,
            hasVetPlus: e.hasVetPlus,
            vetPlusCode: e.vetPlusCode,
          })),
          samples: (customPayload.sampleAndClinicalData?.sampleTypes || []).map((st) => ({ name: st, required: true })),
          sampleType: (customPayload.sampleAndClinicalData?.sampleTypes || []).join(' | ') || 'Muestra de laboratorio clínico',
          totalPrice: customPayload.testDetails?.totalPrice
            ? `$${customPayload.testDetails.totalPrice.toLocaleString('es-CO')}`
            : 'Tarifa oficial OSD',
          urgency: 'Normal (según catálogo)',
          logistics: customPayload.billingCompany?.collectionAddress || 'Toma en clínica',
          requestedBy: customPayload.billingCompany?.solicitingVetName || getLoggedInDoctorName(),
          targets: (customPayload.testDetails?.catalogExams || []).map((e) => `${e.cups ? `[${e.cups}] ` : ''}${e.name}`).join(', ') || customPayload.testDetails?.customTestName || 'Pruebas diagnósticas clínicas',
          clinicalObservations: customPayload.testDetails?.observations || '',
        };
        targetPatientId = activePatient?.id || customPayload.patientData?.id || `PAC-CLN-${Date.now().toString().slice(-4)}`;
      } else {
        if (!activePatient) {
          alert('Por favor selecciona un paciente para la solicitud de exámenes clínicos.');
          setIsSubmitting(false);
          return;
        }
        if (selectedClinicalExams.length === 0) {
          alert('Por favor selecciona al menos una prueba clínica del catálogo.');
          setIsSubmitting(false);
          return;
        }

        const enrichedClinicalExams = selectedClinicalExams.map((e) => {
          const vp = clinicalExamVetPlus[e.id] || {
            hasVetPlus: Boolean(activePatient?.owner?.hasVetPlus),
            code: activePatient?.owner?.vetPlusCode || '',
          };
          return {
            ...e,
            hasVetPlus: Boolean(vp.code?.trim()),
            vetPlusCode: vp.code?.trim() || null,
          };
        });

        payload = {
          requestCategory: 'clinicas',
          examType: 'nuevo',
          testName: selectedClinicalExams.map((e) => e.nombre).join(' + '),
          category: 'Pruebas Diagnósticas Clínicas',
          selectedClinicalExams: enrichedClinicalExams,
          clinicalObservations: clinicalObservations.trim(),
          samples: consolidatedClinicalMatrices.map((m) => ({ name: m, required: true })),
          sampleType: consolidatedClinicalMatrices.join(' | ') || 'Muestra de laboratorio clínico',
          totalPrice: `$${totalClinicalPrice.toLocaleString('es-CO')}`,
          urgency: 'Normal (según catálogo)',
          logistics: 'Toma en clínica',
          requestedBy: getLoggedInDoctorName(),
          targets: selectedClinicalExams.map((e) => `${e.cups ? `[${e.cups}] ` : ''}${e.nombre}`).join(', '),
          isSterilized: isAlreadySterilized ? true : (examIsSterilized !== null ? examIsSterilized : activePatient.isSterilized),
          allergies: patientAllergiesList.join(', '),
          hasAllergies: patientAllergiesList.length > 0,
        };
        targetPatientId = activePatient.id;
      }

      const resultOrder = await onRequest(targetPatientId, payload);
      const generatedCode = resultOrder?.id
        ? (resultOrder.id.startsWith('CLN') ? resultOrder.id : `CLN-${resultOrder.id.replace('ORD-', '')}`)
        : `CLN-2026-${Math.floor(100 + Math.random() * 900)}`;

      setSubmittedOrderData({
        ...payload,
        orderId: resultOrder?.id || generatedCode,
        examCode: generatedCode,
        patient: activePatient || {
          name: payload.patientData?.name || 'Paciente Clínicas',
          species: payload.patientData?.species || 'Canino',
          breed: payload.patientData?.breed || 'Mestizo',
          owner: { name: payload.patientData?.ownerName || 'Tutor', phone: payload.billingCompany?.contactPhone },
        },
      });

      setIsOrderSuccess(true);
    } catch (err) {
      alert(`Error al generar la orden clínica: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // LÓGICA DE SOLICITUD DE MICROBIOTA (KIT O RECOLECCIÓN - SIN AYUDAS)
  // ============================================================================
  const handleSubmitMicrobiotaOrder = async (customPayload) => {
    setIsSubmitting(true);
    try {
      let payload = customPayload;
      let targetPatientId = activePatient?.id || 'KIT-MICROBIOTA';

      if (!payload) {
        if (microbiotaSubtype === 'kit') {
          payload = {
            requestCategory: 'microbiota',
            microbiotaSubtype: 'kit',
            testName: `Solicitud de Kits de Microbiota (${microbiotaKitQuantity} un.)`,
            category: 'Microbiota Gastrointestinal',
            kitQuantity: microbiotaKitQuantity,
            deliverySede: microbiotaDeliverySede,
            deliveryAddress: microbiotaDeliveryAddress,
            recipientContact: microbiotaRecipientContact,
            recipientPhone: microbiotaRecipientPhone,
            notes: microbiotaDeliveryNotes.trim(),
            sampleType: 'Kit estéril con tubo estabilizador ADN fecal',
            totalPrice: 'Incluido en convenio de secuenciación',
            urgency: 'Envío estándar 24h',
            requestedBy: microbiotaRecipientContact || getLoggedInDoctorName(),
            targets: 'Kit de secuenciación masiva 16S rRNA',
          };
        } else {
          if (!activePatient) {
            alert('Por favor selecciona el paciente para la recolección de muestra de microbiota.');
            setIsSubmitting(false);
            return;
          }
          payload = {
            requestCategory: 'microbiota',
            microbiotaSubtype: 'recoleccion',
            testName: 'Recolección de Muestra Microbiota Gastrointestinal (16S rRNA)',
            category: 'Microbiota Gastrointestinal',
            collectionDate: microbiotaCollectionDate,
            collectionSede: microbiotaCollectionSede,
            sampleCondition: microbiotaSampleCondition,
            notes: microbiotaCollectionNotes.trim(),
            sampleType: 'Muestra fecal refrigerada (4°C) en vial conservante',
            totalPrice: '$285.000',
            urgency: 'Programada',
            requestedBy: getLoggedInDoctorName(),
            targets: 'Secuenciación metagenómica 16S rRNA V3-V4',
            isSterilized: isAlreadySterilized ? true : (examIsSterilized !== null ? examIsSterilized : activePatient.isSterilized),
            allergies: patientAllergiesList.join(', '),
            hasAllergies: patientAllergiesList.length > 0,
          };
        }
      } else {
        targetPatientId = activePatient?.id || (payload.petData?.name ? `PAC-MCB-${Date.now().toString().slice(-4)}` : 'KIT-MICROBIOTA');
      }

      const resultOrder = await onRequest(targetPatientId, payload);
      const codePrefix = payload.microbiotaSubtype === 'kit' ? 'KIT-MCB' : 'REC-MCB';
      const generatedCode = resultOrder?.id || `${codePrefix}-2026-${Math.floor(100 + Math.random() * 900)}`;

      setSubmittedOrderData({
        ...payload,
        orderId: resultOrder?.id || generatedCode,
        examCode: generatedCode,
        patient: activePatient || {
          name: payload.petData?.name || 'Clínica Veterinaria (Envío Sede)',
          species: payload.petData?.species || 'Logística de Kits',
          breed: payload.petData?.breed || payload.deliverySede || 'Sede Principal',
          owner: { name: payload.ownerName || payload.recipientContact, phone: payload.contactPhone || payload.recipientPhone },
        },
      });

      setIsOrderSuccess(true);
    } catch (err) {
      alert(`Error al generar la solicitud de microbiota: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDERIZADO DEL MODAL O MÓDULO INDEPENDIENTE
  // ============================================================================
  const containerClasses = isModal
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    : "w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 animate-in fade-in duration-200";

  const cardClasses = isModal
    ? "bg-[#f8fafc] dark:bg-[#0e091d] rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 dark:border-[#2f2257] overflow-hidden my-4 max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
    : "bg-[#f8fafc] dark:bg-[#0e091d] rounded-3xl w-full shadow-md border border-slate-200/90 dark:border-[#2f2257] overflow-hidden flex flex-col";

  const scrollBodyClasses = isModal
    ? "flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
    : "flex-1 p-6 sm:p-8 space-y-6";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        
        {/* ==================================================================== */}
        {/* CABECERA                                                            */}
        {/* ==================================================================== */}
        <div className="bg-white dark:bg-[#150f28] px-6 sm:px-8 pt-5 pb-4 border-b border-slate-100 dark:border-[#2f2257] shrink-0">
          {isOrderSuccess ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      Orden confirmada
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Emitida
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Código del examen: <strong className="font-mono text-[#6F2BCC] font-bold text-xs">{submittedOrderData?.examCode || submittedOrderData?.orderId}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>←</span> Volver a Pacientes
              </button>
            </div>
          ) : isControlReviewOpen ? (
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Solicitud de control — {controlHistoryInfo.lastExamName || 'Panel Hemotrópico Canino'}
              </h2>
              <button
                onClick={() => setIsControlReviewOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer transition-colors p-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              {!isModal && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>←</span> Volver a Pacientes
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-extrabold text-[#6F2BCC] uppercase tracking-wider">
                      {requestCategory === 'qpcr' && 'Módulo Clínico · Solicitud de Examen qPCR'}
                      {requestCategory === 'clinicas' && 'Módulo Clínico · Solicitud de Clínicas (223 Pruebas)'}
                      {requestCategory === 'microbiota' && 'Módulo Clínico · Solicitud de Microbiota (Kit & Recolección)'}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {requestCategory ? (
                    <>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        requestCategory === 'clinicas' ? 'bg-teal-100 text-teal-800' :
                        requestCategory === 'qpcr' ? 'bg-purple-100 text-[#6F2BCC]' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {requestCategory === 'clinicas' && '🏥 1. CATÁLOGO DE CLÍNICAS (223 PRUEBAS)'}
                        {requestCategory === 'qpcr' && (examType === 'control' ? '🔄 2. SEGUIMIENTO / CONTROL qPCR' : '🧬 2. BIOLOGÍA MOLECULAR qPCR')}
                        {requestCategory === 'microbiota' && '🦠 3. MICROBIOTA GASTROINTESTINAL'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRequestCategory(null)}
                        className="text-[11px] text-[#6F2BCC] hover:underline font-bold cursor-pointer ml-1"
                      >
                        ← Cambiar examen
                      </button>
                    </>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-100 text-[#6F2BCC]">
                      📋 NUEVA SOLICITUD DIAGNÓSTICA
                    </span>
                  )}
                </div>
                {isModal && (
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Selector de Modalidad Principal (Orden Oficial: 1. Clínicas, 2. qPCR, 3. Microbiota) */}
              {requestCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl mb-3">
                  <button
                    type="button"
                    onClick={() => setRequestCategory('clinicas')}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      requestCategory === 'clinicas'
                        ? 'bg-white text-[#2B017C] shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="text-lg">🏥</span>
                    <div className="min-w-0">
                      <div className="font-extrabold truncate">1. Solicitud de Clínicas</div>
                      <div className="text-[10px] text-teal-700 font-semibold truncate">223 Pruebas · Sin ayudas</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestCategory('qpcr')}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      requestCategory === 'qpcr'
                        ? 'bg-white text-[#2B017C] shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="text-lg">🧬</span>
                    <div className="min-w-0">
                      <div className="font-extrabold truncate">2. Biología Molecular (qPCR)</div>
                      <div className="text-[10px] text-[#6F2BCC] font-semibold truncate">Con ayudas diagnósticas</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestCategory('microbiota')}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      requestCategory === 'microbiota'
                        ? 'bg-white text-[#2B017C] shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="text-lg">🦠</span>
                    <div className="min-w-0">
                      <div className="font-extrabold truncate">3. Solicitud de Microbiota</div>
                      <div className="text-[10px] text-emerald-700 font-semibold truncate">Kit o Recolección · Sin ayudas</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Barra de progreso según modalidad */}
              {requestCategory === 'qpcr' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>PASO {currentStep <= 5 ? currentStep : 5} DE 5</span>
                    <span className="text-[#6F2BCC]">
                      {currentStep === 1 && '1. Paciente & Esterilización'}
                      {currentStep === 2 && '2. Factores de riesgo'}
                      {currentStep === 3 && '3. Evaluación clínica & Historia'}
                      {currentStep === 4 && '4. Perfiles qPCR'}
                      {currentStep === 5 && '5. Revisión y despacho'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${currentStep >= 4 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${currentStep >= 5 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}

              {requestCategory === 'clinicas' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>SOLICITUD DE CLÍNICAS — FORMULARIO OFICIAL OSD</span>
                    <span className="text-teal-700 font-bold">
                      Portafolio Oficial 2026 (223 Pruebas) · Sin qPCR
                    </span>
                  </div>
                  <div className="w-full bg-teal-600 h-1.5 rounded-full" />
                </div>
              )}

              {requestCategory === 'microbiota' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>MICROBIOTA GASTROINTESTINAL</span>
                    <span className="text-emerald-700 font-bold">
                      {microbiotaSubtype === 'kit' ? '📦 Modalidad: Solicitud de Kit de Toma' : '🚚 Modalidad: Solicitud de Recolección'}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-500 h-1.5 rounded-full" />
                </div>
              )}
            </>
          )}
        </div>

        {/* ==================================================================== */}
        {/* CONTENIDO PRINCIPAL POR PASOS                                        */}
        {/* ==================================================================== */}
        <div className={scrollBodyClasses}>

          {/* ================================================================== */}
          {/* PANTALLA FINAL: RESUMEN DE TODO + INICIO DEL DASHBOARD             */}
          {/* (Figma exact match: Paciente, Síndromes, Resumen orden, Tracking)  */}
          {/* ================================================================== */}
          {isOrderSuccess && submittedOrderData && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* TARJETA 1: INFORMACIÓN BÁSICA DEL PACIENTE & TIPO DE EXAMEN */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
                    {submittedOrderData.patient.avatar || (submittedOrderData.patient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {submittedOrderData.patient.name} {submittedOrderData.patient.lastName || ''}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {submittedOrderData.patient.species} · {submittedOrderData.patient.breed} · {getPatientAgeDisplay(submittedOrderData.patient)} · {submittedOrderData.patient.owner?.name || submittedOrderData.patient.owner?.firstName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#c7f2e5]/80 text-[#0f766e] border border-[#99f6e4] flex items-center gap-1.5 shrink-0">
                    <span className="text-xs">📄</span>
                    <span>{submittedOrderData.examType === 'control' ? 'Seguimiento / control' : 'Examen nuevo'}</span>
                  </div>

                  {submittedOrderData.hasVetPlusInsurance ? (
                    <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-[#6F2BCC] border border-sky-200 flex items-center gap-1.5 shrink-0">
                      <span>🛡️</span>
                      <span>VetPlus: {submittedOrderData.vetPlusCode || 'Asegurado'}</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200 flex items-center gap-1.5 shrink-0">
                      <span>Sin seguro VetPlus</span>
                    </div>
                  )}

                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                    submittedOrderData.isAsymptomatic
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    <span>{submittedOrderData.isAsymptomatic ? '🌿 Asintomático' : '⚠️ Sintomático'}</span>
                  </div>
                </div>
              </div>

              {/* RENDERIZADO CONDICIONAL SEGÚN TIPO: CLÍNICAS vs MICROBIOTA vs qPCR (CONTROL vs NUEVO) */}
              {submittedOrderData.requestCategory === 'clinicas' ? (
                <>
                  {/* Tarjeta de Pruebas Clínicas Ordenadas */}
                  <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        PRUEBAS DIAGNÓSTICAS CLÍNICAS ORDENADAS
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {submittedOrderData.selectedClinicalExams?.length || 1} prueba(s)
                      </span>
                    </div>

                    <div className="border border-slate-200 dark:border-[#2f2257] rounded-xl overflow-hidden bg-white dark:bg-[#150f28]">
                      <div className="bg-slate-50 dark:bg-[#1a1232] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between border-b border-slate-100 dark:border-[#2f2257]">
                        <span>Prueba / Categoría</span>
                        <span>Precio IVA incluido</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-[#2f2257]/40 text-xs">
                        {(submittedOrderData.selectedClinicalExams || []).map((exam, idx) => {
                          const itemPrice = exam.precio || exam.precioIva || 0;
                          return (
                            <div key={idx} className="px-4 py-3 flex items-center justify-between">
                              <div>
                                <div className="font-extrabold text-slate-900 dark:text-slate-100">{exam.nombre}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {exam.categoria} {exam.cups ? `· CUPS: ${exam.cups}` : ''} · Muestra: <strong>{exam.matrizMuestra}</strong> · Entrega: {exam.tiempoEntrega}
                                </div>
                              </div>
                              <span className="font-bold text-slate-800 dark:text-[#01FADA]">${itemPrice.toLocaleString('es-CO')}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-teal-50/80 dark:bg-teal-950/40 px-4 py-3.5 border-t-2 border-teal-200 dark:border-teal-800 flex items-center justify-between text-sm font-extrabold">
                        <span className="text-teal-950 dark:text-teal-200">Total Facturado:</span>
                        <span className="text-teal-800 dark:text-[#01FADA] font-black text-base">{submittedOrderData.totalPrice}</span>
                      </div>
                    </div>

                    {/* Tubos requeridos */}
                    {submittedOrderData.samples && submittedOrderData.samples.length > 0 && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          TUBOS Y MUESTRAS BIOLÓGICAS A TOMAR EN CLÍNICA:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {submittedOrderData.samples.map((samp, sIdx) => (
                            <span key={sIdx} className="px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                              <span>🩸</span>
                              <span>{samp.name || samp}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {submittedOrderData.clinicalObservations && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-amber-900">Observaciones del Veterinario:</span>
                        <p className="text-amber-800">{submittedOrderData.clinicalObservations}</p>
                      </div>
                    )}

                    {submittedOrderData.insuranceInfo && (
                      <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🛡️</span>
                          <div>
                            <span className="font-extrabold text-teal-950 block">
                              {submittedOrderData.insuranceInfo.hasVetPlus ? 'Asegurado con VetPlus' : 'Modalidad de Facturación: Particular'}
                            </span>
                            <span className="text-teal-800 text-[11px]">
                              {submittedOrderData.insuranceInfo.hasVetPlus
                                ? `Convenio VetPlus · Autorización N°: ${submittedOrderData.insuranceInfo.vetPlusAuthCode || 'N/D'}`
                                : 'Sin cobertura de seguro VetPlus · Facturación directa'}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          submittedOrderData.insuranceInfo.hasVetPlus
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {submittedOrderData.insuranceInfo.hasVetPlus ? 'VetPlus' : 'Particular'}
                        </span>
                      </div>
                    )}

                    {submittedOrderData.billingCompany && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-teal-50/50 border border-teal-100 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-teal-900 block mb-1">🏢 Facturación Electrónica & Solicitante:</span>
                          <p className="text-slate-700"><strong>NIT / Cédula:</strong> {submittedOrderData.billingCompany.taxId || 'N/A'}</p>
                          <p className="text-slate-700"><strong>Clínica / Profesional:</strong> {submittedOrderData.billingCompany.clinicOrVetName || 'N/A'}</p>
                          <p className="text-slate-700"><strong>Médico:</strong> {submittedOrderData.billingCompany.solicitingVetName} (T.P. {submittedOrderData.billingCompany.vetLicense})</p>
                          <p className="text-slate-700"><strong>Contacto:</strong> {submittedOrderData.billingCompany.contactPhone}</p>
                        </div>
                        <div>
                          <span className="font-bold text-teal-900 block mb-1">📍 Recolección & Facturación:</span>
                          <p className="text-slate-700"><strong>Dirección:</strong> {submittedOrderData.billingCompany.collectionAddress || 'N/A'}</p>
                          <p className="text-slate-700"><strong>Email reporte:</strong> {submittedOrderData.billingCompany.reportEmail || 'N/A'}</p>
                          <p className="text-slate-700"><strong>Email facturación:</strong> {submittedOrderData.billingCompany.billingEmail || 'N/A'}</p>
                          {submittedOrderData.testDetails?.paymentMethod && (
                            <p className="text-teal-800 font-semibold mt-1">💳 <strong>Método de pago:</strong> {submittedOrderData.testDetails.paymentMethod}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : submittedOrderData.requestCategory === 'microbiota' ? (
                <>
                  {/* Tarjeta de Solicitud de Microbiota */}
                  <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        DETALLES DE LA SOLICITUD DE MICROBIOTA
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {submittedOrderData.microbiotaSubtype === 'kit' ? 'Envío de Kits' : 'Recolección de Muestra'}
                      </span>
                    </div>

                    {submittedOrderData.microbiotaSubtype === 'kit' ? (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Tipo de solicitante:</span>
                          <span className="font-extrabold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            {submittedOrderData.userRole || 'Médico veterinario'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Nombre o razón social:</span>
                          <span className="font-bold text-slate-900">{submittedOrderData.nameOrBusiness || submittedOrderData.recipientContact || submittedOrderData.requestedBy}</span>
                        </div>
                        {submittedOrderData.documentId && (
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                            <span className="text-slate-600 font-medium">NIT o documento de identidad:</span>
                            <span className="font-mono font-bold text-slate-900">{submittedOrderData.documentId}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Ciudad y dirección de envío:</span>
                          <span className="font-bold text-slate-900 text-right">
                            {submittedOrderData.city ? `${submittedOrderData.city} · ` : ''}{submittedOrderData.deliveryAddress || submittedOrderData.shippingAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Número celular:</span>
                          <span className="font-mono font-bold text-slate-900">{submittedOrderData.contactPhone || submittedOrderData.recipientPhone}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Correo para reporte de resultados:</span>
                          <span className="font-bold text-slate-900">{submittedOrderData.reportEmail || submittedOrderData.recipientEmail}</span>
                        </div>
                        {submittedOrderData.billingEmail && (
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                            <span className="text-slate-600 font-medium">Correo electrónico de facturación:</span>
                            <span className="font-bold text-slate-900">{submittedOrderData.billingEmail}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Mascota:</span>
                          <span className="font-bold text-emerald-950">
                            {submittedOrderData.petData?.name || submittedOrderData.petName} ({submittedOrderData.petData?.species || submittedOrderData.petSpecies || 'Canino'})
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Prueba de microbiota:</span>
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            <span>✓</span> Si, es la prueba de microbiota lo que necesito
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Acuerdo de pago:</span>
                          <span className="font-bold text-slate-900">
                            {submittedOrderData.hasPaymentAgreement || 'Sí'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Cantidad de kits:</span>
                          <span className="font-black text-emerald-900">{submittedOrderData.kitQuantity || 1} unidad(es)</span>
                        </div>
                        {submittedOrderData.notes && (
                          <div className="pt-1">
                            <span className="text-slate-600 font-medium block">Notas de entrega:</span>
                            <span className="font-semibold text-slate-800">{submittedOrderData.notes}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Sede de recolección:</span>
                          <span className="font-bold text-slate-900">{submittedOrderData.collectionSede || submittedOrderData.collectionAddress}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Fecha programada de recogida:</span>
                          <span className="font-black text-emerald-900">{submittedOrderData.collectionDate}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Condición de la muestra:</span>
                          <span className="font-bold text-slate-900">{submittedOrderData.sampleCondition || submittedOrderData.sampleType}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <span className="text-slate-600 font-medium">Tarifa del servicio:</span>
                          <span className="font-black text-emerald-800 text-sm">{submittedOrderData.totalPrice}</span>
                        </div>
                        {submittedOrderData.notes && (
                          <div className="pt-1">
                            <span className="text-slate-600 font-medium block">Observaciones:</span>
                            <span className="font-semibold text-slate-800">{submittedOrderData.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : submittedOrderData.examType === 'control' ? (
                <>
                  {/* TARJETA 2 (CONTROL): EXAMEN DE REFERENCIA */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      EXAMEN DE REFERENCIA
                    </span>
                    <div className="border border-sky-100 rounded-xl overflow-hidden bg-sky-50/20 text-xs">
                      <div className="flex items-center justify-between p-3.5 border-b border-sky-100">
                        <span className="text-slate-500 font-medium">Nombre del examen</span>
                        <span className="font-bold text-slate-900">{submittedOrderData.previousExamName}</span>
                      </div>
                      <div className="flex items-center justify-between p-3.5 border-b border-sky-100">
                        <span className="text-slate-500 font-medium">Código del examen</span>
                        <span className="font-mono font-bold text-[#6F2BCC]">{submittedOrderData.previousExamCode}</span>
                      </div>
                      <div className="flex items-center justify-between p-3.5">
                        <span className="text-slate-500 font-medium">Fecha</span>
                        <span className="font-bold text-slate-900">{submittedOrderData.previousExamDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* TARJETA 3 (CONTROL): RESUMEN DE LA ORDEN DE CONTROL & AGENTES EVALUADOS */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        AGENTES POSITIVOS CON DESCUENTO (15%)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        -15% Seguimiento
                      </span>
                    </div>

                    <div className="border border-sky-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                      <div className="bg-[#f0f9ff] px-4 py-2.5 border-b border-sky-200 grid grid-cols-12 text-xs font-bold text-slate-700">
                        <div className="col-span-5 sm:col-span-6">Agente</div>
                        <div className="col-span-2 text-right">Precio base</div>
                        <div className="col-span-3 sm:col-span-2 text-right">Descuento (15%)</div>
                        <div className="col-span-2 text-right">Precio final</div>
                      </div>

                      <div className="divide-y divide-sky-100">
                        {(submittedOrderData.positiveAgents || []).map((ag, idx) => (
                          <div key={idx} className="px-4 py-3 grid grid-cols-12 text-xs items-center bg-white">
                            <div className="col-span-5 sm:col-span-6 italic font-medium text-slate-800">{ag.name}</div>
                            <div className="col-span-2 text-right text-slate-500">${ag.basePrice.toLocaleString('es-CO')}</div>
                            <div className="col-span-3 sm:col-span-2 text-right font-bold text-emerald-600">-${ag.discount.toLocaleString('es-CO')}</div>
                            <div className="col-span-2 text-right font-bold text-slate-900">${ag.finalPrice.toLocaleString('es-CO')}</div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#e0f2fe]/60 px-4 py-3.5 border-t-2 border-sky-200 flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Total con descuento</span>
                        <span className="font-black text-[#6F2BCC] text-base sm:text-lg">{submittedOrderData.totalPrice}</span>
                      </div>
                    </div>

                    {/* Muestras requeridas */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        MUESTRAS REQUERIDAS
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5">
                          <span>🩺</span>
                          <span>Sangre total con EDTA (2 ml)</span>
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5">
                          <span>🧪</span>
                          <span>Hisopado rectal / Heces</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      * Descuento de seguimiento del 15% aplicado sobre patógenos positivos detectados en el examen de referencia previo.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* TARJETA 2: SÍNDROMES CLÍNICOS Y HALLAZGOS */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      SÍNDROMES CLÍNICOS
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {submittedOrderData.isAsymptomatic ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                          <span>🌿</span>
                          <span>Paciente Asintomático (Chequeo molecular preventivo / tamizaje)</span>
                        </div>
                      ) : submittedOrderData.syndromes && submittedOrderData.syndromes.length > 0 ? (
                        submittedOrderData.syndromes.map((synName) => {
                          const synObj = SYNDROMES_LIST.find((s) => s.name === synName);
                          return (
                            <span
                              key={synName}
                              className="px-3.5 py-1.5 rounded-full bg-[#dbeafe] text-[#6F2BCC] text-xs font-bold flex items-center gap-1.5"
                            >
                              <span>{synObj?.icon || '🩺'}</span>
                              <span>{synName}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin síndromes específicos seleccionados</span>
                      )}
                    </div>

                    {submittedOrderData.findings && submittedOrderData.findings.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {submittedOrderData.findings.map((f, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TARJETA 3: RESUMEN DE LA ORDEN qPCR */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      RESUMEN DE LA ORDEN
                    </span>

                    <div className="border border-slate-200 rounded-2xl p-4.5 space-y-3.5 bg-white">
                      {(submittedOrderData.profiles || []).map((profile, pIdx) => {
                        const origProfile = QPCR_CATALOG.find((p) => p.id === profile.id);
                        return (
                          <div key={pIdx} className="space-y-3">
                            {/* Header: Título, etiqueta Amplio, precio */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900">
                                  {profile.title}
                                </h4>
                                <span className="bg-[#ede9fe] text-[#7c3aed] text-[11px] font-bold px-2 py-0.5 rounded-md">
                                  {profile.type || 'Amplio'}
                                </span>
                              </div>
                              <span className="text-sm font-extrabold text-[#6F2BCC]">
                                ${profile.price.toLocaleString('es-CO')}
                              </span>
                            </div>

                            {/* Pills de agentes (itálica celestes, o con badge si fue reemplazado) */}
                            <div className="flex flex-wrap gap-1.5">
                              {profile.agents.map((agent, aIdx) => {
                                const origAgent = profile.originalAgents?.[aIdx] || origProfile?.agents?.[aIdx];
                                const wasReplaced = origAgent && origAgent !== agent;

                                return wasReplaced ? (
                                  <span
                                    key={aIdx}
                                    className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                                  >
                                    <span className="line-through text-slate-400 text-[11px]">{origAgent}</span>
                                    <span className="text-amber-800 font-bold">➔ Reemplazado por: <strong className="underline text-[#6F2BCC]">{agent}</strong></span>
                                  </span>
                                ) : (
                                  <span
                                    key={aIdx}
                                    className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] text-xs italic font-medium"
                                  >
                                    {agent}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Pills de muestras requeridas */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {profile.samples.map((samp, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5"
                                >
                                  <span>🩺</span>
                                  <span>{samp.name || samp}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Tabla resumen interior con total */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <div className="bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden">
                          {(submittedOrderData.profiles || []).map((profile, pIdx) => (
                            <div key={pIdx} className="px-3.5 py-2 flex items-center justify-between text-xs text-slate-700 border-b border-slate-200/60 last:border-b-0">
                              <span>{profile.title}</span>
                              <span className="font-semibold text-slate-900">${profile.price.toLocaleString('es-CO')}</span>
                            </div>
                          ))}
                          {submittedOrderData.additionalCost > 0 && (
                            <div className="px-3.5 py-2 flex items-center justify-between text-xs text-amber-800 bg-amber-50/50">
                              <span>Ajuste por reemplazo de agentes adicionales ({submittedOrderData.replacementCount} modificaciones)</span>
                              <span className="font-bold">+${submittedOrderData.additionalCost.toLocaleString('es-CO')}</span>
                            </div>
                          )}
                          <div className="px-3.5 py-2.5 bg-[#e0f2fe]/50 border-t border-sky-200 flex items-center justify-between text-xs">
                            <strong className="text-slate-900 font-extrabold text-sm">Total estimado</strong>
                            <strong className="text-[#6F2BCC] font-black text-base">{submittedOrderData.totalPrice}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      * El valor final puede variar según ajustes de agentes confirmados por el laboratorio.
                    </p>
                  </div>
                </>
              )}

              {/* BOTONES DE RETORNO Y SEGUIMIENTO (DIRECTO TRAS EL RESUMEN) */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>📋</span> Volver a Pacientes
                </button>
                {onNavigateToTracking && (
                  <button
                    type="button"
                    onClick={onNavigateToTracking}
                    className="px-6 py-3 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>🚚</span> Ver en Seguimiento de Órdenes
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetToNewExam}
                  className="px-5 py-3 border border-sky-300 text-sky-700 hover:bg-sky-50 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>+</span> Solicitar otro examen
                </button>
              </div>

            </div>
          )}

          {/* ================================================================== */}
          {/* ================================================================== */}
          {/* PANTALLA DE REVISIÓN Y CONFIRMACIÓN DE SOLICITUD DE CONTROL       */}
          {/* (Exacto Figma imagen media_1791558838111.png)                      */}
          {/* ================================================================== */}
          {!isOrderSuccess && isControlReviewOpen && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* FICHA RESUMEN DEL PACIENTE */}
              {activePatient && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activePatient.avatar || (activePatient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {activePatient.name} {activePatient.lastName || ''}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activePatient.species} · {activePatient.breed} · {getPatientAgeDisplay(activePatient)} · {activePatient.owner?.name || 'Tutor registrado'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {hasVetPlusInsurance ? (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 text-[#6F2BCC] border border-sky-200">
                        🛡️ VetPlus: {vetPlusCode || 'Asegurado'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                        Sin seguro VetPlus
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* EXAMEN DE REFERENCIA */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  EXAMEN DE REFERENCIA
                </span>
                <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden shadow-2xs">
                  <div className="px-5 py-3.5 flex items-center justify-between text-xs border-b border-sky-100">
                    <span className="text-slate-500 font-medium">Nombre del examen</span>
                    <span className="font-bold text-slate-900">{controlHistoryInfo.lastExamName || 'Panel Hemotrópico Canino'}</span>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between text-xs border-b border-sky-100">
                    <span className="text-slate-500 font-medium">Código del examen</span>
                    <span className="font-mono font-bold text-[#6F2BCC]">{previousExamCode || controlHistoryInfo.lastExamId || 'CTRL-3-2026'}</span>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Fecha</span>
                    <span className="font-bold text-slate-900">{controlHistoryInfo.lastExamDate || '03/09/2026'}</span>
                  </div>
                </div>
              </div>

              {/* AGENTES POSITIVOS CON DESCUENTO (15%) & RECTIFICACIÓN */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    AGENTES POSITIVOS CON DESCUENTO (15%)
                  </span>
                  
                  {/* Controles de rectificación */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Rectificados: <strong className="text-[#6F2BCC] font-bold">{activeControlAgents.length}</strong> de {controlHistoryInfo.positiveAgents.length}
                    </span>
                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                      <button
                        type="button"
                        onClick={handleSelectAllControlAgents}
                        className="text-[10px] font-bold text-[#6F2BCC] hover:underline cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllControlAgents}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Ninguno
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banner de ayuda clínica para la rectificación */}
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center gap-2.5 text-xs text-[#2B017C]">
                  <span className="text-base shrink-0">💡</span>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Rectifica los agentes:</strong> Puedes marcar o desmarcar con el checkbox qué patógenos deseas re-evaluar en esta orden de control. A cada agente se le aplica individualmente el <strong>15% de descuento</strong>.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden shadow-2xs">
                  {/* Cabecera tabla */}
                  <div className="bg-[#f0f9ff] px-5 py-3 border-b border-sky-200 grid grid-cols-12 text-xs font-bold text-slate-600">
                    <div className="col-span-6 sm:col-span-6 flex items-center gap-2">
                      <span>Agente</span>
                    </div>
                    <div className="col-span-2 text-right">Precio base</div>
                    <div className="col-span-2 text-right">Descuento (15%)</div>
                    <div className="col-span-2 text-right">Precio final</div>
                  </div>

                  {/* Filas interactivas con checkbox para rectificación */}
                  <div className="divide-y divide-sky-100">
                    {controlHistoryInfo.positiveAgents.map((ag) => {
                      const isSelected = selectedControlAgentIds.includes(ag.id);

                      return (
                        <div
                          key={ag.id}
                          onClick={() => handleToggleControlAgent(ag.id)}
                          className={`px-5 py-3.5 grid grid-cols-12 text-xs items-center cursor-pointer transition-colors ${
                            isSelected ? 'bg-white hover:bg-sky-50/30' : 'bg-slate-50/70 opacity-60 hover:opacity-80'
                          }`}
                        >
                          <div className="col-span-6 sm:col-span-6 flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleControlAgent(ag.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-[#6F2BCC] rounded cursor-pointer accent-[#6F2BCC] shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`italic font-medium ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400 line-through'}`}>
                                  {ag.name}
                                </span>
                                {isSelected ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    ✓ A controlar
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                    Excluido
                                  </span>
                                )}
                              </div>
                              {(ag.ct || ag.load) && (
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                  {ag.ct && ag.ct !== 'N/D' ? `Ct anterior: ${ag.ct}` : ''}
                                  {ag.load ? ` · ${ag.load}` : ''}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={`col-span-2 text-right ${isSelected ? 'text-slate-500' : 'text-slate-300 line-through'}`}>
                            ${ag.basePrice.toLocaleString('es-CO')}
                          </div>

                          <div className={`col-span-2 text-right font-bold ${isSelected ? 'text-emerald-600' : 'text-slate-300 line-through'}`}>
                            -${ag.discount.toLocaleString('es-CO')}
                          </div>

                          <div className={`col-span-2 text-right font-bold ${isSelected ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                            ${ag.finalPrice.toLocaleString('es-CO')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fila Total Reactiva */}
                  <div className="bg-[#e0f2fe]/60 px-5 py-4 border-t-2 border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Total con descuento</span>
                      {activeControlDiscount > 0 && (
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          Ahorro total aplicado en control: -${activeControlDiscount.toLocaleString('es-CO')} COP (-15%)
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#6F2BCC] text-xl block">
                        ${activeControlTotal.toLocaleString('es-CO')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {activeControlAgents.length} {activeControlAgents.length === 1 ? 'agente rectificado' : 'agentes rectificados'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Advertencia si no hay agentes seleccionados */}
                {activeControlAgents.length === 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>No has seleccionado ningún agente para este control. Marca al menos un agente positivo de la tabla para solicitar la orden.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* PANTALLA INICIAL: SELECCIÓN DEL TIPO DE EXAMEN (ORDEN OFICIAL)     */}
          {/* 1. Clínicas, 2. qPCR, 3. Microbiota                                */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === null && (
            <div className="py-6 sm:py-10 px-2 sm:px-6 space-y-8 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-2.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-[#6F2BCC] dark:bg-purple-950/70 dark:text-[#a78bfa] dark:border dark:border-purple-800/50 inline-block shadow-2xs">
                  Nuevo Examen Diagnóstico
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  ¿Qué tipo de examen desea solicitar?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Seleccione el catálogo o modalidad requerida para desplegar el formulario correspondiente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {/* 1. CLÍNICAS */}
                <button
                  type="button"
                  onClick={() => setRequestCategory('clinicas')}
                  className="p-6 rounded-3xl border-2 border-teal-200 dark:border-teal-800/60 bg-gradient-to-b from-teal-50/50 via-white to-teal-50/20 dark:from-[#1b1433] dark:via-[#16102c] dark:to-[#120d26] hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-xl dark:hover:shadow-teal-950/40 transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-2xs">
                      🏥
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-100/80 dark:bg-teal-950/80 dark:text-teal-300 dark:border dark:border-teal-800/60 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                        1. Portafolio Clínico
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors">
                        Solicitud de Clínicas
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        Portafolio oficial de 223 pruebas de laboratorio clínico (Hematología, Química, Uroanálisis, Hormonas, Citología).
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-teal-100 dark:border-teal-900/40 flex items-center justify-between text-xs font-black text-teal-700 dark:text-[#01FADA]">
                    <span>Tramitar Clínicas</span>
                    <span className="text-base group-hover:translate-x-1.5 transition-transform">➔</span>
                  </div>
                </button>

                {/* 2. qPCR */}
                <button
                  type="button"
                  onClick={() => setRequestCategory('qpcr')}
                  className="p-6 rounded-3xl border-2 border-purple-200 dark:border-purple-800/60 bg-gradient-to-b from-purple-50/50 via-white to-purple-50/20 dark:from-[#1d1436] dark:via-[#16102c] dark:to-[#120d26] hover:border-[#6F2BCC] dark:hover:border-[#9333ea] hover:shadow-xl dark:hover:shadow-purple-950/40 transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#6F2BCC] dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-2xs">
                      🧬
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#6F2BCC] bg-purple-100/80 dark:bg-purple-950/80 dark:text-purple-300 dark:border dark:border-purple-800/60 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                        2. Biología Molecular
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#2B017C] dark:group-hover:text-purple-300 transition-colors">
                        Biología Molecular (qPCR)
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        Detección cuantitativa de patógenos con motor de recomendación sindrómica y personalización de agentes.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs font-black text-[#6F2BCC] dark:text-[#c084fc]">
                    <span>Tramitar qPCR</span>
                    <span className="text-base group-hover:translate-x-1.5 transition-transform">➔</span>
                  </div>
                </button>

                {/* 3. MICROBIOTA */}
                <button
                  type="button"
                  onClick={() => setRequestCategory('microbiota')}
                  className="p-6 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/20 dark:from-[#16242c] dark:via-[#151c2e] dark:to-[#120d26] hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-xl dark:hover:shadow-emerald-950/40 transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-2xs">
                      🦠
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/60 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                        3. Secuenciación 16S
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-950 dark:group-hover:text-emerald-300 transition-colors">
                        Solicitud de Microbiota
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        Solicitud de kits o programación de recolección de muestra fecal con anamnesis oficial OSD+LIFE.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs font-black text-emerald-700 dark:text-[#34d399]">
                    <span>Tramitar Microbiota</span>
                    <span className="text-base group-hover:translate-x-1.5 transition-transform">➔</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* PASO 1 (qPCR): TIPO DE EXAMEN Y BUSCADOR REACTIVO DE PACIENTE      */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'qpcr' && currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Indica el tipo de examen y busca al paciente
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona la modalidad de la orden y busca al paciente por su nombre en el filtro. Solo se puede seleccionar 1 paciente.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-5 shadow-2xs">
                
                {/* 1.1 Tipo de examen: Nuevo vs Control (SOLO se muestra si el paciente califica para control) */}
                {activePatient && controlHistoryInfo.canRequestControl && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700">
                        Tipo de examen *
                      </label>
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <span>✓</span> Habilitado para control (Examen previo {controlHistoryInfo.lastExamId})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleExamType('nuevo')}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          examType === 'nuevo'
                            ? 'bg-[#6F2BCC] text-white shadow-sm ring-2 ring-[#6F2BCC]/30'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>🆕</span> Examen nuevo
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleExamType('control')}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          examType === 'control'
                            ? 'bg-[#6F2BCC] text-white shadow-sm ring-2 ring-[#6F2BCC]/30'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>🔄</span> Seguimiento / control
                      </button>
                    </div>
                  </div>
                )}

                {/* Si es seguimiento / control: Se solicita el código del examen anterior */}
                {examType === 'control' && controlHistoryInfo.canRequestControl && (
                  <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-sky-950">
                      Código del examen anterior *
                    </label>
                    <p className="text-[11px] text-sky-700">
                      Ingrese el identificador de la orden molecular previa para comparar las curvas de amplificación.
                    </p>
                    <input
                      type="text"
                      value={previousExamCode}
                      onChange={(e) => setPreviousExamCode(e.target.value)}
                      placeholder="Ej. QPCR-2026-904 o ORD-2026-102"
                      className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                  </div>
                )}

                {/* 1.2 Buscador y selector limpio de paciente */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Paciente *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      (Haz clic para seleccionar o deseleccionar)
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Escribe el nombre del paciente, especie o tutor para buscar..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Lista limpia: solo borde azul si está seleccionado, y clic de nuevo para deseleccionar */}
                  {displayedPatients.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {displayedPatients.map((p) => {
                        const isSelected = p.id === selectedPatientId;
                        const isDeceased = p.status === 'fallecido';
                        return (
                          <div
                            key={p.id}
                            onClick={() => !isDeceased && handleTogglePatientSelection(p)}
                            className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                              isDeceased
                                ? 'border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'border-2 border-[#6F2BCC] bg-sky-50/40 shadow-xs cursor-pointer'
                                : 'border border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{p.avatar || (p.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}</span>
                              <div>
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{p.name} {p.lastName || ''}</span>
                                  {isDeceased && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                                      Fallecido 🔒
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {p.species} · {p.breed} · {p.owner?.name || 'Tutor registrado'}
                                </div>
                              </div>
                            </div>

                            {isDeceased ? (
                              <span className="text-[11px] font-bold text-slate-400 bg-slate-200/80 px-2.5 py-1 rounded-lg select-none">
                                Solicitud Bloqueada
                              </span>
                            ) : isSelected ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#6F2BCC] bg-sky-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <span>✓</span> Seleccionado {initialPatient && initialPatient.id === p.id ? '(Dato preguardado)' : ''}
                                </span>
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                  (Clic para deseleccionar)
                                </span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* REQUERIMIENTO FIGMA: Alerta visual de plazo adecuado para control qPCR */}
                  {activePatient && controlHistoryInfo.canRequestControl && (
                    <div className="p-4 sm:p-5 bg-[#fff8f0] border border-[#fed7aa] rounded-2xl flex items-start gap-3.5 shadow-2xs animate-in fade-in duration-200">
                      <span className="text-2xl shrink-0 mt-0.5">⚠️</span>
                      <div className="space-y-2.5 flex-1">
                        <div>
                          <h4 className="text-sm font-bold text-[#9a3412]">
                            Control dentro del período de seguimiento
                          </h4>
                          <p className="text-xs text-[#7c2d12] mt-1 leading-relaxed">
                            <strong className="font-bold text-[#431407]">{activePatient.name}</strong> tuvo un examen hace <strong className="font-bold text-[#431407]">{controlHistoryInfo.daysAgo} días</strong> ({controlHistoryInfo.lastExamDate}). Este paciente se encuentra dentro del período de control recomendado de 6 meses. Considera si este examen es un seguimiento o un nuevo diagnóstico.
                          </p>
                        </div>

                        {examType !== 'control' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setExamType('control');
                              if (controlHistoryInfo.lastExamId) {
                                setPreviousExamCode(controlHistoryInfo.lastExamId);
                              }
                              setIsControlReviewOpen(true);
                            }}
                            className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span>Solicitar control</span>
                            <span>→</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ffedd5] border border-[#fdba74] text-[#9a3412] rounded-xl text-xs font-bold">
                              <span>✓</span>
                              <span>Modo control (Código: {previousExamCode || controlHistoryInfo.lastExamId})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsControlReviewOpen(true)}
                              className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <span>Ver agentes y solicitar control</span>
                              <span>→</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  {/* ================================================================ */}
                  {/* CONFIGURACIÓN CLÍNICA DEL PACIENTE SELECCIONADO (PASO 1)          */}
                  {/* Esterilización, Alergias, Modalidad, VetPlus y Estado Clínico    */}
                  {/* ================================================================ */}
                  {activePatient && (
                    <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                      
                      {/* 1. ESTADO DE ESTERILIZACIÓN */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <span>🩺</span> ¿El paciente está esterilizado? <span className="text-rose-500 font-bold">*</span>
                          </span>
                          {isAlreadySterilized && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300 flex items-center gap-1">
                              <span>✓</span> Esterilizado previamente
                            </span>
                          )}
                        </div>

                        {isAlreadySterilized ? (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                            <span className="text-base text-emerald-600">✓</span>
                            <span>
                              Este paciente ya se encuentra registrado como <strong>esterilizado</strong> en su ficha clínica. No se requiere volver a preguntar.
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                            <p className="text-[11px] text-slate-500">
                              Indique si la mascota ha sido castrada / esterilizada:
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setExamIsSterilized(true)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  examIsSterilized === true
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <span>✓</span> Sí, está esterilizado
                              </button>
                              <button
                                type="button"
                                onClick={() => setExamIsSterilized(false)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  examIsSterilized === false
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                No está esterilizado
                              </button>
                            </div>
                            {examIsSterilized === true && (
                              <span className="text-[10px] text-emerald-700 font-semibold block">
                                ✓ Se actualizará permanentemente la ficha médica del paciente para no volver a preguntar en futuras órdenes.
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. GESTIÓN DE ALERGIAS */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>🌿</span> Alergias del paciente:
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {patientAllergiesList.length} registrada(s)
                          </span>
                        </div>

                        {/* Badges de alergias registradas */}
                        {patientAllergiesList.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {patientAllergiesList.map((allergy, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                              >
                                <span>⚠️ {allergy}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAllergy(idx)}
                                  className="text-amber-700 hover:text-amber-950 font-bold text-xs cursor-pointer ml-1"
                                  title="Eliminar alergia"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600">
                            <span>Sin alergias previas registradas para este paciente.</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setHasAllergiesOption(false)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                  hasAllergiesOption === false ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                No presenta
                              </button>
                              <button
                                type="button"
                                onClick={() => setHasAllergiesOption(true)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                  hasAllergiesOption === true ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                Sí presenta
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Input para agregar nuevas alergias */}
                        {(patientAllergiesList.length > 0 || hasAllergiesOption === true) && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={newAllergyInput}
                              onChange={(e) => setNewAllergyInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddAllergy();
                                }
                              }}
                              placeholder="Escriba otra alergia (ej. Penicilina, Pollo, Picadura de pulga...) y haga clic en Agregar"
                              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleAddAllergy}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                            >
                              + Agregar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 3. CONDICIÓN CLÍNICA DEL PACIENTE */}
                      <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="mb-0.5">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <span>🩺</span> Condición clínica actual del paciente <span className="text-rose-500 font-bold">*</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isAsymptomatic === true
                              ? '🌿 Tamizaje molecular o chequeo preventivo general (sin sintomatología evidente).'
                              : isAsymptomatic === false
                              ? '⚠️ Paciente con signología clínica activa o sospecha de patología.'
                              : 'Seleccione si el paciente presenta signos clínicos activos o es un chequeo asintomático.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsAsymptomatic(false)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isAsymptomatic === false
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Sintomático
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAsymptomatic(true)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isAsymptomatic === true
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            🌿 Asintomático
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {!activePatient && searchTerm.trim() === '' && (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50/60 border border-dashed border-slate-200 rounded-xl">
                      Escribe en el buscador para ver los pacientes. Al seleccionar uno, se ocultarán los demás para evitar confusión.
                    </div>
                  )}

                  {searchTerm.trim() !== '' && displayedPatients.length === 0 && !activePatient && (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                      No se encontraron pacientes que coincidan con "{searchTerm}".
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* PASO 2: FACTORES DE RIESGO EPIDEMIOLÓGICOS                         */}
          {/* Requerimiento: Desde riesgos en adelante es la solicitud porque    */}
          {/* estos factores modulan el perfil qPCR a solicitar                  */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'qpcr' && currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Encabezado del Paso 2 */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Factores de Riesgo Epidemiológicos
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Información de hábitat, viajes y exposición que alimenta el algoritmo de coincidencia qPCR
                  </p>
                </div>
                {activePatient && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#6F2BCC] flex items-center gap-1.5">
                    <span>{activePatient.avatar || '🐾'}</span>
                    <span>{activePatient.name}</span>
                  </span>
                )}
              </div>

              {/* Banner informativo de correlación diagnóstica */}
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start gap-3 text-xs text-[#2B017C]">
                <span className="text-2xl shrink-0 mt-0.5">🌲</span>
                <div>
                  <strong className="font-extrabold block mb-0.5">
                    Correlación de Factores Ambientales y Vectores
                  </strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    La exposición a garrapatas, pulgas, viajes a zonas endémicas, hábitat exterior o convivencia con otros animales modulan los perfiles qPCR recomendados en el siguiente paso.
                  </p>
                </div>
              </div>

              {/* Formulario de Factores de Riesgo */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-6 shadow-2xs">
                
                {/* 2.1 Hábitat principal y Área de residencia (Separados con tarjetas independientes y obligatorios) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tarjeta 1: Hábitat principal */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span>🏡</span> Hábitat principal <span className="text-rose-500 font-bold">*</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Nivel de permanencia habitual en interiores o exteriores
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {['Interiores', 'Exterior', 'Mixto'].map((hab) => (
                        <button
                          key={hab}
                          type="button"
                          onClick={() => handleRiskChange('habitat', hab)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            riskFactors.habitat === hab
                              ? 'bg-[#6F2BCC] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{hab === 'Interiores' ? '🏠' : hab === 'Exterior' ? '🌳' : '🏡'}</span>
                          <span>{hab}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tarjeta 2: Área de residencia / vivienda */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span>📍</span> Área de residencia <span className="text-rose-500 font-bold">*</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Clasificación del entorno demográfico del paciente
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {['Urbana', 'Rural'].map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleRiskChange('housingArea', area)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            riskFactors.housingArea === area
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{area === 'Urbana' ? '🏙️' : '🌾'}</span>
                          <span>{area === 'Urbana' ? 'Urbana' : 'Rural / Campestre'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tarjeta 3: Tipo de residencia */}
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span>🏢</span> Tipo de residencia / vivienda <span className="text-rose-500 font-bold">*</span>
                    </span>
                  </div>
                  <select
                    value={riskFactors.housingType}
                    onChange={(e) => handleRiskChange('housingType', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none bg-white cursor-pointer font-medium text-slate-800"
                  >
                    <option value="">-- Seleccione tipo de residencia --</option>
                    <option value="Casa con jardín / patio">Casa con jardín / patio</option>
                    <option value="Casa cerrada (sin patio)">Casa cerrada (sin patio)</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Finca / Parcela / Hacienda">Finca / Parcela / Hacienda</option>
                    <option value="Albergue / Refugio">Albergue / Refugio</option>
                    <option value="Otro">Otro tipo de vivienda</option>
                  </select>
                </div>

                {/* 2.2 Convivencia con otros animales */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>🐾</span> ¿Convive con otros animales en el hogar o entorno? <span className="text-rose-500 font-bold">*</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Aumenta probabilidad de transmisión horizontal de patógenos
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRiskChange('livesWithOtherAnimals', false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          riskFactors.livesWithOtherAnimals === false
                            ? 'bg-slate-700 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRiskChange('livesWithOtherAnimals', true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          riskFactors.livesWithOtherAnimals === true
                            ? 'bg-[#6F2BCC] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {riskFactors.livesWithOtherAnimals && (
                    <div className="pt-2 border-t border-slate-200 space-y-2 animate-in fade-in duration-150">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Especies con las que convive:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Caninos', 'Felinos', 'Aves', 'Roedores', 'Equinos / Granja'].map((sp) => {
                          const isSel = riskFactors.cohabitingSpecies.includes(sp);
                          return (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => handleToggleCohabitingSpecies(sp)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-[#6F2BCC] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isSel ? `✓ ${sp}` : `+ ${sp}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Especie personalizada */}
                      <div className="flex gap-2 pt-1">
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
                          placeholder="Otra especie con la que convive..."
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCohabitingSpecies}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2.3 Viajes recientes fuera del departamento / país */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>✈️</span> ¿Ha viajado recientemente fuera del departamento o del país? <span className="text-rose-500 font-bold">*</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Zonas de clima cálido, cuencas fluviales, costa o áreas endémicas
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRiskChange('recentTravel', false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          riskFactors.recentTravel === false
                            ? 'bg-slate-700 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRiskChange('recentTravel', true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          riskFactors.recentTravel === true
                            ? 'bg-[#6F2BCC] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Sí
                      </button>
                    </div>
                  </div>

                  {riskFactors.recentTravel && (
                    <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-150 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Departamento o destino del viaje más reciente:
                      </label>
                      <select
                        value={riskFactors.recentTravelDepartment || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleRiskChange('recentTravelDepartment', val);
                          if (!riskFactors.recentTravelDetails) {
                            handleRiskChange('recentTravelDetails', val);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Seleccione departamento o destino --</option>
                        {COLOMBIAN_DEPARTMENTS_LIST.map((dep) => (
                          <option key={dep} value={dep}>
                            {dep}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={riskFactors.recentTravelDetails}
                        onChange={(e) => handleRiskChange('recentTravelDetails', e.target.value)}
                        placeholder="Municipio, vereda o detalles adicionales del viaje (opcional)..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 2.4 Exposición a vectores biológicos */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Exposición a factores biológicos y vectores conocidos:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      riskFactors.parasiteExposure
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}>
                      <input
                        type="checkbox"
                        checked={riskFactors.parasiteExposure}
                        onChange={(e) => handleRiskChange('parasiteExposure', e.target.checked)}
                        className="w-4 h-4 text-[#6F2BCC] rounded cursor-pointer accent-[#6F2BCC]"
                      />
                      <span className="text-xs font-semibold">🪲 Exposición a garrapatas o pulgas</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      riskFactors.ruralAccess
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}>
                      <input
                        type="checkbox"
                        checked={riskFactors.ruralAccess}
                        onChange={(e) => handleRiskChange('ruralAccess', e.target.checked)}
                        className="w-4 h-4 text-[#6F2BCC] rounded cursor-pointer accent-[#6F2BCC]"
                      />
                      <span className="text-xs font-semibold">🌲 Acceso a zonas boscosas, rurales o vegetación densa</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      riskFactors.outdoorWater
                        ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}>
                      <input
                        type="checkbox"
                        checked={riskFactors.outdoorWater}
                        onChange={(e) => handleRiskChange('outdoorWater', e.target.checked)}
                        className="w-4 h-4 text-[#6F2BCC] rounded cursor-pointer accent-[#6F2BCC]"
                      />
                      <span className="text-xs font-semibold">💧 Contacto con aguas estancadas / ríos</span>
                    </label>
                  </div>

                  {/* Información heredada de rescate en zona costera desde la matrícula del paciente */}
                  {activePatient?.riskFactors?.coastalRescue && (
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center gap-2.5 text-xs text-[#2B017C]">
                      <span className="text-base shrink-0">🏖️</span>
                      <div>
                        <span className="font-bold">Antecedente de matrícula:</span>{' '}
                        <span>Paciente registrado como rescatado de zona costera o refugio</span>
                        {activePatient.riskFactors.coastalRescueLocation && (
                          <span className="text-purple-700 font-semibold"> ({activePatient.riskFactors.coastalRescueLocation})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2.5 Otros factores de riesgo */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Otros factores de riesgo específicos (Opcional):
                  </label>
                  {otherRiskFactorsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-1">
                      {otherRiskFactorsList.map((rf, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 text-[#6F2BCC] border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>{rf}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRiskFactor(idx)}
                            className="text-purple-600 hover:text-purple-900 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
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
                      placeholder="Ej. Inmunosupresión previa, mordedura, transfusión sanguínea..."
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddRiskFactor}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* PASO 3: EVALUACIÓN CLÍNICA, CUADRO HEMÁTICO E HISTORIA CLÍNICA    */}
          {/* Requerimiento: Síndromes, hallazgos, TLLC en segundos, hemograma y */}
          {/* DIRECTAMENTE ABAJO DEL CUADRO HEMÁTICO: Subir historia clínica     */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'qpcr' && currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Encabezado del Paso 3 */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Evaluación Clínica, Laboratorio e Historia Clínica
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Síndromes clínicos observados, hemograma y carga de la historia clínica
                  </p>
                </div>
                {activePatient && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#6F2BCC] flex items-center gap-1.5">
                    <span>{activePatient.avatar || '🐾'}</span>
                    <span>{activePatient.name}</span>
                  </span>
                )}
              </div>

              {/* Banner si el paciente es asintomático */}
              {isAsymptomatic && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🌿</span>
                    <div>
                      <div className="font-bold text-emerald-950">Paciente Asintomático (Chequeo Preventivo)</div>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        La selección de síndromes y síntomas es opcional para este perfil de tamizaje molecular.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    Ir a Perfiles qPCR →
                  </button>
                </div>
              )}

              {/* ASISTENTE DIAGNÓSTICO: ANTECEDENTES Y EXÁMENES PREVIOS SUBIDOS */}
              {activePatient?.clinicalDocuments && activePatient.clinicalDocuments.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-sky-50/80 border-2 border-[#6F2BCC]/30 rounded-2xl shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#6F2BCC] text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                        📂
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#2B017C] flex items-center gap-1.5 flex-wrap">
                          <span>Antecedentes de Historias y Exámenes Previos Detectados</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6F2BCC] text-white">
                            {activePatient.clinicalDocuments.length} doc(s) en ficha
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Se detectaron exámenes previos e historia clínica subida para <strong>{activePatient.name}</strong>. Puedes incorporar automáticamente sus hallazgos al algoritmo de qPCR.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleImportFromClinicalDocuments}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                    >
                      <span>✨</span>
                      <span>Incorporar a evaluación qPCR</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {activePatient.clinicalDocuments.map((doc) => (
                      <div key={doc.id} className="p-3 bg-white/95 border border-purple-100 rounded-xl text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span className="truncate max-w-[200px] flex items-center gap-1">
                            <span>{doc.documentType === 'laboratorio' ? '🩸' : doc.documentType === 'imagenologia' ? '🩻' : '📋'}</span>
                            <span>{doc.title}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{doc.date}</span>
                        </div>
                        {doc.keyFindings && doc.keyFindings.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {doc.keyFindings.map((f, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-purple-50 text-[#6F2BCC] text-[10px] font-bold border border-purple-200/60">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                        {doc.notes && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                            "{doc.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {isImportedFromHistory && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span>Hallazgos clínicos, valores de hemograma y antecedentes de los documentos vinculados activamente al cálculo de perfiles qPCR.</span>
                    </div>
                  )}
                </div>
              )}

              {/* 3.1 SÍNDROMES CLÍNICOS */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 block">
                    Síndrome clínico observado (puedes seleccionar varios)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedSyndromes.length > 0 ? 'bg-purple-100 text-[#6F2BCC]' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {selectedSyndromes.length} seleccionados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SYNDROMES_LIST.map((syn) => {
                    const isSelected = selectedSyndromes.includes(syn.name);
                    return (
                      <div
                        key={syn.id}
                        onClick={() => handleToggleSyndrome(syn.name)}
                        className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[105px] ${
                          isSelected
                            ? 'bg-sky-50/70 border-[#6F2BCC] ring-1 ring-[#6F2BCC] shadow-2xs'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{syn.icon}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#6F2BCC] text-white flex items-center justify-center text-[10px] font-black">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <h4 className={`text-xs font-bold ${isSelected ? 'text-[#6F2BCC]' : 'text-slate-800'}`}>
                            {syn.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {syn.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3.2 SINTOMATOLOGÍA Y HALLAZGOS */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2.5">
                    HALLAZGOS FRECUENTES ASOCIADOS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableFindingsFromSyndromes.map((finding) => {
                      const isSelected = selectedFindings.includes(finding);
                      return (
                        <button
                          key={finding}
                          type="button"
                          onClick={() => handleToggleFinding(finding)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#6F2BCC] text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {finding}
                        </button>
                      );
                    })}

                    {customFindings.map((finding) => {
                      const isSelected = selectedFindings.includes(finding);
                      return (
                        <button
                          key={finding}
                          type="button"
                          onClick={() => handleToggleFinding(finding)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-sky-50 border border-sky-300 text-sky-800'
                          }`}
                        >
                          <span>✦</span> {finding}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    AGREGAR HALLAZGO MANUALMENTE
                  </label>
                  <form onSubmit={handleAddManualFinding} className="flex gap-2">
                    <input
                      type="text"
                      value={manualFindingInput}
                      onChange={(e) => setManualFindingInput(e.target.value)}
                      placeholder="Ej. poliuria, petequias, epistaxis... (Enter para agregar)"
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </form>
                </div>
              </div>

              {/* 3.3 CONSTANTES VITALES Y TIEMPO DE LLENADO CAPILAR (TLLC EN SEGUNDOS) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⏱️</span> Constantes Vitales & Examen Físico
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Registre el tiempo de llenado capilar en segundos y el estado de mucosas del paciente.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      TLLC (Segundos)
                    </label>
                    <input
                      type="text"
                      value={vitalSignsCapillaryRefillTime}
                      onChange={(e) => setVitalSignsCapillaryRefillTime(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="Ej. 2"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      En segundos (ej. &lt; 2 s)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mucosas
                    </label>
                    <select
                      value={vitalSignsMucosa}
                      onChange={(e) => setVitalSignsMucosa(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="">Seleccione...</option>
                      <option value="Rosadas (Normales)">Rosadas (Normales)</option>
                      <option value="Pálidas (Anemia)">Pálidas (Anemia)</option>
                      <option value="Ictéricas (Hepatobiliar)">Ictéricas (Hepatobiliar)</option>
                      <option value="Cianóticas (Hipoxia)">Cianóticas (Hipoxia)</option>
                      <option value="Congestivas">Congestivas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Temperatura (°C)
                    </label>
                    <input
                      type="text"
                      value={vitalSignsTemp}
                      onChange={(e) => setVitalSignsTemp(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="Ej. 38.5"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Frec. Cardíaca (bpm)
                    </label>
                    <input
                      type="text"
                      value={vitalSignsHeartRate}
                      onChange={(e) => setVitalSignsHeartRate(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej. 110"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Frec. Resp. (rpm)
                    </label>
                    <input
                      type="text"
                      value={vitalSignsResp}
                      onChange={(e) => setVitalSignsResp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej. 28"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3.4 EVALUACIÓN CLÍNICA PREVIA Y CUADRO HEMÁTICO (HEMOGRAMA) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                {/* Cabecera */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🩸</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#2B017C] uppercase tracking-wider">
                        Evaluación Clínica y Cuadro Hemático
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Defina si el paciente cuenta con valoración clínica o hemograma de laboratorio previo al perfil molecular.
                      </p>
                    </div>
                  </div>
                  {hasPreviousClinicalExam === 'si' && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <span>✓</span> {hasCuadroHematico ? 'Hemograma adjunto' : 'Examen clínico previo'}
                    </span>
                  )}
                  {hasPreviousClinicalExam === 'no' && clinicalRiskDisclaimerAccepted && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <span>⚠️</span> Sin examen clínico (Bajo riesgo médico)
                    </span>
                  )}
                </div>

                {/* Pregunta Inicial Obligatoria */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg">❓</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-black text-slate-800">
                            ¿Ha realizado un examen clínico o hemograma de laboratorio a este paciente anteriormente? <span className="text-rose-500 font-bold">*</span>
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Indique si cuenta con un reporte reciente para adjuntar o si el paciente aún no ha sido evaluado en clínica.
                        </p>
                      </div>
                    </div>
                    {hasPreviousClinicalExam !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setHasPreviousClinicalExam(null);
                          setClinicalRiskDisclaimerAccepted(false);
                          setIsClinicalDeclinedConfirmed(false);
                        }}
                        className="text-[11px] text-[#6F2BCC] hover:underline font-bold shrink-0 cursor-pointer"
                      >
                        Cambiar respuesta
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setHasPreviousClinicalExam('si');
                        setClinicalRiskDisclaimerAccepted(false);
                        setIsClinicalDeclinedConfirmed(false);
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        hasPreviousClinicalExam === 'si'
                          ? 'border-[#6F2BCC] bg-purple-50/60 ring-2 ring-[#6F2BCC]/30 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span className={`text-base p-1.5 rounded-lg shrink-0 ${hasPreviousClinicalExam === 'si' ? 'bg-[#6F2BCC] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        ✓
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Sí, se ha realizado anteriormente
                        </span>
                        <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">
                          Tengo los resultados del cuadro hemático para adjuntarlos o registrar los valores cuantitativos.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHasPreviousClinicalExam('no');
                        handleRemoveCuadroHematico();
                        setClinicalRiskDisclaimerAccepted(false);
                        setIsClinicalDeclinedConfirmed(false);
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        hasPreviousClinicalExam === 'no'
                          ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-400/30 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span className={`text-base p-1.5 rounded-lg shrink-0 ${hasPreviousClinicalExam === 'no' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        ✕
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          No, no se ha realizado
                        </span>
                        <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">
                          El paciente no cuenta con examen clínico ni hemograma previo para este caso.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* CASO 1: SELECCIONÓ "SÍ" -> Desplegar carga de archivo y parámetros cuantitativos */}
                {hasPreviousClinicalExam === 'si' && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-xs font-extrabold text-[#2B017C] flex items-center gap-1.5">
                        <span>📎</span> Cargar Cuadro Hemático / Hemograma de Laboratorio
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Cargue el resultado o ingrese los valores basales
                      </span>
                    </div>

                    {/* Subir archivo de hemograma */}
                    {!hasCuadroHematico ? (
                      <div className="border-2 border-dashed border-slate-200 hover:border-[#6F2BCC] rounded-2xl p-5 text-center transition-all bg-slate-50/50">
                        <input
                          type="file"
                          id="cuadro-hematico-input"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleCuadroHematicoFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="cuadro-hematico-input" className="cursor-pointer block">
                          <span className="text-2xl block mb-1">📄</span>
                          <span className="text-xs font-bold text-slate-700 block">
                            Cargar archivo de Cuadro Hemático (PDF o Imagen)
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Formatos soportados: PDF, JPG, PNG (Máx. 15 MB)
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">📊</span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              {cuadroHematicoFileName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {cuadroHematicoFileSize} · Archivo de hemograma cargado
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCuadroHematico}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>🗑️</span> Quitar
                        </button>
                      </div>
                    )}

                    {/* Parámetros cuantitativos rápidos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Hematocrito (%)
                        </label>
                        <input
                          type="text"
                          value={cuadroHematicoHematocrito}
                          onChange={(e) => setCuadroHematicoHematocrito(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder="Ej. 26.5"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Hemoglobina (g/dL)
                        </label>
                        <input
                          type="text"
                          value={cuadroHematicoHemoglobina}
                          onChange={(e) => setCuadroHematicoHemoglobina(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder="Ej. 8.2"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Leucocitos (/µL)
                        </label>
                        <input
                          type="text"
                          value={cuadroHematicoLeucocitos}
                          onChange={(e) => setCuadroHematicoLeucocitos(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ej. 18500"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Plaquetas (/µL)
                        </label>
                        <input
                          type="text"
                          value={cuadroHematicoPlaquetas}
                          onChange={(e) => setCuadroHematicoPlaquetas(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ej. 95000"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Observaciones del Hemograma
                      </label>
                      <input
                        type="text"
                        value={cuadroHematicoObservaciones}
                        onChange={(e) => setCuadroHematicoObservaciones(e.target.value)}
                        placeholder="Ej. Trombocitopenia marcada, presencia de mórulas intraplaquetarias..."
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* CASO 2: SELECCIONÓ "NO" -> ALERTA CLÍNICA EDUCATIVA + OPCIÓN DE SOLICITAR EXAMEN CLÍNICO O DESCARGO */}
                {hasPreviousClinicalExam === 'no' && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                    {isClinicalDeclinedConfirmed ? (
                      /* Vista Recogida / Colapsada tras confirmar declinar examen clínico */
                      <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center text-sm font-black shrink-0">
                            ✓
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-950">
                              Continuar sin examen clínico ni hemograma previo
                            </p>
                            <p className="text-[11px] text-amber-800">
                              Confirmado bajo criterio y responsabilidad médica del veterinario tratante. Advertencias y riesgos aceptados.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsClinicalDeclinedConfirmed(false)}
                          className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          Ver advertencias / Modificar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm space-y-4">
                          {/* Cabecera de Alerta */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-xl shrink-0">
                              🩺
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                                  Recomendación Médica de VetLab: Solicitud de Examen Clínico / Hemograma
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                                  Importante para el diagnóstico
                                </span>
                              </div>
                              <p className="text-xs text-amber-900 mt-1 font-medium leading-relaxed">
                                Contar con un examen clínico o hemograma previo optimiza significativamente la precisión del diagnóstico y orienta el tratamiento inmediato del paciente.
                              </p>
                            </div>
                          </div>

                          {/* Explicación médica de por qué es importante */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            <div className="p-3 bg-white/95 rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                              <span className="text-base block">🔬</span>
                              <h5 className="text-[11px] font-bold text-slate-800">
                                Diagnóstico Integral vs Molecular
                              </h5>
                              <p className="text-[10px] text-slate-600 leading-relaxed">
                                La qPCR detecta la presencia de ADN/ARN del patógeno con alta sensibilidad, pero <strong>no evalúa el impacto funcional, celular ni hemodinámico</strong> en el paciente.
                              </p>
                            </div>

                            <div className="p-3 bg-white/95 rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                              <span className="text-base block">🩸</span>
                              <h5 className="text-[11px] font-bold text-slate-800">
                                Correlación Fisiopatológica
                              </h5>
                              <p className="text-[10px] text-slate-600 leading-relaxed">
                                Un hemograma permite correlacionar el patógeno con anemia regenerativa/arregenerativa, trombocitopenia, respuesta leucocitaria o inflamación sistémica para actuar a tiempo.
                              </p>
                            </div>

                            <div className="p-3 bg-white/95 rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                              <span className="text-base block">📈</span>
                              <h5 className="text-[11px] font-bold text-slate-800">
                                Línea Base y Pronóstico
                              </h5>
                              <p className="text-[10px] text-slate-600 leading-relaxed">
                                Permite establecer valores basales indispensables para monitorear la respuesta terapéutica y evaluar el pronóstico de recuperación del paciente.
                              </p>
                            </div>
                          </div>

                          {/* Pregunta si desea solicitar examen clínico */}
                          <div className="pt-2 border-t border-amber-200/80 space-y-3">
                            <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                              <span>💡</span> ¿Desea solicitar un examen clínico / hemograma para este paciente ahora?
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                              {/* Opción Sí: Ir al apartado de examen clínico */}
                              <button
                                type="button"
                                onClick={() => {
                                  const hemogramaExam = CLINICAL_EXAMS.find((e) => e.id === 'clin-001') || null;
                                  setCurrentClinicalExam(hemogramaExam);
                                  setRequestCategory('clinicas');
                                }}
                                className="flex-1 px-4 py-3 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                              >
                                <span>🩺</span>
                                <span>Sí, deseo solicitar el examen clínico ahora</span>
                                <span>→</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Descargo de Responsabilidad Médica ("Bajo su propio riesgo") */}
                        <div id="clinical-disclaimer-card" className="p-4 rounded-2xl bg-rose-50/70 border-2 border-rose-200 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg">⚠️</span>
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">
                                Descargo de Responsabilidad Médica y Criterio Profesional
                              </h4>
                              <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                                Al declinar la realización del examen clínico y hemograma previo, el médico veterinario tratante asume plenamente el criterio y la responsabilidad diagnóstica del caso. El laboratorio VetLab procesará el panel molecular qPCR solicitado reportando exclusivamente la amplificación génica del patógeno, dejando <strong>bajo exclusiva responsabilidad y riesgo del médico veterinario solicitante</strong> la evaluación de la estabilidad hemodinámica, soporte vital y manejo integral del paciente.
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-rose-200/70 space-y-3">
                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={clinicalRiskDisclaimerAccepted}
                                onChange={(e) => {
                                  setClinicalRiskDisclaimerAccepted(e.target.checked);
                                  if (!e.target.checked) {
                                    setIsClinicalDeclinedConfirmed(false);
                                  }
                                }}
                                className="w-4 h-4 text-rose-600 rounded cursor-pointer mt-0.5 shrink-0 focus:ring-rose-500"
                              />
                              <span className="text-xs font-bold text-rose-900 leading-snug">
                                Entiendo y acepto los riesgos clínicos. Declaro que bajo mi propio criterio y responsabilidad médica solicito procesar el panel molecular qPCR sin contar con examen clínico ni hemograma previo. <span className="text-rose-600">*</span>
                              </span>
                            </label>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-rose-200/50">
                              <span className="text-[11px] text-rose-800 font-medium">
                                {clinicalRiskDisclaimerAccepted
                                  ? '✓ Casilla marcada. Haga clic en el botón para confirmar y recoger las advertencias.'
                                  : 'Marque la casilla anterior para habilitar la confirmación y recoger las advertencias.'}
                              </span>

                              <button
                                type="button"
                                disabled={!clinicalRiskDisclaimerAccepted}
                                onClick={() => {
                                  if (clinicalRiskDisclaimerAccepted) {
                                    setIsClinicalDeclinedConfirmed(true);
                                  }
                                }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                  clinicalRiskDisclaimerAccepted
                                    ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-sm ring-2 ring-rose-500/30 cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <span>✕</span>
                                <span>No deseo solicitar examen clínico</span>
                                <span>✓</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 3.5 HISTORIA CLÍNICA (DIRECTAMENTE ABAJO DEL CUADRO HEMÁTICO) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📁</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#2B017C] uppercase tracking-wider">
                        Historia Clínica y Exámenes Previos del Paciente
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Espacio destinado para subir todos los exámenes anteriores y paraclínicos que se ha realizado el paciente, evoluciones y antecedentes clínicos.
                      </p>
                    </div>
                  </div>
                  {hasHistoriaClinica && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <span>✓</span> Historia adjunta
                    </span>
                  )}
                </div>

                {/* Comentario y Guía Orientativa para el Médico Veterinario */}
                <div className="p-3.5 bg-purple-50/80 border border-purple-200/90 rounded-2xl flex items-start gap-3 text-xs text-[#2B017C]">
                  <span className="text-lg shrink-0 mt-0.5">💡</span>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[#2B017C]">Comentario para el registro del expediente:</span>
                    <p className="text-[11px] text-purple-900 leading-relaxed font-medium">
                      En este espacio se deben de subir todos los exámenes anteriores que se ha realizado el paciente (cuadros hemáticos y hemogramas previos, ecografías, radiografías, coprológicos, perfiles bioquímicos, urianálisis, citologías, biopsias o reportes externos de otros laboratorios), así como notas de evolución médica, tratamientos previos y antecedentes patológicos relevantes para una correlación clínica completa.
                    </p>
                  </div>
                </div>

                {/* Subir archivo de historia clínica */}
                {!hasHistoriaClinica ? (
                  <div className="border-2 border-dashed border-slate-200 hover:border-[#6F2BCC] rounded-2xl p-6 text-center transition-all bg-slate-50/50">
                    <input
                      type="file"
                      id="historia-clinica-file-input"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleHistoriaClinicaFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="historia-clinica-file-input" className="cursor-pointer block">
                      <span className="text-3xl block mb-2">📋</span>
                      <span className="text-xs font-bold text-slate-700 block">
                        Haz clic aquí para seleccionar o arrastra la historia clínica y los exámenes previos
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Formatos soportados: PDF, JPG, PNG, DOCX (Máx. 25 MB) · Puede consolidar múltiples exámenes en un archivo
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📑</span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {historiaClinicaFileName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {historiaClinicaFileSize} · Documento de historia clínica y exámenes previos adjunto
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveHistoriaClinica}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>🗑️</span> Quitar
                    </button>
                  </div>
                )}

                {/* Notas / Resumen de la historia clínica */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Comentarios sobre exámenes previos, evolución y antecedentes (Opcional)
                  </label>
                  <textarea
                    value={historiaClinicaNotes}
                    onChange={(e) => setHistoriaClinicaNotes(e.target.value)}
                    rows={3}
                    placeholder="Escriba comentarios sobre exámenes anteriores realizados, antecedentes patológicos, tratamientos previos administrados, diagnósticos anteriores relevantes..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ================================================================== */}
          {/* PASO 4: PERFILES qPCR RECOMENDADOS (INICIA EN BLANCO: 0 AÑADIDOS)  */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'qpcr' && currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Perfiles qPCR recomendados
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAsymptomatic
                    ? 'Paneles de diagnóstico molecular optimizados para chequeo preventivo y tamizaje integral'
                    : 'Los perfiles están ordenados por coincidencia con los hallazgos clínicos'}
                </p>
              </div>

              {/* Ficha contextual del paciente (Dato quemado / preguardado) */}
              {activePatient && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activePatient.avatar || (activePatient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>{activePatient.name} {activePatient.lastName || ''}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-[#6F2BCC] border border-purple-200">
                          {activePatient.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                          <span>🔒</span> Dato preguardado
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {activePatient.species} · {activePatient.breed} · {getPatientAgeDisplay(activePatient)} · Tutor: {activePatient.owner?.name || 'Tutor registrado'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#c7f2e5]/80 text-[#0f766e] border border-[#99f6e4]">
                      {examType === 'control' ? 'Seguimiento / control' : 'Examen nuevo'}
                    </span>
                  </div>
                </div>
              )}



              {/* Lista de perfiles qPCR recomendados */}
              <div className="space-y-4">
                {displayedRecommendedProfiles.map((profile) => {
                  const isAdded = selectedProfileIds.includes(profile.id);
                  return (
                    <div
                      key={profile.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isAdded
                          ? 'bg-white border-[#6F2BCC] ring-2 ring-[#6F2BCC]/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {profile.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {profile.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {typeof profile.matchPercentage === 'number'
                              ? `${profile.matchPercentage}%`
                              : String(profile.matchPercentage).endsWith('%')
                              ? profile.matchPercentage
                              : `${profile.matchPercentage}%`} coincidencia
                          </span>
                        </div>
                      </div>

                      {/* Agentes incluidos - TODOS a simple vista */}
                      <div className="py-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                          Agentes microbiológicos diana ({(profile.agents || []).length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.agents || []).map((ag) => (
                            <span
                              key={ag}
                              className="px-2.5 py-1 bg-sky-50/70 border border-sky-100 rounded-lg text-[11px] text-slate-800 font-semibold flex items-center gap-1.5 shadow-2xs"
                            >
                              <span className="text-[#6F2BCC] text-xs">🧬</span>
                              <span>{ag}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Síndromes Clínicos Asociados - Clickeables para filtrar */}
                      {profile.syndromes && profile.syndromes.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Síndromes:
                          </span>
                          {profile.syndromes.map((syn, sIdx) => {
                            const isCurrentSyn =
                              step4SyndromeFilter !== 'all' && matchSyndromeTokens(syn, step4SyndromeFilter);
                            const isPatientSuspect = selectedSyndromes.some((s) =>
                              matchSyndromeTokens(s, syn)
                            );
                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStep4SyndromeFilter(syn);
                                }}
                                title={`Filtrar perfiles por síndrome: ${syn}`}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                                  isCurrentSyn
                                    ? 'bg-[#2B017C] text-white shadow-2xs ring-2 ring-purple-300 font-bold'
                                    : isPatientSuspect
                                    ? 'bg-purple-100 text-[#2B017C] font-bold border border-purple-200 hover:bg-purple-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-[#6F2BCC]'
                                }`}
                              >
                                {isPatientSuspect && <span className="mr-1">🎯</span>}
                                {syn}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* ATRIBUCIÓN CAUSAL: ¿A qué se deben estos síntomas en el paciente? (DESPLEGABLE INTERACTIVO) */}
                      {profile.symptomAttribution && profile.symptomAttribution.length > 0 ? (
                        <div className="my-3 border border-amber-200/90 rounded-2xl overflow-hidden shadow-2xs transition-all">
                          {/* Botón Cabecera Desplegable con Flechita */}
                          <button
                            type="button"
                            onClick={() => handleToggleAttribution(profile.id)}
                            className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none ${
                              expandedAttributionProfiles[profile.id]
                                ? 'bg-amber-100/70 border-b border-amber-200/80'
                                : 'bg-gradient-to-r from-amber-50/80 via-white to-sky-50/40 hover:bg-amber-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm">🔬</span>
                              <span className="text-xs font-black text-slate-900 tracking-tight">
                                ¿A qué se deben los síntomas del paciente?
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-950 border border-amber-300">
                                {profile.symptomAttribution.length} síntoma{profile.symptomAttribution.length === 1 ? '' : 's'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs shrink-0">
                              <span className="text-[11px] text-slate-500 hidden sm:inline">
                                {expandedAttributionProfiles[profile.id] ? 'Recoger' : 'Desplegar'}
                              </span>
                              <span
                                className={`transform transition-transform duration-200 text-xs text-[#6F2BCC] font-black ${
                                  expandedAttributionProfiles[profile.id] ? 'rotate-180' : 'rotate-0'
                                }`}
                              >
                                ▼
                              </span>
                            </div>
                          </button>

                          {/* Contenido Desplegable (se muestra u oculta a voluntad del usuario) */}
                          {expandedAttributionProfiles[profile.id] && (
                            <div className="p-3.5 bg-gradient-to-br from-amber-50/50 via-white to-sky-50/30 space-y-2.5 animate-in fade-in duration-150">
                              <div className="grid grid-cols-1 gap-2 pt-0.5">
                                {profile.symptomAttribution.map((attr, attrIdx) => (
                                  <div key={attrIdx} className="bg-white rounded-xl p-2.5 border border-amber-200/60 shadow-2xs text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-slate-900">
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                      <span className="text-xs font-black text-[#6F2BCC]">{attr.symptom}</span>
                                      <span className="text-[11px] text-slate-400 font-normal">explicado por:</span>
                                    </div>

                                    <div className="space-y-1 pl-4">
                                      {attr.explainingAgents.map((agItem, agIdx) => (
                                        <div key={agIdx} className="text-[11px] text-slate-700 leading-snug">
                                          <span className="font-bold italic text-slate-900">{agItem.agentName}: </span>
                                          <span className="text-slate-600">{agItem.explanation}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {profile.clinicalRationale && (
                                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                                  <span>💡</span>
                                  <span>{profile.clinicalRationale}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        profile.clinicalRationale && (
                          <div className="mb-2 text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>{profile.clinicalRationale}</span>
                          </div>
                        )
                      )}

                      {/* Alerta de Factor de Riesgo Epidemiológico */}
                      {profile.epidemiologicalAlert && (
                        <div className="my-2 px-3 py-2 bg-purple-50/80 border border-purple-200/90 rounded-xl flex items-start gap-2 text-[11px] text-[#2B017C] leading-snug">
                          <span className="text-xs text-[#6F2BCC] mt-0.5 shrink-0">🧭</span>
                          <span>
                            <strong className="text-slate-900">Correlación Epidemiológica:</strong> {profile.epidemiologicalAlert}
                          </span>
                        </div>
                      )}

                      {/* Nota aclaratoria sobre tipos de matrices biológicas según las necesidades del caso clínico */}
                      <div className="my-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-sky-500/5 to-transparent dark:from-teal-950/40 dark:via-sky-950/20 dark:to-transparent border-l-4 border-l-teal-600 dark:border-l-teal-400 border border-teal-500/30 dark:border-teal-500/40 shadow-xs flex items-start gap-2.5">
                        <span className="text-base text-teal-600 dark:text-teal-400 shrink-0">🔬</span>
                        <div className="text-[11px] space-y-0.5">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-900 dark:text-teal-200 border border-teal-500/30 inline-block mb-0.5">
                            Anotación · Matrices Biológicas
                          </span>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                            <strong className="text-slate-900 dark:text-white">Flexibilidad de matriz:</strong> Existe la posibilidad de utilizar diferentes tipos de matrices biológicas (sangre total con EDTA, hisopados mucosos/conjuntivales, aspirados de médula ósea, líquido cavitario/LCR o biopsias) según las características y necesidades específicas de cada caso clínico.
                          </p>
                        </div>
                      </div>

                      {/* Pie de la tarjeta: Precio, Muestra y Botón */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-4">
                          <span className="text-base font-extrabold text-[#6F2BCC]">
                            ${profile.basePrice.toLocaleString('es-CO')}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <span>🧪</span> {profile.sampleSummary}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleProfile(profile.id)}
                          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isAdded
                              ? 'bg-[#6F2BCC] text-white shadow-2xs hover:bg-[#581ea3]'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{isAdded ? '✓ Agregado' : '+ Agregar a la orden'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {displayedRecommendedProfiles.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
                    <span className="text-3xl block">🩺</span>
                    <h4 className="text-sm font-bold text-slate-800">
                      No hay perfiles qPCR para el síndrome "{step4SyndromeFilter}"
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Intenta seleccionar otro síndrome o pulsa "Mostrar todos" para ver todos los perfiles recomendados para {activePatient?.name || 'el paciente'}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep4SyndromeFilter('all')}
                      className="px-4 py-2 rounded-xl bg-[#6F2BCC] text-white text-xs font-bold cursor-pointer hover:bg-[#581ea3] transition-all"
                    >
                      Mostrar todos los perfiles recomendados
                    </button>
                  </div>
                )}
              </div>

              {/* Barra de Resumen Inferior en el Paso 4 (Figma Imagen 4) */}
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold text-[#6F2BCC] uppercase tracking-wider block">
                    EN LA ORDEN ({selectedProfiles.length} PERFIL{selectedProfiles.length === 1 ? '' : 'ES'}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfiles.length > 0 ? (
                      selectedProfiles.map((p) => (
                        <span key={p.id} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6F2BCC] text-white">
                          {p.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Ningún perfil agregado todavía. Pulsa "+ Agregar a la orden" arriba.</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-[#6F2BCC]">
                    ${orderFinancials.baseTotal.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* PASO 5: CONFIRMACIÓN DE LA ORDEN & EDICIÓN DE AGENTES              */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'qpcr' && currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Confirmación de la orden
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revisa los perfiles, agentes y muestras antes de enviar.
                </p>
              </div>

              {/* 5.1 Tarjeta resumen de la solicitud: Paciente, modalidad, síndromes y hallazgos */}
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl">{activePatient?.avatar || (activePatient?.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>{activePatient?.name} {activePatient?.lastName || ''}</span>
                        {activePatient?.id && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-[#6F2BCC] border border-purple-200">
                            {activePatient.id}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                          <span>🔒</span> Dato preguardado
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activePatient?.species} · {activePatient?.breed} · {getPatientAgeDisplay(activePatient)} · Tutor: {activePatient?.owner?.name} {activePatient?.owner?.document ? `(${activePatient.owner.document})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#c7f2e5]/80 text-[#0f766e] border border-[#99f6e4] flex items-center gap-1.5">
                      <span>📄</span>
                      <span>{examType === 'control' ? 'Seguimiento / control' : 'Examen nuevo'}</span>
                    </span>

                    <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      isAsymptomatic
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <span>{isAsymptomatic ? '🌿 Asintomático' : '⚠️ Sintomático'}</span>
                    </span>

                    {examType === 'control' && previousExamCode && (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        Previo: {previousExamCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Síndromes clínicos y hallazgos */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Síndromes:</span>
                    {isAsymptomatic ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span>🌿</span> Paciente Asintomático (Chequeo molecular preventivo)
                      </span>
                    ) : selectedSyndromes.length > 0 ? (
                      selectedSyndromes.map((synName) => {
                        const synObj = SYNDROMES_LIST.find((s) => s.name === synName);
                        return (
                          <span
                            key={synName}
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-[#6F2BCC] border border-sky-200 flex items-center gap-1"
                          >
                            <span>{synObj?.icon || '🩺'}</span> {synName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sin síndromes específicos seleccionados</span>
                    )}
                  </div>

                  {selectedFindings.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Hallazgos:</span>
                      {selectedFindings.map((f, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Estado de evaluación clínica / hemograma */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Evaluación Clínica:</span>
                    {hasPreviousClinicalExam === 'si' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span>🩸</span> {hasCuadroHematico ? `Hemograma adjunto (${cuadroHematicoFileName || 'Archivo'})` : 'Examen clínico previo registrado'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <span>⚠️</span> Sin examen clínico previo (Bajo responsabilidad médica)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 5.2 Perfil(es) seleccionado(s) y botón "Editar agentes" */}
              {selectedProfiles.map((profile) => {
                const currentMods = replacedAgents[profile.id] || {};
                const modCount = Object.keys(currentMods).length;

                return (
                  <div key={profile.id} className="space-y-4">
                    {/* Tarjeta del perfil seleccionado */}
                    <div className="p-4 bg-white border border-sky-200/90 rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              PERFIL SELECCIONADO
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Listo
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {profile.title}
                          </h4>
                        </div>

                        {/* REQUERIMIENTO DEL USUARIO: Botón "Editar agentes" */}
                        <button
                          type="button"
                          onClick={() => setShowAgentsEdit(!showAgentsEdit)}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                            showAgentsEdit
                              ? 'bg-[#6F2BCC] text-white ring-2 ring-[#6F2BCC]/20'
                              : 'bg-sky-50 text-[#6F2BCC] border border-sky-200 hover:bg-sky-100'
                          }`}
                        >
                          <span>⚙️</span>
                          <span>{showAgentsEdit ? 'Ocultar edición de agentes ▲' : 'Editar agentes ▼'}</span>
                          {modCount > 0 && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-extrabold">
                              {modCount} modificado{modCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Agentes del perfil a simple vista */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                          Agentes incluidos en el perfil ({profile.agents.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.agents.map((agentName, idx) => {
                            const isReplaced = Boolean(currentMods[idx]);
                            const activeAgentName = currentMods[idx] || agentName;
                            return (
                              <span
                                key={idx}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                                  isReplaced
                                    ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                    : 'bg-slate-50 text-slate-800 border border-slate-200'
                                }`}
                              >
                                <span>🧬</span>
                                {isReplaced ? (
                                  <>
                                    <span className="line-through text-slate-400 text-[11px]">{agentName}</span>
                                    <span className="font-bold text-[#6F2BCC]">➔ {activeAgentName}</span>
                                  </>
                                ) : (
                                  <span>{agentName}</span>
                                )}
                              </span>
                            );
                          })}
                          {(addedAgentsByProfile[profile.id] || []).map((extraAgent, extraIdx) => (
                            <span
                              key={`extra-${extraIdx}`}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5 shadow-2xs"
                            >
                              <span>✨</span>
                              <span>+ {extraAgent}</span>
                              <span className="text-[10px] text-purple-700 font-bold">(Adicional)</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Atribución causal en el resumen de orden del Paso 5 (DESPLEGABLE INTERACTIVO) */}
                      {profile.symptomAttribution && profile.symptomAttribution.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleToggleAttribution(`step5-${profile.id}`)}
                            className="w-full flex items-center justify-between text-left p-2.5 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/70 rounded-xl transition-colors cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                              <span>🔬</span>
                              <span>¿A qué se deben los síntomas del paciente?</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-900 border border-amber-300">
                                {profile.symptomAttribution.length}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                              <span>{expandedAttributionProfiles[`step5-${profile.id}`] ? 'Recoger' : 'Desplegar'}</span>
                              <span className={`transform transition-transform text-xs text-[#6F2BCC] font-black ${expandedAttributionProfiles[`step5-${profile.id}`] ? 'rotate-180' : 'rotate-0'}`}>
                                ▼
                              </span>
                            </div>
                          </button>

                          {expandedAttributionProfiles[`step5-${profile.id}`] && (
                            <div className="mt-2 p-3 bg-amber-50/40 border border-amber-100 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-150">
                              <div className="space-y-1.5 pl-1">
                                {profile.symptomAttribution.map((attr, aIdx) => (
                                  <div key={aIdx} className="text-[11px] text-slate-700 leading-snug">
                                    <strong className="text-[#6F2BCC]">{attr.symptom}:</strong>{' '}
                                    <span className="text-slate-600">
                                      explicado por {attr.explainingAgents.map((ag) => ag.agentName).join(', ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Nota aclaratoria de matrices biológicas */}
                      <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-teal-500/10 via-sky-500/5 to-transparent dark:from-teal-950/40 dark:via-sky-950/20 dark:to-transparent border-l-4 border-l-teal-600 dark:border-l-teal-400 border border-teal-500/30 dark:border-teal-500/40 shadow-xs flex items-start gap-2.5">
                        <span className="text-base text-teal-600 dark:text-teal-400 shrink-0">🔬</span>
                        <div className="text-[11px] space-y-0.5">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-900 dark:text-teal-200 border border-teal-500/30 inline-block mb-0.5">
                            Anotación · Matrices Biológicas
                          </span>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                            <strong className="text-slate-900 dark:text-white">Flexibilidad de matriz:</strong> Posibilidad de utilizar diferentes tipos de matrices biológicas según las características y necesidades de cada caso clínico.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* REQUERIMIENTO DEL USUARIO:
                        La información de los agentes SOLO aparece cuando se le da en "Editar agentes".
                        De lo contrario, NO sale la lista desplegable. */}
                    {showAgentsEdit && (
                      <div className="p-5 bg-white border border-sky-300 rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>AGENTES — HAZ CLIC PARA REEMPLAZAR</span>
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              El agente se cambia por otro de forma manual; no se elimina de la orden.
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                            1er cambio gratis
                          </span>
                        </div>

                        {/* Política de Costos de Reemplazo */}
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                          <span className="text-base shrink-0">💡</span>
                          <div className="space-y-0.5">
                            <strong className="block font-bold">Condiciones de costo al modificar agentes:</strong>
                            <p>
                              El cambio de un solo agente no tiene costo (<strong>1er cambio gratis: $0 COP</strong>). Si cambias 2 o más agentes, se genera un valor adicional de <strong>+$25.000 COP por cada agente adicional</strong>.
                            </p>
                            {modCount > 0 && (
                              <span className="inline-block font-extrabold text-[#6F2BCC] mt-1">
                                {modCount === 1
                                  ? '✓ 1 agente modificado (1er cambio gratis: $0 COP)'
                                  : `⚠️ ${modCount} agentes modificados (1er cambio gratis + ${modCount - 1} adicional: +$${((modCount - 1) * 25000).toLocaleString('es-CO')} COP)`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Lista de agentes con botón Editar y campo manual */}
                        <div className="space-y-2.5">
                          {profile.agents.map((agentName, idx) => {
                            const isReplaced = Boolean(currentMods[idx]);
                            const activeAgentName = currentMods[idx] || agentName;
                            const isCurrentlyEditing = editingAgentIndex === idx;

                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  isCurrentlyEditing
                                    ? 'bg-sky-50/90 border-[#6F2BCC] ring-2 ring-[#6F2BCC]/20'
                                    : isReplaced
                                    ? 'bg-sky-50/50 border-sky-300'
                                    : 'bg-slate-50/70 border-slate-200'
                                }`}
                              >
                                {!isCurrentlyEditing ? (
                                  <div className="flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={isReplaced ? 'line-through text-slate-400 font-medium' : 'font-semibold text-slate-800'}>
                                        {agentName}
                                      </span>
                                      {isReplaced && (
                                        <span className="font-bold text-[#6F2BCC] bg-white px-2.5 py-0.5 rounded-lg border border-sky-200 flex items-center gap-1 shadow-2xs">
                                          <span>➔</span> Reemplazado por: <strong>{activeAgentName}</strong>
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isReplaced && (
                                        <button
                                          type="button"
                                          onClick={() => handleRevertAgentReplacement(profile.id, idx)}
                                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                                        >
                                          Deshacer
                                        </button>
                                      )}
                                      {/* REQUERIMIENTO DEL USUARIO: Botón al lado que diga "Editar" */}
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditingAgent(idx, activeAgentName)}
                                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#6F2BCC] text-[#6F2BCC] hover:bg-sky-50 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                                      >
                                        <span>✏️</span> Editar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Campo manual habilitado al hacer clic en Editar */
                                  <div className="space-y-2.5 animate-in fade-in duration-100">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-slate-800">
                                        Reemplazar: <span className="text-slate-500 line-through">{agentName}</span>
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        Ingresa el nuevo agente de forma manual o selecciona una sugerencia
                                      </span>
                                    </div>

                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={manualAgentInput}
                                        onChange={(e) => setManualAgentInput(e.target.value)}
                                        placeholder="Escribe el nombre del nuevo agente o patógeno molecular..."
                                        className="flex-1 px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                                        autoFocus
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveManualAgent(profile.id, idx)}
                                        className="px-4 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingAgentIndex(null);
                                          setManualAgentInput('');
                                        }}
                                        className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-white cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                    </div>

                                    {/* Sugerencias rápidas clickeables */}
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      <span className="text-[10px] text-slate-400 uppercase font-bold mr-1 self-center">
                                        Sugerencias:
                                      </span>
                                      {AVAILABLE_ALTERNATIVE_AGENTS.slice(0, 6).map((sug) => (
                                        <button
                                          key={sug}
                                          type="button"
                                          onClick={() => setManualAgentInput(sug)}
                                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 hover:border-sky-300 hover:text-[#6F2BCC] cursor-pointer"
                                        >
                                          {sug}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* AGREGAR AGENTE ADICIONAL AL PERFIL qPCR (Requerimiento de Usuario) */}
                        <div className="pt-4 border-t border-sky-200/80 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <span>➕</span> Agentes adicionales agregados al perfil ({profile.title}):
                            </span>
                            <span className="text-[11px] font-extrabold text-[#6F2BCC]">
                              +$25.000 COP por cada agente adicional
                            </span>
                          </div>

                          {(addedAgentsByProfile[profile.id] || []).length > 0 && (
                            <div className="space-y-2">
                              {(addedAgentsByProfile[profile.id] || []).map((extraAgent, eIdx) => (
                                <div
                                  key={eIdx}
                                  className="p-3 bg-purple-50/90 border border-purple-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">🧬</span>
                                    <span className="font-extrabold text-[#2B017C]">{extraAgent}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-[#2B017C]">
                                      + $25.000 COP
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAddedAgent(profile.id, eIdx)}
                                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                  >
                                    ✕ Quitar agente
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Control para agregar nuevo agente */}
                          {isAddingAgentByProfile[profile.id] ? (
                            <div className="p-3.5 bg-purple-50/50 border border-purple-300 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800">
                                  Ingresa el nombre del agente adicional a incorporar:
                                </span>
                                <span className="text-[10px] font-bold text-purple-700">+$25.000 COP</span>
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newAgentInputByProfile[profile.id] || ''}
                                  onChange={(e) =>
                                    setNewAgentInputByProfile((prev) => ({
                                      ...prev,
                                      [profile.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddAgentToProfile(profile.id, newAgentInputByProfile[profile.id]);
                                    }
                                  }}
                                  placeholder="Ej: Anaplasma phagocytophilum, Bartonella henselae..."
                                  className="flex-1 px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddAgentToProfile(profile.id, newAgentInputByProfile[profile.id])
                                  }
                                  className="px-4 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                                >
                                  + Añadir al perfil
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIsAddingAgentByProfile((prev) => ({
                                      ...prev,
                                      [profile.id]: false,
                                    }))
                                  }
                                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-white cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>

                              {/* Sugerencias rápidas */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="text-[10px] text-slate-500 uppercase font-bold mr-1 self-center">
                                  Sugeridos:
                                </span>
                                {AVAILABLE_ALTERNATIVE_AGENTS.slice(0, 8).map((sug) => (
                                  <button
                                    key={sug}
                                    type="button"
                                    onClick={() =>
                                      setNewAgentInputByProfile((prev) => ({
                                        ...prev,
                                        [profile.id]: sug,
                                      }))
                                    }
                                    className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-[#6F2BCC] hover:text-[#6F2BCC] cursor-pointer shadow-2xs"
                                  >
                                    + {sug}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setIsAddingAgentByProfile((prev) => ({
                                  ...prev,
                                  [profile.id]: true,
                                }))
                              }
                              className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 border border-dashed border-[#6F2BCC] text-[#6F2BCC] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
                            >
                              <span>➕</span>
                              <span>Agregar un agente adicional a este perfil qPCR (+ $25.000 COP)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 5.3 MUESTRAS REQUERIDAS (CHECKLIST OBLIGATORIO Y RESALTADO INTEGRADO A LA ESTÉTICA) */}
              <div className="p-5 bg-gradient-to-br from-purple-50/70 via-white to-sky-50/30 rounded-2xl border-2 border-[#6F2BCC]/30 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3.5">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6F2BCC] flex items-center justify-center text-xl shrink-0 shadow-2xs">
                      🧪
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black tracking-wide uppercase text-[#2B017C]">
                          Muestras Biológicas Requeridas · Checklist de Confirmación <span className="text-rose-500 font-bold">*</span>
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        El médico veterinario debe confirmar la toma de cada muestra con sus recipientes correspondientes antes del envío.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border shadow-2xs transition-all ${
                      areAllSamplesConfirmed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}>
                      <span>{areAllSamplesConfirmed ? '✓ Muestras Listas' : '⚠️ Confirmación Requerida'}</span>
                      <span className="font-mono">({Object.values(confirmedSamplesChecklist).filter(Boolean).length} / {consolidatedSamples.length})</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {consolidatedSamples.map((samp, idx) => {
                    const isConfirmed = Boolean(confirmedSamplesChecklist[samp.name]);
                    const meta = getSampleIconAndColor(samp.name);

                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          setConfirmedSamplesChecklist((prev) => ({
                            ...prev,
                            [samp.name]: !prev[samp.name],
                          }))
                        }
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                          isConfirmed
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-2xs'
                            : 'bg-white dark:bg-[#181232] border-slate-200 dark:border-[#2f2257] hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 ${
                            isConfirmed
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                              : 'bg-slate-50 dark:bg-[#1c1636] border border-slate-200 dark:border-[#2f2257] text-slate-700 dark:text-slate-300 shadow-2xs'
                          }`}>
                            <span>{meta.icon}</span>
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className={`text-xs font-black truncate ${isConfirmed ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                                {samp.name}
                              </h5>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}>
                                {meta.badge}
                              </span>
                            </div>
                            <p className={`text-[11px] flex items-center gap-1 truncate ${isConfirmed ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                              <span>📦</span> {samp.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isConfirmed
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 group-hover:border-[#6F2BCC] group-hover:text-[#6F2BCC] dark:group-hover:text-[#a78bfa] group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isConfirmed}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
                            />
                            <span>{isConfirmed ? '✓ Muestra Confirmada' : 'Marcar como recolectada'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!areAllSamplesConfirmed ? (
                  <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/5 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-orange-950/20 border-l-4 border-l-amber-500 border border-amber-400/40 dark:border-amber-500/40 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          ⚠️
                        </span>
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30">
                            Requisito de Despacho
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-amber-100 font-bold leading-relaxed">
                          Debes marcar todas las muestras biológicas requeridas ({consolidatedSamples.length}) en este checklist para autorizar y despachar la solicitud de laboratorio.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 dark:via-emerald-900/30 dark:to-teal-950/20 border-l-4 border-l-emerald-500 border border-emerald-400/40 dark:border-emerald-500/40 shadow-sm flex items-center gap-3 animate-in fade-in duration-150">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      ✓
                    </span>
                    <div className="space-y-0.5 text-xs">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30">
                        Checklist Completado
                      </span>
                      <p className="text-slate-800 dark:text-emerald-100 font-bold leading-relaxed">
                        Todas las muestras biológicas requeridas ({consolidatedSamples.length}) han sido verificadas y marcadas para la recolección.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 5.4 Resumen Financiero y Métricas de la Orden */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Cantidad de perfiles qPCR solicitados:</span>
                  <span className="font-bold text-slate-900">{selectedProfiles.length} perfil(es)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Subtotal perfiles:</span>
                  <span className="font-bold text-slate-900">${orderFinancials.baseTotal.toLocaleString('es-CO')} COP</span>
                </div>
                {replacementMetrics.totalReplacementsCount > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[#6F2BCC]">
                    <span className="font-medium">
                      Modificación de agentes ({replacementMetrics.totalReplacementsCount} cambios):
                    </span>
                    <span className="font-bold">
                      {replacementMetrics.paidReplacements > 0
                        ? `+$${replacementMetrics.additionalCost.toLocaleString('es-CO')} COP`
                        : '$0 COP (1er cambio gratis)'}
                    </span>
                  </div>
                )}
                {orderFinancials.addedAgentsCount > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-purple-700">
                    <span className="font-medium">
                      Agentes adicionales agregados ({orderFinancials.addedAgentsCount} agente{orderFinancials.addedAgentsCount > 1 ? 's' : ''}):
                    </span>
                    <span className="font-bold">
                      +${orderFinancials.addedAgentsCost.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 text-sm font-extrabold text-[#6F2BCC]">
                  <span>Total estimado de la solicitud:</span>
                  <span className="text-base">${orderFinancials.finalTotal.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              {/* 5.5 Checkbox obligatorio de confirmación */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirm-samples-cb"
                  checked={confirmedSamples}
                  onChange={(e) => setConfirmedSamples(e.target.checked)}
                  className="w-5 h-5 text-[#6F2BCC] rounded cursor-pointer mt-0.5 shrink-0"
                />
                <label htmlFor="confirm-samples-cb" className="text-xs text-slate-700 font-medium leading-relaxed cursor-pointer select-none">
                  Confirmo que cuento con las muestras biológicas adecuadas para este análisis y autorizo el procesamiento molecular de esta orden en el laboratorio VetLab.
                </label>
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* SOLICITUD DE CLÍNICAS (FORMULARIO OFICIAL INSTITUCIONAL OSD)       */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'clinicas' && (
            <ClinicalOrderForm
              key={currentClinicalExam?.id || 'clinical-form'}
              activePatient={activePatient}
              patients={patients}
              initialClinicalExam={currentClinicalExam || initialClinicalExam}
              onSelectPatient={(id) => setSelectedPatientId(id)}
              onSubmitOrder={(payload) => handleSubmitClinicalOrder(payload)}
              isSubmitting={isSubmitting}
              onClose={onClose}
              isModal={isModal}
            />
          )}

          {/* ================================================================== */}
          {/* SOLICITUD DE MICROBIOTA (KIT O RECOLECCIÓN & ANAMNESIS COMPLETA)   */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'microbiota' && (
            <MicrobiotaOrderForm
              activePatient={activePatient}
              patients={patients}
              onSelectPatient={(id) => setSelectedPatientId(id)}
              onSubmitOrder={(payload) => handleSubmitMicrobiotaOrder(payload)}
              isSubmitting={isSubmitting}
              onClose={onClose}
              isModal={isModal}
            />
          )}
        </div>

        {/* ==================================================================== */}
        {/* BARRA DE NAVEGACIÓN INFERIOR (Solo en pasos 1-5 cuando no es exitoso) */}
        {/* ==================================================================== */}
        {!isOrderSuccess && isControlReviewOpen && (
          <div className="bg-white px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsControlReviewOpen(false);
                setExamType('nuevo');
              }}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Cambiar a examen nuevo / Volver</span>
            </button>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-slate-500 font-medium block">Total con 15% dcto:</span>
                <span className="text-sm font-black text-[#6F2BCC]">${activeControlTotal.toLocaleString('es-CO')} COP</span>
              </div>

              <button
                type="button"
                disabled={isSubmitting || activeControlAgents.length === 0}
                onClick={handleConfirmControlOrder}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#6F2BCC]/30 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>✓</span>
                <span>
                  {isSubmitting
                    ? 'Procesando orden...'
                    : activeControlAgents.length === 0
                    ? 'Selecciona al menos 1 agente'
                    : `Solicitar control (${activeControlAgents.length} ${activeControlAgents.length === 1 ? 'agente' : 'agentes'})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {!isOrderSuccess && !isControlReviewOpen && requestCategory === 'qpcr' && (
          <div className="bg-white px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div>
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isModal ? 'Cancelar' : '← Volver a Pacientes'}
                </button>
              )}

              {currentStep > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ← Volver
                  </button>

                  {currentStep === 3 && isAsymptomatic && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasPreviousClinicalExam) {
                          alert('Por favor indique en la Sección 3.4 si ha realizado un examen clínico o hemograma al paciente anteriormente.');
                          return;
                        }
                        if (hasPreviousClinicalExam === 'no' && !clinicalRiskDisclaimerAccepted) {
                          alert('Para continuar la solicitud de qPCR sin examen clínico previo, debe confirmar que acepta el descargo de responsabilidad médica bajo su propio criterio profesional.');
                          return;
                        }
                        setCurrentStep(4);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                    >
                      Omitir este paso
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1) {
                      if (!activePatient) {
                        alert('Por favor busca y selecciona un paciente para continuar.');
                        return;
                      }
                      if (!isAlreadySterilized && examIsSterilized === null) {
                        alert('Por favor indique en la Sección 1 si el paciente se encuentra esterilizado.');
                        return;
                      }
                      if (isAsymptomatic === null) {
                        alert('Por favor indique la condición clínica actual del paciente (Sintomático o Asintomático).');
                        return;
                      }
                      if (examType === 'control') {
                        if (!controlHistoryInfo.canRequestControl) {
                          alert(`Este paciente no tiene habilitada la opción de seguimiento / control.\n\nMotivo: ${controlHistoryInfo.reason}.\nDebe solicitar un "Examen nuevo".`);
                          return;
                        }
                        if (!previousExamCode.trim() && controlHistoryInfo.lastExamId) {
                          setPreviousExamCode(controlHistoryInfo.lastExamId);
                        }
                        setIsControlReviewOpen(true);
                        return;
                      }
                    }
                    if (currentStep === 2) {
                      if (!riskFactors.habitat) {
                        alert('Por favor seleccione el hábitat principal de la mascota (Interiores, Exterior o Mixto).');
                        return;
                      }
                      if (!riskFactors.housingArea) {
                        alert('Por favor seleccione el área de residencia (Urbana o Rural / Campestre).');
                        return;
                      }
                      if (!riskFactors.housingType) {
                        alert('Por favor seleccione el tipo de residencia del paciente.');
                        return;
                      }
                      if (riskFactors.livesWithOtherAnimals === null) {
                        alert('Por favor indique si el paciente convive con otros animales en el hogar o entorno.');
                        return;
                      }
                      if (riskFactors.recentTravel === null) {
                        alert('Por favor indique si el paciente ha realizado viajes recientes fuera del departamento o país.');
                        return;
                      }
                    }
                    if (currentStep === 3) {
                      if (!isAsymptomatic && selectedSyndromes.length === 0) {
                        alert('Debes seleccionar al menos un síndrome clínico, o marcar al paciente como asintomático.');
                        return;
                      }
                      if (!hasPreviousClinicalExam) {
                        alert('Por favor indique en la Sección 3.4 si ha realizado un examen clínico o hemograma al paciente anteriormente.');
                        return;
                      }
                      if (hasPreviousClinicalExam === 'no' && !clinicalRiskDisclaimerAccepted) {
                        alert('Para continuar la solicitud de qPCR sin examen clínico previo, debe confirmar que acepta el descargo de responsabilidad médica bajo su propio criterio profesional.');
                        return;
                      }
                    }
                    setCurrentStep((prev) => prev + 1);
                  }}
                  className="px-6 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>{currentStep === 1 && examType === 'control' ? 'Solicitar control' : 'Continuar'}</span>
                  <span>→</span>
                </button>
              )}

              {currentStep === 4 && (
                <button
                  type="button"
                  disabled={selectedProfileIds.length === 0}
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Revisar orden</span>
                  <span>→</span>
                </button>
              )}

              {currentStep === 5 && (
                <button
                  type="button"
                  disabled={!confirmedSamples || !areAllSamplesConfirmed || isSubmitting}
                  onClick={handleSubmitFinalOrder}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    confirmedSamples && areAllSamplesConfirmed && !isSubmitting
                      ? 'bg-[#6F2BCC] hover:bg-[#581ea3] text-white shadow-md cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed select-none'
                  }`}
                >
                  <span>✓</span>
                  <span>{isSubmitting ? 'Enviando a Laboratorio...' : 'Confirmar y enviar al laboratorio'}</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
