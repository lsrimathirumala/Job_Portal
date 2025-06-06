const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true, index: 'text' },
  company: { type: String, required: true, index: true },
  location: { type: String, required: true, index: true },
  description: { type: String },
  requirements: [{ type: String, index: 'text' }],
  salary: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
  },
  postedAt: { type: Date, default: Date.now },
  applicationDeadline: { type: Date },
  isActive: { type: Boolean, default: true },
  industry: { type: String, index: true },
  skills: [{ type: String, index: true }],
});

JobSchema.index({ jobTitle: 'text', description: 'text', requirements: 'text', company: 'text', location: 'text' });

module.exports = mongoose.model('Job', JobSchema);