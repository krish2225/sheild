import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { listAlerts, createAlert, updateAlert, deleteAlert } from '../controllers/alerts.controller.js';

const router = Router();

router.get('/', authenticate(), listAlerts);
router.post('/', authenticate(), createAlert);
router.put('/:id', authenticate(), updateAlert);
router.delete('/:id', authenticate(), deleteAlert);

export default router;


