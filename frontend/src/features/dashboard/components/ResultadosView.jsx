import React, { useState, useMemo } from 'react';
import { downloadClinicalHistoryDocument } from '../utils/clinicalHistoryDocument.js';
import { authService } from '../../auth/services/authService.js';

export default function ResultadosView({
  patients = [],
  currentUser = null,
  onSelectPatient,
  onNavigateToNewExam,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'qpcr' | 'clinicas' | 'microbiota'
  const [filterResult, setFilterResult] = useState('all'); // 'all' | 'positive' | 'negative'

  // Resolver nombre del médico veterinario o director de la sesión actual
  const loggedInDoctorName = useMemo(() => {
    const user = currentUser || authService.getCurrentUser();
    if (user) {
      if (user.isVeterinarioAsociado && user.vetNombre) return user.vetNombre;
      if (user.nombreMedico) return user.nombreMedico;
      if (user.director && user.director !== 'Responsable Médico') return user.director;
      if (user.directorMedico?.nombre) return user.directorMedico.nombre;
      if (user.nombreCompleto) return user.nombreCompleto;
      if (user.nombre && !user.nombre.toLowerCase().includes('clinica') && !user.nombre.toLowerCase().includes('veterinaria')) {
        return user.nombre;
      }
      if (user.director) return user.director;
    }
    return '';
  }, [currentUser]);

  // Helper robusto para determinar categoría del examen
  const detectCategory = (exam, testName = '') => {
    // 1. Prioridad absoluta: requestCategory explícito
    const reqCat = (exam?.requestCategory || '').trim().toLowerCase();
    if (reqCat === 'qpcr') return 'qpcr';
    if (reqCat === 'clinicas' || reqCat === 'clínicas') return 'clinicas';
    if (reqCat === 'microbiota') return 'microbiota';

    // 2. Prefijo inequívoco en ID o código de orden
    const examId = String(exam?.id || exam?.examCode || exam?.orderId || '').toUpperCase().trim();
    if (examId.startsWith('CLN-')) return 'clinicas';
    if (examId.startsWith('MIC-')) return 'microbiota';
    if (examId.startsWith('QPCR-') || examId.startsWith('CTRL-')) return 'qpcr';

    // 3. Category explícita
    const rawCat = (exam?.category || '').toLowerCase();
    if (rawCat.includes('molecular') || rawCat.includes('qpcr') || rawCat.includes('genómica') || rawCat.includes('genomica')) {
      return 'qpcr';
    }
    if (rawCat.includes('portafolio') || rawCat.includes('analítica') || rawCat.includes('analitica') || rawCat === 'clinicas' || rawCat === 'clínicas') {
      return 'clinicas';
    }
    if (rawCat.includes('microbiota') || rawCat.includes('16s') || rawCat.includes('disbiosis')) {
      return 'microbiota';
    }

    // 4. Analizar texto del examen (nombre, dianas, metodología)
    const text = `${testName} ${exam?.testName || ''} ${exam?.name || ''} ${exam?.targets || ''} ${exam?.methodology || ''}`.toLowerCase();

    // Detección de Microbiota
    if (text.includes('microbiota') || text.includes('16s') || text.includes('disbiosis') || text.includes('metagenom')) {
      return 'microbiota';
    }

    // Detección de qPCR / Biología Molecular
    const qpcrKeywords = [
      'qpcr', 'pcr', 'taqman', 'multiplex', 'tiempo real', 'carga genómica', 'carga genomica',
      'hemotrópico', 'hemotropico', 'vectorial', 'parvovirus', 'distemper', 'moquillo',
      'ehrlichia', 'anaplasma', 'babesia', 'mycoplasma', 'leishmania', 'leptospira',
      'calicivirus', 'herpesvirus', 'felv', 'fiv', 'pif', 'coronavirus', 'toxoplasma',
      'giardia', 'cryptosporidium', 'brucella', 'bartonella', 'bordetella', 'campylobacter',
      'salmonella', 'chlamydia', 'dermatofitos', 'sondeo genético', 'sondeo genetico'
    ];
    const isQpcr = qpcrKeywords.some((k) => text.includes(k));

    // Detección de Clínicas (palabras completas con límites \b para evitar falsos positivos como "gastrointestinal" -> "ast" o "cryptosporidium" -> "pt")
    const clinicalPatterns = [
      /\btromboplastina\b/i, /\bcoagula[cç][ií]on\b/i, /\baptt\b/i, /\bfibrin[oó]geno\b/i,
      /\bhemograma\b/i, /\bcuadro hem[aá]tico\b/i, /\bhematocrito\b/i, /\bleucograma\b/i,
      /\bqu[ií]mica sang/i, /\bbioqu[ií]mica\b/i, /\bperfil hep[aá]tico\b/i, /\bperfil renal\b/i,
      /\bperfil lip[ií]dico\b/i, /\burian[aá]lisis\b/i, /\bparcial de orina\b/i, /\bcoprol[oó]gico\b/i,
      /\bcoprosc[oó]pico\b/i, /\belectrolitos\b/i, /\bcreatinina\b/i, /\btransaminasa/i,
      /\b(?:alt|tgp)\b/i, /\b(?:ast|tgo)\b/i, /\b(?:alp|fosfatasa alcalina)\b/i, /\bbun\b/i,
      /\bglucosa\b/i, /\burea\b/i, /\bamilasa\b/i, /\blipasa\b/i, /\bbilirrubina\b/i,
      /\bcolesterol\b/i, /\btriglic[eé]ridos\b/i, /\bprote[ií]nas totales\b/i, /\balb[uú]mina\b/i,
      /\bglobulina\b/i, /\bsdma\b/i, /\btroponina\b/i, /\bprogesterona\b/i, /\b[aá]cidos biliares\b/i,
      /\bcpl\b/i, /\bfpl\b/i, /\brotavirus antígeno\b/i, /\btiempos de coagulaci[oó]n\b/i,
      /\btiempo de protrombina\b/i, /\bfrotis sangu[ií]neo\b/i
    ];
    const isClinicas = clinicalPatterns.some((regex) => regex.test(text));

    if (isQpcr && !isClinicas) return 'qpcr';
    if (isClinicas && !isQpcr) return 'clinicas';
    if (isQpcr && isClinicas) {
      if (rawCat.includes('portafolio') || rawCat.includes('clínic') || rawCat.includes('clinic')) return 'clinicas';
      return 'qpcr';
    }

    return 'qpcr';
  };

  // Consolidar todos los exámenes de todas las categorías en pacientes
  const allResults = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    patients.forEach((patient) => {
      // Función para resolver el doctor responsable descartando 'Dr. Asignado'
      const resolveDoctor = (doctorCandidate) => {
        if (doctorCandidate && doctorCandidate !== 'Dr. Asignado' && doctorCandidate !== 'N/A') {
          return doctorCandidate;
        }
        if (patient.attendingVet && patient.attendingVet !== 'Dr. Asignado' && patient.attendingVet !== 'N/A') {
          return patient.attendingVet;
        }
        if (loggedInDoctorName && loggedInDoctorName !== 'Dr. Asignado') {
          return loggedInDoctorName;
        }
        return 'Dr. Alejandro Morales';
      };

      // 1. Exámenes en historial qpcrExams (o genéricos)
      if (patient.qpcrExams && Array.isArray(patient.qpcrExams)) {
        patient.qpcrExams.forEach((exam) => {
          let examId = exam.id || exam.examCode || `ORD-HIST-${patient.id}-${Math.random().toString(36).slice(2, 6)}`;
          if (seenIds.has(examId)) return;
          seenIds.add(examId);

          const cat = detectCategory(exam, exam.testName || exam.name);

          // Si es clínico y venía con prefijo QPCR por compatibilidad anterior, normalizar ID a CLN-
          let displayId = examId;
          if (cat === 'clinicas' && displayId.startsWith('QPCR-')) {
            displayId = displayId.replace('QPCR-', 'CLN-');
          } else if (cat === 'microbiota' && displayId.startsWith('QPCR-')) {
            displayId = displayId.replace('QPCR-', 'MIC-');
          }

          const doc = resolveDoctor(exam.doctor || exam.requestedBy);

          // Normalizar agentes/parámetros si es prueba clínica
          let agents = Array.isArray(exam.agents) && exam.agents.length > 0 ? exam.agents : [];
          if (cat === 'clinicas' && agents.length === 0) {
            const tName = exam.testName || exam.name || 'Prueba Clínica de Laboratorio';
            if (tName.includes('+')) {
              agents = tName.split('+').map((part) => ({
                name: part.trim(),
                isPositive: false,
                isAltered: false,
                result: 'Normal / En rango',
              }));
            } else {
              agents = [{ name: tName, isPositive: false, isAltered: false, result: 'Normal / En rango' }];
            }
          } else if (agents.length === 0) {
            agents = [{ name: 'Resultado del análisis', isPositive: false, result: 'En rango / Negativo' }];
          }

          list.push({
            id: displayId,
            rawId: examId,
            testName: exam.testName || exam.name || (cat === 'clinicas' ? 'Prueba Diagnóstica Clínica' : cat === 'microbiota' ? 'Microbiota 16S' : 'Panel qPCR Molecular'),
            category: cat,
            patient,
            requestedAt: exam.requestedAt || exam.date || '05/09/2026 - 09:30 AM',
            receivedAt: exam.receivedAt || exam.date || '06/09/2026 - 04:15 PM',
            agents,
            sampleType: exam.sampleType || (cat === 'microbiota' ? 'Muestra fecal en tubo estabilizador' : cat === 'clinicas' ? 'Muestra biológica de laboratorio clínico' : 'Sangre total con EDTA (2 ml)'),
            doctor: doc,
            observations: exam.observations || exam.clinicalObservations || '',
          });
        });
      }

      // 2. Exámenes clínicos específicos en historial si los hubiere
      const clinicalHist = patient.clinicalExams || patient.clinicalOrders;
      if (clinicalHist && Array.isArray(clinicalHist)) {
        clinicalHist.forEach((exam) => {
          const examId = exam.id || exam.orderId || `CLN-${patient.id}-${Math.random().toString(36).slice(2, 6)}`;
          if (seenIds.has(examId)) return;
          seenIds.add(examId);

          const doc = resolveDoctor(exam.doctor || exam.requestedBy);

          list.push({
            id: examId,
            rawId: examId,
            testName: exam.testName || exam.nombre || 'Perfil Clínico de Laboratorio',
            category: 'clinicas',
            patient,
            requestedAt: exam.requestedAt || exam.date || 'Reciente',
            receivedAt: exam.receivedAt || 'Emitido',
            agents: Array.isArray(exam.parameters || exam.agents) ? (exam.parameters || exam.agents) : [
              { name: 'Hematocrito / Hemoglobina', isPositive: false, result: 'Normal' },
              { name: 'Recuento Leucocitario', isPositive: false, result: 'Normal' },
              { name: 'Plaquetas', isPositive: false, result: 'Adecuadas' },
            ],
            sampleType: exam.sampleType || 'Sangre total / Suero / Plasma',
            doctor: doc,
            observations: exam.observations || '',
          });
        });
      }

      // 3. Exámenes de microbiota específicos en historial si los hubiere
      const microHist = patient.microbiotaOrders || patient.microbiotaExams;
      if (microHist && Array.isArray(microHist)) {
        microHist.forEach((exam) => {
          const examId = exam.id || exam.orderId || `MIC-${patient.id}-${Math.random().toString(36).slice(2, 6)}`;
          if (seenIds.has(examId)) return;
          seenIds.add(examId);

          const doc = resolveDoctor(exam.doctor || exam.requestedBy);

          list.push({
            id: examId,
            rawId: examId,
            testName: exam.testName || 'Microbiota Gastrointestinal (16S rRNA NGS)',
            category: 'microbiota',
            patient,
            requestedAt: exam.requestedAt || exam.date || 'Reciente',
            receivedAt: exam.receivedAt || 'Emitido',
            agents: Array.isArray(exam.agents) ? exam.agents : [
              { name: 'Índice de Disbiosis Fecal', isPositive: false, ct: '1.4', load: 'Eubiosis / Normal' },
              { name: 'Phylum Firmicutes', isPositive: false, ct: '58.2%', load: 'Abundancia adecuada' },
              { name: 'Phylum Bacteroidetes', isPositive: false, ct: '32.1%', load: 'Abundancia adecuada' },
              { name: 'Phylum Proteobacteria', isPositive: false, ct: '2.4%', load: 'Baja abundancia (Saludable)' },
            ],
            sampleType: exam.sampleType || 'Muestra fecal con estabilizador de ADN',
            doctor: doc,
            observations: exam.observations || '',
          });
        });
      }

      // 4. Orden activa si ya fue emitida o enviada
      if (patient.activeExamOrder && (patient.activeExamOrder.currentStep >= 3 || patient.sampleStatus === 'Resultado enviado')) {
        const order = patient.activeExamOrder;
        if (!seenIds.has(order.id)) {
          seenIds.add(order.id);
          const cat = detectCategory(order, order.testName);

          let displayId = order.id;
          if (cat === 'clinicas' && displayId.startsWith('ORD-')) {
            displayId = displayId.replace('ORD-', 'CLN-');
          } else if (cat === 'microbiota' && displayId.startsWith('ORD-')) {
            displayId = displayId.replace('ORD-', 'MIC-');
          }

          const doc = resolveDoctor(order.requestedBy || order.doctor);

          let fallbackAgents = [];
          if (cat === 'clinicas') {
            fallbackAgents = order.selectedClinicalExams?.length > 0
              ? order.selectedClinicalExams.map((e) => ({
                  name: e.nombre || e.name || 'Parámetro de laboratorio',
                  isPositive: false,
                  ct: 'Rango normal',
                  load: 'Conforme',
                }))
              : [
                  { name: order.testName || 'Parámetros bioquímicos', isPositive: false, ct: 'Normal', load: 'Dentro de referencia' },
                ];
          } else if (cat === 'microbiota') {
            fallbackAgents = [
              { name: 'Diversidad Alfa (Shannon Index)', isPositive: false, ct: '4.8', load: 'Alta biodiversidad' },
              { name: 'Ratio Firmicutes/Bacteroidetes', isPositive: false, ct: '1.81', load: 'Equilibrado' },
              { name: 'Patobiontes Pro-inflamatorios', isPositive: false, ct: 'No elevados', load: 'Sin sobrecrecimiento' },
            ];
          } else {
            fallbackAgents = [
              { name: 'Mycoplasma haemocanis', isPositive: true, ct: '22.4', load: '1.2e5 copias/µL' },
              { name: 'Babesia canis', isPositive: false, ct: 'N/D', load: 'No detectado' },
              { name: 'Ehrlichia canis', isPositive: false, ct: 'N/D', load: 'No detectado' },
              { name: 'Anaplasma platys', isPositive: false, ct: 'N/D', load: 'No detectado' },
            ];
          }

          list.push({
            id: displayId,
            rawId: order.id,
            testName: order.testName || (cat === 'clinicas' ? 'Portafolio Clínico' : cat === 'microbiota' ? 'Microbiota 16S' : 'Panel qPCR'),
            category: cat,
            patient,
            requestedAt: order.requestedAt || 'Reciente',
            receivedAt: 'Hoy - 05:00 PM',
            agents: Array.isArray(order.agents) && order.agents.length > 0 ? order.agents : fallbackAgents,
            sampleType: order.sampleType || (cat === 'clinicas' ? 'Muestra biológica de laboratorio clínico' : 'Muestra de laboratorio'),
            doctor: doc,
            observations: order.clinicalObservations || '',
          });
        }
      }
    });

    return list;
  }, [patients, loggedInDoctorName]);

  // Contadores por categoría para tabs
  const categoryCounts = useMemo(() => {
    const counts = { all: allResults.length, qpcr: 0, clinicas: 0, microbiota: 0 };
    allResults.forEach((item) => {
      if (counts[item.category] !== undefined) counts[item.category] += 1;
    });
    return counts;
  }, [allResults]);

  // Filtrado compuesto: Búsqueda de texto + Categoría + Estado del resultado
  const filteredResults = useMemo(() => {
    return allResults.filter((item) => {
      const pName = `${item.patient.name} ${item.patient.lastName || ''}`.toLowerCase();
      const code = item.id.toLowerCase();
      const tName = item.testName.toLowerCase();
      const q = searchTerm.trim().toLowerCase();

      const matchesSearch = !q || pName.includes(q) || code.includes(q) || tName.includes(q);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      const hasPositives = item.agents.some((a) => a.isPositive || a.isAltered);
      let matchesResult = true;
      if (filterResult === 'positive') matchesResult = hasPositives;
      if (filterResult === 'negative') matchesResult = !hasPositives;

      return matchesSearch && matchesCategory && matchesResult;
    });
  }, [allResults, searchTerm, categoryFilter, filterResult]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Encabezado del Módulo de Resultados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              MÓDULO DE RESULTADOS
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
              · Diagnóstico Molecular, Clínico & Microbiota
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Resultados Diagnósticos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consulta consolidada de biología molecular qPCR, portafolio clínico de 223 pruebas y metagenómica de microbiota 16S.
          </p>
        </div>

        <button
          onClick={() => onNavigateToNewExam?.(null, 'nuevo')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>✨</span> Solicitar nuevo examen
        </button>
      </div>

      {/* Nota aclaratoria médica obligatoria sobre razonamiento clínico */}
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
                Abordaje Diagnóstico Obligatorio
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
              Nota Aclaratoria de Razonamiento Clínico y Abordaje Diagnóstico
            </h4>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              Cuando el paciente haya sido evaluado mediante un proceso adecuado de razonamiento clínico y se hayan seleccionado las matrices biológicas pertinentes, se deben considerar otras alternativas diagnósticas diferentes a las enfermedades infecciosas hemotrópicas.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Principales: Búsqueda, Categoría y Estado */}
      <div className="space-y-3">
        {/* Pestañas de Selección de Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-[#150f28] border border-slate-200 dark:border-[#2f2257] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f163d]'
            }`}
          >
            <span>📋</span>
            <span>Todos los Exámenes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {categoryCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('qpcr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'qpcr'
                ? 'bg-[#6F2BCC] text-white shadow-sm'
                : 'bg-white dark:bg-[#150f28] border border-slate-200 dark:border-[#2f2257] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f163d]'
            }`}
          >
            <span>🧬</span>
            <span>Biología Molecular (qPCR)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {categoryCounts.qpcr}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('clinicas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'clinicas'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white dark:bg-[#150f28] border border-slate-200 dark:border-[#2f2257] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f163d]'
            }`}
          >
            <span>🏥</span>
            <span>Portafolio Clínico (223 Pruebas)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {categoryCounts.clinicas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('microbiota')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'microbiota'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-white dark:bg-[#150f28] border border-slate-200 dark:border-[#2f2257] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f163d]'
            }`}
          >
            <span>🦠</span>
            <span>Microbiota 16S (NGS)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {categoryCounts.microbiota}
            </span>
          </button>
        </div>

        {/* Barra de Filtros: Buscador + Filtro Positivos/Negativos */}
        <div className="bg-white dark:bg-[#150f28] rounded-2xl p-4 border border-slate-200/80 dark:border-[#2f2257] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-96">
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nombre del paciente o examen..."
              className="w-full text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estado:</span>
            <div className="flex rounded-xl bg-slate-100 dark:bg-[#1b1434] p-0.5 border border-slate-200 dark:border-[#2f2257] text-xs font-bold">
              <button
                onClick={() => setFilterResult('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterResult === 'all'
                    ? 'bg-white dark:bg-[#251b47] text-slate-800 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Todos ({filteredResults.length})
              </button>
              <button
                onClick={() => setFilterResult('positive')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterResult === 'positive'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Con Positivos / Alterados
              </button>
              <button
                onClick={() => setFilterResult('negative')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterResult === 'negative'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Negativos / Normales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Tarjetas de Resultados */}
      {filteredResults.length > 0 ? (
        <div className="space-y-5">
          {filteredResults.map((item) => {
            const positiveAgents = item.agents.filter((a) => a.isPositive || a.isAltered);
            const isQpcr = item.category === 'qpcr';
            const isClinicas = item.category === 'clinicas';
            const isMicrobiota = item.category === 'microbiota';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#150f28] rounded-3xl border border-slate-200/90 dark:border-[#2f2257] p-5 sm:p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-purple-800/60 transition-all"
              >
                {/* Cabecera del Examen con Alta Trazabilidad del Paciente */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#2f2257]/60">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar de la Mascota con Distintivo de Categoría */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-2xl shadow-2xs">
                        {item.patient.avatar || (item.patient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs ${
                        isClinicas ? 'bg-teal-600' : isMicrobiota ? 'bg-sky-600' : 'bg-[#6F2BCC]'
                      }`}>
                        {isClinicas ? '🏥' : isMicrobiota ? '🦠' : '🧬'}
                      </span>
                    </div>

                    <div>
                      {/* Píldoras de Trazabilidad: Categoría + Código + Nombre del Paciente */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Distintivo de Categoría */}
                        <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isClinicas
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                            : isMicrobiota
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                            : 'bg-purple-50 dark:bg-purple-950/60 text-[#6F2BCC] dark:text-[#01FADA] border-purple-200 dark:border-purple-800'
                        }`}>
                          {isClinicas ? '🏥 Portafolio Clínico' : isMicrobiota ? '🦠 Microbiota 16S' : '🧬 qPCR Molecular'}
                        </span>

                        <span className="font-mono text-xs font-bold text-sky-900 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                          <span>📋</span>
                          <span>Código: {item.id}</span>
                        </span>

                        <span className="text-xs font-black bg-purple-100 dark:bg-purple-950/70 text-[#2B017C] dark:text-purple-200 px-3 py-0.5 rounded-full border border-purple-300/80 dark:border-purple-800 flex items-center gap-1.5 shadow-2xs">
                          <span>🐾</span>
                          <span>Paciente: <strong className="underline decoration-purple-400">{item.patient.name} {item.patient.lastName || ''}</strong></span>
                        </span>

                        {positiveAgents.length > 0 ? (
                          <span className="text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            {positiveAgents.length} {isClinicas ? 'Alteración(es)' : 'Positivo(s)'}
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                            ✓ {isClinicas ? 'Valores Normales' : isMicrobiota ? 'Eubiosis Estable' : 'Todo Negativo'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {item.testName}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Mascota: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.patient.name} {item.patient.lastName || ''}</strong> ({item.patient.species} · {item.patient.breed}{item.patient.age ? ` · ${item.patient.age}` : ''})</span>
                        <span>·</span>
                        <span>Tutor: <strong className="text-slate-700 dark:text-slate-300">{item.patient.owner?.name || `${item.patient.owner?.firstName || ''} ${item.patient.owner?.lastName || ''}`.trim() || 'No registrado'}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onSelectPatient(item.patient)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#2f2257] hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-[#1f163d] text-slate-700 dark:text-slate-200 hover:text-[#6F2BCC] dark:hover:text-[#01FADA] font-bold text-xs cursor-pointer transition-all flex items-center gap-1"
                    >
                      <span>Ver Ficha</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => downloadClinicalHistoryDocument(item.patient)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1"
                    >
                      <span>📥</span> Informe Visual
                    </button>
                  </div>
                </div>

                {/* Métricas de Fechas, Horas y Paciente (Trazabilidad 5 columnas) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 dark:bg-[#1a1235] p-3.5 rounded-2xl text-xs border border-slate-100 dark:border-[#2f2257]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                      Paciente Asignado
                    </span>
                    <span className="font-extrabold text-[#2B017C] dark:text-[#01FADA] truncate block text-xs">
                      🐾 {item.patient.name} {item.patient.lastName || ''}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {item.patient.id || 'PAC'} · {item.patient.species}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                      Solicitud Enviada
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.requestedAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                      Resultado Recibido
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.receivedAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                      Muestra Procesada
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {item.sampleType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                      Responsable Médico
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {item.doctor}
                    </span>
                  </div>
                </div>

                {/* Rejilla de Agentes / Parámetros: Positivos/Alterados Resaltados y Negativos */}
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-2">
                    {isClinicas
                      ? 'Parámetros Evaluados en el Laboratorio Clínico'
                      : isMicrobiota
                      ? 'Biomarcadores Metagenómicos y Perfil Bacteriano'
                      : 'Diana Molecular / Agentes Analizados en el Panel qPCR'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.agents.map((agent, aIdx) => (
                      <div
                        key={aIdx}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          agent.isPositive || agent.isAltered
                            ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 ring-1 ring-rose-200 dark:ring-rose-800'
                            : 'bg-white dark:bg-[#1a1235] border-slate-200/80 dark:border-[#2f2257]'
                        }`}
                      >
                        <div>
                          <span
                            className={`block text-xs ${
                              isQpcr ? 'italic' : ''
                            } ${
                              agent.isPositive || agent.isAltered
                                ? 'font-black text-rose-950 dark:text-rose-200 underline decoration-rose-300 dark:decoration-rose-700'
                                : 'font-medium text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {agent.name}
                          </span>
                          {(agent.ct || agent.load || agent.result) && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                              {agent.ct && agent.ct !== 'N/D' ? `${agent.ct} ` : ''}
                              {agent.load ? `· ${agent.load}` : ''}
                              {agent.result && !agent.load && !agent.ct ? agent.result : ''}
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            agent.isPositive || agent.isAltered
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-[#251b47] text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {agent.isPositive || agent.isAltered ? '🔴 Positivo / Alterado' : 'Negativo / Normal'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nota aclaratoria de interpretación diagnóstica según categoría */}
                <div className="p-3 bg-slate-50 dark:bg-[#1a1235] border border-slate-200/90 dark:border-[#2f2257] rounded-2xl text-[11px] text-slate-600 dark:text-slate-300 leading-snug flex items-start gap-2">
                  <span className={`text-xs mt-0.5 shrink-0 ${isClinicas ? 'text-teal-600 dark:text-teal-400' : isMicrobiota ? 'text-sky-600 dark:text-sky-400' : 'text-purple-600 dark:text-purple-400'}`}>💡</span>
                  <span>
                    {isClinicas ? (
                      <>
                        <strong className="text-slate-800 dark:text-white">Criterio de laboratorio clínico:</strong> Los resultados deben interpretarse en conjunto con la anamnesis, historia clínica, signos presentes y evolución del paciente. En caso de parámetros alterados, se sugiere correlacionar con pruebas complementarias de soporte y evaluación del frotis.
                      </>
                    ) : isMicrobiota ? (
                      <>
                        <strong className="text-slate-800 dark:text-white">Criterio de microbiota metagenómica:</strong> El perfil taxonómico y la abundancia relativa bacteriana reflejan el equilibrio del microbioma gastrointestinal. Se recomienda correlacionar con la dieta y tratamientos antimicrobianos recientes.
                      </>
                    ) : (
                      <>
                        <strong className="text-slate-800 dark:text-white">Criterio diagnóstico diferencial:</strong> Cuando el paciente haya sido evaluado mediante un proceso adecuado de razonamiento clínico y se hayan seleccionado las matrices biológicas pertinentes, se deben considerar otras alternativas diagnósticas diferentes a las enfermedades infecciosas hemotrópicas.
                      </>
                    )}
                  </span>
                </div>

                {/* Barra de Acciones del Examen (Control de Seguimiento para Positivos) */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#2f2257]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {positiveAgents.length > 0 ? (
                      <span className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>{positiveAgents.length} {isClinicas ? 'parámetro(s) fuera de rango.' : 'patógeno(s) detectado(s) con recomendación de control.'}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span>✓</span>
                        <span>{isClinicas ? 'Muestra con valores clínicos dentro de parámetros esperados.' : isMicrobiota ? 'Perfil metagenómico sin disbiosis evidente.' : 'Muestra sin amplificación de patógenos en el panel molecular.'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectPatient?.(item.patient)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#2f2257] hover:bg-slate-50 dark:hover:bg-[#1f163d] text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📄</span> Ver Ficha de {item.patient.name}
                    </button>

                    {positiveAgents.length > 0 && isQpcr && (
                      <button
                        type="button"
                        onClick={() => onNavigateToNewExam?.(item.patient, 'control')}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <span>🔄</span> Solicitar control qPCR (-15% dcto)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#150f28] rounded-3xl border border-slate-200/80 dark:border-[#2f2257] p-12 text-center shadow-2xs space-y-3">
          <span className="text-4xl block">📋</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No se encontraron resultados con ese criterio</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Prueba ajustando los filtros de búsqueda o solicitando un nuevo examen.</p>
        </div>
      )}
    </div>
  );
}
