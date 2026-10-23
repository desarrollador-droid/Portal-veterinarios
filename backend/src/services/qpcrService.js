/**
 * Servicio de Filtrado Inteligente y Causalidad de Perfiles qPCR - VetLab
 * Cruza la sintomatología, hallazgos de laboratorio clínico y síndromes
 * EXCLUSIVAMENTE con la información de los 12 agentes de la tabla.
 */

import { INFECTIOUS_AGENTS_DB, QPCR_PROFILES_MASTER } from '../models/qpcrKnowledgeBase.js';

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
  if ((sNorm.includes('digestiv') || sNorm.includes('hepatic') || sNorm.includes('icter')) &&
      (psNorm.includes('digestiv') || psNorm.includes('hepatic') || psNorm.includes('icter'))) {
    return true;
  }
  // Soporte para nefrológico y renal
  if ((sNorm.includes('nefro') || sNorm.includes('renal')) &&
      (psNorm.includes('nefro') || psNorm.includes('renal'))) {
    return true;
  }
  const roots = ['derm', 'cutan', 'piel', 'cardio', 'oftalm', 'ocul', 'neuro', 'hemotrop', 'icter', 'digest', 'hepat', 'nefro', 'renal', 'respirat', 'filar', 'infecc'];
  for (const root of roots) {
    if (sNorm.includes(root) && psNorm.includes(root)) return true;
  }
  return false;
}

export const qpcrService = {
  /**
   * Obtiene todos los agentes infecciosos de la base de conocimiento oficial
   */
  getAllAgents() {
    return INFECTIOUS_AGENTS_DB;
  },

  /**
   * Obtiene todos los perfiles qPCR enriquecidos con sus agentes completos
   */
  getAllProfiles() {
    return QPCR_PROFILES_MASTER.map((profile) => {
      const resolvedAgents = (profile.agentIds || []).map((agentId) => {
        const found = INFECTIOUS_AGENTS_DB.find((a) => a.id === agentId);
        return found ? found.name : agentId;
      });

      return {
        ...profile,
        agents: resolvedAgents,
        price: profile.basePrice,
      };
    });
  },

  /**
   * Filtra perfiles y genera la atribución causal: "¿A qué se deben los síntomas del paciente?"
   */
  filterProfiles({ syndromes = [], findings = [], symptoms = [], species = 'Canino', isAsymptomatic = false }) {
    const rawTokens = [...(findings || []), ...(symptoms || [])].filter(Boolean);
    const uniqueRawTokens = Array.from(new Set(rawTokens));
    const selectedSyndromesNorm = (syndromes || []).map(normalizeText);
    const speciesNorm = normalizeText(species);

    const scoredProfiles = QPCR_PROFILES_MASTER.map((profile) => {
      // 1. Compatibilidad estricta de especie
      const profileSpeciesNorm = normalizeText(profile.species);
      const isSpeciesMatch =
        profileSpeciesNorm === 'ambos' ||
        profileSpeciesNorm === speciesNorm ||
        (speciesNorm.includes('canin') && profileSpeciesNorm.includes('canin')) ||
        (speciesNorm.includes('felin') && profileSpeciesNorm.includes('felin'));

      if (!isSpeciesMatch) {
        return null;
      }

      // 2. Coincidencia de Síndromes
      const profileSyndromesNorm = profile.syndromes.map(normalizeText);
      const matchedSyndromes = selectedSyndromesNorm.filter((s) =>
        profileSyndromesNorm.some((ps) => matchSyndromeTokens(s, ps))
      );

      // 3. Resolución de agentes específicos de este perfil
      const resolvedAgents = (profile.agentIds || [])
        .map((agentId) => INFECTIOUS_AGENTS_DB.find((a) => a.id === agentId))
        .filter(Boolean);

      const agentNames = resolvedAgents.map((a) => a.name);

      // 4. ATRIBUCIÓN CAUSAL: ¿A qué se deben estos síntomas en el paciente?
      // Analizamos cada síntoma reportado contra los agentes de este perfil
      const symptomAttribution = [];
      const matchedAgentNames = new Set();
      const coveredSymptomsCount = new Set();

      uniqueRawTokens.forEach((symptomToken) => {
        const normToken = normalizeText(symptomToken);
        const explainingAgents = [];

        resolvedAgents.forEach((agent) => {
          // Revisamos si el síntoma coincide con las explicaciones específicas o keywords
          let matchedExplanation = null;

          if (agent.symptomExplanations) {
            for (const [key, explanation] of Object.entries(agent.symptomExplanations)) {
              const normKey = normalizeText(key);
              if (normToken.includes(normKey) || normKey.includes(normToken)) {
                matchedExplanation = explanation;
                break;
              }
            }
          }

          // Si no tiene explicación directa en el mapa pero está en sus keywords
          if (!matchedExplanation) {
            const hasKeyword = agent.keywords.some((kw) => {
              const normKw = normalizeText(kw);
              return normToken.includes(normKw) || normKw.includes(normToken);
            });

            if (hasKeyword) {
              matchedExplanation = `Asociado al cuadro clínico reportado en ${agent.name} (${agent.symptomsDescription.slice(0, 90)}...).`;
            }
          }

          if (matchedExplanation) {
            explainingAgents.push({
              agentId: agent.id,
              agentName: agent.name,
              explanation: matchedExplanation,
              labDetail: agent.labDescription,
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

      // 5. Cálculo del Porcentaje de Coincidencia (Match Score)
      let finalPercentage = 50;

      // Bono por síndrome clínico
      if (matchedSyndromes.length > 0) {
        finalPercentage += 30;
      }

      // Bono por síntomas explicados o modo asintomático
      if (isAsymptomatic) {
        finalPercentage = profile.type === 'Amplio' ? 96 : 90;
      } else if (uniqueRawTokens.length > 0) {
        const coverageRatio = coveredSymptomsCount.size / uniqueRawTokens.length;
        finalPercentage += Math.round(coverageRatio * 18);
      } else {
        // En consulta general (sin síntomas ingresados aún)
        if (matchedSyndromes.length > 0) {
          finalPercentage = profile.type === 'Amplio' ? 95 : 88;
        }
      }

      // Ponderación por profundidad de patógenos diana
      if (matchedAgentNames.size >= 2) {
        finalPercentage = Math.min(99, finalPercentage + 2);
      }

      finalPercentage = Math.min(99, Math.max(50, finalPercentage));

      // 6. Generación del Rationale Clínico explicativo
      let clinicalRationale = '';
      if (isAsymptomatic) {
        clinicalRationale = `Tamizaje molecular preventivo para paciente asintomático (Panel ${profile.type}).`;
      } else if (symptomAttribution.length > 0) {
        const agentHighlights = Array.from(matchedAgentNames).slice(0, 3).join(', ');
        clinicalRationale = `Explica ${symptomAttribution.length} de los síntomas reportados a través de ${agentHighlights} según la tabla clínica.`;
      } else if (matchedSyndromes.length > 0) {
        clinicalRationale = `Panel indicado para el síndrome clínico ${profile.syndromes.join(' / ')}.`;
      } else {
        clinicalRationale = `Panel especializado de diagnóstico molecular por qPCR.`;
      }

      return {
        id: profile.id,
        title: profile.title,
        species: profile.species,
        type: profile.type,
        basePrice: profile.basePrice,
        price: profile.basePrice,
        discount: profile.discount,
        sampleSummary: profile.sampleSummary,
        samples: profile.samples,
        syndromes: profile.syndromes,
        agents: agentNames,
        description: profile.description,
        matchPercentage: `${finalPercentage}%`,
        rawScore: finalPercentage,
        matchedSyndromes,
        symptomAttribution, // "¿A qué se deben los síntomas del paciente?"
        totalReportedSymptoms: uniqueRawTokens.length,
        coveredSymptomsCount: coveredSymptomsCount.size,
        matchedAgents: Array.from(matchedAgentNames),
        clinicalRationale,
      };
    }).filter(Boolean);

    // Ordenar de mayor a menor coincidencia
    scoredProfiles.sort((a, b) => b.rawScore - a.rawScore);

    return scoredProfiles;
  },
};

export default qpcrService;
