const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    am: { type: String, required: true },
    en: { type: String, required: true }
  },
  description: {
    am: { type: String },
    en: { type: String }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);