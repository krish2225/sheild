import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    machineId: { type: String, index: true },
    classification: {
      label: { type: String, enum: ['normal', 'faulty'], required: true },
      confidence: { type: Number, min: 0, max: 1, required: true },
    },
    rulHours: { type: Number },
    featureImportance: {
      vibration: Number,
      kurtosis: Number,
      skewness: Number,
      temperature: Number,
      rms: Number,
      current: Number,
    },
    input: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Prediction', predictionSchema);


