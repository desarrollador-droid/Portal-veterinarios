/**
 * Utilidades para verificación y renderizado de alergias en pacientes.
 * Regla de negocio: La alerta de alergia ÚNICAMENTE debe aparecer cuando se
 * haya reportado e identificado una alergia real.
 * Si el paciente no tiene alergias o tiene valores por defecto como
 * "Sin alergias conocidas", "Ninguna", etc., NO se debe mostrar ninguna alerta ni badge de advertencia.
 */

const NEGATIVE_ALLERGY_PHRASES = [
  'sin alergias conocidas',
  'sin alergias',
  'ninguna',
  'ninguna conocida',
  'ninguna reportada',
  'no presenta',
  'no presenta alergias',
  'no reporta',
  'no reporta alergias',
  'no',
  'n/a',
  'negativo',
  'desconocido',
  'ninguno',
  'sin antecedentes',
];

/**
 * Determina si el texto dado corresponde a una frase negativa o ausencia de alergia.
 */
export const isNegativeAllergyText = (text) => {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return true;
  if (NEGATIVE_ALLERGY_PHRASES.includes(trimmed)) return true;
  if (trimmed.startsWith('sin ') || trimmed.startsWith('no ')) return true;
  return false;
};

/**
 * Retorna true ÚNICAMENTE si el paciente tiene una alergia real reportada.
 */
export const hasReportedAllergy = (patient) => {
  if (!patient) return false;

  const raw = patient.allergies;
  const text = (typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.join(', ') : '').trim();

  if (!text) return false;
  if (isNegativeAllergyText(text)) return false;

  // Si explícitamente se marcó como sin alergias
  if (patient.hasAllergies === false) return false;

  return true;
};

/**
 * Retorna el texto legible de la alergia o un texto neutral por defecto.
 */
export const getAllergyDisplay = (patient, defaultFallback = 'Sin alergias conocidas') => {
  if (!hasReportedAllergy(patient)) {
    return defaultFallback;
  }
  if (typeof patient.allergies === 'string') return patient.allergies.trim();
  if (Array.isArray(patient.allergies)) return patient.allergies.filter(Boolean).join(', ');
  return defaultFallback;
};
