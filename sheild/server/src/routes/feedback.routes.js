import { Router } from 'express';
import { authenticate } from '../utils/auth.js';
import { 
  listFeedback, 
  createFeedback, 
  getFeedback, 
  updateFeedback, 
  deleteFeedback, 
  voteFeedback, 
  getFeedbackStats,
  markAsResolved
} from '../controllers/feedback.controller.js';

const router = Router();

// Public route - allow anonymous feedback submission (no auth required)
router.post('/', createFeedback);

// Authenticated routes
router.get('/stats', authenticate(), getFeedbackStats);

// Admin routes
router.get('/', authenticate(['admin']), listFeedback);
router.get('/:id', authenticate(['admin']), getFeedback);
router.put('/:id', authenticate(['admin']), updateFeedback);
router.delete('/:id', authenticate(['admin']), deleteFeedback);
router.post('/:id/vote', authenticate(), voteFeedback);
router.patch('/:id/resolve', authenticate(['admin']), markAsResolved);

export default router;
