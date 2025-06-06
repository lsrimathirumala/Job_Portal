const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: false },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Interview', 'Rejected', 'Hired'],
    default: 'Applied',
  },
  coverLetter: { type: String },
});

ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ candidateId: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);