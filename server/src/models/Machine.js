import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    machineId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String },
    status: { type: String, enum: ['normal', 'warning', 'faulty'], default: 'normal' },
    healthScore: { type: Number, min: 0, max: 100, default: 100 },
    lastSeenAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Machine', machineSchema);


