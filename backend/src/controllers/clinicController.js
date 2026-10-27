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
      const clinic = clinicService.getActiveClinic();
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

  create(req, res) {
    try {
      const created = clinicService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Perfil de veterinaria registrado exitosamente',
        data: created,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
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
  addVeterinarian(req, res) {
    try {
      const { id } = req.params;
      const updated = clinicService.addVeterinarian(id, req.body);
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

  updateVeterinarian(req, res) {
    try {
      const { id, vetId } = req.params;
      const updated = clinicService.updateVeterinarian(id, vetId, req.body);
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
};
