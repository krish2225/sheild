import Machine from '../models/Machine.js';
import SensorLog from '../models/SensorLog.js';
import { ok, created, notFound } from '../utils/response.js';

export const listMachines = async (req, res) => {
  const { q, status, minTemp, maxTemp, minVib, maxVib } = req.query;
  const filter = {};
  if (q) filter.$or = [
    { machineId: new RegExp(q, 'i') },
    { name: new RegExp(q, 'i') },
    { location: new RegExp(q, 'i') },
  ];
  if (status) filter.status = status;

  const machines = await Machine.find(filter).sort({ updatedAt: -1 }).limit(200);
  return ok(res, { machines });
};

export const getMachine = async (req, res) => {
  const machine = await Machine.findOne({ machineId: req.params.machineId });
  if (!machine) return notFound(res, 'Machine not found');
  const latestLogs = await SensorLog.find({ machineId: machine.machineId }).sort({ timestamp: -1 }).limit(100);
  return ok(res, { machine, latestLogs });
};

export const createMachine = async (req, res) => {
  const machine = await Machine.create(req.body);
  return created(res, { machine });
};

export const updateMachine = async (req, res) => {
  const machine = await Machine.findOneAndUpdate({ machineId: req.params.machineId }, req.body, { new: true });
  if (!machine) return notFound(res, 'Machine not found');
  return ok(res, { machine });
};

export const deleteMachine = async (req, res) => {
  const machine = await Machine.findOneAndDelete({ machineId: req.params.machineId });
  if (!machine) return notFound(res, 'Machine not found');
  return ok(res, { deleted: true });
};


