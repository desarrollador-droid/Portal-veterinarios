import React, { useState, useMemo } from 'react';
import { downloadClinicalHistoryDocument } from '../utils/clinicalHistoryDocument.js';

export default function ResultadosView({
  patients = [],
  onSelectPatient,
  onNavigateToNewExam,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('all'); // 'all' | 'positive' | 'negative'

  // Consolidar todos los exámenes qPCR con resultados en pacientes
  const allResults = useMemo(() => {
    const list = [];
    patients.forEach((patient) => {
      // 1. Exámenes en historial qpcrExams
      if (patient.qpcrExams && Array.isArray(patient.qpcrExams)) {
        patient.qpcrExams.forEach((exam) => {
          list.push({
            id: exam.id || exam.examCode || 'ORD-2026-HIST',
            testName: exam.testName || exam.name || 'Panel qPCR Molecular',
            patient,
            requestedAt: exam.requestedAt || exam.date || '05/09/2026 - 09:30 AM',
            receivedAt: exam.receivedAt || exam.date || '06/09/2026 - 04:15 PM',
            agents: exam.agents || [],
            sampleType: exam.sampleType || 'Sangre total con EDTA (2 ml)',
            doctor: exam.doctor || 'Dr. Alejandro Morales',
          });
        });
      }
      // 2. Orden activa si ya fue emitida o enviada
      if (patient.activeExamOrder && (patient.activeExamOrder.currentStep >= 3 || patient.sampleStatus === 'Resultado enviado')) {
        const order = patient.activeExamOrder;
        // Si no está ya duplicada
        if (!list.some((item) => item.id === order.id)) {
          list.push({
            id: order.id,
            testName: order.testName,
            patient,
            requestedAt: order.requestedAt || 'Reciente',
            receivedAt: 'Hoy - 05:00 PM',
            agents: [
              { name: 'Mycoplasma haemocanis', isPositive: true, ct: '22.4', load: '1.2e5 copias/µL' },
              { name: 'Babesia canis', isPositive: false, ct: 'N/D', load: 'No detectado' },
              { name: 'Ehrlichia canis', isPositive: false, ct: 'N/D', load: 'No detectado' },
              { name: 'Anaplasma platys', isPositive: false, ct: 'N/D', load: 'No detectado' },
            ],
            sampleType: order.sampleType,
            doctor: order.requestedBy || 'Dr. Alejandro Morales',
          });
        }
      }
    });
    return list;
  }, [patients]);

  const filteredResults = useMemo(() => {
    return allResults.filter((item) => {
      const pName = `${item.patient.name} ${item.patient.lastName || ''}`.toLowerCase();
      const code = item.id.toLowerCase();
      const tName = item.testName.toLowerCase();
      const matchesSearch = !searchTerm.trim() || pName.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase()) || tName.includes(searchTerm.toLowerCase());

      const hasPositives = item.agents.some((a) => a.isPositive);
      if (filterResult === 'positive') return matchesSearch && hasPositives;
      if (filterResult === 'negative') return matchesSearch && !hasPositives;
      return matchesSearch;
    });
  }, [allResults, searchTerm, filterResult]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Encabezado del Módulo de Resultados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800">
              MÓDULO DE RESULTADOS
            </span>
            <span className="text-xs text-slate-400 font-medium">· Validación y Diagnóstico Molecular</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resultados Diagnósticos qPCR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consulta de patógenos detectados, amplificación molecular y emisión de informes clínicos.
          </p>
        </div>

        <button
          onClick={() => onNavigateToNewExam?.(null, 'nuevo')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>✨</span> Solicitar nuevo examen
        </button>
      </div>

      {/* Nota aclaratoria médica obligatoria sobre razonamiento clínico y diagnósticos diferenciales */}
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

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-96">
          <span className="text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de orden, nombre del paciente o perfil qPCR..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">Filtrar:</span>
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterResult('all')}
              className={`px-3 py-1 rounded-lg transition-all ${filterResult === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Todos ({allResults.length})
            </button>
            <button
              onClick={() => setFilterResult('positive')}
              className={`px-3 py-1 rounded-lg transition-all ${filterResult === 'positive' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Con Positivos
            </button>
            <button
              onClick={() => setFilterResult('negative')}
              className={`px-3 py-1 rounded-lg transition-all ${filterResult === 'negative' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Negativos
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Tarjetas de Resultados */}
      {filteredResults.length > 0 ? (
        <div className="space-y-5">
          {filteredResults.map((item) => {
            const positiveAgents = item.agents.filter((a) => a.isPositive);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Cabecera del Examen con Alta Trazabilidad del Paciente */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar de la Mascota con Distintivo Molecular */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-2xs">
                        {item.patient.avatar || (item.patient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#6F2BCC] text-white rounded-full flex items-center justify-center text-[10px] shadow-xs">
                        🧬
                      </span>
                    </div>

                    <div>
                      {/* Píldoras de Trazabilidad: Código + Nombre del Paciente */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                          <span>📋</span>
                          <span>Código: {item.id}</span>
                        </span>

                        <span className="text-xs font-black bg-purple-100 text-[#2B017C] px-3 py-0.5 rounded-full border border-purple-300/80 flex items-center gap-1.5 shadow-2xs">
                          <span>🐾</span>
                          <span>Paciente: <strong className="underline decoration-purple-400">{item.patient.name} {item.patient.lastName || ''}</strong></span>
                        </span>

                        {positiveAgents.length > 0 ? (
                          <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            {positiveAgents.length} Patógeno(s) Positivo(s)
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            ✓ Todo Negativo
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {item.testName}
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Mascota: <strong className="text-slate-800 font-bold">{item.patient.name} {item.patient.lastName || ''}</strong> ({item.patient.species} · {item.patient.breed}{item.patient.age ? ` · ${item.patient.age}` : ''})</span>
                        <span>·</span>
                        <span>Tutor: <strong className="text-slate-700">{item.patient.owner?.name || `${item.patient.owner?.firstName || ''} ${item.patient.owner?.lastName || ''}`.trim() || 'No registrado'}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onSelectPatient(item.patient)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 hover:text-[#6F2BCC] font-bold text-xs cursor-pointer transition-all flex items-center gap-1"
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Paciente Asignado
                    </span>
                    <span className="font-extrabold text-[#2B017C] truncate block text-xs">
                      🐾 {item.patient.name} {item.patient.lastName || ''}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {item.patient.id || 'PAC'} · {item.patient.species}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Solicitud Enviada
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.requestedAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Resultado Recibido
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.receivedAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Muestra Procesada
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {item.sampleType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Responsable Médico
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {item.doctor}
                    </span>
                  </div>
                </div>

                {/* Rejilla de Agentes: Positivos Resaltados y Negativos */}
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                    Diana Molecular / Agentes Analizados en el Panel
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.agents.map((agent, aIdx) => (
                      <div
                        key={aIdx}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          agent.isPositive
                            ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-200'
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <div>
                          <span
                            className={`block italic text-xs ${
                              agent.isPositive ? 'font-black text-rose-950 underline decoration-rose-300' : 'font-medium text-slate-700'
                            }`}
                          >
                            {agent.name}
                          </span>
                          {(agent.ct || agent.load) && (
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {agent.ct && agent.ct !== 'N/D' ? `Ct: ${agent.ct} ` : ''}
                              {agent.load ? `· ${agent.load}` : ''}
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            agent.isPositive
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {agent.isPositive ? '🔴 Positivo' : 'Negativo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nota aclaratoria de interpretación diagnóstica */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-[11px] text-slate-600 leading-snug flex items-start gap-2">
                  <span className="text-xs text-sky-600 mt-0.5 shrink-0">💡</span>
                  <span>
                    <strong className="text-slate-800">Criterio diagnóstico diferencial:</strong> Cuando el paciente haya sido evaluado mediante un proceso adecuado de razonamiento clínico y se hayan seleccionado las matrices biológicas pertinentes, se deben considerar otras alternativas diagnósticas diferentes a las enfermedades infecciosas hemotrópicas.
                  </span>
                </div>

                {/* Barra de Acciones del Examen (Control de Seguimiento para Positivos) */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {item.positiveCount > 0 ? (
                      <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>{item.positiveCount} patógenos detectados con recomendación de control molecular.</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <span>✓</span>
                        <span>Muestra sin amplificación de patógenos en el panel molecular.</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectPatient?.(item.patient)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📄</span> Ver Ficha de {item.patient.name}
                    </button>

                    {item.positiveCount > 0 && (
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-3">
          <span className="text-4xl block">📋</span>
          <h3 className="text-base font-bold text-slate-800">No se encontraron resultados con ese criterio</h3>
          <p className="text-xs text-slate-500">Prueba ajustando los filtros de búsqueda o solicitando un nuevo examen.</p>
        </div>
      )}
    </div>
  );
}
