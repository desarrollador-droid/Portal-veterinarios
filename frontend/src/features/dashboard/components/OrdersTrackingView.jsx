import React, { useState, useMemo } from 'react';
import DeliveryTracker from './DeliveryTracker.jsx';

export default function OrdersTrackingView({
  patients = [],
  onNavigateToNewExam,
  onSelectPatient,
}) {
  const [searchTerm, setSearchTerm] = useState('');

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
    });
    return list;
  }, [patients]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return allOrders;
    const term = searchTerm.toLowerCase();
    return allOrders.filter(({ order, patient }) => {
      const pName = `${patient.name} ${patient.lastName || ''}`.toLowerCase();
      const pId = (patient.id || '').toLowerCase();
      const oId = (order.id || '').toLowerCase();
      const oName = (order.testName || '').toLowerCase();
      return pName.includes(term) || pId.includes(term) || oId.includes(term) || oName.includes(term);
    });
  }, [allOrders, searchTerm]);

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

      {/* Barra de búsqueda rápida */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <span className="text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar orden por código (ej. ORD-2026-...) o nombre del paciente..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        )}
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
              {searchTerm ? 'No se encontraron órdenes con ese filtro' : 'No hay órdenes de examen activas actualmente'}
            </h3>
            <p className="text-xs text-slate-500">
              {searchTerm
                ? 'Intenta con otro término de búsqueda o código de examen.'
                : 'Cuando solicites un examen qPCR, podrás rastrear la muestra y sus resultados en vivo aquí.'}
            </p>
          </div>
          <button
            onClick={onNavigateToNewExam}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>✨</span> Solicitar nuevo examen ahora
          </button>
        </div>
      )}
    </div>
  );
}
