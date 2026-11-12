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
  currentUser = null,
  initialExamType = 'nuevo',
  initialRequestCategory = null,
  initialClinicalExam = null,
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
        currentUser={currentUser}
        initialExamType={initialExamType}
        initialRequestCategory={initialRequestCategory}
        initialClinicalExam={initialClinicalExam}
        onClose={onClose}
        onRequest={onRequest}
        onNavigateToTracking={onNavigateToTracking}
      />
    </div>
  );
}
