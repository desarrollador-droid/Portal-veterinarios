import React from 'react';

/**
 * MiniDashboards
 * Métricas clave del portal limpias y directas, sin textos de relleno ni etiquetas innecesarias.
 * Paleta oficial: #2B017C, #6F2BCC, #01FADA, #FFFFFF.
 */
export default function MiniDashboards({ stats }) {
  const cards = [
    {
      value: stats?.activePatients ?? 0,
      title: 'Pacientes activos',
      colorClass: 'text-[#2B017C]',
    },
    {
      value: stats?.ordersInProgress ?? 0,
      title: 'Órdenes en curso',
      colorClass: 'text-[#6F2BCC]',
    },
    {
      value: stats?.resultsReady ?? 0,
      title: 'Resultados listos',
      colorClass: 'text-[#059669]',
    },
    {
      value: stats?.hospitalized ?? 0,
      title: 'Internados',
      colorClass: 'text-[#2B017C]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <span className={`text-4xl font-extrabold ${card.colorClass} tracking-tight mb-2`}>
            {card.value}
          </span>
          <h3 className="text-sm font-bold text-slate-800 leading-tight">
            {card.title}
          </h3>
        </div>
      ))}
    </div>
  );
}
