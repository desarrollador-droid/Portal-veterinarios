import { hasReportedAllergy, getAllergyDisplay } from './allergyHelpers.js';
import { SAMPLE_DOCS_BY_PATIENT } from '../data/sampleDocumentsData.js';

/**
 * Escapa caracteres especiales para inserción segura en SVG / XML
 */
export function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Genera la representación gráfica vectorial (SVG membretado) del informe oficial
 * de examen clínico para que cualquier archivo o registro histórico se visualice
 * como una hoja médica completa con membrete, tabla analítica, curva citológica y firma.
 */
export function generateMedicalDocSvg(doc, patient = {}) {
  const patientName = `${patient.name || ''} ${patient.lastName || ''}`.trim() || 'Paciente Veterinario';
  const patientId = patient.id || 'PAC-001';
  const species = patient.species || 'Canino';
  const breed = patient.breed || 'Mestizo';
  const ownerName = patient.owner?.name || patient.ownerName || 'Tutor Registrado';
  const vetName = doc.uploadedBy || patient.attendingVet || 'Dr. Alejandro Morales';
  const docTitle = doc.title || 'Informe Oficial de Laboratorio Clínico';
  const docFolio = doc.id || 'DOC-2026-001';
  const docDate = doc.date || new Date().toLocaleDateString('es-CO');
  const fileName = doc.fileName || 'Reporte_Clinico.pdf';
  const docTypeLabel = doc.documentTypeLabel || doc.documentType || 'Laboratorio Clínico';
  const notes = doc.notes || 'Estudio clínico procesado bajo protocolo de calidad. Hallazgos analíticos verificados.';
  const findings = (doc.keyFindings && doc.keyFindings.length > 0) ? doc.keyFindings : ['Estudio clínico dentro de límites fisiológicos'];

  const sd = doc.structuredData || {};

  // Parámetros analíticos
  const hto = doc.hematocrito || sd.hematocrito || 38;
  const hb = doc.hemoglobina || sd.hemoglobina || 13.5;
  const plq = doc.plaquetas || sd.plaquetas || 220000;
  const leu = doc.leucocitos || sd.leucocitos || 12500;

  const htoStatus = hto < 37 ? 'DISMINUIDO (Anemia)' : (hto > 55 ? 'ELEVADO (Policitemia)' : 'NORMAL');
  const htoColor = hto < 37 ? '#d97706' : (hto > 55 ? '#dc2626' : '#059669');

  const plqStatus = plq < 175000 ? 'DISMINUIDO (Trombocitopenia)' : (plq > 500000 ? 'ELEVADO (Trombocitosis)' : 'NORMAL');
  const plqColor = plq < 175000 ? '#e11d48' : (plq > 500000 ? '#7c3aed' : '#059669');

  const leuStatus = leu > 17000 ? 'ELEVADO (Leucocitosis)' : (leu < 6000 ? 'DISMINUIDO (Leucopenia)' : 'NORMAL');
  const leuColor = leu > 17000 ? '#7c3aed' : (leu < 6000 ? '#e11d48' : '#059669');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1100" width="100%" height="100%" style="background:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <!-- Fondo y Marco de Hoja Clínica Membretada -->
    <rect width="850" height="1100" fill="#ffffff" />
    <rect x="20" y="20" width="810" height="1060" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
    <rect x="25" y="25" width="800" height="10" fill="#2B017C" rx="4" />

    <!-- Encabezado Membretado OSD / VetLab -->
    <g transform="translate(45, 55)">
      <rect x="0" y="0" width="56" height="56" rx="14" fill="#2B017C" />
      <text x="28" y="38" font-size="28" text-anchor="middle" fill="#ffffff">🧬</text>

      <text x="70" y="22" font-size="20" font-weight="900" fill="#2B017C" letter-spacing="-0.5">ON SITE DIAGNOSTIC (OSD)</text>
      <text x="70" y="38" font-size="11" font-weight="800" fill="#6F2BCC" letter-spacing="1">LABORATORIO CENTRAL DE PATOLOGÍA &amp; BIOLOGÍA MOLECULAR qPCR</text>
      <text x="70" y="52" font-size="9.5" fill="#64748b">Habilitación Sanitaria ICA / MinSalud #COL-VET-7892 · Certificación ISO 9001/17025</text>

      <!-- Badge Folio a la derecha -->
      <rect x="570" y="2" width="190" height="26" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
      <text x="665" y="19" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle" fill="#1e293b">FOLIO: ${docFolio}</text>
      <text x="760" y="44" font-size="10" text-anchor="end" fill="#64748b">Emisión: ${docDate}</text>
    </g>

    <line x1="45" y1="125" x2="805" y2="125" stroke="#e2e8f0" stroke-width="1.5" />

    <!-- Título del Documento -->
    <g transform="translate(45, 145)">
      <text x="0" y="18" font-size="16" font-weight="900" fill="#0f172a">${escapeXml(docTitle)}</text>
      <text x="0" y="34" font-size="10.5" fill="#64748b" font-family="monospace">Tipo: ${escapeXml(docTypeLabel)} · Archivo original: ${escapeXml(fileName)} · Custodia electrónica VetLab</text>
    </g>

    <!-- Caja de Metadatos del Paciente y Médico -->
    <g transform="translate(45, 195)">
      <rect x="0" y="0" width="760" height="76" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
      
      <text x="18" y="22" font-size="9" font-weight="800" fill="#64748b" text-transform="uppercase">PACIENTE</text>
      <text x="18" y="42" font-size="13" font-weight="900" fill="#0f172a">${escapeXml(patientName)}</text>
      <text x="18" y="58" font-size="10" font-family="monospace" fill="#2B017C">ID: ${patientId}</text>

      <text x="210" y="22" font-size="9" font-weight="800" fill="#64748b" text-transform="uppercase">ESPECIE / RAZA</text>
      <text x="210" y="42" font-size="12" font-weight="800" fill="#1e293b">${escapeXml(species)}</text>
      <text x="210" y="58" font-size="10.5" fill="#64748b">${escapeXml(breed)}</text>

      <text x="390" y="22" font-size="9" font-weight="800" fill="#64748b" text-transform="uppercase">TUTOR RESPONSABLE</text>
      <text x="390" y="42" font-size="12" font-weight="800" fill="#1e293b">${escapeXml(ownerName)}</text>
      <text x="390" y="58" font-size="10.5" fill="#64748b">Registro Verificado</text>

      <text x="570" y="22" font-size="9" font-weight="800" fill="#64748b" text-transform="uppercase">MÉDICO VETERINARIO</text>
      <text x="570" y="42" font-size="12" font-weight="800" fill="#1e293b">${escapeXml(vetName)}</text>
      <text x="570" y="58" font-size="10.5" fill="#047857" font-weight="700">✓ Tratante Acreditado</text>
    </g>

    <!-- Tabla Analítica Cuantitativa Oficial -->
    <g transform="translate(45, 290)">
      <rect x="0" y="0" width="760" height="28" rx="6" fill="#2B017C" />
      <text x="18" y="18" font-size="10.5" font-weight="800" fill="#ffffff">PARÁMETRO ANALÍTICO</text>
      <text x="260" y="18" font-size="10.5" font-weight="800" fill="#ffffff">RESULTADO</text>
      <text x="430" y="18" font-size="10.5" font-weight="800" fill="#ffffff">RANGO DE REFERENCIA</text>
      <text x="620" y="18" font-size="10.5" font-weight="800" fill="#ffffff">ESTADO CLÍNICO</text>

      <!-- Fila 1: Hematocrito -->
      <rect x="0" y="28" width="760" height="42" fill="#ffffff" stroke="#f1f5f9" />
      <text x="18" y="52" font-size="11.5" font-weight="800" fill="#1e293b">Hematocrito (Hto)</text>
      <text x="18" y="65" font-size="9" fill="#64748b">Volumen globular concentrado</text>
      <text x="260" y="56" font-size="13" font-weight="900" fill="#0f172a">${hto}%</text>
      <text x="430" y="56" font-size="11" font-family="monospace" fill="#475569">37.0 - 55.0 %</text>
      <rect x="615" y="40" width="130" height="22" rx="4" fill="${htoColor}15" stroke="${htoColor}40" />
      <text x="680" y="55" font-size="10" font-weight="800" fill="${htoColor}" text-anchor="middle">${htoStatus}</text>

      <!-- Fila 2: Hemoglobina -->
      <rect x="0" y="70" width="760" height="42" fill="#f8fafc" stroke="#f1f5f9" />
      <text x="18" y="94" font-size="11.5" font-weight="800" fill="#1e293b">Hemoglobina (Hb)</text>
      <text x="18" y="107" font-size="9" fill="#64748b">Concentración sérica total</text>
      <text x="260" y="98" font-size="13" font-weight="900" fill="#0f172a">${hb} g/dL</text>
      <text x="430" y="98" font-size="11" font-family="monospace" fill="#475569">12.0 - 18.0 g/dL</text>
      <rect x="615" y="82" width="130" height="22" rx="4" fill="#05966915" stroke="#05966940" />
      <text x="680" y="97" font-size="10" font-weight="800" fill="#059669" text-anchor="middle">NORMAL</text>

      <!-- Fila 3: Plaquetas -->
      <rect x="0" y="112" width="760" height="42" fill="#ffffff" stroke="#f1f5f9" />
      <text x="18" y="136" font-size="11.5" font-weight="800" fill="#1e293b">Recuento Plaquetario</text>
      <text x="18" y="149" font-size="9" fill="#64748b">Estimación en cámara Neubauer</text>
      <text x="260" y="140" font-size="13" font-weight="900" fill="#0f172a">${Number(plq).toLocaleString('es-CO')} /µL</text>
      <text x="430" y="140" font-size="11" font-family="monospace" fill="#475569">175.000 - 500.000 /µL</text>
      <rect x="615" y="124" width="130" height="22" rx="4" fill="${plqColor}15" stroke="${plqColor}40" />
      <text x="680" y="139" font-size="10" font-weight="800" fill="${plqColor}" text-anchor="middle">${plqStatus}</text>

      <!-- Fila 4: Leucocitos -->
      <rect x="0" y="154" width="760" height="42" fill="#f8fafc" stroke="#f1f5f9" />
      <text x="18" y="178" font-size="11.5" font-weight="800" fill="#1e293b">Leucocitos Totales</text>
      <text x="18" y="191" font-size="9" fill="#64748b">Recuento citológico global</text>
      <text x="260" y="182" font-size="13" font-weight="900" fill="#0f172a">${Number(leu).toLocaleString('es-CO')} /µL</text>
      <text x="430" y="182" font-size="11" font-family="monospace" fill="#475569">6.000 - 17.000 /µL</text>
      <rect x="615" y="166" width="130" height="22" rx="4" fill="${leuColor}15" stroke="${leuColor}40" />
      <text x="680" y="181" font-size="10" font-weight="800" fill="${leuColor}" text-anchor="middle">${leuStatus}</text>
    </g>

    <!-- Hallazgos Clínicos Notificados -->
    <g transform="translate(45, 510)">
      <text x="0" y="16" font-size="11" font-weight="800" fill="#2B017C" text-transform="uppercase">✓ HALLAZGOS CLÍNICOS NOTIFICADOS EN DOCUMENTO:</text>
      ${findings.map((f, i) => `
        <g transform="translate(${i * 220}, 28)">
          <rect x="0" y="0" width="205" height="28" rx="8" fill="#6F2BCC" />
          <text x="102" y="18" font-size="10.5" font-weight="800" fill="#ffffff" text-anchor="middle">✓ ${escapeXml(f)}</text>
        </g>
      `).join('')}
    </g>

    <!-- Observaciones / Interpretación Médica -->
    <g transform="translate(45, 580)">
      <text x="0" y="16" font-size="11" font-weight="800" fill="#334155" text-transform="uppercase">INTERPRETACIÓN CLÍNICA &amp; OBSERVACIONES:</text>
      <rect x="0" y="26" width="760" height="65" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
      <text x="16" y="50" font-size="11.5" fill="#1e293b" font-style="italic">"${escapeXml(notes)}"</text>
      <text x="16" y="74" font-size="10" fill="#64748b">Correlación recomendada con perfil de hemotrópicos o microbiota qPCR según sospecha diagnóstica.</text>
    </g>

    <!-- Gráfico / Histograma Hematológico Simulado -->
    <g transform="translate(45, 685)">
      <rect x="0" y="0" width="760" height="150" rx="10" fill="#fcfdfe" stroke="#e2e8f0" />
      <text x="18" y="22" font-size="10.5" font-weight="800" fill="#475569">DISPERSIÓN CITOLÓGICA &amp; CURVA VOLUMÉTRICA ERITROCITARIA (RBC / PLT)</text>
      
      <line x1="40" y1="125" x2="720" y2="125" stroke="#cbd5e1" stroke-width="1.5" />
      <line x1="40" y1="35" x2="40" y2="125" stroke="#cbd5e1" stroke-width="1.5" />
      
      <path d="M 50 125 Q 150 120 220 85 T 320 45 T 420 85 T 550 120 L 680 125" fill="none" stroke="#2B017C" stroke-width="2.5" />
      <path d="M 50 125 Q 150 120 220 85 T 320 45 T 420 85 T 550 120 L 680 125 Z" fill="#2B017C" fill-opacity="0.12" />

      <circle cx="90" cy="118" r="3.5" fill="#6F2BCC" />
      <circle cx="110" cy="112" r="3.5" fill="#6F2BCC" />
      <circle cx="130" cy="108" r="4" fill="#6F2BCC" />
      <circle cx="150" cy="114" r="3" fill="#6F2BCC" />
      <text x="120" y="98" font-size="9" font-weight="700" fill="#6F2BCC" text-anchor="middle">Plaquetas</text>

      <text x="320" y="38" font-size="9.5" font-weight="800" fill="#2B017C" text-anchor="middle">Población Eritrocitaria Principal (VCM)</text>

      <text x="40" y="138" font-size="8.5" fill="#94a3b8">0 fL</text>
      <text x="220" y="138" font-size="8.5" fill="#94a3b8">60 fL</text>
      <text x="420" y="138" font-size="8.5" fill="#94a3b8">120 fL</text>
      <text x="680" y="138" font-size="8.5" fill="#94a3b8">200 fL</text>
    </g>

    <!-- Sello Oficial y Firma Digital -->
    <g transform="translate(45, 875)">
      <g transform="translate(100, 70)">
        <circle cx="0" cy="0" r="48" fill="#ffffff" stroke="#2B017C" stroke-width="2" stroke-dasharray="4,2" />
        <circle cx="0" cy="0" r="42" fill="#f8fafc" stroke="#2B017C" stroke-width="1" />
        <text x="0" y="-18" font-size="8" font-weight="800" fill="#2B017C" text-anchor="middle">LABORATORIO CENTRAL</text>
        <text x="0" y="-4" font-size="10" font-weight="900" fill="#6F2BCC" text-anchor="middle">VETLAB</text>
        <text x="0" y="10" font-size="7.5" font-weight="800" fill="#047857" text-anchor="middle">★ CERTIFICADO ★</text>
        <text x="0" y="24" font-size="7" fill="#64748b" text-anchor="middle">CALIDAD OSD</text>
      </g>

      <g transform="translate(480, 50)">
        <path d="M 10 30 Q 30 5 60 25 T 120 15 T 180 35 T 230 10" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round" />
        <line x1="0" y1="45" x2="260" y2="45" stroke="#334155" stroke-width="1.5" />
        <text x="130" y="60" font-size="11.5" font-weight="800" fill="#0f172a" text-anchor="middle">${escapeXml(vetName)}</text>
        <text x="130" y="74" font-size="9.5" fill="#64748b" text-anchor="middle">Médico Veterinario Especialista en Patología Clínica</text>
        <text x="130" y="86" font-size="9" font-family="monospace" fill="#2B017C" text-anchor="middle">M.P. OSD-COL-9482 · R.N.V. #84920</text>
      </g>
    </g>

    <!-- Pie de Seguridad Criptográfica -->
    <g transform="translate(45, 1025)">
      <line x1="0" y1="0" x2="760" y2="0" stroke="#e2e8f0" stroke-width="1" />
      <text x="0" y="18" font-size="8.5" fill="#94a3b8">Este informe analítico digital ha sido generado por el sistema de custodia VetLab Diagnostics. Hash SHA-256: e8b94f...9c12a · Documento inmutable para auditoría médica.</text>
    </g>
  </svg>`;
}

export function generateMedicalDocSvgDataUrl(doc, patient = {}) {
  const svg = generateMedicalDocSvg(doc, patient);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Generador de Historia Clínica Visual Digital - VetLab
 * Genera un documento clínico completo con diseño idéntico al dashboard visual de la plataforma,
 * preservando todas las casillas, tarjetas, badges de estado y tablas clínicas.
 */

export function getExamAgentsList(exam) {
  if (exam?.agents && Array.isArray(exam.agents) && exam.agents.length > 0) {
    return exam.agents;
  }

  const nameNorm = (exam?.testName || '').toLowerCase();
  if (nameNorm.includes('hemotr') || nameNorm.includes('vectorial') || nameNorm.includes('tbp')) {
    return [
      { name: 'Ehrlichia canis', isPositive: true, result: 'POSITIVO (+)', ct: '22.8', load: 'Carga genómica alta' },
      { name: 'Anaplasma platys', isPositive: true, result: 'POSITIVO (+)', ct: '27.4', load: 'Carga genómica moderada' },
      { name: 'Hepatozoon canis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Anaplasma phagocytophilum', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Rickettsia rickettsii', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Mycoplasma haemocanis', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Bartonella spp. (canina)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
    ];
  }

  if (nameNorm.includes('microbiota') || nameNorm.includes('disbiosis')) {
    return [
      { name: 'Faecalibacterium', isPositive: false, result: 'Normal', ct: '19.2', load: 'Dentro de rango fisiológico' },
      { name: 'Turicibacter', isPositive: false, result: 'Normal', ct: '21.0', load: 'Dentro de rango fisiológico' },
      { name: 'Clostridium hiranonis', isPositive: false, result: 'Normal', ct: '23.4', load: 'Eubiosis adecuada' },
      { name: 'Blautia', isPositive: false, result: 'Normal', ct: '18.9', load: 'Dentro de rango fisiológico' },
      { name: 'Escherichia coli', isPositive: false, result: 'Normal', ct: '28.1', load: 'Sin sobrecrecimiento' },
      { name: 'Streptococcus', isPositive: false, result: 'Normal', ct: '29.5', load: 'Sin sobrecrecimiento' },
    ];
  }

  if (nameNorm.includes('diarrea') || nameNorm.includes('enter') || nameNorm.includes('gastro')) {
    return [
      { name: 'Cryptosporidium spp.', isPositive: true, result: 'POSITIVO (+)', ct: '24.1', load: 'Carga moderada-alta' },
      { name: 'Clostridium perfringens enterotoxin', isPositive: true, result: 'POSITIVO (+)', ct: '21.8', load: 'Carga bacteriana elevada' },
      { name: 'Giardia lamblia', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Parvovirus canino (CPV-2)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Coronavirus entérico canino (CCoV)', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Salmonella enterica', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
      { name: 'Campylobacter jejuni', isPositive: false, result: 'Negativo (-)', ct: 'N/D', load: 'No detectado' },
    ];
  }

  if (exam?.targets && typeof exam.targets === 'string') {
    return exam.targets
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        isPositive: false,
        result: 'Negativo (-)',
        ct: 'N/D',
        load: 'No detectado',
      }));
  }

  return [];
}

export function generateClinicalHistoryHtml(patient) {
  if (!patient) return '';

  const fullPatientName = `${patient.name || ''} ${patient.lastName || ''}`.trim();
  const rf = patient.riskFactors || {};
  const ma = patient.medicalAdmission || {};
  const hm = patient.healthMetrics || {};
  const vs = hm.vitalSigns || {};
  const owner = patient.owner || {};
  const isDeceased = patient.status === 'fallecido';

  // Badges y estilos
  const getStatusBadgeHtml = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return '<span class="badge badge-emerald">● Activo</span>';
      case 'pendiente por atención':
        return '<span class="badge badge-amber">● Pendiente por atención</span>';
      case 'en tratamiento':
        return '<span class="badge badge-blue">● En tratamiento</span>';
      case 'en observación':
        return '<span class="badge badge-indigo">● En observación</span>';
      case 'en recuperación':
        return '<span class="badge badge-teal">● En recuperación</span>';
      case 'estable':
        return '<span class="badge badge-sky">● Estable</span>';
      case 'critico':
        return '<span class="badge badge-rose">● Crítico</span>';
      case 'internado':
        return '<span class="badge badge-purple">● Internado</span>';
      case 'dado de alta':
        return '<span class="badge badge-emerald-dark">● Dado de alta</span>';
      case 'fallecido':
        return '<span class="badge badge-slate-dark">🔒 Fallecido</span>';
      default:
        return `<span class="badge badge-slate">● ${status || 'Inactivo'}</span>`;
    }
  };

  const getClinicalStatusBadgeHtml = (status) => {
    switch (status) {
      case 'Bueno':
      case 'Estable':
        return `<span class="badge badge-emerald">${status}</span>`;
      case 'Regular':
        return `<span class="badge badge-amber">${status}</span>`;
      case 'Crítico':
      case 'Malo':
        return `<span class="badge badge-rose">${status}</span>`;
      default:
        return `<span class="badge badge-slate">${status || 'No especificado'}</span>`;
    }
  };

  const consultationsHtml = (patient.consultations && patient.consultations.length > 0)
    ? patient.consultations.map((c) => `
      <div class="consultation-card">
        <div class="consultation-header">
          <div class="consultation-meta">
            <span class="consultation-date">📅 ${c.date} ${c.time ? `· ${c.time}` : ''}</span>
            ${c.clinicalStatus ? `<span class="consultation-status">${getClinicalStatusBadgeHtml(c.clinicalStatus)}</span>` : ''}
            ${c.weight ? `<span class="consultation-weight">⚖️ ${c.weight}</span>` : ''}
          </div>
          <div class="consultation-vet">
            Médico tratante: <strong class="vet-name">${c.vet || patient.attendingVet || 'Dr. Alejandro Morales'}</strong>
          </div>
        </div>

        ${c.vitalSigns ? `
        <div class="vital-grid">
          <div class="vital-item">
            <span class="vital-label">Frec. Cardíaca</span>
            <span class="vital-val">${c.vitalSigns.heartRate || '—'}</span>
          </div>
          <div class="vital-item">
            <span class="vital-label">Temperatura</span>
            <span class="vital-val">${c.vitalSigns.temperature || '—'}</span>
          </div>
          <div class="vital-item">
            <span class="vital-label">Frec. Respiratoria</span>
            <span class="vital-val">${c.vitalSigns.respiratoryRate || '—'}</span>
          </div>
          <div class="vital-item">
            <span class="vital-label">Estado Mucosas</span>
            <span class="vital-val">${c.vitalSigns.mucosa || '—'}</span>
          </div>
        </div>
        ` : ''}

        <div class="consultation-body">
          <div class="consultation-field">
            <span class="field-title">Motivo de la consulta:</span>
            <div class="field-box">${c.reason || 'Consulta general de revisión'}</div>
          </div>

          <div class="two-col">
            <div class="consultation-field">
              <span class="field-title">Medicación administrada / prescrita:</span>
              <div class="field-box">${c.medication || c.treatment || 'Ninguna medicación reportada'}</div>
            </div>
            <div class="consultation-field">
              <span class="field-title">Antecedentes relevantes:</span>
              <div class="field-box">${c.relevantBackground || 'Sin antecedentes adicionales'}</div>
            </div>
          </div>

          <div class="consultation-field">
            <span class="field-title field-title-blue">Observaciones y seguimiento:</span>
            <div class="field-box field-box-blue">${c.observationsAndFollowUp || c.diagnosis || 'Evolución favorable'}</div>
          </div>
        </div>
      </div>
    `).join('')
    : '<div class="empty-state">No hay consultas médicas archivadas para este paciente.</div>';

  const qpcrExamsHtml = (patient.qpcrExams && patient.qpcrExams.length > 0)
    ? patient.qpcrExams.map((exam) => {
        const allAgents = getExamAgentsList(exam);
        const positiveAgents = allAgents.filter(
          (a) => a.isPositive || (typeof a.result === 'string' && (a.result.toLowerCase().includes('positivo') || a.result.includes('+')))
        );
        const positiveCount = positiveAgents.length;
        const isIssued = exam.status === 'Emitido' || exam.status === 'Completado';
        const requestedDateTime = exam.requestedAt || (exam.date ? `${exam.date}, 08:30 AM` : '02/09/2026, 08:30 AM');
        const receivedDateTime = exam.receivedAt || (isIssued ? (exam.date ? `${exam.date}, 04:30 PM` : '03/09/2026, 04:30 PM') : 'Pendiente (en proceso)');

        const agentsGridHtml = allAgents.map((agent) => {
          const isPos = agent.isPositive || (typeof agent.result === 'string' && (agent.result.toLowerCase().includes('positivo') || agent.result.includes('+')));
          return `
            <div class="agent-card ${isPos ? 'agent-card-pos' : 'agent-card-neg'}">
              <div>
                <span class="agent-name ${isPos ? 'agent-name-pos' : ''}">${agent.name}</span>
                ${(agent.load || agent.ct) ? `
                  <div class="agent-detail ${isPos ? 'agent-detail-pos' : ''}">
                    ${agent.ct && agent.ct !== 'N/D' && agent.ct !== 'N/A' ? `Ct: ${agent.ct} · ` : ''}
                    ${agent.load || ''}
                  </div>
                ` : ''}
              </div>
              <span class="badge ${isPos ? 'badge-rose' : 'badge-slate'}" style="${isPos ? 'background: #e11d48; color: #ffffff; font-weight: 800; border: none;' : ''}">
                ${isPos ? '🔴 POSITIVO (+)' : '⚪ Negativo (-)'}
              </span>
            </div>
          `;
        }).join('');

        return `
          <div class="exam-card">
            <div class="exam-header">
              <div class="exam-title-row">
                <span class="exam-icon">🧬</span>
                <div>
                  <span class="exam-name">${exam.testName}</span>
                  <div style="display: flex; gap: 8px; align-items: center; margin-top: 3px; flex-wrap: wrap;">
                    <span class="exam-code" style="background: #e0f2fe; color: #2B017C; padding: 2px 7px; border-radius: 5px; font-weight: 800; border: 1px solid #bae6fd;">
                      🏷️ Código: ${exam.id}
                    </span>
                    ${exam.sampleType ? `<span style="font-size: 11px; color: #64748b; font-weight: 500;">· Muestra: ${exam.sampleType}</span>` : ''}
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 6px; align-items: center;">
                ${positiveCount > 0 ? `<span class="badge badge-rose" style="font-weight: 800; background: #ffe4e6; color: #9f1239; border-color: #fecdd3;">⚠️ ${positiveCount} ${positiveCount === 1 ? 'Positivo' : 'Positivos'}</span>` : ''}
                <span class="badge ${isIssued ? 'badge-emerald' : 'badge-amber'}">${isIssued ? '✓ Resultado Emitido' : (exam.status || 'Solicitud Creada')}</span>
              </div>
            </div>

            <!-- Trazabilidad Temporal Obligatoria (Fecha y Hora de Solicitud y Recepción) -->
            <div class="exam-timestamps">
              <div class="exam-timestamp-item">
                <span style="font-size: 9.5px; font-weight: 800; color: #64748b; text-transform: uppercase;">📤 Fecha y hora de solicitud enviada</span>
                <span style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 1px;">${requestedDateTime}</span>
                <span style="font-size: 10px; color: #64748b;">Orden médica generada en clínica veterinaria</span>
              </div>
              <div class="exam-timestamp-item">
                <span style="font-size: 9.5px; font-weight: 800; color: #64748b; text-transform: uppercase;">📥 Fecha y hora de recepción del examen</span>
                <span style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 1px;">${receivedDateTime}</span>
                <span style="font-size: 10px; color: #64748b;">${isIssued ? 'Recepción de muestra y emisión de informe oficial' : 'Ingreso a laboratorio central'}</span>
              </div>
            </div>

            <!-- Interpretación y Metodología -->
            <div class="two-col" style="margin-bottom: 10px;">
              <div class="data-box">
                <span class="box-label">Resultado Clínico / Interpretación</span>
                <span class="box-val bold text-slate-800">${exam.resultSummary || 'Evaluación molecular finalizada sin anormalidades.'}</span>
              </div>
              <div class="data-box">
                <span class="box-label">Metodología de Análisis Molecular</span>
                <span class="box-val">${exam.methodology || 'qPCR cuantitativa en tiempo real (Sondas TaqMan)'}</span>
              </div>
            </div>

            <!-- Todos los Agentes del Perfil con Positivos Resaltados -->
            <div style="margin-top: 10px; border-top: 1px solid var(--slate-200); padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
                  🧪 Todos los Agentes del Perfil (${allAgents.length} analizados)
                </span>
                <span style="font-size: 10px; color: #64748b;">
                  Detección molecular qPCR · Positivos destacados en rojo
                </span>
              </div>
              <div class="exam-agents-grid">
                ${agentsGridHtml}
              </div>
            </div>

            <!-- Archivos Adjuntos a la Orden qPCR (Cuadro Hemático o Historia Clínica) -->
            ${exam.cuadroHematico?.file ? `
              <div class="doc-attachment-preview">
                <div class="doc-attachment-bar">
                  <div class="doc-attachment-info">
                    <span class="doc-attachment-icon">🩸</span>
                    <div>
                      <strong class="doc-attachment-name">Cuadro Hemático Adjunto a la Orden: ${exam.cuadroHematico.fileName || 'Hemograma.pdf'}</strong>
                      <span class="doc-attachment-sub">${exam.cuadroHematico.fileSize || 'Examen analítico previo'} · Archivo oficial cargado</span>
                    </div>
                  </div>
                  <a href="${exam.cuadroHematico.file}" download="${exam.cuadroHematico.fileName || 'hemograma.pdf'}" target="_blank" class="doc-attachment-btn">
                    <span>📥</span> Abrir / Descargar Archivo ↗
                  </a>
                </div>
                ${exam.cuadroHematico.file.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)$/i.test(exam.cuadroHematico.fileName || '') ? `
                  <div class="doc-image-frame">
                    <img src="${exam.cuadroHematico.file}" alt="Cuadro Hemático" class="doc-image-content" />
                  </div>
                ` : `
                  <div class="doc-pdf-frame">
                    <iframe src="${exam.cuadroHematico.file}#toolbar=1" title="Cuadro Hemático" class="doc-pdf-iframe"></iframe>
                  </div>
                  <div class="doc-pdf-print-fallback">
                    Documento PDF adjunto a la orden qPCR: ${exam.cuadroHematico.fileName} (${exam.cuadroHematico.fileSize || 'Archivo'}).
                  </div>
                `}
              </div>
            ` : ''}

            ${exam.historiaClinica?.file ? `
              <div class="doc-attachment-preview">
                <div class="doc-attachment-bar">
                  <div class="doc-attachment-info">
                    <span class="doc-attachment-icon">📋</span>
                    <div>
                      <strong class="doc-attachment-name">Historia Clínica Adjunta a la Orden: ${exam.historiaClinica.fileName || 'Historia_Clinica.pdf'}</strong>
                      <span class="doc-attachment-sub">${exam.historiaClinica.fileSize || 'Remisión clínica'} · Archivo oficial cargado</span>
                    </div>
                  </div>
                  <a href="${exam.historiaClinica.file}" download="${exam.historiaClinica.fileName || 'historia_clinica.pdf'}" target="_blank" class="doc-attachment-btn">
                    <span>📥</span> Abrir / Descargar Archivo ↗
                  </a>
                </div>
                ${exam.historiaClinica.file.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)$/i.test(exam.historiaClinica.fileName || '') ? `
                  <div class="doc-image-frame">
                    <img src="${exam.historiaClinica.file}" alt="Historia Clínica" class="doc-image-content" />
                  </div>
                ` : `
                  <div class="doc-pdf-frame">
                    <iframe src="${exam.historiaClinica.file}#toolbar=1" title="Historia Clínica" class="doc-pdf-iframe"></iframe>
                  </div>
                  <div class="doc-pdf-print-fallback">
                    Documento PDF adjunto a la orden qPCR: ${exam.historiaClinica.fileName} (${exam.historiaClinica.fileSize || 'Archivo'}).
                  </div>
                `}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')
    : '<div class="empty-state">No registra exámenes qPCR históricos.</div>';

  const symptomsList = ma.symptoms && ma.symptoms.length > 0
    ? ma.symptoms.map((s) => `<span class="chip chip-rose">• ${s}</span>`).join(' ')
    : '<span class="text-slate-500">Ninguno reportado</span>';

  const weightHistoryHtml = hm.weightHistory && hm.weightHistory.length > 0
    ? hm.weightHistory.map((w) => `
      <div class="weight-row">
        <span class="weight-date">${w.date}</span>
        <span class="weight-val">${w.weight}</span>
      </div>
    `).join('')
    : `<div class="weight-row"><span class="weight-date">${patient.lastVisit || 'Fecha inicial'}</span><span class="weight-val">${patient.weight || 'Sin registrar'}</span></div>`;

  const clinicalDocs = (patient.clinicalDocuments && Array.isArray(patient.clinicalDocuments) && patient.clinicalDocuments.length > 0)
    ? patient.clinicalDocuments
    : (SAMPLE_DOCS_BY_PATIENT[patient.id] || []);

  const clinicalDocsHtml = clinicalDocs.length > 0
    ? clinicalDocs.map((doc) => {
        const findings = doc.keyFindings && doc.keyFindings.length > 0
          ? `<div style="margin-top: 8px;"><strong style="font-size: 11px; color: #475569; display: block; margin-bottom: 4px;">Hallazgos Clínicos Notificados:</strong>` +
            doc.keyFindings.map((f) => `<span class="chip chip-purple" style="margin-right: 4px; margin-bottom: 4px; display: inline-block;">✓ ${f}</span>`).join(' ') +
            `</div>`
          : '';

        let paramsHtml = '';
        const sd = doc.structuredData || {};
        const hasHemo = doc.hematocrito || doc.plaquetas || doc.leucocitos || doc.hemoglobina || sd.hemoglobina;
        const hasBioq = doc.creatinina || doc.bun || doc.alt || doc.fa || sd.creatinina;
        const hasUro = doc.densidadUrinaria || doc.phUrinario || sd.densidadUrinaria;
        const hasCopr = doc.consistenciaHeces || doc.parasitoFecal || sd.consistenciaHeces;
        const hasImag = doc.conclusionDiagnostica || doc.regionEvaluada || sd.conclusionDiagnostica;
        const hasRem = doc.diagnosticoPresuntivo || doc.tratamientoPrevio || sd.diagnosticoPresuntivo;

        if (hasHemo || hasBioq || hasUro || hasCopr || hasImag || hasRem) {
          paramsHtml = `<div style="margin-top: 8px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px;">
            <strong style="display: block; margin-bottom: 5px; color: #1e293b; font-size: 11px;">Parámetros Analíticos & Datos del Documento:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${doc.hematocrito ? `<span><strong>Hto:</strong> ${doc.hematocrito}%</span>` : ''}
              ${doc.hemoglobina || sd.hemoglobina ? `<span><strong>Hb:</strong> ${doc.hemoglobina || sd.hemoglobina} g/dL</span>` : ''}
              ${doc.plaquetas ? `<span><strong>Plaquetas:</strong> ${doc.plaquetas.toLocaleString('es-CO')} /µL</span>` : ''}
              ${doc.leucocitos ? `<span><strong>Leucocitos:</strong> ${doc.leucocitos.toLocaleString('es-CO')} /µL</span>` : ''}
              ${doc.creatinina || sd.creatinina ? `<span><strong>Creatinina:</strong> ${doc.creatinina || sd.creatinina} mg/dL</span>` : ''}
              ${doc.bun || sd.bun ? `<span><strong>BUN:</strong> ${doc.bun || sd.bun} mg/dL</span>` : ''}
              ${doc.alt || sd.alt ? `<span><strong>ALT:</strong> ${doc.alt || sd.alt} U/L</span>` : ''}
              ${doc.fa || sd.fa ? `<span><strong>FA:</strong> ${doc.fa || sd.fa} U/L</span>` : ''}
              ${doc.densidadUrinaria || sd.densidadUrinaria ? `<span><strong>Densidad:</strong> ${doc.densidadUrinaria || sd.densidadUrinaria}</span>` : ''}
              ${doc.phUrinario || sd.phUrinario ? `<span><strong>pH:</strong> ${doc.phUrinario || sd.phUrinario}</span>` : ''}
              ${doc.proteinasOrina || sd.proteinasOrina ? `<span><strong>Proteínas:</strong> ${doc.proteinasOrina || sd.proteinasOrina}</span>` : ''}
              ${doc.consistenciaHeces || sd.consistenciaHeces ? `<span><strong>Consistencia:</strong> ${doc.consistenciaHeces || sd.consistenciaHeces}</span>` : ''}
              ${doc.parasitoFecal || sd.parasitoFecal ? `<span><strong>Parásito:</strong> ${doc.parasitoFecal || sd.parasitoFecal}</span>` : ''}
              ${doc.conclusionDiagnostica || sd.conclusionDiagnostica ? `<span><strong>Conclusión Imagen:</strong> ${doc.conclusionDiagnostica || sd.conclusionDiagnostica}</span>` : ''}
              ${doc.diagnosticoPresuntivo || sd.diagnosticoPresuntivo ? `<span><strong>Dx Presuntivo:</strong> ${doc.diagnosticoPresuntivo || sd.diagnosticoPresuntivo}</span>` : ''}
            </div>
          </div>`;
        }

        // Determinar archivo visual directo (Imagen o PDF)
        let fileSource = doc.fileDataUrl || (doc.fileUrl && doc.fileUrl !== '#' ? doc.fileUrl : null);
        const isImage = Boolean(
          (doc.fileType && doc.fileType.startsWith('image/')) ||
          (fileSource && fileSource.startsWith('data:image/')) ||
          /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(doc.fileName || '')
        );
        const isPdf = Boolean(
          (doc.fileType && doc.fileType.includes('pdf')) ||
          (fileSource && fileSource.startsWith('data:application/pdf')) ||
          /\.pdf$/i.test(doc.fileName || '')
        );

        let visualDocHtml = '';
        if (fileSource) {
          if (isImage) {
            visualDocHtml = `
              <div class="doc-attachment-preview">
                <div class="doc-attachment-bar">
                  <div class="doc-attachment-info">
                    <span class="doc-attachment-icon">🖼️</span>
                    <div>
                      <strong class="doc-attachment-name">Visualización del Archivo Cargado: ${doc.fileName || 'Examen_Imagen.jpg'}</strong>
                      <span class="doc-attachment-sub">${doc.fileSize || 'Imagen médica'} · Archivo integrado al expediente del paciente</span>
                    </div>
                  </div>
                  <a href="${fileSource}" download="${doc.fileName || 'examen.jpg'}" target="_blank" class="doc-attachment-btn">
                    <span>🔍</span> Ver Imagen en Alta Resolución ↗
                  </a>
                </div>
                <div class="doc-image-frame">
                  <img src="${fileSource}" alt="${doc.title}" class="doc-image-content" />
                </div>
              </div>
            `;
          } else if (isPdf) {
            visualDocHtml = `
              <div class="doc-attachment-preview">
                <div class="doc-attachment-bar">
                  <div class="doc-attachment-info">
                    <span class="doc-attachment-icon">📄</span>
                    <div>
                      <strong class="doc-attachment-name">Documento PDF del Examen: ${doc.fileName || 'Examen_Clinico.pdf'}</strong>
                      <span class="doc-attachment-sub">${doc.fileSize || 'Documento PDF'} · Archivo oficial integrado para lectura directa</span>
                    </div>
                  </div>
                  <a href="${fileSource}" download="${doc.fileName || 'examen.pdf'}" target="_blank" class="doc-attachment-btn">
                    <span>📥</span> Abrir / Descargar PDF Original ↗
                  </a>
                </div>
                <div class="doc-pdf-frame">
                  <iframe src="${fileSource}#toolbar=1" title="${doc.title}" class="doc-pdf-iframe"></iframe>
                </div>
                <div class="doc-pdf-print-fallback">
                  Documento PDF Adjunto: ${doc.fileName} (${doc.fileSize}). Los parámetros y hallazgos analíticos se detallan en el expediente.
                </div>
              </div>
            `;
          }
        } else {
          // Hoja visual gráfica oficial OSD membretada
          const svgDataUrl = generateMedicalDocSvgDataUrl(doc, patient);
          visualDocHtml = `
            <div class="doc-attachment-preview">
              <div class="doc-attachment-bar">
                <div class="doc-attachment-info">
                  <span class="doc-attachment-icon">📋</span>
                  <div>
                    <strong class="doc-attachment-name">Hoja Oficial de Resultados del Examen: ${doc.fileName || 'Reporte_Clinico.pdf'}</strong>
                    <span class="doc-attachment-sub">Folio Oficial: ${doc.id} · Certificación OSD Diagnostics</span>
                  </div>
                </div>
                <a href="${svgDataUrl}" download="${doc.fileName || 'Reporte_Clinico.svg'}" target="_blank" class="doc-attachment-btn">
                  <span>🔍</span> Ver Hoja en Alta Resolución ↗
                </a>
              </div>
              <div class="doc-image-frame">
                <img src="${svgDataUrl}" alt="${doc.title}" class="doc-image-content" />
              </div>
            </div>
          `;
        }

        return `
          <div class="exam-card" style="margin-bottom: 16px; padding: 16px 18px; border-left: 4px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <span style="font-weight: 800; font-size: 14px; color: var(--primary); display: block;">
                  📄 ${doc.title || 'Documento Clínico'}
                </span>
                <span style="font-size: 10.5px; color: #64748b; font-family: monospace;">
                  [Folio: ${doc.id}] Archivo adjunto: <strong>${doc.fileName || 'Documento.pdf'}</strong> (${doc.fileSize || 'N/A'}) · Subido el ${doc.date || 'N/A'} por ${doc.uploadedBy || 'Veterinario Tratante'}
                </span>
              </div>
              <span class="badge badge-purple" style="font-size: 10.5px; font-weight: 700;">
                ${doc.documentTypeLabel || doc.documentType || 'Estudio Clínico'}
              </span>
            </div>
            ${findings}
            ${paramsHtml}
            ${doc.notes ? `
              <div style="margin-top: 8px; font-size: 11.5px; color: #334155; font-style: italic; background: #fafafa; padding: 6px 10px; border-radius: 6px; border: 1px solid #f1f5f9;">
                "${doc.notes}"
              </div>
            ` : ''}
            <!-- Visualización Directa del Archivo (Imagen o PDF) -->
            ${visualDocHtml}
          </div>
        `;
      }).join('')
    : '<div class="empty-state">No registra documentos clínicos ni archivos cargados en el expediente.</div>';

  const clinicalExams = (patient.clinicalExams && Array.isArray(patient.clinicalExams)) ? patient.clinicalExams : [];
  const clinicalExamsHtml = clinicalExams.length > 0
    ? clinicalExams.map((exam) => {
        const examFile = exam.fileDataUrl || (exam.fileUrl && exam.fileUrl !== '#' ? exam.fileUrl : null) || exam.file;
        let examVisualHtml = '';
        if (examFile) {
          const isImg = examFile.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)$/i.test(exam.fileName || '');
          if (isImg) {
            examVisualHtml = `
              <div class="doc-attachment-preview" style="margin-top: 10px;">
                <div class="doc-attachment-bar">
                  <div class="doc-attachment-info">
                    <span class="doc-attachment-icon">🖼️</span>
                    <div>
                      <strong class="doc-attachment-name">Archivo Adjunto: ${exam.fileName || 'Examen_Clinico.jpg'}</strong>
                      <span class="doc-attachment-sub">${exam.fileSize || ''} · Imagen médica del estudio</span>
                    </div>
                  </div>
                  <a href="${examFile}" download="${exam.fileName || 'examen.jpg'}" target="_blank" class="doc-attachment-btn">
                    <span>🔍</span> Ver Imagen ↗
                  </a>
                </div>
                <div class="doc-image-frame">
                  <img src="${examFile}" alt="${exam.name || 'Examen'}" class="doc-image-content" />
                </div>
              </div>
            `;
          } else {
            examVisualHtml = `
              <div class="doc-attachment-preview" style="margin-top: 10px;">
                <div class="doc-attachment-bar">
                  <div class="doc-attachment-info">
                    <span class="doc-attachment-icon">📄</span>
                    <div>
                      <strong class="doc-attachment-name">Documento PDF Adjunto: ${exam.fileName || 'Examen_Clinico.pdf'}</strong>
                      <span class="doc-attachment-sub">${exam.fileSize || ''} · Informe de laboratorio</span>
                    </div>
                  </div>
                  <a href="${examFile}" download="${exam.fileName || 'examen.pdf'}" target="_blank" class="doc-attachment-btn">
                    <span>📥</span> Abrir PDF ↗
                  </a>
                </div>
                <div class="doc-pdf-frame">
                  <iframe src="${examFile}#toolbar=1" title="${exam.name || 'Examen'}" class="doc-pdf-iframe"></iframe>
                </div>
                <div class="doc-pdf-print-fallback">
                  Documento PDF Adjunto: ${exam.fileName || 'Examen'} (${exam.fileSize || 'N/A'}).
                </div>
              </div>
            `;
          }
        }

        return `
          <div class="exam-card" style="margin-bottom: 12px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div>
                <span style="font-weight: 800; font-size: 13px; color: #0f172a;">🧪 ${exam.name || exam.testName || 'Prueba de Laboratorio Clínico'}</span>
                <span style="font-size: 10.5px; color: #64748b; display: block;">ID: ${exam.id} · Fecha: ${exam.date || exam.orderDate || 'N/A'} · Solicitado por: ${exam.vet || patient.attendingVet || 'Dr. Alejandro Morales'}</span>
              </div>
              <span class="badge ${exam.status === 'Completado' || exam.status === 'Resultado enviado' ? 'badge-emerald' : 'badge-blue'}">
                ${exam.status || 'Completado'}
              </span>
            </div>
            ${exam.resultsSummary || exam.resultSummary ? `
              <div style="margin-top: 6px; font-size: 11.5px; color: #334155;">
                <strong>Resumen de Resultado:</strong> ${exam.resultsSummary || exam.resultSummary}
              </div>
            ` : ''}
            ${exam.notes ? `
              <div style="margin-top: 4px; font-size: 11px; color: #64748b; font-style: italic;">
                ${exam.notes}
              </div>
            ` : ''}
            ${examVisualHtml}
          </div>
        `;
      }).join('')
    : '<div class="empty-state">No registra pruebas de laboratorio convencionales adicionales.</div>';

  const auditHistory = Array.isArray(patient.auditHistory) && patient.auditHistory.length > 0
    ? patient.auditHistory
    : [
        {
          id: 'AUD-INIT',
          fecha: patient.lastVisit || new Date().toLocaleDateString('es-CO'),
          veterinario: patient.attendingVet || 'Dr. Alejandro Morales',
          rol: 'Director Médico / Admin',
          accion: 'Apertura y custodia inicial de la historia clínica digital',
          cambios: [
            { campo: 'Ficha Médica', categoria: 'General', anterior: 'No existía', nuevo: 'Expediente Verificado' }
          ]
        }
      ];

  const auditHistoryHtml = auditHistory.map((item) => `
    <div style="padding: 10px 14px; background: #ffffff; border: 1px solid var(--slate-200); border-radius: 10px; margin-bottom: 8px; font-size: 11.5px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-weight: 800; color: #1e293b;">🕒 ${item.fecha} · <span style="color: var(--primary);">${item.accion}</span></span>
        <span style="font-size: 10.5px; color: #64748b; font-family: monospace;">Por: ${item.veterinario} (${item.rol || 'Médico'})</span>
      </div>
      ${item.cambios && item.cambios.length > 0 ? `
        <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
          ${item.cambios.map((c) => `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569; background: #f8fafc; padding: 3px 8px; border-radius: 6px;">
              <span style="font-weight: 700; color: #0f172a;">[${c.categoria || 'Registro'}] ${c.campo}:</span>
              <span style="text-decoration: line-through; color: #94a3b8;">${c.anterior}</span>
              <span>→</span>
              <strong style="color: #047857;">${c.nuevo}</strong>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Historia Clínica - ${patient.id} - ${fullPatientName}</title>
  <style>
    /* Estilos Estructurales y Visuales VetLab */
    :root {
      --primary: #2B017C;
      --primary-light: #e0f2fe;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-500: #64748b;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --emerald-50: #ecfdf5;
      --emerald-200: #a7f3d0;
      --emerald-700: #047857;
      --rose-50: #fff1f2;
      --rose-200: #fecdd3;
      --rose-800: #9f1239;
      --amber-50: #fffbeb;
      --amber-200: #fde68a;
      --amber-800: #92400e;
      --purple-50: #faf5ff;
      --purple-200: #e9d5ff;
      --purple-800: #6b21a8;
      --sky-50: #f0f9ff;
      --sky-200: #bae6fd;
      --sky-800: #075985;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: var(--slate-800);
      line-height: 1.45;
      font-size: 13px;
      padding-bottom: 40px;
    }

    /* Barra Superior para Visualización / Descarga / Impresión */
    .toolbar-actions {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #ffffff;
      border-bottom: 2px solid #e2e8f0;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .toolbar-title {
      font-weight: 800;
      font-size: 14px;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-btns {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #003d73;
    }
    .btn-outline {
      background: #ffffff;
      color: var(--slate-700);
      border: 1px solid var(--slate-300);
    }
    .btn-outline:hover {
      background: var(--slate-100);
    }

    /* Contenedor del Documento Clínico */
    .document-page {
      max-width: 960px;
      margin: 24px auto;
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 18px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      padding: 36px 40px;
    }

    /* Encabezado Oficial */
    .clinic-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid var(--slate-200);
      padding-bottom: 20px;
      margin-bottom: 24px;
      gap: 20px;
    }
    .clinic-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .clinic-logo {
      width: 54px;
      height: 54px;
      background: linear-gradient(135deg, #2B017C, #6F2BCC);
      color: #ffffff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: 0 4px 10px rgba(0,78,146,0.25);
    }
    .clinic-title {
      font-size: 20px;
      font-weight: 900;
      color: var(--primary);
      letter-spacing: -0.5px;
    }
    .clinic-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta {
      text-align: right;
      font-size: 11px;
    }
    .doc-meta-badge {
      display: inline-block;
      font-family: monospace;
      font-weight: 800;
      font-size: 14px;
      background: var(--slate-100);
      color: var(--slate-800);
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid var(--slate-200);
      margin-bottom: 4px;
    }
    .doc-date {
      color: var(--slate-500);
    }

    /* Secciones */
    .section-block {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--slate-500);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--slate-200);
    }

    /* Tarjetas y Rejillas de Casillas */
    .card-panel {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 14px;
      padding: 16px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .grid-5 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .grid-6 {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .data-box {
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
    }
    .data-box-highlight {
      background: var(--sky-50);
      border-color: var(--sky-200);
    }
    .data-box-purple {
      background: var(--purple-50);
      border-color: var(--purple-200);
    }
    .data-box-amber {
      background: var(--amber-50);
      border-color: var(--amber-200);
    }
    .data-box-rose {
      background: var(--rose-50);
      border-color: var(--rose-200);
    }

    .box-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: var(--slate-500);
      margin-bottom: 2px;
    }
    .box-val {
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-900);
    }
    .box-val.bold {
      font-weight: 800;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid transparent;
      width: fit-content;
    }
    .badge-emerald { background: var(--emerald-50); color: var(--emerald-700); border-color: var(--emerald-200); }
    .badge-emerald-dark { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }
    .badge-amber { background: var(--amber-50); color: var(--amber-800); border-color: var(--amber-200); }
    .badge-rose { background: var(--rose-50); color: var(--rose-800); border-color: var(--rose-200); }
    .badge-blue { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
    .badge-sky { background: var(--sky-50); color: var(--sky-800); border-color: var(--sky-200); }
    .badge-indigo { background: #e0e7ff; color: #3730a3; border-color: #c7d2fe; }
    .badge-purple { background: var(--purple-50); color: var(--purple-800); border-color: var(--purple-200); }
    .badge-slate { background: var(--slate-100); color: var(--slate-700); border-color: var(--slate-200); }
    .badge-slate-dark { background: var(--slate-900); color: #ffffff; border-color: var(--slate-900); }

    .chip {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 700;
      margin: 2px;
    }
    .chip-rose { background: var(--rose-50); color: var(--rose-800); border: 1px solid var(--rose-200); }
    .chip-amber { background: var(--amber-50); color: var(--amber-800); border: 1px solid var(--amber-200); }
    .chip-slate { background: var(--slate-100); color: var(--slate-700); border: 1px solid var(--slate-200); }

    /* Tarjetas de Consultas */
    .consultation-card {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .consultation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--slate-200);
      padding-bottom: 10px;
      margin-bottom: 12px;
      gap: 10px;
      flex-wrap: wrap;
    }
    .consultation-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .consultation-date {
      font-weight: 800;
      color: var(--slate-900);
      font-size: 12.5px;
    }
    .consultation-weight {
      background: #ffffff;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid var(--slate-200);
      font-size: 11px;
      font-weight: 700;
    }
    .consultation-vet {
      font-size: 12px;
      color: var(--slate-500);
    }
    .vet-name {
      color: var(--slate-900);
      font-weight: 800;
    }

    .vital-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 10px;
      padding: 8px 10px;
      margin-bottom: 12px;
    }
    .vital-item {
      display: flex;
      flex-direction: column;
    }
    .vital-label {
      font-size: 9.5px;
      font-weight: 700;
      color: var(--slate-500);
      text-transform: uppercase;
    }
    .vital-val {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--slate-800);
    }

    .consultation-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .consultation-field {
      display: flex;
      flex-direction: column;
    }
    .field-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--slate-700);
      margin-bottom: 3px;
    }
    .field-title-blue {
      color: var(--primary);
    }
    .field-box {
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      color: var(--slate-800);
    }
    .field-box-blue {
      background: #f0f7ff;
      border-color: #bae0fd;
    }

    /* Tarjetas de Exámenes */
    .exam-card {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .exam-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--slate-200);
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .exam-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .exam-icon {
      font-size: 16px;
    }
    .exam-name {
      font-weight: 800;
      font-size: 13px;
      color: var(--slate-900);
      display: block;
    }
    .exam-code {
      font-size: 10.5px;
      color: var(--slate-500);
      font-family: monospace;
      display: block;
    }
    .exam-timestamps {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
    }
    .exam-timestamp-item {
      display: flex;
      flex-direction: column;
    }
    .exam-agents-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 6px;
    }
    .agent-card {
      padding: 6px 10px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }
    .agent-card-pos {
      background: #fff1f2;
      border: 1.5px solid #fda4af;
    }
    .agent-card-neg {
      background: #ffffff;
      border: 1px solid var(--slate-200);
    }
    .agent-name {
      font-size: 11px;
      font-style: italic;
      color: var(--slate-700);
      font-weight: 600;
      display: block;
    }
    .agent-name-pos {
      font-weight: 800;
      color: #9f1239;
    }
    .agent-detail {
      font-size: 9.5px;
      color: var(--slate-500);
    }
    .agent-detail-pos {
      color: #be123c;
      font-weight: 600;
    }

    /* Evolución de Peso */
    .weight-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      margin-bottom: 4px;
      font-size: 11.5px;
    }
    .weight-date { color: var(--slate-500); font-weight: 600; }
    .weight-val { color: var(--slate-900); font-weight: 800; }

    /* Footer Legal */
    .clinic-footer {
      border-top: 2px solid var(--slate-200);
      padding-top: 20px;
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      page-break-inside: avoid;
    }
    .signature-area {
      text-align: center;
      width: 240px;
    }
    .signature-line {
      border-bottom: 1px solid var(--slate-700);
      margin-bottom: 6px;
      height: 40px;
    }
    .signature-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--slate-900);
    }
    .signature-sub {
      font-size: 9.5px;
      color: var(--slate-500);
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--slate-500);
      background: var(--slate-50);
      border: 1px dashed var(--slate-300);
      border-radius: 12px;
      font-size: 12px;
    }

    /* Visualizador de Archivos Adjuntos e Imágenes de Exámenes */
    .doc-attachment-preview {
      margin-top: 14px;
      border: 1px solid var(--slate-300);
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      page-break-inside: avoid;
    }
    .doc-attachment-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: var(--slate-100);
      border-bottom: 1px solid var(--slate-200);
      gap: 12px;
      flex-wrap: wrap;
    }
    .doc-attachment-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .doc-attachment-icon {
      font-size: 20px;
    }
    .doc-attachment-name {
      font-size: 12px;
      font-weight: 800;
      color: var(--slate-900);
      display: block;
    }
    .doc-attachment-sub {
      font-size: 10px;
      color: var(--slate-500);
      font-family: monospace;
      display: block;
    }
    .doc-attachment-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--primary);
      color: #ffffff !important;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .doc-attachment-btn:hover {
      background: #4a148c;
      box-shadow: 0 2px 6px rgba(43, 1, 124, 0.25);
    }
    .doc-image-frame {
      padding: 16px;
      background: #f8fafc;
      text-align: center;
      border-top: 1px solid var(--slate-100);
    }
    .doc-image-content {
      max-width: 100%;
      max-height: 750px;
      width: auto;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--slate-200);
      display: inline-block;
      object-fit: contain;
      background: #ffffff;
    }
    .doc-pdf-frame {
      width: 100%;
      height: 600px;
      background: #ffffff;
    }
    .doc-pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    .doc-pdf-print-fallback {
      display: none;
      padding: 12px;
      font-size: 11px;
      color: var(--slate-600);
      background: #f8fafc;
      border-top: 1px solid var(--slate-200);
      font-style: italic;
    }

    /* Reglas para Impresión / PDF */
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .toolbar-actions {
        display: none !important;
      }
      .document-page {
        margin: 0;
        border: none;
        box-shadow: none;
        padding: 10mm 12mm;
        max-width: 100%;
      }
      .section-block, .consultation-card, .exam-card, .clinic-footer {
        page-break-inside: avoid;
      }
      .doc-attachment-preview {
        page-break-inside: avoid;
        border: 1px solid var(--slate-300);
        margin-top: 10px;
        margin-bottom: 10px;
      }
      .doc-attachment-btn {
        display: none !important;
      }
      .doc-image-content {
        max-height: 850px;
        box-shadow: none;
        border: 1px solid #94a3b8;
      }
      .doc-pdf-frame {
        height: 500px;
        page-break-inside: avoid;
      }
      .doc-pdf-print-fallback {
        display: block;
      }
    }
  </style>
</head>
<body>

  <!-- Barra de Acciones para Visualización & Impresión -->
  <div class="toolbar-actions">
    <div class="toolbar-title">
      <span>🐾</span>
      <span>Expediente Clínico Oficial · VetLab Diagnostics</span>
    </div>
    <div class="toolbar-btns">
      <button onclick="window.print()" class="btn btn-primary">
        <span>🖨️</span> Imprimir / Guardar en PDF
      </button>
      <button onclick="window.close()" class="btn btn-outline">
        <span>✕</span> Cerrar
      </button>
    </div>
  </div>

  <!-- Página Formal de la Historia Clínica -->
  <div class="document-page">
    
    <!-- ENCABEZADO INSTITUCIONAL -->
    <header class="clinic-header">
      <div class="clinic-brand">
        <div class="clinic-logo">🐾</div>
        <div>
          <h1 class="clinic-title">VetLab Diagnostics</h1>
          <p class="clinic-subtitle">Genómica Veterinaria & Centro de Diagnóstico Molecular qPCR</p>
          <p style="font-size: 11px; color: #64748b; margin-top: 3px;">
            Expediente Clínico Digital Unificado · Código de Habilitación Sanitaria #COL-VET-7892
          </p>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-meta-badge">${patient.id}</div>
        <div class="doc-date">Emitido: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
        <div style="margin-top: 4px;">${getStatusBadgeHtml(patient.status)}</div>
      </div>
    </header>

    <!-- CASILLA 1: IDENTIDAD BIOLÓGICA Y DATOS GENERALES DEL PACIENTE -->
    <section class="section-block">
      <h2 class="section-title">🐾 Identidad Biológica & Datos del Paciente</h2>
      <div class="grid-6">
        <div class="data-box" style="grid-column: span 2;">
          <span class="box-label">Nombre del Paciente</span>
          <span class="box-val bold" style="font-size: 14px;">${fullPatientName}</span>
        </div>
        <div class="data-box">
          <span class="box-label">Especie</span>
          <span class="box-val">${patient.species || 'Canino'}</span>
        </div>
        <div class="data-box">
          <span class="box-label">Raza</span>
          <span class="box-val">${patient.breed || 'Criollo'}</span>
        </div>
        <div class="data-box">
          <span class="box-label">Sexo (Inmutable)</span>
          <span class="box-val">${patient.sex || 'N/A'}</span>
        </div>
        <div class="data-box">
          <span class="box-label">F. Nacimiento</span>
          <span class="box-val">${patient.birthDate || 'No registrada'}</span>
        </div>
      </div>

      <div class="grid-4" style="margin-top: 10px;">
        <div class="data-box data-box-highlight">
          <span class="box-label" style="color: var(--sky-800);">🎂 Edad Calculada</span>
          <span class="box-val" style="color: var(--sky-800);">${patient.age || 'No calculada'}</span>
        </div>
        <div class="data-box data-box-highlight">
          <span class="box-label" style="color: var(--sky-800);">⚖️ Peso Actual</span>
          <span class="box-val" style="color: var(--sky-800);">${patient.weight || 'N/A'}</span>
        </div>
        <div class="data-box ${patient.isSterilized ? 'data-box-purple' : ''}">
          <span class="box-label">Esterilización / Castración</span>
          <span class="box-val">
            ${patient.isSterilized 
              ? '<span style="color: var(--purple-800); font-weight: 800;">🔒 Esterilizado(a) · Irreversible</span>' 
              : 'Entero(a)'}
          </span>
        </div>
        <div class="data-box">
          <span class="box-label">Médico Tratante</span>
          <span class="box-val bold">${patient.attendingVet || 'Dr. Alejandro Morales'}</span>
        </div>
      </div>

      <!-- Alergias y Antecedentes -->
      <div class="two-col" style="margin-top: 10px;">
        <div class="data-box ${hasReportedAllergy(patient) ? 'data-box-rose' : ''}">
          <span class="box-label">Alergias o Contraindicaciones</span>
          <span class="box-val">
            ${hasReportedAllergy(patient)
              ? `<span style="color: var(--rose-800);">⚠️ ${getAllergyDisplay(patient)}</span>`
              : 'Sin alergias conocidas'}
          </span>
        </div>
        <div class="data-box">
          <span class="box-label">Antecedentes Médicos Previos</span>
          <span class="box-val" style="font-weight: 600;">
            ${patient.medicalBackground || 'Sin antecedentes patológicos relevantes reportados.'}
          </span>
        </div>
      </div>
    </section>

    <!-- CASILLA 2: DATOS DEL TUTOR / PROPIETARIO -->
    <section class="section-block">
      <h2 class="section-title">👤 Información del Tutor / Propietario</h2>
      <div class="card-panel">
        <div class="grid-3">
          <div class="data-box">
            <span class="box-label">Nombre del Tutor</span>
            <span class="box-val bold">${owner.name || 'No registrado'}</span>
            ${owner.document ? `<span style="font-size: 10.5px; color: var(--slate-500); font-family: monospace;">C.C. ${owner.document}</span>` : ''}
          </div>
          <div class="data-box">
            <span class="box-label">Teléfono Principal</span>
            <span class="box-val">${owner.phone || 'N/A'}</span>
            ${owner.emergencyPhone ? `<span style="font-size: 10.5px; color: var(--rose-800);">🚨 Emergencia: ${owner.emergencyPhone}</span>` : ''}
          </div>
          <div class="data-box">
            <span class="box-label">Correo Electrónico</span>
            <span class="box-val" style="word-break: break-all;">${owner.email || 'N/A'}</span>
          </div>
        </div>

        <div class="grid-3" style="margin-top: 10px;">
          <div class="data-box">
            <span class="box-label">Departamento / Ciudad</span>
            <span class="box-val">${owner.department || 'Bogotá D.C.'} · ${owner.city || 'Bogotá'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Dirección Residencial</span>
            <span class="box-val">${owner.address || 'No registrada'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Estrato Socioeconómico</span>
            <span class="box-val">${owner.stratum || 'Estrato 3'}</span>
          </div>
        </div>

        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--slate-200); display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
          <div>
            <strong>Aseguramiento VetPlus:</strong> 
            ${owner.hasVetPlus ? '<span class="badge badge-emerald" style="margin-left: 6px;">✓ Asegurado con VetPlus</span>' : '<span class="badge badge-slate" style="margin-left: 6px;">No asegurado</span>'}
          </div>
          ${owner.hasVetPlus && owner.vetPlusCode ? `
            <div>
              <span style="color: var(--slate-500);">Código Autorización:</span> 
              <strong style="font-family: monospace; background: #ffffff; padding: 2px 8px; border-radius: 6px; border: 1px solid var(--slate-200);">${owner.vetPlusCode}</strong>
            </div>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- CASILLA 3: HÁBITAT Y FACTORES DE RIESGO EPIDEMIOLÓGICO -->
    <section class="section-block">
      <h2 class="section-title">🌍 Hábitat & Factores de Riesgo Epidemiológico</h2>
      <div class="card-panel">
        <div class="grid-2">
          <div class="data-box">
            <span class="box-label">Hábitat Principal</span>
            <span class="box-val bold">${rf.habitat || 'Interiores'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Contacto con animales fuera</span>
            <span class="box-val">
              ${rf.contactOutside?.hasContact ? `Sí (${rf.contactOutside?.contactType || 'Parque/Paseos'})` : 'No'}
            </span>
          </div>
          <div class="data-box">
            <span class="box-label">Convivencia con otros animales</span>
            <span class="box-val">${rf.livesWithOtherAnimals ? 'Sí' : 'No'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Viajes recientes fuera del depto.</span>
            <span class="box-val">${rf.recentTravel ? 'Sí' : 'No'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Acceso a zonas rurales / boscosas</span>
            <span class="box-val">${rf.ruralAccess ? 'Sí' : 'No'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Historial de parásitos (pulgas/garrapatas)</span>
            <span class="box-val">${rf.parasiteExposure ? '⚠️ Sí' : 'No'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Ingesta de agua estancada / intemperie</span>
            <span class="box-val">${rf.outdoorWater ? 'Sí' : 'No'}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Rescate reciente de zona costera</span>
            <span class="box-val">${rf.coastalRescue ? `Sí${rf.coastalRescueLocation ? ` (${rf.coastalRescueLocation})` : ''}` : 'No'}</span>
          </div>
        </div>
        ${rf.otherRiskFactors ? `
          <div class="data-box" style="margin-top: 10px;">
            <span class="box-label">Otros Factores de Riesgo Reportados</span>
            <span class="box-val">${rf.otherRiskFactors}</span>
          </div>
        ` : ''}
      </div>
    </section>

    <!-- CASILLA 4: ADMISIÓN MÉDICA INICIAL & CONSTANTES VITALES -->
    <section class="section-block">
      <h2 class="section-title">🩺 Admisión Médica Inicial & Constantes Vitales</h2>
      <div class="card-panel">
        <div class="grid-3">
          <div class="data-box">
            <span class="box-label">Condición al Ingreso</span>
            <span class="box-val">
              ${ma.isAsymptomatic ? '<span class="badge badge-emerald">✓ Asintomático</span>' : '<span class="badge badge-rose">⚠️ Presenta Síntomas</span>'}
            </span>
          </div>
          <div class="data-box">
            <span class="box-label">Vacunación</span>
            <span class="box-val">${ma.vaccinationStatus || 'Al día'} ${ma.lastVaccinationDate ? `(${ma.lastVaccinationDate})` : ''}</span>
          </div>
          <div class="data-box">
            <span class="box-label">Desparasitación</span>
            <span class="box-val">${ma.dewormingStatus || 'Al día'} ${ma.lastDewormingDate ? `(${ma.lastDewormingDate})` : ''}</span>
          </div>
        </div>

        ${!ma.isAsymptomatic && ma.symptoms && ma.symptoms.length > 0 ? `
          <div class="data-box data-box-rose" style="margin-top: 10px;">
            <span class="box-label" style="color: var(--rose-800);">Síntomas Clínicos Reportados</span>
            <div style="margin-top: 4px;">${symptomsList} ${ma.otherSymptoms ? `<span class="chip chip-amber">+ ${ma.otherSymptoms}</span>` : ''}</div>
          </div>
        ` : ''}

        ${ma.physicalFindings ? `
          <div class="data-box" style="margin-top: 10px;">
            <span class="box-label">Hallazgos al Examen Físico</span>
            <span class="box-val" style="font-weight: 500;">${ma.physicalFindings}</span>
          </div>
        ` : ''}

        <!-- Signos Vitales de Referencia -->
        <div style="margin-top: 12px;">
          <span style="font-size: 11px; font-weight: 800; color: var(--slate-700); text-transform: uppercase; margin-bottom: 6px; display: block;">
            Constantes Vitales Registradas
          </span>
          <div class="vital-grid" style="margin-bottom: 0;">
            <div class="vital-item">
              <span class="vital-label">Frec. Cardíaca</span>
              <span class="vital-val">${vs.heartRate || '120 bpm'}</span>
            </div>
            <div class="vital-item">
              <span class="vital-label">Temperatura</span>
              <span class="vital-val">${vs.temperature || '38.5 °C'}</span>
            </div>
            <div class="vital-item">
              <span class="vital-label">Frec. Respiratoria</span>
              <span class="vital-val">${vs.respiratoryRate || '22 rpm'}</span>
            </div>
            <div class="vital-item">
              <span class="vital-label">Mucosas</span>
              <span class="vital-val">${vs.mucosa || 'Rosadas y húmedas'}</span>
            </div>
            <div class="vital-item">
              <span class="vital-label">TLLC</span>
              <span class="vital-val">${vs.capillaryRefillTime ? `${vs.capillaryRefillTime} seg` : '1 - 2 seg'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CASILLA 5: HISTORIAL CRONOLÓGICO DE CONSULTAS MÉDICAS -->
    <section class="section-block">
      <h2 class="section-title">📋 Historial de Consultas Médicas (${patient.consultations?.length || 0})</h2>
      ${consultationsHtml}
    </section>

    <!-- CASILLA 6: EXÁMENES MOLECULARES qPCR -->
    <section class="section-block">
      <h2 class="section-title">🔬 Exámenes de Biología Molecular qPCR (${patient.qpcrExams?.length || 0})</h2>
      ${qpcrExamsHtml}
    </section>

    <!-- CASILLA 7: PRUEBAS DE LABORATORIO CLÍNICO CONVENCIONALES -->
    <section class="section-block">
      <h2 class="section-title">🧪 Pruebas de Laboratorio Clínico Convencionales (${clinicalExams.length})</h2>
      ${clinicalExamsHtml}
    </section>

    <!-- CASILLA 8: DOCUMENTOS CLÍNICOS, ARCHIVOS CARGADOS & EXÁMENES PREVIOS -->
    <section class="section-block">
      <h2 class="section-title">📁 Documentos Clínicos, Archivos Cargados & Exámenes Previos (${clinicalDocs.length})</h2>
      ${clinicalDocsHtml}
    </section>

    <!-- CASILLA 9: HISTORIAL EVOLUTIVO DE PESO CORPORAL -->
    <section class="section-block">
      <h2 class="section-title">📈 Historial Evolutivo de Peso Corporal</h2>
      <div class="card-panel">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
          ${weightHistoryHtml}
        </div>
      </div>
    </section>

    <!-- CASILLA 10: TRAZABILIDAD & HISTORIAL DE AUDITORÍA MÉDICA -->
    <section class="section-block">
      <h2 class="section-title">📝 Historial de Auditoría & Trazabilidad de Cambios (${auditHistory.length})</h2>
      <div class="card-panel" style="max-height: 400px; overflow-y: auto;">
        ${auditHistoryHtml}
      </div>
    </section>

    <!-- PIE DE PÁGINA MÉDICO LEGAL -->
    <footer class="clinic-footer">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 18px;">🐾</span>
          <strong style="color: var(--primary); font-size: 13px;">VetLab Central · Red de Diagnóstico Veterinario</strong>
        </div>
        <p style="font-size: 10px; color: var(--slate-500); max-width: 500px;">
          Este documento constituye la copia digital certificada de la historia clínica veterinaria. Generado con trazabilidad criptográfica y custodia conforme a las normas de ejercicio de la medicina veterinaria.
        </p>
      </div>

      <div class="signature-area">
        <div class="signature-line"></div>
        <div class="signature-title">${patient.attendingVet || 'Dr. Alejandro Morales'}</div>
        <div class="signature-sub">Médico Veterinario Tratante · M.P. #VET-98421</div>
      </div>
    </footer>

  </div>

</body>
</html>`;
}

/**
 * Dispara la descarga / visualización formal de la historia clínica en formato visual estructurado.
 * Abre una ventana con el diseño completo listo para Imprimir / Guardar en PDF,
 * y descarga el archivo .html interactivo autocontenido.
 */
export function downloadClinicalHistoryDocument(patient) {
  if (!patient) return;

  const htmlContent = generateClinicalHistoryHtml(patient);
  const patientId = patient.id || 'PAC';
  const patientName = (patient.name || 'Paciente').replace(/\s+/g, '_');
  const filename = `Historia_Clinica_${patientId}_${patientName}.html`;

  // 1. Intentar abrir ventana de vista previa / impresión directa
  let printWindow = null;
  try {
    printWindow = window.open('', '_blank', 'width=1020,height=800,menubar=no,toolbar=no,location=no,status=no');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Pequeño timeout para asegurar que el DOM cargue estilos antes de llamar al diálogo de impresión
      setTimeout(() => {
        try {
          printWindow.focus();
        } catch (_) {}
      }, 300);
    }
  } catch (e) {
    console.warn('Popup bloqueado o no disponible:', e);
  }

  // 2. Descargar siempre el archivo .html autocontenido con el diseño visual para guardarlo localmente
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
