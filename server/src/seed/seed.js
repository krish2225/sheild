import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../config/db.js';
import User from '../models/User.js';
import Machine from '../models/Machine.js';
import SensorLog from '../models/SensorLog.js';
import Maintenance from '../models/Maintenance.js';

dotenv.config();

const run = async () => {
  await connectToDatabase();

  await Promise.all([
    User.deleteMany({}),
    Machine.deleteMany({}),
    SensorLog.deleteMany({}),
    Maintenance.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password', 10);
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash,
    role: 'admin',
  });

  const machines = await Machine.insertMany([
    { machineId: 'M-1001', name: 'Compressor A', location: 'Plant 1', status: 'normal', healthScore: 92 },
    { machineId: 'M-1002', name: 'Pump B', location: 'Plant 1', status: 'warning', healthScore: 68 },
    { machineId: 'M-1003', name: 'Fan C', location: 'Plant 2', status: 'faulty', healthScore: 35 },
  ]);

  const now = new Date();
  const logs = [];
  for (let i = 0; i < 120; i++) {
    machines.forEach((m, idx) => {
      logs.push({
        machine: m._id,
        machineId: m.machineId,
        timestamp: new Date(now.getTime() - i * 60 * 1000),
        temperature: 50 + idx * 5 + Math.random() * 5,
        vibration: 10 + idx * 10 + Math.random() * 3,
        current: 5 + idx * 2 + Math.random(),
        features: { rms: Math.random() * 2, kurtosis: Math.random() * 5, skewness: Math.random() * 2 },
      });
    });
  }
  await SensorLog.insertMany(logs);

  await Maintenance.insertMany([
    { machine: machines[0]._id, machineId: machines[0].machineId, task: 'Inspect bearings', dueDate: new Date(now.getTime() + 86400000), status: 'scheduled' },
    { machine: machines[1]._id, machineId: machines[1].machineId, task: 'Replace seals', dueDate: new Date(now.getTime() - 86400000), status: 'overdue' },
  ]);

  console.log('Seed completed');
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


