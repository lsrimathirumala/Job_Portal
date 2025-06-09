// models/Candidate.js

const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  fullName: { type: String, required: true, index: 'text' },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  skills: [{ type: String, index: true }],
  education: [
    {
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
    },
  ],
  workHistory: [
    {
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String,
    },
  ],
  resumeText: { type: String, index: 'text' },
  resumeFile: {
    filename: String,   // original filename or unique stored filename
    url: String         // file URL (if stored on cloud)
  },
  createdAt: { type: Date, default: Date.now },
});

CandidateSchema.index({ fullName: 'text', resumeText: 'text', skills: 1 });

module.exports = mongoose.model('Candidate', CandidateSchema);