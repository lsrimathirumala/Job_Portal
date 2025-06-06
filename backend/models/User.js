// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['candidate', 'employer', 'admin'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// You can add indexes if needed
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);