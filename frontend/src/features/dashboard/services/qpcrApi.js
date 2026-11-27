import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL}/api/qpcr`
  : (isLocalhost ? 'http://localhost:5000/api/qpcr' : null);

/**
 * Normalización de cadenas de texto para búsqueda y emparejamiento clínico
 */
export function norm(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function matchSyndromeTokens(sNorm, psNorm) {
  if (!sNorm || !psNorm) return false;
  const s = norm(sNorm);
  const ps = norm(psNorm);
  if (s === ps || s.includes(ps) || ps.includes(s)) return true;

  if (
    (s.includes('digestiv') || s.includes('hepatic') || s.includes('icter')) &&
    (ps.includes('digestiv') || ps.includes('hepatic') || ps.includes('icter'))
  ) {
    return true;
  }

  if (
    (s.includes('nefro') || s.includes('renal')) &&
    (ps.includes('nefro') || ps.includes('renal'))
  ) {
    return true;
  }

  const roots = [
    'derm', 'cutan', 'piel', 'cardio', 'oftalm', 'ocul', 'neuro',
    'hemotrop', 'icter', 'digest', 'hepat', 'nefro', 'renal', 'respirat',
    'filar', 'infecc', 'muscul', 'articul'
  ];

  for (const root of roots) {
    if (s.includes(root) && ps.includes(root)) return true;
  }
  return false;
}

export const CLINICAL_SYNDROMES_LIST = [
  { id: 'all', label: 'Todos los Síndromes', icon: '✨' },
  { id: 'Hemotrópico/Sistémico', label: 'Hemotrópico / Sistémico', icon: '🩸' },
  { id: 'Digestivo-Hepático', label: 'Digestivo-Hepático', icon: '🩺' },
  { id: 'Nefrológico', label: 'Síndrome Nefrológico', icon: '💧' },
  { id: 'Cardíaco', label: 'Cardíaco', icon: '🫀' },
  { id: 'Respiratorio', label: 'Respiratorio / Filarial', icon: '🫁' },
  { id: 'Neurológico', label: 'Neurológico / SNC', icon: '🧠' },
  { id: 'Ocular', label: 'Ocular / Oftálmico', icon: '👁️' },
  { id: 'Dermatológico / Cutáneo (Piel)', label: 'Dermatológico / Cutáneo', icon: '🩹' },
  { id: 'Infeccioso viral', label: 'Infeccioso Viral', icon: '🦠' },
];

export const KEA_AGENTES_URL = 'https://osd.kea.tools/api/v1/databases/ZZ_PLAT_AGENTE/records?limit=100';
export const KEA_AGENTES_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiZDk1MWI0MTI4NDY0MGJiYTlkMzgzZjRjNjdkZjZlMzFiMzJmYzc3NDFhNjE5NzRkNzBmMTY0MjgyMmEwMmYxZTdmNTI1NjY0MjE0MTRhMjMiLCJpYXQiOjE3OTU2MTk2OTAuMDY2MTM0LCJuYmYiOjE3OTU2MTk2OTAuMDY2MTM4LCJleHAiOjE4MjcxNTU2OTAuMDU5NTQ3LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.gC9i_WrY47kCT9qrdy38ZrVi_WDUKipmNv9zLNKna2N0dNyed_iRzMi23vIacyo8nI_Dm88Bh2iBzbRde70_1OXyyeBDQWYR2VxVLv23_iQopiwVFXl-8E0_wJlLZcRCHdmzPBDyFkKSIKyUqQgDv_IZMOW6rB_zB6jgAV3q2fg9JngbCDvGWtdloF7YQlCw1S2LI2TLLRhV4ZTVXNP78fGnBFGLu0vA7bvA8-V0I2tXXylZxD4YfJWYkmT7_b_hWFFENrWIvijZnh4ZQsyDTnBTsULZgVZnbT1jpaDjV1FXRalAuFpxnTfRdQYHe-MTEahqFlfNopH7X7b09fs3zBQLOghOPPgvMqDpOc9OwYOIWzRBAVuW8KthyOkNVyaaMq7qfQjB_cSOVBKy4bI7enEIbGflzAVMgtAdTM9lOlnW6Yxzv9lgUBy_LuUdtBhP42Yxbtzo0rfwfWRgLMpQ-l9o5keY0zNsGW-hiLwy4mWc1Wi-5uEts7Q8ExowyKBizHqqRvJtA_DzNCQCkdWri4sYrwwadCcNsLFzjUckf8O-UwCtXyloYbXr7jhYAFbxazh4mM_cCtSuy6dKV2iP8BhzUj-nWnO0PuB-3J-oUaBtQ4AcQvIhMJ1q-NbjNYrc1o1NMbIPqmNCOSu9uY4I1HrMfR5t8-Ev2pbJekuZuZ8';

let cachedAgentsMemory = null;
let lastAgentsFetchTimestamp = 0;

/**
 * Clasificación etaria clínica del paciente (Pediátrico / Adulto / Geriátrico)
 */
export function parseAgeStage(ageInput, birthDateInput) {
  let months = null;
  if (birthDateInput) {
    const b = new Date(birthDateInput);
    if (!isNaN(b.getTime())) {
      const diffMs = Date.now() - b.getTime();
      months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375));
    }
  }
  if (months === null && ageInput !== undefined && ageInput !== null && ageInput !== '') {
    const s = String(ageInput).toLowerCase().trim();
    const num = parseFloat(s.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      if (s.includes('mes')) {
        months = Math.round(num);
      } else if (s.includes('año') || s.includes('ano')) {
        months = Math.round(num * 12);
      } else {
        months = num > 25 ? Math.round(num) : Math.round(num * 12);
      }
    }
  }
  if (months === null) {
    return { stage: 'adulto', label: 'Adulto', months: 36, isPediatric: false, isSenior: false, display: 'Adulto' };
  }
  if (months < 12) {
    return { stage: 'pediatrico', label: 'Cachorro / Pediátrico', months, isPediatric: true, isSenior: false, display: `${months} meses` };
  } else if (months >= 96) {
    const years = Math.floor(months / 12);
    return { stage: 'geriatrico', label: 'Geriátrico / Senior', months, isPediatric: false, isSenior: true, display: `${years} años` };
  } else {
    const years = Math.floor(months / 12);
    return { stage: 'adulto', label: 'Adulto', months, isPediatric: false, isSenior: false, display: `${years} años` };
  }
}

/**
 * Evaluación epidemiológica geográfica según la residencia del tutor (zonas de vectores y entornos rurales)
 */
export function parseResidenceEpidemiology(cityOrAddress) {
  if (!cityOrAddress) return { isWarmOrVectorZone: false, isRural: false, matchedZone: null, cityName: '' };
  const normText = String(cityOrAddress).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const vectorZones = [
    'barranquilla', 'cartagena', 'santa marta', 'monteria', 'sincelejo', 'valledupar', 'riohacha',
    'uraba', 'cali', 'palmira', 'tulua', 'buenaventura', 'girardot', 'melgar', 'flandes', 'neiva',
    'ibague', 'espinal', 'villavicencio', 'yopal', 'llanos', 'bucaramanga', 'cucuta', 'barrancabermeja',
    'medellin', 'bello', 'itagui', 'envigado', 'antioquia', 'costa', 'caribe', 'pacifico', 'calido',
    'tropical', 'tolima', 'huila', 'valle', 'sucre', 'cordoba', 'cesar', 'magdalena', 'bolivar', 'atlantico',
    'guajira', 'meta', 'casanare', 'santander', 'norte de santander', 'pereira', 'armenia'
  ];

  const ruralKeywords = ['rural', 'finca', 'vereda', 'corregimiento', 'granja', 'hacienda', 'parcela', 'campo'];

  const isWarmOrVectorZone = vectorZones.some((vz) => normText.includes(vz));
  const isRural = ruralKeywords.some((rk) => normText.includes(rk));
  const matchedZone = vectorZones.find((vz) => normText.includes(vz)) || null;

  return {
    isWarmOrVectorZone,
    isRural,
    matchedZone,
    cityName: String(cityOrAddress).trim(),
  };
}

/**
 * Analiza y desglosa la cadena de matrices biológicas de un perfil en una lista atractiva de matrices
 */
export function parseProfileMatrices(matrixStr) {
  if (!matrixStr) {
    return {
      items: [{ text: 'Sangre en tubo tapa lila (EDTA)', icon: '🩸', tagBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800' }],
      note: null,
    };
  }

  let mainPart = matrixStr;
  let notePart = null;

  const dotIndex = matrixStr.indexOf('. ');
  if (dotIndex !== -1) {
    mainPart = matrixStr.slice(0, dotIndex).trim();
    notePart = matrixStr.slice(dotIndex + 2).trim();
  } else if (matrixStr.toLowerCase().includes('en casos donde')) {
    const idx = matrixStr.toLowerCase().indexOf('en casos donde');
    mainPart = matrixStr.slice(0, idx).replace(/[.,;]$/, '').trim();
    notePart = matrixStr.slice(idx).trim();
  }

  // Dividir por ' y/o ' o ' y ' respetando paréntesis
  const rawTokens = [];
  let current = '';
  let inParen = false;

  for (let i = 0; i < mainPart.length; i++) {
    const char = mainPart[i];
    if (char === '(') inParen = true;
    else if (char === ')') inParen = false;

    if (!inParen) {
      if (mainPart.slice(i, i + 5).toLowerCase() === ' y/o ') {
        if (current.trim()) rawTokens.push(current.trim());
        current = '';
        i += 4;
        continue;
      } else if (mainPart.slice(i, i + 3).toLowerCase() === ' y ' && !mainPart.slice(i, i + 7).toLowerCase().includes(' y/o ')) {
        if (current.trim()) rawTokens.push(current.trim());
        current = '';
        i += 2;
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) rawTokens.push(current.trim());

  // Si algún token contiene ', orina' o ', sangre' fuera de paréntesis
  const finalTokens = [];
  rawTokens.forEach((tok) => {
    const parts = tok.split(/,\s*(?=(?:orina|sangre|materia|l[ií]quido|hisopado|semen|biopsia)\b)/i);
    parts.forEach((p) => {
      if (p.trim()) finalTokens.push(p.trim());
    });
  });

  const items = finalTokens
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => {
      const low = text.toLowerCase();
      let icon = '🧪';
      let tagBg = 'bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200/80 dark:border-sky-800';

      if (low.includes('sangre') || low.includes('edta')) {
        icon = '🩸';
        tagBg = 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800';
      } else if (low.includes('orina')) {
        icon = '💧';
        tagBg = 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800';
      } else if (low.includes('cefalorraqu') || low.includes('lcr')) {
        icon = '🧠';
        tagBg = 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 border-purple-200/80 dark:border-purple-800';
      } else if (low.includes('fecal') || low.includes('rectal') || low.includes('materia')) {
        icon = '💩';
        tagBg = 'bg-amber-100 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-300/80 dark:border-amber-700';
      } else if (low.includes('hisopado') || low.includes('secreci') || low.includes('gingival') || low.includes('ocular') || low.includes('nasal')) {
        icon = '🩹';
        tagBg = 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800';
      } else if (low.includes('semen') || low.includes('vaginal') || low.includes('prepucial') || low.includes('aborto')) {
        icon = '🔬';
        tagBg = 'bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-300 border-teal-200/80 dark:border-teal-800';
      } else if (low.includes('biopsia') || low.includes('tejido') || low.includes('espécimen') || low.includes('especimen')) {
        icon = '🧫';
        tagBg = 'bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
      }

      const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
      return { text: capitalized, icon, tagBg };
    });

  return {
    items: items.length > 0 ? items : [{ text: matrixStr, icon: '🧪', tagBg: 'bg-slate-50 text-slate-800 border-slate-200' }],
    note: notePart,
  };
}

/**
 * Diccionario de argumentación clínica estructurada por perfil qPCR explicada al propietario
 */
export const CLINICAL_ARGUMENTATION_DATA = {
  vectorPlus: {
    key: 'vectorPlus',
    title: 'VECTOR PLUS (10 agentes)',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Perfil de amplio espectro que permite el diagnóstico no solo de un agente patógeno, sino de varios (coinfecciones), ya que los agentes que los transmiten pueden portar varios patógenos.',
      'Diagnóstico temprano sobre presencia de agentes sobre otros tipos de pruebas que solo tienen un alcance de exposición pero que ayudan al mismo tiempo a dirigir y tratar la enfermedad.',
      'La prueba qPCR es una prueba de precisión y sensibilidad.',
      'Nos ayuda a tener un manejo racional sobre el uso de antibióticos en nuestro paciente con uso de fundamento.',
    ],
  },
  tetraR: {
    key: 'tetraR',
    title: 'TETRA R (Control y Diagnóstico · Resistencia a tetraciclina)',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Es un perfil que nos ayuda a identificar de manera directa genes sobre mecanismo de resistencia a tetraciclina con el fin de poder usar razonablemente este antibiótico para ciertos patógenos.',
      'Nos puede ayudar a evitar fallas terapéuticas.',
      'Conociendo los mecanismos expresados por estos grupos de genes podemos saber cómo modificar la terapia cuando hay genes que codifican resistencia reversible.',
      'Nos permite hacer una vigilancia epidemiológica.',
    ],
  },
  gastroPanel: {
    key: 'gastroPanel',
    title: 'GASTRO PANEL CANINO Y FELINO',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Nos permite tener una cobertura íntegra de cuadros gastrointestinales mixtos.',
      'Diagnóstico rápido y sensible frente a métodos tradicionales que necesitan de procesos intermitentes.',
      'Nos orienta y dirige a una terapia adecuada sobre el agente responsable de las patologías del cuadro clínico.',
      'Podemos aprovechar una sola muestra para tener capacidad diagnóstica y terapéutica.',
    ],
  },
  feliVector: {
    key: 'feliVector',
    title: 'FELI VECTOR',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Nos permite diagnosticar coinfecciones, pero particularmente este perfil tiene una sinergia inmunológica, ya que su capacidad de tener en cuenta los retrovirales ayuda al proceso diagnóstico, manejo y terapéutico.',
      'Diagnóstico preciso ante sintomatología solapada de agentes vectoriales que puede ser causada por agentes virales.',
      'Alta sensibilidad ante bajas cargas de los patógenos lo hace un perfil versátil.',
      'Mejor toma de decisiones terapéuticas y de manejo clínico.',
    ],
  },
  feliInfecto: {
    key: 'feliInfecto',
    title: 'FELI INFECTO / FUSIONAR CON OCULO RESPIRATORIO',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Cobertura amplia en procesos de coinfecciones con signos respiratorios, oculares o sistémicos.',
      'Mayor utilidad en fases agudas en felinos con signos sistémicos con agentes influyentes en el sistema inmunológico.',
      'Un perfil determinante para decisiones de aislamiento.',
      'Un perfil de suma importancia para uso en refugios.',
    ],
  },
  neuroPet: {
    key: 'neuroPet',
    title: 'NEURO PET CANINO / FELINO',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Abordaje integral en paciente con signos neurológicos que puedan tener afecciones directas a partir de coinfecciones, con directriz para manejo de paciente convulsivo.',
      'Alta sensibilidad para diagnosticar fases agudas o tempranas de procesos infecciosos de este sistema.',
      'Es un perfil que debe ser hecho en la matriz adecuada como es el LCR (Líquido Cefalorraquídeo).',
      'Un perfil que brinda apoyo decisivo para terapéutica y pronóstico de cada paciente.',
    ],
  },
  icteroPet: {
    key: 'icteroPet',
    title: 'ICTERO PET',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Un perfil de abordaje integral ante un signo clínico que necesita diagnóstico pertinente para su manejo.',
      'Detección de agentes que pueden ser determinantes ante el daño de órganos o células sanguíneas.',
      'Orientación precisa de soporte y terapia específica ante pacientes graves dando pronóstico.',
    ],
  },
  canResp: {
    key: 'canResp',
    title: 'CAN RESP',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Perfil diseñado para evitar solapamiento de otros agentes que tengan participación de vías respiratorias.',
      'Perfil de importancia en decisiones de aislamiento para un mejor manejo del cuadro clínico y medicina epidemiológica.',
      'Cobertura diagnóstica, fases agudas y sensibilidad ante agentes decisorios en el cuadro clínico.',
      'Muestra de mayor importancia para este perfil debe estar asociada al sistema respiratorio.',
      'Tratamientos dirigidos.',
    ],
  },
  reproPet: {
    key: 'reproPet',
    title: 'REPRO PET',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Abordaje integral para pacientes con signos reproductivos tanto aquellos con abortos como pacientes que quieran entrar a un proceso de monta.',
      'Detección de agentes en coinfecciones asintomáticas o sintomáticas, es un perfil versátil para prevención.',
      'Control sanitario, prevención de brotes y seguimiento en criaderos de alta exigencia.',
    ],
  },
  canFel360: {
    key: 'canFel360',
    title: 'CAN 360 / FEL 360',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Perfil muy versátil para cuadro multisistémico, alta cobertura diagnóstica.',
      'Capacidad de integrar diagnóstico de coinfecciones y determinantes inmunológicos.',
      'Mayor sensibilidad y especificidad dentro de las matrices utilizadas.',
      'Responsabilidad en la elección de tratamiento de antibioticoterapia.',
    ],
  },
  fungiDermapet: {
    key: 'fungiDermapet',
    title: 'FUNGI DERMAPET',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Mayor precisión y tiempo oportuno sobre pruebas convencionales como los cultivos.',
      'Identificación de agentes transmisibles como hongos.',
      'Diferenciación de cuadros dermatológicos que puedan tener síntomas similares.',
      'Tratamientos directos a los patógenos diagnosticados.',
    ],
  },
};

/**
 * Resuelve la argumentación clínica oficial de un perfil dado
 */
export function getClinicalArgumentation(profile) {
  if (!profile) return null;
  const raw = `${profile.id || ''} ${profile.code || ''} ${profile.title || ''} ${profile.nombrePlataformaPropuesto || ''} ${profile.nombreCesar || ''} ${profile.type || ''}`;
  const str = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // P6 FELI-VECTOR prioritario para evitar colisión con "joe" en su identificador
  if (profile.code === 'P6' || str.includes('feli-vector') || str.includes('feli vector')) {
    return CLINICAL_ARGUMENTATION_DATA.feliVector;
  }
  if (profile.code === 'P1' || str.includes('vector plus') || str.includes('p1-') || (str.includes('joe') && !str.includes('fiv') && !str.includes('felv'))) {
    return CLINICAL_ARGUMENTATION_DATA.vectorPlus;
  }
  if (profile.code === 'P2' || profile.code === 'P3' || str.includes('tetra') || str.includes('resistencia')) {
    return CLINICAL_ARGUMENTATION_DATA.tetraR;
  }
  if (profile.code === 'P4' || profile.code === 'P5' || str.includes('gastro') || str.includes('digestiv')) {
    return CLINICAL_ARGUMENTATION_DATA.gastroPanel;
  }
  if (
    profile.code === 'P7' ||
    profile.code === 'P9' ||
    profile.code === 'P15' ||
    str.includes('feli-infect') ||
    str.includes('feli infect') ||
    str.includes('ocuresp') ||
    str.includes('ocular') ||
    str.includes('viral felin') ||
    str.includes('viral')
  ) {
    return CLINICAL_ARGUMENTATION_DATA.feliInfecto;
  }
  if (profile.code === 'P8' || profile.code === 'P17' || str.includes('neuro')) {
    return CLINICAL_ARGUMENTATION_DATA.neuroPet;
  }
  if (profile.code === 'P10' || str.includes('ictero')) {
    return CLINICAL_ARGUMENTATION_DATA.icteroPet;
  }
  if (profile.code === 'P11' || str.includes('can-resp') || str.includes('can resp') || str.includes('respiratorio canin')) {
    return CLINICAL_ARGUMENTATION_DATA.canResp;
  }
  if (profile.code === 'P12' || str.includes('repro')) {
    return CLINICAL_ARGUMENTATION_DATA.reproPet;
  }
  if (profile.code === 'P13' || profile.code === 'P14' || str.includes('360') || str.includes('rutina')) {
    return CLINICAL_ARGUMENTATION_DATA.canFel360;
  }
  if (profile.code === 'P16' || str.includes('fungi') || str.includes('hongo') || str.includes('dermapet') || str.includes('derm')) {
    return CLINICAL_ARGUMENTATION_DATA.fungiDermapet;
  }

  // Fallback genérico para cualquier otro perfil molecular
  return {
    key: 'qpcrGenerico',
    title: profile.title || 'Perfil qPCR Especializado',
    headerLabel: 'ARGUMENTACIÓN CLÍNICA PARA ESTE PERFIL EXPLICADO AL PROPIETARIO',
    points: [
      'Diagnóstico molecular avanzado por qPCR con máxima sensibilidad y especificidad analítica.',
      'Detección precoz y cuantificable de material genético de los patógenos antes de la seroconversión o en fases asintomáticas.',
      'Permite instaurar tratamientos dirigidos y racionalizar el uso de antimicrobianos con fundamento científico.',
      'Aprovecha muestras biológicas mínimas con alta capacidad diagnóstica y pronóstica.',
    ],
  };
}

// Re-exportamos la base de datos de agentes y perfiles desde la estructura canónica local
export {
  OFFICIAL_KEA_AGENTS_DB as LOCAL_INFECTIOUS_AGENTS_DB,
  OFFICIAL_KEA_AGENTS_DB,
  INFECTIOUS_AGENTS_DB,
  QPCR_PROFILES_MASTER as LOCAL_QPCR_PROFILES_MASTER,
  QPCR_GENERAL_OBSERVATION as LOCAL_QPCR_GENERAL_OBSERVATION,
} from '../data/qpcrKnowledgeBase.js';
import {
  OFFICIAL_KEA_AGENTS_DB as LOCAL_AGENTS,
  QPCR_PROFILES_MASTER as LOCAL_PROFILES,
  QPCR_GENERAL_OBSERVATION as LOCAL_OBSERVATION,
} from '../data/qpcrKnowledgeBase.js';

export const qpcrApi = {
  /**
   * Obtiene la observación general preanalítica y clínica
   */
  getGeneralObservation() {
    return LOCAL_OBSERVATION;
  },

  /**
   * Obtiene todos los perfiles qPCR con sus nombres de agentes resueltos
   * Soporta filtrado opcional por síndrome clínico, especie y búsqueda textual
   */
  async getProfiles(params = {}) {
    if (API_BASE_URL) {
      try {
        const response = await axios.get(`${API_BASE_URL}/profiles`, { params, timeout: 3000 });
        if (response.data?.success && Array.isArray(response.data?.data)) {
          return response.data.data;
        }
      } catch (_) {}
    }

    let list = LOCAL_PROFILES.map((p) => ({
      ...p,
      price: p.basePrice || p.price,
      agents: (p.agentIds && p.agentIds.length > 0)
        ? p.agentIds.map((id) => {
            const ag = LOCAL_AGENTS.find((a) => a.id === id);
            return ag ? ag.name : id;
          })
        : (p.agents || []),
    }));

    if (params.species && params.species !== 'all') {
      const sp = norm(params.species);
      list = list.filter((p) => {
        const pSp = norm(p.species || '');
        if (sp.includes('canin')) return pSp.includes('canin') || pSp.includes('amb');
        if (sp.includes('felin')) return pSp.includes('felin') || pSp.includes('amb');
        if (sp.includes('amb')) return pSp.includes('amb');
        return true;
      });
    }

    if (params.syndrome && params.syndrome !== 'all') {
      list = list.filter((p) =>
        (p.syndromes || []).some((s) => matchSyndromeTokens(s, params.syndrome))
      );
    }

    if (params.search && params.search.trim()) {
      const q = norm(params.search);
      list = list.filter((p) => {
        return (
          norm(p.title).includes(q) ||
          norm(p.code || '').includes(q) ||
          norm(p.nombrePlataformaPropuesto || '').includes(q) ||
          norm(p.nombreCesar || '').includes(q) ||
          norm(p.description).includes(q) ||
          norm(p.matrix || '').includes(q) ||
          (p.agents || []).some((ag) => norm(ag).includes(q)) ||
          (p.syndromes || []).some((syn) => norm(syn).includes(q))
        );
      });
    }

    return list;
  },

  /**
   * Filtra perfiles qPCR según los criterios clínicos desde el backend
   */
  async filterProfiles({
    syndromes = [],
    findings = [],
    symptoms = [],
    species = 'Canino',
    isAsymptomatic = false,
    riskFactors = {},
    patient = null,
  }) {
    if (API_BASE_URL) {
      try {
        const response = await axios.post(`${API_BASE_URL}/filter-profiles`, {
          syndromes,
          findings,
          symptoms,
          species,
          isAsymptomatic,
          riskFactors,
          patient,
        }, { timeout: 3500 });

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      } catch (err) {
        console.warn('Backend qPCR no disponible o error de red. Utilizando motor de inferencia local:', err.message);
      }
    }

    // Fallback local garantizado con algoritmo de atribución idéntico
    const cuadroHem = patient?.cuadroHematico || {};
    const autoFindingsFromCuadro = [];
    if (cuadroHem.hematocrito && parseFloat(cuadroHem.hematocrito) < (norm(species).includes('felin') ? 25 : 37)) {
      autoFindingsFromCuadro.push('Anemia');
    }
    if (cuadroHem.plaquetas && parseInt(cuadroHem.plaquetas, 10) < 180000) {
      autoFindingsFromCuadro.push('Trombocitopenia');
    }
    if (cuadroHem.leucocitos && parseInt(cuadroHem.leucocitos, 10) > 17000) {
      autoFindingsFromCuadro.push('Leucocitosis');
    }
    if (cuadroHem.observaciones) {
      autoFindingsFromCuadro.push(cuadroHem.observaciones);
    }

    const rawTokens = [...(findings || []), ...(symptoms || []), ...autoFindingsFromCuadro].filter(Boolean);
    const uniqueRawTokens = Array.from(new Set(rawTokens));
    const syndsNorm = (syndromes || []).map(norm);
    const specNorm = norm(species);

    const effectiveRiskFactors = {
      ...(patient?.riskFactors || {}),
      ...(riskFactors || {}),
    };

    // Residencia del tutor (evaluación epidemiológica geográfica)
    const ownerCity = patient?.owner?.city || patient?.ownerCity || patient?.city || patient?.residencia || riskFactors?.city || '';
    const ownerAddress = patient?.owner?.address || patient?.ownerAddress || '';
    const combinedResidenceText = `${ownerCity} ${ownerAddress}`.trim();
    const residenceInfo = parseResidenceEpidemiology(combinedResidenceText);

    // Edad del paciente y clasificación etaria clínica (Pediátrico / Adulto / Geriátrico)
    const ageInfo = parseAgeStage(patient?.age || patient?.edad, patient?.birthDate || patient?.fechaNacimiento);

    const hasTicksRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      residenceInfo.isWarmOrVectorZone ||
      (effectiveRiskFactors.otherRiskFactors && norm(effectiveRiskFactors.otherRiskFactors).includes('garrapata'))
    );

    const hasFleasRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      residenceInfo.isWarmOrVectorZone ||
      (effectiveRiskFactors.otherRiskFactors && norm(effectiveRiskFactors.otherRiskFactors).includes('pulga'))
    );

    const hasWaterOrRuralRisk = Boolean(
      effectiveRiskFactors.outdoorWater ||
      effectiveRiskFactors.ruralAccess ||
      residenceInfo.isRural ||
      (effectiveRiskFactors.housingArea && norm(effectiveRiskFactors.housingArea).includes('rural')) ||
      (effectiveRiskFactors.housingType && norm(effectiveRiskFactors.housingType).includes('finca'))
    );

    const travelDetailsNorm = norm(effectiveRiskFactors.recentTravelDetails || '');
    const hasTravelToMosquitoZone = Boolean(
      effectiveRiskFactors.recentTravel &&
      (travelDetailsNorm.includes('barranquilla') ||
       travelDetailsNorm.includes('costa') ||
       travelDetailsNorm.includes('llanos') ||
       travelDetailsNorm.includes('uraba') ||
       travelDetailsNorm.includes('caribe') ||
       travelDetailsNorm.includes('filaria') ||
       travelDetailsNorm.includes('cali') ||
       travelDetailsNorm.includes('monteria'))
    );

    return LOCAL_PROFILES
      .filter((p) => {
        const pSpec = norm(p.species);
        return pSpec === 'ambos' || pSpec === specNorm || (specNorm.includes('canin') && pSpec.includes('canin')) || (specNorm.includes('felin') && pSpec.includes('felin'));
      })
      .map((p) => {
        const pSynds = p.syndromes.map(norm);
        const matchedSyndromes = syndsNorm.filter((s) => pSynds.some((ps) => matchSyndromeTokens(s, ps)));

        const resolvedAgents = (p.agentIds || [])
          .map((id) => LOCAL_AGENTS.find((a) => a.id === id))
          .filter(Boolean);

        const symptomAttribution = [];
        const coveredSymptomsCount = new Set();
        const matchedAgentNames = new Set();

        uniqueRawTokens.forEach((symptomToken) => {
          const normToken = norm(symptomToken);
          const explainingAgents = [];

          resolvedAgents.forEach((agent) => {
            let matchedExplanation = null;
            if (agent.symptomExplanations) {
              for (const [key, explanation] of Object.entries(agent.symptomExplanations)) {
                const normKey = norm(key);
                if (normToken.includes(normKey) || normKey.includes(normToken)) {
                  matchedExplanation = explanation;
                  break;
                }
              }
            }

            if (!matchedExplanation) {
              const hasKeyword = (agent.keywords || []).some((kw) => {
                const normKw = norm(kw);
                return normToken.includes(normKw) || normKw.includes(normToken);
              });
              if (hasKeyword) {
                matchedExplanation = `Asociado al cuadro clínico de ${agent.name} (${(agent.symptomsDescription || '').slice(0, 100)}...).`;
              }
            }

            if (matchedExplanation) {
              explainingAgents.push({
                agentId: agent.id,
                agentName: agent.name,
                group: agent.group,
                explanation: matchedExplanation,
                labDetail: agent.labDescription,
                targetOrgans: agent.targetOrgans,
              });
              matchedAgentNames.add(agent.name);
              coveredSymptomsCount.add(normToken);
            }
          });

          if (explainingAgents.length > 0) {
            symptomAttribution.push({
              symptom: symptomToken,
              explainingAgents,
            });
          }
        });

        let score = 45;
        if (matchedSyndromes.length > 0) score += 32;
        if (isAsymptomatic) {
          score = p.type === 'Amplio' ? 95 : 88;
        } else if (uniqueRawTokens.length > 0) {
          score += Math.round((coveredSymptomsCount.size / uniqueRawTokens.length) * 18);
        } else if (matchedSyndromes.length > 0) {
          score = p.type === 'Amplio' ? 94 : 87;
        }

        let epidemiologicalAlert = null;
        if (resolvedAgents.some((a) => a.group === 'LEPTOSPIRA') && hasWaterOrRuralRisk) {
          score += 5;
          epidemiologicalAlert = 'Paciente con exposición a aguas/lodo o entorno rural; alta correlación epidemiológica con Leptospira spp.';
        }
        if (resolvedAgents.some((a) => a.group === 'NEMÁTODOS' || (a.id && a.id.includes('wolbachia'))) && hasTravelToMosquitoZone) {
          score += 5;
          epidemiologicalAlert = 'Paciente con historial de viaje a zona de impacto filarial/costera; alta correlación con Dirofilaria immitis y Wolbachia.';
        }
        const hasTickAgents = resolvedAgents.some((a) => (a.vectors || []).includes('garrapata'));
        if (hasTickAgents && hasTicksRisk) {
          score += 3;
          if (!epidemiologicalAlert) {
            epidemiologicalAlert = 'Paciente con exposición a garrapatas; alta sospecha de agentes hemotrópicos vectoriales.';
          }
        }
        const hasFleaAgents = resolvedAgents.some((a) => (a.vectors || []).includes('pulga'));
        if (hasFleaAgents && hasFleasRisk) {
          score += 3;
        }

        // Bonificación por residencia del tutor en zona de alta presión vectorial
        const hasDirofilaria = resolvedAgents.some((a) => a.group === 'NEMÁTODOS' || (a.id && a.id.includes('wolbachia')));
        if (residenceInfo.isWarmOrVectorZone && (hasTickAgents || hasFleaAgents || hasDirofilaria)) {
          score += 4;
          if (!epidemiologicalAlert) {
            epidemiologicalAlert = `Residencia del tutor en ${residenceInfo.cityName || 'zona cálida/vectorial'}: predisposición epidemiológica a hemotrópicos y filarias.`;
          }
        }

        // Bonificación por residencia o entorno rural (Leptospira)
        if (residenceInfo.isRural && resolvedAgents.some((a) => a.group === 'LEPTOSPIRA')) {
          score += 4;
          if (!epidemiologicalAlert) {
            epidemiologicalAlert = `Residencia en entorno rural/finca (${residenceInfo.cityName}): riesgo incrementado de Leptospira spp.`;
          }
        }

        // Bonificación por clasificación etaria (Edad del paciente)
        const hasViralOrPediatricTarget = resolvedAgents.some((a) => {
          const agNorm = norm(a.name || '');
          return agNorm.includes('parvo') || agNorm.includes('moquillo') || agNorm.includes('distemper') ||
                 agNorm.includes('adeno') || agNorm.includes('corona') || agNorm.includes('calici') ||
                 agNorm.includes('panleuco') || agNorm.includes('herpes');
        });

        if (ageInfo.isPediatric) {
          if (hasViralOrPediatricTarget || p.type === 'Amplio') {
            score += 4;
          }
        } else if (ageInfo.isSenior) {
          if (p.type === 'Amplio' || (matchedSyndromes.length > 0 && hasTickAgents)) {
            score += 4;
          }
        }

        if (matchedAgentNames.size >= 2) {
          score = Math.min(99, score + 2);
        }
        score = Math.min(99, Math.max(50, score));

        let clinicalRationale = '';
        if (isAsymptomatic) {
          clinicalRationale = `Tamizaje molecular preventivo para paciente asintomático (${species}) enfocado en patógenos de la base de datos clínica.`;
        } else if (symptomAttribution.length > 0) {
          clinicalRationale = `Explica ${symptomAttribution.length} de los signos clínicos reportados a través de ${Array.from(matchedAgentNames).slice(0, 3).join(', ')} según la base de datos oficial.`;
        } else if (matchedSyndromes.length > 0) {
          clinicalRationale = `Recomendado para el abordaje de síndrome ${p.syndromes.join(' / ')} en ${species}.`;
        } else {
          clinicalRationale = 'Panel de diagnóstico molecular qPCR.';
        }

        // Matiz clínico por edad
        if (ageInfo.isPediatric) {
          clinicalRationale += ` Priorizado por etapa pediátrica (${ageInfo.display}) con mayor susceptibilidad infecciosa.`;
        } else if (ageInfo.isSenior) {
          clinicalRationale += ` Considera factores de paciente senior (${ageInfo.display}) para descartar reactivación o cronicidad.`;
        }

        // Matiz clínico por residencia
        if (residenceInfo.isWarmOrVectorZone && (hasTickAgents || hasFleaAgents || hasDirofilaria)) {
          clinicalRationale += ` Ajustado por residencia en ${residenceInfo.cityName} (presión vectorial activa).`;
        }

        const agentNames = (resolvedAgents.length > 0)
          ? resolvedAgents.map((a) => a.name)
          : (p.agents && p.agents.length > 0 ? p.agents : []);

        return {
          ...p,
          price: p.basePrice,
          agents: agentNames,
          matchPercentage: `${score}%`,
          rawScore: score,
          matchedSyndromes,
          symptomAttribution,
          matchedAgents: Array.from(matchedAgentNames),
          clinicalRationale,
          epidemiologicalAlert,
        };
      })
      .sort((a, b) => b.rawScore - a.rawScore);
  },

  /**
   * Obtiene la base de datos de agentes infecciosos oficiales sincronizados desde Kea Tools
   */
  async getAgents(params = {}) {
    if (API_BASE_URL) {
      try {
        const response = await axios.get(`${API_BASE_URL}/agents`, { params, timeout: 3500 });
        if (response.data?.success && Array.isArray(response.data?.data)) {
          return response.data.data;
        }
      } catch (_) {}
    }

    const now = Date.now();
    if (cachedAgentsMemory && (now - lastAgentsFetchTimestamp < 5 * 60 * 1000)) {
      return cachedAgentsMemory;
    }

    try {
      const res = await fetch(KEA_AGENTES_URL, {
        headers: {
          'Authorization': `Bearer ${KEA_AGENTES_TOKEN}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        const d = await res.json();
        const records = Array.isArray(d) ? d : (d.data || d.records || []);
        if (Array.isArray(records) && records.length > 0) {
          const mapped = records.map((rec) => {
            const rawId = String(rec.ID_AGENTE || rec.id || '').trim();
            const aplId = rawId.startsWith('APL-') ? rawId : `APL-${String(rec.id || 1).padStart(3, '0')}`;
            const localMatch = LOCAL_AGENTS.find((a) => a.id === aplId || a.idAgente === aplId) || {};
            return {
              ...localMatch,
              id: aplId,
              idAgente: aplId,
              name: String(rec.NOMBRE || localMatch.name || '').trim(),
              sampleType: String(rec.TIPO_MUESTRA || localMatch.sampleType || 'Sangre EDTA').trim(),
              tipoMuestra: String(rec.TIPO_MUESTRA || localMatch.tipoMuestra || 'Sangre EDTA').trim(),
              matrix: String(rec.TIPO_MUESTRA || localMatch.matrix || 'Sangre EDTA').trim(),
              diagnosticMethods: String(rec.TIPO_MUESTRA || localMatch.diagnosticMethods || 'Sangre EDTA').trim(),
              estado: String(rec.ESTADO || 'activo').toLowerCase(),
            };
          });
          cachedAgentsMemory = mapped;
          lastAgentsFetchTimestamp = now;
          return mapped;
        }
      }
    } catch (err) {
      console.warn('[qpcrApi] No se pudo consultar ZZ_PLAT_AGENTE directamente, usando catálogo local:', err.message);
    }

    return LOCAL_AGENTS;
  },
};

export default qpcrApi;
