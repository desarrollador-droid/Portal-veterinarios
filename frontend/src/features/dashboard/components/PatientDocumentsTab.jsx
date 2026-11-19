import React, { useState } from 'react';
import { showAestheticAlert } from './AestheticModal.jsx';

export const CLINICAL_FINDINGS_BY_TYPE = {
  laboratorio: [
    'Anemia normocítica normocrómica',
    'Anemia microcítica hipocrómica',
    'Anemia macrocítica (regenerativa)',
    'Trombocitopenia marcada (< 50,000/µL)',
    'Trombocitopenia leve a moderada',
    'Trombocitosis reactiva',
    'Leucocitosis por neutrofilia',
    'Desviación a la izquierda (neutrófilos en banda)',
    'Leucopenia marcada',
    'Linfopenia persistente',
    'Eosinofilia reactiva / parasitaria',
    'Monocitosis activa',
    'Inclusiones / mórulas intracelulares',
    'Hemoparásitos visualizados en frotis',
  ],
  bioquimica: [
    'Azotemia renal (Creatinina / BUN elevado)',
    'Elevación de ALT / GPT (Injuria hepatocelular)',
    'Elevación de Fosfatasa Alcalina (Colestasis)',
    'Hiperbilirrubinemia (Ictericia bioquímica)',
    'Hipoalbuminemia marcada',
    'Hiperproteinemia / Hipergammaglobulinemia',
    'Hiperglucemia / Sospecha Diabetes',
    'Hipoglucemia clínica',
    'Desequilibrio electrolítico (Na / K / Cl)',
    'Hipocalcemia / Hipercalcemia',
    'Amilasa / Lipasa sérica elevada',
  ],
  uroanalisis: [
    'Isostenuria (Densidad < 1.025)',
    'Hipostenuria (Densidad < 1.008)',
    'Proteinuria patológica / cociente UPC',
    'Hematuria / Hemoglobinuria microscópica',
    'Glucosuria renal',
    'Bacteriuria activa en sedimento',
    'Cristales de estruvita (Fosfato triple)',
    'Cristales de oxalato de calcio',
    'Cilindros granulares / hialinos en sedimento',
    'Leucocituria / Piuria marcada (> 5 por campo)',
    'Células transicionales / atipia epitelial',
  ],
  coprologico: [
    'Presencia de quistes de Giardia lamblia',
    'Ooquistes de Coccidios / Isospora spp.',
    'Huevos de Ancylostoma caninum',
    'Huevos de Toxocara canis / cati',
    'Proliferación bacteriana / Disbiosis entérica',
    'Esporas compatibles con Clostridium perfringens',
    'Sangre oculta fecal positiva (+)',
    'Presencia de leucocitos fecales',
    'Moco fecal y detritos aumentados',
  ],
  ecografia: [
    'Esplenomegalia congestiva / reactiva',
    'Hepatomegalia con ecotextura heterogénea',
    'Linfadenomegalia mesentérica / abdominal',
    'Engrosamiento difuso de pared intestinal',
    'Pérdida de diferenciación córtico-medular renal',
    'Líquido libre abdominal (Ascitis / Efusión)',
    'Sedimento vesical / Urolitiasis',
    'Barro biliar / Colecistitis',
    'Hipoecogenicidad pancreática (Pancreatitis)',
    'Signos de intususcepción o cuerpo extraño',
  ],
  radiografia: [
    'Patrón bronquial / peribronquial activo',
    'Patrón intersticial difuso / no estructurado',
    'Patrón alveolar / Consolidación pulmonar',
    'Cardiomegalia (Índice VHS aumentado)',
    'Efusión pleural / Neumotórax',
    'Megacolon / Retención fecal marcada',
    'Signo de gas anómalo / Obstrucción intestinal',
    'Signos de cuerpo extraño radiopaco',
    'Espondilosis deformante / Discoespondilitis',
    'Osteoartrosis degenerativa / Displasia',
  ],
  historia_clinica: [
    'Fiebre de origen desconocido',
    'Letargia / Postración progresiva',
    'Anorexia / Hiporexia mayor a 48h',
    'Vómitos agudos / recurrentes',
    'Diarrea hemorrágica / mucosa',
    'Cojera articular / Dolor poliarticular',
    'Linfadenopatía periférica generalizada',
    'Dificultad respiratoria / Disnea / Tos',
    'Convulsiones / Cuadros neuro-infecciosos',
    'Pérdida de peso involuntaria marcada',
    'Ictericia clínica evidente',
  ],
  otro: [
    'Inflamación supurativa / neutrofílica aguda',
    'Inflamación granulomatosa / piogranulomatosa',
    'Criterios citológicos de malignidad',
    'Hiperplasia linfoide reactiva',
    'Frotis acelular / Celularidad escasa',
    'Exudado séptico con bacterias fagocitadas',
    'Lesión proliferativa benigna',
  ],
};

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

  // Formulario de nuevo documento con campos clínicos estructurados
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
    // Laboratorio / Hemograma
    hematocrito: '',
    plaquetas: '',
    leucocitos: '',
    hemoglobina: '',
    // Bioquímica
    creatinina: '',
    bun: '',
    alt: '',
    fa: '',
    // Uroanálisis
    densidadUrinaria: '',
    phUrinario: '',
    proteinasOrina: '',
    // Coprológico
    consistenciaHeces: '',
    parasitoFecal: '',
    // Imagenología
    regionEvaluada: '',
    conclusionDiagnostica: '',
    // Historia / Remisión
    diagnosticoPresuntivo: '',
    tratamientoPrevio: '',
    customFindingInput: '',
  });

  const getDocTypeIcon = (type) => {
    switch (type) {
      case 'laboratorio':
      case 'hemograma':
        return '🩸';
      case 'bioquimica':
        return '🧪';
      case 'uroanalisis':
        return '🧫';
      case 'coprologico':
        return '🔬';
      case 'ecografia':
        return '🩺';
      case 'radiografia':
      case 'imagenologia':
        return '🩻';
      case 'historia_clinica':
        return '📋';
      default:
        return '📑';
    }
  };

  const getDocTypeLabel = (type) => {
    switch (type) {
      case 'laboratorio':
      case 'hemograma':
        return 'Cuadro Hemático / Hemograma';
      case 'bioquimica':
        return 'Química Sanguínea / Bioquímica';
      case 'uroanalisis':
        return 'Uroanálisis / Parcial de Orina';
      case 'coprologico':
        return 'Coprológico / Coproscópico';
      case 'ecografia':
        return 'Ecografía / Ultrasonido Abdominal';
      case 'radiografia':
      case 'imagenologia':
        return 'Radiografía / Rayos X';
      case 'historia_clinica':
        return 'Historia Clínica Externa / Remisión';
      default:
        return 'Estudio Clínico Especializado';
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (filterType === 'all') return true;
    if (filterType === 'laboratorio') return doc.documentType === 'laboratorio' || doc.documentType === 'hemograma' || doc.documentType === 'bioquimica';
    if (filterType === 'imagenologia') return doc.documentType === 'imagenologia' || doc.documentType === 'ecografia' || doc.documentType === 'radiografia';
    return doc.documentType === filterType;
  });

  const countByType = {
    all: documents.length,
    laboratorio: documents.filter((d) => d.documentType === 'laboratorio' || d.documentType === 'hemograma' || d.documentType === 'bioquimica').length,
    imagenologia: documents.filter((d) => d.documentType === 'imagenologia' || d.documentType === 'ecografia' || d.documentType === 'radiografia').length,
    uroanalisis: documents.filter((d) => d.documentType === 'uroanalisis').length,
    coprologico: documents.filter((d) => d.documentType === 'coprologico').length,
    historia_clinica: documents.filter((d) => d.documentType === 'historia_clinica').length,
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
      documentTypeLabel: getDocTypeLabel(formData.documentType),
      date: formData.date || new Date().toLocaleDateString('es-CO'),
      uploadedBy: patient.attendingVet || 'Médico Veterinario Tratante',
      fileName: formData.fileName || 'Documento_Clinico_Adjunto.pdf',
      fileSize: formData.fileSize || '1.0 MB',
      fileType: resolvedType,
      fileUrl: formData.fileUrl || null,
      notes: formData.notes.trim(),
      keyFindings: formData.keyFindings,
      structuredData: {
        hematocrito: formData.hematocrito ? Number(formData.hematocrito) : null,
        hemoglobina: formData.hemoglobina ? Number(formData.hemoglobina) : null,
        plaquetas: formData.plaquetas ? Number(formData.plaquetas) : null,
        leucocitos: formData.leucocitos ? Number(formData.leucocitos) : null,
        creatinina: formData.creatinina ? Number(formData.creatinina) : null,
        bun: formData.bun ? Number(formData.bun) : null,
        alt: formData.alt ? Number(formData.alt) : null,
        fa: formData.fa ? Number(formData.fa) : null,
        densidadUrinaria: formData.densidadUrinaria || null,
        phUrinario: formData.phUrinario || null,
        proteinasOrina: formData.proteinasOrina || null,
        consistenciaHeces: formData.consistenciaHeces || null,
        parasitoFecal: formData.parasitoFecal || null,
        regionEvaluada: formData.regionEvaluada || null,
        conclusionDiagnostica: formData.conclusionDiagnostica || null,
        diagnosticoPresuntivo: formData.diagnosticoPresuntivo || null,
        tratamientoPrevio: formData.tratamientoPrevio || null,
      },
      // Compatibilidad directa
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
      hemoglobina: '',
      creatinina: '',
      bun: '',
      alt: '',
      fa: '',
      densidadUrinaria: '',
      phUrinario: '',
      proteinasOrina: '',
      consistenciaHeces: '',
      parasitoFecal: '',
      regionEvaluada: '',
      conclusionDiagnostica: '',
      diagnosticoPresuntivo: '',
      tratamientoPrevio: '',
      customFindingInput: '',
    });
    setShowUploadModal(false);
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

                {/* Parámetros Analíticos Estructurados según Tipo de Examen */}
                {((doc.hematocrito || doc.plaquetas || doc.leucocitos || doc.hemoglobina) ||
                  (doc.structuredData?.creatinina || doc.structuredData?.bun || doc.structuredData?.alt || doc.structuredData?.fa || doc.creatinina || doc.bun) ||
                  (doc.structuredData?.densidadUrinaria || doc.structuredData?.phUrinario || doc.densidadUrinaria) ||
                  (doc.structuredData?.consistenciaHeces || doc.structuredData?.parasitoFecal || doc.consistenciaHeces) ||
                  (doc.structuredData?.regionEvaluada || doc.structuredData?.conclusionDiagnostica || doc.conclusionDiagnostica) ||
                  (doc.structuredData?.diagnosticoPresuntivo || doc.diagnosticoPresuntivo)) && (
                  <div className="p-2.5 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/60 text-xs space-y-1.5">
                    {/* Hemograma */}
                    {(doc.hematocrito || doc.plaquetas || doc.leucocitos || doc.hemoglobina) && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                        {doc.hematocrito && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Hto</span>
                            <span className="font-black text-slate-900 dark:text-white">{doc.hematocrito}%</span>
                          </div>
                        )}
                        {(doc.hemoglobina || doc.structuredData?.hemoglobina) && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Hgb</span>
                            <span className="font-black text-slate-900 dark:text-white">{doc.hemoglobina || doc.structuredData?.hemoglobina} g/dL</span>
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

                    {/* Bioquímica */}
                    {(doc.structuredData?.creatinina || doc.structuredData?.bun || doc.structuredData?.alt || doc.creatinina || doc.bun) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1 border-t border-sky-200/50 dark:border-sky-900/50">
                        {(doc.creatinina || doc.structuredData?.creatinina) && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Creatinina</span>
                            <span className="font-black text-slate-900 dark:text-white">{doc.creatinina || doc.structuredData?.creatinina} mg/dL</span>
                          </div>
                        )}
                        {(doc.bun || doc.structuredData?.bun) && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">BUN</span>
                            <span className="font-black text-slate-900 dark:text-white">{doc.bun || doc.structuredData?.bun} mg/dL</span>
                          </div>
                        )}
                        {(doc.alt || doc.structuredData?.alt) && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">ALT / GPT</span>
                            <span className="font-black text-slate-900 dark:text-white">{doc.alt || doc.structuredData?.alt} U/L</span>
                          </div>
                        )}
                        {(doc.fa || doc.structuredData?.fa) && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-sky-700 dark:text-sky-300 block">FA</span>
                            <span className="font-black text-slate-900 dark:text-white">{doc.fa || doc.structuredData?.fa} U/L</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Uroanálisis */}
                    {(doc.structuredData?.densidadUrinaria || doc.densidadUrinaria) && (
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500 font-semibold">Densidad: <strong className="text-slate-900 dark:text-white">{doc.densidadUrinaria || doc.structuredData?.densidadUrinaria}</strong></span>
                        {(doc.phUrinario || doc.structuredData?.phUrinario) && (
                          <span className="text-slate-500 font-semibold">pH: <strong className="text-slate-900 dark:text-white">{doc.phUrinario || doc.structuredData?.phUrinario}</strong></span>
                        )}
                        {(doc.proteinasOrina || doc.structuredData?.proteinasOrina) && (
                          <span className="text-slate-500 font-semibold">Proteínas: <strong className="text-slate-900 dark:text-white">{doc.proteinasOrina || doc.structuredData?.proteinasOrina}</strong></span>
                        )}
                      </div>
                    )}

                    {/* Coprológico */}
                    {(doc.structuredData?.consistenciaHeces || doc.consistenciaHeces || doc.structuredData?.parasitoFecal || doc.parasitoFecal) && (
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        {(doc.consistenciaHeces || doc.structuredData?.consistenciaHeces) && (
                          <span className="text-slate-500">Heces: <strong className="text-slate-900 dark:text-white">{doc.consistenciaHeces || doc.structuredData?.consistenciaHeces}</strong></span>
                        )}
                        {(doc.parasitoFecal || doc.structuredData?.parasitoFecal) && (
                          <span className="text-amber-600 font-bold">Parásito: {doc.parasitoFecal || doc.structuredData?.parasitoFecal}</span>
                        )}
                      </div>
                    )}

                    {/* Imagenología */}
                    {(doc.structuredData?.conclusionDiagnostica || doc.conclusionDiagnostica) && (
                      <div className="text-[11px] text-slate-700 dark:text-slate-200 pt-1">
                        <span className="font-bold text-sky-800 dark:text-sky-300">Conclusión Imagen: </span>
                        <span>{doc.conclusionDiagnostica || doc.structuredData?.conclusionDiagnostica}</span>
                      </div>
                    )}

                    {/* Remisión */}
                    {(doc.structuredData?.diagnosticoPresuntivo || doc.diagnosticoPresuntivo) && (
                      <div className="text-[11px] text-slate-700 dark:text-slate-200 pt-1">
                        <span className="font-bold text-purple-800 dark:text-purple-300">Dx Presuntivo: </span>
                        <span>{doc.diagnosticoPresuntivo || doc.structuredData?.diagnosticoPresuntivo}</span>
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
                    <option value="laboratorio">🩸 Cuadro Hemático / Hemograma</option>
                    <option value="bioquimica">🧪 Bioquímica Clínica / Química Sanguínea</option>
                    <option value="uroanalisis">🧫 Uroanálisis / Parcial de Orina</option>
                    <option value="coprologico">🔬 Coprológico / Coproscópico</option>
                    <option value="ecografia">🩺 Ecografía / Ultrasonido Abdominal</option>
                    <option value="radiografia">🩻 Radiografía / Rayos X</option>
                    <option value="historia_clinica">📋 Historia Clínica / Remisión Externa</option>
                    <option value="otro">📑 Otro Estudio Especializado / Citología</option>
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

              {/* Parámetros Específicos según Tipo de Documento */}
              {formData.documentType === 'laboratorio' && (
                <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-900/60 space-y-2">
                  <span className="font-bold text-sky-900 dark:text-sky-300 text-[11px] block">
                    Valores Hemáticos Relevantes (Opcional - Alimenta qPCR automáticamente):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Hb (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ej. 9.5"
                        value={formData.hemoglobina}
                        onChange={(e) => setFormData({ ...formData, hemoglobina: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Plaquetas (/µL)</label>
                      <input
                        type="number"
                        placeholder="Ej. 140000"
                        value={formData.plaquetas}
                        onChange={(e) => setFormData({ ...formData, plaquetas: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Leucocitos (/µL)</label>
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

              {formData.documentType === 'bioquimica' && (
                <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-2">
                  <span className="font-bold text-purple-900 dark:text-purple-300 text-[11px] block">
                    Parámetros Bioquímicos Cuantitativos (Opcional):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Creatinina (mg/dL)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ej. 1.8"
                        value={formData.creatinina}
                        onChange={(e) => setFormData({ ...formData, creatinina: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">BUN (mg/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ej. 34.5"
                        value={formData.bun}
                        onChange={(e) => setFormData({ ...formData, bun: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">ALT / GPT (U/L)</label>
                      <input
                        type="number"
                        placeholder="Ej. 115"
                        value={formData.alt}
                        onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">FA (U/L)</label>
                      <input
                        type="number"
                        placeholder="Ej. 240"
                        value={formData.fa}
                        onChange={(e) => setFormData({ ...formData, fa: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.documentType === 'uroanalisis' && (
                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-2">
                  <span className="font-bold text-amber-900 dark:text-amber-300 text-[11px] block">
                    Parámetros Urinarios Relevantes:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Densidad Urinaria</label>
                      <input
                        type="text"
                        placeholder="Ej. 1.025"
                        value={formData.densidadUrinaria}
                        onChange={(e) => setFormData({ ...formData, densidadUrinaria: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">pH Urinario</label>
                      <input
                        type="text"
                        placeholder="Ej. 6.5"
                        value={formData.phUrinario}
                        onChange={(e) => setFormData({ ...formData, phUrinario: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Proteínas en Orina</label>
                      <input
                        type="text"
                        placeholder="Ej. Negativo, +, ++"
                        value={formData.proteinasOrina}
                        onChange={(e) => setFormData({ ...formData, proteinasOrina: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.documentType === 'coprologico' && (
                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 text-[11px] block">
                    Parámetros Coprológicos:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Consistencia Fecal</label>
                      <input
                        type="text"
                        placeholder="Ej. Pastosa, Líquida, Normal"
                        value={formData.consistenciaHeces}
                        onChange={(e) => setFormData({ ...formData, consistenciaHeces: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Parásito / Forma Detectada</label>
                      <input
                        type="text"
                        placeholder="Ej. Quistes de Giardia lamblia"
                        value={formData.parasitoFecal}
                        onChange={(e) => setFormData({ ...formData, parasitoFecal: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formData.documentType === 'ecografia' || formData.documentType === 'radiografia') && (
                <div className="p-3.5 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-2xl border border-cyan-200 dark:border-cyan-900/60 space-y-2">
                  <span className="font-bold text-cyan-900 dark:text-cyan-300 text-[11px] block">
                    Datos del Estudio de Imagenología:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Región o Estructura Evaluada</label>
                      <input
                        type="text"
                        placeholder="Ej. Abdomen craneal, Tórax LL y VD"
                        value={formData.regionEvaluada}
                        onChange={(e) => setFormData({ ...formData, regionEvaluada: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Conclusión Diagnóstica de Imagen</label>
                      <input
                        type="text"
                        placeholder="Ej. Hepatomegalia difusa, sin líquido libre"
                        value={formData.conclusionDiagnostica}
                        onChange={(e) => setFormData({ ...formData, conclusionDiagnostica: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.documentType === 'historia_clinica' && (
                <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 text-[11px] block">
                    Datos de la Remisión / Historia Externa:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Diagnóstico Presuntivo de Remisión</label>
                      <input
                        type="text"
                        placeholder="Ej. Sospecha de Hemotrópicos / Ehrlichiosis"
                        value={formData.diagnosticoPresuntivo}
                        onChange={(e) => setFormData({ ...formData, diagnosticoPresuntivo: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">Tratamiento Previo Administrado</label>
                      <input
                        type="text"
                        placeholder="Ej. Doxiciclina 10mg/kg x 7 días"
                        value={formData.tratamientoPrevio}
                        onChange={(e) => setFormData({ ...formData, tratamientoPrevio: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hallazgos Clínicos Dinámicos según el Tipo de Examen Seleccionado */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block">
                    Hallazgos Clínicos Sugeridos ({getDocTypeLabel(formData.documentType)}):
                  </label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    ✨ Opciones dinámicas para este tipo de examen
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 dark:bg-[#1a1338] rounded-2xl border border-slate-200 dark:border-[#2e2358] min-h-[120px] items-center content-start">
                  {(CLINICAL_FINDINGS_BY_TYPE[formData.documentType] || CLINICAL_FINDINGS_BY_TYPE.otro).map((finding) => {
                    const isSelected = formData.keyFindings.includes(finding);
                    return (
                      <button
                        key={finding}
                        type="button"
                        onClick={() => handleToggleFinding(finding)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#6F2BCC] text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
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

                      {/* Parámetros Cuantitativos y Hallazgos Analíticos Extraídos */}
                      {((selectedDoc.hematocrito || selectedDoc.plaquetas || selectedDoc.leucocitos || selectedDoc.hemoglobina) ||
                        (selectedDoc.creatinina || selectedDoc.bun || selectedDoc.alt || selectedDoc.fa || selectedDoc.structuredData?.creatinina) ||
                        (selectedDoc.densidadUrinaria || selectedDoc.phUrinario || selectedDoc.structuredData?.densidadUrinaria) ||
                        (selectedDoc.consistenciaHeces || selectedDoc.parasitoFecal || selectedDoc.structuredData?.consistenciaHeces) ||
                        (selectedDoc.regionEvaluada || selectedDoc.conclusionDiagnostica || selectedDoc.structuredData?.conclusionDiagnostica) ||
                        (selectedDoc.diagnosticoPresuntivo || selectedDoc.tratamientoPrevio || selectedDoc.structuredData?.diagnosticoPresuntivo)) && (
                        <div className="border border-slate-200 dark:border-[#2e2358] rounded-2xl overflow-hidden bg-white dark:bg-[#15102a]">
                          <div className="px-5 py-3 bg-slate-100 dark:bg-[#201844] font-bold text-slate-800 dark:text-slate-200 text-xs border-b border-slate-200 dark:border-[#2e2358] flex items-center justify-between">
                            <span>🧪 Resultados Analíticos & Datos Estructurados del Estudio</span>
                            <span className="text-[11px] font-mono text-slate-500">Categoría: {getDocTypeLabel(selectedDoc.documentType)}</span>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-[#2e2358] text-xs">
                            {/* Hemograma */}
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
                            {(selectedDoc.hemoglobina || selectedDoc.structuredData?.hemoglobina) && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Hemoglobina (Hb)</span>
                                  <p className="text-[11px] text-slate-400">Concentración total en sangre</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                    {selectedDoc.hemoglobina || selectedDoc.structuredData?.hemoglobina} g/dL
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 12.0 - 18.0 g/dL</span>
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

                            {/* Bioquímica */}
                            {(selectedDoc.creatinina || selectedDoc.structuredData?.creatinina) && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Creatinina Sérica</span>
                                  <p className="text-[11px] text-slate-400">Marcador de función renal / TFG</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                    {selectedDoc.creatinina || selectedDoc.structuredData?.creatinina} mg/dL
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 0.5 - 1.5 mg/dL</span>
                                </div>
                              </div>
                            )}
                            {(selectedDoc.bun || selectedDoc.structuredData?.bun) && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Nitrógeno Ureico (BUN)</span>
                                  <p className="text-[11px] text-slate-400">Metabolito de filtración renal</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                    {selectedDoc.bun || selectedDoc.structuredData?.bun} mg/dL
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 7.0 - 27.0 mg/dL</span>
                                </div>
                              </div>
                            )}
                            {(selectedDoc.alt || selectedDoc.structuredData?.alt) && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Alanina Aminotransferasa (ALT/GPT)</span>
                                  <p className="text-[11px] text-slate-400">Enzima de daño celular hepatocelular</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                    {selectedDoc.alt || selectedDoc.structuredData?.alt} U/L
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 10 - 100 U/L</span>
                                </div>
                              </div>
                            )}
                            {(selectedDoc.fa || selectedDoc.structuredData?.fa) && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Fosfatasa Alcalina (FA)</span>
                                  <p className="text-[11px] text-slate-400">Marcador de colestasis hepática</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                    {selectedDoc.fa || selectedDoc.structuredData?.fa} U/L
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: 20 - 150 U/L</span>
                                </div>
                              </div>
                            )}

                            {/* Uroanálisis */}
                            {(selectedDoc.densidadUrinaria || selectedDoc.structuredData?.densidadUrinaria) && (
                              <div className="px-5 py-3 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Densidad Urinaria</span>
                                  <p className="text-[11px] text-slate-400">Capacidad de concentración tubular renal</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                    {selectedDoc.densidadUrinaria || selectedDoc.structuredData?.densidadUrinaria}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Ref: &gt;1.030</span>
                                </div>
                              </div>
                            )}

                            {/* Imagenología */}
                            {(selectedDoc.conclusionDiagnostica || selectedDoc.structuredData?.conclusionDiagnostica) && (
                              <div className="px-5 py-3">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">Conclusión Diagnóstica del Estudio de Imagen</span>
                                <p className="text-xs text-sky-800 dark:text-sky-300 font-semibold mt-1">
                                  {selectedDoc.regionEvaluada ? `[${selectedDoc.regionEvaluada}] ` : ''}
                                  {selectedDoc.conclusionDiagnostica || selectedDoc.structuredData?.conclusionDiagnostica}
                                </p>
                              </div>
                            )}

                            {/* Historia / Remisión */}
                            {(selectedDoc.diagnosticoPresuntivo || selectedDoc.structuredData?.diagnosticoPresuntivo) && (
                              <div className="px-5 py-3">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">Diagnóstico Presuntivo de Remisión Externa</span>
                                <p className="text-xs text-purple-800 dark:text-purple-300 font-semibold mt-1">
                                  {selectedDoc.diagnosticoPresuntivo || selectedDoc.structuredData?.diagnosticoPresuntivo}
                                  {(selectedDoc.tratamientoPrevio || selectedDoc.structuredData?.tratamientoPrevio) && (
                                    <span className="block text-slate-500 font-normal mt-0.5">
                                      Tratamiento administrado: {selectedDoc.tratamientoPrevio || selectedDoc.structuredData?.tratamientoPrevio}
                                    </span>
                                  )}
                                </p>
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Hematología */}
                      {(selectedDoc.hematocrito || selectedDoc.structuredData?.hematocrito) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Hto</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {selectedDoc.hematocrito || selectedDoc.structuredData?.hematocrito}%
                          </span>
                        </div>
                      )}
                      {(selectedDoc.hemoglobina || selectedDoc.structuredData?.hemoglobina) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Hemoglobina</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {selectedDoc.hemoglobina || selectedDoc.structuredData?.hemoglobina} g/dL
                          </span>
                        </div>
                      )}
                      {(selectedDoc.plaquetas || selectedDoc.structuredData?.plaquetas) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Plaquetas</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {(selectedDoc.plaquetas || selectedDoc.structuredData?.plaquetas)?.toLocaleString('es-CO')} /μL
                          </span>
                        </div>
                      )}
                      {(selectedDoc.leucocitos || selectedDoc.structuredData?.leucocitos) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Leucocitos</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {(selectedDoc.leucocitos || selectedDoc.structuredData?.leucocitos)?.toLocaleString('es-CO')} /μL
                          </span>
                        </div>
                      )}

                      {/* Bioquímica */}
                      {(selectedDoc.creatinina || selectedDoc.structuredData?.creatinina) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Creatinina</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {selectedDoc.creatinina || selectedDoc.structuredData?.creatinina} mg/dL
                          </span>
                        </div>
                      )}
                      {(selectedDoc.bun || selectedDoc.structuredData?.bun) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">BUN</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {selectedDoc.bun || selectedDoc.structuredData?.bun} mg/dL
                          </span>
                        </div>
                      )}
                      {(selectedDoc.alt || selectedDoc.structuredData?.alt) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">ALT / GPT</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {selectedDoc.alt || selectedDoc.structuredData?.alt} U/L
                          </span>
                        </div>
                      )}
                      {(selectedDoc.fa || selectedDoc.structuredData?.fa) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">FA</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {selectedDoc.fa || selectedDoc.structuredData?.fa} U/L
                          </span>
                        </div>
                      )}

                      {/* Uroanálisis */}
                      {(selectedDoc.densidadUrinaria || selectedDoc.structuredData?.densidadUrinaria) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Densidad Urinaria</span>
                          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                            {selectedDoc.densidadUrinaria || selectedDoc.structuredData?.densidadUrinaria}
                          </span>
                        </div>
                      )}

                      {/* Coprológico */}
                      {(selectedDoc.consistenciaHeces || selectedDoc.structuredData?.consistenciaHeces) && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Consistencia Fecal</span>
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedDoc.consistenciaHeces || selectedDoc.structuredData?.consistenciaHeces}
                          </span>
                        </div>
                      )}

                      {/* Imagen / Remisión */}
                      {(selectedDoc.conclusionDiagnostica || selectedDoc.structuredData?.conclusionDiagnostica) && (
                        <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Conclusión Imagen</span>
                          <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
                            {selectedDoc.conclusionDiagnostica || selectedDoc.structuredData?.conclusionDiagnostica}
                          </span>
                        </div>
                      )}
                      {(selectedDoc.diagnosticoPresuntivo || selectedDoc.structuredData?.diagnosticoPresuntivo) && (
                        <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-[#15102a] border border-slate-200 dark:border-[#2e2358]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Diagnóstico Presuntivo</span>
                          <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                            {selectedDoc.diagnosticoPresuntivo || selectedDoc.structuredData?.diagnosticoPresuntivo}
                          </span>
                        </div>
                      )}
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
