// Servicio de integración con Kea Tools Database API
// Documentación de referencia: https://docs.kea.tools/docs/databases/api/

import dotenv from 'dotenv';
import { calculateAgeFromBirthDate } from '../models/patientModel.js';

dotenv.config();

const DEFAULT_KEA_URL = process.env.KEA_BASE_URL || 'https://osd.kea.tools/api/v1/databases/PACIENTE';
const DEFAULT_KEA_TOKEN = process.env.KEA_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMzQ4NzBlMGU3YTU2ZjFmZjE0ODk2YWFmMjg0NzZjNzBkNjM3ZDc5MmMyOTY4ZjQ4YjZhODBjYjg3NTc1MjcwMjg0YWVjNjQwMzA2ODk4ZWEiLCJpYXQiOjE3OTQyNTU2MzEuMTIyMDA2LCJuYmYiOjE3OTQyNTU2MzEuMTIyMDA5LCJleHAiOjE4MjU3OTE2MzEuMTE1OTk3LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.Lxhv0uyiWUR5RBTia3TIFj0zrF2ZzMsIsVUGEmToW9A6atSKyShg10ODTLs8-gf9ovA4RZpldXDKcqkh5-GbTnnWKzl4ltCFMCN_TolNQnYWHnXPX7PtJhprvzojtg8Ue_ovffXzMS4EVlFl40HG3AJokfw8ZeOv4RRdSn2hA9vfhNBBNKEvQQgWpY6KVobTlpgrGAe7bI5YJFq0yG0Nu3uziE1dXTacVrGxgmMj45dFMR_y9vLIN-rhQBuJWmTl6e1GuzSCnS41JiWXktbHIJKEFCEGtK6P6Hb-XhFscnfrBAxr_-Mh1R3yTrRgYhhpBB4C5Afo9ZcH1j-_3FGFdBHa0P71_sjuw8lPIz6BR9FpybY_tnEV6IlP1e94K2CExS7OvVCc9yFyGPLj18FhICQzQWr9scXCpUMa0WkXiqbgDhgywnTrEvoWHcbWF4iEdNgKGra1u_A3lQlctN6-5GE0fb91qI2gLkXIzLgVkSjEhT3Xi_YNeWfUO3njUuPWZGxcQbAp3InnNiFjIwP27FBORkjAPdaGlouU91w2EE87fEwnpKgQ9fcxeQMLOxQDEiYOHe_uvxDwTgMmqCpEtkuxrZGKw3_ZIiVz2IHSzjSWh-89Xb9cr0kyVrBGIiFlVRLgc1Q3FZuhwG87pjS3Tk4cD6akblkyusWgTxCYiVc';

const DEFAULT_KEA_VET_URL = process.env.KEA_VETERINARIA_URL || 'https://osd.kea.tools/api/v1/databases/VETERINARIA';
const DEFAULT_KEA_VET_TOKEN = process.env.KEA_VETERINARIA_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDliOTRmMzA0Y2Y3MDY0NjI5YTdhZjZmNTYwY2VmNmQxNWZhY2U2YzYwNmRmODg5YmU0NDIzNDJkMmYwMjQ0ZDg3ZjMyMWUxYzdkOWY3NmMiLCJpYXQiOjE3OTQzMjY0OTAuMDU4NzE3LCJuYmYiOjE3OTQzMjY0OTAuMDU4NzIsImV4cCI6MTgyNTg2MjQ5MC4wNTA0Niwic3ViIjoiNCIsInNjb3BlcyI6WyJrZWEuZGF0YWJhc2UiXX0.r6qf2I7oC5LAGX88xIgzgBrO7PcJ9hGBjzaWMoTZixQh-C1eI8UUXLlavrbwSonRWw2RtKMsyr6hORqG93a4G8t3VGoD0m1u7anebHcvXvXE_nkayVCtchMoWZmf6Hdj1poOMsLzwbKggyCiIsL1MPc0P0CsVWUh-lp1Te8-f_5PsmJAb9Kzf4uiPPf8cc-zcwdJ-UUebWpLqW4xks_JFmpcrIwZ-OOBE_xSwe46sTMMuYRi7VMTTs_jFXEi0x-1MSSdoWBq4c9L6nxfN-RKod78MSms7ugPZT-J1D2fAHCMT-hGtci34lAtiOCXJTSlhEw-KlDk2R21UKZkafSlRenPvYj8oICdiepzT5qjlE21L1jmjsoqQTUJhGINzN-FO9RC8KYYtbmoKpsE_03lsQVffFrZ4FVjho5F-B36pN8ydm7DncwfhJxqPbGFRNcd4c-nJbaJZTHs_M7hWX1ppC7VNh6JkLGnPpt-PKWM-Etod7m6hFX6_sn9AebL5WhfFj3rw2xsIkJtgyMw8Z6GHTZ64SWbRn4LwxizSp-Bp9sczQHyt0F3bOddG0-4W-2bxow4kAiaySqTSLIFRo_EuY6aUZOsQ0g_c1YjPU80dYdN6QGF83_8sz3zTEta80gjeu7BRhyVKHxqz3In80QAb8xiWV4hChYZjUqscLEpIGg';

const DEFAULT_KEA_MEDICOS_URL = process.env.KEA_MEDICOS_URL || 'https://osd.kea.tools/api/v1/databases/VETERINARIO';
const DEFAULT_KEA_MEDICOS_TOKEN = process.env.KEA_MEDICOS_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYjdhOGUxOGFmMTAwMzVhNDQxNzcyMjAwNjdmMzNhMWQ2ZjRhZTQ0ZWI3YzY3ODQ4YzdiZmRlZDhhYjEwYTQyZTRmNDY0YjZmMTE5ZmI2YWMiLCJpYXQiOjE3OTQzMzE4OTMuMzE5Mjg0LCJuYmYiOjE3OTQzMzE4OTMuMzE5Mjg3LCJleHAiOjE4MjU4Njc4OTMuMzEyOTQsInN1YiI6IjQiLCJzY29wZXMiOlsia2VhLmRhdGFiYXNlIl19.fAz5YBAaHnHVu9hiHcLnpf-JGuHu4FXcPcphRJ0ZrP3TKmPN06EjRVJs_-49T1wPJOqztJhy7bEOyC6pTobFuVBV8o1eTYdAlbSBiLxzlg-3D6uO3t1TM1RQ9Ekr-i9thZeBt6ddWDdEupC0Z22G21f37Wj_XRIso4sXGXN0k281lLXqHDdoU8sxXRVYk8xZsZ0HlDqB4GqhZPaKveiFALoa8wagoLj9920Uzov_8t6xDVLjXo048_mT-lQPHMk7oXF7E5q9hNXe7oH54o3vFnqmc2AXd-kRaFeLmIFxkFZ2ec2mATbpnc-DLdlx19-cXyVruXRXPvBucBKzxj5VMFM2BQBao4N71Z10nMHACdg37tC_iuYA3tyd0JyARWWJ5PF5k_OSEIwgL2IaLo2vlPIkqYLH6S5ZHF3P6bWbjEPPuepfcem2QwreONdML6yXu94UOsrzSrVZG8Z6zDWB97PRHBPjeIVWrdDShDAhycJBY3H1zJcrKZ73CEXzbFY4EUjUOPv4vk-S_o4MJS9XsxDrKre1PdQacKjTmqAMGAymKti9-LYBBwxnxpkGXcTlmstXv9igoTs0AkZAvzDOl3NiNYhgkFMlpWZY7toGw8C1j_203ebdMyWaQdV3qlrzgDHq7lZw3_-uZXI1sWGmyr3-5UYpWE1kjLYJWg3xN38';

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

  const rawVetParsed = String(getFieldValue(record, 'VETERINARIO', 'VETERINARIO_ACTUAL', 'Veterinario actual', 'Veterinario', 'veterinario_actual', 'veterinario') || '').trim();
  const rawVet = (rawVetParsed && rawVetParsed !== 'Dr. Asignado') ? rawVetParsed : 'Dr. Alejandro Morales';
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
    clinicNit: String(rawVeterinariaNit || '').replace(/[^0-9]/g, '').trim(),
    nit: String(rawVeterinariaNit || '').replace(/[^0-9]/g, '').trim(),
    clinicId: rawVeterinariaNit ? `kea-vet-${String(rawVeterinariaNit).replace(/[^0-9]/g, '').trim()}` : null,
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
      habitat: '',
      recentTravel,
      lastVisitedCountry: lastVisitedCountry || 'Ninguno',
      livesWithOtherAnimals: null,
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

/**
 * Mapea un registro de la tabla VETERINARIA de Kea Tools al formato estándar de Clínica / Médico del Portal
 */
export const mapKeaRecordToClinic = (record, index = 0) => {
  const nit = String(record.NIT || '').trim();
  const nombre = String(record.NOMBRE || 'Clínica Veterinaria').trim();
  const isIndependiente = record.TIPO === 'independiente' || nombre.toLowerCase().startsWith('dr');
  const type = isIndependiente ? 'independiente' : 'veterinaria';
  const obs = String(record.OBSERVACIONES || record.observaciones || '').trim();
  const pwdMatch = obs.match(/\[PWD:([^\]]+)\]/i);
  const contrasenaFromObs = pwdMatch ? pwdMatch[1].trim() : '';

  const contrasena = String(
    record.contrasena ||
    record.CONTRASENA ||
    record.password ||
    record.PASSWORD ||
    record.pin ||
    record.PIN ||
    record.CLAVE ||
    record.clave ||
    contrasenaFromObs ||
    ''
  ).trim();

  return {
    id: `kea-vet-${record.id || index + 1}`,
    keaRecordId: record.id || null,
    type,
    esIndependiente: isIndependiente,
    nit: nit,
    cedula: nit,
    contrasena: contrasena,
    password: contrasena,
    nombreVeterinaria: !isIndependiente ? nombre : '',
    nombreMedico: isIndependiente ? nombre : '',
    directorMedico: {
      nombre: record.NOMBRE_DIRECTOR || (isIndependiente ? nombre : 'Director Médico'),
      telefono: record.TELEFONO_DIRECTOR || record.TELEFONO || '',
    },
    administrativa: {
      nombreResponsable: 'Responsable Administrativo',
      telefonoPagos: record.TELEFONO || '',
    },
    recoleccion: {
      departamento: 'Colombia',
      ciudad: record.CIUDAD || 'Bogotá',
      direccionFisica: record.DIRECCION || '',
      detallesAdicionales: '',
      indicacionesRuta: 'Donde el repartidor recogerá las muestras',
    },
    correos: {
      facturacion: (record.CORREO_FACTURACION || record.EMAIL || '').toLowerCase(),
      resultados: (record.EMAIL || record.CORREO_FACTURACION || '').toLowerCase(),
    },
    documentos: {
      rutNumero: nit,
      rutArchivo: 'RUT_KeaTools.pdf',
    },
    capacitacionOSD: record.CAPACITADO_OSD || 'No',
    capacitacionQpcr: record.CAPACITACION_QPCR || '',
    cantidadVeterinarios: record.NUM_VETERINARIOS || '',
    cuentaConEspecialistas: record.TIENE_ESPECIALISTAS || 'No',
    especialidad: record.ESPECIALIDAD || '',
    especialistas: record.ESPECIALIDAD ? record.ESPECIALIDAD.split(',').map(s => s.trim()) : [],
    frecuenciaPcrMensual: record.FRECUENCIA_PCR_MENSUAL || '',
    medioConocisteOSD: record.MEDIO_CONOCIO_OSD || '',
    observaciones: record.OBSERVACIONES || '',
    estado: record.ESTADO || 'activo',
    estadoCartera: record.ESTADO_CARTERA || 'Habilitado',
    tipoPago: record.TIPO_PAGO || 'contado',
    sedes: [
      {
        id: `sede-kea-${record.id || 1}`,
        nombreSede: `${nombre} - Sede Principal`,
        esPrincipal: true,
        consecutivoNit: 1,
        codigoSedeNit: `#nit-1`,
        departamento: 'Colombia',
        ciudad: record.CIUDAD || 'Bogotá',
        direccionFisica: record.DIRECCION || 'Dirección principal',
        telefonoContacto: record.TELEFONO || '',
        responsableSede: record.NOMBRE_DIRECTOR || nombre,
      }
    ],
    veterinariosAsociados: [],
    source: 'Kea Tools DB',
  };
};

export const KNOWN_KEA_CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga',
  'Cartagena', 'Pereira', 'Manizales', 'Armenia', 'Pasto',
  'Cúcuta', 'Ibagué', 'Villavicencio', 'Montería', 'Santa Marta',
  'Neiva', 'Popayán', 'Valledupar', 'Tunja', 'Sincelejo',
  'Riohacha', 'Florencia', 'Yopal', 'Quibdó', 'Chía', 'Zipaquirá',
  'Sabaneta', 'Bello', 'Itagüí', 'Envigado', 'Rionegro', 'Girón',
  'Piedecuesta', 'Floridablanca', 'Palmira', 'Soacha', 'Facatativá',
  'Bojacá', 'Caldas', 'Cajicá', 'Pitalito', 'Supía', 'Carmen de Viboral',
  'Pamplona', 'Segovia'
];

export const normalizeCityForKea = (cityName) => {
  if (!cityName) return 'Bogotá';
  const clean = String(cityName)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const found = KNOWN_KEA_CITIES.find((c) => {
    const cClean = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return cClean === clean || clean.startsWith(cClean) || clean.includes(cClean);
  });

  return found || 'Bogotá';
};

/**
 * Mapea un registro de la tabla VETERINARIO de Kea Tools al formato estándar de Profesional Asociado
 */
export const mapKeaRecordToVeterinarian = (record, index = 0) => {
  const keaId = record.id || index + 1;
  const nombre = String(record.NOMBRE || record.nombre || 'Médico Veterinario').trim();
  const tarjetaProfesional = String(record.TARJETA_PROFESIONAL || record.tarjetaProfesional || '').trim();
  const cedula = String(record.NIT_CEDULA || record.cedula || '').trim();
  const clinicaNit = String(record.VETERINARIA || record.veterinaria || '').trim();
  const sede = String(record.SEDE || record.sede || 'Sede Principal').trim();
  const email = String(record.EMAIL || record.email || record.CORREO_FACTURACION || '').trim();
  const telefono = String(record.TELEFONO || record.telefono || '').trim();
  const ciudad = String(record.CIUDAD || record.ciudad || '').trim();
  const especialidad = String(record.ESPECIALIDAD || record.especialidad || 'Medicina General').trim();
  const estado = String(record.ESTADO || record.estado || 'activo').toLowerCase();
  const obs = String(record.OBSERVACIONES || record.observaciones || '').trim();
  const pwdMatch = obs.match(/\[PWD:([^\]]+)\]/i);
  const contrasenaFromObs = pwdMatch ? pwdMatch[1].trim() : '';

  const contrasena = String(
    record.contrasena ||
    record.CONTRASENA ||
    record.password ||
    record.PASSWORD ||
    record.pin ||
    record.PIN ||
    record.CLAVE ||
    record.clave ||
    contrasenaFromObs ||
    ''
  ).trim();

  return {
    id: `kea-mv-${keaId}`,
    keaId: keaId,
    nombre,
    tarjetaProfesional,
    cedula,
    contrasena,
    password: contrasena,
    observaciones: obs,
    veterinariaNit: clinicaNit,
    sedeId: 'sede-principal',
    sedeNombre: sede || 'Sede Principal',
    email,
    telefono,
    ciudad,
    especialidad,
    estado: estado === 'inactivo' ? 'inactivo' : (estado === 'bloqueado' ? 'bloqueado' : 'activo'),
    rol: 'veterinario_planta',
    rolNombre: 'Veterinario de Planta',
    esDirector: false,
    fechaVinculacion: record.FECHA_REGISTRO || new Date().toISOString().slice(0, 10),
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

    const rawNit = String(patientData.clinicNit || patientData.nit || patientData.codigoSedeNit || '').replace(/[^0-9]/g, '');
    const nit = rawNit || '900000001';

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
    const mapped = mapKeaRecordToPatient(createdRecord);
    if (patientData.attendingVet) {
      mapped.attendingVet = patientData.attendingVet;
    }
    return mapped;
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

  /**
   * Obtiene la lista de veterinarias y clientes registrados en Kea Tools DB
   * Por defecto obtiene los registros más recientes (al final de la tabla) y los iniciales
   */
  async fetchVeterinariasFromKea({ limit = 100, offset = null, latestFirst = true } = {}) {
    const baseUrl = (process.env.KEA_VETERINARIA_URL || DEFAULT_KEA_VET_URL).replace(/\/$/, '');
    const token = process.env.KEA_VETERINARIA_TOKEN || DEFAULT_KEA_VET_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_VETERINARIA_TOKEN.');
    }

    // 1. Obtener primero el total de registros en la base de datos
    let total = 0;
    try {
      const metaRes = await fetch(`${baseUrl}/records?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const metaData = await metaRes.json();
      total = metaData.meta?.total || 0;
    } catch (_) {}

    // 2. Si latestFirst es true y no se pasó offset, traer los registros más recientes del final de la tabla
    let resolvedOffset = offset;
    if (resolvedOffset === null || resolvedOffset === undefined) {
      if (latestFirst && total > 0) {
        resolvedOffset = Math.max(0, total - limit);
      } else {
        resolvedOffset = 0;
      }
    }

    const url = `${baseUrl}/records?limit=${limit}&offset=${resolvedOffset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      const err = new Error(data.message || `Error HTTP ${response.status} de Kea Tools VETERINARIA`);
      err.status = response.status;
      throw err;
    }

    let rawRecords = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

    // Traer también la primera página para combinar clientes iniciales y evitar omisiones
    if (latestFirst && resolvedOffset > 0) {
      try {
        const firstRes = await fetch(`${baseUrl}/records?limit=100&offset=0`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        const firstData = await firstRes.json();
        const firstRecs = Array.isArray(firstData.data) ? firstData.data : [];
        const seenIds = new Set(rawRecords.map((r) => r.id));
        for (const fr of firstRecs) {
          if (!seenIds.has(fr.id)) {
            rawRecords.push(fr);
            seenIds.add(fr.id);
          }
        }
      } catch (_) {}
    }

    const mappedClinics = rawRecords.map((rec, i) => mapKeaRecordToClinic(rec, i));

    return {
      success: true,
      count: mappedClinics.length,
      total: total || data.meta?.total || mappedClinics.length,
      clinics: mappedClinics,
      raw: data,
    };
  },

  /**
   * Crea un nuevo registro de Veterinaria / Cliente directamente en la BD Kea Tools vía POST /records
   */
  async createVeterinariaInKea(clinicData) {
    const url = `${(process.env.KEA_VETERINARIA_URL || DEFAULT_KEA_VET_URL).replace(/\/$/, '')}/records`;
    const token = process.env.KEA_VETERINARIA_TOKEN || DEFAULT_KEA_VET_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_VETERINARIA_TOKEN.');
    }

    const isIndep = Boolean(
      clinicData.type === 'independiente' ||
      clinicData.nombreEmpresa?.toLowerCase().startsWith('dr') ||
      clinicData.nombreVeterinaria?.toLowerCase().startsWith('dr')
    );

    const cleanNit = String(clinicData.nit || clinicData.cedula || '').replace(/[^0-9]/g, '').trim();
    const nombre = (clinicData.nombreEmpresa || clinicData.nombreVeterinaria || clinicData.nombreMedico || '').trim();
    const contrasena = (clinicData.contrasena || clinicData.password || clinicData.pin || '').trim();
    const email = (clinicData.correoFacturacion || clinicData.correos?.facturacion || clinicData.correos?.resultados || '').trim().toLowerCase();
    const telefono = (clinicData.telefonoPagos || clinicData.administrativa?.telefonoPagos || clinicData.telefonoDirectorMedico || clinicData.directorMedico?.telefono || '').trim();
    const keaCiudad = normalizeCityForKea(clinicData.ciudad || clinicData.recoleccion?.ciudad);
    const direccion = (clinicData.direccionFisica || clinicData.recoleccion?.direccionFisica || '').trim();
    const nombreDirector = (clinicData.nombreDirectorMedico || clinicData.directorMedico?.nombre || nombre).trim();
    const telefonoDirector = (clinicData.telefonoDirectorMedico || clinicData.directorMedico?.telefono || telefono).trim();

    const rawObs = String(clinicData.observaciones || '').trim();
    const obsWithPwd = contrasena 
      ? (rawObs.includes('[PWD:') ? rawObs.replace(/\[PWD:[^\]]+\]/i, `[PWD:${contrasena}]`) : (rawObs ? `[PWD:${contrasena}] ${rawObs}` : `[PWD:${contrasena}]`))
      : rawObs;

    const payload = {
      NIT: cleanNit,
      NOMBRE: nombre,
      EMAIL: email,
      CORREO_FACTURACION: email,
      TELEFONO: telefono,
      CIUDAD: keaCiudad,
      DIRECCION: direccion,
      NOMBRE_DIRECTOR: nombreDirector,
      TELEFONO_DIRECTOR: telefonoDirector,
      CAPACITADO_OSD: clinicData.capacitacionOSD || 'No',
      CAPACITACION_QPCR: clinicData.capacitacionQpcr === 'Otro' ? `Otro: ${clinicData.capacitacionQpcrOtro || ''}` : (clinicData.capacitacionQpcr || ''),
      NUM_VETERINARIOS: clinicData.cantidadVeterinarios || '',
      TIENE_ESPECIALISTAS: clinicData.cuentaConEspecialistas || (Array.isArray(clinicData.especialistas) && clinicData.especialistas.length > 0 ? 'Sí' : 'No'),
      ESPECIALIDAD: Array.isArray(clinicData.especialistas) ? clinicData.especialistas.join(', ') : (clinicData.especialistas || ''),
      FRECUENCIA_PCR_MENSUAL: clinicData.frecuenciaPcrMensual || '',
      MEDIO_CONOCIO_OSD: clinicData.medioConocisteOSD || '',
      OBSERVACIONES: obsWithPwd,
      ESTADO: 'activo',
      TIPO: isIndep ? 'independiente' : 'clinica',
      ESTADO_CARTERA: 'Habilitado',
      TIPO_PAGO: 'contado',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al crear veterinaria en Kea Tools (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const createdRecord = data.data || data;
    return mapKeaRecordToClinic(createdRecord);
  },

  /**
   * Obtiene la lista de médicos veterinarios registrados en la tabla VETERINARIO de Kea Tools DB
   * Opcionalmente filtrados por la clínica (NIT)
   */
  async fetchVeterinariosFromKea({ limit = 100, offset = 0, clinicNit = null } = {}) {
    const baseUrl = (process.env.KEA_MEDICOS_URL || DEFAULT_KEA_MEDICOS_URL).replace(/\/$/, '');
    const token = process.env.KEA_MEDICOS_TOKEN || DEFAULT_KEA_MEDICOS_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_MEDICOS_TOKEN.');
    }

    const url = `${baseUrl}/records?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      const err = new Error(data.message || `Error HTTP ${response.status} de Kea Tools VETERINARIO`);
      err.status = response.status;
      throw err;
    }

    const rawRecords = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    let mapped = rawRecords.map((rec, i) => mapKeaRecordToVeterinarian(rec, i));

    if (clinicNit) {
      const cleanTargetNit = String(clinicNit).replace(/[^0-9]/g, '');
      mapped = mapped.filter((v) => {
        const vNit = String(v.veterinariaNit || '').replace(/[^0-9]/g, '');
        return vNit && vNit === cleanTargetNit;
      });
    }

    return {
      success: true,
      count: mapped.length,
      total: data.meta?.total || mapped.length,
      veterinarians: mapped,
      raw: data,
    };
  },

  /**
   * Registra un nuevo médico veterinario en la tabla VETERINARIO de Kea Tools DB y lo asocia al NIT de la clínica
   */
  async createVeterinarioInKea(vetData, clinicNit) {
    const url = `${(process.env.KEA_MEDICOS_URL || DEFAULT_KEA_MEDICOS_URL).replace(/\/$/, '')}/records`;
    const token = process.env.KEA_MEDICOS_TOKEN || DEFAULT_KEA_MEDICOS_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_MEDICOS_TOKEN.');
    }

    const cleanNit = String(clinicNit || vetData.veterinariaNit || '').replace(/[^0-9]/g, '').trim();
    const rawPass = String(vetData.password || vetData.contrasena || vetData.pin || '').trim();
    const rawObs = String(vetData.observaciones || '').trim();
    const observacionesWithPwd = rawPass 
      ? (rawObs.includes('[PWD:') ? rawObs.replace(/\[PWD:[^\]]+\]/i, `[PWD:${rawPass}]`) : (rawObs ? `[PWD:${rawPass}] ${rawObs}` : `[PWD:${rawPass}]`))
      : rawObs;

    const payload = {
      NOMBRE: (vetData.nombre || '').trim(),
      TARJETA_PROFESIONAL: (vetData.tarjetaProfesional || '').trim(),
      NIT_CEDULA: String(vetData.cedula || '').replace(/[^0-9]/g, '').trim(),
      VETERINARIA: cleanNit,
      SEDE: '', // Omitido/vacío para cumplir restricción FK de Kea
      TELEFONO: String(vetData.telefono || '').trim(),
      EMAIL: (vetData.email || '').trim().toLowerCase(),
      CORREO_FACTURACION: (vetData.correoFacturacion || vetData.email || '').trim().toLowerCase(),
      CIUDAD: (vetData.ciudad || '').trim(),
      ESPECIALIDAD: (vetData.especialidad || 'Medicina General').trim(),
      ESTADO: vetData.estado || 'activo',
      OBSERVACIONES: observacionesWithPwd,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al crear veterinario en Kea Tools (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const createdRecord = data.data || data;
    return mapKeaRecordToVeterinarian(createdRecord);
  },

  /**
   * Actualiza los datos de un médico veterinario en Kea Tools DB vía PATCH /records/{id}
   */
  async updateVeterinarioInKea(keaId, vetData) {
    if (!keaId) {
      throw new Error('Se requiere el ID de registro de Kea Tools para actualizar.');
    }

    const url = `${(process.env.KEA_MEDICOS_URL || DEFAULT_KEA_MEDICOS_URL).replace(/\/$/, '')}/records/${keaId}`;
    const token = process.env.KEA_MEDICOS_TOKEN || DEFAULT_KEA_MEDICOS_TOKEN;

    const payload = {};
    if (vetData.nombre) payload.NOMBRE = vetData.nombre.trim();
    if (vetData.tarjetaProfesional) payload.TARJETA_PROFESIONAL = vetData.tarjetaProfesional.trim();
    if (vetData.cedula) payload.NIT_CEDULA = String(vetData.cedula).replace(/[^0-9]/g, '').trim();
    if (vetData.veterinariaNit) payload.VETERINARIA = String(vetData.veterinariaNit).replace(/[^0-9]/g, '').trim();
    if (vetData.telefono) payload.TELEFONO = String(vetData.telefono).trim();
    if (vetData.email) payload.EMAIL = vetData.email.trim().toLowerCase();
    if (vetData.ciudad) payload.CIUDAD = vetData.ciudad.trim();
    if (vetData.especialidad) payload.ESPECIALIDAD = vetData.especialidad.trim();
    if (vetData.estado) payload.ESTADO = vetData.estado.toLowerCase();

    const newPass = String(vetData.password || vetData.contrasena || vetData.newPassword || '').trim();
    if (newPass) {
      const rawObs = String(vetData.observaciones || '').trim();
      if (rawObs.includes('[PWD:')) {
        payload.OBSERVACIONES = rawObs.replace(/\[PWD:[^\]]+\]/i, `[PWD:${newPass}]`);
      } else {
        payload.OBSERVACIONES = rawObs ? `[PWD:${newPass}] ${rawObs}` : `[PWD:${newPass}]`;
      }
    } else if (vetData.observaciones !== undefined) {
      payload.OBSERVACIONES = String(vetData.observaciones).trim();
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
      const msg = data.data?.message || data.message || `Error al actualizar veterinario en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const updatedRecord = data.data || data;
    return mapKeaRecordToVeterinarian(updatedRecord);
  },
};
