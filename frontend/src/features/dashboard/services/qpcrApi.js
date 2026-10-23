import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/qpcr';

/**
 * Normalización de cadenas de texto para búsqueda y emparejamiento clínico
 */
function norm(text) {
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

  if (
    (sNorm.includes('digestiv') || sNorm.includes('hepatic') || sNorm.includes('icter')) &&
    (psNorm.includes('digestiv') || psNorm.includes('hepatic') || psNorm.includes('icter'))
  ) {
    return true;
  }

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

// Re-exportamos la base de datos de agentes y perfiles desde la estructura canónica
export { INFECTIOUS_AGENTS_DB as LOCAL_INFECTIOUS_AGENTS_DB, QPCR_PROFILES_MASTER as LOCAL_QPCR_PROFILES_MASTER } from '../../../../../backend/src/models/qpcrKnowledgeBase.js';
import { INFECTIOUS_AGENTS_DB as LOCAL_AGENTS, QPCR_PROFILES_MASTER as LOCAL_PROFILES } from '../../../../../backend/src/models/qpcrKnowledgeBase.js';

export const qpcrApi = {
  /**
   * Obtiene todos los perfiles qPCR con sus nombres de agentes resueltos
   */
  async getProfiles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/profiles`, { timeout: 3000 });
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }
    } catch (_) {}

    return LOCAL_PROFILES.map((p) => ({
      ...p,
      price: p.basePrice,
      agents: (p.agentIds || []).map((id) => {
        const ag = LOCAL_AGENTS.find((a) => a.id === id);
        return ag ? ag.name : id;
      }),
    }));
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

    // Fallback local garantizado con algoritmo de atribución idéntico
    const rawTokens = [...(findings || []), ...(symptoms || [])].filter(Boolean);
    const uniqueRawTokens = Array.from(new Set(rawTokens));
    const syndsNorm = (syndromes || []).map(norm);
    const specNorm = norm(species);

    const effectiveRiskFactors = {
      ...(patient?.riskFactors || {}),
      ...(riskFactors || {}),
    };

    const hasTicksRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      (effectiveRiskFactors.otherRiskFactors && norm(effectiveRiskFactors.otherRiskFactors).includes('garrapata'))
    );

    const hasFleasRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      (effectiveRiskFactors.otherRiskFactors && norm(effectiveRiskFactors.otherRiskFactors).includes('pulga'))
    );

    const hasWaterOrRuralRisk = Boolean(
      effectiveRiskFactors.outdoorWater ||
      effectiveRiskFactors.ruralAccess ||
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
              const hasKeyword = agent.keywords.some((kw) => {
                const normKw = norm(kw);
                return normToken.includes(normKw) || normKw.includes(normToken);
              });
              if (hasKeyword) {
                matchedExplanation = `Asociado al cuadro clínico de ${agent.name} (${agent.symptomsDescription.slice(0, 100)}...).`;
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
        if (resolvedAgents.some((a) => a.group === 'NEMÁTODOS' || a.id.includes('wolbachia')) && hasTravelToMosquitoZone) {
          score += 5;
          epidemiologicalAlert = 'Paciente con historial de viaje a zona de impacto filarial/costera; alta correlación con Dirofilaria immitis y Wolbachia.';
        }
        if (resolvedAgents.some((a) => a.vectors.includes('garrapata')) && hasTicksRisk) {
          score += 3;
          if (!epidemiologicalAlert) {
            epidemiologicalAlert = 'Paciente con exposición a garrapatas; alta sospecha de agentes hemotrópicos vectoriales.';
          }
        }
        if (resolvedAgents.some((a) => a.vectors.includes('pulga')) && hasFleasRisk) {
          score += 3;
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

        return {
          ...p,
          price: p.basePrice,
          agents: resolvedAgents.map((a) => a.name),
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
   * Obtiene la base de datos de agentes infecciosos
   */
  async getAgents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents`, { timeout: 3000 });
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch (_) {}
    return LOCAL_AGENTS;
  },
};

export default qpcrApi;
