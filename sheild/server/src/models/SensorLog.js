import mongoose from 'mongoose';

const sensorLogSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    machineId: { type: String, index: true },
    timestamp: { type: Date, required: true, index: true },
    temperature: { type: Number },
    vibration: { type: Number },
    current: { type: Number },
    // ML model features
    temp_mean: { type: Number, index: true },
    vib_rms: { type: Number, index: true },
    current_rms: { type: Number, index: true },
    edge_health: { type: Number, index: true },
    // Anomaly detection results
    anomaly: { type: Number, default: 0 }, // 0 = normal, 1 = anomaly
    anomaly_score: { type: Number }, // Isolation Forest score
    // Legacy features
    features: {
      rms: Number,
      kurtosis: Number,
      skewness: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SensorLog', sensorLogSchema);


