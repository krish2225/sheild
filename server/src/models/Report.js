import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    period: { type: String, enum: ['weekly', 'monthly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    contents: { type: [String], default: [] },
    fileUrl: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);


