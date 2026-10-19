import { Router } from 'express';
import {
  getDashboardStats,
  getPatients,
  getPatientById,
  getFilterOptions,
  createPatient,
  updatePatient,
  requestExam,
  addConsultation,
} from '../controllers/patientController.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/filters', getFilterOptions);
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.post('/:id/exam', requestExam);
router.post('/:id/consultations', addConsultation);

export default router;
