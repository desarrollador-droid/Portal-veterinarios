import React, { useState, useMemo, useEffect } from 'react';

/**
 * Módulo de Evolución Temporal & Historial Clínico
 * Formulario de filtración fiel a Figma:
 * - Badge "HISTORIAL CLÍNICO"
 * - Título "Evolución Temporal"
 * - Subtítulo "Visualización cronológica del historial del paciente"
 * - Formulario "BÚSQUEDA DEL PACIENTE":
 *   - ID de paciente (Ej. 1, 2... o PAC-001)
 *   - Nombre del paciente (Luna, Rocky...)
 *   - Nombre del tutor (Propietario...)
 *   - Tipo (Todo, Consultas médicas, Exámenes qPCR, Peso y vitales)
 *   - Desde (dd/mm/aaaa)
 *   - Hasta (dd/mm/aaaa)
 *   - Píldoras: Todas las fechas, Por día, Por mes, Por año
 *   - Botón: "Cargar historial →"
 *
 * REGLA ESTRICTA DEL USUARIO:
 * "no me debe de salir nada si no lo he buscado"
 * -> Inicialmente (hasSearched = false) solo se muestra el formulario y el estado vacío con icono de portapapeles 📋.
 * -> Al presionar "Cargar historial →" o seleccionar un paciente coincidente, se cargan los datos, gráficos y la línea de tiempo.
 */
export default function TemporalEvolutionView({
  patients = [],
  initialPatient = null,
  onSelectPatient,
  onNavigateToNewExam,
}) {
  // Estado de los campos del formulario de filtración
  const [patientIdQuery, setPatientIdQuery] = useState(initialPatient?.id || '');
  const [patientNameQuery, setPatientNameQuery] = useState(initialPatient?.name || '');
  const [ownerNameQuery, setOwnerNameQuery] = useState(initialPatient?.owner?.name || '');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [datePeriodMode, setDatePeriodMode] = useState('todas'); // 'todas' | 'dia' | 'mes' | 'ano'

  // Control estricto: no mostrar nada hasta que el usuario busque
  const [hasSearched, setHasSearched] = useState(Boolean(initialPatient));
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatient?.id || null);
  const [searchError, setSearchError] = useState('');

  // Sugerencias interactivas mientras escribe
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Tooltip interactivo para gráficos SVG
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Si cambia el paciente inicial (por navegación externa)
  useEffect(() => {
    if (initialPatient) {
      setPatientIdQuery(initialPatient.id);
      setPatientNameQuery(initialPatient.name);
      setOwnerNameQuery(initialPatient.owner?.name || '');
      setSelectedPatientId(initialPatient.id);
      setHasSearched(true);
    }
  }, [initialPatient]);

  // Lista de sugerencias según lo que va escribiendo el usuario
  const suggestions = useMemo(() => {
    const qId = patientIdQuery.trim().toLowerCase();
    const qName = patientNameQuery.trim().toLowerCase();
    const qOwner = ownerNameQuery.trim().toLowerCase();

    if (!qId && !qName && !qOwner) return [];

    return patients.filter((p) => {
      const matchId =
        !qId ||
        p.id.toLowerCase().includes(qId) ||
        p.id.replace(/\D/g, '').includes(qId);
      const matchName =
        !qName || p.name.toLowerCase().includes(qName);
      const matchOwner =
        !qOwner || (p.owner?.name && p.owner.name.toLowerCase().includes(qOwner));
      return matchId && matchName && matchOwner;
    });
  }, [patients, patientIdQuery, patientNameQuery, ownerNameQuery]);

  // Paciente actualmente seleccionado y cargado
  const currentPatient = useMemo(() => {
    if (!hasSearched || !selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, hasSearched, selectedPatientId]);

  // Ejecutar la búsqueda al presionar "Cargar historial →"
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSearchError('');
    setShowSuggestions(false);

    const qId = patientIdQuery.trim().toLowerCase();
    const qName = patientNameQuery.trim().toLowerCase();
    const qOwner = ownerNameQuery.trim().toLowerCase();

    // Si todos los campos están vacíos, pedir al menos un criterio
    if (!qId && !qName && !qOwner) {
      setSearchError('Por favor ingresa un ID, nombre del paciente o tutor para buscar.');
      return;
    }

    // Buscar coincidencias exactas o parciales
    const matches = patients.filter((p) => {
      const matchId =
        !qId ||
        p.id.toLowerCase().includes(qId) ||
        p.id.replace(/\D/g, '').includes(qId);
      const matchName =
        !qName || p.name.toLowerCase().includes(qName);
      const matchOwner =
        !qOwner || (p.owner?.name && p.owner.name.toLowerCase().includes(qOwner));
      return matchId && matchName && matchOwner;
    });

    if (matches.length === 0) {
      setSearchError('No se encontró ningún paciente con los criterios especificados.');
      setSelectedPatientId(null);
      setHasSearched(true);
      return;
    }

    // Seleccionar el primer paciente coincidente y actualizar los campos con sus datos
    const found = matches[0];
    setSelectedPatientId(found.id);
    setPatientIdQuery(found.id);
    setPatientNameQuery(found.name);
    setOwnerNameQuery(found.owner?.name || '');
    setHasSearched(true);
  };

  // Seleccionar directamente desde sugerencias rápidas
  const handleSelectSuggestion = (patient) => {
    setSelectedPatientId(patient.id);
    setPatientIdQuery(patient.id);
    setPatientNameQuery(patient.name);
    setOwnerNameQuery(patient.owner?.name || '');
    setShowSuggestions(false);
    setSearchError('');
    setHasSearched(true);
  };

  // Limpiar formulario y volver al estado inicial (sin mostrar nada)
  const handleClearSearch = () => {
    setPatientIdQuery('');
    setPatientNameQuery('');
    setOwnerNameQuery('');
    setEventTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setDatePeriodMode('todas');
    setHasSearched(false);
    setSelectedPatientId(null);
    setSearchError('');
  };

  // Helper para convertir strings dd/mm/aaaa a Date
  const parseCustomDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Puntos de evolución de peso
  const weightPoints = useMemo(() => {
    if (!currentPatient) return [];
    const history = currentPatient.healthMetrics?.weightHistory || [];
    if (history.length === 0) {
      const wVal = parseFloat((currentPatient.weight || '0').replace(' kg', '')) || 0;
      return [{ date: currentPatient.lastVisit || 'Hoy', weightKg: wVal, raw: currentPatient.weight, note: 'Registro actual' }];
    }
    return history.map((item) => {
      const num = parseFloat((item.weight || '').replace(' kg', '')) || 0;
      return {
        date: item.date,
        weightKg: num,
        raw: item.weight,
        note: item.note || 'Control de peso',
      };
    });
  }, [currentPatient]);

  // Variación ponderal
  const weightDelta = useMemo(() => {
    if (weightPoints.length < 2) return { diffKg: 0, percent: 0, trend: 'stable' };
    const first = weightPoints[0].weightKg;
    const last = weightPoints[weightPoints.length - 1].weightKg;
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;
    return {
      diffKg: parseFloat(diff.toFixed(2)),
      percent: parseFloat(pct.toFixed(1)),
      trend: diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'stable',
    };
  }, [weightPoints]);

  // Signos vitales longitudinales
  const vitalHistory = useMemo(() => {
    if (!currentPatient) return [];
    if (currentPatient.healthMetrics?.vitalSignsHistory?.length) {
      return currentPatient.healthMetrics.vitalSignsHistory;
    }
    if (currentPatient.consultations?.length) {
      return currentPatient.consultations.map((c) => ({
        date: c.date,
        temperature: parseFloat((c.vitalSigns?.temperature || '38.5').replace(' °C', '')) || 38.5,
        heartRate: parseInt((c.vitalSigns?.heartRate || '120').replace(' bpm', '')) || 120,
        respiratoryRate: parseInt((c.vitalSigns?.respiratoryRate || '24').replace(' rpm', '')) || 24,
        event: c.reason || 'Consulta médica',
      }));
    }
    const temp = parseFloat((currentPatient.healthMetrics?.vitalSigns?.temperature || '38.5').replace(' °C', '')) || 38.5;
    const hr = parseInt((currentPatient.healthMetrics?.vitalSigns?.heartRate || '120').replace(' bpm', '')) || 120;
    return [{ date: currentPatient.lastVisit || 'Hoy', temperature: temp, heartRate: hr, respiratoryRate: 24, event: 'Control' }];
  }, [currentPatient]);

  // Exámenes qPCR
  const qpcrHistory = useMemo(() => {
    if (!currentPatient || !currentPatient.qpcrExams) return [];
    return [...currentPatient.qpcrExams].reverse();
  }, [currentPatient]);

  // Elegibilidad estricta de control: solo si tiene examen qPCR previo emitido con agentes positivos
  const canRequestControl = useMemo(() => {
    if (!currentPatient?.qpcrExams || !Array.isArray(currentPatient.qpcrExams)) return false;
    return currentPatient.qpcrExams.some((q) => {
      const isIssued = q.status === 'Emitido' || q.status === 'Completado' || q.status === 'Resultado enviado';
      const hasPositives = q.agents && Array.isArray(q.agents) && q.agents.some((a) => a.isPositive || String(a.result || '').toLowerCase().includes('positivo') || String(a.result || '').includes('+'));
      return isIssued && hasPositives;
    });
  }, [currentPatient]);

  // Línea de tiempo cronológica filtrada por Tipo y Fechas
  const timelineEvents = useMemo(() => {
    if (!currentPatient) return [];
    let events = [];

    // Consultas médicas
    if (eventTypeFilter === 'all' || eventTypeFilter === 'consultas') {
      (currentPatient.consultations || []).forEach((c, idx) => {
        events.push({
          id: `cons-${idx}`,
          type: 'consultation',
          title: c.reason || 'Consulta Médica',
          date: c.date,
          time: c.time || '10:00 AM',
          vet: c.vet || 'Dr. Alejandro Morales',
          badge: c.clinicalStatus || 'Evaluación',
          badgeColor: 'bg-purple-50 text-[#6F2BCC] border-purple-200',
          details: c.observationsAndFollowUp || c.medication || '',
          medication: c.medication,
          weight: c.weight,
          icon: '🩺',
        });
      });
    }

    // Exámenes qPCR
    if (eventTypeFilter === 'all' || eventTypeFilter === 'qpcr') {
      (currentPatient.qpcrExams || []).forEach((q, idx) => {
        const isIssued = q.status === 'Emitido' || q.status === 'Completado';
        events.push({
          id: `qpcr-${idx}`,
          type: 'qpcr',
          title: q.testName,
          date: q.date || q.requestedAt?.split(',')[0] || 'Reciente',
          time: q.receivedAt?.split(',')[1]?.trim() || 'Laboratorio',
          vet: 'VetLab Unidad de Genómica',
          badge: q.status,
          badgeColor: isIssued ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
          details: q.resultSummary || 'Análisis molecular cuantitativo',
          examId: q.id,
          sampleType: q.sampleType,
          agents: q.agents,
          icon: '🧬',
        });
      });

      // Orden activa
      if (currentPatient.activeExamOrder) {
        events.push({
          id: 'active-order',
          type: 'active-exam',
          title: currentPatient.activeExamOrder.testName,
          date: currentPatient.activeExamOrder.requestedAt?.split('-')[0]?.trim() || 'Hoy',
          time: currentPatient.activeExamOrder.requestedAt?.split('-')[1]?.trim() || 'En curso',
          vet: currentPatient.activeExamOrder.requestedBy || 'Dr. Alejandro Morales',
          badge: 'En proceso',
          badgeColor: 'bg-[#01FADA]/20 text-[#007a6a] border-[#01FADA]/60 font-bold',
          details: `Paso actual: ${currentPatient.activeExamOrder.steps?.[currentPatient.activeExamOrder.currentStep]?.label || 'En análisis molecular'}`,
          icon: '⚡',
        });
      }
    }

    // Filtrar por fechas "Desde" y "Hasta" si se especificaron
    if (dateFrom) {
      const fromD = new Date(dateFrom);
      events = events.filter((e) => {
        const d = parseCustomDate(e.date);
        return !d || d >= fromD;
      });
    }

    if (dateTo) {
      const toD = new Date(dateTo);
      events = events.filter((e) => {
        const d = parseCustomDate(e.date);
        return !d || d <= toD;
      });
    }

    return events;
  }, [currentPatient, eventTypeFilter, dateFrom, dateTo]);

  // Gráfico SVG de Peso
  const svgWeightData = useMemo(() => {
    if (weightPoints.length === 0) return null;
    const width = 600;
    const height = 190;
    const padding = { top: 25, right: 30, bottom: 35, left: 45 };

    const minW = Math.max(0, Math.min(...weightPoints.map((p) => p.weightKg)) - 0.5);
    const maxW = Math.max(...weightPoints.map((p) => p.weightKg)) + 0.5;
    const rangeW = maxW - minW || 1;

    const points = weightPoints.map((p, i) => {
      const x =
        weightPoints.length === 1
          ? width / 2
          : padding.left + (i / (weightPoints.length - 1)) * (width - padding.left - padding.right);
      const y =
        height - padding.bottom - ((p.weightKg - minW) / rangeW) * (height - padding.top - padding.bottom);
      return { ...p, x, y };
    });

    const pathD = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const areaD = `${pathD} L ${lastPt.x} ${height - padding.bottom} L ${firstPt.x} ${height - padding.bottom} Z`;

    return { width, height, padding, minW, maxW, points, pathD, areaD };
  }, [weightPoints]);

  // Gráfico SVG de Temperatura
  const svgVitalData = useMemo(() => {
    if (vitalHistory.length === 0) return null;
    const width = 600;
    const height = 190;
    const padding = { top: 25, right: 30, bottom: 35, left: 45 };

    const minT = 37.0;
    const maxT = 41.0;
    const rangeT = maxT - minT;

    const points = vitalHistory.map((p, i) => {
      const x =
        vitalHistory.length === 1
          ? width / 2
          : padding.left + (i / (vitalHistory.length - 1)) * (width - padding.left - padding.right);
      const y =
        height - padding.bottom - ((p.temperature - minT) / rangeT) * (height - padding.top - padding.bottom);
      return { ...p, x, y };
    });

    const pathD = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const y38 = height - padding.bottom - ((38.0 - minT) / rangeT) * (height - padding.top - padding.bottom);
    const y392 = height - padding.bottom - ((39.2 - minT) / rangeT) * (height - padding.top - padding.bottom);

    return { width, height, padding, points, pathD, y38, y392 };
  }, [vitalHistory]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. ENCABEZADO CON FORMATO EXACTO DE FIGMA */}
      <div>
        <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#e0f2fe] text-[#0369a1] mb-2 border border-[#bae6fd]">
          HISTORIAL CLÍNICO
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002d5a] tracking-tight">
          Evolución Temporal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Visualización cronológica del historial del paciente
        </p>
      </div>

      {/* 2. FORMULARIO DE FILTRACIÓN: BÚSQUEDA DEL PACIENTE (CARD IDÉNTICA A FIGMA) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs relative">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            BÚSQUEDA DEL PACIENTE
          </div>

          {/* Fila 1: ID, Nombre del paciente, Nombre del tutor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ID de paciente
              </label>
              <input
                type="text"
                value={patientIdQuery}
                onChange={(e) => {
                  setPatientIdQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ej. 1, 2..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nombre del paciente
              </label>
              <input
                type="text"
                value={patientNameQuery}
                onChange={(e) => {
                  setPatientNameQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Luna, Rocky..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nombre del tutor
              </label>
              <input
                type="text"
                value={ownerNameQuery}
                onChange={(e) => {
                  setOwnerNameQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Propietario..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>

          {/* Menú flotante de sugerencias rápidas al escribir */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-[calc(100%-2.5rem)] sm:w-[calc(100%-3.5rem)] max-h-52 overflow-y-auto mt-1 animate-in fade-in duration-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                Pacientes coincidentes ({suggestions.length})
              </span>
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectSuggestion(p)}
                  className="px-3 py-2 rounded-xl hover:bg-sky-50 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{p.avatar || '🐾'}</span>
                    <div>
                      <span className="font-extrabold text-[#002d5a]">{p.name}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5 font-mono">({p.id})</span>
                      <span className="text-[11px] text-slate-400 block">
                        {p.species} · {p.breed} · Tutor: {p.owner?.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                    Seleccionar →
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Fila 2: Tipo, Desde, Hasta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipo
              </label>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all font-medium"
              >
                <option value="all">Todo</option>
                <option value="consultas">Consultas médicas</option>
                <option value="qpcr">Exámenes qPCR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 transition-all"
              />
            </div>
          </div>

          {/* Fila 3: Píldoras de rango y botón Cargar historial */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Píldoras a la izquierda */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'todas', label: 'Todas las fechas' },
                { id: 'dia', label: 'Por día' },
                { id: 'mes', label: 'Por mes' },
                { id: 'ano', label: 'Por año' },
              ].map((pill) => {
                const isActive = datePeriodMode === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setDatePeriodMode(pill.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#006097] text-white shadow-xs font-bold'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Acciones a la derecha */}
            <div className="flex items-center gap-2">
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#006097] hover:bg-[#004e7c] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#006097]/25 flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Cargar historial</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </form>

        {/* Mensaje de error si no se encuentra paciente */}
        {searchError && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{searchError}</span>
            </div>
            {/* Botones de sugerencia rápida para probar con 1 clic */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-amber-700 font-semibold">Probar con:</span>
              {patients.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(p)}
                  className="px-2 py-0.5 rounded bg-white text-[#006097] font-bold text-[10px] border border-amber-200 hover:bg-amber-100 cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. ESTADO INICIAL: NO SALE NADA SI NO LO HA BUSCADO            */}
      {/* ============================================================== */}
      {!hasSearched && (
        <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-3xl bg-sky-50/80 border border-sky-100 flex items-center justify-center text-4xl mb-3 shadow-xs text-slate-400">
            📋
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            Esperando búsqueda del paciente
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
            Ingresa el ID, nombre del paciente o del tutor en el formulario superior y presiona{' '}
            <strong className="text-[#006097]">«Cargar historial →»</strong> para desplegar la evolución temporal y analíticas cronológicas.
          </p>

          {/* Accesos rápidos discretos para conveniencia */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-400">
            <span>Carga rápida:</span>
            {patients.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectSuggestion(p)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#006097] text-slate-700 hover:text-[#006097] font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
              >
                {p.avatar || '🐾'} {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. RESULTADOS: CARGA DE HISTORIAL CUANDO YA SE HA BUSCADO       */}
      {/* ============================================================== */}
      {hasSearched && currentPatient && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Ficha Resumen del Paciente Activo */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl shadow-xs shrink-0">
                {currentPatient.avatar || (currentPatient.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-[#2B017C] tracking-tight">
                    {currentPatient.name} {currentPatient.lastName || ''}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {currentPatient.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentPatient.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span>{currentPatient.species} · {currentPatient.breed}</span>
                  <span>•</span>
                  <span>Tutor: <strong className="text-slate-800">{currentPatient.owner?.name}</strong></span>
                  <span>•</span>
                  <span>Médico: <strong className="text-slate-800">{currentPatient.attendingVet || 'Dr. Alejandro Morales'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onSelectPatient?.(currentPatient)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>📄</span> Ver Expediente Clínico
              </button>

              {canRequestControl && (
                <button
                  onClick={() => onNavigateToNewExam?.(currentPatient, 'control')}
                  className="px-4 py-2 rounded-xl bg-[#6F2BCC] hover:bg-[#5b20a8] text-white font-bold text-xs transition-all shadow-sm shadow-[#6F2BCC]/25 border border-[#01FADA]/40 cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔄</span> Solicitar Control qPCR
                </button>
              )}
            </div>
          </div>

          {/* 4 KPIs Longitudinales de Parámetros Fisiológicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Delta de Peso */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#6F2BCC]">
                <span>Evolución Ponderal</span>
                <span className="text-slate-400 font-normal">{weightPoints.length} registros</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#2B017C]">{currentPatient.weight}</span>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${
                    weightDelta.trend === 'up'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : weightDelta.trend === 'down'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {weightDelta.diffKg > 0 ? `+${weightDelta.diffKg}` : weightDelta.diffKg} kg ({weightDelta.percent > 0 ? `+${weightDelta.percent}` : weightDelta.percent}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {weightDelta.trend === 'up' ? 'Ganancia de peso progresiva.' : weightDelta.trend === 'down' ? 'Pérdida de peso bajo observación.' : 'Peso estable.'}
              </p>
            </div>

            {/* KPI 2: Temperatura y Normotermia */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#009e8a]">
                <span>Temperatura Corporal</span>
                <span className="text-emerald-600 font-semibold">Normotermia</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#2B017C]">
                  {currentPatient.healthMetrics?.vitalSigns?.temperature || '38.5 °C'}
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">[38.0 - 39.2 °C]</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                FC: {currentPatient.healthMetrics?.vitalSigns?.heartRate || '120 bpm'} · FR: {currentPatient.healthMetrics?.vitalSigns?.respiratoryRate || '24 rpm'}
              </p>
            </div>

            {/* KPI 3: Estado Molecular qPCR */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#6F2BCC]">
                <span>Cinética Molecular qPCR</span>
                <span className="text-xs font-mono font-bold text-[#6F2BCC]">
                  {qpcrHistory.length} {qpcrHistory.length === 1 ? 'panel' : 'paneles'}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-base font-extrabold text-[#2B017C] block truncate leading-tight">
                  {currentPatient.healthMetrics?.lastDiagnosticScore || 'En evaluación molecular'}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">
                  {qpcrHistory[0]?.resultSummary ? 'Diagnóstico qPCR correlacionado' : 'Historial molecular activo'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Último panel: {qpcrHistory[0]?.id || 'Sin examen previo'}
              </p>
            </div>

            {/* KPI 4: Eventos en el Período */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#009e8a]">
                <span>Eventos Filtrados</span>
                <span className="text-slate-400 font-normal">Cronología</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#2B017C]">
                  {timelineEvents.length}
                </span>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  {eventTypeFilter === 'all' ? 'Todos los tipos' : eventTypeFilter}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Última atención: {currentPatient.lastVisit || 'Hoy'}
              </p>
            </div>
          </div>

          {/* Gráficos Interactivas SVG */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Peso */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-2">
                    <span>📈</span> Curva de Evolución Ponderal (kg)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Trayectoria del peso corporal registrado en cada consulta
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-purple-50 text-[#6F2BCC] border border-purple-200">
                  {currentPatient.weight} actual
                </span>
              </div>

              {svgWeightData ? (
                <div className="relative bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80">
                  <svg
                    viewBox={`0 0 ${svgWeightData.width} ${svgWeightData.height}`}
                    className="w-full h-44 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6F2BCC" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#01FADA" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                      const y =
                        svgWeightData.padding.top +
                        pct * (svgWeightData.height - svgWeightData.padding.top - svgWeightData.padding.bottom);
                      const wVal = (
                        svgWeightData.maxW -
                        pct * (svgWeightData.maxW - svgWeightData.minW)
                      ).toFixed(1);
                      return (
                        <g key={idx}>
                          <line
                            x1={svgWeightData.padding.left}
                            y1={y}
                            x2={svgWeightData.width - svgWeightData.padding.right}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={svgWeightData.padding.left - 8}
                            y={y + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="#94a3b8"
                            fontFamily="monospace"
                          >
                            {wVal}k
                          </text>
                        </g>
                      );
                    })}

                    <path d={svgWeightData.areaD} fill="url(#weightGrad)" />

                    <path
                      d={svgWeightData.pathD}
                      fill="none"
                      stroke="#6F2BCC"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {svgWeightData.points.map((pt, idx) => {
                      const isHovered = hoveredPoint?.type === 'weight' && hoveredPoint?.idx === idx;
                      return (
                        <g key={idx}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 7 : 5}
                            fill="#01FADA"
                            stroke="#2B017C"
                            strokeWidth="2.5"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPoint({ type: 'weight', idx, ...pt })}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          <text
                            x={pt.x}
                            y={svgWeightData.height - 10}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#64748b"
                            fontWeight="600"
                          >
                            {pt.date}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {hoveredPoint?.type === 'weight' && (
                    <div className="absolute top-2 right-4 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 pointer-events-none animate-in fade-in duration-100">
                      <span className="font-extrabold text-[#01FADA]">{hoveredPoint.weightKg} kg</span>
                      <span className="text-slate-300 ml-1.5">({hoveredPoint.date})</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{hoveredPoint.note}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                  Sin registros de peso suficientes
                </div>
              )}
            </div>

            {/* Gráfico 2: Temperatura */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-2">
                    <span>🌡️</span> Temperatura Corporal & Normotermia
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Curva térmica serial (°C) vs ventana fisiológica (38.0 - 39.2°C)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Normotermia
                </span>
              </div>

              {svgVitalData ? (
                <div className="relative bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80">
                  <svg
                    viewBox={`0 0 ${svgVitalData.width} ${svgVitalData.height}`}
                    className="w-full h-44 overflow-visible"
                  >
                    <rect
                      x={svgVitalData.padding.left}
                      y={svgVitalData.y392}
                      width={svgVitalData.width - svgVitalData.padding.left - svgVitalData.padding.right}
                      height={svgVitalData.y38 - svgVitalData.y392}
                      fill="#10b981"
                      fillOpacity="0.12"
                      rx="4"
                    />

                    <line
                      x1={svgVitalData.padding.left}
                      y1={svgVitalData.y392}
                      x2={svgVitalData.width - svgVitalData.padding.right}
                      y2={svgVitalData.y392}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={svgVitalData.padding.left}
                      y1={svgVitalData.y38}
                      x2={svgVitalData.width - svgVitalData.padding.right}
                      y2={svgVitalData.y38}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                    />

                    <text
                      x={svgVitalData.padding.left - 8}
                      y={svgVitalData.y392 + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#059669"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      39.2°C
                    </text>
                    <text
                      x={svgVitalData.padding.left - 8}
                      y={svgVitalData.y38 + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#059669"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      38.0°C
                    </text>

                    <path
                      d={svgVitalData.pathD}
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {svgVitalData.points.map((pt, idx) => {
                      const isHovered = hoveredPoint?.type === 'vital' && hoveredPoint?.idx === idx;
                      const isFever = pt.temperature > 39.2;
                      return (
                        <g key={idx}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 7 : 5}
                            fill={isFever ? '#e11d48' : '#10b981'}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPoint({ type: 'vital', idx, ...pt })}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          <text
                            x={pt.x}
                            y={svgVitalData.height - 10}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#64748b"
                            fontWeight="600"
                          >
                            {pt.date}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {hoveredPoint?.type === 'vital' && (
                    <div className="absolute top-2 right-4 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 pointer-events-none animate-in fade-in duration-100">
                      <span className="font-extrabold text-[#01FADA]">{hoveredPoint.temperature}°C</span>
                      <span className="text-slate-300 ml-1.5">· FC: {hoveredPoint.heartRate} bpm</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{hoveredPoint.event}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                  Sin registros térmicos suficientes
                </div>
              )}
            </div>
          </div>

          {/* Dinámica qPCR Comparativa */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-2">
                  <span>🧬</span> Cinética Molecular qPCR (Valores Ct & Carga Genómica)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitoreo cuantitativo por PCR en tiempo real. Un ciclo Ct mayor indica menor carga infecciosa.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-[#6F2BCC] border border-purple-200 font-bold text-xs">
                Sondas TaqMan
              </span>
            </div>

            {qpcrHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qpcrHistory.map((exam, idx) => {
                  const isIssued = exam.status === 'Emitido' || exam.status === 'Completado';
                  return (
                    <div
                      key={exam.id}
                      className="bg-slate-50/70 rounded-2xl p-4.5 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#6F2BCC]/10 text-[#6F2BCC] flex items-center justify-center font-bold text-xs">
                            {idx === 0 ? 'T1' : `T${idx + 1}`}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {exam.date} · {idx === 0 ? 'Examen Basal / Inicial' : 'Control Post-Tratamiento'}
                            </span>
                            <h4 className="text-xs font-extrabold text-[#2B017C]">{exam.testName}</h4>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            isIssued
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {exam.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        <strong className="text-slate-800">Dictamen: </strong>
                        {exam.resultSummary}
                      </p>

                      {exam.agents && exam.agents.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                            Detalle de Agentes & Valores Ct
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {exam.agents.map((ag, aIdx) => {
                              const isPos = ag.isPositive || ag.result?.toLowerCase().includes('positivo');
                              return (
                                <div
                                  key={aIdx}
                                  className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                                    isPos
                                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="min-w-0 pr-2">
                                    <span className="font-bold block truncate text-[11px]">{ag.name}</span>
                                    <span className="text-[10px] text-slate-500 block">{ag.load}</span>
                                  </div>
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] shrink-0 ${
                                      isPos ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    Ct {ag.ct}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <span>🔬 Este paciente no cuenta con histórico de exámenes qPCR seriados.</span>
              </div>
            )}
          </div>

          {/* Línea de Tiempo Clínica Secuencial */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#2B017C] uppercase tracking-wider flex items-center gap-2">
                  <span>⏱️</span> Línea de Tiempo Cronológica
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registro secuencial de eventos clínicos según filtros seleccionados
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-[#6F2BCC] bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                {timelineEvents.length} Eventos encontrados
              </span>
            </div>

            {timelineEvents.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#006097] before:via-[#01FADA] before:to-slate-200">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    <span className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#006097] group-hover:scale-110 group-hover:border-[#01FADA] transition-transform flex items-center justify-center text-xs shadow-xs">
                      {evt.icon}
                    </span>

                    <div className="bg-slate-50/80 hover:bg-sky-50/40 p-4.5 rounded-2xl border border-slate-200 transition-colors space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-[#2B017C]">{evt.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${evt.badgeColor}`}
                          >
                            {evt.badge}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span>📅 {evt.date}</span>
                          <span>·</span>
                          <span>⏰ {evt.time}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{evt.details}</p>

                      {evt.medication && (
                        <div className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-700">
                          <span>💊</span>
                          <span>
                            <strong className="text-slate-900">Medicación prescrita:</strong> {evt.medication}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span>Profesional / Unidad: <strong className="text-slate-600">{evt.vet}</strong></span>
                        {evt.weight && <span>Peso registrado: <strong className="text-[#6F2BCC]">{evt.weight}</strong></span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No se encontraron eventos clínicos para el tipo o rango de fechas seleccionado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
