import React from 'react';
import RequestExamModal from './RequestExamModal.jsx';

/**
 * Módulo de Nuevo Examen (qPCR)
 * Renderiza la interfaz de solicitud de examen como un módulo de primera clase
 * en pantalla completa (sin modal / backdrop flotante).
 */
export default function NewExamModule({
  patient,
  patients = [],
  initialExamType = 'nuevo',
  onClose,
  onRequest,
  onNavigateToTracking,
}) {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-4">
      <RequestExamModal
        isModal={false}
        patient={patient}
        patients={patients}
        initialExamType={initialExamType}
        onClose={onClose}
        onRequest={onRequest}
        onNavigateToTracking={onNavigateToTracking}
      />
    </div>
  );
}
