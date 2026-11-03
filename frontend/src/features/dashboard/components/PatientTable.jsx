import React from 'react';

export default function PatientTable({
  patients,
  filters,
  filterOptions,
  onFilterChange,
  onSelectPatient,
  onRequestExam,
  sedesList = [],
}) {
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
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
      {/* Encabezado y Barra de búsqueda */}
      <div className="p-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-extrabold text-[#2B017C]">
            Listado de pacientes
          </h2>

          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F2BCC]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Buscar paciente o propietario..."
              className="w-full pl-10 pr-4 py-2 bg-purple-50/40 border border-purple-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC] focus:border-transparent focus:bg-white transition-all font-primeform"
            />
          </div>
        </div>

        {/* Fila de Filtros */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-slate-600">
          <span className="text-xs font-semibold text-slate-500">Filtrar por:</span>

          {/* Especie */}
          <div className="relative">
            <select
              value={filters.species}
              onChange={(e) => onFilterChange('species', e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Especie: Todas</option>
              {filterOptions?.species?.map((sp) => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 text-xs">▼</span>
          </div>

          {/* Raza */}
          <div className="relative">
            <select
              value={filters.breed}
              onChange={(e) => onFilterChange('breed', e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Raza: Todas</option>
              {filterOptions?.breeds?.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 text-xs">▼</span>
          </div>

          {/* Estado de muestra */}
          <div className="relative">
            <select
              value={filters.sampleStatus}
              onChange={(e) => onFilterChange('sampleStatus', e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">Estado de muestra: Todos</option>
              {filterOptions?.sampleStatuses?.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 text-xs">▼</span>
          </div>

          {/* Sede / Sucursal */}
          {sedesList && sedesList.length > 0 && (
            <div className="relative">
              <select
                value={filters.sedeId || 'all'}
                onChange={(e) => onFilterChange('sedeId', e.target.value)}
                className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">Sede: Todas las Sedes (Consolidado)</option>
                {sedesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombreSede} ({s.codigoSedeNit || ''})
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 text-xs">▼</span>
            </div>
          )}

          {(filters.search || filters.species !== 'all' || filters.breed !== 'all' || filters.sampleStatus !== 'all' || (filters.sedeId && filters.sedeId !== 'all')) && (
            <button
              onClick={() => {
                onFilterChange('search', '');
                onFilterChange('species', 'all');
                onFilterChange('breed', 'all');
                onFilterChange('sampleStatus', 'all');
                onFilterChange('sedeId', 'all');
              }}
              className="text-xs text-sky-600 hover:text-sky-800 underline ml-2 cursor-pointer font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-t border-b border-slate-100 bg-[#f8fbfe]/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-6">PACIENTE</th>
              <th className="py-3 px-6">SEDE / SUCURSAL</th>
              <th className="py-3 px-6">ESPECIE / RAZA</th>
              <th className="py-3 px-6">PROPIETARIO</th>
              <th className="py-3 px-6">ESTADO ADMIN.</th>
              <th className="py-3 px-6">ESTADO MUESTRA</th>
              <th className="py-3 px-6">ÚLTIMA VISITA</th>
              <th className="py-3 px-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl shadow-2xs">
                        {patient.avatar || (patient.species.toLowerCase().includes('felin') ? '🐱' : patient.species.toLowerCase().includes('canin') ? '🐶' : '🐾')}
                      </div>
                      <div>
                        <span className="text-slate-900 font-bold block">
                          {patient.name} {patient.lastName || ''}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          {patient.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Sede / Sucursal */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-[#6F2BCC] border border-purple-200/80">
                      <span>📍</span>
                      <span className="truncate max-w-[150px]">{patient.sedeNombre || 'Sede Principal'}</span>
                      {patient.codigoSedeNit && (
                        <span className="text-[10px] bg-[#6F2BCC] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                          {patient.codigoSedeNit}
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {patient.species} · {patient.breed}
                  </td>

                  <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                    {patient.owner?.name}
                  </td>

                  <td className="py-4 px-6 whitespace-nowrap">
                    {getAdminBadge(patient.status)}
                  </td>

                  <td className="py-4 px-6 whitespace-nowrap">
                    {getSampleBadge(patient)}
                  </td>

                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {patient.lastVisit}
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="text-[#6F2BCC] hover:text-[#2B017C] font-bold font-primeform text-sm cursor-pointer transition-colors"
                      >
                        Ver ficha →
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🐾</span>
                    <p className="text-sm font-medium">No se encontraron pacientes con los filtros seleccionados.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
