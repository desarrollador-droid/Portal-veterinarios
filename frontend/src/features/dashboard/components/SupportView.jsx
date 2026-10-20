import React, { useState } from 'react';

// Preguntas frecuentes estructuradas según Figma
const FAQ_CATEGORIES = [
  {
    id: 'muestras',
    title: 'SOBRE LAS MUESTRAS',
    items: [
      {
        id: 'm1',
        question: '¿Cuánto tiempo tarda en llegar el repartidor?',
        answer:
          'El tiempo promedio de recolección es de 45 a 90 minutos hábiles tras la confirmación de la orden en el área metropolitana. Puedes monitorear la ubicación y estado del mensajero en tiempo real desde el módulo de Seguimiento.',
      },
      {
        id: 'm2',
        question: '¿Qué hago si la muestra no fue tomada correctamente?',
        answer:
          'Comunícate de inmediato con el laboratorio a través de nuestro chat en vivo o vía telefónica antes de que el repartidor recoja el paquete. Si la muestra ya llegó a recepción y no cumple los criterios de calidad molecular (hisopo seco, volumen insuficiente o medio inadecuado), te notificaremos vía portal para autorizar una nueva toma sin costo adicional de procesamiento.',
      },
      {
        id: 'm3',
        question: '¿Cuánto tiempo puede conservarse la muestra antes de ser entregada?',
        answer:
          'Para muestras moleculares en medio de transporte viral/bacteriano qPCR, se recomienda mantener en refrigeración (2°C a 8°C) por un máximo de 24 a 48 horas antes de la entrega al mensajero. Nunca congelar hisopados a menos que el protocolo del panel específico lo indique.',
      },
    ],
  },
  {
    id: 'resultados',
    title: 'SOBRE LOS RESULTADOS',
    items: [
      {
        id: 'r1',
        question: '¿Cómo descargo un resultado en PDF?',
        // Texto textual idéntico a Figma
        answer:
          "En la ficha del paciente, en la sección 'Historial de exámenes', encontrarás un botón de descarga junto a cada resultado disponible.",
      },
      {
        id: 'r2',
        question: '¿Puedo cambiar el perfil solicitado después de crear la orden?',
        answer:
          "Sí, dispones de 1 cambio gratuito de agentes o cambio de panel siempre y cuando la muestra se encuentre en los estados 'Orden creada' o 'Asignando repartidor'. Una vez la muestra ingresa a 'Procesando qPCR' en el laboratorio, no se podrán realizar modificaciones.",
      },
      {
        id: 'r3',
        question: '¿Cuándo están disponibles los resultados?',
        answer:
          'Los paneles qPCR urgentes se emiten en un lapso de 6 a 12 horas hábiles tras el ingreso a laboratorio. Los paneles estándar están disponibles entre 24 y 48 horas. Recibirás una notificación en el portal y copia en tu correo registrado.',
      },
    ],
  },
  {
    id: 'facturacion',
    title: 'SOBRE FACTURACIÓN',
    items: [
      {
        id: 'f1',
        question: '¿Cómo se genera la factura del examen?',
        answer:
          'La factura electrónica se emite automáticamente al completar la validación patológica del examen y se envía al correo registrado del médico veterinario o clínica. Si el paciente cuenta con cobertura VetPlus, se aplica directamente la tarifa de convenio y descuento autorizado.',
      },
      {
        id: 'f2',
        question: '¿Hay costos adicionales si el repartidor no puede recoger la muestra?',
        answer:
          'El primer intento de recolección está 100% incluido en la tarifa del examen. Si la clínica se encuentra cerrada o la muestra no está lista tras 15 minutos de espera del repartidor, se podrá reprogramar una segunda recogida con una tarifa estándar de logística local.',
      },
    ],
  },
];

export default function SupportView() {
  const [searchTerm, setSearchTerm] = useState('');
  // r1 abierto por defecto tal como en la captura 2 de Figma
  const [openItems, setOpenItems] = useState({ r1: true });
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'agent',
      name: 'Dra. Camila Ospina',
      role: 'Soporte Molecular VetLab',
      time: 'Justo ahora',
      text: '¡Hola Dr. Morales! Bienvenido al soporte técnico de VetLab (On Site Diagnostic). ¿En qué podemos asesorarte hoy sobre tus órdenes qPCR o recolección de muestras?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'terms' | 'privacy' | null

  const toggleAccordion = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg = {
      sender: 'user',
      name: 'Dr. Alejandro Morales',
      time: 'Justo ahora',
      text: userText,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Respuesta simulada inteligente del patólogo de soporte
    setTimeout(() => {
      let replyText =
        'Hemos recibido tu mensaje en el centro de diagnóstico. Un patólogo molecular de guardia está revisando tu consulta y te responderá en breve.';
      const lower = userText.toLowerCase();
      if (lower.includes('muestra') || lower.includes('hisopo')) {
        replyText =
          'Para toma y conservación de muestras, recuerda utilizar hisopo estéril de dacrón sin carbón activado y refrigerar de 2°C a 8°C.';
      } else if (lower.includes('repartidor') || lower.includes('tiempo')) {
        replyText =
          'El repartidor asignado a tu zona está en ruta. Puedes verificar el estado exacto en la pestaña "Seguimiento".';
      } else if (lower.includes('resultado') || lower.includes('pdf')) {
        replyText =
          'Puedes descargar los informes validados directamente desde la ficha del paciente o en el módulo "Resultados qPCR".';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          name: 'Dra. Camila Ospina',
          role: 'Soporte Molecular VetLab',
          time: 'En este momento',
          text: replyText,
        },
      ]);
    }, 1000);
  };

  // Filtrado de preguntas frecuentes
  const filteredCategories = FAQ_CATEGORIES.map((cat) => {
    const matchingItems = cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return {
      ...cat,
      items: matchingItems,
    };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 font-body animate-in fade-in duration-150">
      {/* 1. ENCABEZADO DE SECCIÓN (Idéntico a Figma) */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b49] dark:text-white tracking-tight">
          Ayuda y soporte
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Encuentra respuestas o contáctanos directamente
        </p>
      </div>

      {/* 2. BARRA DE BÚSQUEDA (Idéntica a Figma) */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar en preguntas frecuentes..."
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-sky-100 dark:border-[#2a2048] bg-white dark:bg-[#15102a] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#01FADA] focus:border-transparent text-sm sm:text-base shadow-xs transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* 3. LISTADO DE PREGUNTAS FRECUENTES POR CATEGORÍA (ACORDEONES) */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="bg-white dark:bg-[#15102a] border border-sky-100 dark:border-[#2a2048] rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#6F2BCC] flex items-center justify-center text-xl mb-3">
              🔍
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">
              No encontramos resultados para "{searchTerm}"
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Intenta con otra palabra clave o contáctanos de inmediato a través de nuestros canales de atención directa.
            </p>
            <button
              onClick={() => setShowLiveChatModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6F2BCC] text-white text-xs font-bold hover:bg-[#5b20a8] transition-colors"
            >
              <span>💬</span> Iniciar chat en vivo
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              {/* Título de Categoría: SOBRE LAS MUESTRAS, etc. */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                {category.title}
              </div>

              {/* Contenedor tipo Tarjeta con acordeones interiores */}
              <div className="bg-white dark:bg-[#15102a] border border-sky-100 dark:border-[#2a2048] rounded-2xl shadow-xs overflow-hidden divide-y divide-sky-100/70 dark:divide-[#2a2048]">
                {category.items.map((item) => {
                  const isOpen = !!openItems[item.id];
                  return (
                    <div key={item.id} className="transition-colors">
                      {/* Cabecera del Acordeón con estilo exacto de Figma */}
                      <button
                        onClick={() => toggleAccordion(item.id)}
                        className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-all cursor-pointer ${
                          isOpen
                            ? 'bg-slate-50/70 dark:bg-slate-900/50'
                            : 'hover:bg-slate-50/40 dark:hover:bg-white/5'
                        }`}
                      >
                        <span
                          className={`text-sm sm:text-[15px] font-semibold leading-snug transition-colors ${
                            isOpen
                              ? 'text-[#1a2b49] dark:text-[#01FADA] font-bold'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.question}
                        </span>

                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-base font-bold transition-all ${
                            isOpen
                              ? 'text-slate-600 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {/* Contenido expandido del Acordeón */}
                      {isOpen && (
                        <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#15102a] border-t border-sky-50 dark:border-[#2a2048]/60">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. SECCIÓN CONTACTO DIRECTO (3 TARJETAS HORIZONTALES) */}
      <div className="mt-10">
        <h2 className="text-lg sm:text-xl font-bold text-[#1a2b49] dark:text-white mb-4">
          Contacto directo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tarjeta 1: Llámanos */}
          <div className="bg-white dark:bg-[#15102a] border border-sky-100 dark:border-[#2a2048] rounded-2xl p-6 flex flex-col items-center text-center shadow-xs hover:border-[#6F2BCC]/30 transition-all group">
            <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-pink-950/30 text-[#e02460] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 rotate-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">
              Llámanos
            </h3>

            <a
              href="tel:+576012345678"
              className="text-sm font-bold text-[#0066cc] dark:text-[#01FADA] hover:underline mb-1"
            >
              601 234 5678
            </a>

            <span className="text-xs text-slate-400 dark:text-slate-400">
              Lun–Vie 8am–6pm
            </span>
          </div>

          {/* Tarjeta 2: Escríbenos */}
          <div className="bg-white dark:bg-[#15102a] border border-sky-100 dark:border-[#2a2048] rounded-2xl p-6 flex flex-col items-center text-center shadow-xs hover:border-[#6F2BCC]/30 transition-all group">
            <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/30 text-[#0066cc] dark:text-[#01FADA] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">
              Escríbenos
            </h3>

            <a
              href="mailto:soporte@vetportal.co"
              className="text-sm font-bold text-[#0066cc] dark:text-[#01FADA] hover:underline mb-1"
            >
              soporte@vetportal.co
            </a>

            <span className="text-xs text-slate-400 dark:text-slate-400">
              Respuesta en &lt; 24h
            </span>
          </div>

          {/* Tarjeta 3: Chat en vivo (Idéntico a Figma) */}
          <div className="bg-white dark:bg-[#15102a] border border-sky-100 dark:border-[#2a2048] rounded-2xl p-6 flex flex-col items-center text-center shadow-xs hover:border-[#6F2BCC]/30 transition-all group">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/30 text-[#6F2BCC] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">
              Chat en vivo
            </h3>

            <div className="text-sm font-bold text-[#0066cc] dark:text-[#01FADA] mb-1">
              Disponible 9am–5pm
            </div>

            <span className="text-xs text-slate-400 dark:text-slate-400 mb-4">
              Tiempo prom. 3 min
            </span>

            <button
              onClick={() => setShowLiveChatModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#c5e1fc] hover:bg-[#b0d5fb] text-[#0b5394] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs dark:bg-[#6F2BCC]/30 dark:hover:bg-[#6F2BCC]/50 dark:text-[#01FADA] border border-transparent dark:border-[#01FADA]/30"
            >
              Iniciar chat
            </button>
          </div>
        </div>
      </div>

      {/* 5. PIE DE PÁGINA (Idéntico a Figma) */}
      <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-[#2a2048] flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => setActiveLegalModal('terms')}
          className="hover:text-[#6F2BCC] dark:hover:text-[#01FADA] transition-colors cursor-pointer"
        >
          Términos y condiciones
        </button>
        <button
          onClick={() => setActiveLegalModal('privacy')}
          className="hover:text-[#6F2BCC] dark:hover:text-[#01FADA] transition-colors cursor-pointer"
        >
          Política de privacidad
        </button>
      </div>

      {/* MODAL 1: CHAT EN VIVO INTERACTIVO */}
      {showLiveChatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15102a] border border-sky-100 dark:border-[#2a2048] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[560px] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabecera del Chat */}
            <div className="p-4 bg-gradient-to-r from-[#6F2BCC] to-[#2B017C] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold border border-white/30">
                    👩‍⚕️
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#01FADA] ring-2 ring-[#2B017C]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">Dra. Camila Ospina</h4>
                  <p className="text-[11px] text-[#01FADA] font-semibold flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#01FADA] animate-pulse" />
                    En línea · Asesoría Molecular qPCR
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/573001234567?text=Hola,%20requiero%20soporte%20con%20VetLab%20Portal"
                  target="_blank"
                  rel="noreferrer"
                  title="Continuar por WhatsApp"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>💬</span> WhatsApp
                </a>
                <button
                  onClick={() => setShowLiveChatModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-[#0c0a18]/60">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-bold">{msg.name}</span>
                    <span>·</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#6F2BCC] text-white rounded-br-none shadow-xs'
                        : 'bg-white dark:bg-[#1a1435] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#2a2048] rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario de Entrada */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-3 bg-white dark:bg-[#15102a] border-t border-slate-200 dark:border-[#2a2048] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2a2048] bg-slate-50 dark:bg-[#0c0a18] text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#01FADA]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#6F2BCC] hover:bg-[#5b20a8] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TÉRMINOS Y CONDICIONES / POLÍTICA DE PRIVACIDAD */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15102a] border border-sky-100 dark:border-[#2a2048] rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2a2048] mb-4">
              <h3 className="text-base font-bold text-[#2B017C] dark:text-[#01FADA]">
                {activeLegalModal === 'terms'
                  ? 'Términos y Condiciones del Servicio'
                  : 'Política de Privacidad & Tratamiento de Datos'}
              </h3>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 max-h-80 overflow-y-auto pr-2">
              {activeLegalModal === 'terms' ? (
                <>
                  <p>
                    1. <strong>Finalidad del Portal:</strong> VetLab (On Site Diagnostic) proporciona una plataforma de gestión diagnóstica molecular para médicos veterinarios colegiados.
                  </p>
                  <p>
                    2. <strong>Responsabilidad de Muestras:</strong> La exactitud analítica de los ensayos qPCR depende de la correcta recolección, rotulado y conservación de las muestras según la guía técnica del catálogo.
                  </p>
                  <p>
                    3. <strong>Tiempos de Entrega:</strong> Los tiempos estimados (6 a 48 horas) están sujetos a condiciones logísticas y validación médica patológica.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    1. <strong>Protección de Datos:</strong> VetLab cumple con la normativa de protección de datos personales (Ley 1581 de Colombia y estándares internacionales de salud).
                  </p>
                  <p>
                    2. <strong>Uso de Información Clínica:</strong> Los datos de pacientes, tutores y resultados diagnósticos se almacenan con cifrado de grado clínico y sólo son accesibles por personal autorizado y la clínica remitente.
                  </p>
                  <p>
                    3. <strong>Confidencialidad:</strong> Los resultados moleculares nunca serán compartidos con terceros sin previa autorización expresa del médico veterinario titular.
                  </p>
                </>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-[#2a2048] flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 rounded-xl bg-[#6F2BCC] text-white font-bold text-xs hover:bg-[#5b20a8] transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
