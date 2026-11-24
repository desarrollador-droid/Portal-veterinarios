import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ContextoTema.jsx';
import PortalVeterinarios from './features/dashboard/pages/PortalVeterinarios.jsx';
import PaginaLogin from './features/auth/pages/PaginaLogin.jsx';
import { authService } from './features/auth/services/authService.js';
import AestheticModalContainer from './features/dashboard/components/ModalEstetico.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return authService.getCurrentUser();
    } catch (_) {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'osd_auth_session') {
        try {
          const session = e.newValue ? JSON.parse(e.newValue) : null;
          setCurrentUser(session);
        } catch (_) {
          setCurrentUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (session) => {
    authService.saveSession(session);
    setCurrentUser(session);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <ThemeProvider>
      {currentUser ? (
        <PortalVeterinarios currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <PaginaLogin onLoginSuccess={handleLoginSuccess} />
      )}
      {/* Diálogo y Alertas Estéticas centradas sobrepuestas */}
      <AestheticModalContainer />
    </ThemeProvider>
  );
}
