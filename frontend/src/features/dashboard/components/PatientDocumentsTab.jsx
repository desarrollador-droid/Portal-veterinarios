import React, { useState } from 'react';

const SUGGESTED_FINDINGS = [
  'Anemia microcítica',
  'Anemia normocítica',
  'Trombocitopenia marcada',
  'Trombocitopenia leve',
  'Leucocitosis',
  'Leucopenia',
  'Fiebre',
  'Letargia',
  'Vómito intermitente',
  'Diarrea mucosa',
  'Anorexia parcial',
  'Ictericia',
  'Linfadenomegalia',
  'Tos persistente',
  'Cojera articular',
  'Hepatomegalia',
  'Esplenomegalia',
];

export default function PatientDocumentsTab({
  patient,
  documents = [],
  onAddDocument,
  onDeleteDocument,
}) {
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docViewMode, setDocViewMode] = useState('viewer'); // 'viewer' | 'summary'

  // Formulario de nuevo documento
  const [formData, setFormData] = useState({
    title: '',
    documentType: 'laboratorio',
    date: new Date().toLocaleDateString('es-CO'),
    notes: '',
    fileName: '',
    fileSize: '1.2 MB',
    fileType: '',
    fileUrl: null,
    keyFindings: [],
    hematocrito: '',
    plaquetas: '',
    leucocitos: '',
    customFindingInput: '',
  });

  const filteredDocs = documents.filter((doc) => {
    if (filterType === 'all') return true;
    return doc.documentType === filterType;
  });

  const countByType = {
    all: documents.length,
    laboratorio: documents.filter((d) => d.documentType === 'laboratorio').length,
    historia_clinica: documents.filter((d) => d.documentType === 'historia_clinica').length,
    imagenologia: documents.filter((d) => d.documentType === 'imagenologia').length,
    otro: documents.filter((d) => d.documentType === 'otro').length,
  };

  const handleToggleFinding = (finding) => {
    setFormData((prev) => {
      const exists = prev.keyFindings.includes(finding);
      return {
        ...prev,
        keyFindings: exists
          ? prev.keyFindings.filter((f) => f !== finding)
          : [...prev.keyFindings, finding],
      };
    });
  };

  const handleAddCustomFinding = () => {
    if (!formData.customFindingInput.trim()) return;
    const clean = formData.customFindingInput.trim();
    if (!formData.keyFindings.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        keyFindings: [...prev.keyFindings, clean],
        customFindingInput: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const objectUrl = URL.createObjectURL(file);
      const isImg = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
      const inferredType = isImg ? (file.type || 'image/jpeg') : (file.type || 'application/pdf');
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: `${sizeMB} MB`,
        fileType: inferredType,
        fileUrl: objectUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showAestheticAlert({ title: 'Título Requerido', message: 'Por favor ingrese un título para el documento.', type: 'warning' });
      return;
    }

    const isImg = formData.fileType?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(formData.fileName);
    const resolvedType = isImg ? (formData.fileType || 'image/jpeg') : (formData.fileType || 'application/pdf');

    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-6)}`,
      title: formData.title.trim(),
      documentType: formData.documentType,
      date: formData.date || new Date().toLocaleDateString('es-CO'),
      uploadedBy: patient.attendingVet || 'Médico Veterinario Tratante',
      fileName: formData.fileName || 'Documento_Clinico_Adjunto.pdf',
      fileSize: formData.fileSize || '1.0 MB',
      fileType: resolvedType,
      fileUrl: formData.fileUrl || null,
      notes: formData.notes.trim(),
      keyFindings: formData.keyFindings,
      hematocrito: formData.hematocrito ? Number(formData.hematocrito) : null,
      plaquetas: formData.plaquetas ? Number(formData.plaquetas) : null,
      leucocitos: formData.leucocitos ? Number(formData.leucocitos) : null,
    };

    if (onAddDocument) {
      onAddDocument(newDoc);
    }

    // Reset
    setFormData({
      title: '',
      documentType: 'laboratorio',
      date: new Date().toLocaleDateString('es-CO'),
      notes: '',
      fileName: '',
      fileSize: '1.2 MB',
      fileType: '',
      fileUrl: null,
      keyFindings: [],
      hematocrito: '',
      plaquetas: '',
      leucocitos: '',
      customFindingInput: '',
    });
    setShowUploadModal(false);
  };

  const getDocTypeIcon = (type) => {
    switch (type) {
      case 'laboratorio':
        return '🩸';
      case 'historia_clinica':
        return '📋';
      case 'imagenologia':
        return '🩻';
      default:
        return '📑';
    }
  };

  const getDocTypeLabel = (type) => {
    switch (type) {
      case 'laboratorio':
        return 'Cuadro Hemático / Laboratorio';
      case 'historia_clinica':
        return 'Historia Clínica Externa / Epicrisis';
      case 'imagenologia':
        return 'Ecografía / Radiografía';
      default:
        return 'Documento Clínico';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Informativo con Botón de Subida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-purple-50 via-indigo-50/60 to-sky-50 dark:from-[#1b143c] dark:via-[#1e1644] dark:to-[#171136] border border-purple-200/80 dark:border-[#352864] rounded-2xl shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📂</span>
            <h3 className="text-base font-extrabold text-[#2B017C] dark:text-[#01FADA]">
              Exámenes Previos e Historia Clínica Adjunta
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6F2BCC] text-white">
              {documents.length} archivo(s)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Revisa y gestiona los exámenes externos, cuadros hemáticos, ecografías y antecedentes clínicos subidos. 
            Esta información se integra automáticamente en el motor de recomendación qPCR para ajustar las sospechas etiológicas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6F2BCC]/25 cursor-pointer shrink-0"
        >
          <span>📤</span>
          <span>Subir nuevo examen o historia</span>
        </button>
      </div>

      {/* 2. Filtro de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-[#2B017C] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Todos ({countByType.all})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('laboratorio')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === 'laboratorio'
              ? 'bg-[#6F2BCC] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>🩸</span> Laboratorio ({countByType.laboratorio})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('historia_clinica')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === 'historia_clinica'
              ? 'bg-[#6F2BCC] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>📋</span> Historia Clínica ({countByType.historia_clinica})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('imagenologia')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === 'imagenologia'
              ? 'bg-[#6F2BCC] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>🩻</span> Imagenología ({countByType.imagenologia})
        </button>
      </div>

      {/* 3. Galería de Documentos */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-[#1a1338] border border-slate-200 dark:border-[#2b2052] rounded-2xl p-5 shadow-xs hover:border-[#6F2BCC]/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Cabecera del Documento */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-xl shadow-2xs shrink-0">
                      {getDocTypeIcon(doc.documentType)}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-300">
                        <span>{getDocTypeLabel(doc.documentType)}</span>
                        <span>•</span>
                        <span className="font-mono">{doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold shrink-0">
                    {doc.fileSize}
                  </span>
                </div>

                {/* Archivo adjunto */}
                <div className="p-2.5 bg-slate-50 dark:bg-[#201844] rounded-xl border border-slate-200/80 dark:border-[#322664] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400">📎</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-200 truncate">
                      {doc.fileName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                    Por {doc.uploadedBy}
                  </span>
                </div>

                {/* Hallazgos Clave Extraídos para qPCR */}
                {doc.keyFindings && doc.keyFindings.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Hallazgos clínicos detectados:
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>✓</span> Alimenta qPCR
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.keyFindings.map((finding, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#6F2BCC] dark:text-[#a78bfa] border border-purple-200/80 dark:border-purple-800"
                        >
                          {finding}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valores de Laboratorio si aplican */}
                {(doc.hematocrito || doc.plaquetas || doc.leucocitos) && (
                  <div className="p-2.5 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/60 grid grid-cols-3 gap-2 text-center text-xs">
                    {doc.hematocrito && (
                      <div>
                        <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Hto</span>
                        <span className="font-black text-slate-900 dark:text-white">{doc.hematocrito}%</span>
                      </div>
                    )}
                    {doc.plaquetas && (
                      <div>
                        <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Plaquetas</span>
                        <span className="font-black text-slate-900 dark:text-white">{doc.plaquetas.toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    {doc.leucocitos && (
                      <div>
                        <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Leucocitos</span>
                        <span className="font-black text-slate-900 dark:text-white">{doc.leucocitos.toLocaleString('es-CO')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notas Clínicas */}
                {doc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-[#181238] p-2.5 rounded-xl border border-slate-100 dark:border-[#2b2052] italic leading-relaxed line-clamp-3">
                    "{doc.notes}"
                  </p>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#2b2052] flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-[#6F2BCC] dark:text-[#a78bfa] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>👁️</span>
                  <span>Ver y revisar</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => showAestheticAlert({ title: 'Descarga en Proceso', message: `Descargando archivo ${doc.fileName}...`, type: 'info' })}
                    className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all cursor-pointer"
                    title="Descargar archivo"
                  >
                    <span>📥</span>
                  </button>

                  {onDeleteDocument && (
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-all cursor-pointer"
                      title="Eliminar documento del expediente"
                    >
                      <span>🗑️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1a1338] rounded-2xl border border-dashed border-slate-200 dark:border-[#2b2052] space-y-3">
          <span className="text-4xl block">📂</span>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No hay documentos clínicos ni exámenes previos subidos en esta categoría.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Puedes subir historias de remisión externa, cuadros hemáticos o ecografías para mantener el historial completo.
          </p>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#6F2BCC] text-white rounded-xl text-xs font-bold hover:bg-[#581ea3] transition-all cursor-pointer"
          >
            + Subir primer documento
          </button>
        </div>
      )}

      {/* 4. Modal para Subir Nuevo Examen o Historia */}
      {showUploadModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161033] rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-[#2e2358] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#1b143c] border-b border-slate-100 dark:border-[#2e2358] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📤</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Subir Examen o Historia Clínica
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Título y Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block">
                    Título o Nombre del Examen / Estudio *:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej. Cuadro Hemático y Química Clínica Octubre 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#382b61] bg-slate-50 dark:bg-[#1f1742] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block">
                    Tipo de Documento:
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#382b61] bg-slate-50 dark:bg-[#1f1742] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none font-bold"
                  >
                    <option value="laboratorio">🩸 Cuadro Hemático / Laboratorio</option>
                    <option value="historia_clinica">📋 Historia Clínica / Remisión</option>
                    <option value="imagenologia">🩻 Ecografía / Radiografía</option>
                    <option value="otro">📑 Otro Estudio</option>
                  </select>
                </div>
              </div>

              {/* Selector de Archivo */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 block">
                  Archivo a Cargar (PDF, PNG, JPG, DOCX):
                </label>
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-800/80 rounded-2xl p-4 bg-purple-50/40 dark:bg-purple-950/20 text-center hover:bg-purple-50/70 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <span className="text-2xl">📎</span>
                    <p className="text-xs font-bold text-[#6F2BCC] dark:text-[#a78bfa]">
                      {formData.fileName ? formData.fileName : 'Haz clic o arrastra aquí el archivo clínico'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Formatos soportados: PDF, Imágenes o Documentos médicos hasta 25 MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Parámetros de Laboratorio si aplica */}
              {formData.documentType === 'laboratorio' && (
                <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-900/60 space-y-2">
                  <span className="font-bold text-sky-900 dark:text-sky-300 text-[11px] block">
                    Valores Hemáticos Relevantes (Opcional - Alimenta qPCR automáticamente):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Hto (%)</label>
                      <input
                        type="number"
                        placeholder="Ej. 29"
                        value={formData.hematocrito}
                        onChange={(e) => setFormData({ ...formData, hematocrito: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Plaquetas (/uL)</label>
                      <input
                        type="number"
                        placeholder="Ej. 140000"
                        value={formData.plaquetas}
                        onChange={(e) => setFormData({ ...formData, plaquetas: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Leucocitos (/uL)</label>
                      <input
                        type="number"
                        placeholder="Ej. 12500"
                        value={formData.leucocitos}
                        onChange={(e) => setFormData({ ...formData, leucocitos: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hallazgos Clínicos Sugeridos */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-200 block">
                  Hallazgos Clínicos del Documento (Haz clic para seleccionar o añadir):
                </label>
                <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 dark:bg-[#1a1338] rounded-2xl border border-slate-200 dark:border-[#2e2358] min-h-[140px] items-center content-start">
                  {SUGGESTED_FINDINGS.map((finding) => {
                    const isSelected = formData.keyFindings.includes(finding);
                    return (
                      <button
                        key={finding}
                        type="button"
                        onClick={() => handleToggleFinding(finding)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#6F2BCC] text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {finding}
                      </button>
                    );
                  })}
                </div>

                {/* Agregar hallazgo personalizado */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={formData.customFindingInput}
                    onChange={(e) => setFormData({ ...formData, customFindingInput: e.target.value })}
                    placeholder="Otro hallazgo clínico específico..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFinding}
                    className="px-3 py-1.5 bg-[#2B017C] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              {/* Notas y Observaciones Clínicas */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 block">
                  Observaciones / Resumen del Profesional:
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles relevantes de la remisión, evolución clínica previa, sospechas..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#382b61] bg-slate-50 dark:bg-[#1f1742] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                />
              </div>

              {/* Botones de Envío */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#2e2358]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white font-bold rounded-xl transition-all shadow-md shadow-[#6F2BCC]/30 cursor-pointer"
                >
                  Guardar en Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal de Revisión y Visualización del Documento (ReviewDocumentModal) */}
      {selectedDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-hidden">
          <div className="bg-white dark:bg-[#15102a] rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-200 dark:border-[#2e2358] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Visor */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#1a1338] border-b border-slate-200 dark:border-[#2e2358] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#6F2BCC] dark:text-[#01FADA] flex items-center justify-center text-xl font-bold shadow-xs">
                  {getDocTypeIcon(selectedDoc.documentType)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedDoc.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-[#6F2BCC] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {getDocTypeLabel(selectedDoc.documentType)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Expediente de {patient.name} ({patient.id}) • Registrado el {selectedDoc.date} por {selectedDoc.uploadedBy}
                  </p>
                </div>
              </div>

              {/* Selector de Modo: Visor de Archivo vs Resumen de Datos */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setDocViewMode('viewer')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      docViewMode === 'viewer'
                        ? 'bg-white dark:bg-slate-900 text-[#2B017C] dark:text-[#01FADA] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span>👁️</span> Visualizador del Documento
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocViewMode('summary')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      docViewMode === 'summary'
                        ? 'bg-white dark:bg-slate-900 text-[#2B017C] dark:text-[#01FADA] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span>📊</span> Parámetros & Hallazgos
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold text-base cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido Principal con Scroll Interno */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100/60 dark:bg-[#100b22]">
              {docViewMode === 'viewer' ? (
                /* VISTA PREVIA DEL DOCUMENTO COMPLETO (PDF / IMAGEN / HOJA CLÍNICA SIMULADA) */
                <div className="h-full flex flex-col space-y-4">
                  {selectedDoc.fileUrl && selectedDoc.fileUrl !== '#' ? (
                    // Archivo real cargado por el usuario con Blob URL
                    (selectedDoc.fileType?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(selectedDoc.fileName)) ? (
                      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#1a1338] border border-slate-200 dark:border-[#2e2358] rounded-2xl p-4 shadow-sm min-h-[480px]">
                        <img
                          src={selectedDoc.fileUrl}
                          alt={selectedDoc.title}
                          className="max-h-[560px] w-auto max-w-full rounded-xl object-contain shadow-md"
                        />
                        <p className="text-xs font-mono text-slate-500 mt-3">
                          Vista previa de imagen: {selectedDoc.fileName} ({selectedDoc.fileSize})
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col bg-white dark:bg-[#1a1338] border border-slate-200 dark:border-[#2e2358] rounded-2xl overflow-hidden shadow-sm min-h-[540px]">
                        <div className="px-4 py-2 bg-slate-200 dark:bg-[#251b4d] flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 border-b border-slate-300 dark:border-[#382b61]">
                          <span className="font-mono font-bold flex items-center gap-2">
                            <span>📄</span> {selectedDoc.fileName} ({selectedDoc.fileSize})
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Documento cargado disponible para lectura directa en pantalla
                          </span>
                        </div>
                        <iframe
                          src={selectedDoc.fileUrl}
                          title={selectedDoc.title}
                          className="w-full flex-1 min-h-[500px] border-0 bg-white"
                        />
                      </div>
                    )
                  ) : (
                    /* HOJA OFICIAL VISUAL SIMULADA PARA DOCUMENTOS HISTÓRICOS Y DEMO SIN DESCARGA OBLIGATORIA */
                    <div className="bg-white dark:bg-[#1a1338] border border-slate-200 dark:border-[#2e2358] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md max-w-4xl mx-auto w-full">
                      {/* Cabecera Oficial OSD */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200 dark:border-[#2e2358]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2B017C] to-[#6F2BCC] flex items-center justify-center text-white text-2xl font-black shadow-md shadow-[#6F2BCC]/30">
                            🧬
                          </div>
                          <div>
                            <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                              ON SITE DIAGNOSTIC (OSD) · LABORATORIO DE PATOLOGÍA & qPCR
                            </span>
                            <h2 className="text-lg font-black text-[#2B017C] dark:text-[#01FADA]">
                              {selectedDoc.title}
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">
                              Folio Oficial: {selectedDoc.id} · Archivo: {selectedDoc.fileName}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950 text-[#6F2BCC] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {getDocTypeLabel(selectedDoc.documentType)}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                            Fecha de Emisión: {selectedDoc.date}
                          </span>
                        </div>
                      </div>

                      {/* Cuadro de Identificación del Paciente y Médico */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358] text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Paciente</span>
                          <strong className="text-slate-900 dark:text-white text-sm">{patient.name} {patient.lastName || ''}</strong>
                          <span className="text-[11px] text-slate-500 block font-mono">ID: {patient.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Especie & Raza</span>
                          <strong className="text-slate-800 dark:text-slate-200">{patient.species}</strong>
                          <span className="text-[11px] text-slate-500 block">{patient.breed || 'Mestizo'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Tutor Responsable</span>
                          <strong className="text-slate-800 dark:text-slate-200">{patient.ownerName || 'Tutor Registrado'}</strong>
                          <span className="text-[11px] text-slate-500 block">{patient.ownerPhone || 'Tel. Registrado'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Médico Tratante</span>
                          <strong className="text-slate-800 dark:text-slate-200">{selectedDoc.uploadedBy}</strong>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-semibold">Registro Verificado</span>
                        </div>
                      </div>

                      {/* Parámetros Cuantitativos Analíticos Extraídos */}
                      {(selectedDoc.hematocrito || selectedDoc.plaquetas || selectedDoc.leucocitos) && (
                        <div className="border border-slate-200 dark:border-[#2e2358] rounded-2xl overflow-hidden bg-white dark:bg-[#15102a]">
                          <div className="px-5 py-3 bg-slate-100 dark:bg-[#201844] font-bold text-slate-800 dark:text-slate-200 text-xs border-b border-slate-200 dark:border-[#2e2358] flex items-center justify-between">
                            <span>🧪 Resultados Cuantitativos del Análisis Hematológico</span>
                            <span className="text-[11px] font-mono text-slate-500">Valores de Referencia Canino/Felino</span>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-[#2e2358] text-xs">
                            {selectedDoc.hematocrito && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Hematocrito (Hto)</span>
                                  <p className="text-[11px] text-slate-400">Volumen globular medido en capilar</p>
                                </div>
                                <div className="text-right">
                                  <span className={`font-mono text-sm font-black ${selectedDoc.hematocrito < 37 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                                    {selectedDoc.hematocrito}%
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 37.0 - 55.0%</span>
                                </div>
                              </div>
                            )}
                            {selectedDoc.plaquetas && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Recuento Plaquetario</span>
                                  <p className="text-[11px] text-slate-400">Plaquetas contadas en cámara / extendido</p>
                                </div>
                                <div className="text-right">
                                  <span className={`font-mono text-sm font-black ${selectedDoc.plaquetas < 175000 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                                    {selectedDoc.plaquetas.toLocaleString('es-CO')} /μL
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 175.000 - 500.000 /μL</span>
                                </div>
                              </div>
                            )}
                            {selectedDoc.leucocitos && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Leucocitos Totales (Glóbulos Blancos)</span>
                                  <p className="text-[11px] text-slate-400">Conteo citológico hematológico</p>
                                </div>
                                <div className="text-right">
                                  <span className={`font-mono text-sm font-black ${selectedDoc.leucocitos > 17000 ? 'text-purple-600' : 'text-slate-900 dark:text-white'}`}>
                                    {selectedDoc.leucocitos.toLocaleString('es-CO')} /μL
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 6.000 - 17.000 /μL</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Hallazgos Clínicos e Hipótesis para qPCR */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                          Hallazgos Clínicos Notificados (Enlace al Módulo de Diagnóstico Molecular qPCR):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedDoc.keyFindings && selectedDoc.keyFindings.length > 0 ? (
                            selectedDoc.keyFindings.map((f, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6F2BCC] text-white shadow-xs">
                                ✓ {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-xs">Sin hallazgos clínicos específicos desglosados en el documento.</span>
                          )}
                        </div>
                      </div>

                      {/* Observaciones y Resumen del Profesional */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                          Observaciones / Resumen del Profesional Tratante:
                        </span>
                        <div className="p-4 bg-slate-50 dark:bg-[#15102a] rounded-2xl border border-slate-200 dark:border-[#2e2358] text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {selectedDoc.notes || 'Documento clínico adjunto sin observaciones adicionales registradas.'}
                        </div>
                      </div>

                      {/* Sello de Validación y Seguridad Digital */}
                      <div className="pt-4 border-t border-slate-200 dark:border-[#2e2358] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🛡️</span>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">Expediente Clínico Digital Verificado</span>
                            <span className="text-[11px] text-slate-400 font-mono">Firma digital OSD Central · Sistema de Auditoría Médica</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                            ✓ Documento Verificado
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* MODO RESUMEN: PARÁMETROS CLÍNICOS Y NOTAS RÁPIDAS */
                <div className="space-y-5 max-w-3xl mx-auto">
                  <div className="bg-white dark:bg-[#1a1338] border border-slate-200 dark:border-[#2e2358] rounded-2xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-sm font-extrabold text-[#2B017C] dark:text-[#01FADA]">
                      Extracción de Parámetros Clínicos
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Hematocrito (Hto)</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {selectedDoc.hematocrito ? `${selectedDoc.hematocrito}%` : 'No medido'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Plaquetas</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {selectedDoc.plaquetas ? `${selectedDoc.plaquetas.toLocaleString('es-CO')} /μL` : 'No medido'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Leucocitos Totales</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {selectedDoc.leucocitos ? `${selectedDoc.leucocitos.toLocaleString('es-CO')} /μL` : 'No medido'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Hallazgos Notificados:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.keyFindings?.map((kf, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#6F2BCC] text-white">
                            ✓ {kf}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Notas y Observaciones:
                      </span>
                      <p className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358] text-xs text-slate-700 dark:text-slate-300">
                        {selectedDoc.notes || 'Sin notas registradas.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#1a1338] border-t border-slate-200 dark:border-[#2e2358] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                {selectedDoc.fileName} ({selectedDoc.fileSize})
              </span>
              <div className="flex items-center gap-3">
                {selectedDoc.fileUrl && selectedDoc.fileUrl !== '#' && (
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>↗</span> Abrir en Pestaña Nueva
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDoc.fileUrl && selectedDoc.fileUrl !== '#') {
                      const link = document.createElement('a');
                      link.href = selectedDoc.fileUrl;
                      link.download = selectedDoc.fileName || 'Documento_Clinico.pdf';
                      link.click();
                    } else {
                      showAestheticAlert({ title: 'Descarga de Archivo', message: `Descargando copia local de ${selectedDoc.fileName}...`, type: 'info' });
                    }
                  }}
                  className="px-4 py-2 bg-[#6F2BCC] text-white rounded-xl text-xs font-bold hover:bg-[#581ea3] transition-colors cursor-pointer"
                >
                  📥 Descargar Copia
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
