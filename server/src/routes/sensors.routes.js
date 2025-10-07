import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { ingestSensor, querySensorLogs } from '../controllers/sensors.controller.js';

const router = Router();

router.post('/ingest', authenticate(), ingestSensor);
router.get('/:machineId/logs', authenticate(), querySensorLogs);

export default router;


