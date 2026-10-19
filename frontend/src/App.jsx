import React from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import VeterinariansPortal from './features/dashboard/pages/VeterinariansPortal.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <VeterinariansPortal />
    </ThemeProvider>
  );
}
