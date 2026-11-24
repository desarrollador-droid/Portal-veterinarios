import React, { useState, useEffect } from 'react';

// Dispatcher global para invocar modales desde cualquier parte de la aplicación
let modalDispatcher = null;

/**
 * Invoca un diálogo de confirmación estético centrado en la pantalla (Aceptar / Cancelar)
 * Retorna una Promesa que resuelve a `true` si el usuario acepta, o `false` si cancela.
 */
export function showAestheticConfirm({
  title = '¿Está seguro de continuar?',
  message = '',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
}) {
  return new Promise((resolve) => {
    if (modalDispatcher) {
      modalDispatcher({
        isOpen: true,
        mode: 'confirm',
        title,
        message,
        type,
        confirmText,
        cancelText,
        onResolve: (val) => resolve(Boolean(val)),
      });
    } else {
      resolve(window.confirm(`${title}\n\n${message}`));
    }
  });
}

/**
 * Invoca un diálogo de alerta o advertencia estético centrado en la pantalla (Entendido)
 * Retorna una Promesa que resuelve al cerrar.
 */
export function showAestheticAlert({
  title = 'Aviso',
  message = '',
  type = 'info', // 'info' | 'warning' | 'danger' | 'success'
  confirmText = 'Entendido',
}) {
  return new Promise((resolve) => {
    if (modalDispatcher) {
      modalDispatcher({
        isOpen: true,
        mode: 'alert',
        title,
        message,
        type,
        confirmText,
        cancelText: null,
        onResolve: () => resolve(),
      });
    } else {
      window.alert(`${title}\n\n${message}`);
      resolve();
    }
  });
}

/**
 * Contenedor Global del Modal Estético
 * Se renderiza al nivel más alto en App.jsx para sobreponerse centrado sobre cualquier vista o modal.
 */
export default function AestheticModalContainer() {
  const [modalState, setModalState] = useState(null);

  useEffect(() => {
    modalDispatcher = setModalState;
    return () => {
      modalDispatcher = null;
    };
  }, []);

  if (!modalState || !modalState.isOpen) return null;

  const handleConfirm = () => {
    const onResolve = modalState.onResolve;
    setModalState(null);
    if (typeof onResolve === 'function') onResolve(true);
  };

  const handleCancel = () => {
    const onResolve = modalState.onResolve;
    setModalState(null);
    if (typeof onResolve === 'function') onResolve(false);
  };

  // Ícono y paleta según el tipo
  const getTypeConfig = () => {
    switch (modalState.type) {
      case 'danger':
        return {
          icon: '🚨',
          iconBg: 'bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          badgeText: 'ACCIÓN CRÍTICA',
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          badgeText: 'ADVERTENCIA',
        };
      case 'success':
        return {
          icon: '✓',
          iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          badgeText: 'ÉXITO',
        };
      case 'info':
      default:
        return {
          icon: '🧬',
          iconBg: 'bg-purple-100 text-[#6F2BCC] border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
          confirmBtn: 'bg-[#6F2BCC] hover:bg-[#581ea3] text-white shadow-purple-600/30',
          badgeBg: 'bg-purple-100 text-[#2B017C] border-purple-200',
          badgeText: 'INFORMACIÓN',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        // Clic en el backdrop cancela/cierra
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Cabecera con ícono e insignia */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${config.iconBg}`}>
            <span>{config.icon}</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${config.badgeBg}`}>
            {config.badgeText}
          </span>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
            {modalState.title}
          </h3>
        </div>

        {/* Mensaje descriptivo con estilo estético */}
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed whitespace-pre-line px-1">
          {modalState.message}
        </div>

        {/* Botones de acción centrados */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {modalState.mode === 'confirm' && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {modalState.cancelText || 'Cancelar'}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            autoFocus
            className={`flex-1 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${config.confirmBtn}`}
          >
            {modalState.confirmText || (modalState.mode === 'confirm' ? 'Aceptar' : 'Entendido')}
          </button>
        </div>
      </div>
    </div>
  );
}
