import { Router } from 'express';
import {
  getDashboardStats,
  getPatients,
  getPatientById,
  getFilterOptions,
  createPatient,
  updatePatient,
  deletePatient,
  requestExam,
  addConsultation,
  testKeaConnection,
  syncKeaPatients,
} from '../controllers/patientController.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/filters', getFilterOptions);

// Rutas de sincronización con Kea Tools Database API
router.get('/kea/test', testKeaConnection);
router.get('/kea/sync', syncKeaPatients);
router.post('/kea/sync', syncKeaPatients);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.patch('/:id', updatePatient);
router.delete('/:id', deletePatient);
router.post('/:id/exam', requestExam);
router.post('/:id/consultations', addConsultation);

export default router;
