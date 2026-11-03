import { INITIAL_CLINICS, ROLE_PRESETS } from '../models/clinicModel.js';

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
  getActiveClinic() {
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
   * Registra una nueva veterinaria o médico independiente
   */
  create(data) {
    const type = data.type === 'independiente' ? 'independiente' : 'veterinaria';

    // Validaciones estrictas según especificación de usuario
    if (type === 'veterinaria') {
      if (!data.nombreVeterinaria?.trim()) {
        throw new Error('El nombre de la veterinaria es obligatorio');
      }
      if (!data.nit?.trim()) {
        throw new Error('El NIT de la empresa es obligatorio (sin puntos ni guiones)');
      }
      if (!data.directorMedico?.nombre?.trim()) {
        throw new Error('El nombre del director médico / responsable del área médica es obligatorio');
      }
      if (!data.directorMedico?.telefono?.trim()) {
        throw new Error('El teléfono del director médico es obligatorio');
      }
    } else {
      if (!data.nombreMedico?.trim()) {
        throw new Error('El nombre completo del médico veterinario es obligatorio');
      }
      if (!data.cedula?.trim()) {
        throw new Error('La cédula del médico veterinario es obligatoria (sin puntos ni guiones)');
      }
      if (!data.tarjetaProfesional?.trim()) {
        throw new Error('La tarjeta profesional del médico veterinario es obligatoria');
      }
    }

    // Validaciones comunes obligatorias
    if (!data.administrativa?.nombreResponsable?.trim()) {
      throw new Error('El nombre del responsable del área administrativa es obligatorio');
    }
    if (!data.administrativa?.telefonoPagos?.trim()) {
      throw new Error('El teléfono del responsable de pagos es obligatorio');
    }
    if (!data.recoleccion?.ciudad?.trim()) {
      throw new Error('La ciudad de recolección es obligatoria');
    }
    if (!data.recoleccion?.direccionFisica?.trim()) {
      throw new Error('La dirección física de recolección es obligatoria');
    }
    if (!data.correos?.facturacion?.trim()) {
      throw new Error('El correo electrónico para facturación es obligatorio');
    }
    if (!data.correos?.resultados?.trim()) {
      throw new Error('El correo electrónico para reporte de resultados es obligatorio');
    }
    if (!data.documentos?.rutNumero?.trim()) {
      throw new Error('El número de RUT es obligatorio (sin puntos ni guiones)');
    }

    const id = `${type}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    // Sede principal inicial derivada de la dirección principal
    const initialSedes = Array.isArray(data.sedes) && data.sedes.length > 0 ? data.sedes : [
      {
        id: `sede-${Date.now().toString().slice(-4)}`,
        nombreSede: type === 'veterinaria'
          ? (data.nombreVeterinaria ? `${data.nombreVeterinaria} - Sede Principal` : 'Sede Principal')
          : 'Consultorio Particular',
        esPrincipal: true,
        consecutivoNit: type === 'veterinaria' ? 1 : null,
        codigoSedeNit: type === 'veterinaria' ? '#nit-1' : '',
        tipoPunto: type === 'veterinaria' ? 'sede_principal' : 'consultorio_independiente',
        departamento: data.recoleccion.departamento?.trim() || 'Bogotá',
        ciudad: data.recoleccion.ciudad.trim(),
        direccionFisica: data.recoleccion.direccionFisica.trim(),
        detallesAdicionales: data.recoleccion.detallesAdicionales?.trim() || '',
        telefonoContacto: type === 'veterinaria' ? data.directorMedico?.telefono || '' : data.administrativa?.telefonoPagos || '',
        responsableSede: type === 'veterinaria' ? data.directorMedico?.nombre || '' : data.nombreMedico || '',
        indicacionesRuta: data.recoleccion.indicacionesRuta?.trim() || 'Donde el repartidor recogerá las muestras',
        correoResultadosSede: data.correos.resultados?.trim() || '',
      },
    ];

    // Veterinarios asociados iniciales:
    // Si es veterinaria, registra su equipo médico inicial.
    // Si es independiente, opera de forma autónoma sin veterinarios asociados a cargo.
    const initialVets = type === 'veterinaria'
      ? (Array.isArray(data.veterinariosAsociados) && data.veterinariosAsociados.length > 0
          ? data.veterinariosAsociados
          : [
              {
                id: `vet-${Date.now().toString().slice(-4)}`,
                nombre: data.directorMedico?.nombre || 'Director Médico',
                especialidad: 'Director Médico / Medicina General',
                tarjetaProfesional: 'COMVEZCOL-REG',
                email: data.correos.resultados || '',
                telefono: data.directorMedico?.telefono || '',
                sedeId: initialSedes[0]?.id || '',
                sedeNombre: initialSedes[0]?.nombreSede || '',
                estado: 'activo',
                esDirector: true,
                fechaVinculacion: now.slice(0, 10),
              },
            ])
      : [];

    const newClinic = {
      id,
      type,
      esIndependiente: type === 'independiente',
      asociadoVeterinaria: null, // Profesional independiente: no se encuentra asociado a ninguna veterinaria
      asociacionClinica: type === 'independiente' ? 'Sin asociación a clínica (Profesional Autónomo)' : null,
      especialidad: type === 'independiente' ? (data.especialidad || 'Medicina General') : '',
      nit: type === 'veterinaria' ? cleanNumber(data.nit) : '',
      nombreVeterinaria: type === 'veterinaria' ? data.nombreVeterinaria.trim() : '',
      tieneMultiplesSedes: Boolean(data.tieneMultiplesSedes ?? (initialSedes.length > 1)),
      directorMedico: {
        nombre: type === 'veterinaria' ? (data.directorMedico?.nombre || '').trim() : '',
        telefono: type === 'veterinaria' ? (data.directorMedico?.telefono || '').trim() : '',
      },
      cedula: type === 'independiente' ? cleanNumber(data.cedula) : '',
      nombreMedico: type === 'independiente' ? data.nombreMedico.trim() : '',
      tarjetaProfesional: type === 'independiente' ? data.tarjetaProfesional.trim() : '',
      administrativa: {
        nombreResponsable: data.administrativa.nombreResponsable.trim(),
        telefonoPagos: data.administrativa.telefonoPagos.trim(),
      },
      recoleccion: {
        departamento: data.recoleccion.departamento?.trim() || 'Bogotá',
        ciudad: data.recoleccion.ciudad.trim(),
        direccionFisica: data.recoleccion.direccionFisica.trim(),
        detallesAdicionales: data.recoleccion.detallesAdicionales?.trim() || '',
        indicacionesRuta: data.recoleccion.indicacionesRuta?.trim() || 'Donde el repartidor recogerá las muestras',
      },
      sedes: initialSedes,
      veterinariosAsociados: initialVets,
      correos: {
        facturacion: data.correos.facturacion.trim().toLowerCase(),
        resultados: data.correos.resultados.trim().toLowerCase(),
      },
      documentos: {
        rutNumero: cleanNumber(data.documentos.rutNumero),
        rutArchivo: data.documentos.rutArchivo || 'RUT_Cargado.pdf',
        tarjetaProfesionalArchivo: type === 'independiente' ? data.documentos.tarjetaProfesionalArchivo || 'TP_Documento.pdf' : null,
      },
      terminosAceptados: data.terminosAceptados ?? true,
      fechaAceptacionTerminos: now,
      estado: data.estado || 'activo',
      esClinicaActiva: Boolean(data.esClinicaActiva),
      totalMuestrasHistoricas: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (newClinic.esClinicaActiva) {
      clinics = clinics.map((c) => ({ ...c, esClinicaActiva: false }));
    }

    clinics.unshift(newClinic);
    return newClinic;
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
   * Añade un nuevo veterinario asociado
   */
  addVeterinarian(clinicId, vetData) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    if (!vetData.nombre?.trim()) throw new Error('El nombre completo del veterinario es obligatorio');
    if (!vetData.tarjetaProfesional?.trim()) throw new Error('El número de tarjeta profesional es obligatorio');

    const newVet = {
      id: `vet-${Date.now().toString().slice(-6)}`,
      nombre: vetData.nombre.trim(),
      especialidad: vetData.especialidad?.trim() || 'Medicina General',
      tarjetaProfesional: vetData.tarjetaProfesional.trim(),
      email: vetData.email?.trim() || '',
      telefono: vetData.telefono?.trim() || '',
      sedeId: vetData.sedeId || (clinic.sedes?.[0]?.id || ''),
      sedeNombre: vetData.sedeNombre || (clinic.sedes?.[0]?.nombreSede || 'Sede Principal'),
      estado: vetData.estado || 'activo', // 'activo' | 'inactivo'
      esDirector: Boolean(vetData.esDirector),
      fechaVinculacion: new Date().toISOString().slice(0, 10),
    };

    if (!clinic.veterinariosAsociados) clinic.veterinariosAsociados = [];
    clinic.veterinariosAsociados.push(newVet);
    clinic.updatedAt = new Date().toISOString();

    return clinic;
  },

  /**
   * Actualiza datos de un veterinario asociado
   */
  updateVeterinarian(clinicId, vetId, updates) {
    const clinic = this.getById(clinicId);
    if (!clinic) throw new Error('Veterinaria no encontrada');

    const idx = (clinic.veterinariosAsociados || []).findIndex((v) => v.id === vetId);
    if (idx === -1) throw new Error('Veterinario asociado no encontrado');

    clinic.veterinariosAsociados[idx] = {
      ...clinic.veterinariosAsociados[idx],
      ...updates,
    };
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
