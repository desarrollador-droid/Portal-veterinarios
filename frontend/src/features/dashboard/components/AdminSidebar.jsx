import React from 'react';
import ThemeToggle from './ThemeToggle.jsx';

/**
 * Iconos vectoriales personalizados para los módulos:
 * Alternan entre Morado (#6F2BCC) y Azul Menta (#01FADA / #009e8a).
 */

// 1. Pacientes - Morado
function PawIcon({ className = "w-5 h-5 text-[#6F2BCC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="12" cy="16.5" rx="3.5" ry="3" />
      <circle cx="7" cy="11.5" r="1.8" />
      <circle cx="10.2" cy="8" r="1.8" />
      <circle cx="13.8" cy="8" r="1.8" />
      <circle cx="17" cy="11.5" r="1.8" />
    </svg>
  );
}

// 2. Nuevo Examen - Azul Menta
function ExamIcon({ className = "w-5 h-5 text-[#009e8a]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      <circle cx="12" cy="12" r="3" fill="#01FADA" fillOpacity="0.45" stroke="currentColor" />
    </svg>
  );
}

// 3. Seguimiento - Morado
function TruckIcon({ className = "w-5 h-5 text-[#6F2BCC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

// 4. Resultados qPCR - Azul Menta
function ResultsIcon({ className = "w-5 h-5 text-[#009e8a]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h12M10 22h4M9 18v-4a4 4 0 0 1 4-4h1" />
      <circle cx="14" cy="6" r="3.2" fill="#01FADA" fillOpacity="0.45" stroke="currentColor" />
      <path d="M9 3l3 3" />
    </svg>
  );
}

// 5. Catálogo qPCR - Morado
function CatalogIcon({ className = "w-5 h-5 text-[#6F2BCC]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h6M9 11h6" />
    </svg>
  );
}

// 6. Evolución Temporal - Azul Menta (#009e8a / #01FADA)
function TimelineChartIcon({ className = "w-5 h-5 text-[#009e8a]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 3 5-7" />
      <circle cx="7" cy="16" r="1.8" fill="#01FADA" fillOpacity="0.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="10" r="1.8" fill="#01FADA" fillOpacity="0.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="13" r="1.8" fill="#01FADA" fillOpacity="0.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="6" r="2.2" fill="#01FADA" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * Panel Lateral Administrativo (AdminSidebar)
 * - Fondo: Gris institucional (#eceff4 / #f1f3f7)
 * - Letras: Moradas (#6F2BCC y #2B017C)
 * - Iconos: Alternados entre Morado (#6F2BCC) y Azul Menta (#01FADA / #009e8a)
 */
export default function AdminSidebar({
  activeModule = 'pacientes',
  onSelectModule,
  onOpenNewPatientWizard,
  onOpenNewExam,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const menuItems = [
    {
      id: 'pacientes',
      label: 'Pacientes',
      iconColor: 'text-[#6F2BCC]',
      iconBg: 'bg-[#6F2BCC]/10 border border-[#6F2BCC]/20',
      renderIcon: () => <PawIcon className="w-5 h-5 text-[#6F2BCC]" />,
    },
    {
      id: 'nuevo-examen',
      label: 'Nuevo Examen',
      iconColor: 'text-[#009e8a]',
      iconBg: 'bg-[#01FADA]/25 border border-[#01FADA]/60',
      renderIcon: () => <ExamIcon className="w-5 h-5 text-[#009e8a]" />,
    },
    {
      id: 'seguimiento',
      label: 'Seguimiento',
      iconColor: 'text-[#6F2BCC]',
      iconBg: 'bg-[#6F2BCC]/10 border border-[#6F2BCC]/20',
      renderIcon: () => <TruckIcon className="w-5 h-5 text-[#6F2BCC]" />,
    },
    {
      id: 'resultados',
      label: 'Resultados qPCR',
      iconColor: 'text-[#009e8a]',
      iconBg: 'bg-[#01FADA]/25 border border-[#01FADA]/60',
      renderIcon: () => <ResultsIcon className="w-5 h-5 text-[#009e8a]" />,
    },
    {
      id: 'catalogo',
      label: 'Catálogo qPCR',
      iconColor: 'text-[#6F2BCC]',
      iconBg: 'bg-[#6F2BCC]/10 border border-[#6F2BCC]/20',
      renderIcon: () => <CatalogIcon className="w-5 h-5 text-[#6F2BCC]" />,
    },
    {
      id: 'evolucion-temporal',
      label: 'Evolución Temporal',
      iconColor: 'text-[#009e8a]',
      iconBg: 'bg-[#01FADA]/25 border border-[#01FADA]/60',
      renderIcon: () => <TimelineChartIcon className="w-5 h-5 text-[#009e8a]" />,
    },
  ];

  return (
    <aside
      className={`bg-[#eceff4] border-r border-slate-300/80 text-slate-800 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 select-none z-40 shrink-0 font-body ${
        isCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* 1. CABECERA ADMINISTRATIVA & LOGO */}
      <div className="p-4 sm:p-5 border-b border-slate-300/70 bg-[#e4e8f0]">
        <div className="flex items-center justify-between">
          <div
            onClick={() => onSelectModule('pacientes')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F2BCC] to-[#01FADA] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#6F2BCC]/25 shrink-0 group-hover:scale-105 transition-transform border border-white/40">
              🧬
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold text-[#2B017C] tracking-tight leading-none block">
                    VetLab
                  </span>
                  <span className="text-[10px] bg-[#01FADA]/25 text-[#007a6a] px-1.5 py-0.5 rounded font-mono font-black border border-[#01FADA]/60">
                    ADMIN
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botón interactivo para colapsar/expandir el panel */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir panel administrativo' : 'Colapsar panel administrativo'}
            className="p-1.5 rounded-lg text-[#6F2BCC] hover:text-[#2B017C] hover:bg-[#6F2BCC]/10 transition-colors cursor-pointer shrink-0 ml-1"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. NAVEGACIÓN MODULAR CENTRAL */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6F2BCC]">
              Módulos
            </div>
          )}

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-white text-[#2B017C] font-extrabold shadow-sm border-l-4 border-[#6F2BCC]'
                      : 'text-[#6F2BCC] hover:text-[#2B017C] hover:bg-white/60 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${
                        isActive ? 'scale-105 shadow-xs' : 'group-hover:scale-105'
                      } transition-transform`}
                    >
                      {item.renderIcon()}
                    </span>
                    {!isCollapsed && (
                      <span className={`text-sm block truncate ${isActive ? 'text-[#2B017C] font-extrabold' : 'text-[#6F2BCC]'}`}>
                        {item.label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ACCIONES RÁPIDAS ADMINISTRATIVAS */}
        {!isCollapsed && (
          <div className="pt-2">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6F2BCC]">
              Acciones Rápidas
            </div>
            <div className="space-y-2 px-1">
              <button
                onClick={onOpenNewPatientWizard}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#6F2BCC] bg-white hover:bg-purple-50/70 border border-[#6F2BCC]/30 transition-all cursor-pointer shadow-xs"
              >
                <span className="text-[#009e8a] font-extrabold text-sm">+</span>
                <span>Registrar Paciente</span>
              </button>

              <button
                onClick={onOpenNewExam}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-[#6F2BCC] hover:bg-[#5b20a8] transition-all cursor-pointer shadow-md shadow-[#6F2BCC]/25 border border-[#01FADA]/50"
              >
                <span className="text-[#01FADA]">✨</span>
                <span>Solicitar Nuevo Examen</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. FOOTER DEL PANEL: PERFIL DEL ADMINISTRADOR & MODO OSCURO */}
      <div className="p-3 sm:p-4 border-t border-slate-300/70 bg-[#e4e8f0]">
        {/* Switch de Modo Claro / Oscuro */}
        <div className="mb-3">
          {!isCollapsed ? (
            <ThemeToggle variant="sidebar" />
          ) : (
            <div className="flex justify-center">
              <ThemeToggle variant="compact" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F2BCC] to-[#01FADA] text-white font-black text-xs flex items-center justify-center shadow-sm border border-white">
              AM
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#01FADA] ring-2 ring-white" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#2B017C] block truncate leading-tight">
                Dr. Alejandro Morales
              </span>
              <span className="text-[10px] text-[#6F2BCC] font-semibold block truncate leading-none mt-0.5">
                Médico Director / Admin
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
