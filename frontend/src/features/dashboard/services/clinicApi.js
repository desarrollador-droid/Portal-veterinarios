import axios from 'axios';
import { INITIAL_CLINICS, AVAILABLE_PERMISSIONS, ROLE_PRESETS } from '../data/clinicModelData.js';
import { colombiaGeoApi } from './colombiaGeoApi.js';

export { AVAILABLE_PERMISSIONS, ROLE_PRESETS };

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL}/api/clinics`
  : (isLocalhost ? 'http://localhost:5000/api/clinics' : null);

export const KEA_VETERINARIA_URL = 'https://osd.kea.tools/api/v1/databases/VETERINARIA';
export const KEA_VETERINARIA_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiZjU1NmE0ZTVmMjEyMDExYTdiMDFlMTg4YzMyNWZlNzEwOTMzMzFmMDE4ZTdjMThlZjUyNjBkZDdlNzdkNGIyN2M2ZjZmNjA0M2I5OTBhODciLCJpYXQiOjE3OTU4MTI3MjcuODgwMzA5LCJuYmYiOjE3OTU4MTI3MjcuODgwMzEzLCJleHAiOjE4MjczNDg3MjcuODczMzM5LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.XzTqOJbQ-Wfp8Sj5XjwhqwiRo-wfyIYM4uJRJDW_z3zqc993fduiKrF8sDi6k8VETi7NkJ-TCVM1UbS1k-CtzdqpwhqbtO7RAaEPtG5cERGwVrlTRZmkb2e4H9qxYkEOGPukb9okHfVdyYeBcRjiRU5gOas52ksdnfe_J2wLIoKvksAXLMo7GbZOjlI20izs8c7tU3or9KSw3_RORWynTaAwQC0JzCPxSGN1tNxgRc9IijUePYTCvo4gAuhVwXoruTL7-u9zsfJ0gpVcAlGilYSPdBomNgvVfWpnzsSODL47RSVsYQPKiEqY_ZvqPQdvs-gsMWdlsh6DBCggdU2__SV8KEllTTeVWRX3_HdMXcFr7Ks4zdCD2euCw-uiEo-Lebdw1vhOR1dSr_8wI7YL9j3vKWSd2hS19ZyFM1-QyrDSucEXevabcfwAhxoUxKEXSbFXtzGUatXI65NcMyTJH9PNeUDN1S0wCIY7Fl-DecWKRVJoiSa7mLbL2_TMG1ANoXD8nAxCzFown2fnWg-L546pmMrpv6jqlvKW6I2xO1zn0Pt6OE58Yy2FoSdRJSPXiYIjp2K-KATVzp68VGSFClwz8cqUcMewqMI949zLQvfS4SekX_YVeQC5UB2AsTo8BuggdnUvHNy4XTlp7H5x4hWOqcqL0iMyme16NG9pspU';

export const KEA_MEDICOS_URL = 'https://osd.kea.tools/api/v1/databases/VETERINARIO';
export const KEA_MEDICOS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYjdhOGUxOGFmMTAwMzVhNDQxNzcyMjAwNjdmMzNhMWQ2ZjRhZTQ0ZWI3YzY3ODQ4YzdiZmRlZDhhYjEwYTQyZTRmNDY0YjZmMTE5ZmI2YWMiLCJpYXQiOjE3OTQzMzE4OTMuMzE5Mjg0LCJuYmYiOjE3OTQzMzE4OTMuMzE5Mjg3LCJleHAiOjE4MjU4Njc4OTMuMzEyOTQsInN1YiI6IjQiLCJzY29wZXMiOlsia2VhLmRhdGFiYXNlIl19.fAz5YBAaHnHVu9hiHcLnpf-JGuHu4FXcPcphRJ0ZrP3TKmPN06EjRVJs_-49T1wPJOqztJhy7bEOyC6pTobFuVBV8o1eTYdAlbSBiLxzlg-3D6uO3t1TM1RQ9Ekr-i9thZeBt6ddWDdEupC0Z22G21f37Wj_XRIso4sXGXN0k281lLXqHDdoU8sxXRVYk8xZsZ0HlDqB4GqhZPaKveiFALoa8wagoLj9920Uzov_8t6xDVLjXo048_mT-lQPHMk7oXF7E5q9hNXe7oH54o3vFnqmc2AXd-kRaFeLmIFxkFZ2ec2mATbpnc-DLdlx19-cXyVruXRXPvBucBKzxj5VMFM2BQBao4N71Z10nMHACdg37tC_iuYA3tyd0JyARWWJ5PF5k_OSEIwgL2IaLo2vlPIkqYLH6S5ZHF3P6bWbjEPPuepfcem2QwreONdML6yXu94UOsrzSrVZG8Z6zDWB97PRHBPjeIVWrdDShDAhycJBY3H1zJcrKZ73CEXzbFY4EUjUOPv4vk-S_o4MJS9XsxDrKre1PdQacKjTmqAMGAymKti9-LYBBwxnxpkGXcTlmstXv9igoTs0AkZAvzDOl3NiNYhgkFMlpWZY7toGw8C1j_203ebdMyWaQdV3qlrzgDHq7lZw3_-uZXI1sWGmyr3-5UYpWE1kjLYJWg3xN38';

/**
 * Mapea un registro de la tabla VETERINARIO de Kea Tools a un Veterinario Asociado
 */
export function mapKeaRecordToVeterinarian(record, index = 0) {
  const keaId = record.id || index + 1;
  const nombre = String(record.NOMBRE || record.nombre || 'Médico Veterinario').trim();
  const tarjetaProfesional = String(record.TARJETA_PROFESIONAL || record.tarjetaProfesional || '').trim();
  const cedula = String(record.NIT_CEDULA || record.cedula || '').trim();
  const clinicaNit = String(record.VETERINARIA || record.veterinaria || '').trim();
  const sede = String(record.SEDE || record.sede || 'Sede Principal').trim();
  const email = String(record.EMAIL || record.email || record.CORREO_FACTURACION || '').trim();
  const telefono = String(record.TELEFONO || record.telefono || '').trim();
  const ciudad = String(record.CIUDAD || record.ciudad || '').trim();
  const especialidad = String(record.ESPECIALIDAD || record.especialidad || 'Medicina General').trim();
  const estado = String(record.ESTADO || record.estado || 'activo').toLowerCase();
  const obs = String(record.OBSERVACIONES || record.observaciones || '').trim();
  const pwdMatch = obs.match(/\[PWD:([^\]]+)\]/i);
  const contrasenaFromObs = pwdMatch ? pwdMatch[1].trim() : '';

  const clinicNitMatch = obs.match(/\[(?:CLINIC_NIT|NIT):([^\]]+)\]/i);
  const resolvedClinicNit = clinicaNit || (clinicNitMatch ? clinicNitMatch[1].trim() : '');

  const contrasena = String(
    record.contrasena ||
    record.CONTRASENA ||
    record.password ||
    record.PASSWORD ||
    record.pin ||
    record.PIN ||
    record.CLAVE ||
    record.clave ||
    contrasenaFromObs ||
    ''
  ).trim();

  return {
    id: `kea-mv-${keaId}`,
    keaId: keaId,
    nombre,
    tarjetaProfesional,
    cedula,
    contrasena,
    password: contrasena,
    observaciones: obs,
    veterinariaNit: resolvedClinicNit,
    sedeId: 'sede-principal',
    sedeNombre: sede || 'Sede Principal',
    email,
    telefono,
    ciudad,
    especialidad,
    estado: estado === 'inactivo' ? 'inactivo' : (estado === 'bloqueado' ? 'bloqueado' : 'activo'),
    rol: 'veterinario_planta',
    rolNombre: 'Veterinario de Planta',
    esDirector: false,
    fechaVinculacion: record.FECHA_REGISTRO || new Date().toISOString().slice(0, 10),
  };
}

/**
 * Resuelve el ID numérico de Kea Tools para un profesional médico
 */
export async function resolveKeaVeterinarianId(vet, clinicNit) {
  if (vet.keaId && typeof vet.keaId === 'number') return vet.keaId;
  const matchId = String(vet.id || '').match(/kea-mv-(\d+)/);
  if (matchId) return parseInt(matchId[1], 10);
  if (typeof vet.id === 'number') return vet.id;

  // Buscar en la base de datos VETERINARIO de Kea Tools por TP, Cédula, Email o Nombre
  try {
    const res = await fetch(`${KEA_MEDICOS_URL}/records?limit=100`, {
      headers: { Authorization: `Bearer ${KEA_MEDICOS_TOKEN}`, Accept: 'application/json' },
    });
    const json = await res.json();
    const records = json.data || [];
    const cleanNum = (v) => String(v || '').replace(/[^0-9A-Za-z]/g, '').trim().toLowerCase();
    const targetTp = cleanNum(vet.tarjetaProfesional);
    const targetCed = cleanNum(vet.cedula);
    const targetEmail = (vet.email || '').toLowerCase().trim();
    const targetNom = (vet.nombre || '').toLowerCase().trim();

    const found = records.find((r) => {
      const rTp = cleanNum(r.TARJETA_PROFESIONAL);
      const rCed = cleanNum(r.NIT_CEDULA);
      const rEmail = (r.EMAIL || '').toLowerCase().trim();
      const rNom = (r.NOMBRE || '').toLowerCase().trim();

      if (targetTp && rTp && targetTp === rTp) return true;
      if (targetCed && rCed && targetCed === rCed) return true;
      if (targetEmail && rEmail && targetEmail === rEmail) return true;
      if (targetNom && rNom && (targetNom === rNom || targetNom.includes(rNom) || rNom.includes(targetNom))) return true;
      return false;
    });

    if (found) return found.id;
  } catch (err) {
    console.warn('[clinicApi] Error al buscar ID del veterinario en Kea Tools:', err.message);
  }
  return null;
}

/**
 * Sincroniza o actualiza directamente un médico veterinario en la base de datos VETERINARIO de Kea Tools
 */
export async function syncVeterinarianToKea(clinic, vet, updates = {}) {
  const cleanNit = String(clinic?.nit || clinic?.cedula || vet.veterinariaNit || '').replace(/[^0-9]/g, '');
  const keaId = await resolveKeaVeterinarianId(vet, cleanNit);

  const newPass = String(updates.password || updates.contrasena || updates.newPassword || vet.password || vet.contrasena || '').trim();
  let rawObs = String(updates.observaciones !== undefined ? updates.observaciones : (vet.observaciones || '')).trim();

  if (newPass) {
    if (rawObs.includes('[PWD:')) {
      rawObs = rawObs.replace(/\[PWD:[^\]]+\]/i, `[PWD:${newPass}]`);
    } else {
      rawObs = rawObs ? `[PWD:${newPass}] ${rawObs}` : `[PWD:${newPass}]`;
    }
  }

  const cleanCedula = String(updates.cedula !== undefined ? updates.cedula : (vet.cedula || '')).replace(/[^0-9]/g, '').trim();
  const tp = String(updates.tarjetaProfesional !== undefined ? updates.tarjetaProfesional : (vet.tarjetaProfesional || '')).trim();
  const nombre = String(updates.nombre !== undefined ? updates.nombre : (vet.nombre || '')).trim();
  const telefono = String(updates.telefono !== undefined ? updates.telefono : (vet.telefono || '')).trim();
  const email = String(updates.email !== undefined ? updates.email : (vet.email || '')).trim().toLowerCase();
  const ciudad = String(updates.ciudad !== undefined ? updates.ciudad : (vet.ciudad || clinic?.recoleccion?.ciudad || 'Bogotá')).trim();
  const especialidad = String(updates.especialidad !== undefined ? updates.especialidad : (vet.especialidad || 'Medicina General')).trim();
  const estado = String(updates.estado !== undefined ? updates.estado : (vet.estado || 'activo')).toLowerCase();

  if (keaId) {
    // 1. PATCH a /records/{keaId}
    const patchPayload = {};
    if (nombre) patchPayload.NOMBRE = nombre;
    if (tp) patchPayload.TARJETA_PROFESIONAL = tp;
    if (cleanCedula) patchPayload.NIT_CEDULA = cleanCedula;
    if (telefono) patchPayload.TELEFONO = telefono;
    if (email) patchPayload.EMAIL = email;
    if (ciudad) patchPayload.CIUDAD = ciudad;
    if (especialidad) patchPayload.ESPECIALIDAD = especialidad;
    if (estado) patchPayload.ESTADO = estado;
    if (cleanNit) patchPayload.VETERINARIA = cleanNit;
    if (rawObs) patchPayload.OBSERVACIONES = rawObs;

    try {
      const res = await fetch(`${KEA_MEDICOS_URL}/records/${keaId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${KEA_MEDICOS_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(patchPayload),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[Kea DB VETERINARIO] Veterinario #${keaId} (${nombre}) actualizado con éxito en Kea Tools.`);
        return { success: true, keaId, data: data.data || data };
      }
      console.warn(`[Kea DB VETERINARIO] Kea Tools rechazó PATCH a #${keaId}:`, data.message || data);
    } catch (err) {
      console.warn(`[Kea DB VETERINARIO] Error de red en PATCH #${keaId}:`, err.message);
    }
  } else {
    // 2. POST a /records (crear nuevo registro en Kea Tools)
    const createPayload = {
      NOMBRE: nombre,
      TARJETA_PROFESIONAL: tp || `TP-${Date.now().toString().slice(-6)}`,
      NIT_CEDULA: cleanCedula,
      VETERINARIA: cleanNit,
      SEDE: '',
      TELEFONO: telefono,
      EMAIL: email,
      CORREO_FACTURACION: email,
      CIUDAD: ciudad,
      ESPECIALIDAD: especialidad,
      ESTADO: estado,
      OBSERVACIONES: rawObs,
    };

    try {
      let res = await fetch(`${KEA_MEDICOS_URL}/records`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KEA_MEDICOS_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(createPayload),
      });
      let data = await res.json();

      // Si falla por restricción de FK en VETERINARIA o CIUDAD, reintentar con FK normalizadas
      if (!res.ok) {
        console.warn('[Kea DB VETERINARIO] Reintentando inserción sin campos referenciados opcionales...');
        const fallbackPayload = { ...createPayload, VETERINARIA: '', CIUDAD: '' };
        res = await fetch(`${KEA_MEDICOS_URL}/records`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${KEA_MEDICOS_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(fallbackPayload),
        });
        data = await res.json();
      }

      if (res.ok && (data.data?.id || data.id)) {
        const newKeaId = data.data?.id || data.id;
        console.log(`[Kea DB VETERINARIO] Veterinario ${nombre} creado con éxito en Kea Tools con ID #${newKeaId}.`);
        return { success: true, keaId: newKeaId, data: data.data || data };
      }
      console.warn('[Kea DB VETERINARIO] Fallo al crear veterinario en Kea Tools:', data.message || data);
    } catch (err) {
      console.warn('[Kea DB VETERINARIO] Error de red al crear veterinario en Kea:', err.message);
    }
  }
  return { success: false };
}

// Almacén en memoria en el cliente sincronizado con localStorage para persistencia offline / Vercel
const STORAGE_KEY = 'vetlab_clinics_data_v6';
const ACTIVE_STORAGE_KEY = 'vetlab_active_clinic_id';

export function mapKeaRecordToClinic(record, index = 0) {
  const nit = String(record.NIT || record.nit || record.CEDULA || record.cedula || '').trim();
  const nombre = String(record.NOMBRE || record.NOMBRE_VETERINARIA || record.nombre || 'Clínica Veterinaria').trim();
  const isIndependiente = record.TIPO === 'independiente' || nombre.toLowerCase().startsWith('dr');
  const type = isIndependiente ? 'independiente' : 'veterinaria';
  const obs = String(record.OBSERVACIONES || record.observaciones || '').trim();
  const pwdMatch = obs.match(/\[PWD:([^\]]+)\]/i);
  const contrasenaFromObs = pwdMatch ? pwdMatch[1].trim() : '';

  const contrasena = String(
    record.contrasena ||
    record.CONTRASENA ||
    record.password ||
    record.PASSWORD ||
    record.pin ||
    record.PIN ||
    record.CLAVE ||
    record.clave ||
    contrasenaFromObs ||
    ''
  ).trim();

  return {
    id: `kea-vet-${record.id || index + 1}`,
    keaRecordId: record.id || null,
    type,
    esIndependiente: isIndependiente,
    nit: nit,
    cedula: nit,
    contrasena: contrasena,
    password: contrasena,
    nombreVeterinaria: !isIndependiente ? nombre : '',
    nombreMedico: isIndependiente ? nombre : '',
    directorMedico: {
      nombre: record.NOMBRE_DIRECTOR || (isIndependiente ? nombre : 'Director Médico'),
      telefono: record.TELEFONO_DIRECTOR || record.TELEFONO || '',
    },
    administrativa: {
      nombreResponsable: 'Responsable Administrativo',
      telefonoPagos: record.TELEFONO || '',
    },
    recoleccion: {
      departamento: 'Colombia',
      ciudad: record.CIUDAD || 'Bogotá',
      direccionFisica: record.DIRECCION || '',
      detallesAdicionales: '',
      indicacionesRuta: 'Donde el repartidor recogerá las muestras',
    },
    correos: {
      facturacion: (record.CORREO_FACTURACION || record.EMAIL || '').toLowerCase(),
      resultados: (record.EMAIL || record.CORREO_FACTURACION || '').toLowerCase(),
    },
    documentos: {
      rutNumero: nit,
      rutArchivo: 'RUT_KeaTools.pdf',
    },
    capacitacionOSD: record.CAPACITADO_OSD || 'No',
    capacitacionQpcr: record.CAPACITACION_QPCR || '',
    cantidadVeterinarios: record.NUM_VETERINARIOS || '',
    cuentaConEspecialistas: record.TIENE_ESPECIALISTAS || 'No',
    especialidad: record.ESPECIALIDAD || '',
    especialistas: record.ESPECIALIDAD ? record.ESPECIALIDAD.split(',').map(s => s.trim()) : [],
    frecuenciaPcrMensual: record.FRECUENCIA_PCR_MENSUAL || '',
    medioConocisteOSD: record.MEDIO_CONOCIO_OSD || '',
    observaciones: record.OBSERVACIONES || '',
    estado: record.ESTADO || 'activo',
    estadoCartera: record.ESTADO_CARTERA || 'Habilitado',
    tipoPago: record.TIPO_PAGO || 'contado',
    sedes: [
      {
        id: `sede-kea-${record.id || index + 1}`,
        nombreSede: `${nombre} - Sede Principal`,
        esPrincipal: true,
        consecutivoNit: 1,
        codigoSedeNit: `#nit-1`,
        departamento: 'Colombia',
        ciudad: record.CIUDAD || 'Bogotá',
        direccionFisica: record.DIRECCION || '',
        telefonoContacto: record.TELEFONO || '',
        responsableSede: record.NOMBRE_DIRECTOR || (isIndependiente ? nombre : 'Responsable Sede'),
        indicacionesRuta: 'Donde el repartidor recogerá las muestras',
        correoResultadosSede: (record.EMAIL || '').toLowerCase(),
      },
    ],
    veterinariosAsociados: [],
  };
}

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
  async getAll(params = {}) {
    return this.getClinics(params);
  },

  async getClinics(params = {}) {
    if (API_BASE_URL) {
      try {
        const res = await axios.get(API_BASE_URL, { params, timeout: 3000 });
        if (res.data?.success && Array.isArray(res.data?.data)) {
          saveStoredClinics(res.data.data);
          return res.data.data;
        }
      } catch (_) {}
    }

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
   * Obtiene la clínica actualmente activa para la sesión
   */
  async getActiveClinic(preferredClinicId = null, preferredNit = null) {
    let targetId = preferredClinicId;
    let targetNit = preferredNit;

    // Si no se pasaron explícitamente, recuperar de la sesión autenticada
    if (!targetId && !targetNit) {
      try {
        const rawSession = localStorage.getItem('osd_auth_session') || sessionStorage.getItem('osd_auth_session');
        if (rawSession) {
          const session = JSON.parse(rawSession);
          targetId = session.clinicId || null;
          targetNit = session.nit || null;
        }
      } catch (_) {}
    }

    if (!targetId) {
      try {
        targetId = localStorage.getItem(ACTIVE_STORAGE_KEY) || sessionStorage.getItem(ACTIVE_STORAGE_KEY);
      } catch (_) {}
    }

    const cleanTargetNit = targetNit ? String(targetNit).replace(/[^0-9]/g, '').trim() : '';

    // Consultar al backend pasando los identificadores
    if (API_BASE_URL) {
      try {
        const res = await axios.get(`${API_BASE_URL}/active`, {
          params: { clinicId: targetId, nit: cleanTargetNit },
          timeout: 3000,
        });
        if (res.data?.success && res.data?.data) {
          // Verificar que coincida si teníamos sesión activa
          if (!cleanTargetNit && !targetId) {
            return res.data.data;
          }
          const resNit = String(res.data.data.nit || res.data.data.cedula || '').replace(/[^0-9]/g, '').trim();
          if ((cleanTargetNit && resNit === cleanTargetNit) || (targetId && res.data.data.id === targetId)) {
            return res.data.data;
          }
        }
      } catch (_) {}
    }

    // Buscar en el almacén local
    const list = getStoredClinics();
    if (targetId) {
      const found = list.find((c) => c.id === targetId);
      if (found) return found;
    }

    if (cleanTargetNit) {
      const found = list.find((c) => {
        const cNit = String(c.nit || c.cedula || '').replace(/[^0-9]/g, '').trim();
        return cNit && cNit === cleanTargetNit;
      });
      if (found) return found;

      // Intentar sincronizar con Kea Tools DB para traerla en caliente
      try {
        const syncRes = await this.syncKea();
        if (syncRes?.clinics && Array.isArray(syncRes.clinics)) {
          const syncedFound = syncRes.clinics.find((c) => {
            const cNit = String(c.nit || c.cedula || '').replace(/[^0-9]/g, '').trim();
            return cNit && cNit === cleanTargetNit;
          });
          if (syncedFound) return syncedFound;
        }
      } catch (_) {}
    }

    // Solo si NO hay ningún usuario autenticado en sesión, se usa fallback
    if (!targetId && !cleanTargetNit) {
      const foundActive = list.find((c) => c.esClinicaActiva);
      return foundActive || list[0] || INITIAL_CLINICS[0];
    }

    // Si había sesión pero no está en backend/local, sintetizar estructura segura sin filtrar datos ajenos
    try {
      const rawSession = localStorage.getItem('osd_auth_session') || sessionStorage.getItem('osd_auth_session');
      if (rawSession) {
        const session = JSON.parse(rawSession);
        return {
          id: session.clinicId || `clinic-${Date.now()}`,
          nit: session.nit || cleanTargetNit,
          cedula: session.nit || cleanTargetNit,
          nombreVeterinaria: session.nombre || 'Mi Clínica',
          nombreMedico: session.nombre || 'Mi Clínica',
          type: session.type || 'veterinaria',
          directorMedico: { nombre: session.director || 'Director Médico', telefono: session.telefono || '' },
          recoleccion: { ciudad: session.ciudad || 'Bogotá D.C.', direccionFisica: '' },
          correos: { facturacion: session.email || '', resultados: session.email || '' },
          sedes: [
            {
              id: 'sede-principal-1',
              nombreSede: `${session.nombre || 'Sede Principal'} - Sede Principal`,
              esPrincipal: true,
              consecutivoNit: 1,
              codigoSedeNit: '#nit-1',
              ciudad: session.ciudad || 'Bogotá D.C.',
              direccionFisica: '',
            },
          ],
          veterinariosAsociados: [],
          esClinicaActiva: true,
        };
      }
    } catch (_) {}

    return list[0] || INITIAL_CLINICS[0];
  },

  /**
   * Cambia la clínica activa para la sesión
   */
  async setActiveClinic(id) {
    if (API_BASE_URL) {
      try {
        const res = await axios.post(`${API_BASE_URL}/active/${id}`, {}, { timeout: 3000 });
        if (res.data?.success && res.data?.data) {
          try {
            localStorage.setItem(ACTIVE_STORAGE_KEY, id);
          } catch (_) {}
          return res.data.data;
        }
      } catch (_) {}
    }

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
   * Sincroniza la lista de veterinarias y clientes desde la tabla VETERINARIA de Kea Tools DB
   */
  async syncKea() {
    // 1. Intentar vía backend si está disponible (local o desplegado con API)
    try {
      const res = await axios.get(`${API_BASE_URL}/sync-kea`, { timeout: 3000 });
      if (res.data?.success && res.data?.data?.clinics) {
        saveStoredClinics(res.data.data.clinics);
        return res.data.data;
      }
    } catch (_) {}

    // 2. Fallback directo a Kea Tools API en navegadores / Vercel
    try {
      const [res1, res2, vetsRes] = await Promise.all([
        fetch(`${KEA_VETERINARIA_URL}/records?limit=100&offset=0`, {
          headers: { Authorization: `Bearer ${KEA_VETERINARIA_TOKEN}`, Accept: 'application/json' },
        }).then((r) => r.json()).catch(() => null),
        fetch(`${KEA_VETERINARIA_URL}/records?limit=100&offset=100`, {
          headers: { Authorization: `Bearer ${KEA_VETERINARIA_TOKEN}`, Accept: 'application/json' },
        }).then((r) => r.json()).catch(() => null),
        fetch(`${KEA_MEDICOS_URL}/records?limit=100`, {
          headers: { Authorization: `Bearer ${KEA_MEDICOS_TOKEN}`, Accept: 'application/json' },
        }).then((r) => r.json()).catch(() => null),
      ]);

      const records = [
        ...(Array.isArray(res1?.data) ? res1.data : []),
        ...(Array.isArray(res2?.data) ? res2.data : []),
      ];

      const keaVets = Array.isArray(vetsRes?.data) ? vetsRes.data.map((r, i) => mapKeaRecordToVeterinarian(r, i)) : [];

      if (records.length > 0) {
        const mapped = records.map((r, i) => mapKeaRecordToClinic(r, i));
        const currentList = getStoredClinics();
        const cleanNumber = (v) => (v ? String(v).replace(/[^0-9]/g, '').trim() : '');

        mapped.forEach((kc) => {
          const kcNit = cleanNumber(kc.nit);
          const idx = currentList.findIndex((c) => cleanNumber(c.nit) === kcNit);
          if (idx !== -1) {
            currentList[idx] = {
              ...currentList[idx],
              ...kc,
              contrasena: kc.contrasena || currentList[idx].contrasena || '',
              password: kc.contrasena || currentList[idx].password || '',
            };
          } else {
            currentList.push(kc);
          }
        });

        // Vincular los médicos de Kea Tools a su respectiva clínica según NIT
        if (keaVets.length > 0) {
          currentList.forEach((cl) => {
            const clNit = cleanNumber(cl.nit);
            const matchedVets = keaVets.filter((v) => cleanNumber(v.veterinariaNit) === clNit);
            if (matchedVets.length > 0) {
              if (!Array.isArray(cl.veterinariosAsociados)) cl.veterinariosAsociados = [];
              matchedVets.forEach((mv) => {
                const vIdx = cl.veterinariosAsociados.findIndex(
                  (v) => (v.keaId && v.keaId === mv.keaId) || (v.tarjetaProfesional && v.tarjetaProfesional === mv.tarjetaProfesional)
                );
                if (vIdx !== -1) {
                  cl.veterinariosAsociados[vIdx] = {
                    ...cl.veterinariosAsociados[vIdx],
                    ...mv,
                    contrasena: mv.contrasena || cl.veterinariosAsociados[vIdx].contrasena || '',
                    password: mv.password || cl.veterinariosAsociados[vIdx].password || '',
                  };
                } else {
                  cl.veterinariosAsociados.push(mv);
                }
              });
            }
          });
        }

        saveStoredClinics(currentList);
        return { success: true, clinics: currentList, count: mapped.length };
      }
    } catch (directErr) {
      console.warn('[clinicApi] Error al sincronizar directamente con Kea Tools:', directErr);
    }

    return { success: false, clinics: getStoredClinics() };
  },

  /**
   * Registra una nueva veterinaria o médico independiente (en Kea Tools DB y local)
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

    const initialVets = Array.isArray(clinicData.veterinariosAsociados) && clinicData.veterinariosAsociados.length > 0
      ? clinicData.veterinariosAsociados
      : [];

    const newClinic = {
      id: `${type}-${Date.now().toString().slice(-6)}`,
      type,
      esIndependiente: type === 'independiente',
      asociadoVeterinaria: null, // Profesional independiente: no se encuentra asociado a ninguna veterinaria
      asociacionClinica: type === 'independiente' ? 'Sin asociación a clínica (Profesional Autónomo)' : null,
      especialidad: type === 'independiente' ? (clinicData.especialidad || 'Medicina General') : '',
      nit: type === 'veterinaria' ? cleanNumber(clinicData.nit) : '',
      contrasena: clinicData.contrasena || clinicData.password || '',
      password: clinicData.contrasena || clinicData.password || '',
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
        resultados: (clinicData.correos?.resultados || clinicData.correos?.facturacion || '').trim().toLowerCase(),
      },
      documentos: {
        rutNumero: cleanNumber(clinicData.documentos?.rutNumero || clinicData.nit || clinicData.cedula),
        rutArchivo: clinicData.documentos?.rutArchivo || 'RUT_Cargado.pdf',
        tarjetaProfesionalArchivo: type === 'independiente' ? clinicData.documentos?.tarjetaProfesionalArchivo || 'TP_Documento.pdf' : null,
      },
      // Campos de caracterización y bienvenida OSD
      capacitacionOSD: clinicData.capacitacionOSD || '',
      capacitacionQpcr: clinicData.capacitacionQpcr || '',
      capacitacionQpcrOtro: clinicData.capacitacionQpcrOtro || '',
      cantidadVeterinarios: clinicData.cantidadVeterinarios || '',
      cuentaConEspecialistas: clinicData.cuentaConEspecialistas || '',
      especialistas: Array.isArray(clinicData.especialistas) ? clinicData.especialistas : [],
      frecuenciaPcrMensual: clinicData.frecuenciaPcrMensual || '',
      medioConocisteOSD: clinicData.medioConocisteOSD || '',
      observaciones: clinicData.observaciones || '',
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
    let backendClinic = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.post(`${API_BASE_URL}/${clinicId}/veterinarians`, vetData, { timeout: 3500 });
        if (res.data?.success && res.data?.data) {
          backendClinic = res.data.data;
          this._updateLocalClinic(clinicId, backendClinic);
        }
      } catch (_) {}
    }

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const contrasena = String(vetData.password || vetData.contrasena || vetData.pin || '').trim();
    const newVet = {
      id: `vet-${Date.now().toString().slice(-6)}`,
      nombre: vetData.nombre.trim(),
      especialidad: vetData.especialidad?.trim() || 'Medicina General',
      tarjetaProfesional: vetData.tarjetaProfesional.trim(),
      cedula: (vetData.cedula || '').trim(),
      email: vetData.email?.trim() || '',
      telefono: vetData.telefono?.trim() || '',
      contrasena: contrasena,
      password: contrasena,
      rol: vetData.rol || 'veterinario_planta',
      rolNombre: ROLE_PRESETS[vetData.rol]?.nombre || 'Veterinario de Planta',
      permisos: vetData.permisos || (ROLE_PRESETS[vetData.rol]?.permisos) || {},
      tipoAsignacion: vetData.tipoAsignacion || 'fija',
      sedesRotativas: vetData.sedesRotativas || [],
      diasRotacion: vetData.diasRotacion || '',
      sedeId: vetData.sedeId || (clinic.sedes?.[0]?.id || ''),
      sedeNombre: vetData.sedeNombre || (clinic.sedes?.[0]?.nombreSede || 'Sede Principal'),
      estado: vetData.estado || 'activo',
      bloqueadoPorAdmin: vetData.estado === 'bloqueado',
      motivoBloqueo: vetData.estado === 'bloqueado' ? (vetData.motivoBloqueo || 'Bloqueado por el Administrador') : '',
      esDirector: Boolean(vetData.esDirector || vetData.rol === 'director_medico'),
      fechaVinculacion: new Date().toISOString().slice(0, 10),
      veterinariaNit: clinic.nit || clinic.cedula || '',
    };

    // Sincronizar directamente con la base de datos VETERINARIO de Kea Tools
    try {
      const syncResult = await syncVeterinarianToKea(clinic, newVet, newVet);
      if (syncResult && syncResult.keaId) {
        newVet.keaId = syncResult.keaId;
        newVet.id = `kea-mv-${syncResult.keaId}`;
      }
    } catch (syncErr) {
      console.warn('[clinicApi] Error al registrar veterinario en Kea Tools:', syncErr.message);
    }

    if (!clinic.veterinariosAsociados) clinic.veterinariosAsociados = [];
    clinic.veterinariosAsociados.push(newVet);
    clinic.updatedAt = new Date().toISOString();

    saveStoredClinics(list);
    return backendClinic || clinic;
  },

  async updateVeterinarian(clinicId, vetId, updates) {
    let backendClinic = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.put(`${API_BASE_URL}/${clinicId}/veterinarians/${vetId}`, updates, { timeout: 3500 });
        if (res.data?.success && res.data?.data) {
          backendClinic = res.data.data;
          this._updateLocalClinic(clinicId, backendClinic);
        }
      } catch (_) {}
    }

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vIdx = (clinic.veterinariosAsociados || []).findIndex((v) => v.id === vetId);
    if (vIdx === -1) throw new Error('Veterinario asociado no encontrado');

    const prevVet = clinic.veterinariosAsociados[vIdx];
    const newPass = String(updates.password || updates.contrasena || updates.newPassword || '').trim();
    const updatedVet = {
      ...prevVet,
      ...updates,
    };
    if (newPass) {
      updatedVet.password = newPass;
      updatedVet.contrasena = newPass;
    }

    // Persistir DIRECTAMENTE en la base de datos VETERINARIO de Kea Tools
    try {
      const syncResult = await syncVeterinarianToKea(clinic, prevVet, updates);
      if (syncResult && syncResult.keaId) {
        updatedVet.keaId = syncResult.keaId;
        updatedVet.id = `kea-mv-${syncResult.keaId}`;
      }
    } catch (syncErr) {
      console.warn('[clinicApi] Error al sincronizar veterinario con Kea Tools:', syncErr.message);
    }

    clinic.veterinariosAsociados[vIdx] = updatedVet;
    clinic.updatedAt = new Date().toISOString();
    saveStoredClinics(list);

    return backendClinic || clinic;
  },

  async toggleVeterinarianStatus(clinicId, vetId) {
    let backendResult = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.patch(`${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/toggle-status`, {}, { timeout: 3500 });
        if (res.data?.success && res.data?.data) {
          backendResult = { clinic: res.data.data, vet: res.data.vet };
          this._updateLocalClinic(clinicId, res.data.data);
        }
      } catch (_) {}
    }

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vet = (clinic.veterinariosAsociados || []).find((v) => v.id === vetId);
    if (!vet) throw new Error('Veterinario asociado no encontrado');

    vet.estado = vet.estado === 'activo' ? 'inactivo' : 'activo';
    clinic.updatedAt = new Date().toISOString();

    // Actualizar estado en Kea Tools DB
    try {
      await syncVeterinarianToKea(clinic, vet, { estado: vet.estado });
    } catch (syncErr) {
      console.warn('[clinicApi] Error al cambiar estado en Kea Tools:', syncErr.message);
    }

    saveStoredClinics(list);
    return backendResult || { clinic, vet };
  },

  async deleteVeterinarian(clinicId, vetId) {
    let backendClinic = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.delete(`${API_BASE_URL}/${clinicId}/veterinarians/${vetId}`, { timeout: 3500 });
        if (res.data?.success && res.data?.data) {
          backendClinic = res.data.data;
          this._updateLocalClinic(clinicId, backendClinic);
        }
      } catch (_) {}
    }

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vetToDelete = (clinic.veterinariosAsociados || []).find((v) => v.id === vetId);
    if (vetToDelete) {
      // Marcar inactivo en Kea Tools DB
      try {
        await syncVeterinarianToKea(clinic, vetToDelete, { estado: 'inactivo' });
      } catch (_) {}
    }

    clinic.veterinariosAsociados = (clinic.veterinariosAsociados || []).filter((v) => v.id !== vetId);
    clinic.updatedAt = new Date().toISOString();

    saveStoredClinics(list);
    return backendClinic || clinic;
  },

  async blockVeterinarian(clinicId, vetId, { motivoBloqueo, bloqueadoPor } = {}) {
    let backendResult = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.patch(
          `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/block`,
          { motivoBloqueo, bloqueadoPor },
          { timeout: 3500 }
        );
        if (res.data?.success && res.data?.data) {
          backendResult = { clinic: res.data.data, vet: res.data.vet };
          this._updateLocalClinic(clinicId, res.data.data);
        }
      } catch (_) {}
    }

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

    // Sincronizar bloqueo en Kea Tools DB
    try {
      await syncVeterinarianToKea(clinic, vet, {
        estado: 'bloqueado',
        observaciones: `[BLOQUEADO: ${vet.motivoBloqueo}]`,
      });
    } catch (_) {}

    clinic.updatedAt = new Date().toISOString();
    saveStoredClinics(list);
    return backendResult || { clinic, vet };
  },

  async unblockVeterinarian(clinicId, vetId) {
    let backendResult = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.patch(
          `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/unblock`,
          {},
          { timeout: 3500 }
        );
        if (res.data?.success && res.data?.data) {
          backendResult = { clinic: res.data.data, vet: res.data.vet };
          this._updateLocalClinic(clinicId, res.data.data);
        }
      } catch (_) {}
    }

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

    // Sincronizar desbloqueo en Kea Tools DB
    try {
      await syncVeterinarianToKea(clinic, vet, { estado: 'activo' });
    } catch (_) {}

    clinic.updatedAt = new Date().toISOString();
    saveStoredClinics(list);
    return backendResult || { clinic, vet };
  },

  async updateVeterinarianPermissions(clinicId, vetId, { permisos, rol } = {}) {
    let backendResult = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.put(
          `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/permissions`,
          { permisos, rol },
          { timeout: 3500 }
        );
        if (res.data?.success && res.data?.data) {
          backendResult = { clinic: res.data.data, vet: res.data.vet };
          this._updateLocalClinic(clinicId, res.data.data);
        }
      } catch (_) {}
    }

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
    return backendResult || { clinic, vet };
  },

  async assignVeterinarianSedes(clinicId, vetId, { tipoAsignacion, sedeId, sedeNombre, sedesRotativas, sedesRotativasNombres, diasRotacion } = {}) {
    let backendResult = null;
    if (API_BASE_URL) {
      try {
        const res = await axios.put(
          `${API_BASE_URL}/${clinicId}/veterinarians/${vetId}/sedes`,
          { tipoAsignacion, sedeId, sedeNombre, sedesRotativas, sedesRotativasNombres, diasRotacion },
          { timeout: 3500 }
        );
        if (res.data?.success && res.data?.data) {
          backendResult = { clinic: res.data.data, vet: res.data.vet };
          this._updateLocalClinic(clinicId, res.data.data);
        }
      } catch (_) {}
    }

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
    return backendResult || { clinic, vet };
  },

  /**
   * Sincroniza en vivo los veterinarios asociados a una clínica desde la base de datos Kea Tools
   */
  async syncVeterinarians(clinicId) {
    if (API_BASE_URL) {
      try {
        const res = await axios.get(`${API_BASE_URL}/${clinicId}/veterinarians/sync-kea`, { timeout: 6000 });
        if (res.data?.success && res.data?.data?.clinic) {
          this._updateLocalClinic(clinicId, res.data.data.clinic);
          return res.data.data;
        }
      } catch (_) {}
    }

    const list = getStoredClinics();
    const clinic = list.find((c) => c.id === clinicId);
    if (!clinic) return { success: false };

    const cleanNit = String(clinic.nit || clinic.cedula || '').replace(/[^0-9]/g, '');

    try {
      const vetsRes = await fetch(`${KEA_MEDICOS_URL}/records?limit=100`, {
        headers: { Authorization: `Bearer ${KEA_MEDICOS_TOKEN}`, Accept: 'application/json' },
      }).then((r) => r.json()).catch(() => null);

      if (Array.isArray(vetsRes?.data)) {
        const mapped = vetsRes.data.map((r, i) => mapKeaRecordToVeterinarian(r, i));
        const matched = mapped.filter((v) => {
          const vNit = String(v.veterinariaNit || '').replace(/[^0-9]/g, '');
          return vNit && vNit === cleanNit;
        });

        if (!Array.isArray(clinic.veterinariosAsociados)) clinic.veterinariosAsociados = [];
        matched.forEach((mv) => {
          const idx = clinic.veterinariosAsociados.findIndex(
            (v) => (v.keaId && v.keaId === mv.keaId) || (v.tarjetaProfesional && v.tarjetaProfesional === mv.tarjetaProfesional)
          );
          if (idx !== -1) {
            clinic.veterinariosAsociados[idx] = {
              ...clinic.veterinariosAsociados[idx],
              ...mv,
            };
          } else {
            clinic.veterinariosAsociados.push(mv);
          }
        });
        clinic.updatedAt = new Date().toISOString();
        saveStoredClinics(list);
        return { success: true, clinic, veterinarians: clinic.veterinariosAsociados };
      }
    } catch (err) {
      console.warn('[clinicApi] Error al sincronizar veterinarios desde Kea Tools:', err.message);
    }
    return { success: false, clinic };
  },

  _updateLocalClinic(clinicId, updatedClinic) {
    const list = getStoredClinics().map((c) => (c.id === clinicId ? updatedClinic : c));
    saveStoredClinics(list);
  },
};
