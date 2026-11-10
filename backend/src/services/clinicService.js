import { INITIAL_CLINICS, ROLE_PRESETS } from '../models/clinicModel.js';
import { keaService } from './keaService.js';

let clinics = [...INITIAL_CLINICS];

function cleanNumber(val) {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '').trim();
}

export const clinicService = {
  /**
   * Obtiene la lista completa de veterinarias y médicos independientes registrados
   */
  getAll({ search = '', type = 'all', status = 'all' } = {}) {
    let result = [...clinics];

    if (type !== 'all') {
      result = result.filter((c) => c.type === type);
    }

    if (status !== 'all') {
      result = result.filter((c) => c.estado === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((c) => {
        return (
          (c.nombreVeterinaria && c.nombreVeterinaria.toLowerCase().includes(q)) ||
          (c.nombreMedico && c.nombreMedico.toLowerCase().includes(q)) ||
          (c.nit && c.nit.includes(q)) ||
          (c.cedula && c.cedula.includes(q)) ||
          (c.tarjetaProfesional && c.tarjetaProfesional.toLowerCase().includes(q)) ||
          (c.recoleccion?.ciudad && c.recoleccion.ciudad.toLowerCase().includes(q)) ||
          (c.recoleccion?.direccionFisica && c.recoleccion.direccionFisica.toLowerCase().includes(q)) ||
          (c.directorMedico?.nombre && c.directorMedico.nombre.toLowerCase().includes(q)) ||
          (c.correos?.facturacion && c.correos.facturacion.toLowerCase().includes(q)) ||
          (c.correos?.resultados && c.correos.resultados.toLowerCase().includes(q)) ||
          (c.sedes && c.sedes.some((s) => s.nombreSede.toLowerCase().includes(q) || s.direccionFisica.toLowerCase().includes(q))) ||
          (c.veterinariosAsociados && c.veterinariosAsociados.some((v) => v.nombre.toLowerCase().includes(q) || v.tarjetaProfesional.toLowerCase().includes(q)))
        );
      });
    }

    return result;
  },

  /**
   * Obtiene una clínica o médico por ID
   */
  getById(id) {
    return clinics.find((c) => c.id === id) || null;
  },

  /**
   * Obtiene la clínica o médico marcado como actualmente activo en la sesión
   */
  getActiveClinic({ clinicId, nit } = {}) {
    const cleanNit = nit ? cleanNumber(nit) : '';
    if (clinicId) {
      const found = clinics.find((c) => c.id === clinicId);
      if (found) return found;
    }
    if (cleanNit) {
      const found = clinics.find((c) => {
        const cNit = cleanNumber(c.nit);
        const cCed = cleanNumber(c.cedula);
        return (cNit && cNit === cleanNit) || (cCed && cCed === cleanNit);
      });
      if (found) return found;
    }
    const active = clinics.find((c) => c.esClinicaActiva);
    return active || clinics[0] || null;
  },

  /**
   * Establece una clínica como activa para la sesión de trabajo actual
   */
  setActiveClinic(id) {
    const target = clinics.find((c) => c.id === id);
    if (!target) {
      throw new Error(`Veterinaria con ID '${id}' no encontrada`);
    }

    clinics = clinics.map((c) => ({
      ...c,
      esClinicaActiva: c.id === id,
    }));

    return clinics.find((c) => c.id === id);
  },

  /**
   * Registra una nueva veterinaria o médico independiente (en Kea Tools DB y local)
   */
  async create(data) {
    const type = data.type === 'independiente' ? 'independiente' : 'veterinaria';
    const nombreEntidad = (data.nombreVeterinaria || data.nombreEmpresa || data.nombreMedico || '').trim();
    const nitOrCedula = (data.nit || data.cedula || '').trim();

    const directorNombre = (data.directorMedico?.nombre || data.nombreDirectorMedico || '').trim();
    const directorTelefono = (data.directorMedico?.telefono || data.telefonoDirectorMedico || '').trim();
    const adminNombre = (data.administrativa?.nombreResponsable || data.nombreResponsablePagos || '').trim();
    const adminTelefono = (data.administrativa?.telefonoPagos || data.telefonoPagos || '').trim();
    const ciudad = (data.recoleccion?.ciudad || data.ciudad || '').trim();
    const direccion = (data.recoleccion?.direccionFisica || data.direccionFisica || '').trim();
    const correoFact = (data.correos?.facturacion || data.correoFacturacion || '').trim().toLowerCase();
    const correoRes = (data.correos?.resultados || correoFact).trim().toLowerCase();
    const rutNum = (data.documentos?.rutNumero || data.rutNumero || nitOrCedula).trim();

    // Validaciones según modalidad
    if (type === 'veterinaria') {
      if (!nombreEntidad) {
        throw new Error('El nombre de la empresa o clínica veterinaria es obligatorio');
      }
      if (!nitOrCedula) {
        throw new Error('El NIT o Cédula de la empresa solicitante es obligatorio');
      }
      if (!directorNombre) {
        throw new Error('El nombre del director médico / responsable del área médica es obligatorio');
      }
      if (!directorTelefono) {
        throw new Error('El teléfono del director médico es obligatorio');
      }
    } else {
      if (!nombreEntidad) {
        throw new Error('El nombre completo del médico veterinario es obligatorio');
      }
      if (!nitOrCedula) {
        throw new Error('La cédula del médico veterinario es obligatoria (sin puntos ni guiones)');
      }
    }

    // Validaciones comunes obligatorias
    if (!adminNombre) {
      throw new Error('El nombre del responsable del área administrativa o de facturación es obligatorio');
    }
    if (!adminTelefono) {
      throw new Error('El teléfono del responsable de pagos es obligatorio');
    }
    if (!ciudad) {
      throw new Error('La ciudad de recolección es obligatoria');
    }
    if (!direccion) {
      throw new Error('La dirección física de recolección es obligatoria');
    }
    if (!correoFact) {
      throw new Error('El correo electrónico para facturación es obligatorio');
    }
    if (!rutNum) {
      throw new Error('El número de RUT o Cédula es obligatorio');
    }

    const id = `${type}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    // Sede principal inicial derivada de la dirección principal
    const initialSedes = Array.isArray(data.sedes) && data.sedes.length > 0 ? data.sedes : [
      {
        id: `sede-${Date.now().toString().slice(-4)}`,
        nombreSede: type === 'veterinaria'
          ? (nombreEntidad ? `${nombreEntidad} - Sede Principal` : 'Sede Principal')
          : 'Consultorio Particular',
        esPrincipal: true,
        consecutivoNit: type === 'veterinaria' ? 1 : null,
        codigoSedeNit: type === 'veterinaria' ? '#nit-1' : '',
        tipoPunto: type === 'veterinaria' ? 'sede_principal' : 'consultorio_independiente',
        departamento: data.recoleccion?.departamento?.trim() || 'Colombia',
        ciudad: ciudad,
        direccionFisica: direccion,
        detallesAdicionales: data.recoleccion?.detallesAdicionales?.trim() || '',
        telefonoContacto: type === 'veterinaria' ? directorTelefono : adminTelefono,
        responsableSede: type === 'veterinaria' ? directorNombre : nombreEntidad,
        indicacionesRuta: data.recoleccion?.indicacionesRuta?.trim() || 'Donde el repartidor recogerá las muestras',
        correoResultadosSede: correoRes,
      },
    ];

    // Veterinarios asociados iniciales:
    // Una clínica nueva inicia con lista limpia [] de veterinarios hasta que vincule su propio equipo
    const initialVets = Array.isArray(data.veterinariosAsociados) && data.veterinariosAsociados.length > 0
      ? data.veterinariosAsociados
      : [];

    const contrasena = (data.contrasena || data.password || data.pin || '').trim();

    const newClinic = {
      id,
      type,
      esIndependiente: type === 'independiente',
      asociadoVeterinaria: null, // Profesional independiente: no se encuentra asociado a ninguna veterinaria
      asociacionClinica: type === 'independiente' ? 'Sin asociación a clínica (Profesional Autónomo)' : null,
      especialidad: type === 'independiente' ? (data.especialidad || 'Medicina General') : '',
      nit: cleanNumber(nitOrCedula),
      contrasena: contrasena,
      password: contrasena,
      nombreVeterinaria: type === 'veterinaria' ? nombreEntidad : '',
      tieneMultiplesSedes: Boolean(data.tieneMultiplesSedes ?? (initialSedes.length > 1)),
      directorMedico: {
        nombre: directorNombre,
        telefono: directorTelefono,
      },
      cedula: type === 'independiente' ? cleanNumber(nitOrCedula) : '',
      nombreMedico: type === 'independiente' ? nombreEntidad : '',
      tarjetaProfesional: type === 'independiente' ? (data.tarjetaProfesional || '').trim() : '',
      administrativa: {
        nombreResponsable: adminNombre,
        telefonoPagos: adminTelefono,
      },
      recoleccion: {
        departamento: data.recoleccion?.departamento?.trim() || 'Colombia',
        ciudad: ciudad,
        direccionFisica: direccion,
        detallesAdicionales: data.recoleccion?.detallesAdicionales?.trim() || '',
        indicacionesRuta: data.recoleccion?.indicacionesRuta?.trim() || 'Donde el repartidor recogerá las muestras',
      },
      sedes: initialSedes,
      veterinariosAsociados: initialVets,
      correos: {
        facturacion: correoFact,
        resultados: correoRes,
      },
      documentos: {
        rutNumero: cleanNumber(rutNum),
        rutArchivo: data.documentos?.rutArchivo || data.rutFileName || 'RUT_Cargado.pdf',
        tarjetaProfesionalArchivo: type === 'independiente' ? data.documentos?.tarjetaProfesionalArchivo || null : null,
      },
      // Campos de caracterización y bienvenida OSD
      capacitacionOSD: data.capacitacionOSD || '',
      capacitacionQpcr: data.capacitacionQpcr || '',
      capacitacionQpcrOtro: data.capacitacionQpcrOtro || '',
      cantidadVeterinarios: data.cantidadVeterinarios || '',
      cuentaConEspecialistas: data.cuentaConEspecialistas || '',
      especialistas: Array.isArray(data.especialistas) ? data.especialistas : [],
      frecuenciaPcrMensual: data.frecuenciaPcrMensual || '',
      medioConocisteOSD: data.medioConocisteOSD || '',
      observaciones: data.observaciones || '',
      terminosAceptados: data.terminosAceptados ?? true,
      fechaAceptacionTerminos: now,
      estado: data.estado || 'activo',
      esClinicaActiva: Boolean(data.esClinicaActiva),
      totalMuestrasHistoricas: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Persistir directamente en la tabla VETERINARIA de Kea Tools DB
    try {
      const keaCreated = await keaService.createVeterinariaInKea({
        ...data,
        type,
        nit: nitOrCedula,
        nombreEmpresa: nombreEntidad,
        contrasena: contrasena,
        correoFacturacion: correoFact,
        ciudad: ciudad,
        direccionFisica: direccion,
        nombreDirectorMedico: directorNombre,
        telefonoDirectorMedico: directorTelefono,
        telefonoPagos: adminTelefono,
      });
      if (keaCreated) {
        newClinic.keaRecordId = keaCreated.keaRecordId || keaCreated.id;
        newClinic.id = `kea-vet-${keaCreated.keaRecordId || keaCreated.id}`;
        console.log(`[Kea DB] Cliente/Veterinaria guardado con éxito en Kea Tools DB con ID: ${newClinic.id}`);
      }
    } catch (keaErr) {
      console.warn(`[Kea DB] No se pudo guardar en Kea Tools DB (${keaErr.message}). Continuando con guardado local.`);
    }

    if (newClinic.esClinicaActiva) {
      clinics = clinics.map((c) => ({ ...c, esClinicaActiva: false }));
    }

    clinics.unshift(newClinic);
    return newClinic;
  },

  /**
   * Sincroniza la lista de veterinarias y clientes desde la tabla VETERINARIA de Kea Tools DB
   * Trae los registros más recientes del final de la tabla y los iniciales
   */
  async syncFromKea() {
    try {
      const res = await keaService.fetchVeterinariasFromKea({ limit: 100, latestFirst: true });
      if (res && Array.isArray(res.clinics)) {
        res.clinics.forEach((kc) => {
          const existingIdx = clinics.findIndex((c) => cleanNumber(c.nit) === cleanNumber(kc.nit));
          if (existingIdx !== -1) {
            clinics[existingIdx] = {
              ...clinics[existingIdx],
              ...kc,
              contrasena: kc.contrasena || clinics[existingIdx].contrasena || '',
              password: kc.contrasena || clinics[existingIdx].contrasena || '',
            };
          } else {
            clinics.push(kc);
          }
        });

        // Sincronizar también los médicos veterinarios de la tabla VETERINARIO de Kea
        try {
          const vetsRes = await keaService.fetchVeterinariosFromKea({ limit: 200 });
          if (vetsRes?.veterinarians && Array.isArray(vetsRes.veterinarians)) {
            vetsRes.veterinarians.forEach((kv) => {
              const vetClinicNit = cleanNumber(kv.veterinariaNit);
              if (!vetClinicNit) return;
              const targetClinic = clinics.find((c) => cleanNumber(c.nit) === vetClinicNit);
              if (targetClinic) {
                if (!Array.isArray(targetClinic.veterinariosAsociados)) {
                  targetClinic.veterinariosAsociados = [];
                }
                const existingVetIdx = targetClinic.veterinariosAsociados.findIndex(
                  (v) => (v.keaId && v.keaId === kv.keaId) || (v.tarjetaProfesional && v.tarjetaProfesional === kv.tarjetaProfesional)
                );
                if (existingVetIdx !== -1) {
                  targetClinic.veterinariosAsociados[existingVetIdx] = {
                    ...targetClinic.veterinariosAsociados[existingVetIdx],
                    ...kv,
                    permisos: targetClinic.veterinariosAsociados[existingVetIdx].permisos || kv.permisos,
                  };
                } else {
                  targetClinic.veterinariosAsociados.push(kv);
                }
              }
            });
          }
        } catch (vetErr) {
          console.warn('[Kea DB] No se pudieron sincronizar médicos veterinarios desde Kea:', vetErr.message);
        }

        return {
          success: true,
          syncedCount: res.clinics.length,
          total: res.total,
          clinics,
        };
      }
    } catch (err) {
      console.warn('[Kea DB] Error al sincronizar veterinarias desde Kea:', err.message);
      return { success: false, message: err.message, clinics };
    }
    return { success: true, syncedCount: 0, clinics };
  },

  /**
   * Actualiza el perfil de una veterinaria o médico independiente existente
   */
  update(id, updates) {
    const idx = clinics.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Veterinaria con ID '${id}' no encontrada`);
    }

    const current = clinics[idx];
    const type = updates.type || current.type;
    const now = new Date().toISOString();

    const updated = {
      ...current,
      type,
      nit: type === 'veterinaria' ? cleanNumber(updates.nit ?? current.nit) : '',
      nombreVeterinaria: type === 'veterinaria' ? (updates.nombreVeterinaria ?? current.nombreVeterinaria) : '',
      tieneMultiplesSedes: updates.tieneMultiplesSedes !== undefined ? updates.tieneMultiplesSedes : current.tieneMultiplesSedes,
      directorMedico: {
        nombre: type === 'veterinaria' ? (updates.directorMedico?.nombre ?? current.directorMedico?.nombre ?? '') : '',
        telefono: type === 'veterinaria' ? (updates.directorMedico?.telefono ?? current.directorMedico?.telefono ?? '') : '',
      },
      cedula: type === 'independiente' ? cleanNumber(updates.cedula ?? current.cedula) : '',
      nombreMedico: type === 'independiente' ? (updates.nombreMedico ?? current.nombreMedico) : '',
      tarjetaProfesional: type === 'independiente' ? (updates.tarjetaProfesional ?? current.tarjetaProfesional) : '',
      administrativa: {
        nombreResponsable: updates.administrativa?.nombreResponsable ?? current.administrativa?.nombreResponsable ?? '',
        telefonoPagos: updates.administrativa?.telefonoPagos ?? current.administrativa?.telefonoPagos ?? '',
      },
      recoleccion: {
        ciudad: updates.recoleccion?.ciudad ?? current.recoleccion?.ciudad ?? '',
        direccionFisica: updates.recoleccion?.direccionFisica ?? current.recoleccion?.direccionFisica ?? '',
        detallesAdicionales: updates.recoleccion?.detallesAdicionales ?? current.recoleccion?.detallesAdicionales ?? '',
        indicacionesRuta: updates.recoleccion?.indicacionesRuta ?? current.recoleccion?.indicacionesRuta ?? 'Donde el repartidor recogerá las muestras',
      },
      sedes: updates.sedes || current.sedes || [],
      veterinariosAsociados: updates.veterinariosAsociados || current.veterinariosAsociados || [],
      correos: {
        facturacion: (updates.correos?.facturacion ?? current.correos?.facturacion ?? '').toLowerCase(),
        resultados: (updates.correos?.resultados ?? current.correos?.resultados ?? '').toLowerCase(),
      },
      documentos: {
        rutNumero: cleanNumber(updates.documentos?.rutNumero ?? current.documentos?.rutNumero),
        rutArchivo: updates.documentos?.rutArchivo ?? current.documentos?.rutArchivo,
        tarjetaProfesionalArchivo: updates.documentos?.tarjetaProfesionalArchivo ?? current.documentos?.tarjetaProfesionalArchivo,
      },
      estado: updates.estado ?? current.estado,
      updatedAt: now,
    };

    if (updates.esClinicaActiva) {
      clinics = clinics.map((c) => ({ ...c, esClinicaActiva: c.id === id }));
      updated.esClinicaActiva = true;
    }

    clinics[idx] = updated;
    return updated;
  },

  /**
   * Agrega una nueva sede a la clínica
   */
  addSede(clinicId, sedeData) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    if (!sedeData.nombreSede?.trim()) throw new Error('El nombre de la sede es obligatorio');
    if (!sedeData.direccionFisica?.trim()) throw new Error('La dirección física de la sede es obligatoria');
    if (!sedeData.ciudad?.trim()) throw new Error('La ciudad de la sede es obligatoria');

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

    const newSede = {
      id: `sede-${Date.now().toString().slice(-6)}`,
      nombreSede: sedeData.nombreSede.trim(),
      esPrincipal: Boolean(sedeData.esPrincipal),
      consecutivoNit: consecutivo,
      codigoSedeNit: codigoSedeNit,
      tipoPunto: clinic.type === 'independiente' ? 'consultorio_independiente' : 'sede_sucursal',
      departamento: sedeData.departamento?.trim() || clinic.recoleccion?.departamento || 'Bogotá',
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

    return clinic;
  },

  /**
   * Actualiza una sede existente
   */
  updateSede(clinicId, sedeId, sedeData) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const idx = (clinic.sedes || []).findIndex((s) => s.id === sedeId);
    if (idx === -1) throw new Error('Sede no encontrada');

    const prevSede = clinic.sedes[idx];
    let consecutivo = prevSede.consecutivoNit;
    let codigoSedeNit = prevSede.codigoSedeNit;

    if (clinic.type === 'veterinaria') {
      if (sedeData.consecutivoNit !== undefined && sedeData.consecutivoNit !== null && sedeData.consecutivoNit !== '') {
        consecutivo = Number(sedeData.consecutivoNit);
        codigoSedeNit = `#nit-${consecutivo}`;
      } else if (!consecutivo) {
        consecutivo = idx + 1;
        codigoSedeNit = `#nit-${consecutivo}`;
      }
    }

    const updatedSede = {
      ...prevSede,
      ...sedeData,
      departamento: sedeData.departamento !== undefined ? sedeData.departamento.trim() : (prevSede.departamento || clinic.recoleccion?.departamento || 'Bogotá'),
      consecutivoNit: consecutivo,
      codigoSedeNit: codigoSedeNit,
    };

    if (updatedSede.esPrincipal) {
      clinic.sedes.forEach((s) => (s.esPrincipal = false));
      clinic.recoleccion.departamento = updatedSede.departamento;
      clinic.recoleccion.ciudad = updatedSede.ciudad;
      clinic.recoleccion.direccionFisica = updatedSede.direccionFisica;
    }

    clinic.sedes[idx] = updatedSede;
    clinic.updatedAt = new Date().toISOString();
    return clinic;
  },

  /**
   * Elimina una sede
   */
  deleteSede(clinicId, sedeId) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    clinic.sedes = (clinic.sedes || []).filter((s) => s.id !== sedeId);
    if (clinic.sedes.length > 0 && !clinic.sedes.some((s) => s.esPrincipal)) {
      clinic.sedes[0].esPrincipal = true;
    }
    clinic.tieneMultiplesSedes = clinic.sedes.length > 1;
    clinic.updatedAt = new Date().toISOString();
    return clinic;
  },

  /**
   * Sincroniza médicos veterinarios asociados específicamente a una clínica desde Kea Tools DB
   */
  async syncVeterinariansForClinic(clinicId) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const clinicNit = cleanNumber(clinic.nit || clinic.cedula);
    if (!clinicNit) return { success: true, veterinarians: clinic.veterinariosAsociados || [], clinic };

    try {
      const res = await keaService.fetchVeterinariosFromKea({ limit: 100, clinicNit });
      if (res?.veterinarians) {
        if (!Array.isArray(clinic.veterinariosAsociados)) {
          clinic.veterinariosAsociados = [];
        }
        res.veterinarians.forEach((kv) => {
          const existingIdx = clinic.veterinariosAsociados.findIndex(
            (v) => (v.keaId && v.keaId === kv.keaId) || (v.tarjetaProfesional && v.tarjetaProfesional === kv.tarjetaProfesional)
          );
          if (existingIdx !== -1) {
            clinic.veterinariosAsociados[existingIdx] = {
              ...clinic.veterinariosAsociados[existingIdx],
              ...kv,
              permisos: clinic.veterinariosAsociados[existingIdx].permisos || kv.permisos,
            };
          } else {
            clinic.veterinariosAsociados.push(kv);
          }
        });
      }
    } catch (err) {
      console.warn('[Kea DB] Error al sincronizar veterinarios de la clínica:', err.message);
    }

    return {
      success: true,
      veterinarians: clinic.veterinariosAsociados,
      clinic,
    };
  },

  /**
   * Añade un nuevo veterinario asociado y lo persiste en la BD Kea Tools asociándolo al NIT de la clínica
   */
  async addVeterinarian(clinicId, vetData) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    if (!vetData.nombre?.trim()) throw new Error('El nombre completo del veterinario es obligatorio');
    if (!vetData.tarjetaProfesional?.trim()) throw new Error('El número de tarjeta profesional es obligatorio');

    const contrasena = String(vetData.password || vetData.contrasena || vetData.pin || '').trim();
    const newVet = {
      id: `vet-${Date.now().toString().slice(-6)}`,
      nombre: vetData.nombre.trim(),
      especialidad: vetData.especialidad?.trim() || 'Medicina General',
      tarjetaProfesional: vetData.tarjetaProfesional.trim(),
      cedula: (vetData.cedula || '').trim(),
      email: (vetData.email || '').trim(),
      telefono: (vetData.telefono || '').trim(),
      contrasena: contrasena,
      password: contrasena,
      rol: vetData.rol || 'veterinario_planta',
      rolNombre: ROLE_PRESETS[vetData.rol]?.nombre || 'Veterinario de Planta',
      permisos: vetData.permisos || (ROLE_PRESETS[vetData.rol]?.permisos) || {},
      tipoAsignacion: vetData.tipoAsignacion || 'fija',
      sedesRotativas: vetData.sedesRotativas || [],
      diasRotacion: vetData.diasRotacion || '',
      ciudad: (vetData.ciudad || clinic.recoleccion?.ciudad || 'Medellín').trim(),
      sedeId: vetData.sedeId || (clinic.sedes?.[0]?.id || ''),
      sedeNombre: vetData.sedeNombre || (clinic.sedes?.[0]?.nombreSede || 'Sede Principal'),
      estado: vetData.estado || 'activo', // 'activo' | 'inactivo' | 'bloqueado'
      bloqueadoPorAdmin: vetData.estado === 'bloqueado',
      motivoBloqueo: vetData.estado === 'bloqueado' ? (vetData.motivoBloqueo || 'Bloqueado por el Administrador') : '',
      esDirector: Boolean(vetData.esDirector || vetData.rol === 'director_medico'),
      fechaVinculacion: new Date().toISOString().slice(0, 10),
      veterinariaNit: clinic.nit || clinic.cedula || '',
    };

    // Guardar directamente en la tabla VETERINARIO de Kea Tools DB
    try {
      const keaCreated = await keaService.createVeterinarioInKea(newVet, clinic.nit || clinic.cedula);
      if (keaCreated) {
        newVet.keaId = keaCreated.keaId;
        newVet.id = keaCreated.id;
        console.log(`[Kea DB] Médico veterinario asociado creado con éxito en Kea Tools DB: ${newVet.id} para clínica NIT ${clinic.nit}`);
      }
    } catch (keaErr) {
      console.warn(`[Kea DB] No se pudo guardar veterinario en Kea Tools DB (${keaErr.message}). Continuando con guardado local.`);
    }

    if (!clinic.veterinariosAsociados) clinic.veterinariosAsociados = [];
    clinic.veterinariosAsociados.push(newVet);
    clinic.updatedAt = new Date().toISOString();

    return clinic;
  },

  /**
   * Actualiza datos de un veterinario asociado
   */
  async updateVeterinarian(clinicId, vetId, updates) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const idx = (clinic.veterinariosAsociados || []).findIndex((v) => v.id === vetId);
    if (idx === -1) throw new Error('Veterinario asociado no encontrado');

    const prevVet = clinic.veterinariosAsociados[idx];
    const updatedVet = {
      ...prevVet,
      ...updates,
    };

    if (prevVet.keaId) {
      try {
        await keaService.updateVeterinarioInKea(prevVet.keaId, updates);
        console.log(`[Kea DB] Veterinario ${prevVet.keaId} actualizado con éxito en Kea Tools DB.`);
      } catch (keaErr) {
        console.warn(`[Kea DB] No se pudo actualizar veterinario en Kea (${keaErr.message}).`);
      }
    }

    clinic.veterinariosAsociados[idx] = updatedVet;
    clinic.updatedAt = new Date().toISOString();
    return clinic;
  },

  /**
   * Activa o desactiva el usuario de un veterinario asociado
   */
  toggleVeterinarianStatus(clinicId, vetId) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vet = (clinic.veterinariosAsociados || []).find((v) => v.id === vetId);
    if (!vet) throw new Error('Veterinario asociado no encontrado');

    vet.estado = vet.estado === 'activo' ? 'inactivo' : 'activo';
    clinic.updatedAt = new Date().toISOString();
    return { clinic, vet };
  },

  /**
   * Bloquea el acceso a un veterinario específico por parte del Admin Principal
   */
  blockVeterinarian(clinicId, vetId, { motivoBloqueo, bloqueadoPor } = {}) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vet = (clinic.veterinariosAsociados || []).find((v) => v.id === vetId);
    if (!vet) throw new Error('Veterinario asociado no encontrado');

    if (vet.esDirector) {
      throw new Error('No es posible bloquear al Director Médico / Administrador Principal');
    }

    vet.estado = 'bloqueado';
    vet.bloqueadoPorAdmin = true;
    vet.motivoBloqueo = motivoBloqueo?.trim() || 'Acceso suspendido temporalmente por el Administrador Principal de la Clínica';
    vet.fechaBloqueo = new Date().toISOString();
    vet.bloqueadoPor = bloqueadoPor?.trim() || 'Dr. Alejandro Morales Restrepo (Admin Principal)';
    vet.permisosPrevios = { ...(vet.permisos || {}) };
    vet.permisos = Object.keys(vet.permisos || {}).reduce((acc, k) => ({ ...acc, [k]: false }), {});

    clinic.updatedAt = new Date().toISOString();
    return { clinic, vet };
  },

  /**
   * Desbloquea y restablece el acceso a un veterinario
   */
  unblockVeterinarian(clinicId, vetId) {
    const clinic = this.getById(clinicId);
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
    return { clinic, vet };
  },

  /**
   * Actualiza la matriz granular de permisos y el rol de un veterinario
   */
  updateVeterinarianPermissions(clinicId, vetId, { permisos, rol } = {}) {
    const clinic = this.getById(clinicId);
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
    return { clinic, vet };
  },

  /**
   * Asigna sedes (fija, rotativa o todas las sedes) a un veterinario
   */
  assignVeterinarianSedes(clinicId, vetId, { tipoAsignacion, sedeId, sedeNombre, sedesRotativas, sedesRotativasNombres, diasRotacion } = {}) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const vet = (clinic.veterinariosAsociados || []).find((v) => v.id === vetId);
    if (!vet) throw new Error('Veterinario asociado no encontrado');

    if (tipoAsignacion) vet.tipoAsignacion = tipoAsignacion;
    if (sedeId) vet.sedeId = sedeId;
    if (sedeNombre) vet.sedeNombre = sedeNombre;
    if (Array.isArray(sedesRotativas)) vet.sedesRotativas = sedesRotativas;
    if (Array.isArray(sedesRotativasNombres)) vet.sedesRotativasNombres = sedesRotativasNombres;
    if (diasRotacion !== undefined) vet.diasRotacion = diasRotacion;

    // Si la asignación es 'todas_las_sedes', habilitamos el permiso de multi-sede
    if (tipoAsignacion === 'todas_las_sedes') {
      if (!vet.permisos) vet.permisos = {};
      vet.permisos.accesoTodasLasSedes = true;
    }

    clinic.updatedAt = new Date().toISOString();
    return { clinic, vet };
  },

  /**
   * Elimina un veterinario asociado
   */
  deleteVeterinarian(clinicId, vetId) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    clinic.veterinariosAsociados = (clinic.veterinariosAsociados || []).filter((v) => v.id !== vetId);
    clinic.updatedAt = new Date().toISOString();
    return clinic;
  },

  /**
   * Elimina un registro de veterinaria
   */
  delete(id) {
    const idx = clinics.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Veterinaria con ID '${id}' no encontrada`);
    }
    const wasActive = clinics[idx].esClinicaActiva;
    clinics.splice(idx, 1);

    if (wasActive && clinics.length > 0) {
      clinics[0].esClinicaActiva = true;
    }
    return true;
  },
};
