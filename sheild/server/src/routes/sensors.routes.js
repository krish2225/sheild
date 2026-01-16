import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { ingestSensor, querySensorLogs, syncFirebaseData } from '../controllers/sensors.controller.js';

const router = Router();

router.post('/ingest', authenticate(), ingestSensor);
router.post('/sync-firebase', syncFirebaseData); // No auth for Firebase webhook
router.get('/:machineId/logs', querySensorLogs); // Allow without auth for history fetching

export default router;


