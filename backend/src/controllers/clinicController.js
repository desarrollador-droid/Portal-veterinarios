import { clinicService } from '../services/clinicService.js';

export const clinicController = {
  getAll(req, res) {
    try {
      const { search, type, status } = req.query;
      const data = clinicService.getAll({ search, type, status });
      res.json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar veterinarias registradas',
        error: error.message,
      });
    }
  },

  getById(req, res) {
    try {
      const { id } = req.params;
      const clinic = clinicService.getById(id);
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: `Veterinaria con ID '${id}' no encontrada`,
        });
      }
      res.json({
        success: true,
        data: clinic,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar perfil de veterinaria',
        error: error.message,
      });
    }
  },

  getActive(req, res) {
    try {
      const clinicId = req.query.clinicId || req.headers['x-clinic-id'];
      const nit = req.query.nit || req.headers['x-clinic-nit'];
      const clinic = clinicService.getActiveClinic({ clinicId, nit });
      res.json({
        success: true,
        data: clinic,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la veterinaria activa',
        error: error.message,
      });
    }
  },

  setActive(req, res) {
    try {
      const { id } = req.params;
      const updated = clinicService.setActiveClinic(id);
      res.json({
        success: true,
        message: 'Veterinaria activada exitosamente para la sesión',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async create(req, res) {
    try {
      const created = await clinicService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Cliente / Veterinaria registrado exitosamente en la base de datos de Kea Tools',
        data: created,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async syncKea(req, res) {
    try {
      const result = await clinicService.syncFromKea();
      res.json({
        success: true,
        message: `Sincronización con Kea Tools DB completada.`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al sincronizar veterinarias desde Kea Tools',
        error: error.message,
      });
    }
  },

  update(req, res) {
    try {
      const { id } = req.params;
      const updated = clinicService.update(id, req.body);
      res.json({
        success: true,
        message: 'Perfil de veterinaria actualizado exitosamente',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  delete(req, res) {
    try {
      const { id } = req.params;
      clinicService.delete(id);
      res.json({
        success: true,
        message: 'Veterinaria eliminada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // --- GESTIÓN DE SEDES ---
  addSede(req, res) {
    try {
      const { id } = req.params;
      const updated = clinicService.addSede(id, req.body);
      res.status(201).json({
        success: true,
        message: 'Sede agregada exitosamente',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  updateSede(req, res) {
    try {
      const { id, sedeId } = req.params;
      const updated = clinicService.updateSede(id, sedeId, req.body);
      res.json({
        success: true,
        message: 'Sede actualizada exitosamente',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  deleteSede(req, res) {
    try {
      const { id, sedeId } = req.params;
      const updated = clinicService.deleteSede(id, sedeId);
      res.json({
        success: true,
        message: 'Sede eliminada exitosamente',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // --- GESTIÓN DE VETERINARIOS ASOCIADOS ---
  async addVeterinarian(req, res) {
    try {
      const { id } = req.params;
      const updated = await clinicService.addVeterinarian(id, req.body);
      res.status(201).json({
        success: true,
        message: 'Veterinario asociado agregado exitosamente',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async updateVeterinarian(req, res) {
    try {
      const { id, vetId } = req.params;
      const updated = await clinicService.updateVeterinarian(id, vetId, req.body);
      res.json({
        success: true,
        message: 'Veterinario asociado actualizado exitosamente',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async syncVeterinarians(req, res) {
    try {
      const { id } = req.params;
      const result = await clinicService.syncVeterinariansForClinic(id);
      res.json({
        success: true,
        message: 'Veterinarios sincronizados exitosamente desde Kea Tools DB',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  toggleVeterinarianStatus(req, res) {
    try {
      const { id, vetId } = req.params;
      const result = clinicService.toggleVeterinarianStatus(id, vetId);
      res.json({
        success: true,
        message: `Usuario de ${result.vet.nombre} ${result.vet.estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        data: result.clinic,
        vet: result.vet,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  deleteVeterinarian(req, res) {
    try {
      const { id, vetId } = req.params;
      const updated = clinicService.deleteVeterinarian(id, vetId);
      res.json({
        success: true,
        message: 'Veterinario asociado desvinculado exitosamente',
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  blockVeterinarian(req, res) {
    try {
      const { id, vetId } = req.params;
      const { motivoBloqueo, bloqueadoPor } = req.body;
      const result = clinicService.blockVeterinarian(id, vetId, { motivoBloqueo, bloqueadoPor });
      res.json({
        success: true,
        message: `Acceso de ${result.vet.nombre} bloqueado exitosamente`,
        data: result.clinic,
        vet: result.vet,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  unblockVeterinarian(req, res) {
    try {
      const { id, vetId } = req.params;
      const result = clinicService.unblockVeterinarian(id, vetId);
      res.json({
        success: true,
        message: `Acceso de ${result.vet.nombre} restablecido exitosamente`,
        data: result.clinic,
        vet: result.vet,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  updateVeterinarianPermissions(req, res) {
    try {
      const { id, vetId } = req.params;
      const { permisos, rol } = req.body;
      const result = clinicService.updateVeterinarianPermissions(id, vetId, { permisos, rol });
      res.json({
        success: true,
        message: `Permisos de ${result.vet.nombre} actualizados exitosamente`,
        data: result.clinic,
        vet: result.vet,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  assignVeterinarianSedes(req, res) {
    try {
      const { id, vetId } = req.params;
      const result = clinicService.assignVeterinarianSedes(id, vetId, req.body);
      res.json({
        success: true,
        message: `Asignación de sedes de ${result.vet.nombre} actualizada exitosamente`,
        data: result.clinic,
        vet: result.vet,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
