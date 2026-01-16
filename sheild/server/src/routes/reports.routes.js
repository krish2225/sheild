import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { generateReport } from '../controllers/reports.controller.js';

const router = Router();

router.post('/generate', authenticate(), generateReport);

export default router;


