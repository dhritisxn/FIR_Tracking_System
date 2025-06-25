const mongoose = require("mongoose");

const FIRSchema = new mongoose.Schema({
  firNumber: {
    type: String,
    unique: true,
    required: true
  },
  complainantName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  incidentType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'investigating', 'resolved', 'closed'],
    default: 'submitted'
  },
  assignedOfficer: {
    type: String
  },
  assignedOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  evidenceFiles: [{
    type: String
  }],
  updates: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: String,
    message: String,
    officer: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("FIR", FIRSchema);
