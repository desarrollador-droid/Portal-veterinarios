import axios from 'axios';
import { INITIAL_CLINICS, AVAILABLE_PERMISSIONS, ROLE_PRESETS } from '../../../../../backend/src/models/clinicModel.js';
import { colombiaGeoApi } from './colombiaGeoApi.js';

export { AVAILABLE_PERMISSIONS, ROLE_PRESETS };

const API_BASE_URL = 'http://localhost:5000/api/clinics';

// Almacén en memoria en el cliente sincronizado con localStorage para persistencia offline / Vercel
const STORAGE_KEY = 'vetlab_clinics_data';
const ACTIVE_STORAGE_KEY = 'vetlab_active_clinic_id';

function getStoredClinics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migración de datos: asegurar consecutivoNit en sedes, departamento, permisos y sedes rotativas
        return parsed.map((c) => {
          if (c.recoleccion && !c.recoleccion.departamento) {
            const foundDept = colombiaGeoApi.findDepartmentByCity(c.recoleccion.ciudad);
            c.recoleccion.departamento = foundDept?.name || 'Bogotá';
          }
          if (c.type === 'veterinaria' && Array.isArray(c.sedes)) {
            c.sedes = c.sedes.map((s, idx) => ({
              ...s,
              departamento: s.departamento || colombiaGeoApi.findDepartmentByCity(s.ciudad)?.name || c.recoleccion?.departamento || 'Bogotá',
              consecutivoNit: s.consecutivoNit || (idx + 1),
              codigoSedeNit: s.codigoSedeNit || `#nit-${s.consecutivoNit || (idx + 1)}`,
            }));
          } else if (c.type === 'independiente') {
            c.asociadoVeterinaria = null;
            c.asociacionClinica = 'Sin asociación a clínica (Profesional Autónomo)';
            c.esIndependiente = true;
            if (!Array.isArray(c.veterinariosAsociados)) c.veterinariosAsociados = [];
            if (Array.isArray(c.sedes)) {
              c.sedes = c.sedes.map((s, idx) => ({
                ...s,
                departamento: s.departamento || colombiaGeoApi.findDepartmentByCity(s.ciudad)?.name || c.recoleccion?.departamento || 'Bogotá',
              }));
            }
          }

          // Migración de veterinarios asociados: permisos, sedes rotativas y bloqueo
          if (Array.isArray(c.veterinariosAsociados)) {
            // Incorporar nuevos veterinarios de demostración de INITIAL_CLINICS si no existen aún
            const initClinic = INITIAL_CLINICS.find((ic) => ic.id === c.id);
            if (initClinic && Array.isArray(initClinic.veterinariosAsociados)) {
              initClinic.veterinariosAsociados.forEach((iv) => {
                if (!c.veterinariosAsociados.some((existing) => existing.id === iv.id)) {
                  c.veterinariosAsociados.push(iv);
                }
              });
            }

            c.veterinariosAsociados = c.veterinariosAsociados.map((v) => {
              const roleKey = v.rol || (v.esDirector ? 'director_medico' : 'veterinario_planta');
              const preset = ROLE_PRESETS[roleKey] || ROLE_PRESETS.veterinario_planta;
              return {
                ...v,
                rol: roleKey,
                rolNombre: v.rolNombre || preset.nombre,
                tipoAsignacion: v.tipoAsignacion || (v.esDirector ? 'todas_las_sedes' : 'fija'),
                sedesRotativas: Array.isArray(v.sedesRotativas) ? v.sedesRotativas : [],
                sedesRotativasNombres: Array.isArray(v.sedesRotativasNombres) ? v.sedesRotativasNombres : [],
                diasRotacion: v.diasRotacion || '',
                bloqueadoPorAdmin: Boolean(v.bloqueadoPorAdmin),
                motivoBloqueo: v.motivoBloqueo || null,
                permisos: v.permisos || preset.permisos,
              };
            });
          }

          return c;
        });
      }
    }
  } catch (_) {}
  return [...INITIAL_CLINICS];
}

function saveStoredClinics(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

export function formatSedeNitLabel(clinicNit, sede) {
  if (!sede) return '';
  const consecutivo = sede.consecutivoNit || 1;
  const codigo = sede.codigoSedeNit || `#nit-${consecutivo}`;
  if (!clinicNit) return codigo;
  return `NIT ${clinicNit} ${codigo}`;
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

    const recoleccionDept = (clinicData.recoleccion?.departamento || '').trim() ||
      colombiaGeoApi.findDepartmentByCity(clinicData.recoleccion?.ciudad)?.name || 'Bogotá';

    const initialSedes = Array.isArray(clinicData.sedes) && clinicData.sedes.length > 0 ? clinicData.sedes : [
      {
        id: `sede-${Date.now().toString().slice(-4)}`,
        nombreSede: type === 'veterinaria'
          ? (clinicData.nombreVeterinaria ? `${clinicData.nombreVeterinaria} - Sede Principal` : 'Sede Principal')
          : 'Consultorio Particular',
        esPrincipal: true,
        consecutivoNit: type === 'veterinaria' ? 1 : null,
        codigoSedeNit: type === 'veterinaria' ? '#nit-1' : '',
        tipoPunto: type === 'veterinaria' ? 'sede_principal' : 'consultorio_independiente',
        departamento: recoleccionDept,
        ciudad: clinicData.recoleccion?.ciudad || 'Bogotá D.C.',
        direccionFisica: clinicData.recoleccion?.direccionFisica || '',
        detallesAdicionales: clinicData.recoleccion?.detallesAdicionales || '',
        telefonoContacto: type === 'veterinaria' ? clinicData.directorMedico?.telefono || '' : clinicData.administrativa?.telefonoPagos || '',
        responsableSede: type === 'veterinaria' ? clinicData.directorMedico?.nombre || '' : clinicData.nombreMedico || '',
        indicacionesRuta: clinicData.recoleccion?.indicacionesRuta || 'Donde el repartidor recogerá las muestras',
        correoResultadosSede: clinicData.correos?.resultados || '',
      },
    ];

    const initialVets = type === 'veterinaria'
      ? (Array.isArray(clinicData.veterinariosAsociados) && clinicData.veterinariosAsociados.length > 0
          ? clinicData.veterinariosAsociados
          : [
              {
                id: `vet-${Date.now().toString().slice(-4)}`,
                nombre: clinicData.directorMedico?.nombre || 'Director Médico',
                especialidad: 'Director Médico / Medicina General',
                tarjetaProfesional: 'COMVEZCOL-REG',
                email: clinicData.correos?.resultados || '',
                telefono: clinicData.directorMedico?.telefono || '',
                sedeId: initialSedes[0]?.id || '',
                sedeNombre: initialSedes[0]?.nombreSede || '',
                estado: 'activo',
                esDirector: true,
                fechaVinculacion: new Date().toISOString().slice(0, 10),
              },
            ])
      : [];

    const newClinic = {
      id: `${type}-${Date.now().toString().slice(-6)}`,
      type,
      esIndependiente: type === 'independiente',
      asociadoVeterinaria: null, // Profesional independiente: no se encuentra asociado a ninguna veterinaria
      asociacionClinica: type === 'independiente' ? 'Sin asociación a clínica (Profesional Autónomo)' : null,
      especialidad: type === 'independiente' ? (clinicData.especialidad || 'Medicina General') : '',
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
        departamento: recoleccionDept,
        ciudad: (clinicData.recoleccion?.ciudad || '').trim() || 'Bogotá D.C.',
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

    // Consecutivo de NIT: si la clínica es veterinaria, las sedes comparten el mismo NIT con consecutivo #nit-1, #nit-2, #nit-3...
    let consecutivo = null;
    let codigoSedeNit = '';
    if (clinic.type === 'veterinaria') {
      const maxConsecutivo = (clinic.sedes || []).reduce((max, s) => {
        const n = Number(s.consecutivoNit) || 0;
        return n > max ? n : max;
      }, 0);
      consecutivo = Number(sedeData.consecutivoNit) || (maxConsecutivo + 1);
      codigoSedeNit = `#nit-${consecutivo}`;
    }

    const sedeDept = (sedeData.departamento || '').trim() ||
      colombiaGeoApi.findDepartmentByCity(sedeData.ciudad)?.name ||
      clinic.recoleccion?.departamento || 'Bogotá';

    const newSede = {
      id: `sede-${Date.now().toString().slice(-6)}`,
      nombreSede: sedeData.nombreSede.trim(),
      esPrincipal: Boolean(sedeData.esPrincipal),
      consecutivoNit: consecutivo,
      codigoSedeNit: codigoSedeNit,
      tipoPunto: clinic.type === 'independiente' ? 'consultorio_independiente' : 'sede_sucursal',
      departamento: sedeDept,
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
      clinic.recoleccion.departamento = newSede.departamento;
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
      const prevSede = clinic.sedes[sIdx];
      let consecutivo = prevSede.consecutivoNit;
      let codigoSedeNit = prevSede.codigoSedeNit;

      if (clinic.type === 'veterinaria') {
        if (sedeData.consecutivoNit !== undefined && sedeData.consecutivoNit !== null && sedeData.consecutivoNit !== '') {
          consecutivo = Number(sedeData.consecutivoNit);
          codigoSedeNit = `#nit-${consecutivo}`;
        } else if (!consecutivo) {
          consecutivo = sIdx + 1;
          codigoSedeNit = `#nit-${consecutivo}`;
        }
      }

      const updatedSede = {
        ...prevSede,
        ...sedeData,
        consecutivoNit: consecutivo,
        codigoSedeNit: codigoSedeNit,
      };

      if (updatedSede.esPrincipal) {
        clinic.sedes.forEach((s) => (s.esPrincipal = false));
        if (updatedSede.departamento) clinic.recoleccion.departamento = updatedSede.departamento;
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

  async blockVeterinarian(clinicId, vetId, { motivoBloqueo, bloqueadoPor } = {}) {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/block`,
        { motivoBloqueo, bloqueadoPor },
        { timeout: 3500 }
      );
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

    if (vet.esDirector) {
      throw new Error('No es posible bloquear al Director Médico / Administrador Principal');
    }

    vet.estado = 'bloqueado';
    vet.bloqueadoPorAdmin = true;
    vet.motivoBloqueo = motivoBloqueo?.trim() || 'Acceso suspendido temporalmente por el Administrador Principal';
    vet.fechaBloqueo = new Date().toISOString();
    vet.bloqueadoPor = bloqueadoPor?.trim() || 'Dr. Alejandro Morales Restrepo (Admin Principal)';
    vet.permisosPrevios = { ...(vet.permisos || {}) };
    vet.permisos = Object.keys(vet.permisos || {}).reduce((acc, k) => ({ ...acc, [k]: false }), {});

    clinic.updatedAt = new Date().toISOString();
    saveStoredClinics(list);
    return { clinic, vet };
  },

  async unblockVeterinarian(clinicId, vetId) {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/unblock`,
        {},
        { timeout: 3500 }
      );
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

    vet.estado = 'activo';
    vet.bloqueadoPorAdmin = false;
    vet.motivoBloqueo = null;
    vet.fechaBloqueo = null;
    vet.bloqueadoPor = null;
    vet.permisos = vet.permisosPrevios || (ROLE_PRESETS[vet.rol]?.permisos) || {
      crearPacientes: true,
      solicitarExamenes: true,
      verResultados: true,
      descargarInformes: true,
      accesoTodasLasSedes: false,
      editarHistorias: true,
      gestionarSedes: false,
      anularOrdenes: false,
    };

    clinic.updatedAt = new Date().toISOString();
    saveStoredClinics(list);
    return { clinic, vet };
  },

  async updateVeterinarianPermissions(clinicId, vetId, { permisos, rol } = {}) {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/permissions`,
        { permisos, rol },
        { timeout: 3500 }
      );
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

    if (rol) {
      vet.rol = rol;
      if (ROLE_PRESETS[rol]?.nombre) {
        vet.rolNombre = ROLE_PRESETS[rol].nombre;
      }
    }

    if (permisos && typeof permisos === 'object') {
      vet.permisos = {
        ...(vet.permisos || {}),
        ...permisos,
      };
    }

    clinic.updatedAt = new Date().toISOString();
    saveStoredClinics(list);
    return { clinic, vet };
  },

  async assignVeterinarianSedes(clinicId, vetId, { tipoAsignacion, sedeId, sedeNombre, sedesRotativas, sedesRotativasNombres, diasRotacion } = {}) {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/sedes`,
        { tipoAsignacion, sedeId, sedeNombre, sedesRotativas, sedesRotativasNombres, diasRotacion },
        { timeout: 3500 }
      );
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

    if (tipoAsignacion) vet.tipoAsignacion = tipoAsignacion;
    if (sedeId) vet.sedeId = sedeId;
    if (sedeNombre) vet.sedeNombre = sedeNombre;
    if (Array.isArray(sedesRotativas)) vet.sedesRotativas = sedesRotativas;
    if (Array.isArray(sedesRotativasNombres)) vet.sedesRotativasNombres = sedesRotativasNombres;
    if (diasRotacion !== undefined) vet.diasRotacion = diasRotacion;

    if (tipoAsignacion === 'todas_las_sedes') {
      if (!vet.permisos) vet.permisos = {};
      vet.permisos.accesoTodasLasSedes = true;
    }

    clinic.updatedAt = new Date().toISOString();
    saveStoredClinics(list);
    return { clinic, vet };
  },

  _updateLocalClinic(clinicId, updatedClinic) {
    const list = getStoredClinics().map((c) => (c.id === clinicId ? updatedClinic : c));
    saveStoredClinics(list);
  },
};
