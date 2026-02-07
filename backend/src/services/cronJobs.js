const cron = require('node-cron');
const Appointment = require('../models/Appointment');

// Clean up old pending appointments (older than 24 hours)
const cleanupPendingAppointments = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Appointment.updateMany(
      {
        status: 'PENDING_PAYMENT',
        createdAt: { $lt: twentyFourHoursAgo }
      },
      {
        $set: { status: 'CANCELLED' }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Cleaned up ${result.modifiedCount} pending appointments`);
    }
  } catch (error) {
    console.error('Error cleaning up pending appointments:', error);
  }
};

// Initialize cron jobs
const initCronJobs = () => {
  // Run every day at 3 AM
  cron.schedule('0 3 * * *', cleanupPendingAppointments);
  
  console.log('Cron jobs initialized');
};

module.exports = { initCronJobs };