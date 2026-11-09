// Servicio de integración con Kea Tools Database API
// Documentación de referencia: https://docs.kea.tools/docs/databases/api/

import dotenv from 'dotenv';
import { calculateAgeFromBirthDate } from '../models/patientModel.js';

dotenv.config();

const DEFAULT_KEA_URL = process.env.KEA_BASE_URL || 'https://osd.kea.tools/api/v1/databases/PACIENTE';
const DEFAULT_KEA_TOKEN = process.env.KEA_API_TOKEN || '';

/**
 * Normaliza nombres de campo para búsqueda flexible (sin tildes, minúsculas, sin espacios ni guiones)
 */
const normalizeKey = (key) => {
  return String(key || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Busca un valor en un objeto de registro de Kea usando variantes de nombre de campo
 */
const getFieldValue = (record, ...candidateKeys) => {
  if (!record || typeof record !== 'object') return undefined;

  // 1. Coincidencia exacta
  for (const key of candidateKeys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  // 2. Coincidencia normalizada
  const normalizedKeys = candidateKeys.map(normalizeKey);
  for (const [propKey, propVal] of Object.entries(record)) {
    if (normalizedKeys.includes(normalizeKey(propKey))) {
      return propVal;
    }
  }

  return undefined;
};

/**
 * Interpreta valores booleanos comunes en formularios (Sí/No, true/false, 1/0)
 */
const parseBoolean = (val, defaultVal = false) => {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'boolean') return val;
  const str = String(val).trim().toLowerCase();
  if (['si', 'sí', 'true', '1', 'yes'].includes(str)) return true;
  if (['no', 'false', '0'].includes(str)) return false;
  return defaultVal;
};

/**
 * Mapea un registro devuelto por Kea Tools al formato estándar de Paciente del Portal Veterinario
 */
export const mapKeaRecordToPatient = (record, index = 0) => {
  const rawId = getFieldValue(record, 'CODIGO_PACIENTE', 'Código del paciente', 'codigo_paciente', 'codigoDelPaciente', 'id', 'codigo');
  const patientId = rawId
    ? (String(rawId).startsWith('PAC-') ? String(rawId) : `PAC-${String(rawId)}`)
    : `PAC-KEA-${index + 1}`;

  const fullName = String(getFieldValue(record, 'NOMBRE', 'Nombre', 'nombre_paciente', 'nombre') || 'Paciente sin nombre').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Paciente';
  const lastName = nameParts.slice(1).join(' ') || '';

  const rawSpecies = String(getFieldValue(record, 'ESPECIE', 'Especie', 'especie') || 'Canino').trim();
  const otherSpecies = String(getFieldValue(record, 'ESPECIE_OTRO', 'Otra especie', 'otra_especie') || '').trim();
  const species = rawSpecies.toLowerCase().includes('otro') && otherSpecies ? otherSpecies : rawSpecies;

  const breed = String(getFieldValue(record, 'RAZA', 'Raza', 'raza') || 'Mestizo').trim();
  const rawSex = String(getFieldValue(record, 'SEXO', 'Sexo', 'sexo') || 'No especificado').trim();
  const sex = rawSex.toLowerCase().startsWith('h') ? 'Hembra' : (rawSex.toLowerCase().startsWith('m') ? 'Macho' : rawSex);

  const rawWeight = getFieldValue(record, 'PESO_KG', 'Peso', 'peso', 'PESO');
  const weight = rawWeight !== undefined && rawWeight !== null && rawWeight !== '' ? `${rawWeight} kg` : 'Sin registrar';

  const rawBirthDate = getFieldValue(record, 'FECHA_NACIMIENTO', 'Fecha de nacimiento', 'fecha_nacimiento');
  const birthDate = rawBirthDate ? String(rawBirthDate).split('T')[0] : '';

  const rawAge = getFieldValue(record, 'EDAD', 'Edad', 'edad');
  let age = 'No especificada';
  if (birthDate) {
    age = calculateAgeFromBirthDate(birthDate);
  } else if (rawAge !== undefined && rawAge !== null && rawAge !== '') {
    age = typeof rawAge === 'number' ? `${rawAge} ${rawAge === 1 ? 'año' : 'años'}` : String(rawAge);
  }

  const rawVet = String(getFieldValue(record, 'VETERINARIO', 'VETERINARIO_ACTUAL', 'Veterinario actual', 'Veterinario', 'veterinario_actual', 'veterinario') || 'Dr. Asignado').trim();
  const rawVeterinariaNit = String(getFieldValue(record, 'VETERINARIA', 'Veterinaria', 'veterinaria', 'nit') || '#nit-1').trim();
  const rawOwner = getFieldValue(record, 'PROPIETARIO', 'Propietario', 'propietario', 'tutor');
  const ownerName = rawOwner !== undefined && rawOwner !== null && rawOwner !== '' ? String(rawOwner).trim() : 'Tutor no registrado';
  const microchip = String(getFieldValue(record, 'MICROCHIP', 'Microchip', 'microchip') || 'Sin microchip').trim();

  const isSterilized = parseBoolean(getFieldValue(record, 'ESTERILIZADO', 'Esterilizado', 'esterilizado'));
  const isAsymptomatic = parseBoolean(getFieldValue(record, 'ASINTOMATICO', 'Asintomático', 'asintomatico', 'asintomático'));
  const rawSymptoms = getFieldValue(record, 'SINTOMAS', 'Síntomas', 'sintomas') || '';
  const bodyCondition = String(getFieldValue(record, 'CONDICION_CORPORAL', 'Condición corporal', 'condicion_corporal') || '3/5').trim();

  const hasAllergiesRaw = parseBoolean(getFieldValue(record, 'ALERGIAS', 'Alergias conocidas', 'alergias_conocidas'));
  const allergiesRaw = String(getFieldValue(record, 'ALERGIAS_CUAL', '¿Cuáles alergias?', 'cuales_alergias', 'alergias') || '').trim();
  const isNegativeAllergy = !allergiesRaw || [
    'sin alergias', 'sin alergias conocidas', 'ninguna', 'ninguna conocida', 
    'ninguna reportada', 'no', 'no reporta', 'no presenta', 'n/a', 'negativo'
  ].includes(allergiesRaw.toLowerCase()) || allergiesRaw.toLowerCase().startsWith('sin ') || allergiesRaw.toLowerCase().startsWith('no ');
  const hasAllergies = (hasAllergiesRaw || !isNegativeAllergy) && !isNegativeAllergy && allergiesRaw !== '';
  const allergies = hasAllergies ? allergiesRaw : '';

  const recentTravel = parseBoolean(getFieldValue(record, 'VIAJE_EXTERIOR', 'Ha viajado al exterior', 'viajado_exterior'));
  const lastVisitedCountry = String(getFieldValue(record, 'ULTIMO_PAIS_VISITADO', 'último pais visitado', 'ultimo_pais_visitado', 'pais_visitado') || '').trim();

  const status = String(getFieldValue(record, 'ESTADO', 'Estado del registro', 'estado_registro', 'status') || 'activo').toLowerCase().trim();
  const clinicalStatus = String(getFieldValue(record, 'ESTADO_CLINICO', 'Estado clinico', 'estado_clinico', 'clinicalStatus') || (isAsymptomatic ? 'Asintomático' : 'Estable')).trim();

  // Asignar avatar visual según especie
  let avatar = '🐾';
  const spLower = species.toLowerCase();
  if (spLower.includes('canin') || spLower.includes('perr') || breed.toLowerCase().includes('labrador')) avatar = '🐕';
  else if (spLower.includes('felin') || spLower.includes('gat')) avatar = '🐱';
  else if (spLower.includes('equin') || spLower.includes('caball')) avatar = '🐴';
  else if (spLower.includes('ave') || spLower.includes('loro')) avatar = '🦜';
  else if (spLower.includes('conejo')) avatar = '🐰';

  const ownerParts = ownerName.split(' ');

  return {
    id: patientId,
    keaRecordId: record.id || null,
    name: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    avatar,
    species,
    otherSpecies,
    breed,
    sex,
    birthDate,
    age,
    weight,
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: rawVeterinariaNit.startsWith('#') ? rawVeterinariaNit : `#nit-${rawVeterinariaNit}`,
    microchip: microchip || 'Sin microchip',
    owner: {
      name: ownerName,
      firstName: ownerParts[0] || ownerName,
      lastName: ownerParts.slice(1).join(' ') || '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá',
    },
    riskFactors: {
      habitat: 'Interiores / Mixto',
      recentTravel,
      lastVisitedCountry: lastVisitedCountry || 'Ninguno',
      livesWithOtherAnimals: true,
      ruralAccess: false,
    },
    medicalAdmission: {
      isAsymptomatic,
      symptoms: Array.isArray(rawSymptoms) ? rawSymptoms : (rawSymptoms ? [rawSymptoms] : []),
      bodyCondition: bodyCondition || '3/5',
      generalCondition: clinicalStatus || 'Estable',
      physicalFindings: `Condición corporal ${bodyCondition || '3/5'}, ${clinicalStatus || 'Estable'}.`,
    },
    status: status || 'activo',
    isSterilized,
    hasAllergies,
    allergies: hasAllergies ? allergies : '',
    attendingVet: rawVet || 'Dr. Asignado',
    lastVisit: new Date().toLocaleDateString('es-CO'),
    source: 'Kea Tools DB',
  };
};

export const keaService = {
  getConfig() {
    return {
      baseUrl: process.env.KEA_BASE_URL || DEFAULT_KEA_URL,
      hasToken: Boolean(process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN),
    };
  },

  /**
   * Realiza la llamada HTTP a Kea Tools y extrae la lista de registros
   */
  async fetchPatientsFromKea(customUrl, customToken) {
    const url = (customUrl || process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '') + '/records';
    const token = customToken || process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_API_TOKEN (Bearer token de OAuth).');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.code) {
      const err = new Error(data.message || `Error HTTP ${response.status} de Kea Tools`);
      err.code = data.code || `HTTP_${response.status}`;
      err.status = response.status;
      err.details = data;
      throw err;
    }

    // Kea puede responder con un array directo, o un objeto con { data: [...] }, { records: [...] }, o { rows: [...] }
    let rawRecords = [];
    if (Array.isArray(data)) {
      rawRecords = data;
    } else if (Array.isArray(data.data)) {
      rawRecords = data.data;
    } else if (Array.isArray(data.records)) {
      rawRecords = data.records;
    } else if (Array.isArray(data.rows)) {
      rawRecords = data.rows;
    }

    const mappedPatients = rawRecords.map((rec, i) => mapKeaRecordToPatient(rec, i));

    return {
      success: true,
      count: mappedPatients.length,
      patients: mappedPatients,
      raw: data,
    };
  },

  /**
   * Diagnóstico del estado de la conexión a Kea Tools
   */
  async testConnection(customUrl, customToken) {
    const url = (customUrl || process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '') + '/records';
    const token = customToken || process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    try {
      const result = await this.fetchPatientsFromKea(url.replace('/records', ''), token);
      return {
        connected: true,
        status: 'OK',
        message: `Conexión exitosa con Kea Tools. Se obtuvieron ${result.count} registros.`,
        recordCount: result.count,
        sample: result.patients.slice(0, 3),
      };
    } catch (error) {
      if (error.code === 'API_MODE_DISABLED') {
        return {
          connected: false,
          code: 'API_MODE_DISABLED',
          message: 'La base de datos PACIENTE fue encontrada en Kea, pero la opción "Activar API" está desactivada en su panel.',
          instruction: 'Para resolverlo: Ve a Kea Tools > Editar base de datos PACIENTE > Pestaña API > Activa el interruptor "Habilitar integración vía API" y guarda los cambios.',
          details: error.details,
        };
      }
      if (error.status === 401 || error.code === 'UNAUTHORIZED') {
        return {
          connected: false,
          code: 'UNAUTHORIZED',
          message: 'El token de autorización OAuth expiró o no es válido.',
          instruction: 'Genera un nuevo token desde el formulario de la pestaña API de la base de datos en Kea Tools.',
        };
      }
      return {
        connected: false,
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error.details || null,
      };
    }
  },

  /**
   * Crea un nuevo registro de Paciente en Kea Tools vía POST /records
   */
  async createPatientInKea(patientData) {
    const url = (process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '') + '/records';
    const token = process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_API_TOKEN.');
    }

    const patientCode = patientData.id || `PAC-${Date.now().toString().slice(-4)}`;
    const fullName = `${patientData.name || ''} ${patientData.lastName || ''}`.trim() || 'Paciente sin nombre';
    const species = patientData.species || 'Canino';
    const otherSpecies = patientData.otherSpecies || '';
    const breed = patientData.breed || 'Mestizo';
    const sex = (patientData.sex || 'macho').toLowerCase().startsWith('h') ? 'hembra' : 'macho';
    const parsedWeight = parseFloat(String(patientData.weight || '5').replace(/[^0-9.]/g, '')) || 5;
    const parsedAge = parseInt(patientData.age) || 1;
    const birthDateStr = patientData.birthDate
      ? (String(patientData.birthDate).includes('T') ? patientData.birthDate : `${patientData.birthDate}T00:00:00-05:00`)
      : new Date().toISOString();

    const VALID_NITS = ['900000001', '900000002', '900949599', '1000087681'];
    const rawNit = String(patientData.codigoSedeNit || '').replace(/[^0-9]/g, '');
    const nit = VALID_NITS.includes(rawNit) ? rawNit : '900000001';

    // En Kea Tools, 'VETERINARIO' es un campo de relación en desuso que solo acepta IDs específicos (o vacío)
    const knownVets = ['TP-PRUEBA-01', 'TP-PRUEBA-02'];
    const vetValue = knownVets.includes(patientData.attendingVet) ? patientData.attendingVet : '';

    const symptoms = Array.isArray(patientData.medicalAdmission?.symptoms)
      ? patientData.medicalAdmission.symptoms.join(', ')
      : (patientData.symptoms || '');

    // Propietario en Kea es relación foránea obligatoria con la base PROPIETARIO
    const preferredOwner = patientData.owner?.code || patientData.ownerCode || patientData.owner?.documentNumber || patientData.ownerDocumentNumber || patientData.owner?.name || patientData.ownerName || 'PROP-PRUEBA-01';

    const buildPayload = (ownerVal) => ({
      CODIGO_PACIENTE: patientCode,
      NOMBRE: fullName,
      ESPECIE: species,
      ESPECIE_OTRO: otherSpecies,
      RAZA: breed,
      SEXO: sex,
      EDAD: parsedAge,
      PESO_KG: parsedWeight,
      FECHA_NACIMIENTO: birthDateStr,
      VETERINARIO: vetValue,
      PROPIETARIO: ownerVal,
      VETERINARIA: nit,
      ESTADO: patientData.status || 'activo',
      SINTOMAS: symptoms,
      CONDICION_CORPORAL: patientData.medicalAdmission?.bodyCondition || patientData.bodyCondition || '3/5',
      ESTERILIZADO: Boolean(patientData.isSterilized),
      ASINTOMATICO: Boolean(patientData.medicalAdmission?.isAsymptomatic ?? patientData.isAsymptomatic ?? true),
      MICROCHIP: patientData.microchip || '',
      ALERGIAS: Boolean(patientData.hasAllergies),
      ALERGIAS_CUAL: patientData.allergies || '',
      VIAJE_EXTERIOR: Boolean(patientData.riskFactors?.recentTravel ?? patientData.recentTravel),
      ULTIMO_PAIS_VISITADO: patientData.riskFactors?.lastVisitedCountry || '',
      ESTADO_CLINICO: patientData.medicalAdmission?.generalCondition || 'Estable',
    });

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(buildPayload(preferredOwner)),
    });

    let data = await response.json();

    // Si Kea rechaza el Propietario por ser clave foránea que no existe aún en su tabla, reintentar con tutor base 'PROP-PRUEBA-01'
    if (!response.ok && String(data.data?.message || data.message || '').includes('Propietario')) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(buildPayload('PROP-PRUEBA-01')),
      });
      data = await response.json();
    }

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al crear paciente en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const createdRecord = data.data || data;
    return mapKeaRecordToPatient(createdRecord);
  },

  /**
   * Actualiza un registro existente en Kea Tools vía PATCH /records/{id}
   */
  async updatePatientInKea(keaRecordId, updateData) {
    if (!keaRecordId) {
      throw new Error('Se requiere el ID de registro de Kea Tools para actualizar.');
    }

    const url = `${(process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '')}/records/${keaRecordId}`;
    const token = process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    const payload = {};
    if (updateData.weight !== undefined) {
      payload.PESO_KG = parseFloat(String(updateData.weight).replace(/[^0-9.]/g, '')) || 5;
    }
    if (updateData.status !== undefined) {
      payload.ESTADO = updateData.status.toLowerCase();
    }
    if (updateData.isSterilized !== undefined) {
      payload.ESTERILIZADO = Boolean(updateData.isSterilized);
    }
    if (updateData.allergies !== undefined) {
      payload.ALERGIAS = Boolean(updateData.hasAllergies ?? (updateData.allergies && updateData.allergies !== 'Sin alergias'));
      payload.ALERGIAS_CUAL = updateData.allergies;
    }
    if (updateData.medicalAdmission?.bodyCondition || updateData.bodyCondition) {
      payload.CONDICION_CORPORAL = updateData.medicalAdmission?.bodyCondition || updateData.bodyCondition;
    }
    if (updateData.medicalAdmission?.generalCondition || updateData.clinicalStatus) {
      payload.ESTADO_CLINICO = updateData.medicalAdmission?.generalCondition || updateData.clinicalStatus;
    }
    if (updateData.attendingVet) {
      payload.VETERINARIO = updateData.attendingVet;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al actualizar paciente en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const updatedRecord = data.data || data;
    return mapKeaRecordToPatient(updatedRecord);
  },

  /**
   * Elimina un registro en Kea Tools vía DELETE /records/{id} (o borrado lógico PATCH ESTADO: inactivo)
   */
  async deletePatientInKea(keaRecordId) {
    if (!keaRecordId) {
      throw new Error('Se requiere el ID de registro de Kea Tools para eliminar.');
    }

    const url = `${(process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '')}/records/${keaRecordId}`;
    const token = process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    // Si DELETE no está permitido por permisos en Kea (403), marcamos ESTADO: inactivo
    if (!response.ok || data.status === 'error') {
      if (response.status === 403 || data.code === 'FORBIDDEN') {
        return await this.updatePatientInKea(keaRecordId, { status: 'inactivo' });
      }
      const msg = data.data?.message || data.message || `Error al eliminar en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      throw err;
    }

    return { success: true, message: 'Registro eliminado con éxito en Kea Tools' };
  },
};
