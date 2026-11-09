import React, { useState, useMemo } from 'react';
import {
  CLINICAL_CATEGORIES,
  CLINICAL_EXAMS,
  searchClinicalExams,
  getClinicalExamById,
} from '../data/clinicalCatalogData.js';

export default function ClinicalCatalogView() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sampleMatrixFilter, setSampleMatrixFilter] = useState('all');
  const [turnaroundFilter, setTurnaroundFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedExam, setSelectedExam] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Matrices de muestra más comunes para filtro rápido
  const sampleMatrices = [
    { id: 'all', label: 'Todas las Muestras' },
    { id: 'edta', label: 'Sangre EDTA (Lila)', filter: (m) => m.toLowerCase().includes('edta') },
    { id: 'suero', label: 'Suero / Sin Aditivos (Rojo/Amarillo)', filter: (m) => m.toLowerCase().includes('suero') || m.toLowerCase().includes('sin aditivo') },
    { id: 'citrato', label: 'Citrato (Azul)', filter: (m) => m.toLowerCase().includes('citrato') || m.toLowerCase().includes('azul') },
    { id: 'orina', label: 'Orina', filter: (m) => m.toLowerCase().includes('orina') },
    { id: 'fecal', label: 'Materia Fecal', filter: (m) => m.toLowerCase().includes('fecal') || m.toLowerCase().includes('heces') },
    { id: 'piel', label: 'Pelos / Raspado de Piel', filter: (m) => m.toLowerCase().includes('pelo') || m.toLowerCase().includes('raspado') || m.toLowerCase().includes('piel') },
    { id: 'biopsia', label: 'Citología / Biopsia / Tejido', filter: (m) => m.toLowerCase().includes('citolog') || m.toLowerCase().includes('tejido') || m.toLowerCase().includes('formol') || m.toLowerCase().includes('biopsia') },
  ];

  // Opciones de tiempo de entrega
  const turnaroundOptions = [
    { id: 'all', label: 'Cualquier Tiempo' },
    { id: 'urgente', label: 'Rápidos (≤ 8 Horas)', filter: (t) => t.includes('15') || t.includes('6 Horas') || t.includes('8 Horas') },
    { id: 'mismo-dia', label: '24 Horas Hábiles', filter: (t) => t.includes('24') },
    { id: 'dias', label: '2 a 5 Días Hábiles', filter: (t) => t.includes('2 a') || t.includes('3 a') || t.includes('4 a') || t.includes('5') },
  ];

  // Categoría activa objeto
  const activeCategoryObj = useMemo(() => {
    if (activeCategory === 'all') return null;
    return CLINICAL_CATEGORIES.find((c) => c.id === activeCategory) || null;
  }, [activeCategory]);

  // Filtrado y ordenamiento de pruebas
  const filteredExams = useMemo(() => {
    let list = CLINICAL_EXAMS;

    // Filtro por categoría
    if (activeCategory !== 'all') {
      const catObj = CLINICAL_CATEGORIES.find((c) => c.id === activeCategory);
      if (catObj) {
        list = list.filter((e) => e.categoria.toLowerCase() === catObj.nombre.toLowerCase());
      }
    }

    // Filtro por matriz de muestra
    if (sampleMatrixFilter !== 'all') {
      const selectedMatrix = sampleMatrices.find((sm) => sm.id === sampleMatrixFilter);
      if (selectedMatrix && selectedMatrix.filter) {
        list = list.filter((e) => selectedMatrix.filter(e.muestra || ''));
      }
    }

    // Filtro por tiempo de entrega
    if (turnaroundFilter !== 'all') {
      const selectedT = turnaroundOptions.find((to) => to.id === turnaroundFilter);
      if (selectedT && selectedT.filter) {
        list = list.filter((e) => selectedT.filter(e.tiempoResultado || ''));
      }
    }

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((e) => {
        return (
          e.nombre.toLowerCase().includes(q) ||
          (e.observaciones && e.observaciones.toLowerCase().includes(q)) ||
          (e.muestra && e.muestra.toLowerCase().includes(q)) ||
          (e.categoria && e.categoria.toLowerCase().includes(q)) ||
          String(e.precio).includes(q)
        );
      });
    }

    // Ordenamiento
    const sorted = [...list];
    if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    } else if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.precio - a.precio);
    }

    return sorted;
  }, [activeCategory, sampleMatrixFilter, turnaroundFilter, searchTerm, sortBy]);

  // Conteo de pruebas por categoría
  const categoryCounts = useMemo(() => {
    const counts = { all: CLINICAL_EXAMS.length };
    CLINICAL_CATEGORIES.forEach((cat) => {
      counts[cat.id] = CLINICAL_EXAMS.filter(
        (e) => e.categoria.toLowerCase() === cat.nombre.toLowerCase()
      ).length;
    });
    return counts;
  }, []);

  const handleCopyExamInfo = (exam) => {
    const text = `VetLab - ${exam.nombre}\nCategoría: ${exam.categoria}\nPrecio: ${exam.precioFormateado} (IVA Incl.)\nMuestra: ${exam.muestra}\nTiempo: ${exam.tiempoResultado}\nObservaciones: ${exam.observaciones || 'N/A'}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(exam.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredCategoriesList = useMemo(() => {
    if (!categorySearchQuery.trim()) return CLINICAL_CATEGORIES;
    const q = categorySearchQuery.trim().toLowerCase();
    return CLINICAL_CATEGORIES.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(q))
    );
  }, [categorySearchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. ENCABEZADO PRINCIPAL DE LA MARCA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#2B017C] via-[#3d02ad] to-[#6F2BCC] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#01FADA]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-[#6F2BCC]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#01FADA] border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#01FADA] animate-pulse" />
              <span>Portafolio Diagnóstico Clínico 2026 · VetqPCR Lab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Catálogo Clínicas & Pruebas Diagnósticas
            </h1>
            <p className="text-purple-100/90 text-xs sm:text-sm leading-relaxed">
              Consulte el portafolio completo de <strong>223 pruebas clínicas de laboratorio</strong> clasificadas en <strong>25 áreas diagnósticas</strong> con tarifas oficiales (IVA incluido), matrices biológicas de recolección y tiempos de entrega garantizados.
            </p>
          </div>

          {/* Estadísticas rápidas y línea de soporte */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-200 block">Total Pruebas</span>
                <span className="text-lg font-black text-white">{CLINICAL_EXAMS.length} Exámenes</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#01FADA] block">Soporte & OSD</span>
                <span className="text-xs font-bold text-white block">300 514 3626 · 300 514 3701</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECOMENDACIONES PREANALÍTICAS DE LA CATEGORÍA ACTIVA */}
      {activeCategoryObj && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50/30 border border-purple-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs animate-in fade-in duration-300">
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-purple-100 text-xl shrink-0">
            {activeCategoryObj.icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-[#2B017C] uppercase tracking-wider">
                Manejo Preanalítico · {activeCategoryObj.nombre}
              </h3>
              <span className="px-2 py-0.5 bg-purple-200/70 text-[#2B017C] text-[10px] font-bold rounded-full">
                Página {activeCategoryObj.paginaInicio} Portafolio
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeCategoryObj.preparacionMuestra}
            </p>
          </div>
        </div>
      )}

      {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Buscador General de Pruebas */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar prueba clínica por nombre, analito, tubo (EDTA, suero, orina) o precio..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector y Buscador Interactivo de Categoría */}
          <div className="relative w-full md:w-72">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                📁
              </span>
              <input
                type="text"
                value={categorySearchQuery}
                onFocus={() => setIsCategoryDropdownOpen(true)}
                onChange={(e) => {
                  setCategorySearchQuery(e.target.value);
                  setIsCategoryDropdownOpen(true);
                }}
                placeholder="Filtrar por categoría..."
                className="w-full pl-9 pr-7 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white transition-all cursor-pointer"
              />
              {categorySearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setCategorySearchQuery('');
                    setActiveCategory('all');
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-xs text-slate-400">
                  ▾
                </span>
              )}
            </div>

            {/* Menú desplegable interactivo con todas las categorías filtrables */}
            {isCategoryDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsCategoryDropdownOpen(false)}
                />
                <div className="absolute left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('all');
                      setCategorySearchQuery('');
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      activeCategory === 'all'
                        ? 'bg-[#6F2BCC] text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>🌐 Todas las Categorías</span>
                    <span className="text-[10px] opacity-80">{CLINICAL_EXAMS.length}</span>
                  </button>

                  {filteredCategoriesList.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setCategorySearchQuery(cat.nombre);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100 text-[#2B017C] font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5 mr-2">
                          <span>{cat.icon || '🔬'}</span>
                          <span className="truncate">{cat.nombre}</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold shrink-0">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                  {filteredCategoriesList.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No se encontraron categorías coincidentes
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Filtros secundarios: Matriz, Tiempo, Orden y Modo de Vista */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Matriz de muestra */}
            <select
              value={sampleMatrixFilter}
              onChange={(e) => setSampleMatrixFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
            >
              {sampleMatrices.map((sm) => (
                <option key={sm.id} value={sm.id}>
                  {sm.label}
                </option>
              ))}
            </select>

            {/* Tiempo de entrega */}
            <select
              value={turnaroundFilter}
              onChange={(e) => setTurnaroundFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
            >
              {turnaroundOptions.map((to) => (
                <option key={to.id} value={to.id}>
                  {to.label}
                </option>
              ))}
            </select>

            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6F2BCC]"
            >
              <option value="default">Orden por Defecto</option>
              <option value="name-asc">Nombre (A - Z)</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>

            {/* Botones Grid / Table */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#2B017C] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista en Cuadrícula"
              >
                ▦ Tarjetas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#2B017C] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista en Tabla"
              >
                ☰ Tabla
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CONTADOR DE RESULTADOS */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Mostrando <strong className="text-slate-800">{filteredExams.length}</strong> de{' '}
          <strong>{CLINICAL_EXAMS.length}</strong> pruebas diagnósticas disponibles
        </span>
        {(searchTerm || sampleMatrixFilter !== 'all' || turnaroundFilter !== 'all' || activeCategory !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchTerm('');
              setSampleMatrixFilter('all');
              setTurnaroundFilter('all');
              setSortBy('default');
            }}
            className="text-[#6F2BCC] font-bold hover:underline cursor-pointer"
          >
            Limpiar todos los filtros ✕
          </button>
        )}
      </div>

      {/* 6. LISTADO DE PRUEBAS: MODO GRID DE TARJETAS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header de la tarjeta: Categoría y Precio */}
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-[#6F2BCC] border border-purple-100">
                    <span>{exam.categoriaIcon || '🔬'}</span>
                    <span className="truncate max-w-[170px]">{exam.categoria}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-xl font-mono font-black text-xs text-[#2B017C] bg-purple-100/70 border border-purple-200">
                    {exam.precioFormateado}
                  </span>
                </div>

                {/* Nombre de la prueba */}
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-[#6F2BCC] transition-colors leading-snug">
                  {exam.nombre}
                </h3>

                {/* Matriz de muestra */}
                <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-sm shrink-0">🧪</span>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Muestra / Tubo</span>
                    <span className="font-semibold text-slate-800 text-xs line-clamp-2">
                      {exam.muestra || 'Sangre entera / Suero'}
                    </span>
                  </div>
                </div>

                {/* Observaciones técnicas si existen */}
                {exam.observaciones && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic leading-relaxed">
                    💡 {exam.observaciones}
                  </p>
                )}
              </div>

              {/* Footer de la tarjeta: Tiempo y botón de detalles */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <span>⏱️</span>
                  <span className="truncate max-w-[130px]">{exam.tiempoResultado}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyExamInfo(exam)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    title="Copiar información de la prueba"
                  >
                    {copiedId === exam.id ? '✓' : '📋'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedExam(exam)}
                    className="px-3 py-1.5 bg-[#2B017C] hover:bg-[#6F2BCC] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Ficha Técnica
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. LISTADO DE PRUEBAS: MODO TABLA COMPACTA */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3 px-4">Cód.</th>
                  <th className="py-3 px-4">Prueba Diagnóstica</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Muestra Biológica</th>
                  <th className="py-3 px-4">Tiempo de Entrega</th>
                  <th className="py-3 px-4 text-right">Precio (IVA Incl.)</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{exam.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{exam.nombre}</span>
                      {exam.observaciones && (
                        <span className="text-[10px] text-slate-400 italic block truncate max-w-sm">
                          {exam.observaciones}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        <span>{exam.categoriaIcon}</span>
                        <span>{exam.categoria}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={exam.muestra}>
                      {exam.muestra}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      ⏱️ {exam.tiempoResultado}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-[#2B017C]">
                      {exam.precioFormateado}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedExam(exam)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#6F2BCC] hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ESTADO VACÍO SI NO HAY RESULTADOS */}
      {filteredExams.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-3xl mx-auto text-[#6F2BCC]">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">
              No se encontraron exámenes para el criterio especificado
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Intente ajustar el término de búsqueda o seleccione otra categoría diagnóstica.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchTerm('');
              setSampleMatrixFilter('all');
              setTurnaroundFilter('all');
            }}
            className="px-4 py-2 bg-[#6F2BCC] text-white rounded-xl text-xs font-bold hover:bg-[#581ea3] transition-colors cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* 8. MODAL DE FICHA TÉCNICA DETALLADA */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Cabecera del modal */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-[#2B017C]">
                  <span>{selectedExam.categoriaIcon || '🔬'}</span>
                  <span>{selectedExam.categoria}</span>
                </span>
                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {selectedExam.nombre}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tarifa y tiempos destacados */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-100">
                <span className="text-[10px] uppercase font-bold text-purple-600 block">Tarifa Oficial</span>
                <span className="text-xl font-black font-mono text-[#2B017C] block">
                  {selectedExam.precioFormateado}
                </span>
                <span className="text-[10px] text-purple-500 block">IVA incluido</span>
              </div>

              <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-100">
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Tiempo de Entrega</span>
                <span className="text-base font-extrabold text-sky-950 block">
                  ⏱️ {selectedExam.tiempoResultado}
                </span>
                <span className="text-[10px] text-sky-600 block">Días / horas hábiles</span>
              </div>
            </div>

            {/* Muestra Requerida */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Matriz Biológica / Tipo de Tubo
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                🧪 {selectedExam.muestra || 'Consulte al laboratorio'}
              </p>
            </div>

            {/* Indicaciones Preanalíticas */}
            {selectedExam.preparacionMuestra && (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <span>💡</span>
                  <span>Indicaciones de Preparación y Manejo</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-medium">
                  {selectedExam.preparacionMuestra}
                </p>
              </div>
            )}

            {/* Observaciones o Metodología */}
            {selectedExam.observaciones && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Metodología & Alcance Diagnóstico
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedExam.observaciones}
                </p>
              </div>
            )}

            {/* Información de Soporte OSD */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <div>
                  <strong className="block text-[11px]">Asesoría Médica OSD VetLab:</strong>
                  <span className="text-[11px] text-indigo-700">300 514 3626 · 300 514 3701</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 bg-white rounded-lg font-bold text-indigo-800 border border-indigo-200">
                L-V 7am - 6pm · Sáb 7am - 2pm
              </span>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyExamInfo(selectedExam)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{copiedId === selectedExam.id ? '✓ Copiado' : '📋 Copiar Ficha'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="px-5 py-2.5 bg-[#2B017C] hover:bg-[#6F2BCC] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
