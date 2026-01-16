import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { listMachines, getMachine, createMachine, updateMachine, deleteMachine, updateMachineThresholds } from '../controllers/machines.controller.js';

const router = Router();

router.get('/', listMachines); // Allow without auth for frontend access
router.get('/:machineId', authenticate(), getMachine);
router.post('/', authenticate(['admin']), createMachine);
router.put('/:machineId', authenticate(['admin']), updateMachine);
router.put('/:id/thresholds', updateMachineThresholds); // Allow without auth for threshold configuration
router.delete('/:machineId', authenticate(['admin']), deleteMachine);

export default router;


