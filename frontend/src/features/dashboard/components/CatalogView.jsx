import React, { useState, useMemo } from 'react';
import { LOCAL_INFECTIOUS_AGENTS_DB, LOCAL_QPCR_PROFILES_MASTER } from '../services/qpcrApi.js';

/**
 * Catálogo Oficial de Perfiles qPCR y Agentes Infecciosos - VetLab
 * Basado en la Base de Datos Biomédica y Epidemiológica (Excel).
 * Grupos: HEPATOZOON, RICKETTSIALES, HAEMOPLASMAS, APICOMPLEXOS, NEMÁTODOS, LEPTOSPIRA
 */
export default function CatalogView() {
  const [activeTab, setActiveTab] = useState('perfiles'); // 'perfiles' | 'agentes'
  const [speciesFilter, setSpeciesFilter] = useState('all'); // 'all' | 'canino' | 'felino' | 'ambas'
  const [groupFilter, setGroupFilter] = useState('all'); // 'all' | 'HEPATOZOON' | 'RICKETTSIALES' ...
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProfileDetails, setExpandedProfileDetails] = useState({});

  const agentGroups = [
    { id: 'all', label: 'Todos los Grupos' },
    { id: 'HEPATOZOON', label: 'Hepatozoon' },
    { id: 'RICKETTSIALES', label: 'Rickettsiales' },
    { id: 'HAEMOPLASMAS', label: 'Haemoplasmas' },
    { id: 'APICOMPLEXOS', label: 'Apicomplexos' },
    { id: 'NEMÁTODOS', label: 'Nemátodos' },
    { id: 'LEPTOSPIRA', label: 'Leptospira' },
  ];

  // Conteo de perfiles por especie
  const profileCounts = useMemo(() => {
    const all = LOCAL_QPCR_PROFILES_MASTER.length;
    const canino = LOCAL_QPCR_PROFILES_MASTER.filter(
      (p) => (p.species || '').toLowerCase() === 'canino'
    ).length;
    const felino = LOCAL_QPCR_PROFILES_MASTER.filter(
      (p) => (p.species || '').toLowerCase() === 'felino'
    ).length;
    const ambas = LOCAL_QPCR_PROFILES_MASTER.filter((p) => {
      const s = (p.species || '').toLowerCase();
      return s === 'ambos' || s.includes('amb');
    }).length;

    return { all, canino, felino, ambas };
  }, []);

  // Perfiles filtrados
  const filteredProfiles = useMemo(() => {
    return LOCAL_QPCR_PROFILES_MASTER.filter((profile) => {
      // 1. Filtro de especie estricto
      let matchesSpecies = true;
      const specNorm = (profile.species || '').toLowerCase();

      if (speciesFilter === 'canino') {
        matchesSpecies = specNorm === 'canino';
      } else if (speciesFilter === 'felino') {
        matchesSpecies = specNorm === 'felino';
      } else if (speciesFilter === 'ambas') {
        matchesSpecies = specNorm === 'ambos' || specNorm.includes('amb');
      }

      // 2. Filtro de búsqueda textual
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        profile.title.toLowerCase().includes(q) ||
        profile.description.toLowerCase().includes(q) ||
        (profile.agents && profile.agents.some((ag) => ag.toLowerCase().includes(q))) ||
        (profile.syndromes && profile.syndromes.some((syn) => syn.toLowerCase().includes(q)));

      return matchesSpecies && matchesSearch;
    });
  }, [speciesFilter, searchTerm]);

  // Agentes filtrados para la pestaña de patógenos individuales
  const filteredAgents = useMemo(() => {
    return LOCAL_INFECTIOUS_AGENTS_DB.filter((agent) => {
      let matchesSpecies = true;
      const agentSpeciesLower = agent.species.map((s) => s.toLowerCase());

      if (speciesFilter === 'canino') {
        matchesSpecies = agentSpeciesLower.includes('canino');
      } else if (speciesFilter === 'felino') {
        matchesSpecies = agentSpeciesLower.includes('felino');
      } else if (speciesFilter === 'ambas') {
        matchesSpecies = agentSpeciesLower.includes('canino') && agentSpeciesLower.includes('felino');
      }

      // Filtro de Grupo
      const matchesGroup = groupFilter === 'all' || agent.group === groupFilter;

      // Filtro de Búsqueda
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        (agent.group && agent.group.toLowerCase().includes(q)) ||
        (agent.transmission && agent.transmission.toLowerCase().includes(q)) ||
        (agent.targetOrgans && agent.targetOrgans.toLowerCase().includes(q)) ||
        (agent.symptomsDescription && agent.symptomsDescription.toLowerCase().includes(q)) ||
        (agent.labDescription && agent.labDescription.toLowerCase().includes(q)) ||
        (agent.countries && agent.countries.toLowerCase().includes(q));

      return matchesSpecies && matchesGroup && matchesSearch;
    });
  }, [speciesFilter, groupFilter, searchTerm]);

  const toggleProfileDetails = (id) => {
    setExpandedProfileDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* 1. ENCABEZADO DEL CATÁLOGO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-[#6F2BCC] border border-purple-200/60">
              Catálogo Clínico Molecular
            </span>
            <span className="text-xs text-slate-400 font-medium">
              · Base de Datos Biomédica qPCR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B017C] tracking-tight">
            Catálogo de Perfiles y Agentes qPCR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Paneles validados, patógenos clasificados por familias, patogenia, signos clínicos, hallazgos de laboratorio y matrices biológicas pertinentes.
          </p>
        </div>

        {/* Pestañas: Perfiles qPCR vs Agentes Infecciosos */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 border border-slate-300/80 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('perfiles')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'perfiles'
                ? 'bg-[#6F2BCC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Perfiles qPCR ({LOCAL_QPCR_PROFILES_MASTER.length})
          </button>
          <button
            onClick={() => setActiveTab('agentes')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'agentes'
                ? 'bg-[#6F2BCC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧬 Base de Patógenos ({LOCAL_INFECTIOUS_AGENTS_DB.length})
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS: CANINO, FELINO, SOLO AMBAS ESPECIES Y TODOS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Buscador libre */}
        <div className="flex items-center gap-2.5 flex-1 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <span className="text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'perfiles'
                ? 'Buscar perfil por nombre, agente o síndrome...'
                : 'Buscar agente por nombre, órgano, vector o signo clínico...'
            }
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium bg-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* 4 Filtros de Especie */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-xs font-bold text-[#2B017C] mr-1">Especie:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold gap-1">
            <button
              onClick={() => setSpeciesFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                speciesFilter === 'all'
                  ? 'bg-[#6F2BCC] text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Todos ({profileCounts.all})
            </button>

            <button
              onClick={() => setSpeciesFilter('canino')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                speciesFilter === 'canino'
                  ? 'bg-[#6F2BCC] text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>🐶</span>
              <span>Canino ({profileCounts.canino})</span>
            </button>

            <button
              onClick={() => setSpeciesFilter('felino')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                speciesFilter === 'felino'
                  ? 'bg-[#6F2BCC] text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>🐱</span>
              <span>Felino ({profileCounts.felino})</span>
            </button>

            <button
              onClick={() => setSpeciesFilter('ambas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                speciesFilter === 'ambas'
                  ? 'bg-[#01FADA] text-[#2B017C] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>🐾</span>
              <span>Ambas ({profileCounts.ambas})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-barra de Grupos para la pestaña de Agentes */}
      {activeTab === 'agentes' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Grupo:</span>
          {agentGroups.map((g) => {
            const isSel = groupFilter === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGroupFilter(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? 'bg-[#2B017C] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. VISTA 1: LISTADO DE PERFILES qPCR */}
      {activeTab === 'perfiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Mostrando <strong className="text-[#2B017C]">{filteredProfiles.length}</strong> perfiles validados
            </span>
            <span className="text-slate-400">
              {speciesFilter === 'canino' && 'Filtro activo: Solo Caninos'}
              {speciesFilter === 'felino' && 'Filtro activo: Solo Felinos'}
              {speciesFilter === 'ambas' && 'Filtro activo: Solo Ambas Especies'}
              {speciesFilter === 'all' && 'Mostrando todas las especies'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProfiles.map((profile) => {
              const isExpanded = expandedProfileDetails[profile.id];

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:border-[#6F2BCC]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Encabezado del Perfil */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              profile.species.toLowerCase() === 'canino'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : profile.species.toLowerCase() === 'felino'
                                ? 'bg-pink-100 text-pink-900 border border-pink-200'
                                : 'bg-[#c7f2e5] text-[#0f766e] border border-[#99f6e4]'
                            }`}
                          >
                            {profile.species === 'Canino' && '🐶 '}
                            {profile.species === 'Felino' && '🐱 '}
                            {profile.species.includes('Amb') && '🐾 '}
                            {profile.species}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6F2BCC] border border-purple-200">
                            {profile.type}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                          {profile.title}
                        </h3>
                      </div>
                      <span className="w-9 h-9 rounded-2xl bg-purple-50 text-[#6F2BCC] flex items-center justify-center text-lg shrink-0">
                        🔬
                      </span>
                    </div>

                    {/* Descripción Clínica */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {profile.description}
                    </p>

                    {/* Síndromes Asociados */}
                    {profile.syndromes && profile.syndromes.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Síndromes:
                        </span>
                        {profile.syndromes.map((syn, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Agentes Incluidos - Visibles a simple vista */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Patógenos Diana ({profile.agentIds ? profile.agentIds.length : (profile.agents || []).length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(profile.agents || []).map((agName, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-50 text-[#2B017C] border border-sky-100 flex items-center gap-1"
                          >
                            <span>🧬</span>
                            <span className="italic">{agName}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Muestras Biológicas Requeridas */}
                    <div className="pt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Muestra Requerida
                      </span>
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span>🧪</span>
                        <span>{profile.sampleSummary}</span>
                      </div>
                    </div>

                    {/* Nota aclaratoria sobre matrices biológicas */}
                    <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-sky-50/70 p-2.5 rounded-xl border border-sky-100 leading-snug">
                      <span className="text-sky-600 text-xs shrink-0 mt-0.5">ℹ️</span>
                      <span>
                        <strong className="text-slate-800">Nota sobre matrices biológicas:</strong> Posibilidad de utilizar diferentes tipos de matrices biológicas (sangre EDTA, hisopados, aspirados de médula, orina estéril, líquido cavitario/LCR o biopsias) según las características y necesidades de cada caso clínico.
                      </span>
                    </div>
                  </div>

                  {/* Pie de tarjeta con precio e información de entrega */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Precio de referencia
                      </span>
                      <span className="text-base font-extrabold text-[#2B017C]">
                        ${(profile.basePrice || profile.price || 160000).toLocaleString('es-CO')} COP
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      ⏱ Entrega en 24h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <span className="text-4xl block">🔍</span>
              <h3 className="text-base font-bold text-slate-800">
                No se encontraron perfiles qPCR para los criterios seleccionados
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Prueba cambiando el filtro de especie a "Todos" o ajustando los términos de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSpeciesFilter('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 rounded-xl bg-[#6F2BCC] text-white text-xs font-bold cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. VISTA 2: BASE COMPLETA DE AGENTES INFECCIOSOS OFICIALES (EXCEL) */}
      {activeTab === 'agentes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Mostrando <strong className="text-[#2B017C]">{filteredAgents.length}</strong> agentes en la base de datos oficial
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4 hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Encabezado del Agente */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-[#2B017C] border border-purple-200">
                          {agent.group}
                        </span>
                        {agent.species.map((sp, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-base font-black italic text-[#2B017C]">
                        {agent.name}
                      </h3>
                      {agent.countries && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          📍 {agent.countries}
                        </p>
                      )}
                    </div>
                    <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center text-sm shrink-0">
                      🧬
                    </span>
                  </div>

                  {/* Transmisión y Vectores */}
                  {agent.transmission && (
                    <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-950">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-0.5">
                        Transmisión & Vectores Comprobados
                      </span>
                      <p className="text-[11px] leading-snug">
                        {agent.transmission}
                      </p>
                    </div>
                  )}

                  {/* Órganos Blanco */}
                  {agent.targetOrgans && (
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Órganos y Tejidos Blanco
                      </span>
                      <p className="text-xs text-slate-800 font-medium">
                        {agent.targetOrgans}
                      </p>
                    </div>
                  )}

                  {/* Interacción Hospedero-Parásito / Patogenia */}
                  {agent.pathogenesis && (
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Patogenia & Respuesta Inmune
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {agent.pathogenesis}
                      </p>
                    </div>
                  )}

                  {/* Síntomas y Signos Clínicos */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Signos Clínicos Principales
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {agent.symptomsDescription}
                    </p>
                  </div>

                  {/* Hallazgos de Laboratorio */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Hallazgos de Laboratorio Clínico / Hemograma
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {agent.labDescription}
                    </p>
                  </div>

                  {/* Diagnóstico Molecular */}
                  {agent.diagnosticMethods && (
                    <div className="text-[11px] text-sky-950 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                      <strong className="block text-[10px] uppercase font-bold text-sky-800 mb-0.5">
                        Diagnóstico & Matriz Recomendada
                      </strong>
                      <span>{agent.diagnosticMethods}</span>
                    </div>
                  )}

                  {/* Observaciones relevantes */}
                  {agent.relevantNotes && (
                    <div className="text-[11px] text-slate-500 italic">
                      * {agent.relevantNotes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  {agent.doi ? (
                    <span className="font-mono text-purple-700 font-semibold text-[10px]">
                      DOI: {agent.doi}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">VetLab Biomédica</span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {agent.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
