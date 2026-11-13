import React, { useState, useEffect, useMemo } from 'react';
import { CLINICAL_EXAMS, CLINICAL_CATEGORIES } from '../data/clinicalCatalogData.js';

// Lista oficial de sintomatología según formulario OSD
const SYMPTOMS_OPTIONS = [
  'Anemia',
  'Mucosas pálidas',
  'Mucosas ictéricas',
  'Fiebre',
  'Linfadenopatia generalizada',
  'Hepatomegalia',
  'Esplenomegalia',
  'Anorexia',
  'Trombocitopenia',
  'Decaimiento',
];

// Tipos oficiales de muestra biológica y tubos según formulario OSD
const SAMPLE_TYPE_OPTIONS = [
  { id: 'lila', label: 'Sangre en tubo tapa lila', icon: '🩸', desc: 'EDTA - Hematología, cuadro hemático y frotis' },
  { id: 'lcr', label: 'Líquido céfaloraquideo', icon: '💧', desc: 'LCR en tubo estéril para citoquímico / cultivo' },
  { id: 'fecal', label: 'Materia fecal', icon: '💩', desc: 'Recipiente coprológico estéril' },
  { id: 'orina', label: 'Orina', icon: '🧪', desc: 'Frasco estéril para uroanálisis y sedimento' },
  { id: 'tejido', label: 'Tejido', icon: '🔬', desc: 'Biopsia / Fragmento en formol bufferado al 10%' },
  { id: 'roja', label: 'Sangre en tubo tapa roja', icon: '🔴', desc: 'Sin anticoagulante / Suero para química y serología' },
  { id: 'verde', label: 'Sangre en tubo tapa verde', icon: '🟢', desc: 'Heparina de litio / sodio' },
  { id: 'azul', label: 'Sangre en tubo tapa azul', icon: '🔵', desc: 'Citrato de sodio 3.2% - Coagulación (PT, PTT, Fibrinógeno)' },
];

// Antecedentes patológicos oficiales según formulario OSD
const ANTECEDENTS_OPTIONS = [
  'Enfermedad Renal',
  'Enfermedad Hepática',
  'Diabetes',
  'Enfermedad Hormonal',
  'Enfermedad Gastrointertinal Crónica',
  'Anemia',
];

// Métodos oficiales de pago según formulario OSD
const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', desc: 'Pago contra entrega en el momento de la recolección' },
  { id: 'transferencia', label: 'Transferencia', desc: 'Transferencia bancaria previa o contra entrega' },
  { id: 'boton_pago', label: 'Botón de pago (PSE, Tarjeta débito o crédito)', desc: 'Pasarela digital de pagos seguros' },
  { id: 'datafono', label: 'Dátafono físico', desc: 'Pago con tarjeta al mensajero en la recolección' },
  { id: 'credito', label: 'Crédito', desc: 'Aplica solo para empresas con crédito comercial aprobado por OSD (+57 3005143727)' },
];

export default function ClinicalOrderForm({
  activePatient,
  patients = [],
  initialClinicalExam = null,
  onSelectPatient,
  onSubmitOrder,
  isSubmitting,
  onClose,
  isModal = false,
}) {
  // Pestañas / Pasos de navegación simplificados (2 pasos limpios y ágiles)
  // 1: muestra_antecedentes | 2: pruebas_pago
  const [activeStep, setActiveStep] = useState(1);

  // ============================================================================
  // PACIENTE SELECCIONADO & BARRA DE BÚSQUEDA
  // ============================================================================
  const [selectedPatientObj, setSelectedPatientObj] = useState(activePatient || null);
  const [patientFilterSearch, setPatientFilterSearch] = useState('');
  const [patientSpeciesFilter, setPatientSpeciesFilter] = useState('all');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  // ============================================================================
  // SECCIÓN 1: MUESTRA, EVALUACIÓN CLÍNICA & ANTECEDENTES
  // NADA PREMARCADO: El veterinario debe seleccionar cada opción
  // ============================================================================
  // 1.1 Cobertura VetPlus (ÚNICA aseguradora vinculada)
  const [isVetPlusInsured, setIsVetPlusInsured] = useState(() => {
    if (activePatient?.owner?.hasVetPlus || activePatient?.hasVetPlus) return 'Sí';
    return ''; // Nada premarcado
  });
  const [vetPlusAuthCode, setVetPlusAuthCode] = useState(() => {
    return activePatient?.owner?.vetPlusCode || activePatient?.vetPlusCode || '';
  });

  // 1.2 Estado Sintomático o Asintomático
  const [isSymptomatic, setIsSymptomatic] = useState(''); // '' (nada premarcado) | 'Sintomático' | 'Asintomático'
  const [selectedSymptoms, setSelectedSymptoms] = useState([]); // nada premarcado
  const [otherSymptomText, setOtherSymptomText] = useState('');
  const [isOtherSymptomChecked, setIsOtherSymptomChecked] = useState(false);

  // 1.3 Fecha de Toma y Tipos de Muestra Biológica
  const [sampleCollectionDate, setSampleCollectionDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedSampleTypes, setSelectedSampleTypes] = useState([]); // Array vacío por defecto
  const [otherSampleTypeText, setOtherSampleTypeText] = useState('');
  const [isOtherSampleTypeChecked, setIsOtherSampleTypeChecked] = useState(false);

  // 1.4 Antecedentes Patológicos
  const [selectedAntecedents, setSelectedAntecedents] = useState([]); // Array vacío por defecto
  const [otherAntecedentText, setOtherAntecedentText] = useState('');
  const [isOtherAntecedentChecked, setIsOtherAntecedentChecked] = useState(false);

  // 1.5 Tratamiento Actual
  const [isInTreatment, setIsInTreatment] = useState(''); // '' (nada premarcado) | 'Sí' | 'No'
  const [treatmentDetails, setTreatmentDetails] = useState('');

  // ============================================================================
  // SECCIÓN 2: PRUEBAS DIAGNÓSTICAS, CÓDIGO VETPLUS Y MÉTODO DE PAGO
  // NADA PREMARCADO
  // ============================================================================
  const [selectedCatalogExams, setSelectedCatalogExams] = useState(() => {
    return initialClinicalExam ? [initialClinicalExam] : [];
  });
  const [customTestNameInput, setCustomTestNameInput] = useState('');
  const [examVetPlusCodes, setExamVetPlusCodes] = useState({}); // { [examId]: { hasVetPlus: boolean, code: string } }
  const [paymentMethod, setPaymentMethod] = useState(''); // '' (nada premarcado)
  const [observations, setObservations] = useState('');

  // Resaltado visual en rojo de campos requeridos (sin alertas de texto largas)
  const [missingFieldIds, setMissingFieldIds] = useState([]);
  const clearMissingField = (fieldId) => {
    setMissingFieldIds((prev) => prev.filter((id) => id !== fieldId));
  };

  const scrollToField = (fieldId) => {
    if (!fieldId) return;
    const el = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') {
        el.focus();
      } else {
        const firstFocusable = el.querySelector('button, input, select, textarea');
        if (firstFocusable && typeof firstFocusable.focus === 'function') {
          firstFocusable.focus();
        }
      }
    }
  };

  // Estados del Buscador & Filtro Inteligente de Exámenes Clínicos
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examCategoryFilter, setExamCategoryFilter] = useState('all');
  const [examMatrixFilter, setExamMatrixFilter] = useState('all');
  const [examQuickFilterTag, setExamQuickFilterTag] = useState('all');

  // ============================================================================
  // SINCRONIZACIÓN Y SELECCIÓN DE PACIENTE
  // ============================================================================
  const handleApplyPatient = (patient) => {
    if (!patient) return;
    setSelectedPatientObj(patient);
    clearMissingField('patient-selection-section');

    if (patient.owner?.hasVetPlus || patient.hasVetPlus) {
      setIsVetPlusInsured('Sí');
      setVetPlusAuthCode(patient.owner?.vetPlusCode || patient.vetPlusCode || '');
    }

    setPatientFilterSearch('');
    setIsPatientDropdownOpen(false);

    if (onSelectPatient) {
      onSelectPatient(patient.id);
    }
  };

  const handleClearSelectedPatient = () => {
    setSelectedPatientObj(null);
    setPatientFilterSearch('');
    if (onSelectPatient) {
      onSelectPatient(null);
    }
  };

  useEffect(() => {
    if (activePatient && (!selectedPatientObj || selectedPatientObj.id !== activePatient.id)) {
      handleApplyPatient(activePatient);
    }
  }, [activePatient]);

  // Lista de pacientes filtrados para el selector obligatorio de paciente
  const filteredPatientsList = useMemo(() => {
    let list = patients || [];

    if (patientSpeciesFilter === 'canino') {
      list = list.filter((p) => p.species?.toLowerCase().includes('canin') || (!p.species?.toLowerCase().includes('felin')));
    } else if (patientSpeciesFilter === 'felino') {
      list = list.filter((p) => p.species?.toLowerCase().includes('felin'));
    } else if (patientSpeciesFilter === 'vetplus') {
      list = list.filter((p) => Boolean(p.owner?.hasVetPlus || p.hasVetPlus));
    }

    if (!patientFilterSearch.trim()) return list;
    const q = patientFilterSearch.toLowerCase().trim();
    return list.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchId = p.id?.toLowerCase().includes(q);
      const matchBreed = p.breed?.toLowerCase().includes(q);
      const matchSpecies = p.species?.toLowerCase().includes(q);
      const matchOwner = p.owner?.name?.toLowerCase().includes(q) || p.owner?.firstName?.toLowerCase().includes(q);
      const matchPhone = p.owner?.phone?.toLowerCase().includes(q);
      return matchName || matchId || matchBreed || matchSpecies || matchOwner || matchPhone;
    });
  }, [patients, patientFilterSearch, patientSpeciesFilter]);

  // ============================================================================
  // FILTRADO INTELIGENTE DE EXÁMENES CLÍNICOS (Portafolio 223 pruebas)
  // Permite buscar por analito, nombre, CUPS, tubo y áreas diagnósticas
  // ============================================================================
  const filteredClinicalExams = useMemo(() => {
    let list = CLINICAL_EXAMS;

    // 1. Filtro por categoría diagnóstica
    if (examCategoryFilter !== 'all') {
      list = list.filter(
        (e) => e.categoria.toLowerCase() === examCategoryFilter.toLowerCase()
      );
    }

    // 2. Filtro rápido por chips de especialidad
    if (examQuickFilterTag === 'frecuentes') {
      const topKeywords = ['hemograma', 'creatinina', 'alt', 'parcial de orina', 'coprológico', 'perfil bioquímico', 'glucosa', 'urea', 't4', 'fosfatasa'];
      list = list.filter((e) =>
        topKeywords.some((term) => e.nombre.toLowerCase().includes(term))
      );
    } else if (examQuickFilterTag === 'hemogramas') {
      list = list.filter((e) =>
        e.nombre.toLowerCase().includes('hemograma') ||
        e.nombre.toLowerCase().includes('cuadro hemático') ||
        e.categoria.toLowerCase().includes('hematolog')
      );
    } else if (examQuickFilterTag === 'bioquimica') {
      list = list.filter((e) =>
        e.categoria.toLowerCase().includes('bioquímica') ||
        e.nombre.toLowerCase().includes('perfil') ||
        e.nombre.toLowerCase().includes('química')
      );
    } else if (examQuickFilterTag === 'orina') {
      list = list.filter((e) =>
        e.nombre.toLowerCase().includes('orina') ||
        (e.muestra && e.muestra.toLowerCase().includes('orina')) ||
        e.categoria.toLowerCase().includes('uroan')
      );
    } else if (examQuickFilterTag === 'heces') {
      list = list.filter((e) =>
        e.nombre.toLowerCase().includes('fecal') ||
        e.nombre.toLowerCase().includes('copro') ||
        (e.muestra && e.muestra.toLowerCase().includes('fecal'))
      );
    } else if (examQuickFilterTag === 'hormonas') {
      list = list.filter((e) =>
        e.categoria.toLowerCase().includes('hormona') ||
        e.nombre.toLowerCase().includes('t4') ||
        e.nombre.toLowerCase().includes('cortisol') ||
        e.nombre.toLowerCase().includes('progesterona')
      );
    } else if (examQuickFilterTag === 'citologia') {
      list = list.filter((e) =>
        e.categoria.toLowerCase().includes('citolog') ||
        e.nombre.toLowerCase().includes('biopsia') ||
        e.nombre.toLowerCase().includes('histopatolog')
      );
    } else if (examQuickFilterTag === 'infecciosas') {
      list = list.filter((e) =>
        e.categoria.toLowerCase().includes('infeccios') ||
        e.categoria.toLowerCase().includes('microbiolog') ||
        e.nombre.toLowerCase().includes('snap') ||
        e.nombre.toLowerCase().includes('felv') ||
        e.nombre.toLowerCase().includes('fiv') ||
        e.nombre.toLowerCase().includes('parvovirus')
      );
    }

    // 3. Filtro por matriz biológica de muestra
    if (examMatrixFilter !== 'all') {
      const qMat = examMatrixFilter.toLowerCase();
      list = list.filter((e) =>
        (e.muestra || e.matrizMuestra || '').toLowerCase().includes(qMat)
      );
    }

    // 4. Búsqueda libre en texto (nombre, CUPS, matriz, observaciones)
    if (examSearchQuery.trim()) {
      const q = examSearchQuery.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          e.categoria.toLowerCase().includes(q) ||
          (e.cups && e.cups.toLowerCase().includes(q)) ||
          (e.muestra && e.muestra.toLowerCase().includes(q)) ||
          (e.observaciones && e.observaciones.toLowerCase().includes(q))
      );
    }

    return list;
  }, [examCategoryFilter, examQuickFilterTag, examMatrixFilter, examSearchQuery]);

  // Manejadores para síntomas
  const handleToggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  // Manejadores para tipo de muestra
  const handleToggleSampleType = (sampleLabel) => {
    setSelectedSampleTypes((prev) =>
      prev.includes(sampleLabel)
        ? prev.filter((s) => s !== sampleLabel)
        : [...prev, sampleLabel]
    );
  };

  // Manejadores para antecedentes
  const handleToggleAntecedent = (ant) => {
    setSelectedAntecedents((prev) =>
      prev.includes(ant) ? prev.filter((a) => a !== ant) : [...prev, ant]
    );
  };

  // Agregar / Quitar prueba del portafolio oficial
  const handleToggleCatalogExam = (exam) => {
    if (selectedCatalogExams.some((e) => e.id === exam.id)) {
      setSelectedCatalogExams((prev) => prev.filter((e) => e.id !== exam.id));
    } else {
      setSelectedCatalogExams((prev) => [...prev, exam]);
    }
  };

  const handleRemoveCatalogExam = (examId) => {
    setSelectedCatalogExams((prev) => prev.filter((e) => e.id !== examId));
  };

  // Total acumulado de pruebas seleccionadas
  const totalCatalogPrice = useMemo(() => {
    return selectedCatalogExams.reduce((sum, e) => sum + (e.precio || e.precioIva || 0), 0);
  }, [selectedCatalogExams]);

  // ============================================================================
  // VALIDACIÓN Y ENVÍO OFICIAL DE LA ORDEN
  // ============================================================================
  const validateStep1 = () => {
    const missing = [];
    if (!selectedPatientObj && !activePatient) {
      missing.push('patient-selection-section');
    }
    if (!isVetPlusInsured) {
      missing.push('vetplus-insurance-section');
    } else if (isVetPlusInsured === 'Sí' && !vetPlusAuthCode.trim()) {
      missing.push('vetplus-auth-code-input');
    }
    if (!isSymptomatic) {
      missing.push('symptomatic-status-section');
    } else if (isSymptomatic === 'Sintomático' && selectedSymptoms.length === 0 && (!isOtherSymptomChecked || !otherSymptomText.trim())) {
      missing.push('symptoms-list-section');
    }
    if (selectedSampleTypes.length === 0 && (!isOtherSampleTypeChecked || !otherSampleTypeText.trim())) {
      missing.push('sample-types-section');
    }
    if (!isInTreatment) {
      missing.push('treatment-status-section');
    } else if (isInTreatment === 'Sí' && !treatmentDetails.trim()) {
      missing.push('treatment-details-input');
    }

    if (missing.length > 0) {
      setMissingFieldIds(missing);
      setActiveStep(1);
      scrollToField(missing[0]);
      return false;
    }

    setMissingFieldIds([]);
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validar primero Paso 1
    if (!validateStep1()) {
      return;
    }

    // Validación de Pruebas y Método de Pago (Paso 2)
    const missingStep2 = [];
    if (selectedCatalogExams.length === 0 && !customTestNameInput.trim()) {
      missingStep2.push('catalog-exams-section');
    }
    if (!paymentMethod) {
      missingStep2.push('payment-method-section');
    }
    if (missingStep2.length > 0) {
      setMissingFieldIds(missingStep2);
      setActiveStep(2);
      scrollToField(missingStep2[0]);
      return;
    }

    setMissingFieldIds([]);

    // Construcción de arrays complementarios
    const finalSymptoms = [...selectedSymptoms];
    if (isOtherSymptomChecked && otherSymptomText.trim()) {
      finalSymptoms.push(`Otro: ${otherSymptomText.trim()}`);
    }

    const finalSampleTypes = [...selectedSampleTypes];
    if (isOtherSampleTypeChecked && otherSampleTypeText.trim()) {
      finalSampleTypes.push(`Otro: ${otherSampleTypeText.trim()}`);
    }

    const finalAntecedents = [...selectedAntecedents];
    if (isOtherAntecedentChecked && otherAntecedentText.trim()) {
      finalAntecedents.push(`Otro: ${otherAntecedentText.trim()}`);
    }

    const finalExamsList = selectedCatalogExams.map((e) => ({
      id: e.id,
      name: e.nombre,
      categoria: e.categoria,
      cups: e.cups || null,
      sampleMatrix: e.matrizMuestra || e.muestra || 'Sangre total / Suero',
      deliveryTime: e.tiempoEntrega || e.tiempoResultado || '24h',
      price: e.precio || e.precioIva || 0,
      hasVetPlus: isVetPlusInsured === 'Sí' || Boolean(examVetPlusCodes[e.id]?.hasVetPlus),
      vetPlusCode: (isVetPlusInsured === 'Sí' ? vetPlusAuthCode.trim() : null) || examVetPlusCodes[e.id]?.code || '',
    }));

    const patientRecord = selectedPatientObj || activePatient || {};

    const payload = {
      orderType: 'clinicas',
      orderCategory: 'clinicas',
      createdAt: new Date().toISOString(),
      // Cobertura VetPlus
      insuranceInfo: {
        hasVetPlus: isVetPlusInsured === 'Sí',
        isInsured: isVetPlusInsured === 'Sí',
        company: isVetPlusInsured === 'Sí' ? 'VetPlus' : 'Particular / Sin VetPlus',
        vetPlusAuthCode: isVetPlusInsured === 'Sí' ? vetPlusAuthCode.trim() : null,
      },
      // Datos de Facturación (Gestionados internamente en la herramienta)
      billingCompany: {
        nitOrCedula: '901458789',
        taxId: '901458789',
        clinicOrVetName: 'Clínica Veterinaria On Site Diagnostic / Dr. Alejandro Morales',
        solicitingVetName: patientRecord.attendingVet || 'Dr. Alejandro Morales',
        professionalCardNumber: 'COMV-34589',
        vetLicense: 'COMV-34589',
        contactPhone: patientRecord.owner?.phone || '310 456 7890',
        resultsReportEmail: patientRecord.owner?.email || 'resultados.clinicas@osdiagnostic.com',
        reportEmail: patientRecord.owner?.email || 'resultados.clinicas@osdiagnostic.com',
        billingEmailAndPhone: 'facturacion@osdiagnostic.com - Tel: 300 514 3626',
        billingEmail: 'facturacion@osdiagnostic.com',
        billingPhone: '300 514 3626',
        collectionAddress: patientRecord.owner?.address || 'Cra 80 # 45-12, Consultorio 204, Bogotá',
      },
      // Datos del Paciente (Traídos directamente de la ficha del paciente seleccionado)
      patientData: {
        id: patientRecord.id || `PAT-${Date.now().toString().slice(-5)}`,
        name: patientRecord.name || 'Paciente Clínicas',
        species: patientRecord.species || 'Canino',
        sex: patientRecord.sex || patientRecord.gender || 'Macho',
        age: patientRecord.age ? `${patientRecord.age} años` : '3 años',
        breed: patientRecord.breed || 'Mestizo',
        ownerName: patientRecord.owner?.name || patientRecord.owner?.firstName || 'Tutor',
        sampleCollectionDate,
        isSymptomatic: isSymptomatic === 'Sintomático',
        symptoms: isSymptomatic === 'Sintomático' ? finalSymptoms : [],
      },
      // Muestras, Antecedentes y Tratamiento
      sampleAndClinicalData: {
        sampleTypes: finalSampleTypes,
        antecedents: finalAntecedents,
        medicalHistory: finalAntecedents,
        underTreatment: isInTreatment === 'Sí' ? 'si' : 'no',
        isInTreatment: isInTreatment === 'Sí',
        treatmentDetails: isInTreatment === 'Sí' ? treatmentDetails.trim() : null,
      },
      // Pruebas Diagnósticas y Pago
      testDetails: {
        catalogExams: finalExamsList,
        customTestName: customTestNameInput.trim() || null,
        totalPrice: totalCatalogPrice,
        paymentMethod: PAYMENT_METHODS.find((pm) => pm.id === paymentMethod)?.label || paymentMethod,
        observations: observations.trim() || null,
      },
    };

    if (onSubmitOrder) {
      onSubmitOrder(payload);
    }
  };

  return (
    <div id="clinical-order-container" className="space-y-6 font-body">


      {!selectedPatientObj ? (
        /* ==================================================================== */
        /* VISTA OBLIGATORIA: SELECCIÓN DE PACIENTE INICIAL                     */
        /* ==================================================================== */
        <>
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-teal-500/20">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/10 rounded-full text-xs font-bold text-teal-300 border border-white/10">
                <span>🔬 Portafolio Clínico OSD 2026</span>
                <span>·</span>
                <span>223 Pruebas Diagnósticas</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Solicitud Oficial de Exámenes de Laboratorio Clínico
              </h2>
              <p className="text-xs text-teal-100 max-w-xl leading-relaxed">
                Para ingresar la información médica, muestras y pruebas solicitadas, es obligatorio seleccionar primero al paciente registrado.
              </p>
            </div>

            <div className="bg-amber-500/20 border border-amber-400/40 px-3.5 py-2 rounded-2xl text-xs text-amber-200 flex items-center gap-2 shrink-0">
              <span className="text-base">⚠️</span>
              <span className="font-extrabold uppercase tracking-wide">Paso Obligatorio: Seleccionar Paciente</span>
            </div>
          </div>

          {/* TARJETA PRINCIPAL OBLIGATORIA DE BÚSQUEDA Y SELECCIÓN DE PACIENTE */}
          <div id="patient-selection-section" className={`bg-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-200 transition-all ${missingFieldIds.includes('patient-selection-section') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border-2 border-teal-500/40'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  🐾
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 mb-1">
                    <span>⚠️</span>
                    <span>Paso 1 Obligatorio</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Seleccione el Paciente para la Solicitud Clínica
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Debe escoger al paciente registrado antes de poder registrar las muestras, antecedentes y pruebas del portafolio.
                  </p>
                </div>
              </div>
            </div>

            {/* Buscador de Pacientes y Filtros Rápidos */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={patientFilterSearch}
                  onChange={(e) => setPatientFilterSearch(e.target.value)}
                  placeholder="Buscar paciente por nombre, ID (PAC-...), raza, especie o tutor..."
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 focus:bg-white transition-all shadow-inner"
                  autoFocus
                />
                <span className="absolute left-4 top-3.5 text-base text-slate-400">🔍</span>
                {patientFilterSearch && (
                  <button
                    type="button"
                    onClick={() => setPatientFilterSearch('')}
                    className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold bg-slate-200 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Chips de filtro por especie y seguro */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Filtrar por:</span>
                {[
                  { id: 'all', label: `Todos (${patients.length})` },
                  { id: 'canino', label: '🐶 Caninos' },
                  { id: 'felino', label: '🐱 Felinos' },
                  { id: 'vetplus', label: '🛡️ Con VetPlus' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setPatientSpeciesFilter(chip.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      patientSpeciesFilter === chip.id
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Tarjetas de Pacientes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>Pacientes disponibles ({filteredPatientsList.length})</span>
                <span className="text-[11px] text-teal-700 font-bold">Haga clic sobre un paciente para seleccionarlo</span>
              </div>

              {filteredPatientsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <span className="text-3xl block">🔍</span>
                  <h4 className="text-xs font-bold text-slate-700">No se encontraron pacientes coincidentes</h4>
                  <p className="text-[11px] text-slate-400">
                    No hay ningún paciente registrado que coincida con "{patientFilterSearch}".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientFilterSearch('');
                      setPatientSpeciesFilter('all');
                    }}
                    className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    Limpiar búsqueda y ver todos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredPatientsList.map((p) => {
                    const isCat = p.species?.toLowerCase().includes('felin');
                    const avatar = p.avatar || (isCat ? '🐱' : '🐶');
                    const hasVP = Boolean(p.owner?.hasVetPlus || p.hasVetPlus);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleApplyPatient(p)}
                        className="p-3.5 bg-slate-50/80 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-400 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-2xs hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                            {avatar}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-teal-950 truncate">
                                {p.name}
                              </span>
                              <span className="font-mono text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                                {p.id}
                              </span>
                              {hasVP && (
                                <span className="text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded-full">
                                  🛡️ VetPlus
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                              <span className="font-medium text-teal-800">{p.species}</span> · {p.breed || 'Mestizo'} · {p.age ? `${p.age} años` : 'Edad N/D'} · {p.sex || p.gender || 'Macho'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              👤 Tutor: <span className="text-slate-600 font-medium">{p.owner?.name || p.owner?.firstName || 'Sin tutor'}</span> {p.owner?.phone ? `· 📞 ${p.owner.phone}` : ''}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPatient(p);
                          }}
                          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer group-hover:shadow-sm"
                        >
                          <span>Seleccionar</span>
                          <span>→</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ==================================================================== */
        /* VISTA DESBLOQUEADA: FORMULARIO COMPLETO CON PACIENTE SELECCIONADO    */
        /* ==================================================================== */
        <>
          {/* 1. ENCABEZADO CON RESUMEN DEL PACIENTE VINCULADO */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-teal-500/20">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/10 rounded-full text-xs font-bold text-teal-300 border border-white/10">
                <span>🔬 Portafolio Clínico OSD 2026</span>
                <span>·</span>
                <span>223 Pruebas Diagnósticas</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Solicitud Oficial de Exámenes de Laboratorio Clínico
              </h2>
              <p className="text-xs text-teal-100 max-w-xl leading-relaxed">
                Diligencie la información de muestras, antecedentes y pruebas solicitadas. Los datos de facturación se integran automáticamente.
              </p>
            </div>

            {/* Resumen del paciente vinculado */}
            <div className="bg-white/15 backdrop-blur-md border border-white/30 p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
              <span className="text-3xl">
                {selectedPatientObj.avatar || (selectedPatientObj.species?.toLowerCase().includes('felin') ? '🐱' : '🐶')}
              </span>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm">{selectedPatientObj.name}</span>
                  <span className="font-mono text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-bold">
                    {selectedPatientObj.id}
                  </span>
                  {(selectedPatientObj.owner?.hasVetPlus || selectedPatientObj.hasVetPlus) && (
                    <span className="text-[10px] font-black bg-purple-400/30 text-purple-200 border border-purple-300/40 px-1.5 py-0.2 rounded-full">
                      🛡️ VetPlus
                    </span>
                  )}
                </div>
                <div className="text-teal-200 mt-0.5">
                  {selectedPatientObj.species} · {selectedPatientObj.breed || 'Mestizo'} · {selectedPatientObj.age ? `${selectedPatientObj.age} años` : ''} · {selectedPatientObj.sex || selectedPatientObj.gender || 'Macho'}
                </div>
                <div className="text-teal-300/80 text-[10px] mt-0.5">
                  Tutor: {selectedPatientObj.owner?.name || selectedPatientObj.owner?.firstName || 'Registrado'} {selectedPatientObj.owner?.phone ? `(${selectedPatientObj.owner.phone})` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSelectedPatient}
                className="text-xs bg-rose-500/20 hover:bg-rose-500/40 border border-rose-300/30 text-rose-100 hover:text-white px-2.5 py-1.5 rounded-xl ml-2 font-bold cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                title="Cambiar paciente"
              >
                <span>↺</span>
                <span>Cambiar</span>
              </button>
            </div>
          </div>

          {/* 2. NAVEGACIÓN ENTRE LOS 2 PASOS ÁGILES DEL FORMULARIO */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs pb-1">
            {[
              { id: 1, label: '1. Muestra & Antecedentes Clínicos', icon: '🧪' },
              { id: 2, label: '2. Pruebas Diagnósticas & Pago', icon: '💳' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 2 && !validateStep1()) {
                    return;
                  }
                  setActiveStep(tab.id);
                }}
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeStep === tab.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* ================================================================== */}
        {/* PASO 1: MUESTRAS, VETPLUS, EVALUACIÓN CLÍNICA Y ANTECEDENTES       */}
        {/* ================================================================== */}
        {activeStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
            
            {/* 1.1 ASEGURADORA VETPLUS (ÚNICA VINCULACIÓN) */}
            <div
              id="vetplus-insurance-section"
              className={`rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs transition-all ${
                missingFieldIds.includes('vetplus-insurance-section')
                  ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10'
                  : 'bg-gradient-to-r from-teal-50/80 to-purple-50/40 border-2 border-teal-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-teal-950 uppercase tracking-wider flex items-center gap-2 flex-wrap">
                      <span>¿El paciente está asegurado con VetPlus? *</span>
                    </h4>
                    <p className="text-[11px] text-teal-800 mt-0.5">
                      Indique si la mascota cuenta con cobertura activa del seguro VetPlus para aplicar convenio directo.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-200 text-teal-900 shrink-0">
                  {isVetPlusInsured ? (isVetPlusInsured === 'Sí' ? 'Con VetPlus' : 'Sin VetPlus') : 'Seleccione una opción'}
                </span>
              </div>

              {/* Botones Sí / No (NADA PREMARCADO) */}
              <div className="grid grid-cols-2 gap-3">
                {['Sí', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setIsVetPlusInsured(opt);
                      if (opt === 'No') setVetPlusAuthCode('');
                      clearMissingField('vetplus-insurance-section');
                    }}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isVetPlusInsured === opt
                        ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt === 'Sí' ? '🛡️ Sí, asegurado con VetPlus' : '👤 No, particular'}</span>
                    <span className="text-sm">{isVetPlusInsured === opt ? '✓' : '○'}</span>
                  </button>
                ))}
              </div>

              {/* Si Sí, pedir código de autorización del examen */}
              {isVetPlusInsured === 'Sí' && (
                <div className="pt-2 animate-in fade-in duration-150 space-y-2">
                  <label className="text-xs font-bold text-teal-950 flex items-center gap-1">
                    <span>Código de autorización del examen VetPlus:</span>
                    <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    id="vetplus-auth-code-input"
                    type="text"
                    required
                    value={vetPlusAuthCode}
                    onChange={(e) => setVetPlusAuthCode(e.target.value)}
                    placeholder="Ej. VP-98421, AUT-8842-CLN..."
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-teal-400 rounded-xl text-xs font-mono font-bold text-teal-950 focus:ring-2 focus:ring-teal-600 focus:outline-none shadow-xs"
                  />
                  <div className="p-3 bg-teal-100/70 dark:bg-teal-950/40 rounded-xl border border-teal-300 dark:border-teal-700 text-[11px] text-teal-950 dark:text-teal-200 flex items-center gap-2">
                    <span>💡</span>
                    <span><strong>Anotación VetPlus:</strong> Ingrese el código de autorización emitido por la aseguradora para exonerar o liquidar el copago según la póliza.</span>
                  </div>
                </div>
              )}
            </div>

            {/* 1.2 EVALUACIÓN CLÍNICA: ¿SINTOMÁTICO O ASINTOMÁTICO? */}
            <div
              id="symptomatic-status-section"
              className={`space-y-3 pt-2 border-t border-slate-100 rounded-2xl p-2.5 transition-all ${
                missingFieldIds.includes('symptomatic-status-section')
                  ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10'
                  : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    ¿El paciente se encuentra Sintomático o Asintomático? *
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSymptomatic('Asintomático');
                      setSelectedSymptoms([]);
                      setIsOtherSymptomChecked(false);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSymptomatic === 'Asintomático'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>🌿</span>
                    <span>Asintomático (Chequeo preventivo / Control)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSymptomatic('Sintomático');
                      clearMissingField('symptomatic-status-section');
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSymptomatic === 'Sintomático'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>⚠️</span>
                    <span>Sintomático (Presenta cuadro clínico)</span>
                  </button>
                </div>
              </div>

              {/* Checklist oficial de sintomatología si es Sintomático */}
              {isSymptomatic === 'Sintomático' && (
                <div
                  id="symptoms-list-section"
                  className={`space-y-3 pt-2 animate-in fade-in duration-200 rounded-2xl p-2.5 transition-all ${
                    missingFieldIds.includes('symptoms-list-section')
                      ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Seleccione la sintomatología observada: *
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SYMPTOMS_OPTIONS.map((sym) => {
                      const isChecked = selectedSymptoms.includes(sym);
                      return (
                        <label
                          key={sym}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                            isChecked
                              ? 'bg-teal-50 text-teal-900 border-teal-500 ring-1 ring-teal-500 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              handleToggleSymptom(sym);
                              clearMissingField('symptoms-list-section');
                            }}
                            className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                          />
                          <span>{sym}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Opción Otro síntoma */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={isOtherSymptomChecked}
                        onChange={(e) => setIsOtherSymptomChecked(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                      />
                      <span>Otro síntoma:</span>
                    </label>
                    {isOtherSymptomChecked && (
                      <input
                        type="text"
                        value={otherSymptomText}
                        onChange={(e) => setOtherSymptomText(e.target.value)}
                        placeholder="Especifique otro síntoma observado..."
                        className="flex-1 px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 1.3 FECHA DE TOMA Y TIPO DE MUESTRA BIOLÓGICA */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>Fecha de la toma de la muestra</span>
                    <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={sampleCollectionDate}
                    onChange={(e) => setSampleCollectionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                {/* Anotación destacada de rotulado */}
                <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-sky-500/5 dark:from-teal-950/40 dark:via-teal-900/30 dark:to-sky-950/20 border-l-4 border-l-teal-600 dark:border-l-teal-400 border border-teal-500/30 dark:border-teal-500/40 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-800 dark:text-teal-200 flex items-center justify-center text-sm shrink-0 font-bold border border-teal-500/30">
                    🏷️
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-900 dark:text-teal-200 border border-teal-500/30">
                        Anotación Importante · Rotulado
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                      Rotule cada tubo con el nombre exacto (<strong className="text-teal-800 dark:text-teal-300 font-black">{selectedPatientObj?.name || 'Mascota'}</strong>) y la fecha de toma (<strong className="text-slate-900 dark:text-white font-bold">{sampleCollectionDate || 'Hoy'}</strong>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector de Tubos / Tipos de Muestra (NADA PREMARCADO) */}
              <div
                id="sample-types-section"
                className={`space-y-2 pt-1 rounded-2xl p-2.5 transition-all ${
                  missingFieldIds.includes('sample-types-section')
                    ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    Tipo de Muestra / Tubo Requerido *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-teal-700">
                      {selectedSampleTypes.length} seleccionada(s)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SAMPLE_TYPE_OPTIONS.map((st) => {
                    const isChecked = selectedSampleTypes.includes(st.label);
                    return (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSampleType(st.label)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shrink-0">{st.icon}</span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{st.label}</h5>
                            <p className="text-[11px] text-slate-500">{st.desc}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-teal-600 accent-teal-600 shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Opción Otro tipo de muestra */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isOtherSampleTypeChecked}
                      onChange={(e) => setIsOtherSampleTypeChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <span>Otro tipo de muestra:</span>
                  </label>
                  {isOtherSampleTypeChecked && (
                    <input
                      type="text"
                      value={otherSampleTypeText}
                      onChange={(e) => setOtherSampleTypeText(e.target.value)}
                      placeholder="Especifique tipo de muestra (ej. Lavado broncoalveolar, raspado corneal...)"
                      className="flex-1 px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 1.4 ANTECEDENTES PATOLÓGICOS (NADA PREMARCADO) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Antecedentes Patológicos del Paciente
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ANTECEDENTS_OPTIONS.map((ant) => {
                  const isChecked = selectedAntecedents.includes(ant);
                  return (
                    <label
                      key={ant}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                        isChecked
                          ? 'bg-purple-50 text-[#2B017C] border-purple-300 ring-1 ring-purple-300 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAntecedent(ant)}
                        className="w-4 h-4 rounded text-[#6F2BCC] accent-[#6F2BCC]"
                      />
                      <span>{ant}</span>
                    </label>
                  );
                })}
              </div>

              {/* Opción Otro antecedente */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isOtherAntecedentChecked}
                    onChange={(e) => setIsOtherAntecedentChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6F2BCC] accent-[#6F2BCC]"
                  />
                  <span>Otro antecedente:</span>
                </label>
                {isOtherAntecedentChecked && (
                  <input
                    type="text"
                    value={otherAntecedentText}
                    onChange={(e) => setOtherAntecedentText(e.target.value)}
                    placeholder="Especifique otro antecedente patológico..."
                    className="flex-1 px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs focus:ring-2 focus:ring-[#6F2BCC] focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* 1.5 TRATAMIENTO ACTUAL (NADA PREMARCADO) */}
            <div
              id="treatment-status-section"
              className={`space-y-3 pt-2 border-t border-slate-100 rounded-2xl p-2.5 transition-all ${
                missingFieldIds.includes('treatment-status-section')
                  ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      ¿Se encuentra actualmente en tratamiento médico? *
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Antibióticos, antiparasitarios, corticoides o quimioterápicos administrados.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['Sí', 'No'].map((tr) => (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => {
                        setIsInTreatment(tr);
                        if (tr === 'No') setTreatmentDetails('');
                        clearMissingField('treatment-status-section');
                        clearMissingField('treatment-details-input');
                      }}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isInTreatment === tr
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              {isInTreatment === 'Sí' && (
                <div className="pt-2 animate-in fade-in duration-150 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    ¿Cuál tratamiento o medicamento está administrando actualmente? *
                  </label>
                  <input
                    id="treatment-details-input"
                    type="text"
                    required
                    value={treatmentDetails}
                    onChange={(e) => setTreatmentDetails(e.target.value)}
                    placeholder="Ej. Doxiciclina 10mg/kg SID hace 5 días, Prednisolona, Enrofloxacina..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Botón de continuación con Alerta Directa */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                    Paso 1 de 2: Muestras, VetPlus y Antecedentes Clínicos
                  </span>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) {
                      setActiveStep(2);
                    }
                  }}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continuar a Pruebas Diagnósticas & Pago</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* PASO 2: PRUEBAS SOLICITADAS CON FILTRADO AVANZADO Y MÉTODO DE PAGO */}
        {/* ================================================================== */}
        {activeStep === 2 && (
          <div id="catalog-exams-section" className={`bg-white rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in duration-150 transition-all ${missingFieldIds.includes('catalog-exams-section') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200/90'}`}>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>💳</span> Portafolio de Pruebas Clínicas, Seguro VetPlus y Método de Pago
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Utilice el buscador y filtros avanzados para localizar rápidamente las pruebas diagnósticas sin tener que buscar manualmente entre todas las 223 pruebas.
              </p>
            </div>

            {/* 2.1 MOTOR DE BÚSQUEDA Y FILTRADO INTELIGENTE DE PRUEBAS */}
            <div className="bg-slate-50/80 border-2 border-teal-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Buscador de pruebas por texto */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={examSearchQuery}
                    onChange={(e) => setExamSearchQuery(e.target.value)}
                    placeholder="Filtrar por nombre (ej. Hemograma, Glucosa, T4, ALT), analito, CUPS o muestra..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
                  />
                  <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                  {examSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setExamSearchQuery('')}
                      className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtro desplegable por categoría */}
                <div className="w-full md:w-64">
                  <select
                    value={examCategoryFilter}
                    onChange={(e) => setExamCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs cursor-pointer"
                  >
                    <option value="all">📁 Todas las Áreas (223 pruebas)</option>
                    {CLINICAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.icon || '🔬'} {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por tipo de muestra */}
                <div className="w-full md:w-48">
                  <select
                    value={examMatrixFilter}
                    onChange={(e) => setExamMatrixFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs cursor-pointer"
                  >
                    <option value="all">🧪 Todos los tubos</option>
                    <option value="edta">🩸 Tubo Lila (EDTA)</option>
                    <option value="suero">🔴 Tubo Rojo (Suero)</option>
                    <option value="citrato">🔵 Tubo Azul (Citrato)</option>
                    <option value="orina">💧 Orina</option>
                    <option value="fecal">💩 Materia Fecal</option>
                    <option value="tejido">🔬 Biopsia / Tejido</option>
                  </select>
                </div>
              </div>

              {/* Chips de acceso rápido a pruebas más solicitadas */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Atajos:
                </span>
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'frecuentes', label: '⭐ Más Frecuentes' },
                  { id: 'hemogramas', label: '🩸 Hemogramas' },
                  { id: 'bioquimica', label: '🧪 Bioquímica & Perfiles' },
                  { id: 'orina', label: '💧 Uroanálisis' },
                  { id: 'heces', label: '💩 Coprológicos' },
                  { id: 'hormonas', label: '💊 Hormonas & T4' },
                  { id: 'citologia', label: '🧫 Citología & Biopsia' },
                  { id: 'infecciosas', label: '🛡️ Serología & SNAP' },
                ].map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setExamQuickFilterTag(tag.id);
                      if (tag.id !== 'all') setExamCategoryFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      examQuickFilterTag === tag.id
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white dark:bg-[#181232] border border-slate-200 dark:border-[#2f2257] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#221a46]'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Contador en vivo */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-[#2f2257]">
                <span>
                  Mostrando <strong className="text-teal-900 dark:text-[#01FADA]">{filteredClinicalExams.length}</strong> de 223 pruebas disponibles
                </span>
                {(examSearchQuery || examCategoryFilter !== 'all' || examMatrixFilter !== 'all' || examQuickFilterTag !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setExamSearchQuery('');
                      setExamCategoryFilter('all');
                      setExamMatrixFilter('all');
                      setExamQuickFilterTag('all');
                    }}
                    className="text-teal-700 dark:text-[#01FADA] hover:text-teal-900 font-bold underline cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>

              {/* Grid interactivo de pruebas filtradas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredClinicalExams.slice(0, 48).map((exam) => {
                  const isSelected = selectedCatalogExams.some((e) => e.id === exam.id);
                  const examPrice = exam.precio || exam.precioIva || 0;
                  return (
                    <div
                      key={exam.id}
                      onClick={() => handleToggleCatalogExam(exam)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
                          : 'bg-white dark:bg-[#181232] border-slate-200 dark:border-[#2f2257] text-slate-800 dark:text-slate-100 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-[#221a46]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-extrabold text-xs leading-snug">{exam.nombre}</h5>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                            isSelected ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 dark:bg-[#261d47] text-slate-500 dark:text-purple-300'
                          }`}>
                            {exam.cups || exam.id}
                          </span>
                        </div>
                        <div className={`text-[11px] mt-1 ${isSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {exam.categoria}
                        </div>
                        <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-teal-200' : 'text-slate-400 dark:text-slate-400'}`}>
                          🧪 {exam.muestra || exam.matrizMuestra || 'Sangre'} · ⏱️ {exam.tiempoResultado || exam.tiempoEntrega}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/30 dark:border-[#2f2257]/60">
                        <span className={`font-black text-xs ${isSelected ? 'text-white' : 'text-teal-700 dark:text-[#01FADA]'}`}>
                          ${examPrice.toLocaleString('es-CO')} COP
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                          isSelected
                            ? 'bg-white text-teal-900'
                            : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-[#01FADA] border border-transparent dark:border-teal-800/60'
                        }`}>
                          {isSelected ? '✓ Agregada' : '+ Añadir'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredClinicalExams.length === 0 && (
                  <div className="col-span-full py-8 text-center text-slate-400 space-y-2">
                    <span className="text-3xl block">🔍</span>
                    <p className="text-xs font-semibold">No se encontraron pruebas que coincidan con el filtro.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setExamSearchQuery('');
                        setExamCategoryFilter('all');
                        setExamMatrixFilter('all');
                        setExamQuickFilterTag('all');
                      }}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold"
                    >
                      Ver todas las pruebas
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2.2 BANDEJA DE PRUEBAS SELECCIONADAS & CÓDIGO VETPLUS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                  Pruebas Configuradas para la Orden ({selectedCatalogExams.length}) *
                </label>
                {selectedCatalogExams.length > 0 && (
                  <span className="text-xs font-bold text-teal-800 dark:text-[#01FADA]">
                    Subtotal: ${totalCatalogPrice.toLocaleString('es-CO')} COP
                  </span>
                )}
              </div>

              {selectedCatalogExams.length > 0 ? (
                <div className="space-y-2">
                  {selectedCatalogExams.map((exam) => {
                    const vp = examVetPlusCodes[exam.id] || { hasVetPlus: isVetPlusInsured === 'Sí', code: isVetPlusInsured === 'Sí' ? vetPlusAuthCode : '' };
                    const examPrice = exam.precio || exam.precioIva || 0;
                    return (
                      <div
                        key={exam.id}
                        className="p-3.5 bg-teal-50/70 dark:bg-[#181232] border border-teal-200 dark:border-[#2f2257] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{exam.nombre}</span>
                            <span className="text-[10px] bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                              {exam.categoria}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            Muestra: {exam.matrizMuestra || exam.muestra} · Entrega: {exam.tiempoEntrega || exam.tiempoResultado}
                          </span>
                        </div>

                        {/* Código VetPlus para esta prueba */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-teal-950 dark:text-[#01FADA] text-xs sm:text-sm">
                            ${examPrice.toLocaleString('es-CO')} COP
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveCatalogExam(exam.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg font-bold text-xs cursor-pointer"
                            title="Quitar prueba"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-[#16102c]/50 border border-dashed border-slate-300 dark:border-[#2f2257] rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400">
                  No ha seleccionado ninguna prueba del catálogo aún. Utilice el buscador superior o especifique una prueba manual abajo.
                </div>
              )}

              {/* Opción para escribir examen manual / no catalogado */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-slate-800">
                  O escriba directamente la prueba individual o perfil solicitado si no está en el listado:
                </label>
                <input
                  type="text"
                  value={customTestNameInput}
                  onChange={(e) => {
                    setCustomTestNameInput(e.target.value);
                    clearMissingField('catalog-exams-section');
                  }}
                  placeholder="Ej: Hemograma Tipo IV + Frotis, Perfil Renal Avanzado, Progesterona..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {/* 2.3 MÉTODO DE PAGO (NADA PREMARCADO) */}
            <div id="payment-method-section" className={`space-y-3 pt-3 border-t border-slate-100 rounded-2xl p-2.5 transition-all ${missingFieldIds.includes('payment-method-section') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : ''}`}>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Método de Pago *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => {
                        setPaymentMethod(pm.id);
                        clearMissingField('payment-method-section');
                      }}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs">{pm.label}</span>
                          <span className="text-sm">{isSelected ? '✓' : '○'}</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                          {pm.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {paymentMethod === 'credito' && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <strong className="block font-bold">Condición de Crédito Institucional:</strong>
                    <span>
                      La modalidad de crédito aplica únicamente para veterinarias con cupo aprobado por OSD. Para solicitar autorización o consultar su estado, comuníquese previamente al número <strong>+57 3005143727</strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2.4 OBSERVACIONES */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800">
                Observaciones clínicas especiales (opcional):
              </label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Indique requerimientos específicos de procesamiento, urgencias preanalíticas o datos complementarios..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            {/* RESUMEN FINAL Y BOTONES */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#2f2257] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 border border-slate-200 dark:border-[#2f2257] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#1b1433] cursor-pointer"
              >
                ← Volver a Muestras & Antecedentes
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total a Facturar</span>
                  <span className="text-base sm:text-lg font-black text-teal-800 dark:text-[#01FADA]">
                    ${totalCatalogPrice.toLocaleString('es-CO')} COP
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <span>✓</span>
                  <span>{isSubmitting ? 'Generando Orden...' : 'Confirmar y Enviar Solicitud a Laboratorio OSD'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </>
  )}
      
    </div>
  );
}