import { Router } from 'express';
import predictRoutes from './predict.js';

const router = Router();

// ML prediction endpoint at /api/predict
router.use('/', predictRoutes);

export default router;


