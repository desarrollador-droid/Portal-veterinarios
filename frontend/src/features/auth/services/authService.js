import { clinicApi } from '../../dashboard/services/clinicApi.js';
import { patientApi } from '../../dashboard/services/patientApi.js';

const AUTH_STORAGE_KEY = 'osd_auth_session';

function cleanNumber(val) {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '').trim();
}

export const authService = {
  /**
   * Obtiene la sesión del usuario / clínica actualmente autenticado
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  },

  /**
   * Guarda de forma persistente y redundante la sesión activa
   */
  saveSession(session) {
    if (!session) return;
    try {
      const serialized = JSON.stringify(session);
      localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
      if (session.clinicId) {
        localStorage.setItem('vetlab_active_clinic_id', session.clinicId);
        sessionStorage.setItem('vetlab_active_clinic_id', session.clinicId);
      }
    } catch (_) {}
  },

  /**
   * Inicia sesión con NIT, Cédula o Correo Electrónico
   */
  async login({ identifier, password = '' }) {
    if (!identifier || !identifier.trim()) {
      return {
        success: false,
        message: 'Por favor ingresa tu NIT, Cédula o correo electrónico para continuar.',
      };
    }

    const q = identifier.trim().toLowerCase();
    const qClean = cleanNumber(identifier);

    try {
      let clinics = await clinicApi.getClinics();

      // Función auxiliar para buscar veterinario asociado en las clínicas
      const searchVet = (clinicsList) => {
        for (const clinic of clinicsList) {
          if (Array.isArray(clinic.veterinariosAsociados)) {
            const vet = clinic.veterinariosAsociados.find((v) => {
              const vEmail = (v.email || '').toLowerCase().trim();
              const vCed = cleanNumber(v.cedula);
              const vTp = (v.tarjetaProfesional || '').toLowerCase().trim();
              const vNom = (v.nombre || '').toLowerCase().trim();

              if (q && vEmail && vEmail === q) return true;
              if (qClean && vCed && vCed === qClean) return true;
              if (q && vTp && vTp === q) return true;
              if (q && vNom && vNom === q) return true;
              return false;
            });
            if (vet) return { vet, clinic };
          }
        }
        return null;
      };

      // Si el identificador es exactamente el NIT de una clínica, priorizar la clínica
      const isExactClinicNit = Boolean(qClean && clinics.some((c) => cleanNumber(c.nit) === qClean));

      let vetMatch = !isExactClinicNit ? searchVet(clinics) : null;

      // Si no es un veterinario directo, buscar si es una clínica
      let found = null;
      if (!vetMatch) {
        found = clinics.find((c) => {
          const cNit = cleanNumber(c.nit);
          const cCed = cleanNumber(c.cedula);
          const cEmailFact = (c.correos?.facturacion || '').toLowerCase();
          const cEmailRes = (c.correos?.resultados || '').toLowerCase();

          if (qClean && (cNit === qClean || cCed === qClean)) return true;
          if (q && (cEmailFact === q || cEmailRes === q)) return true;
          if (q && c.nombreVeterinaria && c.nombreVeterinaria.toLowerCase() === q) return true;
          if (q && c.nombreMedico && c.nombreMedico.toLowerCase() === q) return true;
          return false;
        });

        // Si no hay coincidencia exacta de clínica, probar buscar de nuevo como veterinario
        if (!found && isExactClinicNit) {
          vetMatch = searchVet(clinics);
        }

        // Si aún no hay nada, búsqueda parcial de clínica
        if (!found && !vetMatch) {
          found = clinics.find((c) => {
            if (qClean && qClean.length >= 5 && (cleanNumber(c.nit).includes(qClean) || cleanNumber(c.cedula).includes(qClean))) {
              return true;
            }
            if (q.length >= 4 && (c.nombreVeterinaria?.toLowerCase().includes(q) || c.nombreMedico?.toLowerCase().includes(q))) {
              return true;
            }
            return false;
          });
        }
      }

      // Si no se encuentra localmente o no tiene contraseña, sincronizar con Kea Tools
      if ((!found && !vetMatch) || (found && !found.contrasena && !found.password)) {
        try {
          const syncRes = await clinicApi.syncKea();
          if (syncRes?.clinics && Array.isArray(syncRes.clinics)) {
            clinics = syncRes.clinics;
            if (!vetMatch) vetMatch = searchVet(clinics);
            if (!found && !vetMatch) {
              found = clinics.find((c) => {
                const cNit = cleanNumber(c.nit);
                const cCed = cleanNumber(c.cedula);
                const cEmailFact = (c.correos?.facturacion || '').toLowerCase();
                const cEmailRes = (c.correos?.resultados || '').toLowerCase();

                if (qClean && (cNit === qClean || cCed === qClean)) return true;
                if (q && (cEmailFact === q || cEmailRes === q)) return true;
                if (q && c.nombreVeterinaria && c.nombreVeterinaria.toLowerCase() === q) return true;
                if (q && c.nombreMedico && c.nombreMedico.toLowerCase() === q) return true;
                return false;
              });
            }
          }
        } catch (_) {}
      }

      // 1. AUTENTICACIÓN COMO MÉDICO VETERINARIO ASOCIADO
      if (vetMatch) {
        const { vet: foundVet, clinic: parentClinic } = vetMatch;

        // Comprobar estado de la cuenta
        if (foundVet.estado === 'inactivo' || foundVet.estado === 'bloqueado' || foundVet.bloqueadoPorAdmin) {
          const reason = foundVet.motivoBloqueo ? ` Motivo: ${foundVet.motivoBloqueo}.` : '';
          return {
            success: false,
            message: `Tu cuenta de profesional médico (${foundVet.nombre}) se encuentra ${foundVet.estado === 'bloqueado' ? 'bloqueada' : 'inactiva'}.${reason} Por favor contacta al administrador de ${parentClinic.nombreVeterinaria || 'tu clínica'}.`,
          };
        }

        // Validación de contraseña o PIN del veterinario
        const savedVetPass = String(foundVet.contrasena || foundVet.password || foundVet.pin || '').trim();
        const inputPass = String(password || '').trim();

        if (savedVetPass) {
          if (!inputPass) {
            return {
              success: false,
              message: 'Por favor ingresa tu contraseña o PIN de acceso para ingresar al portal.',
            };
          }
          if (inputPass !== savedVetPass) {
            return {
              success: false,
              message: 'La contraseña o PIN de acceso es incorrecto. Por favor verifica e intenta nuevamente.',
            };
          }
        }

        // Activar la clínica a la que pertenece
        await clinicApi.setActiveClinic(parentClinic.id);

        const session = {
          clinicId: parentClinic.id,
          nombre: parentClinic.type === 'independiente' ? parentClinic.nombreMedico : parentClinic.nombreVeterinaria,
          nit: parentClinic.nit || parentClinic.cedula,
          type: parentClinic.type,
          isVeterinarioAsociado: true,
          vetId: foundVet.id,
          vetNombre: foundVet.nombre,
          vetCedula: foundVet.cedula,
          vetTarjetaProfesional: foundVet.tarjetaProfesional,
          vetRol: foundVet.rol || 'veterinario_planta',
          vetRolNombre: foundVet.rolNombre || 'Veterinario de Planta',
          vetPermisos: foundVet.permisos || {},
          vetEmail: foundVet.email,
          vetTelefono: foundVet.telefono,
          vetSedeId: foundVet.sedeId,
          vetSedeNombre: foundVet.sedeNombre,
          email: foundVet.email || parentClinic.correos?.facturacion || '',
          director: parentClinic.directorMedico?.nombre || parentClinic.nombreMedico || 'Responsable Médico',
          telefono: foundVet.telefono || parentClinic.directorMedico?.telefono || '',
          ciudad: foundVet.ciudad || parentClinic.recoleccion?.ciudad || 'Bogotá D.C.',
          loginAt: new Date().toISOString(),
        };

        this.saveSession(session);

        // Sincronizar pacientes en segundo plano para asegurar que la clínica tenga sus pacientes actualizados
        patientApi.syncKea().catch(() => {});

        return {
          success: true,
          session,
          clinic: parentClinic,
          vet: foundVet,
        };
      }

      // 2. AUTENTICACIÓN COMO CLÍNICA / PROPIETARIO
      if (!found) {
        return {
          success: false,
          message: `No se encontró ninguna veterinaria o médico registrado con la identificación o correo "${identifier}". Si eres un cliente nuevo, por favor completa el formulario de registro.`,
        };
      }

      // Validación de Contraseña o PIN de acceso de la clínica
      const savedPass = String(found.contrasena || found.password || '').trim();
      const inputPass = String(password || '').trim();

      if (savedPass) {
        if (!inputPass) {
          return {
            success: false,
            message: 'Por favor ingresa tu contraseña o PIN de acceso para ingresar al portal.',
          };
        }
        if (inputPass !== savedPass) {
          return {
            success: false,
            message: 'La contraseña o PIN de acceso es incorrecto. Por favor verifica e intenta nuevamente.',
          };
        }
      }

      // Activar clínica en el sistema
      await clinicApi.setActiveClinic(found.id);

      const session = {
        clinicId: found.id,
        nombre: found.type === 'independiente' ? found.nombreMedico : found.nombreVeterinaria,
        nit: found.nit || found.cedula,
        type: found.type,
        isVeterinarioAsociado: false,
        email: found.correos?.facturacion || found.correos?.resultados || '',
        director: found.directorMedico?.nombre || found.nombreMedico || 'Responsable Médico',
        telefono: found.directorMedico?.telefono || found.administrativa?.telefonoPagos || '',
        ciudad: found.recoleccion?.ciudad || 'Bogotá D.C.',
        loginAt: new Date().toISOString(),
      };

      this.saveSession(session);

      // Sincronizar pacientes en segundo plano para asegurar que la clínica tenga sus pacientes actualizados
      patientApi.syncKea().catch(() => {});

      return {
        success: true,
        session,
        clinic: found,
      };
    } catch (err) {
      console.error('Error en authService.login:', err);
      return {
        success: false,
        message: err.message || 'Error inesperado al intentar iniciar sesión. Por favor intenta de nuevo.',
      };
    }
  },

  /**
   * Cierra la sesión activa y limpia almacenamiento
   */
  logout() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('vetlab_active_clinic_id');
      sessionStorage.removeItem('vetlab_active_clinic_id');
    } catch (_) {}
  },

  /**
   * Registra un nuevo cliente a partir del formulario oficial de creación OSD
   */
  async registerClient(clientFormData) {
    try {
      const isIndependiente = Boolean(
        clientFormData.tipoCliente === 'independiente' ||
        clientFormData.nombreEmpresa?.toLowerCase().startsWith('dr') ||
        clientFormData.nombreEmpresa?.toLowerCase().startsWith('médic')
      );

      const cleanNit = cleanNumber(clientFormData.nit);
      const contrasena = (clientFormData.contrasena || clientFormData.password || clientFormData.pin || '').trim();

      const clinicPayload = {
        type: isIndependiente ? 'independiente' : 'veterinaria',
        nit: cleanNit,
        cedula: cleanNit,
        contrasena: contrasena,
        password: contrasena,
        nombreVeterinaria: clientFormData.nombreEmpresa?.trim() || '',
        nombreMedico: clientFormData.nombreEmpresa?.trim() || '',
        directorMedico: {
          nombre: (clientFormData.nombreDirectorMedico || '').trim(),
          telefono: (clientFormData.telefonoDirectorMedico || '').trim(),
        },
        administrativa: {
          nombreResponsable: (clientFormData.nombreResponsablePagos || '').trim(),
          telefonoPagos: (clientFormData.telefonoPagos || '').trim(),
        },
        recoleccion: {
          ciudad: (clientFormData.ciudad || '').trim(),
          direccionFisica: (clientFormData.direccionFisica || '').trim(),
          departamento: 'Colombia',
          indicacionesRuta: 'Donde el repartidor recogerá las muestras',
        },
        correos: {
          facturacion: (clientFormData.correoFacturacion || '').trim().toLowerCase(),
          resultados: (clientFormData.correoFacturacion || '').trim().toLowerCase(),
        },
        documentos: {
          rutNumero: cleanNit,
          rutArchivo: clientFormData.rutFileName || 'RUT_Adjunto.pdf',
        },
        // Respuestas de la encuesta y caracterización OSD
        capacitacionOSD: clientFormData.capacitacionOSD || 'No',
        capacitacionQpcr: clientFormData.capacitacionQpcr || '',
        capacitacionQpcrOtro: clientFormData.capacitacionQpcrOtro || '',
        cantidadVeterinarios: clientFormData.cantidadVeterinarios || '',
        cuentaConEspecialistas: clientFormData.cuentaConEspecialistas || 'No',
        especialistas: Array.isArray(clientFormData.especialistas) ? clientFormData.especialistas : [],
        frecuenciaPcrMensual: clientFormData.frecuenciaPcrMensual || '',
        medioConocisteOSD: clientFormData.medioConocisteOSD || '',
        observaciones: clientFormData.observaciones || '',
        esClinicaActiva: true,
      };

      const createdClinic = await clinicApi.createClinic(clinicPayload);
      await clinicApi.setActiveClinic(createdClinic.id);

      const session = {
        clinicId: createdClinic.id,
        nombre: createdClinic.nombreVeterinaria || createdClinic.nombreMedico || clientFormData.nombreEmpresa,
        nit: cleanNit,
        type: createdClinic.type,
        email: clientFormData.correoFacturacion,
        director: clientFormData.nombreDirectorMedico,
        telefono: clientFormData.telefonoDirectorMedico,
        ciudad: clientFormData.ciudad,
        loginAt: new Date().toISOString(),
      };

      this.saveSession(session);

      return {
        success: true,
        session,
        clinic: createdClinic,
      };
    } catch (err) {
      console.error('Error en authService.registerClient:', err);
      return {
        success: false,
        message: err.message || 'Error al registrar el nuevo cliente en la base de datos.',
      };
    }
  },
};
