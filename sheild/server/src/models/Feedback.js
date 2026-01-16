import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Form fields
    name: { type: String }, // User's name from form
    email: { type: String }, // User's email from form
    type: { type: String, enum: ['bug', 'feature', 'improvement', 'general', 'other'], required: true },
    title: { type: String, required: true }, // Maps to 'subject' from form
    description: { type: String, required: true }, // Maps to 'message' from form
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    category: { type: String, enum: ['ui', 'performance', 'functionality', 'data', 'security', 'other'], default: 'other' },
    classification: { type: String, enum: ['software', 'hardware', 'both', 'unknown'], default: 'unknown' },
    attachments: [{ type: String }],
    assignedTo: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date },
    votes: { type: Number, default: 0 },
    tags: [{ type: String }],
    browser: { type: String },
    os: { type: String },
    version: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
