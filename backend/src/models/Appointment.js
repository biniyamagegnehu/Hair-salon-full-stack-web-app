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
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: true
  },
  estimatedEndTime: {
    type: String
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
      enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED', 'PENDING_REFUND'],
      default: 'PENDING'
    },
    paymentDate: {
      type: Date
    },
    cashPayment: {
      amount: Number,
      method: String,
      receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      receivedAt: Date
    },
    refund: {
      amount: Number,
      reason: String,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      processedAt: Date
    }
  },
  notes: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  checkedInAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  noShowAt: {
    type: Date
  },
  actualDuration: {
    type: Number
  }
}, {
  timestamps: true
});

// Calculate estimated end time before saving - FIXED: removed next parameter
appointmentSchema.pre('save', function() {
  if (this.scheduledTime && this.estimatedDuration) {
    const [hours, minutes] = this.scheduledTime.split(':').map(Number);
    const startDate = new Date(this.scheduledDate);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + this.estimatedDuration * 60000);
    this.estimatedEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);