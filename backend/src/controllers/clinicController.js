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
};
