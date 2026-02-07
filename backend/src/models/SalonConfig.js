const mongoose = require('mongoose');

const salonConfigSchema = new mongoose.Schema({
  salonName: {
    am: { type: String, default: 'ኤክስ ወንዶች ፀጉር አሰፋፈር' },
    en: { type: String, default: 'X Men\'s Hair Salon' }
  },
  location: {
    am: { type: String, default: 'አዲስ አበባ, ኢትዮጵያ' },
    en: { type: String, default: 'Addis Ababa, Ethiopia' }
  },
  description: {
    am: { type: String, default: 'በፀጉር አሰፋፈር ስልጠና የተማሩ የሙያ ባለሙያዎች' },
    en: { type: String, default: 'Professional hairstylists with extensive training' }
  },
  contactPhone: {
    type: String,
    default: '+251911234567'
  },
  contactEmail: {
    type: String,
    default: 'info@xmenssalon.com'
  },
  advancePaymentPercentage: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalonConfig', salonConfigSchema);