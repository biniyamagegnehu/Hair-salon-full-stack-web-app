const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
    sparse: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'ADMIN'],
    default: 'CUSTOMER'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  languagePreference: {
    type: String,
    enum: ['am', 'en'],
    default: 'am'
  },
  lastLogin: {
    type: Date
  },
  refreshToken: {
    type: String
  }
}, {
  timestamps: true
});

// Hash password before saving - FIXED: removed next parameter
userSchema.pre('save', async function() {
  // Only hash if password is modified and exists
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);