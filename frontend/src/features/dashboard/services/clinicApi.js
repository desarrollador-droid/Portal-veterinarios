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

export const VETERINARY_SPECIALTIES = [
  'Medicina General',
  'Medicina Interna',
  'Infectología & Diagnóstico Molecular',
  'Oncología Veterinaria',
  'Patología Clínica & Laboratorio',
  'Cardiología Veterinaria',
  'Dermatología Veterinaria',
  'Cirugía de Tejidos Blandos & Ortopedia',
  'Neurología & Neurocirugía',
  'Gastroenterología & Endoscopia',
  'Nefrología & Urología',
  'Oftalmología Veterinaria',
  'Urgencias & Cuidados Críticos (UCI)',
  'Anestesiología & Manejo del Dolor',
  'Medicina Felina',
  'Fauna Silvestre & No Convencionales',
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

    const initialSedes = Array.isArray(clinicData.sedes) && clinicData.sedes.length > 0 ? clinicData.sedes : [
      {
        id: `sede-${Date.now().toString().slice(-4)}`,
        nombreSede: clinicData.nombreVeterinaria ? `${clinicData.nombreVeterinaria} - Sede Principal` : 'Consultorio Principal',
        esPrincipal: true,
        ciudad: clinicData.recoleccion?.ciudad || 'Bogotá D.C.',
        direccionFisica: clinicData.recoleccion?.direccionFisica || '',
        detallesAdicionales: clinicData.recoleccion?.detallesAdicionales || '',
        telefonoContacto: type === 'veterinaria' ? clinicData.directorMedico?.telefono || '' : clinicData.administrativa?.telefonoPagos || '',
        responsableSede: type === 'veterinaria' ? clinicData.directorMedico?.nombre || '' : clinicData.nombreMedico || '',
        indicacionesRuta: clinicData.recoleccion?.indicacionesRuta || 'Donde el repartidor recogerá las muestras',
        correoResultadosSede: clinicData.correos?.resultados || '',
      },
    ];

    const initialVets = Array.isArray(clinicData.veterinariosAsociados) && clinicData.veterinariosAsociados.length > 0
      ? clinicData.veterinariosAsociados
      : [
          {
            id: `vet-${Date.now().toString().slice(-4)}`,
            nombre: type === 'veterinaria' ? clinicData.directorMedico?.nombre || 'Director Médico' : clinicData.nombreMedico || 'Médico Veterinario',
            especialidad: type === 'veterinaria' ? 'Director Médico / Medicina General' : 'Medicina General',
            tarjetaProfesional: type === 'veterinaria' ? 'COMVEZCOL-REG' : clinicData.tarjetaProfesional || '',
            email: clinicData.correos?.resultados || '',
            telefono: type === 'veterinaria' ? clinicData.directorMedico?.telefono || '' : clinicData.administrativa?.telefonoPagos || '',
            sedeId: initialSedes[0]?.id || '',
            sedeNombre: initialSedes[0]?.nombreSede || '',
            estado: 'activo',
            esDirector: true,
            fechaVinculacion: new Date().toISOString().slice(0, 10),
          },
        ];

    const newClinic = {
      id: `${type}-${Date.now().toString().slice(-6)}`,
      type,
      nit: type === 'veterinaria' ? cleanNumber(clinicData.nit) : '',
      nombreVeterinaria: type === 'veterinaria' ? clinicData.nombreVeterinaria?.trim() : '',
      tieneMultiplesSedes: Boolean(clinicData.tieneMultiplesSedes ?? (initialSedes.length > 1)),
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
      sedes: initialSedes,
      veterinariosAsociados: initialVets,
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

  // ==========================================
  // GESTIÓN DE SEDES
  // ==========================================
  async addSede(clinicId, sedeData) {
    try {
      const res = await axios.post(`${API_BASE_URL}/${clinicId}/sedes`, sedeData, { timeout: 3500 });
      if (res.data?.success && res.data?.data) {
        this._updateLocalClinic(clinicId, res.data.data);
        return res.data.data;
      }
    } catch (_) {}

    // Fallback local
    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const newSede = {
      id: `sede-${Date.now().toString().slice(-6)}`,
      nombreSede: sedeData.nombreSede.trim(),
      esPrincipal: Boolean(sedeData.esPrincipal),
      ciudad: sedeData.ciudad.trim(),
      direccionFisica: sedeData.direccionFisica.trim(),
      detallesAdicionales: sedeData.detallesAdicionales?.trim() || '',
      telefonoContacto: sedeData.telefonoContacto?.trim() || '',
      responsableSede: sedeData.responsableSede?.trim() || '',
      indicacionesRuta: sedeData.indicacionesRuta?.trim() || 'Donde el repartidor recogerá las muestras',
      correoResultadosSede: sedeData.correoResultadosSede?.trim() || clinic.correos?.resultados || '',
    };

    if (!clinic.sedes) clinic.sedes = [];
    if (newSede.esPrincipal) {
      clinic.sedes.forEach((s) => (s.esPrincipal = false));
      clinic.recoleccion.ciudad = newSede.ciudad;
      clinic.recoleccion.direccionFisica = newSede.direccionFisica;
    }
    clinic.sedes.push(newSede);
    clinic.tieneMultiplesSedes = clinic.sedes.length > 1;
    clinic.updatedAt = new Date().toISOString();

    saveStoredClinics(list);
    return clinic;
  },

  async updateSede(clinicId, sedeId, sedeData) {
    try {
      const res = await axios.put(`${API_BASE_URL}/${clinicId}/sedes/${sedeId}`, sedeData, { timeout: 3500 });
      if (res.data?.success && res.data?.data) {
        this._updateLocalClinic(clinicId, res.data.data);
        return res.data.data;
      }
    } catch (_) {}

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const sIdx = (clinic.sedes || []).findIndex((s) => s.id === sedeId);
    if (sIdx !== -1) {
      const updatedSede = { ...clinic.sedes[sIdx], ...sedeData };
      if (updatedSede.esPrincipal) {
        clinic.sedes.forEach((s) => (s.esPrincipal = false));
        clinic.recoleccion.ciudad = updatedSede.ciudad;
        clinic.recoleccion.direccionFisica = updatedSede.direccionFisica;
      }
      clinic.sedes[sIdx] = updatedSede;
      clinic.updatedAt = new Date().toISOString();
      saveStoredClinics(list);
    }
    return clinic;
  },

  async deleteSede(clinicId, sedeId) {
    try {
      const res = await axios.delete(`${API_BASE_URL}/${clinicId}/sedes/${sedeId}`, { timeout: 3500 });
      if (res.data?.success && res.data?.data) {
        this._updateLocalClinic(clinicId, res.data.data);
        return res.data.data;
      }
    } catch (_) {}

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    clinic.sedes = (clinic.sedes || []).filter((s) => s.id !== sedeId);
    if (clinic.sedes.length > 0 && !clinic.sedes.some((s) => s.esPrincipal)) {
      clinic.sedes[0].esPrincipal = true;
    }
    clinic.tieneMultiplesSedes = clinic.sedes.length > 1;
    clinic.updatedAt = new Date().toISOString();

    saveStoredClinics(list);
    return clinic;
  },

  // ==========================================
  // GESTIÓN DE VETERINARIOS ASOCIADOS
  // ==========================================
  async addVeterinarian(clinicId, vetData) {
    try {
      const res = await axios.post(`${API_BASE_URL}/${clinicId}/veterinarians`, vetData, { timeout: 3500 });
      if (res.data?.success && res.data?.data) {
        this._updateLocalClinic(clinicId, res.data.data);
        return res.data.data;
      }
    } catch (_) {}

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const newVet = {
      id: `vet-${Date.now().toString().slice(-6)}`,
      nombre: vetData.nombre.trim(),
      especialidad: vetData.especialidad?.trim() || 'Medicina General',
      tarjetaProfesional: vetData.tarjetaProfesional.trim(),
      email: vetData.email?.trim() || '',
      telefono: vetData.telefono?.trim() || '',
      sedeId: vetData.sedeId || (clinic.sedes?.[0]?.id || ''),
      sedeNombre: vetData.sedeNombre || (clinic.sedes?.[0]?.nombreSede || 'Sede Principal'),
      estado: vetData.estado || 'activo',
      esDirector: Boolean(vetData.esDirector),
      fechaVinculacion: new Date().toISOString().slice(0, 10),
    };

    if (!clinic.veterinariosAsociados) clinic.veterinariosAsociados = [];
    clinic.veterinariosAsociados.push(newVet);
    clinic.updatedAt = new Date().toISOString();

    saveStoredClinics(list);
    return clinic;
  },

  async updateVeterinarian(clinicId, vetId, updates) {
    try {
      const res = await axios.put(`${API_BASE_URL}/${clinicId}/veterinarians/${vetId}`, updates, { timeout: 3500 });
      if (res.data?.success && res.data?.data) {
        this._updateLocalClinic(clinicId, res.data.data);
        return res.data.data;
      }
    } catch (_) {}

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vIdx = (clinic.veterinariosAsociados || []).findIndex((v) => v.id === vetId);
    if (vIdx !== -1) {
      clinic.veterinariosAsociados[vIdx] = {
        ...clinic.veterinariosAsociados[vIdx],
        ...updates,
      };
      clinic.updatedAt = new Date().toISOString();
      saveStoredClinics(list);
    }
    return clinic;
  },

  async toggleVeterinarianStatus(clinicId, vetId) {
    try {
      const res = await axios.patch(`${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/toggle-status`, {}, { timeout: 3500 });
      if (res.data?.success && res.data?.data) {
        this._updateLocalClinic(clinicId, res.data.data);
        return { clinic: res.data.data, vet: res.data.vet };
      }
    } catch (_) {}

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vet = (clinic.veterinariosAsociados || []).find((v) => v.id === vetId);
    if (!vet) throw new Error('Veterinario asociado no encontrado');

    vet.estado = vet.estado === 'activo' ? 'inactivo' : 'activo';
    clinic.updatedAt = new Date().toISOString();

    saveStoredClinics(list);
    return { clinic, vet };
  },

  async deleteVeterinarian(clinicId, vetId) {
    try {
      const res = await axios.delete(`${API_BASE_URL}/${clinicId}/veterinarians/${vetId}`, { timeout: 3500 });
      if (res.data?.success && res.data?.data) {
        this._updateLocalClinic(clinicId, res.data.data);
        return res.data.data;
      }
    } catch (_) {}

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    clinic.veterinariosAsociados = (clinic.veterinariosAsociados || []).filter((v) => v.id !== vetId);
    clinic.updatedAt = new Date().toISOString();

    saveStoredClinics(list);
    return clinic;
  },

  _updateLocalClinic(clinicId, updatedClinic) {
    const list = getStoredClinics().map((c) => (c.id === clinicId ? updatedClinic : c));
    saveStoredClinics(list);
  },
};
