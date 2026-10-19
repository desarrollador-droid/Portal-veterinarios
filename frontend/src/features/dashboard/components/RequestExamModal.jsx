import React, { useState, useMemo, useEffect } from 'react';
import { qpcrApi, LOCAL_QPCR_PROFILES_MASTER, LOCAL_INFECTIOUS_AGENTS_DB } from '../services/qpcrApi.js';

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
    id: 'Ictérico/Hepático',
    name: 'Ictericia / Hemólisis',
    desc: 'Anemia hemolítica, ictericia, esplenomegalia',
    icon: '🟡',
    symptoms: [
      'Anemia hemolítica',
      'Ictericia',
      'Esplenomegalia',
      'Palidez de mucosas',
      'Fiebre intermitente',
      'Decaimiento',
      'Anorexia',
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
// 3. BANCO DE SUGERENCIAS RÁPIDAS PARA AGENTES ALTERNATIVOS (12 AGENTES OFICIALES)
// ============================================================================
export const AVAILABLE_ALTERNATIVE_AGENTS = [
  'Hepatozoon canis',
  'Hepatozoon americanum',
  'Ehrlichia canis',
  'Anaplasma platys',
  'Anaplasma phagocytophilum',
  'Rickettsia rickettsii',
  'Rickettsia felis',
  'Wolbachia pipientis',
  'Mycoplasma haemocanis',
  'Mycoplasma haemofelis',
  'Bartonella spp. (felina)',
  'Bartonella spp. (canina)',
];

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
      reason: 'No hay paciente seleccionado',
    };
  }

  const exams = patient.qpcrExams || patient.exams || [];
  const activeOrder = patient.activeExamOrder;

  // Si no tiene ningún examen en historial ni orden activa, no tiene derecho a control
  if (exams.length === 0 && !activeOrder) {
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
      reason: 'El paciente no cuenta con historial de exámenes previos registrados',
    };
  }

  // 1. Buscar el examen con agentes positivos (el más relevante o reciente)
  let examWithPositives = null;
  let rawPositiveAgents = [];

  for (const ex of exams) {
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

  const selectedRefExam = examWithPositives || exams[0] || activeOrder;

  let latestDateStr = null;
  let latestId = null;
  let latestExamName = null;
  let sampleType = 'Sangre total con EDTA (2 ml) - Tubo tapón lila';

  if (selectedRefExam) {
    latestDateStr = selectedRefExam.date || selectedRefExam.requestedAt;
    latestId = selectedRefExam.id;
    latestExamName = selectedRefExam.testName;
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

  // REGLA: Plazo máximo de 6 meses (180 días)
  const canRequestControl = daysAgo <= 180;

  // Código exacto o derivado (como en Figma: CTRL-3-2026)
  let code = 'CTRL-3-2026';
  if (latestId) {
    const idStr = String(latestId);
    if (idStr.startsWith('CTRL')) {
      code = idStr;
    } else if (idStr === 'ORD-2026-904' || idStr === 'QPCR-2026-904') {
      code = 'CTRL-3-2026';
    } else {
      const cleanNum = idStr.replace('ORD-', '').replace('QPCR-', '').replace('2026-', '');
      code = `CTRL-${cleanNum}-2026`;
    }
  }

  let examName = 'Panel Hemotrópico Canino';
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

  // Agentes positivos con 15% de descuento individual (extraídos dinámicamente)
  let positiveAgents = [];
  if (rawPositiveAgents.length > 0) {
    positiveAgents = rawPositiveAgents.map((a) => {
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
  }

  // Fallback si no tiene agentes positivos directos en el array pero es elegible para control
  if (positiveAgents.length === 0) {
    if (patient.species && patient.species.toLowerCase().includes('felin')) {
      positiveAgents = [
        {
          id: 'cryptosporidium-spp',
          name: 'Cryptosporidium spp.',
          ct: '24.1',
          load: 'Carga moderada',
          basePrice: 35000,
          discount: 5250,
          finalPrice: 29750,
        },
        {
          id: 'clostridium-perfringens-enterotoxin',
          name: 'Clostridium perfringens enterotoxin',
          ct: '21.8',
          load: 'Carga bacteriana elevada',
          basePrice: 38000,
          discount: 5700,
          finalPrice: 32300,
        },
      ];
    } else {
      positiveAgents = [
        {
          id: 'ehrlichia-canis',
          name: 'Ehrlichia canis',
          ct: '22.8',
          load: 'Carga genómica alta',
          basePrice: 38000,
          discount: 5700,
          finalPrice: 32300,
        },
        {
          id: 'anaplasma-platys',
          name: 'Anaplasma platys',
          ct: '27.4',
          load: 'Carga genómica moderada',
          basePrice: 38000,
          discount: 5700,
          finalPrice: 32300,
        },
      ];
    }
  }

  const totalBasePrice = positiveAgents.reduce((sum, a) => sum + a.basePrice, 0);
  const totalDiscount = positiveAgents.reduce((sum, a) => sum + a.discount, 0);
  const totalWithDiscount = positiveAgents.reduce((sum, a) => sum + a.finalPrice, 0);

  return {
    hasPreviousExam: true,
    canRequestControl,
    daysAgo,
    lastExamId: code,
    lastExamDate: dateFormatted,
    lastExamName: examName,
    sampleType,
    positiveAgents,
    totalBasePrice,
    totalDiscount,
    totalWithDiscount,
    reason: canRequestControl
      ? 'Examen previo dentro de los 6 meses de seguimiento'
      : `El último examen fue hace ${daysAgo} días (superó el límite de 6 meses / 180 días)`,
  };
}

export default function RequestExamModal({
  patient: initialPatient,
  patients = [],
  initialExamType = 'nuevo',
  onClose,
  onRequest,
  isModal = true,
  onNavigateToTracking,
}) {
  // Estado de paso actual (Si se abre desde el paciente, va directamente al Paso 2: Síndrome clínico a menos que sea control)
  const [currentStep, setCurrentStep] = useState(initialPatient ? 2 : 1);

  // ============================================================================
  // REQUERIMIENTO DEL USUARIO: TODO COMIENZA EN BLANCO PARA EVITAR CONFUSIÓN
  // ============================================================================
  const [examType, setExamType] = useState(initialExamType || 'nuevo'); // 'nuevo' | 'control'
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

  // Estado Clínico del paciente: Asintomático vs Sintomático (definido en la solicitud de examen)
  const [isAsymptomatic, setIsAsymptomatic] = useState(() => {
    return Boolean(initialPatient?.isAsymptomatic);
  });

  // Sincronización reactiva si initialPatient o initialExamType cambian en modo módulo
  useEffect(() => {
    if (initialPatient) {
      setSelectedPatientId(initialPatient.id);
      setHasVetPlusInsurance(Boolean(initialPatient.owner?.hasVetPlus));
      setVetPlusCode(initialPatient.owner?.vetPlusCode || '');
      setIsAsymptomatic(Boolean(initialPatient.isAsymptomatic));

      if (initialExamType === 'control') {
        const info = getPatientExamHistoryInfo(initialPatient);
        if (info.canRequestControl) {
          setExamType('control');
          if (info.lastExamId) setPreviousExamCode(info.lastExamId);
          setIsControlReviewOpen(true);
        } else {
          setCurrentStep(2);
        }
      } else {
        setCurrentStep(2);
      }
    } else {
      setSelectedPatientId('');
      setCurrentStep(1);
      if (initialExamType === 'control') {
        setExamType('control');
      }
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

  // Sincronizar si cambia el paciente seleccionado
  useEffect(() => {
    if (activePatient) {
      if (activePatient.owner?.hasVetPlus !== undefined) {
        setHasVetPlusInsurance(Boolean(activePatient.owner.hasVetPlus));
        setVetPlusCode(activePatient.owner.vetPlusCode || '');
      }
      if (activePatient.isAsymptomatic !== undefined) {
        setIsAsymptomatic(Boolean(activePatient.isAsymptomatic));
      }
    }
  }, [activePatient?.id]);

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
        const patientSymptoms = activePatient?.clinicalSymptoms || activePatient?.symptoms || [];
        const results = await qpcrApi.filterProfiles({
          syndromes: selectedSyndromes,
          findings: selectedFindings,
          symptoms: Array.isArray(patientSymptoms) ? patientSymptoms : [patientSymptoms].filter(Boolean),
          species: activePatient?.species || 'Canino',
          isAsymptomatic: Boolean(isAsymptomatic),
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
  }, [selectedSyndromes, selectedFindings, activePatient?.species, isAsymptomatic]);

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

  // Total de la orden
  const orderFinancials = useMemo(() => {
    const baseTotal = selectedProfiles.reduce((acc, p) => acc + p.basePrice, 0);
    const finalTotal = baseTotal + replacementMetrics.additionalCost;
    return {
      baseTotal,
      additionalCost: replacementMetrics.additionalCost,
      finalTotal,
    };
  }, [selectedProfiles, replacementMetrics]);

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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // REQUERIMIENTO: Solo se selecciona 1 paciente. Clic resalta borde; volver a hacer clic deselecciona.
  const handleTogglePatientSelection = (p) => {
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
      if (activePatient) {
        if (!controlHistoryInfo.canRequestControl) {
          alert(`Este paciente no tiene habilitada la opción de seguimiento / control.\n\nMotivo: ${controlHistoryInfo.reason}.\nDebe solicitar un "Examen nuevo".`);
          return;
        }
        setExamType('control');
        if (controlHistoryInfo.lastExamId && !previousExamCode) {
          setPreviousExamCode(controlHistoryInfo.lastExamId);
        }
        // REQUERIMIENTO: Si ya hay paciente seleccionado, abre DIRECTAMENTE la revisión de control con los agentes positivos
        setIsControlReviewOpen(true);
      } else {
        setExamType('control');
      }
    } else {
      setExamType('nuevo');
      setPreviousExamCode('');
      setIsControlReviewOpen(false);
    }
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
    if (!confirmedSamples) return;
    if (!activePatient) return;

    setIsSubmitting(true);
    try {
      const profilesData = selectedProfiles.map((p) => {
        const customAgents = p.agents.map((origAgent, idx) => {
          return replacedAgents[p.id]?.[idx] || origAgent;
        });
        return {
          id: p.id,
          title: p.title,
          type: p.type || 'Amplio',
          price: p.basePrice,
          agents: customAgents,
          originalAgents: p.agents,
          samples: p.samples,
        };
      });

      const payload = {
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
        hasVetPlusInsurance: Boolean(hasVetPlusInsurance),
        vetPlusCode: hasVetPlusInsurance ? (vetPlusCode.trim() || 'VETP-REG') : null,
        isAsymptomatic: Boolean(isAsymptomatic),
        urgency: 'Normal (24-48h)',
        logistics: 'Toma en clínica',
        requestedBy: activePatient.attendingVet || 'Dr. Alejandro Morales',
        targets: profilesData.flatMap((p) => p.agents).join(', '),
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
        requestedBy: activePatient.attendingVet || 'Dr. Alejandro Morales',
        targets: activeControlAgents.map((a) => a.name).join(', '),
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
  };

  // ============================================================================
  // RENDERIZADO DEL MODAL O MÓDULO INDEPENDIENTE
  // ============================================================================
  const containerClasses = isModal
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    : "w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 animate-in fade-in duration-200";

  const cardClasses = isModal
    ? "bg-[#f8fafc] rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
    : "bg-[#f8fafc] rounded-3xl w-full shadow-md border border-slate-200/90 overflow-hidden flex flex-col";

  const scrollBodyClasses = isModal
    ? "flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
    : "flex-1 p-6 sm:p-8 space-y-6";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        
        {/* ==================================================================== */}
        {/* CABECERA                                                            */}
        {/* ==================================================================== */}
        <div className="bg-white px-6 sm:px-8 pt-5 pb-4 border-b border-slate-100 shrink-0">
          {isOrderSuccess ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
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
                      Módulo Clínico · Solicitud de Examen qPCR
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-100 text-[#6F2BCC]">
                    {examType === 'control' ? '🔄 SEGUIMIENTO / CONTROL' : '✨ NUEVO EXAMEN'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">· Solicitud Molecular qPCR</span>
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

              {/* Barra de progreso de 4 pasos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>PASO {currentStep <= 4 ? currentStep : 4} DE 4</span>
                  <span className="text-[#6F2BCC]">
                    {currentStep === 1 && 'Paciente'}
                    {currentStep === 2 && 'Síndrome clínico'}
                    {currentStep === 3 && 'Hallazgos (opcional)'}
                    {currentStep === 4 && 'Perfiles qPCR'}
                    {currentStep === 5 && 'Revisión y envío'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${currentStep >= 4 ? 'bg-[#6F2BCC]' : 'bg-slate-200'}`} />
                </div>
              </div>
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

              {/* RENDERIZADO CONDICIONAL SEGÚN TIPO: SEGUIMIENTO/CONTROL vs EXAMEN NUEVO */}
              {submittedOrderData.examType === 'control' ? (
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

              {/* TARJETA 4: SEGUIMIENTO DE LA ORDEN (LÍNEA DE TIEMPO DELIVERY DE 8 ETAPAS) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  SEGUIMIENTO DE LA ORDEN
                </span>

                <div className="relative pt-2 pb-1 overflow-x-auto">
                  {/* Línea horizontal continua que conecta los círculos */}
                  <div className="absolute top-[26px] left-8 right-8 h-0.5 bg-sky-100 z-0 hidden sm:block" />

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-1 relative z-10 min-w-[580px]">
                    {/* 1. Orden creada */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#6F2BCC] text-white flex items-center justify-center font-bold text-sm shadow-xs ring-4 ring-white">
                        ✓
                      </div>
                      <span className="text-[11px] font-bold text-[#6F2BCC] leading-tight">
                        Orden creada
                      </span>
                    </div>

                    {/* 2. Asignando repartidor */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#f0f9ff] border border-sky-200 text-sky-700 flex items-center justify-center text-sm ring-4 ring-white">
                        🔍
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight">
                        Asignando repartidor
                      </span>
                    </div>

                    {/* 3. Repartidor en camino */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#f0f9ff] border border-sky-200 text-sky-700 flex items-center justify-center text-sm ring-4 ring-white">
                        🚗
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight">
                        Repartidor en camino
                      </span>
                    </div>

                    {/* 4. Muestra recolectada */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#f0f9ff] border border-sky-200 text-sky-700 flex items-center justify-center text-sm ring-4 ring-white">
                        🧪
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight">
                        Muestra recolectada
                      </span>
                    </div>

                    {/* 5. Camino al laboratorio */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#f0f9ff] border border-sky-200 text-sky-700 flex items-center justify-center text-sm ring-4 ring-white">
                        🚚
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight">
                        Camino al laboratorio
                      </span>
                    </div>

                    {/* 6. Recibida en lab. */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#f0f9ff] border border-sky-200 text-sky-700 flex items-center justify-center text-sm ring-4 ring-white">
                        🏥
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight">
                        Recibida en lab.
                      </span>
                    </div>

                    {/* 7. Procesando */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#f0f9ff] border border-sky-200 text-sky-700 flex items-center justify-center text-sm ring-4 ring-white">
                        🔬
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight">
                        Procesando
                      </span>
                    </div>

                    {/* 8. Resultado enviado */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-[#ecfdf5] border border-emerald-300 text-emerald-600 flex items-center justify-center text-sm ring-4 ring-white">
                        ☑️
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight">
                        Resultado enviado
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTONES DE RETORNO Y SEGUIMIENTO */}
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
          {/* PASO 1: TIPO DE EXAMEN Y BUSCADOR REACTIVO DE PACIENTE             */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && currentStep === 1 && (
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
                
                {/* 1.1 Tipo de examen: Nuevo vs Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">
                      Tipo de examen *
                    </label>
                    {activePatient && !controlHistoryInfo.canRequestControl && (
                      <span className="text-[11px] text-slate-400 font-medium italic">
                        Control inhabilitado: Paciente sin examen previo en los últimos 6 meses
                      </span>
                    )}
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
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                        examType === 'control'
                          ? 'bg-[#6F2BCC] text-white shadow-sm ring-2 ring-[#6F2BCC]/30 cursor-pointer'
                          : activePatient && !controlHistoryInfo.canRequestControl
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer'
                      }`}
                    >
                      <span>🔄</span> Seguimiento / control
                      {activePatient && !controlHistoryInfo.canRequestControl && (
                        <span className="text-[10px] ml-1">🔒</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Si es seguimiento / control: Se solicita el código del examen anterior */}
                {examType === 'control' && (
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
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleTogglePatientSelection(p)}
                            className={`flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'border-2 border-[#6F2BCC] bg-sky-50/40 shadow-xs'
                                : 'border border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{p.avatar || (p.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}</span>
                              <div>
                                <div className="text-xs font-bold text-slate-900">
                                  {p.name} {p.lastName || ''}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {p.species} · {p.breed} · {p.owner?.name || 'Tutor registrado'}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#6F2BCC] bg-sky-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <span>✓</span> Seleccionado
                                </span>
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                  (Clic para deseleccionar)
                                </span>
                              </div>
                            )}
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

                  {activePatient && !controlHistoryInfo.canRequestControl && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
                      <span className="text-base shrink-0 mt-0.5">ℹ️</span>
                      <div>
                        <div className="font-bold text-slate-800">Sin período de control activo</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {controlHistoryInfo.reason}. Solo está disponible la modalidad "Examen nuevo".
                        </p>
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
          {/* PASO 2: SÍNDROME CLÍNICO (INICIA EN BLANCO: 0 SELECCIONADOS)        */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">

              {/* Ficha contextual del paciente con configuración directa de Aseguramiento VetPlus y Estado Asintomático */}
              {activePatient && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
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
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#c7f2e5]/80 text-[#0f766e] border border-[#99f6e4]">
                        {examType === 'control' ? 'Seguimiento / control' : 'Examen nuevo'}
                      </span>
                    </div>
                  </div>

                  {/* Fila compacta de VetPlus y Asintomático */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                    {/* VetPlus */}
                    <div className="p-3 bg-sky-50/50 border border-sky-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <span>🛡️</span> Asegurado con VetPlus:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setHasVetPlusInsurance(false);
                              setVetPlusCode('');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              !hasVetPlusInsurance
                                ? 'bg-slate-700 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => setHasVetPlusInsurance(true)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              hasVetPlusInsurance
                                ? 'bg-[#6F2BCC] text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Sí
                          </button>
                        </div>
                      </div>

                      {hasVetPlusInsurance && (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={vetPlusCode}
                            onChange={(e) => setVetPlusCode(e.target.value)}
                            placeholder="Código póliza/autorización VetPlus"
                            className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-[11px] font-mono font-bold text-slate-800 focus:ring-1 focus:ring-[#6F2BCC] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Asintomático */}
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <span>🩺</span> Condición clínica:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsAsymptomatic(false)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              !isAsymptomatic
                                ? 'bg-slate-700 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Sintomático
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAsymptomatic(true)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              isAsymptomatic
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Asintomático
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500">
                        {isAsymptomatic
                          ? '🌿 Modo preventivo: selección de síndrome opcional'
                          : '⚠️ Modo sintomático: selecciona síndromes observados'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Banner informativo si es asintomático */}
              {isAsymptomatic && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0">🌿</span>
                    <span>
                      <strong>Paciente Asintomático:</strong> La selección de síndromes es opcional. Puedes marcar un área de interés o avanzar directamente a los perfiles qPCR.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    Ir a Perfiles qPCR →
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Síndrome clínico
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecciona el síndrome principal observado en el paciente
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedSyndromes.length > 0
                    ? 'bg-sky-100 text-[#6F2BCC]'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedSyndromes.length} seleccionados
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 block">
                  Síndrome clínico (puedes seleccionar varios)
                </span>

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
            </div>
          )}

          {/* ================================================================== */}
          {/* PASO 3: SINTOMATOLOGÍA Y HALLAZGOS (INICIA EN BLANCO: [])          */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Sintomatología y hallazgos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona o escribe los hallazgos del examen físico (opcional)
                </p>
              </div>

              {isAsymptomatic && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in duration-150 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🌿</span>
                    <div>
                      <div className="font-bold text-emerald-950">Paciente Asintomático (Chequeo Preventivo)</div>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        No se requiere registrar síntomas clínicos para este examen de rutina o tamizaje molecular.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    Continuar a Perfiles qPCR →
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-6 shadow-2xs">
                {/* Título dinámico con síndromes seleccionados */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                    HALLAZGOS FRECUENTES — {selectedSyndromes.join(', ').toUpperCase() || 'GENERAL'}
                  </h4>

                  {/* Pills de hallazgos frecuentes */}
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

                    {/* Hallazgos manuales añadidos */}
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

                {/* Formulario: Agregar hallazgo manualmente */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                    AGREGAR HALLAZGO MANUALMENTE
                  </label>
                  <form onSubmit={handleAddManualFinding} className="flex gap-2">
                    <input
                      type="text"
                      value={manualFindingInput}
                      onChange={(e) => setManualFindingInput(e.target.value)}
                      placeholder="Ej. poliuria, halitosis, prurito... (Enter para agregar)"
                      className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* PASO 4: PERFILES qPCR RECOMENDADOS (INICIA EN BLANCO: 0 AÑADIDOS)  */}
          {/* ================================================================== */}
          {!isOrderSuccess && !isControlReviewOpen && currentStep === 4 && (
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

              {/* Lista de perfiles qPCR recomendados */}
              <div className="space-y-4">
                {recommendedProfiles.map((profile) => {
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
                          Agentes microbiológicos diana ({profile.agents.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.agents.map((ag) => (
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
          {!isOrderSuccess && !isControlReviewOpen && currentStep === 5 && (
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
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {activePatient?.name} {activePatient?.lastName || ''}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activePatient?.species} · {activePatient?.breed} · {getPatientAgeDisplay(activePatient)} · {activePatient?.owner?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#c7f2e5]/80 text-[#0f766e] border border-[#99f6e4] flex items-center gap-1.5">
                      <span>📄</span>
                      <span>{examType === 'control' ? 'Seguimiento / control' : 'Examen nuevo'}</span>
                    </span>

                    {hasVetPlusInsurance ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-sky-50 text-[#6F2BCC] border border-sky-200 flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>VetPlus: {vetPlusCode || 'Asegurado'}</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                        Sin seguro VetPlus
                      </span>
                    )}

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
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 5.3 MUESTRAS REQUERIDAS (Exacto Figma Imagen 5) */}
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  MUESTRAS REQUERIDAS
                </span>

                <div className="space-y-2.5">
                  {consolidatedSamples.map((samp, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-sky-200/90 rounded-2xl flex items-center gap-3.5 shadow-2xs"
                    >
                      <span className="w-10 h-10 rounded-xl bg-sky-50 text-[#6F2BCC] border border-sky-200 flex items-center justify-center text-lg shrink-0">
                        🩺
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{samp.name}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>📦</span> {samp.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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

        {!isOrderSuccess && !isControlReviewOpen && (
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
                    onClick={() => {
                      if (initialPatient && currentStep === 2) {
                        onClose();
                      } else {
                        setCurrentStep((prev) => prev - 1);
                      }
                    }}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ← Volver
                  </button>

                  {currentStep === 3 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
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
                      if (hasVetPlusInsurance && !vetPlusCode.trim()) {
                        alert('Por favor ingresa el código de póliza / autorización de VetPlus o desmarca la opción.');
                        return;
                      }
                      if (!isAsymptomatic && selectedSyndromes.length === 0) {
                        alert('Debes seleccionar al menos un síndrome clínico, o marcar al paciente como asintomático.');
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
                  disabled={!confirmedSamples || isSubmitting}
                  onClick={handleSubmitFinalOrder}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    confirmedSamples && !isSubmitting
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
