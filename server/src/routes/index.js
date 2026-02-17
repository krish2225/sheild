import { Router } from 'express';
import authRoutes from './auth.routes.js';
import machinesRoutes from './machines.routes.js';
import sensorsRoutes from './sensors.routes.js';
import predictionsRoutes from './predictions.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import reportsRoutes from './reports.routes.js';
import alertsRoutes from './alerts.routes.js';
import feedbackRoutes from './feedback.routes.js';
import predictRoutes from './predict.js';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/machines', machinesRoutes);
router.use('/sensors', sensorsRoutes);
router.use('/predictions', predictionsRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/reports', reportsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/feedback', feedbackRoutes);
// ML prediction endpoint at /api/predict (legacy endpoint)
router.use('/', predictRoutes);

export default router;


