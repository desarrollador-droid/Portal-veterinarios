import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import VeterinariansPortal from './features/dashboard/pages/VeterinariansPortal.jsx';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import { authService } from './features/auth/services/authService.js';

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
        <VeterinariansPortal currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </ThemeProvider>
  );
}
