import MaintenanceEvent from '../models/MaintenanceEvent.js';
import { ok, created, badRequest, notFound } from '../utils/response.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger();

/**
 * Create a new maintenance event
 */
export const createMaintenanceEvent = async (req, res) => {
  try {
    const { deviceId, actionTaken, notes, timestamp } = req.body;

    if (!deviceId || !actionTaken) {
      return badRequest(res, 'deviceId and actionTaken are required');
    }

    const event = await MaintenanceEvent.create({
      deviceId,
      actionTaken: actionTaken.trim(),
      notes: notes ? notes.trim() : '',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      createdBy: req.user?.email || req.user?.name || 'User'
    });

    logger.info(`Maintenance event created for device ${deviceId}`);

    return created(res, { event });
  } catch (error) {
    logger.error(`Error creating maintenance event: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to create maintenance event',
      error: error.message
    });
  }
};

/**
 * Get maintenance events for a device
 */
export const getMaintenanceEvents = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, from, to } = req.query;

    const filter = { deviceId };

    // Add date range filter if provided
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const events = await MaintenanceEvent.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    return ok(res, { events, count: events.length });
  } catch (error) {
    logger.error(`Error fetching maintenance events: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance events',
      error: error.message
    });
  }
};

/**
 * Get a single maintenance event
 */
export const getMaintenanceEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await MaintenanceEvent.findById(id);

    if (!event) {
      return notFound(res, 'Maintenance event not found');
    }

    return ok(res, { event });
  } catch (error) {
    logger.error(`Error fetching maintenance event: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance event',
      error: error.message
    });
  }
};

/**
 * Delete a maintenance event
 */
export const deleteMaintenanceEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await MaintenanceEvent.findByIdAndDelete(id);

    if (!event) {
      return notFound(res, 'Maintenance event not found');
    }

    logger.info(`Maintenance event deleted: ${id}`);

    return ok(res, { message: 'Maintenance event deleted successfully', deletedEvent: event });
  } catch (error) {
    logger.error(`Error deleting maintenance event: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete maintenance event',
      error: error.message
    });
  }
};
