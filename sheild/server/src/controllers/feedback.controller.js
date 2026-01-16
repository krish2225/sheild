import Feedback from '../models/Feedback.js';
import { ok, created, notFound, badRequest } from '../utils/response.js';
import { sendFeedbackNotificationEmail } from '../utils/emailService.js';

export const listFeedback = async (req, res) => {
  const { type, status, priority, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  
  const skip = (page - 1) * limit;
  const feedback = await Feedback.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await Feedback.countDocuments(filter);
  
  return ok(res, { feedback, total, page: parseInt(page), limit: parseInt(limit) });
};

export const createFeedback = async (req, res) => {
  try {
    // Map form fields to model fields
    const { name, email, type, subject, message } = req.body;
    
    if (!type || !subject || !message) {
      return badRequest(res, 'Type, subject, and message are required');
    }

    const feedbackData = {
      name: name || req.user?.name,
      email: email || req.user?.email,
      type: type,
      title: subject, // Map subject to title
      description: message, // Map message to description
      user: req.user?.id, // Optional - can be null for anonymous feedback
      browser: req.headers['user-agent'],
      version: req.headers['x-app-version'] || '1.0.0',
      priority: type === 'bug' ? 'high' : 'medium', // Auto-set priority based on type
      category: 'other' // Default category
    };
    
    const feedback = await Feedback.create(feedbackData);
    
    // Send email notification (non-blocking)
    console.log('[createFeedback] Attempting to send email notification...');
    console.log('[createFeedback] EMAIL_USER:', process.env.EMAIL_USER ? 'Configured' : 'NOT CONFIGURED');
    
    if (email || process.env.EMAIL_USER) {
      sendFeedbackNotificationEmail(feedback)
        .then(result => {
          if (result.success) {
            console.log('[createFeedback] ✓ Email notification sent successfully:', result.messageId);
          } else {
            console.error('[createFeedback] ✗ Email notification failed:', result.error);
            console.error('[createFeedback] Error code:', result.code);
          }
        })
        .catch(err => {
          console.error('[createFeedback] ✗ Exception sending feedback email:', err.message);
          console.error('[createFeedback] Stack:', err.stack);
        });
    } else {
      console.warn('[createFeedback] Email not sent - no email provided and EMAIL_USER not configured');
    }
    
    return created(res, { 
      feedback,
      message: 'Feedback submitted successfully. Thank you!'
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return badRequest(res, error.message || 'Failed to submit feedback');
  }
};

export const getFeedback = async (req, res) => {
  const feedback = await Feedback.findById(req.params.id).populate('user', 'name email');
  if (!feedback) return notFound(res, 'Feedback not found');
  return ok(res, { feedback });
};

export const updateFeedback = async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!feedback) return notFound(res, 'Feedback not found');
  return ok(res, { feedback });
};

export const deleteFeedback = async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) return notFound(res, 'Feedback not found');
  return ok(res, { deleted: true });
};

export const voteFeedback = async (req, res) => {
  const { action } = req.body; // 'up' or 'down'
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) return notFound(res, 'Feedback not found');
  
  feedback.votes += action === 'up' ? 1 : -1;
  await feedback.save();
  
  return ok(res, { feedback });
};

export const markAsResolved = async (req, res) => {
  const { resolution } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id, 
    { 
      status: 'resolved', 
      resolution,
      resolvedAt: new Date(),
      assignedTo: req.user?.name || 'Maintenance Head'
    }, 
    { new: true }
  );
  
  if (!feedback) return notFound(res, 'Feedback not found');
  return ok(res, { feedback, message: 'Feedback marked as resolved' });
};

export const getFeedbackStats = async (req, res) => {
  const stats = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        bugs: { $sum: { $cond: [{ $eq: ['$type', 'bug'] }, 1, 0] } },
        features: { $sum: { $cond: [{ $eq: ['$type', 'feature'] }, 1, 0] } },
        improvements: { $sum: { $cond: [{ $eq: ['$type', 'improvement'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
      }
    }
  ]);
  
  return ok(res, { stats: stats[0] || {} });
};
