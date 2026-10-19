import React, { useState } from 'react';

export default function NewConsultationModal({ patient, onClose, onConsultationSaved }) {
  if (!patient) return null;

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const cleanNumeric = (str) => {
    if (!str) return '';
    return str.toString().replace(/[^0-9.]/g, '');
  };

  const cleanInt = (str) => {
    if (!str) return '';
    return str.toString().replace(/\D/g, '');
  };

  const [formData, setFormData] = useState({
    date: defaultDate,
    time: defaultTime,
    vet: patient.attendingVet || 'Dr. Alejandro Morales',
    weight: cleanNumeric(patient.weight),
    clinicalStatus: 'Bueno', // bueno, regular, malo, critico, estable
    vitalSignsHeartRate: cleanInt(patient.healthMetrics?.vitalSigns?.heartRate),
    vitalSignsTemp: cleanNumeric(patient.healthMetrics?.vitalSigns?.temperature),
    vitalSignsResp: cleanInt(patient.healthMetrics?.vitalSigns?.respiratoryRate),
    vitalSignsMucosa: patient.healthMetrics?.vitalSigns?.mucosa || '',
    reason: '',
    medication: '',
    relevantBackground: '',
    observationsAndFollowUp: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (fieldName, allowDecimal = false) => (e) => {
    let val = e.target.value;
    if (allowDecimal) {
      val = val.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) {
        val = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      val = val.replace(/\D/g, '');
    }
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      setErrorMsg('Por favor ingrese el motivo de la consulta.');
      return;
    }
    if (!formData.weight.trim()) {
      setErrorMsg('Por favor ingrese el peso actual del paciente en esta consulta.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        date: formData.date,
        time: formData.time,
        vet: formData.vet.trim(),
        weight: formData.weight.trim() ? (formData.weight.trim().toLowerCase().includes('kg') ? formData.weight.trim() : `${formData.weight.trim()} kg`) : '',
        clinicalStatus: formData.clinicalStatus,
        vitalSigns: {
          heartRate: formData.vitalSignsHeartRate.trim() ? (formData.vitalSignsHeartRate.trim().toLowerCase().includes('bpm') ? formData.vitalSignsHeartRate.trim() : `${formData.vitalSignsHeartRate.trim()} bpm`) : 'No registrada',
          temperature: formData.vitalSignsTemp.trim() ? (formData.vitalSignsTemp.trim().includes('°') ? formData.vitalSignsTemp.trim() : `${formData.vitalSignsTemp.trim()} °C`) : 'No registrada',
          respiratoryRate: formData.vitalSignsResp.trim() ? (formData.vitalSignsResp.trim().toLowerCase().includes('rpm') ? formData.vitalSignsResp.trim() : `${formData.vitalSignsResp.trim()} rpm`) : 'No registrada',
          mucosa: formData.vitalSignsMucosa.trim() || 'No registrada',
        },
        reason: formData.reason.trim(),
        medication: formData.medication.trim(),
        relevantBackground: formData.relevantBackground.trim(),
        observationsAndFollowUp: formData.observationsAndFollowUp.trim(),
      };

      await onConsultationSaved(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar la consulta médica');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-[#6F2BCC] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🩺</span>
              <h3 className="text-base font-bold tracking-tight">
                Registrar Consulta Médica
              </h3>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Paciente: <strong className="text-white">{patient.name} {patient.lastName || ''}</strong> ({patient.species} · {patient.breed})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-bold text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Fecha, Hora y Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha de la Consulta *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hora de Atención *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Médico Tratante *</label>
              <input
                type="text"
                name="vet"
                value={formData.vet}
                onChange={handleChange}
                required
                placeholder="Dr. Nombre Apellido"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Peso y Estado Clínico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Peso Actual en Consulta *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  name="weight"
                  value={formData.weight}
                  onChange={handleNumericChange('weight', true)}
                  required
                  placeholder="12.5"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-sky-300 bg-sky-50/40 rounded-xl font-bold text-sky-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 pointer-events-none select-none">
                  kg
                </span>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estado Clínico *
              </label>
              <select
                name="clinicalStatus"
                value={formData.clinicalStatus}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
              >
                <option value="Bueno">Bueno (Estable y alerta)</option>
                <option value="Regular">Regular (Compromiso leve)</option>
                <option value="Malo">Malo (Deterioro evidente)</option>
                <option value="Crítico">Crítico (Urgencia / UCI)</option>
                <option value="Estable">Estable (Control y compensado)</option>
              </select>
            </div>
          </div>

          {/* Signos Vitales */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider block text-[11px]">
              Signos Vitales de Control
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Frec. Cardíaca</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="vitalSignsHeartRate"
                    value={formData.vitalSignsHeartRate}
                    onChange={handleNumericChange('vitalSignsHeartRate', false)}
                    placeholder="120"
                    className="w-full pl-2.5 pr-11 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[11px] text-slate-400 pointer-events-none select-none">
                    bpm
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Temperatura</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    name="vitalSignsTemp"
                    value={formData.vitalSignsTemp}
                    onChange={handleNumericChange('vitalSignsTemp', true)}
                    placeholder="38.5"
                    className="w-full pl-2.5 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[11px] text-slate-400 pointer-events-none select-none">
                    °C
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Frec. Respiratoria</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="vitalSignsResp"
                    value={formData.vitalSignsResp}
                    onChange={handleNumericChange('vitalSignsResp', false)}
                    placeholder="22"
                    className="w-full pl-2.5 pr-11 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-[11px] text-slate-400 pointer-events-none select-none">
                    rpm
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Estado Mucosas</label>
                <input
                  type="text"
                  name="vitalSignsMucosa"
                  value={formData.vitalSignsMucosa}
                  onChange={handleChange}
                  placeholder="Ej. Rosadas y húmedas"
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Motivo de la Consulta */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Motivo de la Consulta *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="2"
              required
              placeholder="Describa el motivo de la consulta o cuadro clínico referido por el tutor..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Medicación */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Medicación Prescrita / Administrada
            </label>
            <textarea
              name="medication"
              value={formData.medication}
              onChange={handleChange}
              rows="2"
              placeholder="Fármacos formulados, dosis, vía de administración, frecuencia y duración..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Antecedentes Relevantes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Antecedentes Relevantes
            </label>
            <textarea
              name="relevantBackground"
              value={formData.relevantBackground}
              onChange={handleChange}
              rows="2"
              placeholder="Antecedentes médicos, tratamientos previos o hallazgos clínicos de interés..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Observaciones y Seguimiento */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Observaciones y Plan de Seguimiento
            </label>
            <textarea
              name="observationsAndFollowUp"
              value={formData.observationsAndFollowUp}
              onChange={handleChange}
              rows="2"
              placeholder="Evolución esperada, recomendaciones para el tutor, cita de control..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#6F2BCC] hover:bg-[#581ea3] text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando consulta...' : 'Guardar Consulta Médica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
