import axios from 'axios';
import { INITIAL_CLINICS } from '../../../../../backend/src/models/clinicModel.js';

const API_BASE_URL = 'http://localhost:5000/api/clinics';

// Almacén en memoria en el cliente sincronizado con localStorage para persistencia offline / Vercel
const STORAGE_KEY = 'vetlab_clinics_data';
const ACTIVE_STORAGE_KEY = 'vetlab_active_clinic_id';

function getStoredClinics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [...INITIAL_CLINICS];
}

function saveStoredClinics(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

export const COLOMBIAN_CITIES = [
  'Bogotá D.C.',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Bucaramanga',
  'Cartagena',
  'Pereira',
  'Manizales',
  'Santa Marta',
  'Cúcuta',
  'Ibagué',
  'Pasto',
  'Villavicencio',
  'Armenia',
  'Neiva',
  'Montería',
  'Valledupar',
  'Popayán',
  'Tunja',
  'Sincelejo',
  'Riohacha',
  'Rionegro / Oriente Antioqueño',
  'Chía / Cajicá / Cota',
  'Floridablanca / Girón / Piedecuesta',
  'Soledad / Atlántico',
  'Otra ciudad / Municipio',
];

export const clinicApi = {
  /**
   * Obtiene todas las veterinarias y médicos registrados
   */
  async getClinics(params = {}) {
    try {
      const res = await axios.get(API_BASE_URL, { params, timeout: 3000 });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        saveStoredClinics(res.data.data);
        return res.data.data;
      }
    } catch (_) {}

    let list = getStoredClinics();
    if (params.type && params.type !== 'all') {
      list = list.filter((c) => c.type === params.type);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter((c) => {
        return (
          (c.nombreVeterinaria && c.nombreVeterinaria.toLowerCase().includes(q)) ||
          (c.nombreMedico && c.nombreMedico.toLowerCase().includes(q)) ||
          (c.nit && c.nit.includes(q)) ||
          (c.cedula && c.cedula.includes(q)) ||
          (c.recoleccion?.ciudad && c.recoleccion.ciudad.toLowerCase().includes(q)) ||
          (c.recoleccion?.direccionFisica && c.recoleccion.direccionFisica.toLowerCase().includes(q))
        );
      });
    }
    return list;
  },

  /**
   * Obtiene la clínica actualmente activa
   */
  async getActiveClinic() {
    try {
      const res = await axios.get(`${API_BASE_URL}/active`, { timeout: 3000 });
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (_) {}

    const list = getStoredClinics();
    let activeId = null;
    try {
      activeId = localStorage.getItem(ACTIVE_STORAGE_KEY);
    } catch (_) {}

    if (activeId) {
      const found = list.find((c) => c.id === activeId);
      if (found) return found;
    }

    const foundActive = list.find((c) => c.esClinicaActiva);
    return foundActive || list[0] || INITIAL_CLINICS[0];
  },

  /**
   * Cambia la clínica activa para la sesión
   */
  async setActiveClinic(id) {
    try {
      const res = await axios.post(`${API_BASE_URL}/active/${id}`, {}, { timeout: 3000 });
      if (res.data?.success && res.data?.data) {
        try {
          localStorage.setItem(ACTIVE_STORAGE_KEY, id);
        } catch (_) {}
        return res.data.data;
      }
    } catch (_) {}

    const list = getStoredClinics().map((c) => ({
      ...c,
      esClinicaActiva: c.id === id,
    }));
    saveStoredClinics(list);
    try {
      localStorage.setItem(ACTIVE_STORAGE_KEY, id);
    } catch (_) {}
    return list.find((c) => c.id === id);
  },

  /**
   * Registra una nueva veterinaria o médico independiente
   */
  async createClinic(clinicData) {
    try {
      const res = await axios.post(API_BASE_URL, clinicData, { timeout: 4000 });
      if (res.data?.success && res.data?.data) {
        const list = getStoredClinics();
        list.unshift(res.data.data);
        saveStoredClinics(list);
        return res.data.data;
      }
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Fallback local
    const type = clinicData.type === 'independiente' ? 'independiente' : 'veterinaria';
    const cleanNumber = (v) => (v ? String(v).replace(/[^0-9]/g, '').trim() : '');

    const newClinic = {
      id: `${type}-${Date.now().toString().slice(-6)}`,
      type,
      nit: type === 'veterinaria' ? cleanNumber(clinicData.nit) : '',
      nombreVeterinaria: type === 'veterinaria' ? clinicData.nombreVeterinaria?.trim() : '',
      directorMedico: {
        nombre: type === 'veterinaria' ? (clinicData.directorMedico?.nombre || '').trim() : '',
        telefono: type === 'veterinaria' ? (clinicData.directorMedico?.telefono || '').trim() : '',
      },
      cedula: type === 'independiente' ? cleanNumber(clinicData.cedula) : '',
      nombreMedico: type === 'independiente' ? clinicData.nombreMedico?.trim() : '',
      tarjetaProfesional: type === 'independiente' ? (clinicData.tarjetaProfesional || '').trim() : '',
      administrativa: {
        nombreResponsable: (clinicData.administrativa?.nombreResponsable || '').trim(),
        telefonoPagos: (clinicData.administrativa?.telefonoPagos || '').trim(),
      },
      recoleccion: {
        ciudad: (clinicData.recoleccion?.ciudad || '').trim(),
        direccionFisica: (clinicData.recoleccion?.direccionFisica || '').trim(),
        detallesAdicionales: (clinicData.recoleccion?.detallesAdicionales || '').trim(),
        indicacionesRuta: (clinicData.recoleccion?.indicacionesRuta || 'Donde el repartidor recogerá las muestras').trim(),
      },
      correos: {
        facturacion: (clinicData.correos?.facturacion || '').trim().toLowerCase(),
        resultados: (clinicData.correos?.resultados || '').trim().toLowerCase(),
      },
      documentos: {
        rutNumero: cleanNumber(clinicData.documentos?.rutNumero),
        rutArchivo: clinicData.documentos?.rutArchivo || 'RUT_Cargado.pdf',
        tarjetaProfesionalArchivo: type === 'independiente' ? clinicData.documentos?.tarjetaProfesionalArchivo || 'TP_Documento.pdf' : null,
      },
      terminosAceptados: clinicData.terminosAceptados ?? true,
      fechaAceptacionTerminos: new Date().toISOString(),
      estado: clinicData.estado || 'activo',
      esClinicaActiva: Boolean(clinicData.esClinicaActiva),
      totalMuestrasHistoricas: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let list = getStoredClinics();
    if (newClinic.esClinicaActiva) {
      list = list.map((c) => ({ ...c, esClinicaActiva: false }));
      try {
        localStorage.setItem(ACTIVE_STORAGE_KEY, newClinic.id);
      } catch (_) {}
    }
    list.unshift(newClinic);
    saveStoredClinics(list);
    return newClinic;
  },

  /**
   * Actualiza el perfil de una veterinaria o médico existente
   */
  async updateClinic(id, updates) {
    try {
      const res = await axios.put(`${API_BASE_URL}/${id}`, updates, { timeout: 4000 });
      if (res.data?.success && res.data?.data) {
        let list = getStoredClinics().map((c) => (c.id === id ? res.data.data : c));
        saveStoredClinics(list);
        return res.data.data;
      }
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Fallback local
    const list = getStoredClinics();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Veterinaria con ID '${id}' no encontrada`);
    }

    const updated = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredClinics(list);
    return updated;
  },
};
