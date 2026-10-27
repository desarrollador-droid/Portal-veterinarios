import express from 'express';
import { clinicController } from '../controllers/clinicController.js';

const router = express.Router();

router.get('/', clinicController.getAll);
router.get('/active', clinicController.getActive);
router.get('/:id', clinicController.getById);
router.post('/active/:id', clinicController.setActive);
router.post('/', clinicController.create);
router.put('/:id', clinicController.update);
router.delete('/:id', clinicController.delete);

// Rutas de Sedes
router.post('/:id/sedes', clinicController.addSede);
router.put('/:id/sedes/:sedeId', clinicController.updateSede);
router.delete('/:id/sedes/:sedeId', clinicController.deleteSede);

// Rutas de Veterinarios Asociados
router.post('/:id/veterinarians', clinicController.addVeterinarian);
router.put('/:id/veterinarians/:vetId', clinicController.updateVeterinarian);
router.patch('/:id/veterinarians/:vetId/toggle-status', clinicController.toggleVeterinarianStatus);
router.delete('/:id/veterinarians/:vetId', clinicController.deleteVeterinarian);

export default router;
