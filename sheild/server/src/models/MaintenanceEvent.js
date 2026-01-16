import mongoose from 'mongoose';

const maintenanceEventSchema = new mongoose.Schema(
  {
    deviceId: { 
      type: String, 
      required: true, 
      index: true 
    },
    timestamp: { 
      type: Date, 
      required: true, 
      default: Date.now,
      index: true 
    },
    actionTaken: { 
      type: String, 
      required: true,
      trim: true
    },
    notes: { 
      type: String, 
      trim: true,
      default: ''
    },
    createdBy: { 
      type: String, 
      default: 'User'
    },
    // Optional: Link to machine document
    machine: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Machine' 
    }
  },
  { timestamps: true }
);

// Index for efficient queries
maintenanceEventSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model('MaintenanceEvent', maintenanceEventSchema);






