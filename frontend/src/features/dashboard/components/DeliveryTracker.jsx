import React from 'react';

export default function DeliveryTracker({ order }) {
  if (!order) return null;

  const currentStep = order.currentStep ?? 0;
  const totalSteps = order.steps?.length || 5;

  return (
    <div className="bg-gradient-to-br from-sky-50/80 via-blue-50/50 to-indigo-50/70 rounded-2xl p-5 sm:p-6 border border-sky-100 shadow-2xs mt-4 space-y-5">
      {/* 1. Detalle Ampliado del Tipo de Examen Solicitado */}
      <div className="bg-white/90 backdrop-blur-xs rounded-xl p-4 border border-sky-100 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#6F2BCC] text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
              🧬
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {order.testName}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  {order.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {order.priority || 'Normal (24-48h)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.category || 'Biología Molecular Cuantitativa (qPCR)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-slate-500">Estado actual:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6F2BCC] text-white shadow-2xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {order.steps[currentStep]?.label || 'En proceso'}
            </span>
          </div>
        </div>

        {/* Ficha técnica del examen solicitado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">
              Tipo de Muestra
            </span>
            <span className="font-bold text-slate-800">
              {order.sampleType || 'Hisopado / Muestra biológica'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">
              Fecha de Emisión
            </span>
            <span className="font-bold text-slate-800">
              {order.requestedAt}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">
              Patógenos / Dianas qPCR
            </span>
            <span className="font-medium text-slate-700 truncate block" title={order.targets}>
              {order.targets || 'Paneles moleculares de alta precisión'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Línea de Tiempo Completa Tipo Delivery (Visible de inicio a fin) */}
      <div className="pt-4 pb-2 px-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>⏱️</span> Línea de Tiempo y Avances del Examen
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Paso {currentStep + 1} de {totalSteps}
          </span>
        </div>

        {/* Pista de progreso continuo */}
        <div className="relative mt-6 mb-4">
          {/* Línea completa de base (muestra toda la trayectoria hasta el final) */}
          <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200/90 -z-0"></div>

          {/* Línea activa calculada hasta el paso actual */}
          <div
            className="absolute left-6 top-4 h-1 bg-gradient-to-r from-slate-300 to-[#6F2BCC] -z-0 transition-all duration-700"
            style={{
              width: `${(currentStep / (totalSteps - 1)) * 100}%`,
              maxWidth: 'calc(100% - 3rem)',
            }}
          ></div>

          {/* Pasos individuales visibles en toda la línea */}
          <div className="flex justify-between items-start relative z-10">
            {order.steps.map((step, index) => {
              const isPast = index < currentStep;
              const isCurrent = index === currentStep;
              const isFuture = index > currentStep;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center w-24 sm:w-28 md:w-32 group"
                >
                  {/* Nodo circular del paso: Solo el activo tiene color y animación, los anteriores en gris */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-[#6F2BCC] text-white ring-4 ring-[#6F2BCC]/30 scale-110 shadow-md animate-pulse'
                        : isPast
                        ? 'bg-slate-200 text-slate-600 border border-slate-300'
                        : 'bg-white border-2 border-slate-200 text-slate-300'
                    }`}
                  >
                    {isCurrent ? (
                      <span className="animate-spin text-sm">⏳</span>
                    ) : isPast ? (
                      <span className="font-extrabold text-slate-600">✓</span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Título del paso */}
                  <span
                    className={`text-xs mt-2.5 leading-tight ${
                      isCurrent
                        ? 'text-[#2B017C] font-extrabold scale-105'
                        : isPast
                        ? 'text-slate-500 font-semibold'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* Descripción contextual */}
                  <span
                    className={`text-[10px] mt-0.5 leading-tight hidden sm:block ${
                      isCurrent
                        ? 'text-[#6F2BCC] font-bold'
                        : isPast
                        ? 'text-slate-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {step.desc}
                  </span>

                  {/* Estado / Fecha */}
                  <span
                    className={`text-[9px] mt-1 px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isCurrent
                        ? 'bg-[#6F2BCC]/10 text-[#2B017C] font-black border border-[#6F2BCC]/20'
                        : isPast
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-slate-50 text-slate-300'
                    }`}
                  >
                    {isCurrent
                      ? 'Activo ahora'
                      : isPast
                      ? step.date || 'Completado'
                      : 'Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
