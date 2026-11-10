import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/patients';

import { hasReportedAllergy, getAllergyDisplay, isNegativeAllergyText } from '../utils/allergyHelpers.js';
export { hasReportedAllergy, getAllergyDisplay, isNegativeAllergyText };

export const PATIENT_STATUSES = [
  'activo',
  'pendiente por atención',
  'en tratamiento',
  'en observación',
  'en recuperación',
  'estable',
  'critico',
  'internado',
  'dado de alta',
  'fallecido',
  'inactivo',
];

// Fallback data con estructura completa idéntica al backend
const FALLBACK_PATIENTS = [
  {
    id: 'PAC-PRUEBA-01',
    keaRecordId: 1,
    name: 'Luna',
    lastName: '(PRUEBA)',
    fullName: 'Luna (PRUEBA)',
    avatar: '🐕',
    species: 'Canino',
    otherSpecies: '',
    breed: 'Mestizo',
    sex: 'Hembra',
    birthDate: '2022-03-01',
    age: '4 años, 9 meses',
    weight: '18 kg',
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-900000001',
    microchip: 'Sin microchip',
    owner: {
      name: 'PROP-PRUEBA-01',
      firstName: 'PROP-PRUEBA-01',
      lastName: '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá'
    },
    riskFactors: {
      habitat: 'Interiores / Mixto',
      recentTravel: false,
      lastVisitedCountry: 'Ninguno',
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: '3/5',
      generalCondition: 'Estable',
      physicalFindings: 'Condición corporal 3/5, Estable.'
    },
    status: 'activo',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    attendingVet: 'TP-PRUEBA-01',
    lastVisit: '09/11/2026',
    source: 'Kea Tools DB'
  },
  {
    id: 'PAC-PRUEBA-02',
    keaRecordId: 2,
    name: 'Michi',
    lastName: '(PRUEBA)',
    fullName: 'Michi (PRUEBA)',
    avatar: '🐱',
    species: 'Felino',
    otherSpecies: '',
    breed: 'Mestizo',
    sex: 'Macho',
    birthDate: '2022-03-01',
    age: '4 años, 9 meses',
    weight: '4 kg',
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-900000001',
    microchip: 'Sin microchip',
    owner: {
      name: 'PROP-PRUEBA-01',
      firstName: 'PROP-PRUEBA-01',
      lastName: '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá'
    },
    riskFactors: {
      habitat: 'Interiores / Mixto',
      recentTravel: false,
      lastVisitedCountry: 'Ninguno',
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: '3/5',
      generalCondition: 'Estable',
      physicalFindings: 'Condición corporal 3/5, Estable.'
    },
    status: 'activo',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    attendingVet: 'TP-PRUEBA-01',
    lastVisit: '09/11/2026',
    source: 'Kea Tools DB'
  },
  {
    id: 'PAC-PRUEBA-03',
    keaRecordId: 3,
    name: 'Rocky',
    lastName: '(PRUEBA)',
    fullName: 'Rocky (PRUEBA)',
    avatar: '🐕',
    species: 'Canino',
    otherSpecies: '',
    breed: 'Mestizo',
    sex: 'Macho',
    birthDate: '2022-03-01',
    age: '4 años, 9 meses',
    weight: '30 kg',
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-900000002',
    microchip: 'Sin microchip',
    owner: {
      name: 'PROP-PRUEBA-02',
      firstName: 'PROP-PRUEBA-02',
      lastName: '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá'
    },
    riskFactors: {
      habitat: 'Interiores / Mixto',
      recentTravel: false,
      lastVisitedCountry: 'Ninguno',
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: '3/5',
      generalCondition: 'Estable',
      physicalFindings: 'Condición corporal 3/5, Estable.'
    },
    status: 'activo',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    attendingVet: 'TP-PRUEBA-02',
    lastVisit: '09/11/2026',
    source: 'Kea Tools DB'
  },
  {
    id: 'PAC-R01',
    keaRecordId: 4,
    name: 'Sotia',
    lastName: '',
    fullName: 'Sotia',
    avatar: '🐕',
    species: 'Canino',
    otherSpecies: '',
    breed: 'Labrador',
    sex: 'Macho',
    birthDate: '2026-08-04',
    age: '3 meses',
    weight: 'Sin registrar',
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-900949599',
    microchip: 'Sin microchip',
    owner: {
      name: '001',
      firstName: '001',
      lastName: '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá'
    },
    riskFactors: {
      habitat: 'Interiores / Mixto',
      recentTravel: false,
      lastVisitedCountry: 'Ninguno',
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: '3/5',
      generalCondition: 'Estable',
      physicalFindings: 'Condición corporal 3/5, Estable.'
    },
    status: 'activo',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    attendingVet: 'Dr. Asignado',
    lastVisit: '09/11/2026',
    source: 'Kea Tools DB'
  },
  {
    id: 'PAC-PROP-PRUEBA-01-LOLA',
    keaRecordId: 5,
    name: 'Lola',
    lastName: '',
    fullName: 'Lola',
    avatar: '🐱',
    species: 'Felino',
    otherSpecies: '',
    breed: 'idk',
    sex: 'Macho',
    birthDate: '2026-11-02',
    age: '0 meses',
    weight: 'Sin registrar',
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-1000087681',
    microchip: 'Sin microchip',
    owner: {
      name: 'PROP-PRUEBA-01',
      firstName: 'PROP-PRUEBA-01',
      lastName: '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá'
    },
    riskFactors: {
      habitat: 'Interiores / Mixto',
      recentTravel: false,
      lastVisitedCountry: 'Ninguno',
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: '3/5',
      generalCondition: 'Estable',
      physicalFindings: 'Condición corporal 3/5, Estable.'
    },
    status: 'activo',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    attendingVet: 'TP-PRUEBA-01',
    lastVisit: '09/11/2026',
    source: 'Kea Tools DB'
  },
  {
    id: 'PAC-542133',
    keaRecordId: 6,
    name: 'Lucas',
    lastName: '',
    fullName: 'Lucas',
    avatar: '🐱',
    species: 'Felino',
    otherSpecies: '',
    breed: 'cruce',
    sex: 'Macho',
    birthDate: '2026-11-02',
    age: '0 meses',
    weight: 'Sin registrar',
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-900949599',
    microchip: 'Sin microchip',
    owner: {
      name: '98542',
      firstName: '98542',
      lastName: '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá'
    },
    riskFactors: {
      habitat: 'Interiores / Mixto',
      recentTravel: false,
      lastVisitedCountry: 'Ninguno',
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: '3/5',
      generalCondition: 'Estable',
      physicalFindings: 'Condición corporal 3/5, Estable.'
    },
    status: 'activo',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    attendingVet: 'Dr. Asignado',
    lastVisit: '09/11/2026',
    source: 'Kea Tools DB'
  }
];

let localPatientsStore = [...FALLBACK_PATIENTS];

export const KEA_API_URL = 'https://osd.kea.tools/api/v1/databases/PACIENTE/records';
export const KEA_BEARER_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMzQ4NzBlMGU3YTU2ZjFmZjE0ODk2YWFmMjg0NzZjNzBkNjM3ZDc5MmMyOTY4ZjQ4YjZhODBjYjg3NTc1MjcwMjg0YWVjNjQwMzA2ODk4ZWEiLCJpYXQiOjE3OTQyNTU2MzEuMTIyMDA2LCJuYmYiOjE3OTQyNTU2MzEuMTIyMDA5LCJleHAiOjE4MjU3OTE2MzEuMTE1OTk3LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.Lxhv0uyiWUR5RBTia3TIFj0zrF2ZzMsIsVUGEmToW9A6atSKyShg10ODTLs8-gf9ovA4RZpldXDKcqkh5-GbTnnWKzl4ltCFMCN_TolNQnYWHnXPX7PtJhprvzojtg8Ue_ovffXzMS4EVlFl40HG3AJokfw8ZeOv4RRdSn2hA9vfhNBBNKEvQQgWpY6KVobTlpgrGAe7bI5YJFq0yG0Nu3uziE1dXTacVrGxgmMj45dFMR_y9vLIN-rhQBuJWmTl6e1GuzSCnS41JiWXktbHIJKEFCEGtK6P6Hb-XhFscnfrBAxr_-Mh1R3yTrRgYhhpBB4C5Afo9ZcH1j-_3FGFdBHa0P71_sjuw8lPIz6BR9FpybY_tnEV6IlP1e94K2CExS7OvVCc9yFyGPLj18FhICQzQWr9scXCpUMa0WkXiqbgDhgywnTrEvoWHcbWF4iEdNgKGra1u_A3lQlctN6-5GE0fb91qI2gLkXIzLgVkSjEhT3Xi_YNeWfUO3njUuPWZGxcQbAp3InnNiFjIwP27FBORkjAPdaGlouU91w2EE87fEwnpKgQ9fcxeQMLOxQDEiYOHe_uvxDwTgMmqCpEtkuxrZGKw3_ZIiVz2IHSzjSWh-89Xb9cr0kyVrBGIiFlVRLgc1Q3FZuhwG87pjS3Tk4cD6akblkyusWgTxCYiVc';

export const calculateAgeFromBirthDate = (birthDateString) => {
  if (!birthDateString) return 'No especificada';
  const birth = new Date(birthDateString);
  const now = new Date();
  if (isNaN(birth.getTime())) return 'Fecha inválida';

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? `, ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
  }
  return `${months} ${months === 1 ? 'mes' : 'meses'}`;
};

export const mapRawKeaRecord = (record, index = 0) => {
  const rawId = record.CODIGO_PACIENTE || record['Código del paciente'] || record.codigo_paciente || record.id;
  const patientId = rawId ? (String(rawId).startsWith('PAC-') ? String(rawId) : `PAC-${String(rawId)}`) : `PAC-KEA-${index + 1}`;

  const fullName = String(record.NOMBRE || record.Nombre || 'Paciente sin nombre').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Paciente';
  const lastName = nameParts.slice(1).join(' ') || '';

  const rawSpecies = String(record.ESPECIE || record.Especie || 'Canino').trim();
  const otherSpecies = String(record.ESPECIE_OTRO || record['Otra especie'] || '').trim();
  const species = rawSpecies.toLowerCase().includes('otro') && otherSpecies ? otherSpecies : rawSpecies;

  const breed = String(record.RAZA || record.Raza || 'Mestizo').trim();
  const rawSex = String(record.SEXO || record.Sexo || 'No especificado').trim();
  const sex = rawSex.toLowerCase().startsWith('h') ? 'Hembra' : (rawSex.toLowerCase().startsWith('m') ? 'Macho' : rawSex);

  const rawWeight = record.PESO_KG ?? record.Peso;
  const weight = rawWeight !== undefined && rawWeight !== null && rawWeight !== '' ? `${rawWeight} kg` : 'Sin registrar';

  const rawBirth = record.FECHA_NACIMIENTO || record['Fecha de nacimiento'] || '';
  const birthDate = rawBirth ? String(rawBirth).split('T')[0] : '';
  const rawAge = record.EDAD ?? record.Edad;
  let age = 'No especificada';
  if (birthDate) {
    age = calculateAgeFromBirthDate(birthDate);
  } else if (rawAge !== undefined && rawAge !== null && rawAge !== '') {
    age = typeof rawAge === 'number' ? `${rawAge} ${rawAge === 1 ? 'año' : 'años'}` : String(rawAge);
  }

  const rawVet = String(record.VETERINARIO || record['Veterinario actual'] || record.Veterinario || 'Dr. Asignado').trim();
  const rawOwner = record.PROPIETARIO ?? record.Propietario;
  const ownerName = rawOwner !== undefined && rawOwner !== null && rawOwner !== '' ? String(rawOwner).trim() : 'Tutor no registrado';
  const rawNit = String(record.VETERINARIA || '#nit-1').trim();
  const isSterilized = Boolean(record.ESTERILIZADO === true || record.ESTERILIZADO === 'true' || record.ESTERILIZADO === 1);
  const isAsymptomatic = Boolean(record.ASINTOMATICO === true || record.ASINTOMATICO === 'true' || record.ASINTOMATICO === 1);
  const bodyCondition = String(record.CONDICION_CORPORAL || '3/5').trim();
  const status = String(record.ESTADO || 'activo').toLowerCase().trim();
  const clinicalStatus = String(record.ESTADO_CLINICO || (isAsymptomatic ? 'Asintomático' : 'Estable')).trim();

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
    codigoSedeNit: rawNit.startsWith('#') ? rawNit : `#nit-${rawNit}`,
    microchip: String(record.MICROCHIP || 'Sin microchip').trim(),
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
      recentTravel: Boolean(record.VIAJE_EXTERIOR === true || record.VIAJE_EXTERIOR === 'true'),
      lastVisitedCountry: String(record.ULTIMO_PAIS_VISITADO || 'Ninguno').trim(),
      livesWithOtherAnimals: true,
      ruralAccess: false,
    },
    medicalAdmission: {
      isAsymptomatic,
      symptoms: record.SINTOMAS ? [record.SINTOMAS] : [],
      bodyCondition: bodyCondition || '3/5',
      generalCondition: clinicalStatus || 'Estable',
      physicalFindings: `Condición corporal ${bodyCondition || '3/5'}, ${clinicalStatus || 'Estable'}.`,
    },
    status: status || 'activo',
    isSterilized,
    hasAllergies: Boolean((record.ALERGIAS === true || record.ALERGIAS === 'true' || (record.ALERGIAS_CUAL && !isNegativeAllergyText(String(record.ALERGIAS_CUAL)))) && !isNegativeAllergyText(String(record.ALERGIAS_CUAL || ''))),
    allergies: !isNegativeAllergyText(String(record.ALERGIAS_CUAL || '')) ? String(record.ALERGIAS_CUAL).trim() : '',
    attendingVet: rawVet || 'Dr. Asignado',
    lastVisit: new Date().toLocaleDateString('es-CO'),
    source: 'Kea Tools DB',
    clinicalDocuments: [],
  };
};

export const patientApi = {
  async getStats(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`, { params, timeout: 2000 });
      return response.data.data;
    } catch {
      let list = [...localPatientsStore];
      const targetNit = String(params.nit || params.clinicNit || '').replace(/[^0-9]/g, '').trim();
      const targetClinicId = params.clinicId ? String(params.clinicId).trim().toLowerCase() : '';
      if (targetNit || targetClinicId) {
        list = list.filter((p) => {
          if (targetNit) {
            const pNit = String(p.clinicNit || p.nit || p.veterinaria || '').replace(/[^0-9]/g, '').trim();
            if (pNit && pNit === targetNit) return true;
            if (p.codigoSedeNit && String(p.codigoSedeNit).replace(/[^0-9]/g, '').trim() === targetNit) return true;
          }
          if (targetClinicId && p.clinicId && String(p.clinicId).toLowerCase() === targetClinicId) return true;
          return false;
        });
      }

      if (params.sedeId && params.sedeId !== 'all' && params.sedeId !== 'Todas') {
        list = list.filter((p) => p.sedeId === params.sedeId);
      }
      const active = list.filter((p) => p.status === 'activo').length;
      const inProgress = list.filter((p) => p.activeExamOrder && p.activeExamOrder.currentStep < 4).length;
      const ready = list.filter((p) => p.activeExamOrder && p.activeExamOrder.currentStep === 4).length;
      const hosp = list.filter((p) => p.status === 'internado').length;
      return { activePatients: active, ordersInProgress: inProgress, resultsReady: ready, hospitalized: hosp };
    }
  },

  async getPatients(filters = {}) {
    try {
      const response = await axios.get(API_BASE_URL, { params: filters, timeout: 2000 });
      return response.data.data;
    } catch {
      let list = [...localPatientsStore];
      const targetNit = String(filters.nit || filters.clinicNit || '').replace(/[^0-9]/g, '').trim();
      const targetClinicId = filters.clinicId ? String(filters.clinicId).trim().toLowerCase() : '';
      if (targetNit || targetClinicId) {
        list = list.filter((p) => {
          if (targetNit) {
            const pNit = String(p.clinicNit || p.nit || p.veterinaria || '').replace(/[^0-9]/g, '').trim();
            if (pNit && pNit === targetNit) return true;
            if (p.codigoSedeNit && String(p.codigoSedeNit).replace(/[^0-9]/g, '').trim() === targetNit) return true;
          }
          if (targetClinicId && p.clinicId && String(p.clinicId).toLowerCase() === targetClinicId) return true;
          return false;
        });
      }

      if (filters.sedeId && filters.sedeId !== 'all' && filters.sedeId !== 'Todas') {
        list = list.filter((p) => p.sedeId === filters.sedeId);
      }
      if (filters.search && filters.search.trim()) {
        const t = filters.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(t) ||
            (p.lastName && p.lastName.toLowerCase().includes(t)) ||
            (p.owner && p.owner.name.toLowerCase().includes(t)) ||
            p.id.toLowerCase().includes(t)
        );
      }
      if (filters.species && filters.species !== 'all' && filters.species !== 'Todas') {
        list = list.filter((p) => p.species.toLowerCase() === filters.species.toLowerCase());
      }
      if (filters.breed && filters.breed !== 'all' && filters.breed !== 'Todas') {
        list = list.filter((p) => p.breed.toLowerCase() === filters.breed.toLowerCase());
      }
      if (filters.sampleStatus && filters.sampleStatus !== 'all' && filters.sampleStatus !== 'Todos') {
        list = list.filter((p) => {
          if (!p.activeExamOrder) return false;
          const step = p.activeExamOrder.steps[p.activeExamOrder.currentStep];
          return step && step.label.toLowerCase() === filters.sampleStatus.toLowerCase();
        });
      }
      return list;
    }
  },

  async getFilters() {
    try {
      const response = await axios.get(`${API_BASE_URL}/filters`, { timeout: 2000 });
      return response.data.data;
    } catch {
      return {
        species: ['Felino', 'Canino'],
        breeds: ['Siamés', 'Golden Retriever', 'Bulldog Francés', 'Rottweiler'],
        sampleStatuses: ['Resultado enviado', 'En análisis qPCR', 'Muestra recibida', 'Solicitud creada'],
        availableStatuses: PATIENT_STATUSES,
      };
    }
  },

  async updatePatient(id, updatedData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, updatedData);
      return response.data.data;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      const idx = localPatientsStore.findIndex((p) => p.id === id);
      if (idx !== -1) {
        if (localPatientsStore[idx].status === 'fallecido') {
          throw new Error('Acceso denegado: La ficha de un paciente fallecido está bloqueada y no admite modificaciones.');
        }
        const currentPatient = localPatientsStore[idx];
        const isSterilized = currentPatient.isSterilized
          ? true
          : (updatedData.isSterilized !== undefined ? Boolean(updatedData.isSterilized) : Boolean(currentPatient.isSterilized));

        // Calcular historial de auditoría de todos los campos editados
        const auditChanges = [];
        if (updatedData.status && updatedData.status !== currentPatient.status) {
          auditChanges.push({ campo: 'Estado Clínico', categoria: 'Clínica', anterior: currentPatient.status, nuevo: updatedData.status });
        }
        if (updatedData.weight && updatedData.weight !== currentPatient.weight) {
          auditChanges.push({ campo: 'Peso', categoria: 'Medidas', anterior: currentPatient.weight || 'N/A', nuevo: updatedData.weight });
        }
        if (updatedData.isSterilized !== undefined && Boolean(updatedData.isSterilized) !== Boolean(currentPatient.isSterilized)) {
          auditChanges.push({ campo: 'Esterilización', categoria: 'Reproducción', anterior: currentPatient.isSterilized ? 'Esterilizado' : 'Entero', nuevo: updatedData.isSterilized ? 'Esterilizado' : 'Entero' });
        }
        if (updatedData.allergies !== undefined && updatedData.allergies !== currentPatient.allergies) {
          auditChanges.push({ campo: 'Alergias Conocidas', categoria: 'Clínica', anterior: currentPatient.allergies || 'Ninguna', nuevo: updatedData.allergies || 'Ninguna' });
        }
        if (updatedData.notes !== undefined && updatedData.notes !== currentPatient.notes) {
          auditChanges.push({ campo: 'Notas Médicas', categoria: 'Observaciones', anterior: currentPatient.notes || 'Sin notas', nuevo: updatedData.notes || 'Sin notas' });
        }
        if (updatedData.riskFactors) {
          const rf = updatedData.riskFactors;
          const crf = currentPatient.riskFactors || {};
          if (rf.habitat !== undefined && rf.habitat !== crf.habitat) {
            auditChanges.push({ campo: 'Hábitat', categoria: 'Factores de Riesgo', anterior: crf.habitat || 'No especificado', nuevo: rf.habitat });
          }
          if (rf.coastalRescue !== undefined && rf.coastalRescue !== crf.coastalRescue) {
            auditChanges.push({ campo: 'Rescate Zona Costera', categoria: 'Factores de Riesgo', anterior: crf.coastalRescue ? 'Sí' : 'No', nuevo: rf.coastalRescue ? 'Sí' : 'No' });
          }
          if (rf.recentTravel !== undefined && rf.recentTravel !== crf.recentTravel) {
            auditChanges.push({ campo: 'Viaje Reciente', categoria: 'Factores de Riesgo', anterior: crf.recentTravel ? 'Sí' : 'No', nuevo: rf.recentTravel ? 'Sí' : 'No' });
          }
          if (rf.parasiteExposure !== undefined && rf.parasiteExposure !== crf.parasiteExposure) {
            auditChanges.push({ campo: 'Exposición a Parásitos', categoria: 'Factores de Riesgo', anterior: crf.parasiteExposure ? 'Sí' : 'No', nuevo: rf.parasiteExposure ? 'Sí' : 'No' });
          }
        }
        if (updatedData.vitalSigns) {
          const vs = updatedData.vitalSigns;
          const cvs = currentPatient.healthMetrics?.vitalSigns || {};
          if (vs.temperature && vs.temperature !== cvs.temperature) {
            auditChanges.push({ campo: 'Temperatura', categoria: 'Constantes Vitales', anterior: cvs.temperature || 'N/A', nuevo: vs.temperature });
          }
          if (vs.heartRate && vs.heartRate !== cvs.heartRate) {
            auditChanges.push({ campo: 'Frecuencia Cardíaca', categoria: 'Constantes Vitales', anterior: cvs.heartRate || 'N/A', nuevo: vs.heartRate });
          }
          if (vs.respiratoryRate && vs.respiratoryRate !== cvs.respiratoryRate) {
            auditChanges.push({ campo: 'Frecuencia Respiratoria', categoria: 'Constantes Vitales', anterior: cvs.respiratoryRate || 'N/A', nuevo: vs.respiratoryRate });
          }
          if (vs.mucosa && vs.mucosa !== cvs.mucosa) {
            auditChanges.push({ campo: 'Color de Mucosas', categoria: 'Constantes Vitales', anterior: cvs.mucosa || 'N/A', nuevo: vs.mucosa });
          }
          if (vs.capillaryRefillTime && vs.capillaryRefillTime !== cvs.capillaryRefillTime) {
            auditChanges.push({ campo: 'TLLC', categoria: 'Constantes Vitales', anterior: cvs.capillaryRefillTime || 'N/A', nuevo: `${vs.capillaryRefillTime} seg` });
          }
        }
        if (updatedData.owner) {
          const ow = updatedData.owner;
          const cow = currentPatient.owner || {};
          if (ow.phone && ow.phone !== cow.phone) {
            auditChanges.push({ campo: 'Teléfono Tutor', categoria: 'Tutor', anterior: cow.phone || 'N/A', nuevo: ow.phone });
          }
          if (ow.address && ow.address !== cow.address) {
            auditChanges.push({ campo: 'Dirección Tutor', categoria: 'Tutor', anterior: cow.address || 'N/A', nuevo: ow.address });
          }
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
          ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

        const auditEntry = {
          id: `AUD-${Date.now()}`,
          fecha: dateStr,
          timestamp: now.toISOString(),
          veterinario: 'Dr. Alejandro Morales',
          rol: 'Director Médico / Admin',
          accion: auditChanges.length > 0 ? `Modificación de ${auditChanges.length} campo(s)` : 'Edición y verificación de ficha',
          cambios: auditChanges.length > 0 ? auditChanges : [{ campo: 'Expediente', categoria: 'General', anterior: 'Revisión médica', nuevo: 'Guardado actualizado' }],
        };

        const currentAuditHistory = Array.isArray(currentPatient.auditHistory) && currentPatient.auditHistory.length > 0
          ? currentPatient.auditHistory
          : [
              {
                id: 'AUD-0',
                fecha: currentPatient.lastVisit || '10/01/2026',
                timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
                veterinario: 'Dr. Alejandro Morales',
                rol: 'Director Médico',
                accion: 'Registro y admisión inicial de paciente',
                cambios: [
                  { campo: 'Expediente Inicial', categoria: 'General', anterior: 'No existía', nuevo: 'Ficha médica creada' },
                  { campo: 'Hábitat Inicial', categoria: 'Factores de Riesgo', anterior: '-', nuevo: currentPatient.riskFactors?.habitat || 'Casa urbana' },
                ],
              },
            ];

        localPatientsStore[idx] = {
          ...currentPatient,
          ...updatedData,
          isSterilized,
          auditHistory: [auditEntry, ...currentAuditHistory],
          owner: {
            ...localPatientsStore[idx].owner,
            ...(updatedData.owner || {}),
          },
          riskFactors: {
            ...localPatientsStore[idx].riskFactors,
            ...(updatedData.riskFactors || {}),
          },
          medicalAdmission: {
            ...localPatientsStore[idx].medicalAdmission,
            ...(updatedData.medicalAdmission || {}),
          },
          healthMetrics: {
            ...localPatientsStore[idx].healthMetrics,
            ...(updatedData.healthMetrics || {}),
            vitalSigns: {
              ...localPatientsStore[idx].healthMetrics?.vitalSigns,
              ...(updatedData.vitalSigns || updatedData.healthMetrics?.vitalSigns || {}),
            },
          },
        };

        // Sincronizar actualización directamente con Kea Tools vía PATCH /records/{keaRecordId}
        if (currentPatient.keaRecordId) {
          try {
            const keaPayload = {};
            if (updatedData.weight !== undefined) {
              keaPayload.PESO_KG = parseFloat(String(updatedData.weight).replace(/[^0-9.]/g, '')) || 5;
            }
            if (updatedData.status !== undefined) {
              keaPayload.ESTADO = updatedData.status.toLowerCase();
            }
            if (updatedData.isSterilized !== undefined) {
              keaPayload.ESTERILIZADO = Boolean(updatedData.isSterilized);
            }
            if (updatedData.allergies !== undefined || updatedData.hasAllergies !== undefined) {
              const hasAllergyFlag = Boolean(updatedData.hasAllergies && updatedData.allergies && !isNegativeAllergyText(updatedData.allergies));
              keaPayload.ALERGIAS = hasAllergyFlag;
              keaPayload.ALERGIAS_CUAL = hasAllergyFlag ? String(updatedData.allergies).trim() : '';
            }
            if (updatedData.medicalAdmission?.bodyCondition || updatedData.bodyCondition) {
              keaPayload.CONDICION_CORPORAL = updatedData.medicalAdmission?.bodyCondition || updatedData.bodyCondition;
            }
            if (updatedData.medicalAdmission?.generalCondition || updatedData.clinicalStatus) {
              keaPayload.ESTADO_CLINICO = updatedData.medicalAdmission?.generalCondition || updatedData.clinicalStatus;
            }
            if (updatedData.attendingVet) {
              keaPayload.VETERINARIO = updatedData.attendingVet;
            }

            const keaUpdateUrl = `${KEA_API_URL}/${currentPatient.keaRecordId}`;
            await fetch(keaUpdateUrl, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${KEA_BEARER_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(keaPayload),
            });
          } catch (keaErr) {
            console.warn('Advertencia al sincronizar PATCH con Kea:', keaErr.message);
          }
        }

        return localPatientsStore[idx];
      }
      throw err;
    }
  },

  async deletePatient(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Backend local no disponible, inactivando en Kea Tools...', err.message);
      const patient = localPatientsStore.find((p) => p.id === id);
      if (patient && patient.keaRecordId) {
        try {
          const keaUrl = `${KEA_API_URL}/${patient.keaRecordId}`;
          await fetch(keaUrl, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${KEA_BEARER_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ ESTADO: 'inactivo' }),
          });
        } catch (keaErr) {
          console.warn('Advertencia al inactivar en Kea:', keaErr.message);
        }
      }
      localPatientsStore = localPatientsStore.filter((p) => p.id !== id);
      return { success: true, message: 'Paciente inactivado correctamente' };
    }
  },

  async requestExam(id, examData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/${id}/exam`, examData);
      return response.data.data;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      const patient = localPatientsStore.find((p) => p.id === id);
      if (!patient) throw new Error('Paciente no encontrado');
      if (patient.status === 'fallecido') throw new Error('No se pueden solicitar exámenes para un paciente fallecido.');

      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('es-ES')} - ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
      patient.activeExamOrder = {
        ...examData,
        id: examData.id || `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
        testName: examData.testName || 'Panel Diagnóstico Molecular qPCR',
        category: examData.category || 'Biología Molecular Cuantitativa (qPCR)',
        sampleType: examData.sampleType || 'Hisopado / Muestra biológica',
        priority: examData.urgency || 'Normal (24-48h)',
        requestedBy: examData.requestedBy || 'Dr. Alejandro Morales',
        laboratory: examData.laboratory || 'VetLab Central - Unidad de Genómica',
        targets: examData.targets || 'Detección cuantitativa de patógenos diana',
        syndromes: examData.syndromes || [],
        findings: examData.findings || [],
        totalPrice: examData.totalPrice || '$145.000',
        examType: examData.examType || 'nuevo',
        previousExamCode: examData.previousExamCode || null,
        cuadroHematico: examData.cuadroHematico || null,
        historiaClinica: examData.historiaClinica || null,
        requestedAt: formattedDate,
        currentStep: 0,
        steps: [
          { label: 'Solicitud creada', desc: 'Orden médica generada', date: formattedDate, completed: true },
          { label: 'Muestra recibida', desc: 'Ingreso a laboratorio', date: 'Pendiente', completed: false },
          { label: 'En análisis molecular / secuenciación', desc: 'Extracción y amplificación / NGS', date: 'Pendiente', completed: false },
          { label: 'Validación médica', desc: 'Revisión por patólogo / bioinformático', date: 'Pendiente', completed: false },
          { label: 'Resultado enviado', desc: 'Informe emitido a clínica', date: 'Pendiente', completed: false },
        ],
      };

      if (examData.isSterilized !== undefined && examData.isSterilized !== null) {
        patient.isSterilized = Boolean(examData.isSterilized);
      }
      if (examData.allergies !== undefined) {
        patient.allergies = examData.allergies;
        patient.hasAllergies = Boolean(examData.allergies && examData.allergies.trim().length > 0);
      }
      if (examData.riskFactors) {
        patient.riskFactors = {
          ...(patient.riskFactors || {}),
          ...examData.riskFactors,
        };
      }
      if (examData.cuadroHematico) {
        patient.cuadroHematico = examData.cuadroHematico;
        if (!patient.medicalAdmission) patient.medicalAdmission = {};
        patient.medicalAdmission.cuadroHematico = examData.cuadroHematico;
      }
      if (examData.historiaClinica) {
        patient.historiaClinica = examData.historiaClinica;
        if (!patient.medicalAdmission) patient.medicalAdmission = {};
        patient.medicalAdmission.historiaClinica = examData.historiaClinica;
      }

      let examAgents = [];
      if (examData.profiles && Array.isArray(examData.profiles)) {
        examData.profiles.forEach((p) => {
          if (p.agents && Array.isArray(p.agents)) {
            p.agents.forEach((agentName) => {
              examAgents.push({
                name: agentName,
                isPositive: false,
                result: 'En análisis molecular',
                ct: 'Pendiente',
                load: 'En cola',
              });
            });
          }
        });
      } else if (examData.targets && typeof examData.targets === 'string') {
        examAgents = examData.targets
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .map((agentName) => ({
            name: agentName,
            isPositive: false,
            result: 'En análisis molecular',
            ct: 'Pendiente',
            load: 'En cola',
          }));
      }

      if (!patient.qpcrExams) patient.qpcrExams = [];
      patient.qpcrExams.unshift({
        id: `QPCR-${patient.activeExamOrder.id.replace('ORD-', '')}`,
        testName: patient.activeExamOrder.testName,
        date: now.toLocaleDateString('es-ES'),
        requestedAt: formattedDate,
        receivedAt: 'Pendiente (en recepción)',
        status: 'Solicitud creada',
        sampleType: patient.activeExamOrder.sampleType,
        resultSummary: 'En cola de extracción y amplificación molecular',
        methodology: 'qPCR TaqMan multiplex en tiempo real',
        agents: examAgents,
        reportUrl: '#',
      });

      return patient.activeExamOrder;
    }
  },

  async addConsultation(patientId, consultationData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/${patientId}/consultations`, consultationData);
      return response.data.data;
    } catch (err) {
      const patient = localPatientsStore.find((p) => p.id === patientId);
      if (!patient) throw new Error('Paciente no encontrado');

      if (patient.status === 'fallecido') {
        const deceasedError = new Error('No se pueden registrar consultas médicas para un paciente fallecido.');
        deceasedError.statusCode = 403;
        throw deceasedError;
      }

      const now = new Date();
      const formattedDate = consultationData.date || now.toLocaleDateString('es-ES');
      const formattedTime = consultationData.time || now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      const newConsultation = {
        date: formattedDate,
        time: formattedTime,
        vet: consultationData.vet || consultationData.doctorName || patient.attendingVet || 'Dr. Alejandro Morales',
        weight: consultationData.weight || patient.weight || '',
        clinicalStatus: consultationData.clinicalStatus || 'Bueno',
        vitalSigns: {
          heartRate: consultationData.vitalSigns?.heartRate || consultationData.vitalSignsHeartRate || 'No registrada',
          temperature: consultationData.vitalSigns?.temperature || consultationData.vitalSignsTemp || 'No registrada',
          respiratoryRate: consultationData.vitalSigns?.respiratoryRate || consultationData.vitalSignsResp || 'No registrada',
          mucosa: consultationData.vitalSigns?.mucosa || consultationData.vitalSignsMucosa || 'No registrada',
        },
        reason: consultationData.reason || '',
        medication: consultationData.medication || '',
        relevantBackground: consultationData.relevantBackground || '',
        observationsAndFollowUp: consultationData.observationsAndFollowUp || '',
      };

      if (!patient.consultations) patient.consultations = [];
      patient.consultations.unshift(newConsultation);

      if (consultationData.weight) {
        patient.weight = consultationData.weight;
        if (!patient.healthMetrics) patient.healthMetrics = {};
        if (!patient.healthMetrics.weightHistory) patient.healthMetrics.weightHistory = [];
        patient.healthMetrics.weightHistory.unshift({ date: formattedDate, weight: consultationData.weight });
      }

      if (consultationData.vitalSigns || consultationData.vitalSignsHeartRate) {
        if (!patient.healthMetrics) patient.healthMetrics = {};
        patient.healthMetrics.vitalSigns = {
          ...patient.healthMetrics.vitalSigns,
          ...newConsultation.vitalSigns,
        };
      }

      patient.lastVisit = formattedDate;

      return {
        consultation: newConsultation,
        patient: { ...patient },
      };
    }
  },

  async createPatient(patientData) {
    try {
      const response = await axios.post(API_BASE_URL, patientData);
      return response.data.data;
    } catch (err) {
      console.warn('Backend local no disponible, registrando directamente en Kea Tools...', err.message);

      let maxNum = 0;
      for (const p of localPatientsStore) {
        if (p.id && typeof p.id === 'string') {
          const m = p.id.match(/^PAC-(\d+)$/i);
          if (m) {
            const num = parseInt(m[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      }
      const newId = patientData.id || `PAC-${String(maxNum + 1).padStart(3, '0')}`;
      const ownerName = patientData.ownerName || `${patientData.ownerFirstName || ''} ${patientData.ownerLastName || ''}`.trim() || 'Tutor no registrado';
      const parsedWeight = patientData.weight ? (parseFloat(String(patientData.weight).replace(/[^0-9.]/g, '')) || 5) : 5;
      const parsedAge = patientData.age ? (parseInt(String(patientData.age).replace(/[^0-9]/g, ''), 10) || 1) : 1;
      const birthDateStr = patientData.birthDate
        ? (patientData.birthDate.includes('T') ? patientData.birthDate : `${patientData.birthDate}T00:00:00-05:00`)
        : new Date().toISOString();

      const symptoms = Array.isArray(patientData.medicalAdmission?.symptoms)
        ? patientData.medicalAdmission.symptoms.join(', ')
        : (patientData.symptoms || '');

      let keaRecordId = null;

      // Guardar directamente en Kea Tools vía POST con sanitización de relaciones
      try {
        const rawNit = String(patientData.clinicNit || patientData.nit || patientData.codigoSedeNit || '').replace(/[^0-9]/g, '');
        const nit = rawNit || '900000001';

        // Veterinario en Kea es relación en desuso que solo acepta códigos existentes o vacío
        const knownVets = ['TP-PRUEBA-01', 'TP-PRUEBA-02'];
        const vetValue = knownVets.includes(patientData.attendingVet) ? patientData.attendingVet : '';

        // Propietario en Kea es relación foránea obligatoria con la base PROPIETARIO
        const preferredOwner = patientData.ownerCode || patientData.owner?.code || patientData.ownerDocumentNumber || ownerName || 'PROP-PRUEBA-01';

        const buildKeaPayload = (ownerVal) => ({
          CODIGO_PACIENTE: newId,
          NOMBRE: `${patientData.name || ''} ${patientData.lastName || ''}`.trim() || 'Paciente sin nombre',
          ESPECIE: patientData.species || 'Canino',
          ESPECIE_OTRO: patientData.otherSpecies || '',
          RAZA: patientData.breed || 'Mestizo',
          SEXO: (patientData.sex || 'Macho').toLowerCase().startsWith('h') ? 'hembra' : 'macho',
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

        let keaRes = await fetch(KEA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${KEA_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(buildKeaPayload(preferredOwner)),
        });

        let keaJson = await keaRes.json();

        // Si falla por clave foránea de propietario no existente, auto-reintentar con tutor base 'PROP-PRUEBA-01'
        if (!keaRes.ok && String(keaJson.data?.message || keaJson.message || '').includes('Propietario')) {
          keaRes = await fetch(KEA_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${KEA_BEARER_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(buildKeaPayload('PROP-PRUEBA-01')),
          });
          keaJson = await keaRes.json();
        }

        if (keaRes.ok && (keaJson.status === 'success' || !keaJson.status)) {
          const rec = keaJson.data || keaJson;
          keaRecordId = rec.id || null;
        } else {
          const errDetail = keaJson.data?.message || keaJson.message || `Error HTTP ${keaRes.status}`;
          throw new Error(`Kea Tools rechazó el registro: ${errDetail}`);
        }
      } catch (keaErr) {
        console.error('Error al guardar en Kea Tools:', keaErr);
        throw keaErr;
      }

      const newPatient = {
        id: newId,
        keaRecordId,
        avatar: patientData.avatar || (patientData.species?.toLowerCase().includes('felin') ? '🐱' : '🐶'),
        name: patientData.name,
        lastName: patientData.lastName || patientData.ownerLastName || '',
        fullName: `${patientData.name || ''} ${patientData.lastName || ''}`.trim(),
        species: patientData.species,
        otherSpecies: patientData.otherSpecies || '',
        breed: patientData.breed,
        sex: patientData.sex,
        birthDate: patientData.birthDate,
        age: patientData.age || '1 año',
        weight: patientData.weight ? `${patientData.weight} kg` : `${parsedWeight} kg`,
        sedeId: patientData.sedeId || 'sede-principal-80',
        sedeNombre: patientData.sedeNombre || 'Sede Principal - Calle 80',
        codigoSedeNit: patientData.codigoSedeNit || '#nit-1',
        isSterilized: Boolean(patientData.isSterilized),
        hasAllergies: Boolean(patientData.hasAllergies && patientData.allergies?.trim() && !isNegativeAllergyText(patientData.allergies)),
        allergies: Boolean(patientData.hasAllergies && patientData.allergies?.trim() && !isNegativeAllergyText(patientData.allergies)) ? patientData.allergies.trim() : '',
        medicalBackground: patientData.medicalBackground || 'Sin antecedentes patológicos previos',
        owner: {
          name: ownerName,
          firstName: patientData.ownerFirstName || ownerName.split(' ')[0] || '',
          lastName: patientData.ownerLastName || ownerName.split(' ').slice(1).join(' ') || '',
          documentType: patientData.ownerDocumentType || 'C.C.',
          documentNumber: patientData.ownerDocumentNumber || '',
          document: patientData.ownerDocumentNumber ? `${patientData.ownerDocumentType || 'C.C.'} ${patientData.ownerDocumentNumber}` : (patientData.ownerDocument || ''),
          phone: patientData.ownerPhone || '+57 300 000 0000',
          emergencyPhone: patientData.ownerEmergencyPhone || '',
          email: patientData.ownerEmail || 'tutor@ejemplo.com',
          department: patientData.ownerDepartment || 'Bogotá D.C.',
          city: patientData.ownerCity || 'Bogotá',
          address: patientData.ownerAddress || '',
          stratum: patientData.ownerStratum || 'Estrato 3',
          hasVetPlus: Boolean(patientData.ownerHasVetPlus),
          vetPlusCode: patientData.ownerVetPlusCode || '',
        },
        riskFactors: {
          habitat: patientData.habitat || 'Interiores',
          housingArea: patientData.housingArea || '',
          housingType: patientData.housingType || '',
          contactOutside: patientData.contactOutside || { hasContact: false, contactType: '' },
          livesWithOtherAnimals: Boolean(patientData.livesWithOtherAnimals),
          cohabitingSpecies: patientData.cohabitingSpecies || [],
          recentTravel: Boolean(patientData.recentTravel),
          recentTravelDetails: patientData.recentTravelDetails || '',
          ruralAccess: Boolean(patientData.ruralAccess),
          parasiteExposure: Boolean(patientData.parasiteExposure),
          outdoorWater: Boolean(patientData.outdoorWater),
          coastalRescue: Boolean(patientData.coastalRescue),
          coastalRescueLocation: patientData.coastalRescue ? (patientData.coastalRescueLocation || '') : '',
          otherRiskFactors: patientData.otherRiskFactors || '',
        },
        medicalAdmission: {
          isAsymptomatic: Boolean(patientData.isAsymptomatic),
          symptoms: patientData.symptoms || [],
          otherSymptoms: patientData.otherSymptoms || '',
          physicalFindings: patientData.physicalFindings || '',
          consultationType: patientData.consultationType || 'Consulta',
          generalCondition: patientData.generalCondition || 'Estable',
          vaccinationStatus: patientData.vaccinationStatus || 'No registrado',
          lastVaccinationDate: patientData.vaccinationStatus === 'Desconocido' ? '' : (patientData.lastVaccinationDate || ''),
          dewormingStatus: patientData.dewormingStatus || 'No registrado',
          lastDewormingDate: patientData.dewormingStatus === 'Desconocido' ? '' : (patientData.lastDewormingDate || ''),
          preventionNotes: patientData.preventionNotes || '',
          hasMicrochip: Boolean(patientData.hasMicrochip),
          microchipNumber: patientData.microchipNumber || '',
          hasTraveledAbroad: Boolean(patientData.hasTraveledAbroad),
          lastCountryVisited: patientData.lastCountryVisited || '',
        },
        status: patientData.status || 'activo',
        lastVisit: new Date().toLocaleDateString('es-CO'),
        attendingVet: patientData.attendingVet || 'Dr. Alejandro Morales',
        notes: patientData.physicalFindings ? `Admisión: ${patientData.physicalFindings}` : '',
        healthMetrics: {
          weightHistory: [{ date: new Date().toLocaleDateString('es-CO'), weight: `${parsedWeight} kg` }],
          vitalSigns: {
            heartRate: patientData.vitalSignsHeartRate || patientData.vitalSigns?.heartRate || 'No registrada',
            temperature: patientData.vitalSignsTemp || patientData.vitalSigns?.temperature || 'No registrada',
            respiratoryRate: patientData.vitalSignsResp || patientData.vitalSigns?.respiratoryRate || 'No registrada',
            mucosa: patientData.vitalSignsMucosa || patientData.vitalSigns?.mucosa || 'No registrada',
          },
          lastDiagnosticScore: 'Sin registros previos',
        },
        activeExamOrder: null,
        consultations: [
          {
            id: `CON-${Date.now().toString().slice(-4)}`,
            date: new Date().toLocaleDateString('es-ES'),
            vet: patientData.attendingVet || 'Dr. Alejandro Morales',
            reason: 'Apertura de expediente',
            diagnosis: 'Evaluación inicial.',
            treatment: 'Apertura de ficha clínica y anamnesis.',
          },
        ],
        qpcrExams: [],
        createdAt: new Date().toISOString(),
      };
      localPatientsStore.unshift(newPatient);
      return newPatient;
    }
  },

  async testKea() {
    try {
      const res = await axios.get(`${API_BASE_URL}/kea/test`, { timeout: 6000 });
      return res.data;
    } catch (err) {
      return {
        connected: false,
        message: err.response?.data?.message || err.message,
        code: err.response?.data?.code || 'ERROR',
        details: err.response?.data?.details,
      };
    }
  },

  async syncKea() {
    try {
      const res = await axios.post(`${API_BASE_URL}/kea/sync`, {}, { timeout: 4000 });
      return res.data;
    } catch {
      // Fallback directo a Kea Tools API
      const resp = await fetch(KEA_API_URL, {
        headers: {
          Authorization: `Bearer ${KEA_BEARER_TOKEN}`,
          Accept: 'application/json',
        },
      });
      const data = await resp.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        let added = 0;
        let updated = 0;
        data.data.forEach((rec, idx) => {
          const mapped = mapRawKeaRecord(rec, idx);
          const existingIdx = localPatientsStore.findIndex(
            (p) =>
              p.id === mapped.id ||
              (p.name.toLowerCase() === mapped.name.toLowerCase() &&
                p.lastName.toLowerCase() === mapped.lastName.toLowerCase())
          );
          if (existingIdx !== -1) {
            localPatientsStore[existingIdx] = {
              ...localPatientsStore[existingIdx],
              ...mapped,
              activeExamOrder: localPatientsStore[existingIdx].activeExamOrder || mapped.activeExamOrder,
              clinicalDocuments: localPatientsStore[existingIdx].clinicalDocuments || [],
            };
            updated++;
          } else {
            localPatientsStore.unshift(mapped);
            added++;
          }
        });
        return {
          success: true,
          data: {
            totalInKea: data.data.length,
            added,
            updated,
            totalLocal: localPatientsStore.length,
            patients: [...localPatientsStore],
          },
        };
      }
      throw new Error(data.message || 'Error en respuesta de Kea Tools');
    }
  },
};

export default patientApi;

