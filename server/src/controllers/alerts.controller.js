import Alert from '../models/Alert.js';
import { ok, created, notFound } from '../utils/response.js';

export const listAlerts = async (req, res) => {
  const alerts = await Alert.find({}).sort({ createdAt: -1 }).limit(500);
  return ok(res, { alerts });
};

export const createAlert = async (req, res) => {
  const alert = await Alert.create(req.body);
  return created(res, { alert });
};

export const updateAlert = async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!alert) return notFound(res, 'Alert not found');
  return ok(res, { alert });
};

export const deleteAlert = async (req, res) => {
  const alert = await Alert.findByIdAndDelete(req.params.id);
  if (!alert) return notFound(res, 'Alert not found');
  return ok(res, { deleted: true });
};


