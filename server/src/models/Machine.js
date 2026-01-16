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
    // Individual threshold settings per machine
    thresholds: {
      temperature: { 
        warning: { type: Number, default: 80 },
        critical: { type: Number, default: 90 }
      },
      vibration: { 
        warning: { type: Number, default: 25 },
        critical: { type: Number, default: 35 }
      },
      current: { 
        warning: { type: Number, default: 12 },
        critical: { type: Number, default: 15 }
      },
      healthScore: { 
        warning: { type: Number, default: 70 },
        critical: { type: Number, default: 40 }
      }
    },
    maintenanceHead: {
      name: { type: String },
      email: { type: String },
      phone: { type: String }
    },
    alertSettings: {
      enabled: { type: Boolean, default: true },
      notifyMaintenanceHead: { type: Boolean, default: true },
      notifyEmail: { type: Boolean, default: true },
      notifySMS: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Machine', machineSchema);


