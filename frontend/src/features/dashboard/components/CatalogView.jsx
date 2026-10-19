import React, { useState, useMemo } from 'react';
import { LOCAL_INFECTIOUS_AGENTS_DB, LOCAL_QPCR_PROFILES_MASTER } from '../services/qpcrApi.js';

/**
 * Catálogo Oficial de Perfiles qPCR y Agentes Infecciosos - VetLab
 * Permite filtrar perfiles por:
 * 1. Todos
 * 2. Canino
 * 3. Felino
 * 4. Solo ambas especies
 * Muestra todos los agentes a simple vista en cada perfil.
 * Sin botones redundantes de "nuevo examen".
 */
export default function CatalogView() {
  const [activeTab, setActiveTab] = useState('perfiles'); // 'perfiles' | 'agentes'
  const [speciesFilter, setSpeciesFilter] = useState('all'); // 'all' | 'canino' | 'felino' | 'ambas'
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProfileDetails, setExpandedProfileDetails] = useState({});

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
      } else {
        matchesSpecies = true; // 'all'
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

      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.symptomsDescription.toLowerCase().includes(q) ||
        agent.labDescription.toLowerCase().includes(q);

      return matchesSpecies && matchesSearch;
    });
  }, [speciesFilter, searchTerm]);

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
              · Termociclación en Tiempo Real qPCR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B017C] tracking-tight">
            Catálogo de Perfiles qPCR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consulta los paneles moleculares diagnósticos validados, patógenos detectados y requerimientos de muestra.
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
            🧬 12 Agentes Oficiales
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
                ? 'Buscar perfil por nombre, agente o síntoma...'
                : 'Buscar agente por nombre, síntoma o hallazgo...'
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

        {/* 4 Filtros de Especie: Todos, Canino, Felino, Solo ambas especies */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-xs font-bold text-[#2B017C] mr-1">Filtrar por:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold gap-1">
            {/* 1. Todos */}
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

            {/* 2. Canino */}
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

            {/* 3. Felino */}
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

            {/* 4. Solo ambas especies */}
            <button
              onClick={() => setSpeciesFilter('ambas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                speciesFilter === 'ambas'
                  ? 'bg-[#01FADA] text-[#2B017C] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>🐾</span>
              <span>Solo ambas especies ({profileCounts.ambas})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. VISTA 1: CATÁLOGO DE PERFILES qPCR */}
      {activeTab === 'perfiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Mostrando <strong className="text-[#2B017C]">{filteredProfiles.length}</strong> perfiles moleculares
              {speciesFilter !== 'all' && (
                <span>
                  {' '}
                  para{' '}
                  <strong className="text-[#6F2BCC]">
                    {speciesFilter === 'canino'
                      ? 'Canino'
                      : speciesFilter === 'felino'
                      ? 'Felino'
                      : 'Solo ambas especies'}
                  </strong>
                </span>
              )}
            </span>
            {speciesFilter !== 'all' && (
              <button
                onClick={() => setSpeciesFilter('all')}
                className="text-[#6F2BCC] font-bold hover:underline cursor-pointer"
              >
                Ver todos los perfiles
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredProfiles.map((profile) => {
              const isAmbos =
                (profile.species || '').toLowerCase() === 'ambos' ||
                (profile.species || '').toLowerCase().includes('amb');
              const isCanino = (profile.species || '').toLowerCase() === 'canino';
              const isFelino = (profile.species || '').toLowerCase() === 'felino';

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Encabezado de la tarjeta: Título y Badges */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Badge de Especie */}
                          {isAmbos ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#01FADA]/20 text-[#007a6a] border border-[#01FADA]/60 flex items-center gap-1">
                              <span>🐾</span>
                              <span>Canino y Felino (Ambas especies)</span>
                            </span>
                          ) : isCanino ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <span>🐶</span>
                              <span>Canino</span>
                            </span>
                          ) : isFelino ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#6F2BCC] border border-purple-200 flex items-center gap-1">
                              <span>🐱</span>
                              <span>Felino</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              {profile.species}
                            </span>
                          )}

                          {/* Badge de Tipo */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                            {profile.type || 'Panel Molecular'}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-[#2B017C] leading-snug">
                          {profile.title}
                        </h3>
                      </div>

                      <span className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-[#6F2BCC] flex items-center justify-center text-lg shrink-0">
                        🧬
                      </span>
                    </div>

                    {/* Descripción clínica */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {profile.description}
                    </p>

                    {/* TODOS LOS AGENTES A SIMPLE VISTA */}
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2B017C] flex items-center gap-1.5">
                          <span>🔬</span>
                          <span>Agentes detectados a simple vista ({profile.agents.length}):</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">qPCR Dúplex/Múltiplex</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {profile.agents.map((agentName, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold italic bg-white text-slate-800 border border-slate-200 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#01FADA]" />
                            <span>{agentName}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Síndromes clínicos vinculados */}
                    {profile.syndromes && profile.syndromes.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Síndromes clínicos asociados:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {profile.syndromes.map((syn, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-[#6F2BCC] border border-purple-100"
                            >
                              {syn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Muestra requerida */}
                    <div className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-amber-600 text-sm">🩸</span>
                      <div>
                        <span className="font-bold text-slate-800 block">Muestra requerida:</span>
                        <span className="text-[11px]">{profile.sampleSummary}</span>
                      </div>
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

      {/* 4. VISTA 2: DIRECTORIO DE LOS 12 AGENTES INFECCIOSOS OFICIALES */}
      {activeTab === 'agentes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Mostrando <strong className="text-[#2B017C]">{filteredAgents.length}</strong> de los 12 agentes oficiales
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4 hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black italic text-[#2B017C]">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {agent.species.map((sp, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6F2BCC] border border-purple-200"
                          >
                            {sp}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400 font-mono">
                          qPCR Cuantitativo
                        </span>
                      </div>
                    </div>
                    <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center text-sm shrink-0">
                      🧬
                    </span>
                  </div>

                  {/* Síntomas Clínicos */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Cuadro Clínico Principal
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {agent.symptomsDescription}
                    </p>
                  </div>

                  {/* Hallazgos de Laboratorio */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Hallazgos Laboratoriales / Hemograma
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {agent.labDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#6F2BCC] font-bold">
                    Panel Diagnóstico VetLab qPCR
                  </span>
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
