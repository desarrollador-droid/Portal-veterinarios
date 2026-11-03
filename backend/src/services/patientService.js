import { patientsStore, PATIENT_STATUSES, calculateAgeFromBirthDate } from '../models/patientModel.js';

export const patientService = {
  getDashboardStats({ sedeId } = {}) {
    let list = patientsStore;
    if (sedeId && sedeId !== 'all' && sedeId !== 'Todas') {
      list = list.filter((p) => p.sedeId === sedeId);
    }

    const activePatients = list.filter((p) => p.status === 'activo').length;
    const ordersInProgress = list.filter(
      (p) => p.activeExamOrder && p.activeExamOrder.currentStep < 4
    ).length;
    const resultsReady = list.filter(
      (p) => p.activeExamOrder && p.activeExamOrder.currentStep === 4
    ).length;
    const hospitalized = list.filter((p) => p.status === 'internado').length;

    return {
      activePatients,
      ordersInProgress,
      resultsReady,
      hospitalized,
    };
  },

  getPatients(filters = {}) {
    const { search, species, breed, sampleStatus, sedeId } = filters;

    let result = patientsStore.map((p) => ({
      ...p,
      age: calculateAgeFromBirthDate(p.birthDate),
    }));

    if (sedeId && sedeId !== 'all' && sedeId !== 'Todas') {
      result = result.filter((p) => p.sedeId === sedeId);
    }

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.lastName && p.lastName.toLowerCase().includes(term)) ||
          p.id.toLowerCase().includes(term) ||
          (p.owner && p.owner.name.toLowerCase().includes(term))
      );
    }

    if (species && species !== 'all' && species !== 'Todas') {
      result = result.filter((p) => p.species.toLowerCase() === species.toLowerCase());
    }

    if (breed && breed !== 'all' && breed !== 'Todas') {
      result = result.filter((p) => p.breed.toLowerCase() === breed.toLowerCase());
    }

    if (sampleStatus && sampleStatus !== 'all' && sampleStatus !== 'Todos') {
      result = result.filter((p) => {
        if (!p.activeExamOrder) return sampleStatus.toLowerCase() === 'sin examen activo';
        const currentStepObj = p.activeExamOrder.steps[p.activeExamOrder.currentStep];
        return currentStepObj && currentStepObj.label.toLowerCase() === sampleStatus.toLowerCase();
      });
    }

    return result;
  },

  getPatientById(id) {
    const p = patientsStore.find((pat) => pat.id === id);
    if (!p) return null;
    return {
      ...p,
      age: calculateAgeFromBirthDate(p.birthDate),
    };
  },

  getFilterOptions() {
    const species = [...new Set(patientsStore.map((p) => p.species))];
    const breeds = [...new Set(patientsStore.map((p) => p.breed))];
    const sampleStatuses = [
      'Resultado enviado',
      'En análisis qPCR',
      'Muestra recibida',
      'Solicitud creada',
    ];

    return {
      species,
      breeds,
      sampleStatuses,
      availableStatuses: PATIENT_STATUSES,
    };
  },

  updatePatient(id, updateData) {
    const index = patientsStore.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Paciente no encontrado');
    }

    const currentPatient = patientsStore[index];

    if (currentPatient.status === 'fallecido') {
      const err = new Error('Acceso denegado: La ficha de un paciente fallecido está bloqueada y no admite modificaciones.');
      err.statusCode = 403;
      throw err;
    }

    if (updateData.status && !PATIENT_STATUSES.includes(updateData.status.toLowerCase())) {
      throw new Error(`Estado no válido. Los estados permitidos son: ${PATIENT_STATUSES.join(', ')}`);
    }

    // Campos inmutables protegidos: name, lastName, sex, birthDate
    const { name, lastName, sex, birthDate, age, id: ignoredId, ...allowedUpdates } = updateData;

    const updated = {
      ...currentPatient,
      ...allowedUpdates,
      name: currentPatient.name,
      lastName: currentPatient.lastName,
      sex: currentPatient.sex,
      birthDate: currentPatient.birthDate,
      owner: {
        ...currentPatient.owner,
        ...(allowedUpdates.owner || {}),
      },
      riskFactors: {
        ...currentPatient.riskFactors,
        ...(allowedUpdates.riskFactors || {}),
      },
      medicalAdmission: {
        ...currentPatient.medicalAdmission,
        ...(allowedUpdates.medicalAdmission || {}),
      },
      healthMetrics: {
        ...currentPatient.healthMetrics,
        ...(allowedUpdates.healthMetrics || {}),
        vitalSigns: {
          ...currentPatient.healthMetrics?.vitalSigns,
          ...(allowedUpdates.vitalSigns || allowedUpdates.healthMetrics?.vitalSigns || {}),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    patientsStore[index] = updated;

    return {
      ...updated,
      age: calculateAgeFromBirthDate(updated.birthDate),
    };
  },

  addConsultation(id, data) {
    const patient = patientsStore.find((p) => p.id === id);
    if (!patient) throw new Error('Paciente no encontrado');

    if (patient.status === 'fallecido') {
      const err = new Error('No se pueden registrar consultas médicas para un paciente fallecido.');
      err.statusCode = 403;
      throw err;
    }

    const now = new Date();
    const formattedDate = data.date || now.toLocaleDateString('es-ES');
    const formattedTime = data.time || now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // Las consultas no tienen código, solo fecha, hora, nombre del doctor y datos clínicos
    const newConsultation = {
      date: formattedDate,
      time: formattedTime,
      vet: data.vet || data.doctorName || patient.attendingVet || 'Dr. Alejandro Morales',
      weight: data.weight || patient.weight || '',
      clinicalStatus: data.clinicalStatus || 'Bueno',
      vitalSigns: {
        heartRate: data.vitalSigns?.heartRate || data.vitalSignsHeartRate || 'No registrada',
        temperature: data.vitalSigns?.temperature || data.vitalSignsTemp || 'No registrada',
        respiratoryRate: data.vitalSigns?.respiratoryRate || data.vitalSignsResp || 'No registrada',
        mucosa: data.vitalSigns?.mucosa || data.vitalSignsMucosa || 'No registrada',
        capillaryRefillTime: data.vitalSigns?.capillaryRefillTime || data.vitalSignsCapillaryRefillTime || 'No registrado',
      },
      reason: data.reason || '',
      medication: data.medication || '',
      relevantBackground: data.relevantBackground || '',
      observationsAndFollowUp: data.observationsAndFollowUp || '',
    };

    if (!patient.consultations) patient.consultations = [];
    patient.consultations.unshift(newConsultation);

    // Actualizar peso actual y su historial evolutivo
    if (data.weight) {
      patient.weight = data.weight;
      if (!patient.healthMetrics) patient.healthMetrics = {};
      if (!patient.healthMetrics.weightHistory) patient.healthMetrics.weightHistory = [];
      patient.healthMetrics.weightHistory.unshift({ date: formattedDate, weight: data.weight });
    }

    // Actualizar signos vitales si fueron ingresados
    if (data.vitalSigns || data.vitalSignsHeartRate || data.vitalSignsTemp || data.vitalSignsResp || data.vitalSignsMucosa) {
      if (!patient.healthMetrics) patient.healthMetrics = {};
      patient.healthMetrics.vitalSigns = {
        ...patient.healthMetrics.vitalSigns,
        ...newConsultation.vitalSigns,
      };
    }

    // Actualizar última visita
    patient.lastVisit = formattedDate;

    return {
      consultation: newConsultation,
      patient: {
        ...patient,
        age: calculateAgeFromBirthDate(patient.birthDate),
      },
    };
  },

  requestNewExam(id, examData) {
    const patient = patientsStore.find((p) => p.id === id);
    if (!patient) throw new Error('Paciente no encontrado');

    if (patient.status === 'fallecido') {
      const err = new Error('No se pueden solicitar exámenes para un paciente fallecido.');
      err.statusCode = 403;
      throw err;
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('es-ES')} - ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

    const newOrder = {
      id: `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      testName: examData.testName || 'qPCR Panel Diagnóstico Molecular',
      category: 'Biología Molecular Cuantitativa (qPCR)',
      sampleType: examData.sampleType || 'Hisopado / Muestra biológica',
      priority: examData.urgency || 'Normal (24-48h)',
      requestedBy: examData.requestedBy || 'Dr. Alejandro Morales',
      laboratory: 'VetLab Central - Unidad de Genómica',
      targets: examData.targets || 'Patógenos moleculares específicos del panel',
      syndromes: examData.syndromes || [],
      findings: examData.findings || [],
      totalPrice: examData.totalPrice || '$145.000',
      examType: examData.examType || 'nuevo',
      previousExamCode: examData.previousExamCode || null,
      replacementCount: examData.replacementCount || 0,
      additionalCost: examData.additionalCost || 0,
      cuadroHematico: examData.cuadroHematico || null,
      historiaClinica: examData.historiaClinica || null,
      requestedAt: formattedDate,
      currentStep: 0,
      steps: [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: formattedDate, completed: true },
        { label: 'Muestra recibida', desc: 'Recepción y código de barras en laboratorio', date: 'Pendiente', completed: false },
        { label: 'En análisis qPCR', desc: 'Extracción de ácidos nucleicos y amplificación en termociclador', date: 'Pendiente', completed: false },
        { label: 'Validación médica', desc: 'Curvas de amplificación verificadas por patólogo molecular', date: 'Pendiente', completed: false },
        { label: 'Resultado enviado', desc: 'Informe emitido y disponible para descarga', date: 'Pendiente', completed: false },
      ],
    };

    // Actualizar estado de esterilización en la ficha del paciente si fue respondido
    if (examData.isSterilized !== undefined && examData.isSterilized !== null) {
      patient.isSterilized = Boolean(examData.isSterilized);
    }

    // Actualizar o agregar nuevas alergias en la ficha del paciente
    if (examData.allergies !== undefined) {
      patient.allergies = examData.allergies;
      patient.hasAllergies = Boolean(examData.allergies && examData.allergies.trim().length > 0);
    }

    // Actualizar factores de riesgo en el paciente
    if (examData.riskFactors) {
      patient.riskFactors = {
        ...(patient.riskFactors || {}),
        ...examData.riskFactors,
      };
    }

    // Almacenar cuadro hemático e historia clínica en el paciente
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

    patient.activeExamOrder = newOrder;

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
      id: `QPCR-${newOrder.id.replace('ORD-', '')}`,
      testName: newOrder.testName,
      date: now.toLocaleDateString('es-ES'),
      requestedAt: formattedDate,
      receivedAt: 'Pendiente (en recepción)',
      status: 'Solicitud creada',
      sampleType: newOrder.sampleType,
      resultSummary: 'En cola de procesamiento molecular',
      methodology: 'qPCR TaqMan multiplex en tiempo real',
      agents: examAgents,
      reportUrl: '#',
    });

    return newOrder;
  },

  createPatient(data) {
    let maxNum = 0;
    for (const p of patientsStore) {
      if (p.id && typeof p.id === 'string') {
        const m = p.id.match(/^PAC-(\d+)$/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
    const newId = `PAC-${String(maxNum + 1).padStart(3, '0')}`;
    const birthDate = data.birthDate || '2025-01-01';

    // Determinar especie: Canino, Felino u Otro personalizado
    let resolvedSpecies = data.species || 'Canino';
    if (resolvedSpecies === 'Otro' && data.otherSpecies) {
      resolvedSpecies = data.otherSpecies.trim();
    }

    // Datos del tutor ingresados en primer lugar
    const ownerFirstName = data.ownerFirstName || data.owner?.firstName || '';
    const ownerLastName = data.ownerLastName || data.owner?.lastName || '';
    const fullOwnerName = `${ownerFirstName} ${ownerLastName}`.trim() || data.ownerName || 'Propietario';

    // Apellido heredado quemado
    const patientLastName = ownerLastName || data.lastName || '';

    const newPatient = {
      id: newId,
      name: data.name,
      lastName: patientLastName,
      avatar: resolvedSpecies.toLowerCase().includes('felin') ? '🐱' : resolvedSpecies.toLowerCase().includes('canin') ? '🐶' : '🐾',
      species: resolvedSpecies,
      breed: data.breed || 'Mestizo',
      sex: data.sex || 'Hembra',
      birthDate: birthDate,
      weight: data.weight || '4.0 kg',
      sedeId: data.sedeId || 'sede-principal-80',
      sedeNombre: data.sedeNombre || 'Sede Principal - Calle 80',
      codigoSedeNit: data.codigoSedeNit || '#nit-1',
      owner: {
        firstName: ownerFirstName,
        lastName: ownerLastName,
        name: fullOwnerName,
        documentType: data.ownerDocumentType || data.owner?.documentType || 'C.C.',
        documentNumber: data.ownerDocumentNumber || data.owner?.documentNumber || data.ownerDocument || data.owner?.document || '',
        document: data.ownerDocumentNumber ? `${data.ownerDocumentType || 'C.C.'} ${data.ownerDocumentNumber}` : (data.ownerDocument || data.owner?.document || ''),
        phone: data.ownerPhone || data.owner?.phone || '',
        emergencyPhone: data.ownerEmergencyPhone || data.owner?.emergencyPhone || '',
        email: data.ownerEmail || data.owner?.email || '',
        department: data.ownerDepartment || data.owner?.department || '',
        city: data.ownerCity || data.owner?.city || '',
        address: data.ownerAddress || data.owner?.address || '',
        stratum: data.ownerStratum || data.owner?.stratum || 'Estrato 3',
        hasVetPlus: Boolean(data.ownerHasVetPlus ?? data.owner?.hasVetPlus),
        vetPlusCode: data.ownerVetPlusCode || data.owner?.vetPlusCode || '',
      },
      riskFactors: {
        habitat: data.habitat || data.riskFactors?.habitat || 'Interiores',
        housingArea: data.housingArea || data.riskFactors?.housingArea || '',
        housingType: data.housingType || data.riskFactors?.housingType || '',
        contactOutside: data.contactOutside || data.riskFactors?.contactOutside || { hasContact: false, contactType: '' },
        livesWithOtherAnimals: Boolean(data.livesWithOtherAnimals ?? data.riskFactors?.livesWithOtherAnimals),
        cohabitingSpecies: data.cohabitingSpecies || data.riskFactors?.cohabitingSpecies || [],
        recentTravel: Boolean(data.recentTravel ?? data.riskFactors?.recentTravel),
        recentTravelDetails: data.recentTravelDetails || data.riskFactors?.recentTravelDetails || '',
        ruralAccess: Boolean(data.ruralAccess ?? data.riskFactors?.ruralAccess),
        parasiteExposure: Boolean(data.parasiteExposure ?? data.riskFactors?.parasiteExposure),
        outdoorWater: Boolean(data.outdoorWater ?? data.riskFactors?.outdoorWater),
        coastalRescue: Boolean(data.coastalRescue ?? data.riskFactors?.coastalRescue),
        coastalRescueLocation: (data.coastalRescue ?? data.riskFactors?.coastalRescue)
          ? (data.coastalRescueLocation || data.riskFactors?.coastalRescueLocation || '')
          : '',
        otherRiskFactors: data.otherRiskFactors || data.riskFactors?.otherRiskFactors || '',
      },
      medicalAdmission: {
        isAsymptomatic: Boolean(data.isAsymptomatic ?? data.medicalAdmission?.isAsymptomatic),
        symptoms: data.symptoms || data.medicalAdmission?.symptoms || [],
        otherSymptoms: data.otherSymptoms || data.medicalAdmission?.otherSymptoms || '',
        physicalFindings: data.physicalFindings || data.medicalAdmission?.physicalFindings || '',
        consultationType: data.consultationType || data.medicalAdmission?.consultationType || 'Consulta',
        generalCondition: data.generalCondition || data.medicalAdmission?.generalCondition || 'Bueno',
        vaccinationStatus: data.vaccinationStatus || data.medicalAdmission?.vaccinationStatus || 'No registrado',
        lastVaccinationDate: (data.vaccinationStatus === 'Desconocido' || data.medicalAdmission?.vaccinationStatus === 'Desconocido')
          ? ''
          : (data.lastVaccinationDate || data.medicalAdmission?.lastVaccinationDate || ''),
        dewormingStatus: data.dewormingStatus || data.medicalAdmission?.dewormingStatus || 'No registrado',
        lastDewormingDate: (data.dewormingStatus === 'Desconocido' || data.medicalAdmission?.dewormingStatus === 'Desconocido')
          ? ''
          : (data.lastDewormingDate || data.medicalAdmission?.lastDewormingDate || ''),
        preventionNotes: data.preventionNotes || data.medicalAdmission?.preventionNotes || '',
        hasMicrochip: Boolean(data.hasMicrochip ?? data.medicalAdmission?.hasMicrochip),
        microchipNumber: data.microchipNumber || data.medicalAdmission?.microchipNumber || '',
        hasTraveledAbroad: Boolean(data.hasTraveledAbroad ?? data.medicalAdmission?.hasTraveledAbroad),
        lastCountryVisited: data.lastCountryVisited || data.medicalAdmission?.lastCountryVisited || '',
      },
      status: data.status || 'activo',
      isSterilized: Boolean(data.isSterilized),
      hasAllergies: Boolean(data.hasAllergies),
      allergies: data.hasAllergies ? (data.allergies || 'Alergia reportada') : '',
      medicalBackground: data.medicalBackground || 'Sin antecedentes médicos previos reportados.',
      lastVisit: new Date().toLocaleDateString('es-ES'),
      attendingVet: data.attendingVet || 'Dr. Alejandro Morales',
      notes: data.notes || '',
      healthMetrics: {
        weightHistory: [{ date: new Date().toLocaleDateString('es-ES'), weight: data.weight || '4.0 kg' }],
        vitalSigns: {
          heartRate: data.vitalSigns?.heartRate || data.vitalSignsHeartRate || 'No registrada',
          temperature: data.vitalSigns?.temperature || data.vitalSignsTemp || 'No registrada',
          respiratoryRate: data.vitalSigns?.respiratoryRate || data.vitalSignsResp || 'No registrada',
          mucosa: data.vitalSigns?.mucosa || data.vitalSignsMucosa || 'No registrada',
          capillaryRefillTime: data.vitalSigns?.capillaryRefillTime || data.vitalSignsCapillaryRefillTime || 'No registrado',
        },
        lastDiagnosticScore: 'Sin registros previos',
      },
      cuadroHematico: data.cuadroHematico || null,
      consultations: [
        {
          id: `CON-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString('es-ES'),
          vet: 'Dr. Alejandro Morales',
          reason: data.consultationType ? `Ingreso por ${data.consultationType}` : 'Apertura de expediente',
          diagnosis: data.physicalFindings || 'Evaluación inicial.',
          treatment: 'Apertura de ficha clínica y anamnesis.',
        },
      ],
      qpcrExams: [],
      // Si el usuario marcó solicitar qPCR, pasará al flujo interactivo de diagnóstico para crear la orden real
      activeExamOrder: null,
      createdAt: new Date().toISOString(),
    };

    patientsStore.unshift(newPatient);

    return {
      ...newPatient,
      age: calculateAgeFromBirthDate(newPatient.birthDate),
    };
  },
};
