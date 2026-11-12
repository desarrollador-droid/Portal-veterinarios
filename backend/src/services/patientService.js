import { patientsStore, PATIENT_STATUSES, calculateAgeFromBirthDate, savePatientsToDisk } from '../models/patientModel.js';
import { keaService } from './keaService.js';
import { clinicService } from './clinicService.js';

export const PAUSE_DATABASE_CONNECTION = true;

let hasInitialKeaSyncCompleted = false;
let initialSyncPromise = null;

function cleanNumber(val) {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '').trim();
}

/**
 * Determina con precisión si un paciente pertenece a la clínica o médico actual
 */
function isPatientAssociatedWithClinic(patient, targetNit, targetClinicId) {
  if (!targetNit && !targetClinicId) return true;

  // 1. Coincidencia por NIT o código de sede / consecutivo NIT
  if (targetNit) {
    const pClinicNit = cleanNumber(patient.clinicNit);
    if (pClinicNit && pClinicNit === targetNit) return true;

    const pNit = cleanNumber(patient.nit);
    if (pNit && pNit === targetNit) return true;

    if (patient.codigoSedeNit) {
      const pSedeNit = cleanNumber(patient.codigoSedeNit);
      if (pSedeNit && pSedeNit === targetNit) return true;
    }

    if (patient.veterinaria) {
      const pVet = cleanNumber(patient.veterinaria);
      if (pVet && pVet === targetNit) return true;
    }
  }

  // 2. Coincidencia por ID de la clínica
  if (targetClinicId) {
    const pClinicId = patient.clinicId ? String(patient.clinicId).toLowerCase().trim() : '';
    if (pClinicId && pClinicId === targetClinicId) return true;

    if (patient.keaClinicId && String(patient.keaClinicId).toLowerCase().trim() === targetClinicId) return true;
  }

  return false;
}

export const patientService = {
  async getDashboardStats({ sedeId, clinicId, nit, clinicNit } = {}) {
    if (!hasInitialKeaSyncCompleted) {
      if (!initialSyncPromise) {
        initialSyncPromise = this.syncPatientsWithKea().catch((err) => {
          console.warn('[Kea DB] Error en sync inicial de pacientes:', err.message);
        }).finally(() => {
          hasInitialKeaSyncCompleted = true;
        });
      }
      await initialSyncPromise;
    }

    let list = patientsStore;

    let targetNit = cleanNumber(nit || clinicNit);
    let targetClinicId = clinicId ? String(clinicId).trim().toLowerCase() : '';

    if (!targetNit && !targetClinicId) {
      try {
        const active = clinicService.getActiveClinic();
        if (active) {
          targetNit = cleanNumber(active.nit || active.cedula);
          targetClinicId = active.id ? String(active.id).trim().toLowerCase() : '';
        }
      } catch (_) {}
    }

    if (!PAUSE_DATABASE_CONNECTION && (targetNit || targetClinicId)) {
      list = list.filter((p) => isPatientAssociatedWithClinic(p, targetNit, targetClinicId));
    }

    if (sedeId && sedeId !== 'all' && sedeId !== 'Todas') {
      list = list.filter((p) => p.sedeId === sedeId);
    }

    const activePatients = list.filter((p) => p.status === 'activo').length;
    const ordersInProgress = list.filter(
      (p) => p.activeExamOrder && p.activeExamOrder.currentStep < 4
    ).length;
    const resultsReady = list.filter((p) => (p.activeExamOrder && p.activeExamOrder.currentStep === 4) || (p.qpcrExams && p.qpcrExams.length > 0) || (p.clinicalExams && p.clinicalExams.length > 0)).length;
    const hospitalized = list.filter((p) => p.status === 'internado' || p.status === 'critico').length;

    return {
      activePatients,
      ordersInProgress,
      resultsReady,
      hospitalized,
    };
  },

  async getPatients(filters = {}) {
    if (!hasInitialKeaSyncCompleted) {
      if (!initialSyncPromise) {
        initialSyncPromise = this.syncPatientsWithKea().catch((err) => {
          console.warn('[Kea DB] Error en sync inicial de pacientes:', err.message);
        }).finally(() => {
          hasInitialKeaSyncCompleted = true;
        });
      }
      await initialSyncPromise;
    }

    const { search, species, breed, sampleStatus, sedeId, clinicId, nit, clinicNit } = filters;

    let targetNit = cleanNumber(nit || clinicNit);
    let targetClinicId = clinicId ? String(clinicId).trim().toLowerCase() : '';

    if (!targetNit && !targetClinicId) {
      try {
        const active = clinicService.getActiveClinic();
        if (active) {
          targetNit = cleanNumber(active.nit || active.cedula);
          targetClinicId = active.id ? String(active.id).trim().toLowerCase() : '';
        }
      } catch (_) {}
    }

    let result = patientsStore.map((p) => ({
      ...p,
      age: calculateAgeFromBirthDate(p.birthDate),
    }));

    if (!PAUSE_DATABASE_CONNECTION && (targetNit || targetClinicId)) {
      result = result.filter((p) => isPatientAssociatedWithClinic(p, targetNit, targetClinicId));
    }

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

  async updatePatient(id, updateData) {
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

    // Sincronizar actualización con Kea Tools
    if (currentPatient.keaRecordId) {
      try {
        await keaService.updatePatientInKea(currentPatient.keaRecordId, updateData);
      } catch (err) {
        console.warn('Advertencia al sincronizar actualización con Kea:', err.message);
      }
    }

    // Campos inmutables protegidos: name, lastName, sex, birthDate
    const { name, lastName, sex, birthDate, age, id: ignoredId, ...allowedUpdates } = updateData;

    // Calcular historial de auditoría de todos los campos editados
    const auditChanges = [];
    if (updateData.status && updateData.status !== currentPatient.status) {
      auditChanges.push({ campo: 'Estado Clínico', categoria: 'Clínica', anterior: currentPatient.status, nuevo: updateData.status });
    }
    if (updateData.weight && updateData.weight !== currentPatient.weight) {
      auditChanges.push({ campo: 'Peso', categoria: 'Medidas', anterior: currentPatient.weight || 'N/A', nuevo: updateData.weight });
    }
    if (updateData.isSterilized !== undefined && Boolean(updateData.isSterilized) !== Boolean(currentPatient.isSterilized)) {
      auditChanges.push({ campo: 'Esterilización', categoria: 'Reproducción', anterior: currentPatient.isSterilized ? 'Esterilizado' : 'Entero', nuevo: updateData.isSterilized ? 'Esterilizado' : 'Entero' });
    }
    if (updateData.allergies !== undefined && updateData.allergies !== currentPatient.allergies) {
      auditChanges.push({ campo: 'Alergias Conocidas', categoria: 'Clínica', anterior: currentPatient.allergies || 'Ninguna', nuevo: updateData.allergies || 'Ninguna' });
    }
    if (updateData.notes !== undefined && updateData.notes !== currentPatient.notes) {
      auditChanges.push({ campo: 'Notas Médicas', categoria: 'Observaciones', anterior: currentPatient.notes || 'Sin notas', nuevo: updateData.notes || 'Sin notas' });
    }
    if (updateData.riskFactors) {
      const rf = updateData.riskFactors;
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
    if (updateData.vitalSigns) {
      const vs = updateData.vitalSigns;
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
    if (updateData.owner) {
      const ow = updateData.owner;
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

    const updated = {
      ...currentPatient,
      ...allowedUpdates,
      name: currentPatient.name,
      lastName: currentPatient.lastName,
      sex: currentPatient.sex,
      birthDate: currentPatient.birthDate,
      auditHistory: [auditEntry, ...currentAuditHistory],
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
    savePatientsToDisk();

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
    savePatientsToDisk();

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

    // Resolver responsable médico respetando sesión autenticada y descartando 'Dr. Asignado'
    const resolvedDoctor = (examData.requestedBy && examData.requestedBy !== 'Dr. Asignado')
      ? examData.requestedBy
      : (patient.attendingVet && patient.attendingVet !== 'Dr. Asignado' ? patient.attendingVet : 'Dr. Alejandro Morales');

    if ((!patient.attendingVet || patient.attendingVet === 'Dr. Asignado') && resolvedDoctor && resolvedDoctor !== 'Dr. Asignado') {
      patient.attendingVet = resolvedDoctor;
    }

    // Determinar categoría exacta del examen
    let reqCat = (examData.requestCategory || '').toLowerCase().trim();
    if (!reqCat) {
      if (examData.selectedClinicalExams && examData.selectedClinicalExams.length > 0) {
        reqCat = 'clinicas';
      } else if (examData.microbiotaSubtype || (examData.category && examData.category.toLowerCase().includes('microbiota'))) {
        reqCat = 'microbiota';
      } else if (examData.category && (examData.category.toLowerCase().includes('portafolio') || examData.category.toLowerCase() === 'clinicas')) {
        reqCat = 'clinicas';
      } else {
        reqCat = 'qpcr';
      }
    }
    const isClinicas = reqCat === 'clinicas';
    const isMicrobiota = reqCat === 'microbiota';

    const orderCategory = isClinicas
      ? 'Portafolio Clínico de Laboratorio'
      : isMicrobiota
      ? 'Microbiota Gastrointestinal (16S rRNA NGS)'
      : (examData.category || 'Biología Molecular Cuantitativa (qPCR)');

    const randomNum = Math.floor(100 + Math.random() * 900);
    const orderPrefix = isClinicas ? 'CLN' : isMicrobiota ? 'MIC' : 'ORD';
    const orderId = examData.id || `${orderPrefix}-2026-${randomNum}`;
    const examCode = isClinicas ? `CLN-2026-${randomNum}` : isMicrobiota ? `MIC-2026-${randomNum}` : `QPCR-2026-${randomNum}`;

    const newOrder = {
      id: orderId,
      examCode,
      testName: examData.testName || (isClinicas ? 'Pruebas Diagnósticas Clínicas' : isMicrobiota ? 'Microbiota Gastrointestinal' : 'qPCR Panel Diagnóstico Molecular'),
      category: orderCategory,
      requestCategory: reqCat,
      sampleType: examData.sampleType || (isClinicas ? 'Muestra biológica de laboratorio clínico' : isMicrobiota ? 'Muestra fecal en tubo estabilizador' : 'Hisopado / Muestra biológica'),
      priority: examData.urgency || 'Normal (24-48h)',
      requestedBy: resolvedDoctor,
      doctor: resolvedDoctor,
      laboratory: isClinicas ? 'VetLab Central - Laboratorio Clínico y Hematología' : isMicrobiota ? 'VetLab Central - Plataforma Metagenómica' : 'VetLab Central - Unidad de Genómica',
      targets: examData.targets || (isClinicas ? 'Parámetros de laboratorio clínico' : isMicrobiota ? 'Perfil taxonómico bacteriano' : 'Patógenos moleculares específicos del panel'),
      syndromes: examData.syndromes || [],
      findings: examData.findings || [],
      totalPrice: examData.totalPrice || (isClinicas ? '$45.000' : '$145.000'),
      examType: examData.examType || 'nuevo',
      previousExamCode: examData.previousExamCode || null,
      replacementCount: examData.replacementCount || 0,
      additionalCost: examData.additionalCost || 0,
      cuadroHematico: examData.cuadroHematico || null,
      historiaClinica: examData.historiaClinica || null,
      requestedAt: formattedDate,
      currentStep: 0,
      steps: isClinicas ? [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: formattedDate, completed: true },
        { label: 'Muestra recibida', desc: 'Ingreso al laboratorio clínico y código de barras', date: 'Pendiente', completed: false },
        { label: 'En análisis clínico', desc: 'Procesamiento en analizador hematológico / químico / coagulación', date: 'Pendiente', completed: false },
        { label: 'Validación médica', desc: 'Resultados validados por bacteriólogo y patólogo clínico', date: 'Pendiente', completed: false },
        { label: 'Resultado enviado', desc: 'Informe clínico emitido y disponible para descarga', date: 'Pendiente', completed: false },
      ] : isMicrobiota ? [
        { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: formattedDate, completed: true },
        { label: 'Muestra recibida', desc: 'Recepción del tubo estabilizador en laboratorio', date: 'Pendiente', completed: false },
        { label: 'En secuenciación NGS', desc: 'Extracción metagenómica y secuenciación masiva 16S rRNA', date: 'Pendiente', completed: false },
        { label: 'Bioinformática médica', desc: 'Perfil taxonómico y cálculo del índice de disbiosis', date: 'Pendiente', completed: false },
        { label: 'Resultado enviado', desc: 'Informe metagenómico emitido', date: 'Pendiente', completed: false },
      ] : [
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
    if (isClinicas && examData.selectedClinicalExams && Array.isArray(examData.selectedClinicalExams) && examData.selectedClinicalExams.length > 0) {
      examAgents = examData.selectedClinicalExams.map((e) => ({
        name: e.nombre || e.name,
        isPositive: false,
        isAltered: false,
        result: 'Normal / En rango',
        ct: '',
        load: 'En análisis de laboratorio',
      }));
    } else if (examData.profiles && Array.isArray(examData.profiles)) {
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
          result: isClinicas ? 'Normal / En rango' : 'En análisis molecular',
          ct: isClinicas ? '' : 'Pendiente',
          load: isClinicas ? 'En análisis' : 'En cola',
        }));
    }

    if (examAgents.length === 0) {
      examAgents = [
        {
          name: newOrder.testName,
          isPositive: false,
          isAltered: false,
          result: isClinicas ? 'Normal / En rango' : 'Negativo / En análisis',
          ct: '',
          load: isClinicas ? 'Parámetros esperados' : 'En cola',
        }
      ];
    }

    const examEntry = {
      id: examCode,
      examCode,
      orderId,
      testName: newOrder.testName,
      category: reqCat,
      requestCategory: reqCat,
      date: now.toLocaleDateString('es-ES'),
      requestedAt: formattedDate,
      receivedAt: 'Pendiente (en recepción)',
      status: 'Solicitud creada',
      sampleType: newOrder.sampleType,
      doctor: resolvedDoctor,
      requestedBy: resolvedDoctor,
      resultSummary: isClinicas
        ? 'En procesamiento de laboratorio clínico'
        : isMicrobiota
        ? 'En secuenciación metagenómica 16S'
        : 'En cola de procesamiento molecular',
      methodology: isClinicas
        ? 'Analítica clínica / Bioquímica / Coagulación / Hematología'
        : isMicrobiota
        ? 'Secuenciación masiva 16S rRNA (NGS)'
        : 'qPCR TaqMan multiplex en tiempo real',
      agents: examAgents,
      reportUrl: '#',
    };

    if (isClinicas) {
      if (!patient.clinicalExams) patient.clinicalExams = [];
      patient.clinicalExams.unshift(examEntry);
    } else if (isMicrobiota) {
      if (!patient.microbiotaExams) patient.microbiotaExams = [];
      patient.microbiotaExams.unshift(examEntry);
    } else {
      if (!patient.qpcrExams) patient.qpcrExams = [];
      patient.qpcrExams.unshift(examEntry);
    }

    savePatientsToDisk();
    return newOrder;
  },

  async createPatient(data) {
    let keaPatient = null;
    try {
      keaPatient = await keaService.createPatientInKea(data);
    } catch (err) {
      console.warn('Advertencia al registrar paciente en Kea Tools:', err.message);
    }

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
      id: keaPatient ? keaPatient.id : newId,
      keaRecordId: keaPatient?.keaRecordId || null,
      name: data.name,
      lastName: patientLastName,
      avatar: resolvedSpecies.toLowerCase().includes('felin') ? '🐱' : resolvedSpecies.toLowerCase().includes('canin') ? '🐶' : '🐾',
      species: resolvedSpecies,
      breed: data.breed || 'Mestizo',
      sex: data.sex || 'Hembra',
      birthDate: birthDate,
      weight: data.weight || '4.0 kg',
      clinicId: data.clinicId || (data.clinicNit ? `kea-vet-${cleanNumber(data.clinicNit)}` : null),
      clinicNit: cleanNumber(data.clinicNit || data.nit || data.codigoSedeNit),
      nit: cleanNumber(data.clinicNit || data.nit || data.codigoSedeNit),
      veterinaria: cleanNumber(data.clinicNit || data.nit || data.codigoSedeNit),
      codigoSedeNit: data.codigoSedeNit || (data.clinicNit ? `#nit-${cleanNumber(data.clinicNit)}` : '#nit-1'),
      sedeId: data.sedeId || 'sede-principal-80',
      sedeNombre: data.sedeNombre || 'Sede Principal - Calle 80',
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
      attendingVet: data.attendingVet || (keaPatient?.attendingVet && keaPatient.attendingVet !== 'Dr. Asignado' ? keaPatient.attendingVet : 'Dr. Alejandro Morales'),
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
          vet: data.attendingVet || (keaPatient?.attendingVet && keaPatient.attendingVet !== 'Dr. Asignado' ? keaPatient.attendingVet : 'Dr. Alejandro Morales'),
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
    savePatientsToDisk();

    return {
      ...newPatient,
      age: calculateAgeFromBirthDate(newPatient.birthDate),
    };
  },

  async deletePatient(id) {
    const index = patientsStore.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Paciente no encontrado');
    }
    const currentPatient = patientsStore[index];
    if (currentPatient.keaRecordId) {
      try {
        await keaService.deletePatientInKea(currentPatient.keaRecordId);
      } catch (err) {
        console.warn('Advertencia al eliminar en Kea Tools:', err.message);
      }
    }
    patientsStore.splice(index, 1);
    savePatientsToDisk();
    return { success: true, message: 'Paciente eliminado exitosamente' };
  },

  async testKeaConnection() {
    return await keaService.testConnection();
  },

  async syncPatientsWithKea() {
    if (PAUSE_DATABASE_CONNECTION) {
      console.log('[Kea DB] Conexión a base de datos externa pausada temporalmente (PAUSE_DATABASE_CONNECTION = true). Usando datos quemados de demostración.');
      hasInitialKeaSyncCompleted = true;
      return {
        success: true,
        totalInKea: 0,
        added: 0,
        updated: 0,
        totalLocal: patientsStore.length,
        patients: patientsStore.map((p) => ({
          ...p,
          age: calculateAgeFromBirthDate(p.birthDate),
        })),
      };
    }
    const result = await keaService.fetchPatientsFromKea();
    if (result && result.patients && result.patients.length > 0) {
      let added = 0;
      let updated = 0;
      result.patients.forEach((keaPat) => {
        const existingIdx = patientsStore.findIndex(
          (p) => p.id === keaPat.id || (
            p.name.toLowerCase() === keaPat.name.toLowerCase() &&
            p.lastName.toLowerCase() === keaPat.lastName.toLowerCase()
          )
        );
        if (existingIdx !== -1) {
          const currentAttending = patientsStore[existingIdx].attendingVet;
          const keaAttending = keaPat.attendingVet;
          const resolvedAttending = (currentAttending && currentAttending !== 'Dr. Asignado')
            ? currentAttending
            : (keaAttending || currentAttending);

          patientsStore[existingIdx] = {
            ...patientsStore[existingIdx],
            ...keaPat,
            attendingVet: resolvedAttending,
            activeExamOrder: patientsStore[existingIdx].activeExamOrder || keaPat.activeExamOrder,
            consultations: patientsStore[existingIdx].consultations || keaPat.consultations,
            documents: patientsStore[existingIdx].documents || [],
          };
          updated++;
        } else {
          patientsStore.unshift(keaPat);
          added++;
        }
      });

      savePatientsToDisk();
      hasInitialKeaSyncCompleted = true;

      return {
        success: true,
        totalInKea: result.count,
        added,
        updated,
        totalLocal: patientsStore.length,
        patients: patientsStore.map((p) => ({
          ...p,
          age: calculateAgeFromBirthDate(p.birthDate),
        })),
      };
    }

    savePatientsToDisk();
    hasInitialKeaSyncCompleted = true;

    return {
      success: true,
      totalInKea: 0,
      added: 0,
      updated: 0,
      totalLocal: patientsStore.length,
      patients: patientsStore.map((p) => ({
        ...p,
        age: calculateAgeFromBirthDate(p.birthDate),
      })),
    };
  },
};
