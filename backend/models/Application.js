const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true,
    index: true 
  },
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true,
    index: true 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Interview', 'Rejected', 'Hired'],
    default: 'Applied',
    index: true
  },
  coverLetter: { 
    type: String,
    trim: true
  },
  resumeText: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual population for easier queries
ApplicationSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('candidate', {
  ref: 'Candidate',
  localField: 'candidateId',
  foreignField: '_id',
  justOne: true
});

// Compound index for faster queries
ApplicationSchema.index({ candidateId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, status: 1 });

// Pre-save hook to validate references
ApplicationSchema.pre('save', async function(next) {
  try {
    const [job, candidate] = await Promise.all([
      mongoose.model('Job').findById(this.jobId),
      mongoose.model('Candidate').findById(this.candidateId)
    ]);
    
    if (!job) {
      throw new Error('Invalid job reference');
    }
    
    if (!candidate) {
      throw new Error('Invalid candidate reference');
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);