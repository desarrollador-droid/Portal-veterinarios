import React, { useState, useEffect } from 'react';
import ThemeToggle from '../../dashboard/components/ThemeToggle.jsx';
import RegisterClientForm from '../components/RegisterClientForm.jsx';
import { authService } from '../services/authService.js';
import { clinicApi } from '../../dashboard/services/clinicApi.js';

export default function LoginPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!identifier.trim()) {
      setLoginError('Por favor ingresa tu NIT, Cédula o correo electrónico para continuar.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({ identifier, password });
      if (res.success) {
        onLoginSuccess(res.session);
      } else {
        setLoginError(res.message || 'No se pudo iniciar sesión. Verifica la identificación ingresada.');
      }
    } catch (err) {
      setLoginError(err.message || 'Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegisterSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const res = await authService.registerClient(formData);
      if (res.success) {
        onLoginSuccess(res.session);
      } else {
        setLoginError(res.message || 'Error al crear el nuevo cliente.');
      }
    } catch (err) {
      setLoginError(err.message || 'Error inesperado durante el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2B017C] via-[#6F2BCC] to-[#01FADA] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#6F2BCC]/25">
            🧬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-[#2B017C] dark:text-white">
                OSD
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#6F2BCC]/10 text-[#6F2BCC] dark:bg-[#01FADA]/20 dark:text-[#01FADA] border border-[#6F2BCC]/20 dark:border-[#01FADA]/30">
                On Site Diagnostic
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Portal Oficial de Diagnóstico Molecular qPCR y Pruebas Clínicas Veterinarias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle variant="compact" />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Selector de Pestañas: Iniciar Sesión / Registro de Nuevo Cliente */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`px-5 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-[#2B017C] dark:text-[#01FADA] shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🔑</span>
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setLoginError('');
              }}
              className={`px-5 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-[#2B017C] dark:text-[#01FADA] shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>✨</span>
              <span>Registrar Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* PESTAÑA 1: INICIAR SESIÓN */}
        {activeTab === 'login' && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-[#2B017C] to-[#6F2BCC] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#6F2BCC]/30">
                  🔐
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Ingreso al Portal Veterinario OSD
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Accede con el NIT de tu empresa o la cédula de tu consultorio profesional para gestionar pacientes y exámenes.
                </p>
              </div>

              {loginError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 flex items-start gap-3 text-xs text-red-800 dark:text-red-200 animate-in fade-in duration-150">
                  <span className="text-base shrink-0">⚠️</span>
                  <div className="flex-1 font-semibold leading-relaxed">
                    {loginError}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    NIT, Cédula o Correo Electrónico *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Ej. 900845129, 1020456789 o amorales@animalhealth.com.co"
                      autoFocus
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all pl-10"
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">
                      🪪
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Digita el número de identificación sin puntos ni dígito de verificación.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Contraseña / PIN de acceso
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-bold text-[#6F2BCC] dark:text-[#01FADA] hover:underline cursor-pointer"
                    >
                      {showPassword ? '🙈 Ocultar' : '👁️ Ver clave'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6F2BCC] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all pl-10 pr-10"
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">
                      🔒
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    isLoading
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#2B017C] to-[#6F2BCC] hover:from-[#240068] hover:to-[#5e22b0] shadow-[#6F2BCC]/30 hover:scale-[1.01]'
                  }`}
                >
                  <span>{isLoading ? 'Verificando credenciales...' : 'Ingresar al Portal OSD'}</span>
                  <span>→</span>
                </button>
              </form>



              {/* Botón para cambiar a formulario de nuevo cliente */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ¿Es la primera vez que solicitas exámenes en OSD?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setLoginError('');
                  }}
                  className="mt-1.5 text-xs font-extrabold text-[#6F2BCC] dark:text-[#01FADA] hover:underline cursor-pointer"
                >
                  Diligenciar Formulario Oficial de Creación de Clientes →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: FORMULARIO OFICIAL DE CREACIÓN DE CLIENTES */}
        {activeTab === 'register' && (
          <div className="animate-in fade-in duration-200">
            <RegisterClientForm
              onRegisterSubmit={handleRegisterSubmit}
              onCancel={() => setActiveTab('login')}
              isSubmitting={isLoading}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
        On Site Diagnostic (OSD) · Plataforma Integral de Diagnóstico Molecular Veterinario
      </footer>
    </div>
  );
}
