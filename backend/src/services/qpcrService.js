/**
 * Servicio de Filtrado Inteligente y Causalidad de Perfiles qPCR - VetLab
 * Cruza la sintomatología, hallazgos de laboratorio clínico, especie (gato o perro),
 * síndromes y factores de riesgo epidemiológicos según la Base de Datos Oficial en Excel.
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

export const qpcrService = {
  /**
   * Obtiene todos los agentes infecciosos de la base de conocimiento oficial
   */
  getAllAgents() {
    return INFECTIOUS_AGENTS_DB;
  },

  /**
   * Obtiene todos los perfiles qPCR enriquecidos con sus agentes completos
   * Soporta filtrado opcional por síndrome clínico, especie y búsqueda textual
   */
  getAllProfiles({ syndrome, species, search } = {}) {
    let profiles = QPCR_PROFILES_MASTER.map((profile) => {
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
          normalizeText(p.description).includes(q) ||
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
  filterProfiles({
    syndromes = [],
    findings = [],
    symptoms = [],
    species = 'Canino',
    isAsymptomatic = false,
    riskFactors = {},
    patient = null,
  }) {
    const rawTokens = [...(findings || []), ...(symptoms || [])].filter(Boolean);
    const uniqueRawTokens = Array.from(new Set(rawTokens));
    const selectedSyndromesNorm = (syndromes || []).map(normalizeText);
    const speciesNorm = normalizeText(species);

    // Factores de riesgo consolidados (de los argumentos o de la ficha del paciente)
    const effectiveRiskFactors = {
      ...(patient?.riskFactors || {}),
      ...(riskFactors || {}),
    };

    const hasTicksRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      (effectiveRiskFactors.otherRiskFactors && normalizeText(effectiveRiskFactors.otherRiskFactors).includes('garrapata'))
    );

    const hasFleasRisk = Boolean(
      effectiveRiskFactors.parasiteExposure ||
      (effectiveRiskFactors.otherRiskFactors && normalizeText(effectiveRiskFactors.otherRiskFactors).includes('pulga'))
    );

    const hasWaterOrRuralRisk = Boolean(
      effectiveRiskFactors.outdoorWater ||
      effectiveRiskFactors.ruralAccess ||
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

    const scoredProfiles = QPCR_PROFILES_MASTER.map((profile) => {
      // 1. COMPATIBILIDAD ESTRICTA DE ESPECIE (Canino vs Felino)
      const profileSpeciesNorm = normalizeText(profile.species);
      const isSpeciesMatch =
        profileSpeciesNorm === 'ambos' ||
        profileSpeciesNorm === speciesNorm ||
        (speciesNorm.includes('canin') && profileSpeciesNorm.includes('canin')) ||
        (speciesNorm.includes('felin') && profileSpeciesNorm.includes('felin'));

      if (!isSpeciesMatch) {
        return null;
      }

      // 2. COINCIDENCIA DE SÍNDROMES CLÍNICOS
      const profileSyndromesNorm = profile.syndromes.map(normalizeText);
      const matchedSyndromes = selectedSyndromesNorm.filter((s) =>
        profileSyndromesNorm.some((ps) => matchSyndromeTokens(s, ps))
      );

      // 3. RESOLUCIÓN DE AGENTES ESPECÍFICOS DE ESTE PERFIL
      const resolvedAgents = (profile.agentIds || [])
        .map((agentId) => INFECTIOUS_AGENTS_DB.find((a) => a.id === agentId))
        .filter(Boolean);

      const agentNames = resolvedAgents.map((a) => a.name);

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
            const hasKeyword = agent.keywords.some((kw) => {
              const normKw = normalizeText(kw);
              return normToken.includes(normKw) || normKw.includes(normToken);
            });

            if (hasKeyword) {
              matchedExplanation = `Asociado al cuadro clínico de ${agent.name} (${agent.symptomsDescription.slice(0, 110)}...).`;
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
      const hasDirofilariaInProfile = resolvedAgents.some((a) => a.group === 'NEMÁTODOS' || a.id.includes('wolbachia'));
      if (hasDirofilariaInProfile && hasTravelToMosquitoZone) {
        finalPercentage += 5;
        epidemiologicalAlert = 'Paciente con historial de viaje a zona de impacto filarial/costera; alta correlación con Dirofilaria immitis y Wolbachia.';
      }

      // Riesgo de garrapatas (Rickettsiales, Babesia, Hepatozoon)
      const hasTickAgents = resolvedAgents.some((a) => a.vectors.includes('garrapata'));
      if (hasTickAgents && hasTicksRisk) {
        finalPercentage += 3;
        if (!epidemiologicalAlert) {
          epidemiologicalAlert = 'Paciente con exposición reportada a garrapatas (Rhipicephalus/Amblyomma); indicado para patógenos vectoriales.';
        }
      }

      // Riesgo de pulgas (Bartonella, Rickettsia felis, Mycoplasma felino)
      const hasFleaAgents = resolvedAgents.some((a) => a.vectors.includes('pulga'));
      if (hasFleaAgents && hasFleasRisk) {
        finalPercentage += 3;
      }

      // Toxoplasma con convivencia felina
      const hasToxoplasmaInProfile = resolvedAgents.some((a) => a.id === 'toxoplasma-gondii');
      if (hasToxoplasmaInProfile && (hasCatCohabitation || speciesNorm.includes('felin'))) {
        finalPercentage += 2;
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
