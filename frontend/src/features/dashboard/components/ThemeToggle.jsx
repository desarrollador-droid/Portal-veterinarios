import React from 'react';
import { useTheme } from '../../../context/ThemeContext.jsx';

export default function ThemeToggle({ variant = 'compact', className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-xs font-bold ${
          isDark
            ? 'bg-[#1e1838] border-[#01FADA]/50 text-[#01FADA] hover:bg-[#28204d] shadow-sm shadow-[#01FADA]/10'
            : 'bg-white border-purple-200 text-[#6F2BCC] hover:bg-purple-50/80 shadow-xs'
        } ${className}`}
      >
        <span className="text-sm transition-transform duration-300">
          {isDark ? '🌙' : '☀️'}
        </span>
        <span className="hidden sm:inline">
          {isDark ? 'Modo Oscuro' : 'Modo Claro'}
        </span>
      </button>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={isDark ? 'Cambiar a Modo Claro (☀️)' : 'Cambiar a Modo Oscuro (🌙)'}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-[#1e1838] hover:bg-[#28204d] text-slate-200 border border-[#382d5e]'
            : 'bg-white hover:bg-slate-100/90 text-slate-700 border border-slate-300/80'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
          <span className="truncate">{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </div>
        <div
          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center ${
            isDark ? 'bg-[#6F2BCC]' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
              isDark ? 'translate-x-3.5' : 'translate-x-0'
            }`}
          />
        </div>
      </button>
    );
  }

  // Variante por defecto: compacta para el Navbar / Header superior
  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Cambiar a Modo Claro (☀️)' : 'Cambiar a Modo Oscuro (🌙)'}
      aria-label="Alternar modo claro y oscuro"
      className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border ${
        isDark
          ? 'bg-[#1e1838] text-[#01FADA] border-[#382d5e] hover:border-[#01FADA]/60 hover:bg-[#28204d] shadow-sm shadow-[#01FADA]/10'
          : 'bg-slate-100/80 text-slate-700 border-slate-200 hover:text-[#6F2BCC] hover:bg-purple-50/70 hover:border-purple-200 shadow-2xs'
      } ${className}`}
    >
      {isDark ? (
        // Icono de Luna con estrella
        <svg
          className="w-5 h-5 transition-transform duration-300 hover:rotate-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M19 3v4m2-2h-4" strokeWidth="1.8" />
        </svg>
      ) : (
        // Icono de Sol
        <svg
          className="w-5 h-5 transition-transform duration-300 hover:rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
