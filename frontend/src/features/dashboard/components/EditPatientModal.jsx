import React, { useState } from 'react';
import { PATIENT_STATUSES } from '../services/patientApi.js';

const COLOMBIA_DEPARTMENTS = [
  'Bogotá D.C.',
  'Antioquia',
  'Cundinamarca',
  'Valle del Cauca',
  'Atlántico',
  'Santander',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Meta',
  'Tolima',
  'Risaralda',
  'Nariño',
  'Huila',
  'Norte de Santander',
  'Otro Departamento',
];

export default function EditPatientModal({ patient, onClose, onSave }) {
  if (!patient) return null;

  const isDeceased = patient.status === 'fallecido';
  const isAlreadySterilized = Boolean(patient.isSterilized);

  const [formData, setFormData] = useState({
    // Parámetros clínicos editables
    weight: patient.weight || '',
    status: patient.status || 'activo',
    isSterilized: isAlreadySterilized || Boolean(patient.isSterilized),
    hasAllergies: Boolean(
      patient.hasAllergies ||
      (patient.allergies && patient.allergies !== 'Ninguna' && patient.allergies !== 'Ninguna reportada' && patient.allergies !== 'Ninguna conocida' && patient.allergies.trim() !== '')
    ),
    allergies: patient.allergies || '',
    medicalBackground: patient.medicalBackground || '',
    notes: patient.notes || '',

    // Signos Vitales
    vitalSignsHeartRate: patient.healthMetrics?.vitalSigns?.heartRate || '120 bpm',
    vitalSignsTemp: patient.healthMetrics?.vitalSigns?.temperature || '38.5 °C',
    vitalSignsResp: patient.healthMetrics?.vitalSigns?.respiratoryRate || '22 rpm',
    vitalSignsMucosa: patient.healthMetrics?.vitalSigns?.mucosa || 'Rosadas y húmedas',
    vitalSignsCapillaryRefillTime: patient.healthMetrics?.vitalSigns?.capillaryRefillTime?.replace('min', 'seg') || '1-2 seg',

    // Tutor
    ownerName: patient.owner?.name || '',
    ownerPhone: patient.owner?.phone || '',
    ownerEmergencyPhone: patient.owner?.emergencyPhone || '',
    ownerEmail: patient.owner?.email || '',
    ownerDepartment: patient.owner?.department || 'Bogotá D.C.',
    ownerCity: patient.owner?.city || 'Bogotá',
    ownerAddress: patient.owner?.address || '',
    ownerStratum: patient.owner?.stratum || 'Estrato 3',
    ownerHasVetPlus: Boolean(patient.owner?.hasVetPlus),
    ownerVetPlusCode: patient.owner?.vetPlusCode || '',

    // Hábitat y factores de riesgo
    habitat: patient.riskFactors?.habitat || 'Interiores',
    coastalRescue: Boolean(patient.riskFactors?.coastalRescue),
    coastalRescueLocation: patient.riskFactors?.coastalRescueLocation || '',

    // Vacunación y desparasitación
    vaccinationStatus: patient.medicalAdmission?.vaccinationStatus || 'Al día',
    lastVaccinationDate: patient.medicalAdmission?.lastVaccinationDate || '',
    dewormingStatus: patient.medicalAdmission?.dewormingStatus || 'Al día',
    lastDewormingDate: patient.medicalAdmission?.lastDewormingDate || '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDeceased) {
      alert('Operación denegada: Un paciente registrado como fallecido no puede ser modificado.');
      return;
    }

    if (formData.status === 'fallecido') {
      const confirmDeceased = window.confirm(
        '⚠️ ATENCIÓN:\n¿Está seguro de marcar al paciente como FALLECIDO?\nUna vez guardado con este estado, la ficha quedará bloqueada permanentemente y NO podrá ser editada para nada.'
      );
      if (!confirmDeceased) return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await onSave({
        weight: formData.weight,
        status: formData.status,
        isSterilized: isAlreadySterilized ? true : formData.isSterilized,
        hasAllergies: formData.hasAllergies,
        allergies: formData.hasAllergies ? formData.allergies.trim() : '',
        medicalBackground: formData.medicalBackground,
        notes: formData.notes,
        owner: {
          name: formData.ownerName,
          phone: formData.ownerPhone,
          emergencyPhone: formData.ownerEmergencyPhone,
          email: formData.ownerEmail,
          department: formData.ownerDepartment,
          city: formData.ownerCity,
          address: formData.ownerAddress,
          stratum: formData.ownerStratum,
          hasVetPlus: formData.ownerHasVetPlus,
          vetPlusCode: formData.ownerVetPlusCode,
        },
        riskFactors: {
          ...patient.riskFactors,
          habitat: formData.habitat,
          coastalRescue: formData.coastalRescue,
          coastalRescueLocation: formData.coastalRescue ? (formData.coastalRescueLocation || '').trim() : '',
        },
        medicalAdmission: {
          ...patient.medicalAdmission,
          vaccinationStatus: formData.vaccinationStatus,
          lastVaccinationDate: formData.lastVaccinationDate,
          dewormingStatus: formData.dewormingStatus,
          lastDewormingDate: formData.lastDewormingDate,
        },
        vitalSigns: {
          heartRate: formData.vitalSignsHeartRate,
          temperature: formData.vitalSignsTemp,
          respiratoryRate: formData.vitalSignsResp,
          mucosa: formData.vitalSignsMucosa,
          capillaryRefillTime: formData.vitalSignsCapillaryRefillTime,
        },
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        <div className="bg-[#f0f6fc] px-6 py-4 border-b border-sky-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Editar Información Clínica: {patient.name} {patient.lastName || ''}
              </h3>
              <p className="text-xs text-slate-500">Expediente: {patient.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {isDeceased ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔒
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              Ficha Bloqueada Permanentemente
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Este paciente está registrado como <span className="font-bold text-slate-900 uppercase">fallecido</span>.
              Por protocolo médico y trazabilidad legal de historias clínicas, su ficha no puede ser editada bajo ninguna circunstancia.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            {formData.status === 'fallecido' && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-xl font-semibold flex items-start gap-2">
                <span>⚠️</span>
                <span>
                  <strong>Atención:</strong> Si guarda al paciente como <strong>Fallecido</strong>, la ficha quedará bloqueada permanentemente y no se podrá volver a editar.
                </span>
              </div>
            )}

            {/* SECCIÓN 1: CAMPOS NO EDITABLES */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔒</span> Identidad Biológica Inmutable (No editable)
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  Edad calculada automáticamente
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">Nombre y Apellido</label>
                  <input
                    type="text"
                    value={`${patient.name} ${patient.lastName || ''}`.trim()}
                    disabled
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 font-bold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">Sexo</label>
                  <input
                    type="text"
                    value={patient.sex || 'Hembra'}
                    disabled
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 font-bold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">F. Nacimiento</label>
                  <input
                    type="text"
                    value={patient.birthDate || 'No registrada'}
                    disabled
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-0.5">Edad Calculada</label>
                  <input
                    type="text"
                    value={patient.age || 'No calculada'}
                    disabled
                    className="w-full px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 font-bold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PARÁMETROS CLÍNICOS ACTUALIZABLES */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Parámetros Clínicos Actualizables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peso Actualizado *
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    placeholder="Ej. 4.2 kg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado del Paciente *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-sky-300 rounded-xl text-xs font-bold text-sky-800 bg-sky-50/50 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {PATIENT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hábitat del Paciente
                  </label>
                  <select
                    name="habitat"
                    value={formData.habitat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="Interiores">Interiores</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Mixto">Mixto</option>
                  </select>
                </div>
              </div>

              {/* Rescate costero */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">¿Rescatado recientemente de zona costera?</span>
                    <span className="text-[11px] text-slate-500">Historial epidemiológico</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, coastalRescue: false, coastalRescueLocation: '' }))}
                      className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${!formData.coastalRescue ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, coastalRescue: true }))}
                      className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${formData.coastalRescue ? 'bg-[#6F2BCC] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >
                      Sí
                    </button>
                  </div>
                </div>

                {formData.coastalRescue && (
                  <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ¿De qué zona costera fue rescatado? <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="coastalRescueLocation"
                      value={formData.coastalRescueLocation || ''}
                      onChange={handleChange}
                      placeholder="Ej. Santa Marta, Cartagena, Barranquilla, Buenaventura, Tumaco..."
                      className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Esterilización */}
              <div className={`mt-3 p-3.5 rounded-xl border flex items-center justify-between ${
                isAlreadySterilized 
                  ? 'bg-purple-50/70 border-purple-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-xs font-bold block ${isAlreadySterilized ? 'text-purple-950 flex items-center gap-1.5' : 'text-slate-800'}`}>
                    {isAlreadySterilized && <span>🔒</span>}
                    ¿Se encuentra esterilizado / castrado?
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isAlreadySterilized ? 'text-purple-700 font-medium' : 'text-slate-500'}`}>
                    {isAlreadySterilized 
                      ? 'Esterilización registrada previamente (Procedimiento quirúrgico irreversible · Información bloqueada)'
                      : 'Nota: Al marcar como esterilizado y guardar, esta información quedará registrada permanentemente.'}
                  </span>
                </div>
                {isAlreadySterilized ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 select-none">
                    <span>✓</span> Esterilizado (Inmutable)
                  </span>
                ) : (
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      name="isSterilized"
                      checked={formData.isSterilized}
                      onChange={handleChange}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                    <span>{formData.isSterilized ? 'Sí, Esterilizado' : 'No (Entero)'}</span>
                  </label>
                )}
              </div>

              {/* Alergias Conocidas */}
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>⚠️</span> ¿Presenta Alergias Conocidas?
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      name="hasAllergies"
                      checked={formData.hasAllergies}
                      onChange={handleChange}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                    <span>{formData.hasAllergies ? 'Sí, Presenta Alergia' : 'No'}</span>
                  </label>
                </div>

                {formData.hasAllergies && (
                  <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Detalle de Alergia:
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="Ej. Sensibilidad a cefalexina, proteína de pollo..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 3: SIGNOS VITALES */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Signos Vitales de Control
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Frec. Cardíaca</label>
                  <input
                    type="text"
                    name="vitalSignsHeartRate"
                    value={formData.vitalSignsHeartRate}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temperatura</label>
                  <input
                    type="text"
                    name="vitalSignsTemp"
                    value={formData.vitalSignsTemp}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Frec. Respiratoria</label>
                  <input
                    type="text"
                    name="vitalSignsResp"
                    value={formData.vitalSignsResp}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mucosas</label>
                  <input
                    type="text"
                    name="vitalSignsMucosa"
                    value={formData.vitalSignsMucosa}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">TLLC (segundos)</label>
                  <input
                    type="text"
                    name="vitalSignsCapillaryRefillTime"
                    value={formData.vitalSignsCapillaryRefillTime}
                    onChange={handleChange}
                    placeholder="1-2 seg"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: ANTECEDENTES Y NOTAS */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Antecedentes Médicos / Patológicos Previos
                </label>
                <textarea
                  name="medicalBackground"
                  value={formData.medicalBackground}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Enfermedades crónicas, cirugías previas..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Seguimiento Clínico
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observaciones de consulta..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* SECCIÓN 5: DATOS DEL TUTOR */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Datos del Tutor / Propietario
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Principal</label>
                  <input
                    type="text"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono de Emergencia</label>
                  <input
                    type="text"
                    name="ownerEmergencyPhone"
                    value={formData.ownerEmergencyPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento</label>
                  <select
                    name="ownerDepartment"
                    value={formData.ownerDepartment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {COLOMBIA_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad / Municipio</label>
                  <input
                    type="text"
                    name="ownerCity"
                    value={formData.ownerCity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estrato Socioeconómico</label>
                  <select
                    name="ownerStratum"
                    value={formData.ownerStratum}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Estrato 1">Estrato 1</option>
                    <option value="Estrato 2">Estrato 2</option>
                    <option value="Estrato 3">Estrato 3</option>
                    <option value="Estrato 4">Estrato 4</option>
                    <option value="Estrato 5">Estrato 5</option>
                    <option value="Estrato 6">Estrato 6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección Residencial</label>
                  <input
                    type="text"
                    name="ownerAddress"
                    value={formData.ownerAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
