import Maintenance from '../models/Maintenance.js';
import Machine from '../models/Machine.js';
import { ok, created, notFound, badRequest } from '../utils/response.js';

export const listTasks = async (req, res) => {
  const tasks = await Maintenance.find({}).sort({ dueDate: 1 }).limit(500);
  return ok(res, { tasks });
};

export const createTask = async (req, res) => {
  const { machineId, task, dueDate, status, description } = req.body;
  if (!machineId || !task) return badRequest(res, 'machineId and task are required');

  const machine = await Machine.findOne({ machineId });
  if (!machine) return badRequest(res, 'Unknown machineId');

  const doc = await Maintenance.create({
    machine: machine._id,
    machineId,
    task,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    status,
    description,
  });
  return created(res, { task: doc });
};

export const updateTask = async (req, res) => {
  const task = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return notFound(res, 'Task not found');
  return ok(res, { task });
};

export const deleteTask = async (req, res) => {
  const task = await Maintenance.findByIdAndDelete(req.params.id);
  if (!task) return notFound(res, 'Task not found');
  return ok(res, { deleted: true });
};


