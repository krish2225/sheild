import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { listMachines, getMachine, createMachine, updateMachine, deleteMachine, updateMachineThresholds } from '../controllers/machines.controller.js';

const router = Router();

router.get('/', authenticate(), listMachines);
router.get('/:machineId', authenticate(), getMachine);
router.post('/', authenticate(['admin']), createMachine);
router.put('/:machineId', authenticate(['admin']), updateMachine);
router.put('/:id/thresholds', authenticate(['admin']), updateMachineThresholds);
router.delete('/:machineId', authenticate(['admin']), deleteMachine);

export default router;


