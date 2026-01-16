import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/maintenance.controller.js';

const router = Router();

router.get('/', authenticate(), listTasks);
router.post('/', authenticate(), createTask);
router.put('/:id', authenticate(), updateTask);
router.delete('/:id', authenticate(['admin']), deleteTask);

export default router;


