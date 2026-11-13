import React, { useState, useMemo } from 'react';
import DeliveryTracker from './DeliveryTracker.jsx';

export default function OrdersTrackingView({
  patients = [],
  onNavigateToNewExam,
  onSelectPatient,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', '0', '1', '2', '3', '4'
  const [datePreset, setDatePreset] = useState('all'); // 'all', 'today', '7days', '30days', 'custom'
  const [dateFilter, setDateFilter] = useState(''); // 'YYYY-MM-DD'

  // Helper para parsear fechas de órdenes en diversos formatos
  const parseOrderDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const trimmed = dateStr.trim();
    if (trimmed.toLowerCase() === 'hoy' || trimmed.toLowerCase() === 'reciente') {
      return new Date();
    }
    // Formato ISO o YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? null : d;
    }
    // Formato DD/MM/YYYY o DD-MM-YYYY
    const parts = trimmed.split(/[/.-]/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return isNaN(d.getTime()) ? null : d;
      }
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  // Extraer todas las órdenes activas y procesadas de los pacientes
  const allOrders = useMemo(() => {
    const list = [];
    patients.forEach((patient) => {
      if (patient.activeExamOrder) {
        list.push({
          order: patient.activeExamOrder,
          patient,
          isRecent: true,
        });
      }
      if (patient.qpcrExams && Array.isArray(patient.qpcrExams)) {
        patient.qpcrExams.forEach((exam) => {
          // Si no es la misma orden activa
          if (!patient.activeExamOrder || patient.activeExamOrder.id !== exam.id) {
            list.push({
              order: {
                id: exam.id || exam.examCode || 'ORD-2026-HIST',
                testName: exam.testName || exam.name || 'Panel qPCR Diagnóstico',
                category: 'Biología Molecular Cuantitativa (qPCR)',
                sampleType: exam.sampleType || 'Hisopado / Muestra biológica',
                priority: 'Normal',
                requestedAt: exam.requestedAt || exam.date || 'Reciente',
                currentStep: 4, // Completado
                steps: [
                  { label: 'Solicitud creada', desc: 'Orden médica generada', date: exam.requestedAt || exam.date, completed: true },
                  { label: 'Muestra recibida', desc: 'Ingreso a laboratorio', date: 'Completado', completed: true },
                  { label: 'En análisis qPCR', desc: 'Extracción y amplificación', date: 'Completado', completed: true },
                  { label: 'Validación médica', desc: 'Revisión patológica', date: 'Completado', completed: true },
                  { label: 'Resultado enviado', desc: 'Informe emitido a clínica', date: exam.receivedAt || exam.date, completed: true },
                ],
                targets: exam.targets || 'Agentes específicos analizados',
              },
              patient,
              isRecent: false,
            });
          }
        });
      }

      // 3. Exámenes clínicos completados en historial
      if (patient.clinicalExams && Array.isArray(patient.clinicalExams)) {
        patient.clinicalExams.forEach((exam) => {
          if (!patient.activeExamOrder || patient.activeExamOrder.id !== exam.id) {
            const examId = exam.id || exam.examCode || 'CLN-2026-HIST';
            const alreadyInList = list.some((item) => item.order.id === examId);
            if (!alreadyInList) {
              list.push({
                order: {
                  id: examId,
                  testName: exam.testName || exam.name || 'Prueba Clínica de Laboratorio',
                  category: 'Portafolio Clínico de Laboratorio',
                  sampleType: exam.sampleType || 'Muestra biológica de laboratorio clínico',
                  priority: 'Normal',
                  requestedAt: exam.requestedAt || exam.date || 'Reciente',
                  currentStep: 4,
                  steps: [
                    { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: exam.requestedAt || exam.date, completed: true },
                    { label: 'Muestra recibida', desc: 'Ingreso al laboratorio clínico', date: 'Completado', completed: true },
                    { label: 'En análisis clínico', desc: 'Procesamiento en analizador', date: 'Completado', completed: true },
                    { label: 'Validación médica', desc: 'Validado por bacteriólogo', date: 'Completado', completed: true },
                    { label: 'Resultado enviado', desc: 'Informe emitido a clínica', date: exam.receivedAt || exam.date, completed: true },
                  ],
                  targets: exam.targets || 'Parámetros analíticos',
                },
                patient,
                isRecent: false,
              });
            }
          }
        });
      }

      // 4. Exámenes de microbiota completados en historial
      if (patient.microbiotaExams && Array.isArray(patient.microbiotaExams)) {
        patient.microbiotaExams.forEach((exam) => {
          if (!patient.activeExamOrder || patient.activeExamOrder.id !== exam.id) {
            const examId = exam.id || exam.examCode || 'MIC-2026-HIST';
            const alreadyInList = list.some((item) => item.order.id === examId);
            if (!alreadyInList) {
              list.push({
                order: {
                  id: examId,
                  testName: exam.testName || exam.name || 'Microbiota Gastrointestinal 16S',
                  category: 'Microbiota Gastrointestinal (16S rRNA NGS)',
                  sampleType: exam.sampleType || 'Muestra fecal en tubo estabilizador',
                  priority: 'Normal',
                  requestedAt: exam.requestedAt || exam.date || 'Reciente',
                  currentStep: 4,
                  steps: [
                    { label: 'Solicitud creada', desc: 'Orden médica generada en clínica', date: exam.requestedAt || exam.date, completed: true },
                    { label: 'Muestra recibida', desc: 'Ingreso al laboratorio', date: 'Completado', completed: true },
                    { label: 'En secuenciación NGS', desc: 'Extracción metagenómica y secuenciación', date: 'Completado', completed: true },
                    { label: 'Bioinformática médica', desc: 'Perfil taxonómico y cálculo índice de disbiosis', date: 'Completado', completed: true },
                    { label: 'Resultado enviado', desc: 'Informe emitido a clínica', date: exam.receivedAt || exam.date, completed: true },
                  ],
                  targets: exam.targets || 'Perfil taxonómico bacteriano',
                },
                patient,
                isRecent: false,
              });
            }
          }
        });
      }
    });
    return list;
  }, [patients]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter(({ order, patient }) => {
      // 1. Filtro por término de búsqueda
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const pName = `${patient.name} ${patient.lastName || ''}`.toLowerCase();
        const pId = (patient.id || '').toLowerCase();
        const oId = (order.id || '').toLowerCase();
        const oName = (order.testName || '').toLowerCase();
        const matchesTerm = pName.includes(term) || pId.includes(term) || oId.includes(term) || oName.includes(term);
        if (!matchesTerm) return false;
      }

      // 2. Filtro por estado de la muestra (Paso 0 a 4)
      if (statusFilter !== 'all') {
        const targetStep = parseInt(statusFilter, 10);
        const currentStep = typeof order.currentStep === 'number' ? order.currentStep : 4;
        if (currentStep !== targetStep) return false;
      }

      // 3. Filtro por fecha de la orden
      if (datePreset !== 'all' || dateFilter) {
        const orderDate = parseOrderDate(order.requestedAt || order.date || order.steps?.[0]?.date);
        if (orderDate) {
          const now = new Date();

          if (dateFilter) {
            // Fecha específica seleccionada
            const [fYear, fMonth, fDay] = dateFilter.split('-').map(Number);
            const isMatch =
              orderDate.getFullYear() === fYear &&
              orderDate.getMonth() + 1 === fMonth &&
              orderDate.getDate() === fDay;
            if (!isMatch) return false;
          } else if (datePreset === 'today') {
            const isSameDay =
              orderDate.getDate() === now.getDate() &&
              orderDate.getMonth() === now.getMonth() &&
              orderDate.getFullYear() === now.getFullYear();
            if (!isSameDay) return false;
          } else if (datePreset === '7days') {
            const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
            if (diffDays < -1 || diffDays > 7.5) return false;
          } else if (datePreset === '30days') {
            const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
            if (diffDays < -1 || diffDays > 30.5) return false;
          }
        }
      }

      return true;
    });
  }, [allOrders, searchTerm, statusFilter, datePreset, dateFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== 'all' || datePreset !== 'all' || dateFilter);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDatePreset('all');
    setDateFilter('');
  };

  const SAMPLE_STATUS_OPTIONS = [
    { value: 'all', label: 'Todos los estados', icon: '🌐' },
    { value: '0', label: 'Solicitud creada', icon: '📋' },
    { value: '1', label: 'Muestra recibida', icon: '📦' },
    { value: '2', label: 'En análisis qPCR', icon: '🧬' },
    { value: '3', label: 'Validación médica', icon: '🔬' },
    { value: '4', label: 'Resultado emitido', icon: '✅' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-[#6F2BCC]">
              MÓDULO DE TRAZABILIDAD
            </span>
            <span className="text-xs text-slate-400 font-medium">· Laboratorio en tiempo real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Seguimiento de Órdenes qPCR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoreo en vivo de logística, recolección de muestras y amplificación en termociclador.
          </p>
        </div>

        <button
          onClick={onNavigateToNewExam}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>✨</span> Solicitar nuevo examen
        </button>
      </div>

      {/* Panel Integral de Búsqueda y Filtros de Estado y Fecha */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* Fila 1: Búsqueda y Resumen */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-[#6F2BCC] focus-within:bg-white transition-all">
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código de orden (ORD-2026-...) o nombre de paciente..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium bg-transparent"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#6F2BCC] font-bold text-xs border border-purple-200">
              Mostrando {filteredOrders.length} de {allOrders.length} órdenes
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                ✕ Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Filtros por Estado de la Muestra y por Fecha */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Filtro por Estado de la Muestra */}
          <div className="lg:col-span-7 space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Filtrar por Estado de la Muestra:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_STATUS_OPTIONS.map((opt) => {
                const isActive = statusFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#2B017C] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro por Fecha */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Filtrar por Fecha de la Orden:
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              {/* Presets rápidos */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDatePreset('all');
                    setDateFilter('');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    datePreset === 'all' && !dateFilter ? 'bg-white text-[#2B017C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDatePreset('today');
                    setDateFilter('');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    datePreset === 'today' ? 'bg-white text-[#2B017C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDatePreset('7days');
                    setDateFilter('');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    datePreset === '7days' ? 'bg-white text-[#2B017C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 días
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDatePreset('30days');
                    setDateFilter('');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    datePreset === '30days' ? 'bg-white text-[#2B017C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  30 días
                </button>
              </div>

              {/* Selector de Fecha Específica */}
              <div className="relative flex-1 min-w-[140px]">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#6F2BCC] focus:bg-white outline-none cursor-pointer"
                  title="Seleccionar fecha específica"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de órdenes con DeliveryTracker */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-5">
          {filteredOrders.map(({ order, patient }, idx) => (
            <div
              key={`${order.id}-${idx}`}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 hover:border-sky-300 transition-colors"
            >
              {/* Encabezado de la tarjeta con datos del paciente */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                    {patient.avatar || (patient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {patient.name} {patient.lastName || ''}
                      </h3>
                      <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                        {patient.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {patient.species} · {patient.breed} · Tutor: {patient.owner?.name || 'No registrado'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPatient(patient)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer self-start sm:self-auto hover:bg-slate-50"
                >
                  Ver ficha completa →
                </button>
              </div>

              {/* Componente DeliveryTracker para esta orden */}
              <DeliveryTracker order={order} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 text-[#6F2BCC] flex items-center justify-center text-3xl mx-auto shadow-inner">
            🧪
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              {hasActiveFilters ? 'No se encontraron órdenes con los filtros seleccionados' : 'No hay órdenes de examen activas actualmente'}
            </h3>
            <p className="text-xs text-slate-500">
              {hasActiveFilters
                ? 'Prueba modificando la búsqueda, seleccionando otro estado de la muestra o ampliando el rango de fecha.'
                : 'Cuando solicites un examen qPCR, podrás rastrear la muestra y sus resultados en vivo aquí.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>🔄</span> Restablecer todos los filtros
            </button>
          ) : (
            <button
              onClick={onNavigateToNewExam}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>✨</span> Solicitar nuevo examen ahora
            </button>
          )}
        </div>
      )}
    </div>
  );
}
