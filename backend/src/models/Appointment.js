const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  estimatedEndTime: {
    type: String // Calculated field
  },
  status: {
    type: String,
    enum: ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'PENDING_PAYMENT'
  },
  queuePosition: {
    type: Number,
    default: null
  },
  payment: {
    advanceAmount: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    chapaTransactionId: {
      type: String
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    paymentDate: {
      type: Date
    }
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate estimated end time before saving
appointmentSchema.pre('save', function(next) {
  if (this.scheduledTime && this.estimatedDuration) {
    const [hours, minutes] = this.scheduledTime.split(':').map(Number);
    const startDate = new Date(this.scheduledDate);
    startDate.setHours(hours, minutes);
    
    const endDate = new Date(startDate.getTime() + this.estimatedDuration * 60000);
    this.estimatedEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);