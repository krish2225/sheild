import dayjs from 'dayjs';
import Machine from '../models/Machine.js';
import SensorLog from '../models/SensorLog.js';
import { ok, created, badRequest } from '../utils/response.js';

export const ingestSensor = async (req, res) => {
  const { machineId, temperature, vibration, current, timestamp, features } = req.body;
  if (!machineId) return badRequest(res, 'machineId required');
  const ts = timestamp ? new Date(timestamp) : new Date();

  const machine = await Machine.findOne({ machineId });
  if (!machine) return badRequest(res, 'Unknown machineId');

  const log = await SensorLog.create({
    machine: machine._id,
    machineId,
    timestamp: ts,
    temperature,
    vibration,
    current,
    features,
  });

  // naive health score update
  const score = 100 - Math.min(100, (vibration || 0) * 2 + Math.max(0, (temperature || 0) - 60));
  machine.healthScore = Math.max(0, Math.min(100, score));
  machine.lastSeenAt = ts;
  machine.status = machine.healthScore < 40 ? 'faulty' : machine.healthScore < 70 ? 'warning' : 'normal';
  await machine.save();

  return created(res, { log, machine });
};

export const querySensorLogs = async (req, res) => {
  const { machineId } = req.params;
  const { from, to, limit = 500 } = req.query;
  const filter = { machineId };
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = dayjs(from).toDate();
    if (to) filter.timestamp.$lte = dayjs(to).toDate();
  }
  const logs = await SensorLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit));
  return ok(res, { logs });
};


