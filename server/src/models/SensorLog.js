import mongoose from 'mongoose';

const sensorLogSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    machineId: { type: String, index: true },
    timestamp: { type: Date, required: true, index: true },
    temperature: { type: Number },
    vibration: { type: Number },
    current: { type: Number },
    features: {
      rms: Number,
      kurtosis: Number,
      skewness: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SensorLog', sensorLogSchema);


