import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/patients';

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
    id: 'PAC-001',
    name: 'Luna',
    lastName: 'González',
    avatar: '🐱',
    species: 'Felino',
    breed: 'Siamés',
    sex: 'Hembra',
    birthDate: '2023-05-12',
    age: '3 años, 4 meses',
    weight: '4.2 kg',
    isSterilized: true,
    hasAllergies: false,
    allergies: '',
    medicalBackground: 'Sin cirugías previas ni patologías crónicas conocidas.',
    owner: {
      firstName: 'María',
      lastName: 'González',
      name: 'María González',
      document: '1.020.345.678',
      phone: '+57 310 123 4567',
      emergencyPhone: '+57 314 999 8877',
      email: 'maria.gonzalez@email.com',
      department: 'Bogotá D.C.',
      city: 'Bogotá',
      address: 'Cra 15 # 85-30, Apto 402',
      stratum: 'Estrato 4',
      hasVetPlus: true,
      vetPlusCode: 'VP-90284-COL',
    },
    riskFactors: {
      habitat: 'Interiores',
      contactOutside: { hasContact: false, contactType: '' },
      livesWithOtherAnimals: true,
      recentTravel: false,
      ruralAccess: false,
      parasiteExposure: false,
      outdoorWater: false,
      coastalRescue: false,
      otherRiskFactors: 'Ninguno',
    },
    medicalAdmission: {
      isAsymptomatic: true,
      symptoms: [],
      otherSymptoms: '',
      physicalFindings: 'Condición corporal 3/5, normotérmica.',
      consultationType: 'Control',
      generalCondition: 'Bueno',
      vaccinationStatus: 'Al día',
      lastVaccinationDate: '15/01/2026',
      dewormingStatus: 'Al día',
      lastDewormingDate: '10/06/2026',
    },
    status: 'activo',
    lastVisit: '05/09/2026',
    attendingVet: 'Dr. Alejandro Morales',
    notes: 'Paciente con buena condición corporal. Antecedente leve de disbiosis resuelto.',
    activeExamOrder: {
      id: 'ORD-2026-904',
      testName: 'qPCR Panel Microbiota & Disbiosis Intestinal',
      category: 'Biología Molecular Cuantitativa (qPCR)',
      sampleType: 'Hisopado rectal / Heces (Tubo conservador ARN/ADN)',
      priority: 'Normal (24-48h)',
      requestedBy: 'Dr. Alejandro Morales',
      laboratory: 'VetLab Central - Unidad de Genómica',
      targets: 'Faecalibacterium, Turicibacter, E. coli, Streptococcus, Blautia, C. hiranonis',
      requestedAt: '05/09/2026 - 08:30 AM',
      currentStep: 4,
      steps: [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: '05/09/2026 08:30 AM', completed: true },
        { label: 'Muestra recibida', desc: 'Recepción y código de barras en laboratorio', date: '05/09/2026 10:15 AM', completed: true },
        { label: 'En análisis qPCR', desc: 'Extracción de ácidos nucleicos y amplificación en termociclador', date: '05/09/2026 02:40 PM', completed: true },
        { label: 'Validación médica', desc: 'Curvas de amplificación verificadas por patólogo molecular', date: '05/09/2026 04:20 PM', completed: true },
        { label: 'Resultado enviado', desc: 'Informe emitido y disponible para descarga', date: '05/09/2026 05:00 PM', completed: true },
      ],
    },
    healthMetrics: {
      weightHistory: [
        { date: '15/01/2026', weight: '3.8 kg' },
        { date: '10/05/2026', weight: '4.0 kg' },
        { date: '05/09/2026', weight: '4.2 kg' },
      ],
      vitalSigns: { heartRate: '140 bpm', temperature: '38.4 °C', respiratoryRate: '24 rpm', mucosa: 'Rosadas y húmedas' },
      lastDiagnosticScore: '-1.4 (Microbiota Saludable / Normal)',
    },
    consultations: [
      {
        date: '05/09/2026',
        time: '10:30 AM',
        vet: 'Dr. Alejandro Morales',
        weight: '4.2 kg',
        clinicalStatus: 'Estable',
        vitalSigns: {
          heartRate: '140 bpm',
          temperature: '38.4 °C',
          respiratoryRate: '24 rpm',
          mucosa: 'Rosadas y húmedas',
        },
        reason: 'Control anual y chequeo gastrointestinal',
        medication: 'Probióticos de mantenimiento x 3 meses.',
        relevantBackground: 'Episodio de disbiosis previa resuelto.',
        observationsAndFollowUp: 'Microbiota equilibrada. Próximo control preventivo en 6 meses.',
      },
    ],
    qpcrExams: [
      {
        id: 'QPCR-2026-812',
        testName: 'qPCR Panel Microbiota & Disbiosis Intestinal',
        date: '05/09/2026',
        requestedAt: '05/09/2026, 08:30 AM',
        receivedAt: '05/09/2026, 05:00 PM',
        status: 'Emitido',
        sampleType: 'Hisopado rectal / Heces (Tubo conservador ARN/ADN)',
        resultSummary: 'Índice DI: -1.4 (Microbiota Saludable / En rango eubiótico)',
        methodology: 'qPCR multiplex cuantitativa en tiempo real (Sondas TaqMan)',
        reportUrl: '#',
        agents: [
          { name: 'Faecalibacterium', isPositive: false, result: 'Normal', ct: '19.2', load: 'Dentro de rango fisiológico [> 3.5 log10]' },
          { name: 'Turicibacter', isPositive: false, result: 'Normal', ct: '21.0', load: 'Dentro de rango fisiológico' },
          { name: 'Clostridium hiranonis', isPositive: false, result: 'Normal', ct: '23.4', load: 'Eubiosis adecuada' },
          { name: 'Blautia', isPositive: false, result: 'Normal', ct: '18.9', load: 'Dentro de rango fisiológico' },
          { name: 'Escherichia coli', isPositive: false, result: 'Normal', ct: '28.1', load: 'Sin sobrecrecimiento (< 5.0 log10)' },
          { name: 'Streptococcus', isPositive: false, result: 'Normal', ct: '29.5', load: 'Sin sobrecrecimiento (< 4.5 log10)' },
        ],
      },
    ],
  },
  {
    id: 'PAC-002',
    name: 'Max',
    lastName: 'Rodríguez',
    avatar: '🐶',
    species: 'Canino',
    breed: 'Golden Retriever',
    sex: 'Macho',
    birthDate: '2021-08-20',
    age: '5 años',
    weight: '31.5 kg',
    isSterilized: true,
    hasAllergies: true,
    allergies: 'Sensibilidad severa a cefalexina',
    medicalBackground: 'Episodio previo de ehrlichiosis canina hace 1 año.',
    owner: {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      name: 'Carlos Rodríguez',
      document: '79.845.123',
      phone: '+57 312 987 6543',
      emergencyPhone: '+57 310 888 1234',
      email: 'carlos.rodriguez@email.com',
      department: 'Cundinamarca',
      city: 'Chía',
      address: 'Calle 116 # 7-15, Bogotá',
      stratum: 'Estrato 5',
      hasVetPlus: false,
      vetPlusCode: '',
    },
    riskFactors: {
      habitat: 'Mixto',
      contactOutside: { hasContact: true, contactType: 'Parques caninos y paseos en grupo' },
      livesWithOtherAnimals: false,
      recentTravel: true,
      ruralAccess: true,
      parasiteExposure: true,
      outdoorWater: true,
      coastalRescue: false,
      otherRiskFactors: 'Presencia previa de garrapatas en finca',
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: ['Fiebre', 'Decaimiento', 'Pérdida de apetito', 'Letargia'],
      otherSymptoms: '',
      physicalFindings: 'Temperatura 39.1°C, mucosas ligeramente pálidas.',
      consultationType: 'Urgencia',
      generalCondition: 'Regular',
      vaccinationStatus: 'Al día',
      lastVaccinationDate: '10/02/2026',
      dewormingStatus: 'Incompleto',
      lastDewormingDate: '15/11/2025',
    },
    status: 'en tratamiento',
    lastVisit: '02/10/2026',
    attendingVet: 'Dra. Camila Torres',
    notes: 'Sospecha de hemotrópicos. En terapia con doxiciclina.',
    activeExamOrder: {
      id: 'ORD-2026-915',
      testName: 'Panel Hemotrópicos Caninos (qPCR)',
      category: 'Biología Molecular Cuantitativa (qPCR)',
      sampleType: 'Sangre total con EDTA (2 ml)',
      priority: 'Urgente (Mismo día)',
      requestedBy: 'Dra. Camila Torres',
      laboratory: 'VetLab Central - Unidad de Genómica',
      targets: 'Ehrlichia canis, Anaplasma platys, Babesia canis, Hepatozoon canis',
      requestedAt: '02/10/2026 - 11:00 AM',
      currentStep: 2,
      steps: [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: '02/10/2026 11:00 AM', completed: true },
        { label: 'Muestra recibida', desc: 'Recepción y código de barras en laboratorio', date: '02/10/2026 01:20 PM', completed: true },
        { label: 'En análisis qPCR', desc: 'Extracción de ácidos nucleicos y amplificación en termociclador', date: 'En curso', completed: false },
        { label: 'Validación médica', desc: 'Curvas de amplificación verificadas por patólogo molecular', date: 'Pendiente', completed: false },
        { label: 'Resultado enviado', desc: 'Informe emitido y disponible para descarga', date: 'Pendiente', completed: false },
      ],
    },
    healthMetrics: {
      weightHistory: [
        { date: '02/08/2026', weight: '32.0 kg' },
        { date: '02/10/2026', weight: '31.5 kg' },
      ],
      vitalSigns: { heartRate: '95 bpm', temperature: '39.1 °C', respiratoryRate: '20 rpm', mucosa: 'Ligeramente pálidas' },
      lastDiagnosticScore: 'Pendiente de resultado qPCR',
    },
    consultations: [],
    qpcrExams: [
      {
        id: 'QPCR-2026-904',
        testName: 'Panel Hemotrópico & Vectorial Canino Completo (TBP)',
        date: '02/09/2026',
        requestedAt: '02/09/2026, 08:30 AM',
        receivedAt: '03/09/2026, 04:30 PM',
        status: 'Emitido',
        sampleType: 'Sangre total con EDTA (2 ml)',
        resultSummary: 'Detección POSITIVA (+) para Ehrlichia canis y Anaplasma platys. Correlación directa con síndrome febril y trombocitopenia.',
        methodology: 'qPCR multiplex cuantitativa en tiempo real (Sondas de hidrólisis TaqMan)',
        reportUrl: '#',
        agents: [
          { name: 'Ehrlichia canis', isPositive: true, result: 'POSITIVO (+)', ct: '22.8', load: 'Carga genómica alta' },
          { name: 'Anaplasma platys', isPositive: true, result: 'POSITIVO (+)', ct: '27.4', load: 'Carga genómica moderada' },
          { name: 'Hepatozoon canis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Anaplasma phagocytophilum', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Rickettsia rickettsii', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Mycoplasma haemocanis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Bartonella spp. (canina)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
        ],
      },
    ],
  },
  {
    id: 'PAC-003',
    name: 'Milo',
    lastName: 'Martínez',
    avatar: '🐶',
    species: 'Canino',
    breed: 'Bulldog Francés',
    sex: 'Macho',
    birthDate: '2024-07-15',
    age: '2 años, 1 mes',
    weight: '12.8 kg',
    isSterilized: false,
    hasAllergies: true,
    allergies: 'Pollo y derivados de ave',
    medicalBackground: 'Gastroenteritis recurrente.',
    owner: {
      firstName: 'Ana',
      lastName: 'Martínez',
      name: 'Ana Martínez',
      document: '52.987.654',
      phone: '+57 315 555 4321',
      emergencyPhone: '+57 311 222 3344',
      email: 'ana.martinez@email.com',
      department: 'Bogotá D.C.',
      city: 'Bogotá',
      address: 'Carrera 7 # 127-45',
      stratum: 'Estrato 4',
      hasVetPlus: true,
      vetPlusCode: 'VP-88210-BOG',
    },
    riskFactors: {
      habitat: 'Interiores',
      contactOutside: { hasContact: false, contactType: '' },
      livesWithOtherAnimals: false,
      recentTravel: false,
      ruralAccess: false,
      parasiteExposure: false,
      outdoorWater: false,
      coastalRescue: false,
      otherRiskFactors: 'Ninguno',
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: ['Vómito', 'Diarrea', 'Decaimiento'],
      otherSymptoms: '',
      physicalFindings: 'Deshidratación 6%, dolor a la palpación abdominal.',
      consultationType: 'Urgencia',
      generalCondition: 'Regular',
      vaccinationStatus: 'Al día',
      lastVaccinationDate: '01/03/2026',
      dewormingStatus: 'Al día',
      lastDewormingDate: '10/05/2026',
    },
    status: 'internado',
    lastVisit: '06/10/2026',
    attendingVet: 'Dr. Alejandro Morales',
    notes: 'Internado en UCI veterinaria por cuadro de gastroenteritis.',
    activeExamOrder: {
      id: 'ORD-2026-920',
      testName: 'Panel Diarrea Canina Completo (qPCR)',
      category: 'Biología Molecular Cuantitativa (qPCR)',
      sampleType: 'Hisopado fecal',
      priority: 'Urgente (Mismo día)',
      requestedBy: 'Dr. Alejandro Morales',
      laboratory: 'VetLab Central - Unidad de Genómica',
      targets: 'Parvovirus canino, Coronavirus canino, Giardia lamblia, Cryptosporidium',
      requestedAt: '06/10/2026 - 09:15 AM',
      currentStep: 1,
      steps: [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: '06/10/2026 09:15 AM', completed: true },
        { label: 'Muestra recibida', desc: 'Recepción y código de barras en laboratorio', date: '06/10/2026 11:00 AM', completed: true },
        { label: 'En análisis qPCR', desc: 'Extracción de ácidos nucleicos y amplificación en termociclador', date: 'Pendiente', completed: false },
        { label: 'Validación médica', desc: 'Curvas de amplificación verificadas por patólogo molecular', date: 'Pendiente', completed: false },
        { label: 'Resultado enviado', desc: 'Informe emitido y disponible para descarga', date: 'Pendiente', completed: false },
      ],
    },
    healthMetrics: {
      vitalSigns: { heartRate: '135 bpm', temperature: '38.9 °C', respiratoryRate: '28 rpm', mucosa: 'Pálidas' },
    },
    consultations: [],
    qpcrExams: [
      {
        id: 'QPCR-2026-750',
        testName: 'Panel Diarrea Canina & Patógenos Entéricos Completo',
        date: '12/08/2026',
        requestedAt: '12/08/2026, 09:15 AM',
        receivedAt: '13/08/2026, 02:45 PM',
        status: 'Emitido',
        sampleType: 'Hisopado rectal / Muestra de heces frescas',
        resultSummary: 'Detección POSITIVA (+) para Cryptosporidium spp. y Clostridium perfringens enterotoxin. Hallazgo etiológico de enteritis infecciosa aguda.',
        methodology: 'qPCR multiplex cuantitativa en tiempo real (Sondas TaqMan)',
        reportUrl: '#',
        agents: [
          { name: 'Cryptosporidium spp.', isPositive: true, result: 'POSITIVO (+)', ct: '24.1', load: 'Carga parasitaria moderada-alta' },
          { name: 'Clostridium perfringens enterotoxin', isPositive: true, result: 'POSITIVO (+)', ct: '21.8', load: 'Carga bacteriana elevada (gen cpe detectable)' },
          { name: 'Giardia lamblia', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Parvovirus canino (CPV-2)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Coronavirus entérico canino (CCoV)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Salmonella enterica', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Campylobacter jejuni', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
        ],
      },
    ],
  },
  {
    id: 'PAC-004',
    name: 'Thor',
    lastName: 'Salamanca',
    avatar: '🐶',
    species: 'Canino',
    breed: 'Rottweiler',
    sex: 'Macho',
    birthDate: '2015-02-10',
    age: '11 años',
    weight: '42.0 kg',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    medicalBackground: 'Cardiopatía dilatada y falla renal crónica.',
    owner: {
      firstName: 'Andrés',
      lastName: 'Salamanca',
      name: 'Andrés Salamanca',
      document: '19.456.789',
      phone: '+57 311 000 9988',
      emergencyPhone: '',
      email: 'andres.s@email.com',
      department: 'Bogotá D.C.',
      city: 'Bogotá',
      address: 'Carrera 9 # 72-10',
      stratum: 'Estrato 5',
      hasVetPlus: false,
      vetPlusCode: '',
    },
    riskFactors: {
      habitat: 'Mixto',
      contactOutside: { hasContact: false, contactType: '' },
      livesWithOtherAnimals: false,
      recentTravel: false,
      ruralAccess: false,
      parasiteExposure: false,
      outdoorWater: false,
      coastalRescue: false,
      otherRiskFactors: 'Paciente geriátrico',
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: ['Letargia', 'Anorexia'],
      otherSymptoms: '',
      physicalFindings: 'Falla multiorgánica terminal.',
      consultationType: 'Consulta',
      generalCondition: 'Crítico',
      vaccinationStatus: 'Desconocido',
      lastVaccinationDate: '',
      dewormingStatus: 'Desconocido',
      lastDewormingDate: '',
    },
    status: 'fallecido',
    lastVisit: '15/07/2026',
    attendingVet: 'Dr. Alejandro Morales',
    notes: 'Paciente geriátrico con falla multiorgánica terminal. Ficha histórica archivada.',
    activeExamOrder: null,
    consultations: [],
    qpcrExams: [],
  },
];

let localPatientsStore = [...FALLBACK_PATIENTS];

export const patientApi = {
  async getStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`, { timeout: 2000 });
      return response.data.data;
    } catch {
      const active = localPatientsStore.filter((p) => p.status === 'activo').length;
      const inProgress = localPatientsStore.filter((p) => p.activeExamOrder && p.activeExamOrder.currentStep < 4).length;
      const ready = localPatientsStore.filter((p) => p.activeExamOrder && p.activeExamOrder.currentStep === 4).length;
      const hosp = localPatientsStore.filter((p) => p.status === 'internado').length;
      return { activePatients: active, ordersInProgress: inProgress, resultsReady: ready, hospitalized: hosp };
    }
  },

  async getPatients(filters = {}) {
    try {
      const response = await axios.get(API_BASE_URL, { params: filters, timeout: 2000 });
      return response.data.data;
    } catch {
      let list = [...localPatientsStore];
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

        localPatientsStore[idx] = {
          ...currentPatient,
          ...updatedData,
          isSterilized,
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
        return localPatientsStore[idx];
      }
      throw err;
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
        id: `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
        testName: examData.testName || 'Panel Diagnóstico Molecular qPCR',
        category: 'Biología Molecular Cuantitativa (qPCR)',
        sampleType: examData.sampleType || 'Hisopado / Muestra biológica',
        priority: examData.urgency || 'Normal (24-48h)',
        requestedBy: examData.requestedBy || 'Dr. Alejandro Morales',
        laboratory: 'VetLab Central - Unidad de Genómica',
        targets: examData.targets || 'Detección cuantitativa de patógenos diana',
        syndromes: examData.syndromes || [],
        findings: examData.findings || [],
        totalPrice: examData.totalPrice || '$145.000',
        examType: examData.examType || 'nuevo',
        previousExamCode: examData.previousExamCode || null,
        requestedAt: formattedDate,
        currentStep: 0,
        steps: [
          { label: 'Solicitud creada', desc: 'Orden médica generada', date: formattedDate, completed: true },
          { label: 'Muestra recibida', desc: 'Ingreso a laboratorio', date: 'Pendiente', completed: false },
          { label: 'En análisis qPCR', desc: 'Extracción y amplificación', date: 'Pendiente', completed: false },
          { label: 'Validación médica', desc: 'Revisión por patólogo', date: 'Pendiente', completed: false },
          { label: 'Resultado enviado', desc: 'Informe emitido a clínica', date: 'Pendiente', completed: false },
        ],
      };

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
      const newId = `PAC-${String(maxNum + 1).padStart(3, '0')}`;
      const ownerName = patientData.ownerName || `${patientData.ownerFirstName || ''} ${patientData.ownerLastName || ''}`.trim();
      const newPatient = {
        id: newId,
        avatar: patientData.avatar || (patientData.species?.toLowerCase().includes('felin') ? '🐱' : '🐶'),
        name: patientData.name,
        lastName: patientData.lastName || patientData.ownerLastName || '',
        species: patientData.species,
        breed: patientData.breed,
        sex: patientData.sex,
        birthDate: patientData.birthDate,
        age: patientData.age || '1 año',
        weight: patientData.weight,
        isSterilized: Boolean(patientData.isSterilized),
        hasAllergies: Boolean(patientData.hasAllergies),
        allergies: patientData.hasAllergies ? (patientData.allergies || 'Alergia reportada') : '',
        medicalBackground: patientData.medicalBackground || 'Sin antecedentes patológicos previos',
        owner: {
          name: ownerName,
          phone: patientData.ownerPhone || '',
          emergencyPhone: patientData.ownerEmergencyPhone || '',
          email: patientData.ownerEmail || '',
          department: patientData.ownerDepartment || 'Bogotá D.C.',
          city: patientData.ownerCity || 'Bogotá',
          address: patientData.ownerAddress || '',
          stratum: patientData.ownerStratum || 'Estrato 3',
          hasVetPlus: Boolean(patientData.ownerHasVetPlus),
          vetPlusCode: patientData.ownerVetPlusCode || '',
        },
        riskFactors: {
          habitat: patientData.habitat || 'Interiores',
          contactOutside: patientData.contactOutside || { hasContact: false, contactType: '' },
          livesWithOtherAnimals: Boolean(patientData.livesWithOtherAnimals),
          recentTravel: Boolean(patientData.recentTravel),
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
          generalCondition: patientData.generalCondition || 'Bueno',
          vaccinationStatus: patientData.vaccinationStatus || 'No registrado',
          lastVaccinationDate: patientData.vaccinationStatus === 'Desconocido' ? '' : (patientData.lastVaccinationDate || ''),
          dewormingStatus: patientData.dewormingStatus || 'No registrado',
          lastDewormingDate: patientData.dewormingStatus === 'Desconocido' ? '' : (patientData.lastDewormingDate || ''),
        },
        status: patientData.status || 'activo',
        lastVisit: new Date().toLocaleDateString('es-ES'),
        attendingVet: 'Dr. Alejandro Morales',
        notes: patientData.physicalFindings ? `Admisión: ${patientData.physicalFindings}` : '',
        healthMetrics: {
          weightHistory: [{ date: new Date().toLocaleDateString('es-ES'), weight: patientData.weight || '4.0 kg' }],
          vitalSigns: {
            heartRate: patientData.vitalSignsHeartRate || patientData.vitalSigns?.heartRate || 'No registrada',
            temperature: patientData.vitalSignsTemp || patientData.vitalSigns?.temperature || 'No registrada',
            respiratoryRate: patientData.vitalSignsResp || patientData.vitalSigns?.respiratoryRate || 'No registrada',
            mucosa: patientData.vitalSignsMucosa || patientData.vitalSigns?.mucosa || 'No registrada',
          },
          lastDiagnosticScore: 'Sin registros previos',
        },
        activeExamOrder: patientData.requestExam
          ? {
              id: `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
              testName: patientData.initialExamName || 'qPCR Panel Diagnóstico',
              category: 'Biología Molecular Cuantitativa (qPCR)',
              sampleType: 'Hisopado / Muestra biológica',
              priority: 'Normal (24-48h)',
              requestedBy: 'Dr. Alejandro Morales',
              laboratory: 'VetLab Central - Unidad de Genómica',
              targets: 'Detección cuantitativa de patógenos diana',
              requestedAt: `${new Date().toLocaleDateString('es-ES')} - 09:00 AM`,
              currentStep: 0,
              steps: [
                { label: 'Solicitud creada', desc: 'Orden médica generada', date: 'Hoy', completed: true },
                { label: 'Muestra recibida', desc: 'Ingreso a laboratorio', date: 'Pendiente', completed: false },
                { label: 'En análisis qPCR', desc: 'Extracción y amplificación', date: 'Pendiente', completed: false },
                { label: 'Validación médica', desc: 'Revisión por patólogo', date: 'Pendiente', completed: false },
                { label: 'Resultado enviado', desc: 'Informe emitido a clínica', date: 'Pendiente', completed: false },
              ],
            }
          : null,
        consultations: [],
        qpcrExams: [],
        createdAt: new Date().toISOString(),
      };
      localPatientsStore.unshift(newPatient);
      return newPatient;
    }
  },
};

export default patientApi;

