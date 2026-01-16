import Machine from '../models/Machine.js';
import SensorLog from '../models/SensorLog.js';
import { ok, created, notFound } from '../utils/response.js';

export const listMachines = async (req, res) => {
  try {
    const { q, status, minTemp, maxTemp, minVib, maxVib } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { machineId: new RegExp(q, 'i') },
      { name: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') },
    ];
    if (status) filter.status = status;

    const machines = await Machine.find(filter).sort({ updatedAt: -1 }).limit(200);
    
    // If no machines exist, create PM_001 as default
    if (machines.length === 0) {
      const defaultMachine = await Machine.create({
        machineId: 'PM_001',
        name: 'High RPM Motor',
        location: 'Factory Floor',
        status: 'normal',
        healthScore: 100,
        thresholds: {
          temperature: { warning: 80, critical: 90 },
          vibration: { warning: 25, critical: 35 },
          current: { warning: 12, critical: 15 },
          healthScore: { warning: 70, critical: 40 }
        },
        alertSettings: {
          enabled: true,
          notifyMaintenanceHead: true,
          notifyEmail: true
        }
      });
      return ok(res, { machines: [defaultMachine] });
    }
    
    return ok(res, { machines });
  } catch (error) {
    console.error('Error listing machines:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch machines',
      error: error.message
    });
  }
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

export const updateMachineThresholds = async (req, res) => {
  const { thresholds, maintenanceHead, alertSettings } = req.body;
  
  const machine = await Machine.findByIdAndUpdate(
    req.params.id,
    { 
      thresholds: thresholds || {},
      maintenanceHead: maintenanceHead || {},
      alertSettings: alertSettings || {}
    },
    { new: true }
  );
  
  if (!machine) return notFound(res, 'Machine not found');
  return ok(res, { machine });
};


