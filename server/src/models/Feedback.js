import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['bug', 'feature', 'improvement', 'general'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    category: { type: String, enum: ['ui', 'performance', 'functionality', 'data', 'security', 'other'], default: 'other' },
    classification: { type: String, enum: ['software', 'hardware', 'both', 'unknown'], default: 'unknown' }, // New field for software/hardware classification
    attachments: [{ type: String }], // URLs to uploaded files
    assignedTo: { type: String }, // Admin/developer assigned to handle
    resolution: { type: String }, // Resolution notes
    resolvedAt: { type: Date },
    votes: { type: Number, default: 0 }, // Community voting
    tags: [{ type: String }], // Tags for categorization
    browser: { type: String },
    os: { type: String },
    version: { type: String }, // App version when feedback was submitted
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
