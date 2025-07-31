import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema({
  typeOfHelp: {
    type: String,
    required: true,
    enum: ['Food', 'Water', 'Shelter', 'Medical Aid', 'Rescue', 'Transportation', 'Other']
  },
  urgencyLevel: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  submittedAnonymously: {
    type: Boolean,
    default: false
  },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model('HelpRequest', helpRequestSchema);
