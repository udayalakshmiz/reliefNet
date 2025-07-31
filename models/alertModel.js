import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  location: String,
  urgency: String,
  isActive: Boolean,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  targetAudience: {
    type: [String],
    enum: ['victim', 'volunteer'],
    default: ['victim', 'volunteer']
  }
});

export default mongoose.model('Alert', alertSchema);
