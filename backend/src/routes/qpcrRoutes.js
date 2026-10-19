import { Router } from 'express';
import {
  filterProfiles,
  getProfiles,
  getAgents,
} from '../controllers/qpcrController.js';

const router = Router();

router.post('/filter-profiles', filterProfiles);
router.get('/profiles', getProfiles);
router.get('/agents', getAgents);

export default router;
