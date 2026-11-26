/**
 * Servicio de Filtrado Inteligente y Causalidad de Perfiles qPCR - VetLab
 * Cruza la sintomatología, hallazgos de laboratorio clínico, especie (gato o perro),
 * síndromes y factores de riesgo epidemiológicos según la Base de Datos Oficial en Excel.
 */

import { INFECTIOUS_AGENTS_DB, OFFICIAL_KEA_AGENTS_DB, QPCR_PROFILES_MASTER, QPCR_GENERAL_OBSERVATION } from '../models/qpcrKnowledgeBase.js';
import { keaService } from './keaService.js';

let cachedSynchronizedProfiles = null;
let lastSyncTimestamp = 0;
let cachedSynchronizedAgents = null;
let lastAgentsSyncTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de caché en memoria

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchSyndromeTokens(sNorm, psNorm) {
  if (!sNorm || !psNorm) return false;
  if (sNorm.includes(psNorm) || psNorm.includes(sNorm)) return true;

  // Soporte bidireccional digestivo-hepático e ictérico
  if (
    (sNorm.includes('digestiv') || sNorm.includes('hepatic') || sNorm.includes('icter')) &&
    (psNorm.includes('digestiv') || psNorm.includes('hepatic') || psNorm.includes('icter'))
  ) {
    return true;
  }

  // Soporte para nefrológico y renal
  if (
    (sNorm.includes('nefro') || sNorm.includes('renal')) &&
    (psNorm.includes('nefro') || psNorm.includes('renal'))
  ) {
    return true;
  }

  const roots = [
    'derm', 'cutan', 'piel', 'cardio', 'oftalm', 'ocul', 'neuro',
    'hemotrop', 'icter', 'digest', 'hepat', 'nefro', 'renal', 'respirat',
    'filar', 'infecc', 'muscul', 'articul'
  ];

  for (const root of roots) {
    if (sNorm.includes(root) && psNorm.includes(root)) return true;
  }
  return false;
}

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
  const norm = String(cityOrAddress).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const vectorZones = [
    'barranquilla', 'cartagena', 'santa marta', 'monteria', 'sincelejo', 'valledupar', 'riohacha',
    'uraba', 'cali', 'palmira', 'tulua', 'buenaventura', 'girardot', 'melgar', 'flandes', 'neiva',
    'ibague', 'espinal', 'villavicencio', 'yopal', 'llanos', 'bucaramanga', 'cucuta', 'barrancabermeja',
    'medellin', 'bello', 'itagui', 'envigado', 'antioquia', 'costa', 'caribe', 'pacifico', 'calido',
    'tropical', 'tolima', 'huila', 'valle', 'sucre', 'cordoba', 'cesar', 'magdalena', 'bolivar', 'atlantico',
    'guajira', 'meta', 'casanare', 'santander', 'norte de santander', 'pereira', 'armenia'
  ];

  const ruralKeywords = ['rural', 'finca', 'vereda', 'corregimiento', 'granja', 'hacienda', 'parcela', 'campo'];

  const isWarmOrVectorZone = vectorZones.some((vz) => norm.includes(vz));
  const isRural = ruralKeywords.some((rk) => norm.includes(rk));
  const matchedZone = vectorZones.find((vz) => norm.includes(vz)) || null;

  return {
    isWarmOrVectorZone,
    isRural,
    matchedZone,
    cityName: String(cityOrAddress).trim(),
  };
}

export const qpcrService = {
  /**
   * Obtiene la observación general preanalítica y clínica
   */
  getGeneralObservation() {
    return QPCR_GENERAL_OBSERVATION;
  },

  /**
   * Obtiene los agentes oficiales sincronizados desde Kea Tools (ZZ_PLAT_AGENTE) con caché y fallback canónico
   */
  async getSynchronizedAgents(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && cachedSynchronizedAgents && (now - lastAgentsSyncTimestamp < CACHE_TTL_MS)) {
      return cachedSynchronizedAgents;
    }

    try {
      const liveAgents = await keaService.fetchAgentsFromKea();
      if (Array.isArray(liveAgents) && liveAgents.length > 0) {
        cachedSynchronizedAgents = liveAgents;
        lastAgentsSyncTimestamp = now;
        return cachedSynchronizedAgents;
      }
    } catch (err) {
      console.warn('[qpcrService] Error sincronizando agentes con Kea DB, usando base local:', err.message);
    }

    if (cachedSynchronizedAgents) {
      return cachedSynchronizedAgents;
    }

    // Fallback canónico oficial de los 34 agentes vinculados
    cachedSynchronizedAgents = OFFICIAL_KEA_AGENTS_DB || INFECTIOUS_AGENTS_DB;
    lastAgentsSyncTimestamp = now;
    return cachedSynchronizedAgents;
  },

  /**
   * Obtiene todos los agentes infecciosos oficiales de la plataforma
   */
  async getAllAgents({ species, group, search, forceRefresh = false } = {}) {
    const masterAgents = await this.getSynchronizedAgents(forceRefresh);
    let agents = [...masterAgents];

    if (species && species !== 'all') {
      const specNorm = normalizeText(species);
      agents = agents.filter((a) => {
        const aSpecies = (a.species || []).map((s) => normalizeText(s));
        if (specNorm.includes('canin')) return aSpecies.some((s) => s.includes('canin'));
        if (specNorm.includes('felin')) return aSpecies.some((s) => s.includes('felin'));
        if (specNorm.includes('amb')) return aSpecies.length > 1 || aSpecies.some((s) => s.includes('amb'));
        return true;
      });
    }

    if (group && group !== 'all') {
      const groupNorm = normalizeText(group);
      agents = agents.filter((a) => normalizeText(a.group || '') === groupNorm);
    }

    if (search && search.trim()) {
      const q = normalizeText(search);
      agents = agents.filter((a) => {
        return (
          (a.id && normalizeText(a.id).includes(q)) ||
          normalizeText(a.name || '').includes(q) ||
          normalizeText(a.group || '').includes(q) ||
          normalizeText(a.sampleType || a.tipoMuestra || '').includes(q) ||
          normalizeText(a.targetOrgans || '').includes(q) ||
          normalizeText(a.symptomsDescription || '').includes(q) ||
          (a.profiles || []).some((p) => normalizeText(p.title || '').includes(q) || normalizeText(p.code || '').includes(q))
        );
      });
    }

    return agents;
  },

  /**
   * Obtiene los perfiles sincronizados desde Kea Tools (ZZ_PLAT_PERFIL) con caché y fallback canónico
   */
  async getSynchronizedProfiles(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && cachedSynchronizedProfiles && (now - lastSyncTimestamp < CACHE_TTL_MS)) {
      return cachedSynchronizedProfiles;
    }

    try {
      const liveProfiles = await keaService.fetchPerfilesFromKea();
      if (Array.isArray(liveProfiles) && liveProfiles.length > 0) {
        cachedSynchronizedProfiles = liveProfiles;
        lastSyncTimestamp = now;
        return cachedSynchronizedProfiles;
      }
    } catch (err) {
      console.warn('[qpcrService] Error sincronizando con Kea DB, usando base local:', err.message);
    }

    if (cachedSynchronizedProfiles) {
      return cachedSynchronizedProfiles;
    }

    // Fallback canónico oficial
    const allAgentsMaster = [...(OFFICIAL_KEA_AGENTS_DB || []), ...(INFECTIOUS_AGENTS_DB || [])];
    cachedSynchronizedProfiles = QPCR_PROFILES_MASTER.map((profile) => {
      let resolvedAgents = [];
      if (profile.agentIds && profile.agentIds.length > 0) {
        resolvedAgents = profile.agentIds.map((agentId) => {
          const found = allAgentsMaster.find((a) => a.id === agentId || a.code === agentId);
          return found ? found.name : agentId;
        }).filter(Boolean);
      }

      if (resolvedAgents.length === 0 && Array.isArray(profile.agents) && profile.agents.length > 0) {
        resolvedAgents = profile.agents;
      }

      return {
        ...profile,
        agents: (resolvedAgents && resolvedAgents.length > 0) ? resolvedAgents : (profile.agents || []),
        price: profile.basePrice || profile.price,
      };
    });
    lastSyncTimestamp = now;
    return cachedSynchronizedProfiles;
  },

  /**
   * Obtiene todos los perfiles qPCR enriquecidos con sus agentes completos
   * Soporta filtrado opcional por síndrome clínico, especie y búsqueda textual
   */
  async getAllProfiles({ syndrome, species, search, forceRefresh = false } = {}) {
    const masterProfiles = await this.getSynchronizedProfiles(forceRefresh);
    let profiles = [...masterProfiles];

    if (species && species !== 'all') {
      const specNorm = normalizeText(species);
      profiles = profiles.filter((p) => {
        const pSpec = normalizeText(p.species || '');
        if (specNorm.includes('canin')) return pSpec.includes('canin') || pSpec.includes('amb');
        if (specNorm.includes('felin')) return pSpec.includes('felin') || pSpec.includes('amb');
        if (specNorm.includes('amb')) return pSpec.includes('amb');
        return true;
      });
    }

    if (syndrome && syndrome !== 'all') {
      const synNorm = normalizeText(syndrome);
      profiles = profiles.filter((p) => {
        return (p.syndromes || []).some((s) => matchSyndromeTokens(normalizeText(s), synNorm));
      });
    }

    if (search && search.trim()) {
      const q = normalizeText(search);
      profiles = profiles.filter((p) => {
        return (
          normalizeText(p.title).includes(q) ||
          normalizeText(p.code || '').includes(q) ||
          normalizeText(p.nombrePlataformaPropuesto || '').includes(q) ||
          normalizeText(p.nombreCesar || '').includes(q) ||
          normalizeText(p.description).includes(q) ||
          normalizeText(p.matrix || '').includes(q) ||
          (p.agents || []).some((ag) => normalizeText(ag).includes(q)) ||
          (p.syndromes || []).some((syn) => normalizeText(syn).includes(q))
        );
      });
    }

    return profiles;
  },

  /**
   * Filtra perfiles y genera la atribución causal: "¿A qué se deben los síntomas del paciente?"
   * Tomando en cuenta todos los parámetros de la base de datos:
   * - Especie (Canino vs Felino)
   * - Síndromes clínicos seleccionados
   * - Síntomas y signos observados
   * - Hallazgos de laboratorio clínico
   * - Factores de riesgo epidemiológicos (vectores, hábitat, viajes, aguas, convivencia)
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
    const cuadroHem = patient?.cuadroHematico || {};
    const autoFindingsFromCuadro = [];
    if (cuadroHem.hematocrito && parseFloat(cuadroHem.hematocrito) < (normalizeText(species).includes('felin') ? 25 : 37)) {
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
    const selectedSyndromesNorm = (syndromes || []).map(normalizeText);
    const speciesNorm = normalizeText(species);

    // Factores de riesgo consolidados (de los argumentos o de la ficha del paciente)
    const effectiveRiskFactors = {
      ...(patient?.riskFactors || {}),
      ...(riskFactors || {}),
    };

    // Residencia del tutor (evaluación epidemiológica de vectores y entornos rurales)
    const ownerCity = patient?.owner?.city || patient?.ownerCity || patient?.city || patient?.residencia || riskFactors?.city || '';
    const ownerAddress = patient?.owner?.address || patient?.ownerAddress || '';
    const combinedResidenceText = `${ownerCity} ${ownerAddress}`.trim();
    const residenceInfo = parseResidenceEpidemiology(combinedResidenceText);

    // Edad del paciente y clasificación etaria clínica (Pediátrico / Adulto / Geriátrico)
    const ageInfo = parseAgeStage(patient?.age || patient?.edad, patient?.birthDate || patient?.fechaNacimiento);

    const hasTicksRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      residenceInfo.isWarmOrVectorZone ||
      (effectiveRiskFactors.otherRiskFactors && normalizeText(effectiveRiskFactors.otherRiskFactors).includes('garrapata'))
    );

    const hasFleasRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      residenceInfo.isWarmOrVectorZone ||
      (effectiveRiskFactors.otherRiskFactors && normalizeText(effectiveRiskFactors.otherRiskFactors).includes('pulga'))
    );

    const hasWaterOrRuralRisk = Boolean(
      effectiveRiskFactors.outdoorWater ||
      effectiveRiskFactors.ruralAccess ||
      residenceInfo.isRural ||
      (effectiveRiskFactors.housingArea && normalizeText(effectiveRiskFactors.housingArea).includes('rural')) ||
      (effectiveRiskFactors.housingType && normalizeText(effectiveRiskFactors.housingType).includes('finca'))
    );

    const travelDetailsNorm = normalizeText(effectiveRiskFactors.recentTravelDetails || '');
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

    const hasCatCohabitation = Boolean(
      effectiveRiskFactors.livesWithOtherAnimals &&
      ((effectiveRiskFactors.cohabitingSpecies && effectiveRiskFactors.cohabitingSpecies.some((s) => normalizeText(s).includes('felin') || normalizeText(s).includes('gato'))) ||
       (effectiveRiskFactors.otherRiskFactors && normalizeText(effectiveRiskFactors.otherRiskFactors).includes('gato')))
    );

    const masterProfiles = await this.getSynchronizedProfiles();
    const masterAgents = await this.getSynchronizedAgents();

    const scoredProfiles = masterProfiles.map((profile) => {
      // 1. COMPATIBILIDAD ESTRICTA DE ESPECIE (Canino vs Felino)
      const profileSpeciesNorm = normalizeText(profile.species);
      const isSpeciesMatch =
        profileSpeciesNorm === 'ambos' ||
        profileSpeciesNorm.includes('amb') ||
        profileSpeciesNorm === speciesNorm ||
        (speciesNorm.includes('canin') && profileSpeciesNorm.includes('canin')) ||
        (speciesNorm.includes('felin') && profileSpeciesNorm.includes('felin'));

      if (!isSpeciesMatch) {
        return null;
      }

      // 2. COINCIDENCIA DE SÍNDROMES CLÍNICOS
      const profileSyndromesNorm = (profile.syndromes || []).map(normalizeText);
      const matchedSyndromes = selectedSyndromesNorm.filter((s) =>
        profileSyndromesNorm.some((ps) => matchSyndromeTokens(s, ps))
      );

      // 3. RESOLUCIÓN DE AGENTES ESPECÍFICOS DE ESTE PERFIL
      const allAgentsPool = [...(masterAgents || []), ...(OFFICIAL_KEA_AGENTS_DB || []), ...(INFECTIOUS_AGENTS_DB || [])];
      let resolvedAgents = [];
      if (profile.agentIds && profile.agentIds.length > 0) {
        resolvedAgents = profile.agentIds.map((agentId) => {
          return allAgentsPool.find((a) => a.id === agentId || a.code === agentId);
        }).filter(Boolean);
      }

      if (resolvedAgents.length === 0 && Array.isArray(profile.agents) && profile.agents.length > 0) {
        resolvedAgents = profile.agents.map((agName) => {
          const cleanName = agName.replace(/\(.*?\)/g, '').trim().toLowerCase();
          const found = allAgentsPool.find((a) => {
            const aName = (a.name || '').toLowerCase();
            return aName === cleanName || aName.includes(cleanName) || cleanName.includes(aName);
          });
          return found || {
            id: agName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: agName,
            group: 'Infeccioso',
            targetOrgans: 'Sistémico',
            transmission: 'Contacto / Vectorial',
            symptomsDescription: '',
            labDescription: '',
            keywords: [agName.toLowerCase()],
            vectors: [],
          };
        });
      }

      const agentNames = resolvedAgents.length > 0
        ? resolvedAgents.map((a) => a.name)
        : (profile.agents && profile.agents.length > 0 ? profile.agents : []);

      // 4. ATRIBUCIÓN CAUSAL: ¿A qué se deben estos síntomas en el paciente?
      const symptomAttribution = [];
      const matchedAgentNames = new Set();
      const coveredSymptomsCount = new Set();

      uniqueRawTokens.forEach((symptomToken) => {
        const normToken = normalizeText(symptomToken);
        const explainingAgents = [];

        resolvedAgents.forEach((agent) => {
          let matchedExplanation = null;

          // Búsqueda en explicaciones directas
          if (agent.symptomExplanations) {
            for (const [key, explanation] of Object.entries(agent.symptomExplanations)) {
              const normKey = normalizeText(key);
              if (normToken.includes(normKey) || normKey.includes(normToken)) {
                matchedExplanation = explanation;
                break;
              }
            }
          }

          // Búsqueda en palabras clave del agente si no hubo coincidencia directa
          if (!matchedExplanation) {
            const hasKeyword = (agent.keywords || []).some((kw) => {
              const normKw = normalizeText(kw);
              return normToken.includes(normKw) || normKw.includes(normToken);
            });

            if (hasKeyword) {
              matchedExplanation = `Asociado al cuadro clínico de ${agent.name} (${(agent.symptomsDescription || '').slice(0, 110)}...).`;
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

      // 5. CÁLCULO DEL SCORE DE COINCIDENCIA (%)
      let finalPercentage = 45;

      // Ponderación por síndromes clínicos seleccionados
      if (matchedSyndromes.length > 0) {
        finalPercentage += 32;
      }

      // Ponderación por síntomas clínicos cubiertos
      if (isAsymptomatic) {
        finalPercentage = profile.type === 'Amplio' ? 95 : 88;
      } else if (uniqueRawTokens.length > 0) {
        const coverageRatio = coveredSymptomsCount.size / uniqueRawTokens.length;
        finalPercentage += Math.round(coverageRatio * 18);
      } else if (matchedSyndromes.length > 0) {
        finalPercentage = profile.type === 'Amplio' ? 94 : 87;
      }

      // 6. BONIFICACIONES POR FACTORES DE RIESGO EPIDEMIOLÓGICOS DEL EXCEL
      let epidemiologicalAlert = null;

      // Riesgo de Leptospira (agua estancada, lodo, roedores, rural)
      const hasLeptospiraInProfile = resolvedAgents.some((a) => a.group === 'LEPTOSPIRA');
      if (hasLeptospiraInProfile && hasWaterOrRuralRisk) {
        finalPercentage += 5;
        epidemiologicalAlert = 'Paciente con exposición a aguas/lodo o entorno rural; alta correlación epidemiológica con Leptospira spp.';
      }

      // Riesgo de Filarias / Dirofilaria (viajes a la costa, mosquitos)
      const hasDirofilariaInProfile = resolvedAgents.some((a) => a.group === 'NEMÁTODOS' || (a.id && a.id.includes('wolbachia')));
      if (hasDirofilariaInProfile && hasTravelToMosquitoZone) {
        finalPercentage += 5;
        epidemiologicalAlert = 'Paciente con historial de viaje a zona de impacto filarial/costera; alta correlación con Dirofilaria immitis y Wolbachia.';
      }

      // Riesgo de garrapatas (Rickettsiales, Babesia, Hepatozoon)
      const hasTickAgents = resolvedAgents.some((a) => (a.vectors || []).includes('garrapata'));
      if (hasTickAgents && hasTicksRisk) {
        finalPercentage += 3;
        if (!epidemiologicalAlert) {
          epidemiologicalAlert = 'Paciente con exposición reportada a garrapatas (Rhipicephalus/Amblyomma); indicado para patógenos vectoriales.';
        }
      }

      // Riesgo de pulgas (Bartonella, Rickettsia felis, Mycoplasma felino)
      const hasFleaAgents = resolvedAgents.some((a) => (a.vectors || []).includes('pulga'));
      if (hasFleaAgents && hasFleasRisk) {
        finalPercentage += 3;
      }

      // Toxoplasma con convivencia felina
      const hasToxoplasmaInProfile = resolvedAgents.some((a) => a.id === 'toxoplasma-gondii');
      if (hasToxoplasmaInProfile && (hasCatCohabitation || speciesNorm.includes('felin'))) {
        finalPercentage += 2;
      }

      // Bonificación por Residencia del Tutor en zona de alta presión vectorial
      if (residenceInfo.isWarmOrVectorZone && (hasTickAgents || hasFleaAgents || hasDirofilariaInProfile)) {
        finalPercentage += 4;
        if (!epidemiologicalAlert) {
          epidemiologicalAlert = `Residencia del tutor en ${residenceInfo.cityName || 'zona cálida/vectorial'}: predisposición epidemiológica a hemotrópicos (Ehrlichia, Babesia, Anaplasma, Hepatozoon) y filarias.`;
        }
      }

      // Bonificación por Residencia o acceso a entorno rural (Leptospira)
      if (residenceInfo.isRural && hasLeptospiraInProfile) {
        finalPercentage += 4;
        if (!epidemiologicalAlert) {
          epidemiologicalAlert = `Residencia en entorno rural/finca (${residenceInfo.cityName}): riesgo incrementado de Leptospira spp. por exposición ambiental.`;
        }
      }

      // Bonificación por Clasificación Etaria (Edad del paciente)
      const hasViralOrPediatricTarget = resolvedAgents.some((a) => {
        const agNorm = normalizeText(a.name || '');
        return agNorm.includes('parvo') || agNorm.includes('moquillo') || agNorm.includes('distemper') ||
               agNorm.includes('adeno') || agNorm.includes('corona') || agNorm.includes('calici') ||
               agNorm.includes('panleuco') || agNorm.includes('herpes');
      });

      if (ageInfo.isPediatric) {
        // Pediátrico (< 12 meses): alta susceptibilidad inmune a virus y cuadros agudos
        if (hasViralOrPediatricTarget || profile.type === 'Amplio') {
          finalPercentage += 4;
        }
      } else if (ageInfo.isSenior) {
        // Geriátrico (≥ 8 años): inmunosenescencia y reactivación de hemotrópicos crónicos
        if (profile.type === 'Amplio' || (matchedSyndromes.length > 0 && hasTickAgents)) {
          finalPercentage += 4;
        }
      }

      // Bono por profundidad diagnóstica de patógenos diana coincidentes
      if (matchedAgentNames.size >= 2) {
        finalPercentage += 2;
      }

      // Limitar el porcentaje en rango 50% - 99%
      finalPercentage = Math.min(99, Math.max(50, finalPercentage));

      // 7. RATIONALE CLÍNICO
      let clinicalRationale = '';
      if (isAsymptomatic) {
        clinicalRationale = `Tamizaje molecular preventivo para paciente asintomático (${species}) enfocado en patógenos de la base de datos clínica.`;
      } else if (symptomAttribution.length > 0) {
        const agentHighlights = Array.from(matchedAgentNames).slice(0, 3).join(', ');
        clinicalRationale = `Explica ${symptomAttribution.length} de los signos clínicos reportados a través de ${agentHighlights} según la base de datos oficial.`;
      } else if (matchedSyndromes.length > 0) {
        clinicalRationale = `Panel indicado para el síndrome clínico ${profile.syndromes.join(' / ')} en ${species}.`;
      } else {
        clinicalRationale = `Panel especializado de diagnóstico molecular por qPCR.`;
      }

      // Matiz clínico por edad en el rationale
      if (ageInfo.isPediatric) {
        clinicalRationale += ` Priorizado por etapa pediátrica (${ageInfo.display}) con mayor susceptibilidad infecciosa.`;
      } else if (ageInfo.isSenior) {
        clinicalRationale += ` Considera factores de inmunosenescencia en paciente senior (${ageInfo.display}) para descartar reactivación o cronicidad.`;
      }

      // Matiz clínico por residencia en el rationale
      if (residenceInfo.isWarmOrVectorZone && (hasTickAgents || hasFleaAgents || hasDirofilariaInProfile)) {
        clinicalRationale += ` Ajustado por residencia en ${residenceInfo.cityName} (presión vectorial activa).`;
      }

      return {
        ...profile,
        price: profile.basePrice || profile.price,
        priceFormatted: profile.priceFormatted || (profile.price > 0 ? `$${profile.price.toLocaleString('es-CO')}` : 'Por cotizar'),
        agents: agentNames,
        resolvedAgentsData: resolvedAgents.map((a) => ({
          id: a.id,
          name: a.name,
          group: a.group,
          targetOrgans: a.targetOrgans,
          diagnosticMethods: a.diagnosticMethods,
        })),
        description: profile.description,
        matchPercentage: `${finalPercentage}%`,
        rawScore: finalPercentage,
        matchedSyndromes,
        symptomAttribution, // "¿A qué se deben los síntomas del paciente?"
        totalReportedSymptoms: uniqueRawTokens.length,
        coveredSymptomsCount: coveredSymptomsCount.size,
        matchedAgents: Array.from(matchedAgentNames),
        clinicalRationale,
        epidemiologicalAlert,
      };
    }).filter(Boolean);

    // Ordenar de mayor a menor coincidencia
    scoredProfiles.sort((a, b) => b.rawScore - a.rawScore);

    return scoredProfiles;
  },
};

export default qpcrService;
