/**
 * Modelo de Pacientes sincronizado con Kea Tools
 * Documentación de referencia: https://docs.kea.tools/docs/databases/api/
 */

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

export const initialPatients = [
  {
    id: "PAC-PRUEBA-01",
    keaRecordId: 1,
    name: "Luna",
    lastName: "(PRUEBA)",
    fullName: "Luna (PRUEBA)",
    avatar: "🐕",
    species: "Canino",
    otherSpecies: "",
    breed: "Mestizo",
    sex: "Hembra",
    birthDate: "2022-03-01",
    age: "4 años, 9 meses",
    weight: "18 kg",
    sedeId: "sede-principal-80",
    sedeNombre: "Sede Principal - Calle 80",
    codigoSedeNit: "#nit-900000001",
    microchip: "Sin microchip",
    owner: {
      name: "PROP-PRUEBA-01",
      firstName: "PROP-PRUEBA-01",
      lastName: "",
      phone: "+57 300 000 0000",
      email: "tutor@ejemplo.com",
      city: "Bogotá"
    },
    riskFactors: {
      habitat: "Interiores / Mixto",
      recentTravel: false,
      lastVisitedCountry: "Ninguno",
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: "3/5",
      generalCondition: "Estable",
      physicalFindings: "Condición corporal 3/5, Estable."
    },
    status: "activo",
    isSterilized: false,
    hasAllergies: false,
    allergies: "",
    attendingVet: "TP-PRUEBA-01",
    lastVisit: "09/11/2026",
    source: "Kea Tools DB"
  },
  {
    id: "PAC-PRUEBA-02",
    keaRecordId: 2,
    name: "Michi",
    lastName: "(PRUEBA)",
    fullName: "Michi (PRUEBA)",
    avatar: "🐱",
    species: "Felino",
    otherSpecies: "",
    breed: "Mestizo",
    sex: "Macho",
    birthDate: "2022-03-01",
    age: "4 años, 9 meses",
    weight: "4 kg",
    sedeId: "sede-principal-80",
    sedeNombre: "Sede Principal - Calle 80",
    codigoSedeNit: "#nit-900000001",
    microchip: "Sin microchip",
    owner: {
      name: "PROP-PRUEBA-01",
      firstName: "PROP-PRUEBA-01",
      lastName: "",
      phone: "+57 300 000 0000",
      email: "tutor@ejemplo.com",
      city: "Bogotá"
    },
    riskFactors: {
      habitat: "Interiores / Mixto",
      recentTravel: false,
      lastVisitedCountry: "Ninguno",
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: "3/5",
      generalCondition: "Estable",
      physicalFindings: "Condición corporal 3/5, Estable."
    },
    status: "activo",
    isSterilized: false,
    hasAllergies: false,
    allergies: "",
    attendingVet: "TP-PRUEBA-01",
    lastVisit: "09/11/2026",
    source: "Kea Tools DB"
  },
  {
    id: "PAC-PRUEBA-03",
    keaRecordId: 3,
    name: "Rocky",
    lastName: "(PRUEBA)",
    fullName: "Rocky (PRUEBA)",
    avatar: "🐕",
    species: "Canino",
    otherSpecies: "",
    breed: "Mestizo",
    sex: "Macho",
    birthDate: "2022-03-01",
    age: "4 años, 9 meses",
    weight: "30 kg",
    sedeId: "sede-principal-80",
    sedeNombre: "Sede Principal - Calle 80",
    codigoSedeNit: "#nit-900000002",
    microchip: "Sin microchip",
    owner: {
      name: "PROP-PRUEBA-02",
      firstName: "PROP-PRUEBA-02",
      lastName: "",
      phone: "+57 300 000 0000",
      email: "tutor@ejemplo.com",
      city: "Bogotá"
    },
    riskFactors: {
      habitat: "Interiores / Mixto",
      recentTravel: false,
      lastVisitedCountry: "Ninguno",
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: "3/5",
      generalCondition: "Estable",
      physicalFindings: "Condición corporal 3/5, Estable."
    },
    status: "activo",
    isSterilized: false,
    hasAllergies: false,
    allergies: "",
    attendingVet: "TP-PRUEBA-02",
    lastVisit: "09/11/2026",
    source: "Kea Tools DB"
  },
  {
    id: "PAC-R01",
    keaRecordId: 4,
    name: "Sotia",
    lastName: "",
    fullName: "Sotia",
    avatar: "🐕",
    species: "Canino",
    otherSpecies: "",
    breed: "Labrador",
    sex: "Macho",
    birthDate: "2026-08-04",
    age: "3 meses",
    weight: "Sin registrar",
    sedeId: "sede-principal-80",
    sedeNombre: "Sede Principal - Calle 80",
    codigoSedeNit: "#nit-900949599",
    microchip: "Sin microchip",
    owner: {
      name: "001",
      firstName: "001",
      lastName: "",
      phone: "+57 300 000 0000",
      email: "tutor@ejemplo.com",
      city: "Bogotá"
    },
    riskFactors: {
      habitat: "Interiores / Mixto",
      recentTravel: false,
      lastVisitedCountry: "Ninguno",
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: "3/5",
      generalCondition: "Estable",
      physicalFindings: "Condición corporal 3/5, Estable."
    },
    status: "activo",
    isSterilized: false,
    hasAllergies: false,
    allergies: "",
    attendingVet: "Dr. Asignado",
    lastVisit: "09/11/2026",
    source: "Kea Tools DB"
  },
  {
    id: "PAC-PROP-PRUEBA-01-LOLA",
    keaRecordId: 5,
    name: "Lola",
    lastName: "",
    fullName: "Lola",
    avatar: "🐱",
    species: "Felino",
    otherSpecies: "",
    breed: "idk",
    sex: "Macho",
    birthDate: "2026-11-02",
    age: "0 meses",
    weight: "Sin registrar",
    sedeId: "sede-principal-80",
    sedeNombre: "Sede Principal - Calle 80",
    codigoSedeNit: "#nit-1000087681",
    microchip: "Sin microchip",
    owner: {
      name: "PROP-PRUEBA-01",
      firstName: "PROP-PRUEBA-01",
      lastName: "",
      phone: "+57 300 000 0000",
      email: "tutor@ejemplo.com",
      city: "Bogotá"
    },
    riskFactors: {
      habitat: "Interiores / Mixto",
      recentTravel: false,
      lastVisitedCountry: "Ninguno",
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: "3/5",
      generalCondition: "Estable",
      physicalFindings: "Condición corporal 3/5, Estable."
    },
    status: "activo",
    isSterilized: false,
    hasAllergies: false,
    allergies: "",
    attendingVet: "TP-PRUEBA-01",
    lastVisit: "09/11/2026",
    source: "Kea Tools DB"
  },
  {
    id: "PAC-542133",
    keaRecordId: 6,
    name: "Lucas",
    lastName: "",
    fullName: "Lucas",
    avatar: "🐱",
    species: "Felino",
    otherSpecies: "",
    breed: "cruce",
    sex: "Macho",
    birthDate: "2026-11-02",
    age: "0 meses",
    weight: "Sin registrar",
    sedeId: "sede-principal-80",
    sedeNombre: "Sede Principal - Calle 80",
    codigoSedeNit: "#nit-900949599",
    microchip: "Sin microchip",
    owner: {
      name: "98542",
      firstName: "98542",
      lastName: "",
      phone: "+57 300 000 0000",
      email: "tutor@ejemplo.com",
      city: "Bogotá"
    },
    riskFactors: {
      habitat: "Interiores / Mixto",
      recentTravel: false,
      lastVisitedCountry: "Ninguno",
      livesWithOtherAnimals: true,
      ruralAccess: false
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: [],
      bodyCondition: "3/5",
      generalCondition: "Estable",
      physicalFindings: "Condición corporal 3/5, Estable."
    },
    status: "activo",
    isSterilized: false,
    hasAllergies: false,
    allergies: "",
    attendingVet: "Dr. Asignado",
    lastVisit: "09/11/2026",
    source: "Kea Tools DB"
  }
];

export let patientsStore = [...initialPatients];
