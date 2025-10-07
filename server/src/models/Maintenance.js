import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    machineId: { type: String, index: true },
    task: { type: String, required: true },
    dueDate: { type: Date },
    status: { type: String, enum: ['scheduled', 'overdue', 'completed'], default: 'scheduled' },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Maintenance', maintenanceSchema);


