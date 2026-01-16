import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../utils/auth.js';
import { predict, predictCsv } from '../controllers/predictions.controller.js';

const router = Router();
const upload = multer();

router.post('/predict', authenticate(), predict);
router.post('/predict/csv', authenticate(), upload.single('file'), predictCsv);

export default router;


