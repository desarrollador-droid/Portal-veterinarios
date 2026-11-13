import React, { useState, useMemo } from 'react';
import DeliveryTracker from './DeliveryTracker.jsx';
import EditPatientModal from './EditPatientModal.jsx';
import RequestExamModal from './RequestExamModal.jsx';
import NewConsultationModal from './NewConsultationModal.jsx';
import PatientDocumentsTab from './PatientDocumentsTab.jsx';
import { patientApi } from '../services/patientApi.js';
import { downloadClinicalHistoryDocument } from '../utils/clinicalHistoryDocument.js';
import { hasReportedAllergy, getAllergyDisplay } from '../utils/allergyHelpers.js';

export const SAMPLE_DOCS_BY_PATIENT = {
  'PAC-PRUEBA-01': [
    {
      id: 'DOC-2026-001',
      title: 'Cuadro Hemático & Frotis Sanguíneo (Remisión)',
      documentType: 'laboratorio',
      date: '28/08/2026',
      uploadedBy: 'Dr. Alejandro Morales',
      fileName: 'Hemograma_Completo_Luna.pdf',
      fileSize: '1.2 MB',
      keyFindings: ['Anemia microcítica', 'Trombocitopenia leve', 'Letargia'],
      hematocrito: 29,
      plaquetas: 155000,
      leucocitos: 11200,
      notes: 'Hematocrito 29%, plaquetas 155.000 /uL. Frotis con anisocitosis leve y macroplaquetas. Sugerido descarte de hemotrópicos caninos.',
      fileUrl: '#',
    },
    {
      id: 'DOC-2026-002',
      title: 'Historia Clínica Externa & Epicrisis Previa',
      documentType: 'historia_clinica',
      date: '10/05/2026',
      uploadedBy: 'Dra. Marcela Restrepo',
      fileName: 'Epicrisis_Remision_Luna.pdf',
      fileSize: '2.4 MB',
      keyFindings: ['Vómito intermitente', 'Diarrea mucosa', 'Anorexia parcial'],
      notes: 'Paciente con antecedentes de intolerancia alimentaria y disbiosis transitoria. Se sugiere seguimiento de microbiota por qPCR.',
      fileUrl: '#',
    },
  ],
  'PAC-PRUEBA-02': [
    {
      id: 'DOC-2026-003',
      title: 'Hemograma Completo y Bioquímica Hepática',
      documentType: 'laboratorio',
      date: '29/09/2026',
      uploadedBy: 'Dr. Daniel Ramírez',
      fileName: 'Hemograma_Bioquimica_Michi.pdf',
      fileSize: '980 KB',
      keyFindings: ['Trombocitopenia marcada', 'Anemia normocítica', 'Fiebre'],
      hematocrito: 31,
      plaquetas: 85000,
      leucocitos: 18500,
      notes: 'Paciente felino con fiebre persistente. Se solicita panel de hemotrópicos felinos por qPCR.',
      fileUrl: '#',
    },
  ],
  'PAC-PRUEBA-03': [
    {
      id: 'DOC-2026-004',
      title: 'Cuadro Hemático Completo & Bioquímica Renal',
      documentType: 'laboratorio',
      date: '02/10/2026',
      uploadedBy: 'Dr. Alejandro Morales',
      fileName: 'Hemograma_Rocky.pdf',
      fileSize: '1.1 MB',
      keyFindings: ['Leucocitosis reactiva', 'Neutrofilia'],
      hematocrito: 38,
      plaquetas: 210000,
      leucocitos: 16500,
      notes: 'Control previo a protocolo de análisis molecular.',
      fileUrl: '#',
    },
  ],
  'PAC-R01': [
    {
      id: 'DOC-2026-005',
      title: 'Historia Clínica y Ficha de Ingreso',
      documentType: 'historia_clinica',
      date: '15/10/2026',
      uploadedBy: 'Dr. Alejandro Morales',
      fileName: 'Historia_Clinica_Zeus.pdf',
      fileSize: '1.5 MB',
      keyFindings: ['Letargia', 'Coinfección sospechada'],
      notes: 'Registro inicial sincronizado con base de datos Kea Tools.',
      fileUrl: '#',
    },
  ],
};

export function getExamAgentsList(exam) {
  if (exam?.agents && Array.isArray(exam.agents) && exam.agents.length > 0) {
    return exam.agents;
  }

  const nameNorm = (exam?.testName || '').toLowerCase();
  if (nameNorm.includes('hemotr') || nameNorm.includes('vectorial') || nameNorm.includes('tbp')) {
    return [
      { name: 'Ehrlichia canis', isPositive: true, result: 'POSITIVO (+)', ct: '22.8', load: 'Carga genómica alta' },
      { name: 'Anaplasma platys', isPositive: true, result: 'POSITIVO (+)', ct: '27.4', load: 'Carga genómica moderada' },
      { name: 'Hepatozoon canis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Anaplasma phagocytophilum', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Rickettsia rickettsii', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Mycoplasma haemocanis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Bartonella spp. (canina)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
    ];
  }

  if (nameNorm.includes('microbiota') || nameNorm.includes('disbiosis')) {
    return [
      { name: 'Faecalibacterium', isPositive: false, result: 'Normal', ct: '19.2', load: 'Dentro de rango fisiológico' },
      { name: 'Turicibacter', isPositive: false, result: 'Normal', ct: '21.0', load: 'Dentro de rango fisiológico' },
      { name: 'Clostridium hiranonis', isPositive: false, result: 'Normal', ct: '23.4', load: 'Eubiosis adecuada' },
      { name: 'Blautia', isPositive: false, result: 'Normal', ct: '18.9', load: 'Dentro de rango fisiológico' },
      { name: 'Escherichia coli', isPositive: false, result: 'Normal', ct: '28.1', load: 'Sin sobrecrecimiento' },
      { name: 'Streptococcus', isPositive: false, result: 'Normal', ct: '29.5', load: 'Sin sobrecrecimiento' },
    ];
  }

  if (nameNorm.includes('diarrea') || nameNorm.includes('enter') || nameNorm.includes('gastro')) {
    return [
      { name: 'Cryptosporidium spp.', isPositive: true, result: 'POSITIVO (+)', ct: '24.1', load: 'Carga moderada-alta' },
      { name: 'Clostridium perfringens enterotoxin', isPositive: true, result: 'POSITIVO (+)', ct: '21.8', load: 'Carga bacteriana elevada' },
      { name: 'Giardia lamblia', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Parvovirus canino (CPV-2)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Coronavirus entérico canino (CCoV)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Salmonella enterica', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Campylobacter jejuni', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
    ];
  }

  if (exam?.targets && typeof exam.targets === 'string') {
    return exam.targets
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        isPositive: false,
        result: 'Negativo (-)',
        ct: 'N/D',
        load: 'No detectado',
      }));
  }

  return [];
}

export default function PatientFichaModal({
  patient,
  currentUser = null,
  activeClinic = null,
  onClose,
  onUpdatePatient,
  onRequestExam,
  onNavigateToExamModule,
  onNavigateToTemporalEvolution,
}) {
  if (!patient) return null;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examModalType, setExamModalType] = useState('nuevo');
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [clinicalDocs, setClinicalDocs] = useState(() => {
    return patient.clinicalDocuments || SAMPLE_DOCS_BY_PATIENT[patient.id] || [];
  });

  // Filtrar con estricta discriminación entre exámenes qPCR y pruebas clínicas
  const qpcrExamsList = useMemo(() => {
    return (patient.qpcrExams || []).filter(
      (e) => e.requestCategory !== 'clinicas' && e.requestCategory !== 'microbiota' && !String(e.id || '').startsWith('CLN-') && !String(e.id || '').startsWith('MIC-')
    );
  }, [patient.qpcrExams]);

  const clinicalExamsList = useMemo(() => {
    const list = [...(patient.clinicalExams || [])];
    (patient.qpcrExams || []).forEach((e) => {
      if ((e.requestCategory === 'clinicas' || String(e.id || '').startsWith('CLN-')) && !list.some((c) => c.id === e.id)) {
        list.push(e);
      }
    });
    return list;
  }, [patient.clinicalExams, patient.qpcrExams]);

  const handleOpenExam = (examType = 'nuevo') => {
    setExamModalType(examType);
    if (onNavigateToExamModule) {
      onNavigateToExamModule(patient, examType);
    } else {
      setShowExamModal(true);
    }
  };

  const isDeceased = patient.status === 'fallecido';
  const fullPatientName = `${patient.name} ${patient.lastName || ''}`.trim();

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Activo' };
      case 'pendiente por atención':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Pendiente por atención' };
      case 'en tratamiento':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'En tratamiento' };
      case 'en observación':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', label: 'En observación' };
      case 'en recuperación':
        return { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500', label: 'En recuperación' };
      case 'estable':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', label: 'Estable' };
      case 'critico':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-300 font-bold', dot: 'bg-rose-500 animate-ping', label: 'Crítico' };
      case 'internado':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'Internado' };
      case 'dado de alta':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', label: 'Dado de alta' };
      case 'fallecido':
        return { bg: 'bg-slate-900 text-white border-slate-900', dot: 'bg-red-500', label: 'Fallecido 🔒' };
      case 'inactivo':
      default:
        return { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Inactivo' };
    }
  };

  const getSampleBadgeInfo = () => {
    if (!patient.activeExamOrder) {
      return { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Sin examen activo' };
    }
    const currentStepObj = patient.activeExamOrder.steps[patient.activeExamOrder.currentStep];
    const label = currentStepObj ? currentStepObj.label : 'En análisis';
    switch (label.toLowerCase()) {
      case 'resultado enviado':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Resultado enviado' };
      case 'validación médica':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Validación médica' };
      case 'en análisis qpcr':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'En análisis qPCR' };
      case 'muestra recibida':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', label: 'Muestra recibida' };
      case 'solicitud creada':
      default:
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'Solicitud creada' };
    }
  };

  const statusStyle = getStatusBadge(patient.status);
  const sampleStyle = getSampleBadgeInfo();

  // Descarga de Historia Clínica Integral con diseño visual estructurado (no TXT)
  const handleDownloadHistory = () => {
    downloadClinicalHistoryDocument(patient);
  };

  const handleSaveConsultation = async (consultationData) => {
    try {
      const result = await patientApi.addConsultation(patient.id, consultationData);
      if (result && result.patient) {
        if (onUpdatePatient) {
          await onUpdatePatient(patient.id, result.patient);
        }
      }
    } catch (err) {
      showAestheticAlert({ title: 'Error al Registrar Consulta', message: err.message, type: 'danger' });
    }
  };

  const rf = patient.riskFactors || {};
  const ma = patient.medicalAdmission || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#140f2d] rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 dark:border-[#2b2052] overflow-hidden my-6 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#1a1438] border-b border-slate-100 dark:border-[#2b2052] flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 shrink-0">
          <span className="font-semibold flex items-center gap-1.5">
            <span>🐾</span> Expediente Clínico Digital · Portal Veterinario
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* ============================================================== */}
          {/* CUADRO INICIAL: Info general requerida por el usuario:         */}
          {/* Info de la tabla (Paciente, Especie/Raza, Propietario, Estado, */}
          {/* Estado muestra, Última visita) + PESO, EDAD + Opciones        */}
          {/* + LÍNEA DE TIEMPO TIPO DELIVERY COMPLETA                       */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-[#1b143c] rounded-2xl border border-slate-200 dark:border-[#2b2052] p-6 shadow-xs">
            {/* Fila 1: Encabezado con Avatar, Nombre, ID, Estado y Botones de Acción */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-[#2b2052]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center text-3xl shadow-xs shrink-0">
                  {patient.avatar || (patient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}
                </div>

                <div>
                  {/* ALERTA CRÍTICA DE ALERGIA MÉDICA VETERINARIA */}
                  {hasReportedAllergy(patient) && (
                    <div className="mb-2.5">
                      <div className="relative overflow-hidden inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent dark:from-rose-950/60 dark:via-rose-900/40 dark:to-transparent border-l-4 border-l-rose-500 border border-rose-300 dark:border-rose-500/60 shadow-md shadow-rose-500/10 text-xs">
                        <div className="relative flex items-center justify-center shrink-0">
                          <span className="text-sm">🚨</span>
                          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black tracking-wider text-rose-900 dark:text-rose-200 uppercase text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                            Alerta Médica · Alergia Registrada
                          </span>
                          <span className="font-extrabold text-rose-950 dark:text-rose-100 text-xs">
                            {getAllergyDisplay(patient)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {fullPatientName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {patient.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
                      {statusStyle.label}
                    </span>
                    {patient.isSterilized !== undefined && patient.isSterilized !== null && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        patient.isSterilized 
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {patient.isSterilized ? '🔒 Esterilizado(a)' : 'Entero(a)'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                    Médico tratante: <strong className="text-slate-900 dark:text-white font-bold">
                      {(patient.attendingVet && patient.attendingVet !== 'Dr. Asignado')
                        ? patient.attendingVet
                        : (currentUser?.isVeterinarioAsociado ? currentUser.vetNombre : currentUser?.director || currentUser?.nombreMedico || currentUser?.nombre || 'Dr. Alejandro Morales')}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Botones de Opciones */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadHistory}
                  title="Descargar historia clínica completa con diseño visual oficial (Guardar como PDF o archivo HTML)"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <span>📄</span> Descargar historia clínica
                </button>

                {isDeceased ? (
                  <button
                    disabled
                    title="Paciente fallecido: La ficha médica está bloqueada permanentemente"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 font-semibold text-xs cursor-not-allowed select-none"
                  >
                    <span>🔒</span> Editar información (Bloqueada)
                  </button>
                ) : (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#6F2BCC] text-[#6F2BCC] dark:text-[#a78bfa] dark:border-[#a78bfa] hover:bg-sky-50 dark:hover:bg-purple-950/40 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>✏️</span> Editar información
                  </button>
                )}

                {isDeceased ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold text-xs cursor-not-allowed select-none"
                  >
                    <span>🔒</span> Solicitar nuevo examen (Bloqueado)
                  </button>
                ) : (
                  <button
                    onClick={handleOpenExam}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <span>+</span> Solicitar nuevo examen
                  </button>
                )}
              </div>
            </div>

            {/* Fila 2: Cuadro de Información General Integral (Campos de la tabla + Sede + Peso + Edad) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 py-5 border-b border-slate-100 dark:border-[#2b2052] text-xs">
              <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-purple-50/40 dark:bg-purple-950/40 rounded-2xl p-4 border border-purple-100 dark:border-purple-800/60 shadow-2xs">
                <span className="text-purple-600 dark:text-purple-300 block text-[10px] font-bold uppercase tracking-wider">
                  🐾 Especie / Raza
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white mt-1 block break-words text-sm leading-snug">
                  {patient.species} · {patient.breed}
                </span>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#201844] rounded-2xl p-4 border border-slate-200/80 dark:border-[#332666]">
                <span className="text-slate-400 dark:text-slate-300 block text-[10px] font-semibold uppercase tracking-wider">
                  👤 Propietario / Tutor
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white mt-1 block break-words">
                  {patient.owner?.name}
                </span>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#201844] rounded-2xl p-4 border border-slate-200/80 dark:border-[#332666]">
                <span className="text-slate-400 dark:text-slate-300 block text-[10px] font-semibold uppercase tracking-wider">
                  🏢 Sede de Atención
                </span>
                <span className="font-bold text-[#6F2BCC] dark:text-[#a78bfa] mt-1 block break-words text-xs">
                  {patient.sedeNombre || 'Sede Principal'}
                  {patient.codigoSedeNit && (
                    <span className="ml-1 px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/80 text-[#2B017C] dark:text-[#01FADA] text-[10px] font-mono">
                      {patient.codigoSedeNit}
                    </span>
                  )}
                </span>
              </div>

              <div className="bg-sky-50/80 dark:bg-sky-950/40 rounded-2xl p-4 border border-sky-200 dark:border-sky-800/60">
                <span className="text-sky-700 dark:text-sky-300 block text-[10px] font-bold uppercase tracking-wider">
                  ⚖️ Peso Actual
                </span>
                <span className="font-black text-sky-950 dark:text-[#01FADA] text-sm mt-1 block">
                  {patient.weight || 'N/A'}
                </span>
              </div>

              <div className="bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-800/60">
                <span className="text-indigo-700 dark:text-indigo-300 block text-[10px] font-bold uppercase tracking-wider">
                  🎂 Edad Calculada
                </span>
                <span className="font-black text-indigo-950 dark:text-indigo-200 text-sm mt-1 block">
                  {patient.age || 'No calculada'}
                </span>
              </div>
            </div>

            {/* Alerta estricta de paciente fallecido */}
            {isDeceased && (
              <div className="mt-4 p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl border-l-4 border-l-rose-500 border border-slate-700 text-xs flex items-center gap-3.5 shadow-lg">
                <span className="text-2xl shrink-0">🔒</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Ficha Archivada
                    </span>
                    <p className="font-bold text-white">Paciente Fallecido · Edición Bloqueada</p>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Este paciente se encuentra marcado con estado <strong>fallecido</strong>. La edición de su ficha médica está terminantemente bloqueada para preservar la trazabilidad legal del historial.
                  </p>
                </div>
              </div>
            )}

            {/* LÍNEA DE TIEMPO COMPLETA TIPO DELIVERY */}
            {patient.activeExamOrder ? (
              <div className="mt-4">
                <DeliveryTracker order={patient.activeExamOrder} />
              </div>
            ) : (
              !isDeceased && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>🔬</span>
                    <span>No hay solicitudes de examen activas en curso en este momento.</span>
                  </div>
                  <button
                    onClick={handleOpenExam}
                    className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                  >
                    Solicitar examen qPCR ahora
                  </button>
                </div>
              )
            )}
          </div>

          {/* ============================================================== */}
          {/* SECCIONES CLÍNICAS SEPARADAS (TABS MODULARES)                   */}
          {/* 1. Dashboard del paciente                                      */}
          {/* 2. Consultas médicas                                           */}
          {/* 3. Exámenes qPCR                                               */}
          {/* 4. Exámenes Previos e Historia Clínica Adjunta                 */}
          {/* 5. Datos Generales & Tutor (Anamnesis completa + Factores)     */}
          {/* 6. Historial de Cambios                                        */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-[#1b143c] rounded-2xl border border-slate-200/90 dark:border-[#2b2052] shadow-xs overflow-hidden">
            {/* Pestañas de Navegación Modular */}
            <div className="flex border-b border-slate-200 dark:border-[#2b2052] bg-slate-50/70 dark:bg-[#171035] text-xs font-bold px-4 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'border-[#6F2BCC] text-[#6F2BCC] dark:text-[#01FADA] dark:border-[#01FADA] bg-white dark:bg-[#1b143c] font-extrabold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>📊</span> Dashboard del Paciente
              </button>

              <button
                onClick={() => setActiveTab('consultas')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'consultas'
                    ? 'border-[#6F2BCC] text-[#6F2BCC] dark:text-[#01FADA] dark:border-[#01FADA] bg-white dark:bg-[#1b143c] font-extrabold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>🩺</span> Consultas Médicas ({patient.consultations?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('qpcr')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'qpcr'
                    ? 'border-[#6F2BCC] text-[#6F2BCC] dark:text-[#01FADA] dark:border-[#01FADA] bg-white dark:bg-[#1b143c] font-extrabold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>🔬</span> Exámenes qPCR ({qpcrExamsList.length})
              </button>

              <button
                onClick={() => setActiveTab('clinicas')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'clinicas'
                    ? 'border-[#6F2BCC] text-[#6F2BCC] dark:text-[#01FADA] dark:border-[#01FADA] bg-white dark:bg-[#1b143c] font-extrabold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>🧪</span> Pruebas Clínicas ({clinicalExamsList.length})
              </button>

              <button
                onClick={() => setActiveTab('documentos')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'documentos'
                    ? 'border-[#6F2BCC] text-[#6F2BCC] dark:text-[#01FADA] dark:border-[#01FADA] bg-white dark:bg-[#1b143c] font-extrabold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>📁</span> Exámenes e Historia ({clinicalDocs.length})
              </button>

              <button
                onClick={() => setActiveTab('general')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-[#6F2BCC] text-[#6F2BCC] dark:text-[#01FADA] dark:border-[#01FADA] bg-white dark:bg-[#1b143c] font-extrabold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>📋</span> Datos Generales & Tutor
              </button>

              <button
                onClick={() => setActiveTab('auditoria')}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'auditoria'
                    ? 'border-[#6F2BCC] text-[#6F2BCC] dark:text-[#01FADA] dark:border-[#01FADA] bg-white dark:bg-[#1b143c] font-extrabold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>📜</span> Historial de Cambios ({patient.auditHistory?.length || 1})
              </button>
            </div>

            <div className="p-6">
              {/* PESTAÑA 1: DASHBOARD DEL PACIENTE */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4.5">
                      <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                        Peso Actual
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-slate-900">{patient.weight}</span>
                        <span className="text-xs text-emerald-600 font-semibold">Óptimo</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Último pesaje: {patient.lastVisit}
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4.5">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Índice Clínico / Disbiosis
                      </span>
                      <div className="mt-1">
                        <span className="text-base font-extrabold text-emerald-900 block leading-tight">
                          {patient.healthMetrics?.lastDiagnosticScore || 'En evaluación'}
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">Perfil Microbiota qPCR</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Referencia estándar: [-5.0 a 0.0 Normal]
                      </p>
                    </div>

                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4.5">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                        Frecuencia y Seguimiento
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-slate-900">
                          {patient.consultations?.length || 1}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">Consultas registradas</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Veterinario: {(patient.attendingVet && patient.attendingVet !== 'Dr. Asignado') ? patient.attendingVet : (currentUser?.isVeterinarioAsociado ? currentUser.vetNombre : currentUser?.director || currentUser?.nombreMedico || currentUser?.nombre || 'Dr. Alejandro Morales')}
                      </p>
                    </div>
                  </div>

                  {/* Evolución de Peso y Signos Vitales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>📈</span> Historial Evolutivo de Peso
                        </h4>
                        {onNavigateToTemporalEvolution && (
                          <button
                            onClick={() => onNavigateToTemporalEvolution(patient)}
                            className="text-[11px] font-bold text-[#6F2BCC] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>Ver Curva Temporal</span> →
                          </button>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        {patient.healthMetrics?.weightHistory?.map((w, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-slate-500 font-medium">{w.date}</span>
                            <span className="font-extrabold text-slate-900">{w.weight}</span>
                          </div>
                        )) || (
                          <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-slate-500">{patient.lastVisit}</span>
                            <span className="font-extrabold text-slate-900">{patient.weight}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span>💓</span> Signos Vitales de Último Control
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold">Frec. Cardíaca</span>
                          <span className="font-extrabold text-slate-800">{patient.healthMetrics?.vitalSigns?.heartRate || '130 bpm'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold">Temperatura</span>
                          <span className="font-extrabold text-slate-800">{patient.healthMetrics?.vitalSigns?.temperature || '38.5 °C'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold">Frec. Respiratoria</span>
                          <span className="font-extrabold text-slate-800">{patient.healthMetrics?.vitalSigns?.respiratoryRate || '22 rpm'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold">Mucosas</span>
                          <span className="font-extrabold text-slate-800">{patient.healthMetrics?.vitalSigns?.mucosa || 'Rosadas'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[10px] font-semibold">TLLC (Llenado Capilar)</span>
                          <span className="font-extrabold text-slate-800">
                            {patient.healthMetrics?.vitalSigns?.capillaryRefillTime
                              ? (patient.healthMetrics.vitalSigns.capillaryRefillTime.includes('seg')
                                  ? patient.healthMetrics.vitalSigns.capillaryRefillTime
                                  : patient.healthMetrics.vitalSigns.capillaryRefillTime.includes('min')
                                  ? patient.healthMetrics.vitalSigns.capillaryRefillTime.replace('min', 'seg')
                                  : `${patient.healthMetrics.vitalSigns.capillaryRefillTime} seg`)
                              : 'Normal (< 2 seg)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cuadro Hemático Registrado si existe */}
                  {patient.cuadroHematico && (patient.cuadroHematico.hasCuadroHematico || patient.cuadroHematico.fileName || patient.cuadroHematico.hematocrito) && (
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2B017C] uppercase tracking-wider flex items-center gap-1.5">
                          <span>🩸</span> Cuadro Hemático / Hemograma
                        </span>
                        {patient.cuadroHematico.fileName && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ {patient.cuadroHematico.fileName}
                          </span>
                        )}
                      </div>
                      {(patient.cuadroHematico.hematocrito || patient.cuadroHematico.leucocitos || patient.cuadroHematico.plaquetas) && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {patient.cuadroHematico.hematocrito && (
                            <div className="bg-white p-2 rounded-xl border border-purple-100">
                              <span className="text-slate-400 text-[10px] block font-semibold">Hematocrito</span>
                              <span className="font-bold text-slate-800">{patient.cuadroHematico.hematocrito}%</span>
                            </div>
                          )}
                          {patient.cuadroHematico.hemoglobina && (
                            <div className="bg-white p-2 rounded-xl border border-purple-100">
                              <span className="text-slate-400 text-[10px] block font-semibold">Hemoglobina</span>
                              <span className="font-bold text-slate-800">{patient.cuadroHematico.hemoglobina} g/dL</span>
                            </div>
                          )}
                          {patient.cuadroHematico.leucocitos && (
                            <div className="bg-white p-2 rounded-xl border border-purple-100">
                              <span className="text-slate-400 text-[10px] block font-semibold">Leucocitos</span>
                              <span className="font-bold text-slate-800">{patient.cuadroHematico.leucocitos} /µL</span>
                            </div>
                          )}
                          {patient.cuadroHematico.plaquetas && (
                            <div className="bg-white p-2 rounded-xl border border-purple-100">
                              <span className="text-slate-400 text-[10px] block font-semibold">Plaquetas</span>
                              <span className="font-bold text-slate-800">{patient.cuadroHematico.plaquetas} /µL</span>
                            </div>
                          )}
                        </div>
                      )}
                      {patient.cuadroHematico.observaciones && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-purple-100">
                          * {patient.cuadroHematico.observaciones}
                        </p>
                      )}
                    </div>
                  )}

                  {qpcrExamsList && qpcrExamsList.length > 0 && (() => {
                    const latestExam = qpcrExamsList[0];
                    const agents = getExamAgentsList(latestExam);
                    const positives = agents.filter(
                      (a) => a.isPositive || (typeof a.result === 'string' && (a.result.toLowerCase().includes('positivo') || a.result.includes('+')))
                    );
                    const isIssued = latestExam.status === 'Emitido' || latestExam.status === 'Completado';
                    const requestedDateTime = latestExam.requestedAt || (latestExam.date ? `${latestExam.date}, 08:30 AM` : '02/09/2026, 08:30 AM');
                    const receivedDateTime = latestExam.receivedAt || (isIssued ? (latestExam.date ? `${latestExam.date}, 04:30 PM` : '03/09/2026, 04:30 PM') : 'Pendiente (en recepción)');

                    return (
                      <div className="bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-2xl p-5 border border-sky-100/80 space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                              🧬
                            </span>
                            <div>
                              <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block">
                                Último Resultado Molecular qPCR
                              </span>
                              <h5 className="font-extrabold text-sm text-slate-900">{latestExam.testName}</h5>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white text-slate-700 font-mono font-bold text-xs border border-slate-200">
                              <span>🏷️</span> Código: <strong className="text-[#6F2BCC]">{latestExam.id}</strong>
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              isIssued ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {isIssued ? '✓ Emitido' : latestExam.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">📤 Solicitud enviada</span>
                            <span className="font-bold text-slate-800">{requestedDateTime}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">📥 Recepción de examen</span>
                            <span className="font-bold text-slate-800">{receivedDateTime}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <div>
                            {positives.length > 0 ? (
                              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 inline-flex items-center gap-1">
                                <span>⚠️</span> {positives.length} {positives.length === 1 ? 'Agente Positivo Resaltado' : 'Agentes Positivos Resaltados'} ({positives.map((p) => p.name).join(', ')})
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                ✓ Todos los agentes evaluados negativos
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setActiveTab('qpcr')}
                            className="text-xs text-[#6F2BCC] hover:text-[#581ea3] font-bold underline cursor-pointer self-end sm:self-auto"
                          >
                            Ver Todos los Agentes qPCR ({agents.length}) →
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {clinicalExamsList && clinicalExamsList.length > 0 && (() => {
                    const latestClin = clinicalExamsList[0];
                    const isIssued = latestClin.status === 'Emitido' || latestClin.status === 'Completado';
                    const requestedDateTime = latestClin.requestedAt || (latestClin.date ? `${latestClin.date}, 08:30 AM` : 'Reciente');
                    const receivedDateTime = latestClin.receivedAt || (isIssued ? 'Completado' : 'Pendiente (en laboratorio)');

                    return (
                      <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl p-5 border border-teal-200/80 space-y-3 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                              🧪
                            </span>
                            <div>
                              <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
                                Última Prueba Clínica de Laboratorio
                              </span>
                              <h5 className="font-extrabold text-sm text-slate-900">{latestClin.testName || 'Prueba Clínica'}</h5>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white text-slate-700 font-mono font-bold text-xs border border-slate-200">
                              <span>🏷️</span> Código: <strong className="text-teal-700">{latestClin.id}</strong>
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              isIssued ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-teal-50 text-teal-800 border-teal-300'
                            }`}>
                              {isIssued ? '✓ Emitido' : latestClin.status || 'Solicitud Creada'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">📤 Solicitud enviada</span>
                            <span className="font-bold text-slate-800">{requestedDateTime}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">📥 Recepción / Procesamiento</span>
                            <span className="font-bold text-slate-800">{receivedDateTime}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <div className="text-xs text-slate-600 font-medium">
                            {latestClin.sampleType && (
                              <span>Muestra: <strong className="text-slate-800">{latestClin.sampleType}</strong></span>
                            )}
                          </div>
                          <button
                            onClick={() => setActiveTab('clinicas')}
                            className="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer self-end sm:self-auto"
                          >
                            Ver Pruebas Clínicas ({clinicalExamsList.length}) →
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* PESTAÑA 2: CONSULTAS MÉDICAS */}
              {activeTab === 'consultas' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Historial Cronológico de Consultas
                      </h4>
                      <p className="text-xs text-slate-500">
                        Evolución médica, constantes vitales y tratamientos registrados
                      </p>
                    </div>
                    {!isDeceased && (
                      <button
                        onClick={() => setShowConsultationModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs border border-sky-200 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <span>🩺</span> + Registrar Consulta
                      </button>
                    )}
                  </div>

                  {patient.consultations && patient.consultations.length > 0 ? (
                    <div className="space-y-3.5">
                      {patient.consultations.map((c, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3 shadow-2xs">
                          {/* Encabezado de la consulta: Fecha, Hora, Estado clínico, Peso y Médico tratante en negrita */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>📅</span> {c.date} {c.time ? `· ${c.time}` : ''}
                              </span>

                              {/* Badge de Estado Clínico (bueno, regular, malo, critico, estable) */}
                              {c.clinicalStatus && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                  c.clinicalStatus === 'Bueno' || c.clinicalStatus === 'Estable'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : c.clinicalStatus === 'Regular'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : c.clinicalStatus === 'Crítico'
                                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  Estado: {c.clinicalStatus}
                                </span>
                              )}

                              {c.weight && (
                                <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                                  ⚖️ {c.weight}
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-slate-500 font-medium">
                              Médico: <strong className="text-slate-900 font-bold">{c.vet}</strong>
                            </span>
                          </div>

                          {/* Signos Vitales registrados en la consulta */}
                          {c.vitalSigns && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/80">
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Frec. Cardíaca</span>
                                <span className="font-bold text-slate-800">{c.vitalSigns.heartRate || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Temperatura</span>
                                <span className="font-bold text-slate-800">{c.vitalSigns.temperature || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Frec. Respiratoria</span>
                                <span className="font-bold text-slate-800">{c.vitalSigns.respiratoryRate || '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Estado de Mucosas</span>
                                <span className="font-bold text-slate-800">{c.vitalSigns.mucosa || '—'}</span>
                              </div>
                            </div>
                          )}

                          {/* Campos Clínicos Requeridos */}
                          <div className="text-xs space-y-2.5 pt-0.5">
                            <div>
                              <strong className="text-slate-700 block font-semibold mb-1">Motivo de la consulta:</strong>
                              <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                                {c.reason}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              <div>
                                <strong className="text-slate-700 block font-semibold mb-1">Medicación administrada / prescrita:</strong>
                                <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 min-h-[46px]">
                                  {c.medication || c.treatment || 'Ninguna medicación prescrita'}
                                </p>
                              </div>

                              <div>
                                <strong className="text-slate-700 block font-semibold mb-1">Antecedentes relevantes:</strong>
                                <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 min-h-[46px]">
                                  {c.relevantBackground || 'Sin antecedentes relevantes reportados'}
                                </p>
                              </div>
                            </div>

                            <div>
                              <strong className="text-[#6F2BCC] block font-semibold mb-1">Observaciones y seguimiento:</strong>
                              <p className="text-slate-800 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                                {c.observationsAndFollowUp || c.diagnosis || 'Sin observaciones adicionales'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      No hay consultas médicas registradas para este paciente.
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: EXÁMENES qPCR */}
              {activeTab === 'qpcr' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Exámenes de Biología Molecular Cuantitativa (qPCR)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Resultados moleculares, amplificación genética y diagnósticos de laboratorio
                      </p>
                    </div>
                    {!isDeceased && (
                      <button
                        onClick={handleOpenExam}
                        className="px-3.5 py-1.5 rounded-xl bg-[#6F2BCC] text-white hover:bg-[#581ea3] font-bold text-xs shadow-xs cursor-pointer"
                      >
                        + Solicitar Examen qPCR
                      </button>
                    )}
                  </div>

                  {/* Nota aclaratoria médica de razonamiento clínico y diagnósticos diferenciales */}
                  <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-500/15 via-[#6F2BCC]/10 to-sky-500/5 dark:from-purple-950/40 dark:via-[#6F2BCC]/20 dark:to-sky-950/20 border-l-4 border-l-[#6F2BCC] border border-[#6F2BCC]/30 dark:border-[#6F2BCC]/40 shadow-lg shadow-[#6F2BCC]/5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6F2BCC] to-[#2B017C] text-white flex items-center justify-center text-lg shrink-0 shadow-md ring-4 ring-[#6F2BCC]/15">
                        🩺
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#6F2BCC]/15 text-[#6F2BCC] dark:text-[#01FADA] border border-[#6F2BCC]/30">
                            Anotación Médica · Criterio Clínico
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Razonamiento Diagnóstico
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                          Nota Aclaratoria de Diagnósticos Diferenciales
                        </h4>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          Cuando el paciente haya sido evaluado mediante un proceso adecuado de razonamiento clínico y se hayan seleccionado las matrices biológicas pertinentes, se deben considerar otras alternativas diagnósticas diferentes a las enfermedades infecciosas hemotrópicas.
                        </p>
                      </div>
                    </div>
                  </div>

                  {qpcrExamsList && qpcrExamsList.length > 0 ? (
                    <div className="space-y-4">
                      {qpcrExamsList.map((exam) => {
                        const allAgents = getExamAgentsList(exam);
                        const positiveAgents = allAgents.filter(
                          (a) => a.isPositive || (typeof a.result === 'string' && (a.result.toLowerCase().includes('positivo') || a.result.includes('+')))
                        );
                        const positiveCount = positiveAgents.length;
                        const isIssued = exam.status === 'Emitido' || exam.status === 'Completado';

                        // 1. Fecha y hora en que se envió la solicitud del examen
                        const requestedDateTime = exam.requestedAt || (exam.date ? `${exam.date}, 08:30 AM` : '02/09/2026, 08:30 AM');

                        // 2. Fecha y hora de cuando se recibió el examen
                        const receivedDateTime = exam.receivedAt || (isIssued ? (exam.date ? `${exam.date}, 04:30 PM` : '03/09/2026, 04:30 PM') : 'Pendiente (en recepción / laboratorio)');

                        return (
                          <div
                            key={exam.id}
                            className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:border-sky-300 transition-colors"
                          >
                            {/* ENCABEZADO: NOMBRE DEL PERFIL, CÓDIGO ESPECÍFICO DEL EXAMEN Y ESTADO */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                              <div className="flex items-start sm:items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-200 text-sky-800 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                                  🧬
                                </span>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                                      {exam.testName}
                                    </h5>
                                    {positiveCount > 0 ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1">
                                        <span>⚠️</span> {positiveCount} {positiveCount === 1 ? 'Agente Positivo' : 'Agentes Positivos'}
                                      </span>
                                    ) : isIssued ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        ✓ Todos Negativos
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {/* CÓDIGO CORRESPONDIENTE A ESE EXAMEN EN ESPECÍFICO */}
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-50 text-[#6F2BCC] font-mono font-bold text-xs border border-sky-200">
                                      <span>🏷️</span> Código del examen: <strong className="font-mono">{exam.id}</strong>
                                    </span>
                                    {exam.sampleType && (
                                      <span className="text-xs text-slate-500 font-medium">
                                        · Muestra: <strong className="text-slate-700">{exam.sampleType}</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${
                                    isIssued
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                                  }`}
                                >
                                  {isIssued ? '✓ Resultado Emitido' : exam.status || 'Solicitud Creada'}
                                </span>
                              </div>
                            </div>

                            {/* FECHA Y HORA EN QUE SE ENVIÓ LA SOLICITUD & FECHA Y HORA DE CUANDO SE RECIBIÓ EL EXAMEN */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/90">
                              <div className="flex items-start gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm shrink-0 font-bold shadow-2xs">
                                  📤
                                </span>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                    Fecha y hora en que se envió la solicitud
                                  </span>
                                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block mt-0.5">
                                    {requestedDateTime}
                                  </strong>
                                  <span className="text-[11px] text-slate-500">
                                    Orden generada en clínica veterinaria
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0 font-bold shadow-2xs">
                                  📥
                                </span>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                    Fecha y hora de cuando se recibió el examen
                                  </span>
                                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block mt-0.5">
                                    {receivedDateTime}
                                  </strong>
                                  <span className="text-[11px] text-slate-500">
                                    {isIssued ? 'Recepción de muestra y emisión de informe oficial' : 'Ingreso a laboratorio central'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* RESUMEN CLÍNICO & METODOLOGÍA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                                  Resultado Clínico / Interpretación
                                </span>
                                <span className="font-bold text-slate-800 mt-0.5 block leading-relaxed">
                                  {exam.resultSummary || 'Evaluación molecular finalizada sin anormalidades.'}
                                </span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                                  Metodología de Análisis Molecular
                                </span>
                                <span className="font-medium text-slate-700 mt-0.5 block leading-relaxed">
                                  {exam.methodology || 'qPCR cuantitativa en tiempo real con sondas de hidrólisis TaqMan'}
                                </span>
                              </div>
                            </div>

                            {/* TODOS LOS AGENTES QUE TIENE EL PERFIL & AGENTES POSITIVOS RESALTADOS */}
                            <div className="space-y-2.5 pt-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                                <div>
                                  <h6 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>🧪</span> Todos los Agentes del Perfil ({allAgents.length} analizados)
                                  </h6>
                                  <p className="text-[11px] text-slate-500">
                                    Listado completo de dianas moleculares. Los agentes positivos se encuentran resaltados con fondo rosado y badge rojo.
                                  </p>
                                </div>
                                {positiveCount > 0 && (
                                  <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 self-start sm:self-auto">
                                    ⚠️ {positiveCount} {positiveCount === 1 ? 'patógeno reactivo positivo' : 'patógenos reactivos positivos'}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {allAgents.map((agent, aIdx) => {
                                  const isPos = agent.isPositive || (typeof agent.result === 'string' && (agent.result.toLowerCase().includes('positivo') || agent.result.includes('+')));
                                  return (
                                    <div
                                      key={aIdx}
                                      className={`p-3 rounded-xl border transition-all ${
                                        isPos
                                          ? 'bg-rose-50/95 border-2 border-rose-300 ring-2 ring-rose-200 shadow-2xs'
                                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5">
                                          <span
                                            className={`block italic text-xs sm:text-sm ${
                                              isPos
                                                ? 'font-black text-rose-950 underline decoration-rose-300'
                                                : 'font-semibold text-slate-800'
                                            }`}
                                          >
                                            {agent.name}
                                          </span>
                                          {(agent.load || agent.ct) && (
                                            <span
                                              className={`text-[11px] block ${
                                                isPos
                                                  ? 'text-rose-800 font-bold'
                                                  : 'text-slate-500 font-medium'
                                              }`}
                                            >
                                              {agent.ct && agent.ct !== 'N/D' && agent.ct !== 'N/A' && `Ct: ${agent.ct} `}
                                              {agent.load && `· ${agent.load}`}
                                            </span>
                                          )}
                                        </div>

                                        <span
                                          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                                            isPos
                                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-200'
                                              : 'bg-white text-slate-600 border-slate-200'
                                          }`}
                                        >
                                          {isPos ? '🔴 POSITIVO (+)' : '⚪ Negativo (-)'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* ACCIONES AL PIE DE LA TARJETA */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                              <div>
                                {!isDeceased && positiveCount > 0 && (
                                  <button
                                    onClick={() => handleOpenExam('control')}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                                  >
                                    <span>🔄</span> Solicitar Control de Seguimiento (15% dto. en agentes positivos)
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownloadHistory()}
                                  className="text-xs text-[#6F2BCC] hover:text-[#581ea3] font-bold underline cursor-pointer flex items-center gap-1"
                                >
                                  <span>📄</span> Descargar Informe Completo en PDF / Historia Clínica →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-2xl block mb-2">🔬</span>
                      No hay exámenes qPCR registrados aún en el expediente de este paciente.
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA: PRUEBAS CLÍNICAS (PORTAFOLIO OFICIAL 223 PRUEBAS) */}
              {activeTab === 'clinicas' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-300/40 flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-lg font-bold shrink-0">
                      🧪
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                          Portafolio Clínico de Laboratorio
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          223 Pruebas de Analítica & Hematología
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        Historial de Pruebas Clínicas y Bioquímicas
                      </h4>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        Registro cronológico de perfiles bioquímicos, hemogramas, coagulación y urianálisis solicitados para este paciente.
                      </p>
                    </div>
                  </div>

                  {clinicalExamsList && clinicalExamsList.length > 0 ? (
                    <div className="space-y-4">
                      {clinicalExamsList.map((exam) => {
                        const isIssued = exam.status === 'Emitido' || exam.status === 'Completado';
                        const requestedDateTime = exam.requestedAt || (exam.date ? `${exam.date}, 08:30 AM` : 'Reciente');
                        const receivedDateTime = exam.receivedAt || (isIssued ? 'Completado' : 'Pendiente (en recepción / laboratorio)');

                        let agents = Array.isArray(exam.agents) && exam.agents.length > 0 ? exam.agents : [];
                        if (agents.length === 0) {
                          const tName = exam.testName || exam.name || 'Prueba Clínica de Laboratorio';
                          if (tName.includes('+')) {
                            agents = tName.split('+').map((part) => ({
                              name: part.trim(),
                              result: 'Normal / En rango',
                            }));
                          } else {
                            agents = [{ name: tName, result: 'Normal / En rango' }];
                          }
                        }

                        return (
                          <div
                            key={exam.id}
                            className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:border-teal-300 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                              <div className="flex items-start sm:items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                                  🧪
                                </span>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                                      {exam.testName}
                                    </h5>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                      Laboratorio Clínico
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 font-mono font-bold text-xs border border-teal-200">
                                      <span>🏷️</span> Código del examen: <strong className="font-mono">{exam.id}</strong>
                                    </span>
                                    {exam.sampleType && (
                                      <span className="text-xs text-slate-500 font-medium">
                                        · Muestra: <strong className="text-slate-700">{exam.sampleType}</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${
                                    isIssued
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-teal-50 text-teal-800 border-teal-300 animate-pulse'
                                  }`}
                                >
                                  {isIssued ? '✓ Resultado Emitido' : exam.status || 'Solicitud Creada'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/90">
                              <div className="flex items-start gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-sm shrink-0 font-bold shadow-2xs">
                                  📤
                                </span>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                    Fecha y hora de solicitud
                                  </span>
                                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block mt-0.5">
                                    {requestedDateTime}
                                  </strong>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0 font-bold shadow-2xs">
                                  📥
                                </span>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                    Recepción / Estado
                                  </span>
                                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block mt-0.5">
                                    {receivedDateTime}
                                  </strong>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-purple-100 text-[#6F2BCC] flex items-center justify-center text-sm shrink-0 font-bold shadow-2xs">
                                  👨‍⚕️
                                </span>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                                    Médico Solicitante
                                  </span>
                                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block mt-0.5">
                                    {exam.doctor || exam.requestedBy || patient.attendingVet || 'Dr. Alejandro Morales'}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {/* TABLA DE PARÁMETROS CLÍNICOS */}
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                  <tr>
                                    <th className="py-2.5 px-4">Parámetro / Prueba</th>
                                    <th className="py-2.5 px-4 text-center">Estado</th>
                                    <th className="py-2.5 px-4 text-right">Observación</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {agents.map((ag, aIdx) => (
                                    <tr key={aIdx} className="hover:bg-slate-50/70 transition-colors">
                                      <td className="py-2.5 px-4 font-bold text-slate-900">{ag.name}</td>
                                      <td className="py-2.5 px-4 text-center">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          {ag.result || 'Normal / En rango'}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-4 text-right text-slate-500 font-medium">
                                        {ag.load || 'Parámetro verificado'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-2xl block mb-2">🧪</span>
                      No hay pruebas clínicas registradas aún en el expediente de este paciente.
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA: EXÁMENES E HISTORIA CLÍNICA ADJUNTA */}
              {activeTab === 'documentos' && (
                <PatientDocumentsTab
                  patient={patient}
                  documents={clinicalDocs}
                  onAddDocument={async (newDoc) => {
                    const updated = [newDoc, ...clinicalDocs];
                    setClinicalDocs(updated);
                    if (onUpdatePatient) {
                      await onUpdatePatient(patient.id, {
                        ...patient,
                        clinicalDocuments: updated,
                      });
                    }
                  }}
                  onDeleteDocument={async (docId) => {
                    const updated = clinicalDocs.filter((d) => d.id !== docId);
                    setClinicalDocs(updated);
                    if (onUpdatePatient) {
                      await onUpdatePatient(patient.id, {
                        ...patient,
                        clinicalDocuments: updated,
                      });
                    }
                  }}
                />
              )}

              {/* PESTAÑA 5: DATOS GENERALES & TUTOR */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* SECCIÓN 4.1: INFORMACIÓN DEL TUTOR / PROPIETARIO */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                      Información del Tutor / Propietario
                    </span>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 font-semibold block">Nombre del Tutor:</span>
                          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{patient.owner?.name}</span>
                          {patient.owner?.document && (
                            <span className="text-[11px] text-slate-500 font-mono block">C.C. {patient.owner.document}</span>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block">Teléfonos de Contacto:</span>
                          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{patient.owner?.phone || 'N/A'}</span>
                          {patient.owner?.emergencyPhone && (
                            <span className="text-[11px] text-rose-600 font-medium block">
                              🚨 Emergencia: {patient.owner.emergencyPhone}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block">Correo Electrónico:</span>
                          <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">
                            {patient.owner?.email || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-t border-slate-200 pt-3">
                        <div>
                          <span className="text-slate-400 font-semibold block">Departamento y Ciudad:</span>
                          <span className="font-bold text-slate-800 mt-0.5 block">
                            {patient.owner?.department || 'Bogotá D.C.'} · {patient.owner?.city || 'Bogotá'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block">Dirección Residencial:</span>
                          <span className="font-medium text-slate-700 mt-0.5 block">
                            {patient.owner?.address || 'No registrada'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block">Estrato Socioeconómico:</span>
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-sky-100 text-sky-800 mt-0.5">
                            {patient.owner?.stratum || 'Estrato 3'}
                          </span>
                        </div>
                      </div>

                      {/* Seguro VetPlus */}
                      <div className="border-t border-slate-200 pt-3 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🛡️</span>
                          <span className="text-xs font-semibold text-slate-700">Aseguramiento VetPlus:</span>
                          {patient.owner?.hasVetPlus ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              ✓ Asegurado con VetPlus
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                              No asegurado
                            </span>
                          )}
                        </div>

                        {patient.owner?.hasVetPlus && patient.owner?.vetPlusCode && (
                          <div className="text-xs font-mono bg-white px-3 py-1 rounded-xl border border-sky-200 text-sky-900 font-bold">
                            Código Autorización: {patient.owner.vetPlusCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 4.2: IDENTIDAD BIOLÓGICA INMUTABLE (Sin microchip) */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                      Identidad Biológica Inmutable (Sin microchip)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-2">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Especie y Raza</span>
                        <span className="font-extrabold text-slate-800 text-sm mt-0.5 block break-words leading-snug">{patient.species} · {patient.breed}</span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Sexo (Inmutable)</span>
                        <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{patient.sex || 'Hembra'}</span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Fecha Nacimiento</span>
                        <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{patient.birthDate || 'No registrada'}</span>
                      </div>
                      <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200">
                        <span className="text-sky-600 block text-[10px] font-semibold uppercase">Edad Calculada</span>
                        <span className="font-extrabold text-sky-900 text-sm mt-0.5 block">{patient.age}</span>
                      </div>
                      <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                        <span className="text-purple-600 block text-[10px] font-semibold uppercase">Esterilizado / Castrado</span>
                        <span className="font-extrabold text-purple-900 text-sm mt-0.5 block flex items-center gap-1">
                          {patient.isSterilized ? '🔒 ✓ Sí (Esterilizado · Irreversible)' : 'No (Entero)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 4.3: HÁBITAT Y FACTORES DE RIESGO (EXPOSICIÓN Y CONTACTO) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Hábitat y Factores de Riesgo (Exposición y Contacto)
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Hábitat: {rf.habitat || 'Interiores'}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-700">Contacto con otros animales fuera del hogar:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${rf.contactOutside?.hasContact ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rf.contactOutside?.hasContact ? 'Sí' : 'No'}
                          </span>
                        </div>

                        {rf.contactOutside?.hasContact && rf.contactOutside?.contactType && (
                          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 sm:col-span-2 text-amber-900">
                            <strong>Tipo de contacto fuera:</strong> {rf.contactOutside.contactType}
                          </div>
                        )}

                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-700">Convivencia con otros animales:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${rf.livesWithOtherAnimals ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rf.livesWithOtherAnimals ? 'Sí' : 'No'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-700">Viajes recientes fuera del departamento:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${rf.recentTravel ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rf.recentTravel ? 'Sí' : 'No'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-700">Acceso a zonas rurales o boscosas:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${rf.ruralAccess ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rf.ruralAccess ? 'Sí' : 'No'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-700">Historial de pulgas, garrapatas o ácaros:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${rf.parasiteExposure ? 'bg-rose-100 text-rose-800 font-black' : 'bg-slate-100 text-slate-600'}`}>
                            {rf.parasiteExposure ? 'Sí' : 'No'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-700">Ingesta de agua no potable o estancada:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${rf.outdoorWater ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rf.outdoorWater ? 'Sí' : 'No'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-700">Rescatado recientemente de zona costera:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${rf.coastalRescue ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rf.coastalRescue ? `Sí${rf.coastalRescueLocation ? ` (${rf.coastalRescueLocation})` : ''}` : 'No'}
                          </span>
                        </div>
                      </div>

                      {rf.otherRiskFactors && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                          <strong className="text-slate-900 block mb-0.5">Otros factores de riesgo:</strong>
                          {rf.otherRiskFactors}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN 4.4: ADMISIÓN MÉDICA INICIAL & SÍNTOMAS */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                      Admisión Médica Inicial y Anamnesis
                    </span>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
                      {/* Estado Asintomático / Sintomático con Chips */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-700">Condición al Ingreso:</span>
                          <span className={`px-3 py-0.5 rounded-full font-bold text-xs ${ma.isAsymptomatic ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {ma.isAsymptomatic ? '✓ Asintomático' : '⚠️ Presenta Síntomas'}
                          </span>
                        </div>

                        {!ma.isAsymptomatic && ma.symptoms && ma.symptoms.length > 0 && (
                          <div className="mt-2.5">
                            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                              Signos y síntomas clínicos reportados:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {ma.symptoms.map((sym, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-[11px]"
                                >
                                  • {sym}
                                </span>
                              ))}
                              {ma.otherSymptoms && (
                                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px]">
                                  + {ma.otherSymptoms}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hallazgos al examen físico */}
                      {ma.physicalFindings && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                          <strong className="text-slate-800 block mb-1">Hallazgos clínicos al examen físico:</strong>
                          <p className="text-slate-700">{ma.physicalFindings}</p>
                        </div>
                      )}

                      {/* Vacunación y desparasitación */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Vacunación</span>
                          <span className="font-bold text-slate-800 mt-0.5 block">
                            {ma.vaccinationStatus || 'Al día'}{ma.lastVaccinationDate ? ` (Última: ${ma.lastVaccinationDate})` : ''}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Desparasitación</span>
                          <span className="font-bold text-slate-800 mt-0.5 block">
                            {ma.dewormingStatus || 'Al día'}{ma.lastDewormingDate ? ` (Última: ${ma.lastDewormingDate})` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Alergias, Antecedentes Médicos y Observaciones */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className={`p-3 rounded-xl border ${hasReportedAllergy(patient) ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-[#1a1336] border-slate-200 dark:border-[#2b2052]'}`}>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Alergias o Contraindicaciones</span>
                          {hasReportedAllergy(patient) ? (
                            <span className="font-bold text-rose-800 dark:text-rose-300 text-xs mt-0.5 block flex items-center gap-1">
                              <span>⚠️</span> {getAllergyDisplay(patient)}
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">Sin alergias conocidas</span>
                          )}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Antecedentes Médicos / Patológicos</span>
                          <span className="font-medium text-slate-800 text-xs mt-0.5 block">
                            {patient.medicalBackground || 'Sin antecedentes patológicos previos reportados.'}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Notas Clínicas Generales</span>
                          <span className="text-slate-700 text-xs mt-0.5 block italic">
                            "{patient.notes || 'Sin observaciones adicionales'}"
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 5: HISTORIAL DE CAMBIOS Y AUDITORÍA INTEGRAL */}
              {activeTab === 'auditoria' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-[#2B017C] flex items-center gap-2">
                        <span>📜</span> Trazabilidad Legal & Auditoría del Paciente
                      </h4>
                      <p className="text-xs text-purple-900/80">
                        Registro cronológico de todas las modificaciones realizadas sobre la ficha médica, factores de riesgo, constantes vitales y datos administrativos.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white border border-purple-200 text-[#6F2BCC] font-bold text-xs rounded-xl shadow-2xs shrink-0">
                      Total eventos: {(patient.auditHistory?.length || 1)}
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-purple-200">
                    {(patient.auditHistory && patient.auditHistory.length > 0
                      ? patient.auditHistory
                      : [
                          {
                            id: 'AUD-0',
                            fecha: patient.lastVisit || '10/01/2026 09:00 AM',
                            veterinario: 'Dr. Alejandro Morales',
                            rol: 'Director Médico / Admin',
                            accion: 'Registro y admisión inicial de paciente',
                            cambios: [
                              { campo: 'Expediente', categoria: 'General', anterior: 'Inexistente', nuevo: 'Ficha médica creada' },
                              { campo: 'Hábitat Inicial', categoria: 'Factores de Riesgo', anterior: '-', nuevo: patient.riskFactors?.habitat || 'Casa urbana' },
                              { campo: 'Esterilización', categoria: 'Reproducción', anterior: '-', nuevo: patient.isSterilized ? 'Esterilizado' : 'Entero' },
                              { campo: 'Peso Inicial', categoria: 'Medidas', anterior: '-', nuevo: patient.weight || '3.5 kg' },
                            ],
                          },
                        ]
                    ).map((entry, eIdx) => (
                      <div key={entry.id || eIdx} className="relative group">
                        <span className="absolute -left-[1.8rem] top-1.5 w-4 h-4 rounded-full bg-[#6F2BCC] ring-4 ring-purple-100 shadow-xs" />
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-[#6F2BCC] bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200/80">
                                {entry.fecha}
                              </span>
                              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {entry.accion}
                              </h5>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>👨‍⚕️ {entry.veterinario || 'Dr. Alejandro Morales'}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                                {entry.rol || 'Admin'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Valores y campos modificados:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(entry.cambios || []).map((ch, cIdx) => (
                                <div key={cIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex flex-col justify-between gap-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800">{ch.campo}</span>
                                    {ch.categoria && (
                                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-[#6F2BCC]">
                                        {ch.categoria}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-medium pt-0.5">
                                    <span className="line-through text-slate-400 truncate max-w-[120px]" title={String(ch.anterior)}>
                                      {String(ch.anterior || 'Vacío')}
                                    </span>
                                    <span className="text-slate-400">➔</span>
                                    <span className="font-extrabold text-[#2B017C] bg-white px-2 py-0.5 rounded border border-purple-200 truncate max-w-[150px]" title={String(ch.nuevo)}>
                                      {String(ch.nuevo || 'Vacío')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditPatientModal
          patient={patient}
          currentUser={currentUser}
          activeClinic={activeClinic}
          onClose={() => setShowEditModal(false)}
          onSave={async (updatedData) => {
            await onUpdatePatient(patient.id, updatedData);
          }}
        />
      )}

      {showExamModal && (
        <RequestExamModal
          patient={patient}
          patients={[patient]}
          initialExamType={examModalType}
          onClose={() => setShowExamModal(false)}
          onRequest={async (arg1, arg2) => {
            const examData = arg2 || arg1;
            const targetId = arg2 ? arg1 : patient.id;
            await onRequestExam(targetId, examData);
          }}
        />
      )}

      {showConsultationModal && (
        <NewConsultationModal
          patient={patient}
          currentUser={currentUser}
          activeClinic={activeClinic}
          onClose={() => setShowConsultationModal(false)}
          onConsultationSaved={handleSaveConsultation}
        />
      )}
    </div>
  );
}
