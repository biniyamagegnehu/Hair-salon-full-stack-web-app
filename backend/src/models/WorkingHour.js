const mongoose = require('mongoose');

const workingHourSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    required: true,
    min: 0,
    max: 6
  },
  openingTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  closingTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  isClosed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('WorkingHour', workingHourSchema);