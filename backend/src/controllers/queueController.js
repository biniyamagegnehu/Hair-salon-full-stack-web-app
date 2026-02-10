const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const ApiResponse = require('../utils/response');

const queueController = {
  // Get real-time queue status
  getQueueStatus: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's appointments with queue positions
      const appointments = await Appointment.find({
        scheduledDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] }
      })
      .populate('customer', 'fullName phoneNumber')
      .populate('service', 'name duration')
      .sort({ queuePosition: 1, scheduledTime: 1 })
      .lean();

      // Calculate estimated wait times
      let currentTime = new Date();
      const queueWithWaitTimes = appointments.map((apt, index) => {
        const appointmentTime = new Date(apt.scheduledDate);
        const [hours, minutes] = apt.scheduledTime.split(':').map(Number);
        appointmentTime.setHours(hours, minutes, 0, 0);

        // Calculate wait time based on queue position
        let estimatedWaitTime = 0;
        
        if (apt.status === 'IN_PROGRESS') {
          estimatedWaitTime = 0; // Currently being served
        } else if (apt.status === 'CHECKED_IN') {
          // Sum durations of appointments before this one
          for (let i = 0; i < index; i++) {
            if (appointments[i].status === 'CHECKED_IN' || appointments[i].status === 'IN_PROGRESS') {
              estimatedWaitTime += appointments[i].service.duration || 30;
            }
          }
        } else {
          // For CONFIRMED appointments, add buffer for not checked in yet
          estimatedWaitTime = (index + 1) * 30; // 30 minutes per position as estimate
        }

        return {
          ...apt,
          estimatedWaitTime,
          position: index + 1
        };
      });

      // Calculate queue statistics
      const stats = {
        totalInQueue: appointments.length,
        inProgress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
        checkedIn: appointments.filter(a => a.status === 'CHECKED_IN').length,
        confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
        estimatedCurrentWait: queueWithWaitTimes.length > 0 ? 
          Math.max(...queueWithWaitTimes.map(a => a.estimatedWaitTime)) : 0
      };

      res.json(ApiResponse.success('Queue status retrieved', {
        queue: queueWithWaitTimes,
        stats,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Get queue status error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get queue position for a specific appointment
  getQueuePosition: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const customerId = req.user._id;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        customer: customerId,
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] }
      }).populate('service');

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found or not in queue')
        );
      }

      const today = new Date(appointment.scheduledDate);
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all appointments for the same day
      const appointmentsToday = await Appointment.find({
        scheduledDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] }
      }).sort({ queuePosition: 1, scheduledTime: 1 });

      // Find position in queue
      let position = 0;
      let estimatedWaitTime = 0;
      
      for (let i = 0; i < appointmentsToday.length; i++) {
        const apt = appointmentsToday[i];
        
        if (apt._id.toString() === appointmentId) {
          position = i + 1;
          
          // Calculate wait time based on previous appointments
          for (let j = 0; j < i; j++) {
            const prevApt = appointmentsToday[j];
            estimatedWaitTime += prevApt.estimatedDuration || 30;
          }
          break;
        }
      }

      res.json(ApiResponse.success('Queue position retrieved', {
        appointmentId,
        position,
        totalInQueue: appointmentsToday.length,
        estimatedWaitTime,
        status: appointment.status,
        scheduledTime: appointment.scheduledTime
      }));

    } catch (error) {
      console.error('Get queue position error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Customer checks in for appointment
  checkIn: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const customerId = req.user._id;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        customer: customerId,
        status: 'CONFIRMED'
      });

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found or not eligible for check-in')
        );
      }

      // Check if appointment is today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const appointmentDate = new Date(appointment.scheduledDate);
      appointmentDate.setHours(0, 0, 0, 0);

      if (appointmentDate.getTime() !== today.getTime()) {
        return res.status(400).json(
          ApiResponse.error('You can only check in on the day of your appointment')
        );
      }

      // Check if it's too early (more than 30 minutes before)
      const now = new Date();
      const appointmentTime = new Date(appointment.scheduledDate);
      const [hours, minutes] = appointment.scheduledTime.split(':').map(Number);
      appointmentTime.setHours(hours, minutes, 0, 0);

      const minutesBefore = (appointmentTime - now) / (1000 * 60);
      if (minutesBefore > 30) {
        return res.status(400).json(
          ApiResponse.error('You can only check in up to 30 minutes before your appointment')
        );
      }

      // Update appointment status
      appointment.status = 'CHECKED_IN';
      appointment.checkedInAt = new Date();
      
      // Assign queue position if not already assigned
      if (!appointment.queuePosition) {
        const appointmentsToday = await Appointment.countDocuments({
          scheduledDate: { $gte: today },
          status: { $in: ['CHECKED_IN', 'IN_PROGRESS'] }
        });
        appointment.queuePosition = appointmentsToday + 1;
      }

      await appointment.save();

      res.json(ApiResponse.success('Checked in successfully', {
        appointmentId: appointment._id,
        status: appointment.status,
        queuePosition: appointment.queuePosition,
        checkedInAt: appointment.checkedInAt
      }));

    } catch (error) {
      console.error('Check in error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Admin updates appointment status (IN_PROGRESS, COMPLETED, NO_SHOW)
  updateAppointmentStatus: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status, notes } = req.body;

      if (!['IN_PROGRESS', 'COMPLETED', 'NO_SHOW'].includes(status)) {
        return res.status(400).json(
          ApiResponse.error('Invalid status. Allowed: IN_PROGRESS, COMPLETED, NO_SHOW')
        );
      }

      const appointment = await Appointment.findById(appointmentId)
        .populate('customer', 'fullName phoneNumber');

      if (!appointment) {
        return res.status(404).json(ApiResponse.error('Appointment not found'));
      }

      // Validate status transition
      const validTransitions = {
        'CONFIRMED': ['IN_PROGRESS', 'NO_SHOW'],
        'CHECKED_IN': ['IN_PROGRESS', 'NO_SHOW'],
        'IN_PROGRESS': ['COMPLETED'],
        'COMPLETED': [],
        'NO_SHOW': []
      };

      if (!validTransitions[appointment.status]?.includes(status)) {
        return res.status(400).json(
          ApiResponse.error(`Cannot change status from ${appointment.status} to ${status}`)
        );
      }

      // Update appointment
      appointment.status = status;
      
      if (status === 'IN_PROGRESS') {
        appointment.startedAt = new Date();
      } else if (status === 'COMPLETED') {
        appointment.completedAt = new Date();
        // Calculate actual duration
        if (appointment.startedAt) {
          appointment.actualDuration = Math.round(
            (appointment.completedAt - appointment.startedAt) / (1000 * 60)
          );
        }
      } else if (status === 'NO_SHOW') {
        appointment.noShowAt = new Date();
        // Mark payment as failed if advance was paid
        if (appointment.payment.paymentStatus === 'PARTIAL') {
          appointment.payment.paymentStatus = 'FAILED';
        }
      }

      if (notes) {
        appointment.adminNotes = notes;
      }

      await appointment.save();

      // If appointment completed or marked as no-show, recalculate queue positions
      if (status === 'COMPLETED' || status === 'NO_SHOW') {
        await recalculateQueuePositions(appointment.scheduledDate);
      }

      res.json(ApiResponse.success('Appointment status updated', {
        appointmentId: appointment._id,
        status: appointment.status,
        customerName: appointment.customer.fullName,
        previousStatus: appointment.previousStatus
      }));

    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Admin gets today's queue for management
  getTodayQueue: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        scheduledDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] }
      })
      .populate('customer', 'fullName phoneNumber email')
      .populate('service', 'name duration price')
      .sort({ queuePosition: 1, scheduledTime: 1 })
      .lean();

      // Group by status for easier management
      const groupedAppointments = {
        inProgress: appointments.filter(a => a.status === 'IN_PROGRESS'),
        checkedIn: appointments.filter(a => a.status === 'CHECKED_IN'),
        confirmed: appointments.filter(a => a.status === 'CONFIRMED')
      };

      // Calculate statistics
      const stats = {
        total: appointments.length,
        inProgress: groupedAppointments.inProgress.length,
        checkedIn: groupedAppointments.checkedIn.length,
        confirmed: groupedAppointments.confirmed.length,
        estimatedRevenue: appointments.reduce((sum, apt) => {
          return sum + (apt.service?.price || 0);
        }, 0)
      };

      res.json(ApiResponse.success("Today's queue retrieved", {
        appointments: groupedAppointments,
        stats,
        date: today.toISOString().split('T')[0]
      }));

    } catch (error) {
      console.error('Get today queue error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Admin reorders queue (drag and drop functionality)
  reorderQueue: async (req, res) => {
    try {
      const { appointments } = req.body; // Array of { appointmentId, newPosition }

      if (!Array.isArray(appointments) || appointments.length === 0) {
        return res.status(400).json(
          ApiResponse.error('Appointments array is required')
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validate all appointments exist and are for today
      const appointmentIds = appointments.map(a => a.appointmentId);
      const existingAppointments = await Appointment.find({
        _id: { $in: appointmentIds },
        scheduledDate: { $gte: today }
      });

      if (existingAppointments.length !== appointments.length) {
        return res.status(400).json(
          ApiResponse.error('One or more appointments not found or not for today')
        );
      }

      // Update queue positions
      const updatePromises = appointments.map(({ appointmentId, newPosition }) => {
        return Appointment.findByIdAndUpdate(
          appointmentId,
          { queuePosition: newPosition },
          { new: true }
        );
      });

      await Promise.all(updatePromises);

      res.json(ApiResponse.success('Queue reordered successfully', {
        updatedCount: appointments.length
      }));

    } catch (error) {
      console.error('Reorder queue error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  }
};

// Helper function to recalculate queue positions
async function recalculateQueuePositions(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const appointments = await Appointment.find({
    scheduledDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $in: ['CHECKED_IN', 'IN_PROGRESS'] }
  }).sort({ scheduledTime: 1, checkedInAt: 1 });

  // Update queue positions
  for (let i = 0; i < appointments.length; i++) {
    appointments[i].queuePosition = i + 1;
    await appointments[i].save();
  }
}

module.exports = queueController;