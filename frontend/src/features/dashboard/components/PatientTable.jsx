import React, { useState, useEffect } from 'react';

export default function PatientTable({
  patients = [],
  filters = {},
  filterOptions,
  onFilterChange,
  onSelectPatient,
  onRequestExam,
  sedesList = [],
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reiniciar a página 1 cuando cambian los filtros o el tamaño de página
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters?.search,
    filters?.species,
    filters?.breed,
    filters?.sampleStatus,
    filters?.sedeId,
    pageSize,
  ]);

  const totalPatients = patients?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalPatients / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalPatients === 0 ? 0 : (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPatients);
  const paginatedPatients = patients.slice(startIndex, endIndex);

  // Generador de números de página
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (validPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validPage - 1, validPage, validPage + 1, '...', totalPages);
      }
    }
    return pages;
  };
  const getSampleBadge = (patient) => {
    let statusText = 'Pendiente de toma';
    if (patient.activeExamOrder) {
      const step = patient.activeExamOrder.steps[patient.activeExamOrder.currentStep];
      statusText = step ? step.label : 'En proceso';
    } else if (patient.sampleStatus) {
      statusText = patient.sampleStatus;
    }

    switch (statusText.toLowerCase()) {
      case 'resultado enviado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#15803d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
            Resultado enviado
          </span>
        );
      case 'validación médica':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
            Validación médica
          </span>
        );
      case 'en análisis qpcr':
      case 'en análisis':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#b45309]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
            En análisis qPCR
          </span>
        );
      case 'muestra recibida':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F2BCC]"></span>
            Muestra recibida
          </span>
        );
      case 'solicitud creada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#6d28d9]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span>
            Solicitud creada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f8fafc] text-[#64748b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]"></span>
            Sin examen activo
          </span>
        );
    }
  };

  // Mapeo de los 11 estados del paciente
  const getAdminBadge = (status) => {
    const s = (status || 'activo').toLowerCase();
    switch (s) {
      case 'activo':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#eff6ff] text-[#2563eb]">Activo</span>;
      case 'internado':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#faf5ff] text-[#9333ea]">Internado</span>;
      case 'critico':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#fff1f2] text-[#e11d48]">Crítico</span>;
      case 'en tratamiento':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#166534]">En tratamiento</span>;
      case 'en observación':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#fefce8] text-[#a16207]">En observación</span>;
      case 'en recuperación':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#f0fdfa] text-[#0f766e]">En recuperación</span>;
      case 'pendiente por atención':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#fff7ed] text-[#c2410c]">Pendiente</span>;
      case 'estable':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#ecfeff] text-[#0e7490]">Estable</span>;
      case 'dado de alta':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#047857]">Dado de alta</span>;
      case 'fallecido':
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">Fallecido 🔒</span>;
      case 'inactivo':
      default:
        return <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Inactivo</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-[#15102a] rounded-2xl border border-slate-200/70 dark:border-[#281f47] shadow-xs overflow-hidden">
      {/* Encabezado y Barra de búsqueda limpia */}
      <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#2B017C] dark:text-[#01FADA]">
            Listado de pacientes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Haz clic en cualquier paciente de la tabla para abrir y revisar su ficha clínica completa.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F2BCC] dark:text-[#a78bfa]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Buscar paciente o propietario..."
            className="w-full pl-10 pr-4 py-2 bg-purple-50/40 dark:bg-[#1d1738] border border-purple-100 dark:border-[#382b61] rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC] focus:border-transparent focus:bg-white dark:focus:bg-[#231c44] transition-all font-primeform"
          />
        </div>
      </div>

      {/* Tabla sin barra horizontal forzada */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-t border-b border-slate-100 dark:border-[#281f47] bg-[#f8fbfe]/80 dark:bg-[#1a1336] text-[11px] font-bold text-slate-500 dark:text-purple-300 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-5">PACIENTE</th>
              <th className="py-3 px-4 sm:px-5">ESPECIE / RAZA</th>
              <th className="py-3 px-4 sm:px-5">PROPIETARIO</th>
              <th className="py-3 px-4 sm:px-5">ESTADO ADMIN.</th>
              <th className="py-3 px-4 sm:px-5">ESTADO MUESTRA</th>
              <th className="py-3 px-4 sm:px-5">ÚLTIMA VISITA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#241a42] text-sm">
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  title="Haz clic para ver la ficha clínica de este paciente"
                  className="hover:bg-purple-50/50 dark:hover:bg-[#211947] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-800 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-800/50 flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
                        {patient.avatar || (patient.species.toLowerCase().includes('felin') ? '🐱' : patient.species.toLowerCase().includes('canin') ? '🐶' : '🐾')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 dark:text-white font-bold block group-hover:text-[#6F2BCC] dark:group-hover:text-[#01FADA] transition-colors">
                            {patient.name} {patient.lastName || ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400">
                            {patient.id}
                          </span>
                          {/* Carácter especial discreto de sede atendida */}
                          {patient.codigoSedeNit && (
                            <span
                              title={`Atendido en: ${patient.sedeNombre || 'Sede'} (${patient.codigoSedeNit})`}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[#6F2BCC] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 text-[10px] font-mono font-bold"
                            >
                              <span>🏢</span>
                              <span>{patient.codigoSedeNit.replace(/^#nit-?/i, '#')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 sm:px-5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {patient.species} · {patient.breed}
                  </td>

                  <td className="py-3.5 px-4 sm:px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {patient.owner?.name}
                  </td>

                  <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                    {getAdminBadge(patient.status)}
                  </td>

                  <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                    {getSampleBadge(patient)}
                  </td>

                  <td className="py-3.5 px-4 sm:px-5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {patient.lastVisit}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto px-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-[#281f47] text-[#6F2BCC] dark:text-[#01FADA] flex items-center justify-center text-2xl shadow-inner">
                      🐾
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
                        {filters?.search || (filters?.species && filters.species !== 'all') || (filters?.breed && filters.breed !== 'all') || (filters?.sampleStatus && filters.sampleStatus !== 'all')
                          ? 'No se encontraron pacientes con los filtros seleccionados'
                          : 'Aún no tienes pacientes asociados a esta clínica'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {filters?.search || (filters?.species && filters.species !== 'all') || (filters?.breed && filters.breed !== 'all') || (filters?.sampleStatus && filters.sampleStatus !== 'all')
                          ? 'Intenta restablecer los filtros de búsqueda para consultar todos los registros.'
                          : 'Como es una clínica nueva, registra tu primer paciente haciendo clic en el botón "+ Nuevo Paciente" en la esquina superior.'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-[#281f47] bg-[#f8fbfe]/50 dark:bg-[#15102a]">
        {/* Contador y selector de tamaño */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {totalPatients > 0 ? (
              <>
                Mostrando <strong className="text-slate-700 dark:text-purple-200">{startIndex + 1}</strong> -{' '}
                <strong className="text-slate-700 dark:text-purple-200">{endIndex}</strong> de{' '}
                <strong className="text-slate-700 dark:text-purple-200">{totalPatients}</strong> pacientes
              </>
            ) : (
              '0 pacientes'
            )}
          </span>

          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-[#281f47] pl-4">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white dark:bg-[#1d1738] border border-slate-200 dark:border-[#382b61] rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-purple-200 focus:outline-none focus:ring-1 focus:ring-[#6F2BCC] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Controles de navegación */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validPage <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-[#382b61] bg-white dark:bg-[#1d1738] text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-[#281f47] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((num, idx) =>
                num === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 text-center text-slate-400 dark:text-purple-400 text-xs font-bold select-none"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${num}`}
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                      validPage === num
                        ? 'bg-[#2B017C] dark:bg-[#6F2BCC] text-white dark:text-[#01FADA] border-[#2B017C] dark:border-[#6F2BCC] shadow-xs'
                        : 'border-slate-200 dark:border-[#382b61] bg-white dark:bg-[#1d1738] text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-[#281f47]'
                    }`}
                  >
                    {num}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validPage >= totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-[#382b61] bg-white dark:bg-[#1d1738] text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-[#281f47] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              <span>Siguiente</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
