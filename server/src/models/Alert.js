import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
    machineId: { type: String, index: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    rule: { type: String },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    recipients: { type: [String], default: [] },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Alert', alertSchema);


