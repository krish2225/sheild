import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { 
  createMaintenanceEvent, 
  getMaintenanceEvents, 
  getMaintenanceEvent,
  deleteMaintenanceEvent
} from '../controllers/maintenance.controller.js';

const router = Router();

// Create maintenance event - allow without auth for now (can add auth later)
router.post('/', createMaintenanceEvent);
// Get a single maintenance event by ID
router.get('/event/:id', getMaintenanceEvent);
// Delete maintenance event
router.delete('/event/:id', deleteMaintenanceEvent);
// Get maintenance events for a device - allow without auth for now (must be last)
router.get('/:deviceId', getMaintenanceEvents);

export default router;

