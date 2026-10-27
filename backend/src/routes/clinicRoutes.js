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

export default router;
