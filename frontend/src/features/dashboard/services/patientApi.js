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
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-1',
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
    sedeId: 'sede-norte-127',
    sedeNombre: 'Sede Norte - Santa Bárbara',
    codigoSedeNit: '#nit-2',
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
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-1',
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
    sedeId: 'sede-sabana-chia',
    sedeNombre: 'Sede Sabana - Chía',
    codigoSedeNit: '#nit-3',
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
      department: 'Cundinamarca',
      city: 'Chía',
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
  {
    id: 'PAC-005',
    name: 'Simba',
    lastName: 'Morales',
    avatar: '🐱',
    species: 'Felino',
    breed: 'Persa',
    sex: 'Macho',
    birthDate: '2022-04-18',
    age: '4 años, 5 meses',
    weight: '4.8 kg',
    sedeId: 'sede-sabana-chia',
    sedeNombre: 'Sede Sabana - Chía',
    codigoSedeNit: '#nit-3',
    isSterilized: true,
    hasAllergies: false,
    allergies: '',
    medicalBackground: 'Sin antecedentes respiratorios previos.',
    owner: {
      firstName: 'Valentina',
      lastName: 'Morales',
      name: 'Valentina Morales',
      document: '1.019.876.543',
      phone: '+57 320 654 9871',
      emergencyPhone: '+57 311 234 5678',
      email: 'valentina.morales@gmail.com',
      department: 'Cundinamarca',
      city: 'Chía',
      address: 'Km 2 Vía Chía-Cajicá, Condominio El Roble Casa 12',
      stratum: 'Estrato 5',
      hasVetPlus: true,
      vetPlusCode: 'VP-91024-COL',
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
      isAsymptomatic: false,
      symptoms: ['Secreción ocular', 'Estornudos frecuentes'],
      otherSymptoms: 'Blefarospasmo unilateral leve',
      physicalFindings: 'Secreción serosa bilateral, conjuntivitis leve.',
      consultationType: 'Consulta especializada',
      generalCondition: 'Bueno',
      vaccinationStatus: 'Al día',
      lastVaccinationDate: '10/02/2026',
      dewormingStatus: 'Al día',
      lastDewormingDate: '10/08/2026',
    },
    status: 'activo',
    lastVisit: '02/10/2026',
    attendingVet: 'Dr. Alejandro Morales',
    notes: 'Sospecha de complejo respiratorio felino (Herpesvirus vs Calicivirus).',
    activeExamOrder: {
      id: 'ORD-2026-905',
      testName: 'qPCR Panel Respiratorio Felino Completo',
      category: 'Biología Molecular Cuantitativa (qPCR)',
      sampleType: 'Hisopado conjuntival y orofaríngeo',
      priority: 'Normal (24-48h)',
      requestedBy: 'Dr. Alejandro Morales',
      laboratory: 'VetLab Central - Unidad de Genómica',
      targets: 'FHV-1, FCV, Chlamydia felis, Mycoplasma felis, Bordetella bronchiseptica',
      requestedAt: '02/10/2026 - 11:20 AM',
      currentStep: 2,
      steps: [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: '02/10/2026 11:20 AM', completed: true },
        { label: 'Muestra recibida', desc: 'Recepción y código de barras en laboratorio', date: '02/10/2026 02:40 PM', completed: true },
        { label: 'En análisis qPCR', desc: 'Extracción de ácidos nucleicos y amplificación en termociclador', date: '02/10/2026 05:15 PM', completed: true },
        { label: 'Validación médica', desc: 'Curvas de amplificación verificadas por patólogo molecular', date: '', completed: false },
        { label: 'Resultado enviado', desc: 'Informe emitido y disponible para descarga', date: '', completed: false },
      ],
    },
    healthMetrics: {
      weightHistory: [
        { date: '10/02/2026', weight: '4.6 kg', note: 'Control de vacunación' },
        { date: '02/10/2026', weight: '4.8 kg', note: 'Consulta por estornudos' },
      ],
      vitalSigns: {
        heartRate: '150 bpm',
        temperature: '38.6 °C',
        respiratoryRate: '26 rpm',
        mucosa: 'Rosadas',
      },
    },
    consultations: [],
    qpcrExams: [],
  },
  {
    id: 'PAC-006',
    name: 'Bella',
    lastName: 'Cárdenas',
    avatar: '🐶',
    species: 'Canino',
    breed: 'Bulldog Francés',
    sex: 'Hembra',
    birthDate: '2023-09-05',
    age: '3 años',
    weight: '11.2 kg',
    sedeId: 'sede-norte-127',
    sedeNombre: 'Sede Norte - Santa Bárbara',
    codigoSedeNit: '#nit-2',
    isSterilized: true,
    hasAllergies: true,
    allergies: 'Alergia a proteínas de pollo y ácaros del polvo',
    medicalBackground: 'Atopia canina diagnosticada en 2024.',
    owner: {
      firstName: 'Felipe',
      lastName: 'Cárdenas',
      name: 'Felipe Cárdenas',
      document: '80.765.432',
      phone: '+57 316 432 1098',
      emergencyPhone: '+57 310 987 6543',
      email: 'felipe.cardenas@empresa.com',
      department: 'Bogotá D.C.',
      city: 'Bogotá',
      address: 'Calle 122 # 15-45, Apto 501',
      stratum: 'Estrato 5',
      hasVetPlus: true,
      vetPlusCode: 'VP-94301-COL',
    },
    riskFactors: {
      habitat: 'Interiores',
      contactOutside: { hasContact: true, contactType: 'Parque canino' },
      livesWithOtherAnimals: false,
      recentTravel: false,
      ruralAccess: false,
      parasiteExposure: true,
      outdoorWater: false,
      coastalRescue: false,
      otherRiskFactors: 'Dermatitis atópica estacional',
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: ['Prurito podal', 'Eritema interdigital'],
      otherSymptoms: 'Lesiones alopécicas focales',
      physicalFindings: 'Eritema intenso en pliegues faciales y zonas interdigitales.',
      consultationType: 'Dermatología',
      generalCondition: 'Bueno',
      vaccinationStatus: 'Al día',
      lastVaccinationDate: '05/01/2026',
      dewormingStatus: 'Al día',
      lastDewormingDate: '01/09/2026',
    },
    status: 'activo',
    lastVisit: '04/10/2026',
    attendingVet: 'Dra. Camila Torres',
    notes: 'Toma de raspado cutáneo e hisopado para qPCR dermatológico.',
    activeExamOrder: {
      id: 'ORD-2026-906',
      testName: 'qPCR Panel Dermatofitos & Levaduras Patógenas',
      category: 'Biología Molecular Cuantitativa (qPCR)',
      sampleType: 'Raspado cutáneo y pelo',
      priority: 'Normal (24-48h)',
      requestedBy: 'Dra. Camila Torres',
      laboratory: 'VetLab Central - Unidad de Genómica',
      targets: 'Microsporum canis, Trichophyton mentagrophytes, Malassezia pachydermatis',
      requestedAt: '04/10/2026 - 09:40 AM',
      currentStep: 4,
      steps: [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: '04/10/2026 09:40 AM', completed: true },
        { label: 'Muestra recibida', desc: 'Recepción y código de barras en laboratorio', date: '04/10/2026 11:30 AM', completed: true },
        { label: 'En análisis qPCR', desc: 'Extracción de ácidos nucleicos y termociclaje', date: '04/10/2026 03:00 PM', completed: true },
        { label: 'Validación médica', desc: 'Curvas validadas por patólogo molecular', date: '04/10/2026 05:20 PM', completed: true },
        { label: 'Resultado enviado', desc: 'Informe emitido y disponible para descarga', date: '04/10/2026 06:00 PM', completed: true },
      ],
    },
    healthMetrics: {
      weightHistory: [
        { date: '05/01/2026', weight: '10.8 kg', note: 'Vacunación' },
        { date: '04/10/2026', weight: '11.2 kg', note: 'Consulta dermatología' },
      ],
      vitalSigns: {
        heartRate: '128 bpm',
        temperature: '38.5 °C',
        respiratoryRate: '22 rpm',
        mucosa: 'Rosadas',
      },
    },
    consultations: [],
    qpcrExams: [
      {
        id: 'QPCR-2026-906',
        testName: 'qPCR Panel Dermatofitos & Levaduras Patógenas',
        date: '04/10/2026',
        requestedAt: '04/10/2026, 09:40 AM',
        receivedAt: '04/10/2026, 06:00 PM',
        status: 'Emitido',
        sampleType: 'Raspado cutáneo y pelo',
        resultSummary: 'Malassezia pachydermatis POSITIVA (+). Negativo para Microsporum canis y Trichophyton.',
        methodology: 'qPCR tiempo real con sondas de hidrólisis TaqMan',
        reportUrl: '#',
        agents: [
          { name: 'Malassezia pachydermatis', isPositive: true, result: 'POSITIVO (+)', ct: '21.4', load: 'Carga alta' },
          { name: 'Microsporum canis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
          { name: 'Trichophyton mentagrophytes', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
        ],
      },
    ],
  },
  {
    id: 'PAC-007',
    name: 'Zeus',
    lastName: 'Ospina',
    avatar: '🐶',
    species: 'Canino',
    breed: 'Pastor Alemán',
    sex: 'Macho',
    birthDate: '2021-12-10',
    age: '4 años, 10 meses',
    weight: '36.0 kg',
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: '#nit-1',
    isSterilized: false,
    hasAllergies: false,
    allergies: '',
    medicalBackground: 'Sin cirugías previas.',
    owner: {
      firstName: 'Diana',
      lastName: 'Ospina',
      name: 'Diana Ospina',
      document: '52.987.654',
      phone: '+57 315 876 5432',
      emergencyPhone: '+57 311 987 1234',
      email: 'diana.ospina@gmail.com',
      department: 'Bogotá D.C.',
      city: 'Bogotá',
      address: 'Carrera 70 # 100-30',
      stratum: 'Estrato 4',
      hasVetPlus: true,
      vetPlusCode: 'VP-97812-COL',
    },
    riskFactors: {
      habitat: 'Mixto',
      contactOutside: { hasContact: true, contactType: 'Paseos en fincas y senderos' },
      livesWithOtherAnimals: false,
      recentTravel: true,
      ruralAccess: true,
      parasiteExposure: true,
      outdoorWater: true,
      coastalRescue: false,
      otherRiskFactors: 'Exposición a garrapatas en zona rural de Cundinamarca',
    },
    medicalAdmission: {
      isAsymptomatic: false,
      symptoms: ['Fiebre', 'Anorexia', 'Debilidad en tren posterior'],
      otherSymptoms: 'Trombocitopenia en hemograma inicial',
      physicalFindings: 'Linfadenopatía reactiva preescapular, esplenomegalia palpable.',
      consultationType: 'Urgencia médica',
      generalCondition: 'Regular',
      vaccinationStatus: 'Al día',
      lastVaccinationDate: '12/12/2025',
      dewormingStatus: 'Al día',
      lastDewormingDate: '15/07/2026',
    },
    status: 'en tratamiento',
    lastVisit: '06/10/2026',
    attendingVet: 'Dr. Alejandro Morales',
    notes: 'Sospecha alta de hemotrópicos (Ehrlichia / Anaplasma). Muestra tomada en EDTA.',
    activeExamOrder: {
      id: 'ORD-2026-907',
      testName: 'qPCR Panel Vector Borne & Hemotrópicos Caninos',
      category: 'Biología Molecular Cuantitativa (qPCR)',
      sampleType: 'Sangre total con EDTA',
      priority: 'Urgente (< 12h)',
      requestedBy: 'Dr. Alejandro Morales',
      laboratory: 'VetLab Central - Unidad de Genómica',
      targets: 'Ehrlichia canis, Anaplasma platys, Babesia vogeli, Hepatozoon canis',
      requestedAt: '06/10/2026 - 08:15 AM',
      currentStep: 1,
      steps: [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: '06/10/2026 08:15 AM', completed: true },
        { label: 'Muestra recibida', desc: 'Recepción y código de barras en laboratorio', date: '06/10/2026 09:30 AM', completed: true },
        { label: 'En análisis qPCR', desc: 'Extracción de ácidos nucleicos y amplificación en termociclador', date: '', completed: false },
        { label: 'Validación médica', desc: 'Curvas de amplificación verificadas por patólogo molecular', date: '', completed: false },
        { label: 'Resultado enviado', desc: 'Informe emitido y disponible para descarga', date: '', completed: false },
      ],
    },
    healthMetrics: {
      weightHistory: [
        { date: '12/12/2025', weight: '37.5 kg', note: 'Control anual' },
        { date: '06/10/2026', weight: '36.0 kg', note: 'Urgencia por decaimiento (-1.5 kg)' },
      ],
      vitalSigns: {
        heartRate: '110 bpm',
        temperature: '39.6 °C',
        respiratoryRate: '32 rpm',
        mucosa: 'Levemente pálidas',
      },
    },
    consultations: [],
    qpcrExams: [],
  },
];

let localPatientsStore = [...FALLBACK_PATIENTS];

export const patientApi = {
  async getStats(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`, { params, timeout: 2000 });
      return response.data.data;
    } catch {
      let list = [...localPatientsStore];
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
        sedeId: patientData.sedeId || 'sede-principal-80',
        sedeNombre: patientData.sedeNombre || 'Sede Principal - Calle 80',
        codigoSedeNit: patientData.codigoSedeNit || '#nit-1',
        isSterilized: Boolean(patientData.isSterilized),
        hasAllergies: Boolean(patientData.hasAllergies),
        allergies: patientData.hasAllergies ? (patientData.allergies || 'Alergia reportada') : '',
        medicalBackground: patientData.medicalBackground || 'Sin antecedentes patológicos previos',
        owner: {
          name: ownerName,
          firstName: patientData.ownerFirstName || '',
          lastName: patientData.ownerLastName || '',
          documentType: patientData.ownerDocumentType || 'C.C.',
          documentNumber: patientData.ownerDocumentNumber || '',
          document: patientData.ownerDocumentNumber ? `${patientData.ownerDocumentType || 'C.C.'} ${patientData.ownerDocumentNumber}` : (patientData.ownerDocument || ''),
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
          generalCondition: patientData.generalCondition || 'Bueno',
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

