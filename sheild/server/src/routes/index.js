import { Router } from 'express';
import predictRoutes from './predict.js';
import maintenanceRoutes from './maintenance.js';
import sensorsRoutes from './sensors.routes.js';
import machinesRoutes from './machines.routes.js';
import alertsRoutes from './alerts.routes.js';
import authRoutes from './auth.routes.js';
import emailRoutes from './email.js';
import feedbackRoutes from './feedback.routes.js';

const router = Router();

// ML prediction endpoints at /api/predict/*
router.use('/predict', predictRoutes);

// Maintenance events endpoints at /api/maintenance/*
router.use('/maintenance', maintenanceRoutes);

// Sensor endpoints at /api/sensors/*
router.use('/sensors', sensorsRoutes);

// Machine endpoints at /api/machines/*
router.use('/machines', machinesRoutes);

// Alert endpoints at /api/alerts/*
router.use('/alerts', alertsRoutes);

// Auth endpoints at /api/auth/*
router.use('/auth', authRoutes);

// Email test endpoints at /api/email/*
router.use('/email', emailRoutes);

// Feedback endpoints at /api/feedback/*
router.use('/feedback', feedbackRoutes);

export default router;


