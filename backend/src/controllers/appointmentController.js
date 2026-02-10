const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const WorkingHour = require('../models/WorkingHour');
const User = require('../models/User');
const SalonConfig = require('../models/SalonConfig');
const ApiResponse = require('../utils/response');

const appointmentController = {
  // Create new appointment
  createAppointment: async (req, res) => {
    try {
      const customerId = req.user._id;
      const { serviceId, scheduledDate, scheduledTime, notes } = req.body;

      // Validate service
      const service = await Service.findById(serviceId);
      if (!service || !service.isActive) {
        return res.status(404).json(
          ApiResponse.error('Service not found or not available')
        );
      }

      // Validate date and time
      const appointmentDate = new Date(scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        return res.status(400).json(
          ApiResponse.error('Cannot book appointments in the past')
        );
      }

      // Check if date is within 60 days
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 60);
      if (appointmentDate > maxDate) {
        return res.status(400).json(
          ApiResponse.error('Cannot book appointments more than 60 days in advance')
        );
      }

      // Check working hours
      const dayOfWeek = appointmentDate.getDay();
      const workingHour = await WorkingHour.findOne({ dayOfWeek });
      
      if (!workingHour || workingHour.isClosed) {
        return res.status(400).json(
          ApiResponse.error('Salon is closed on this day')
        );
      }

      // Parse time
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      if (hours < parseInt(workingHour.openingTime.split(':')[0]) || 
          hours >= parseInt(workingHour.closingTime.split(':')[0])) {
        return res.status(400).json(
          ApiResponse.error(`Salon is open from ${workingHour.openingTime} to ${workingHour.closingTime}`)
        );
      }

      // Check for overlapping appointments (same customer)
      const appointmentStart = new Date(appointmentDate);
      appointmentStart.setHours(hours, minutes, 0, 0);
      const appointmentEnd = new Date(appointmentStart.getTime() + service.duration * 60000);

      const overlappingAppointment = await Appointment.findOne({
        customer: customerId,
        scheduledDate: appointmentDate,
        status: { $nin: ['CANCELLED', 'NO_SHOW'] },
        $or: [
          {
            scheduledTime: scheduledTime
          },
          {
            $expr: {
              $and: [
                { $gte: [new Date(`$scheduledDate $scheduledTime`), appointmentStart] },
                { $lt: [new Date(`$scheduledDate $scheduledTime`), appointmentEnd] }
              ]
            }
          }
        ]
      });

      if (overlappingAppointment) {
        return res.status(400).json(
          ApiResponse.error('You already have an appointment at this time')
        );
      }

      // Check salon capacity (max 5 appointments per hour)
      const hourStart = new Date(appointmentDate);
      hourStart.setHours(hours, 0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60000);

      const appointmentsInHour = await Appointment.countDocuments({
        scheduledDate: appointmentDate,
        scheduledTime: { $gte: `${hours.toString().padStart(2, '0')}:00` },
        scheduledTime: { $lt: `${(hours + 1).toString().padStart(2, '0')}:00` },
        status: { $nin: ['CANCELLED', 'NO_SHOW'] }
      });

      if (appointmentsInHour >= 5) {
        return res.status(400).json(
          ApiResponse.error('This time slot is fully booked. Please choose another time.')
        );
      }

      // Get salon config for advance payment percentage
      const salonConfig = await SalonConfig.findOne();
      const advancePercentage = salonConfig?.advancePaymentPercentage || 50;

      // Calculate payment amounts
      const totalAmount = service.price;
      const advanceAmount = Math.ceil(totalAmount * (advancePercentage / 100));

      // Create appointment
      const appointment = await Appointment.create({
        customer: customerId,
        service: serviceId,
        scheduledDate: appointmentDate,
        scheduledTime: scheduledTime,
        estimatedDuration: service.duration,
        notes,
        payment: {
          advanceAmount,
          totalAmount,
          paymentStatus: 'PENDING'
        },
        status: 'PENDING_PAYMENT'
      });

      // Populate service details
      await appointment.populate('service');

      res.status(201).json(ApiResponse.created('Appointment created successfully', {
        appointment: {
          id: appointment._id,
          service: {
            id: appointment.service._id,
            name: appointment.service.name,
            price: appointment.service.price,
            duration: appointment.service.duration
          },
          scheduledDate: appointment.scheduledDate,
          scheduledTime: appointment.scheduledTime,
          estimatedEndTime: appointment.estimatedEndTime,
          status: appointment.status,
          payment: appointment.payment,
          notes: appointment.notes
        },
        paymentRequired: advanceAmount
      }));

    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get customer appointments
  getCustomerAppointments: async (req, res) => {
    try {
      const customerId = req.user._id;
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Build query
      const query = { customer: customerId };
      if (status) {
        query.status = status;
      }

      // Get appointments with pagination
      const appointments = await Appointment.find(query)
        .populate('service', 'name price duration')
        .sort({ scheduledDate: -1, scheduledTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count
      const total = await Appointment.countDocuments(query);

      // Format response
      const formattedAppointments = appointments.map(apt => ({
        id: apt._id,
        service: apt.service,
        scheduledDate: apt.scheduledDate,
        scheduledTime: apt.scheduledTime,
        estimatedEndTime: apt.estimatedEndTime,
        status: apt.status,
        queuePosition: apt.queuePosition,
        payment: apt.payment,
        notes: apt.notes,
        createdAt: apt.createdAt
      }));

      res.json(ApiResponse.success('Appointments retrieved', {
        appointments: formattedAppointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }));

    } catch (error) {
      console.error('Get customer appointments error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get appointment by ID
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user._id;

      const appointment = await Appointment.findOne({
        _id: id,
        customer: customerId
      })
      .populate('service')
      .populate('customer', 'fullName phoneNumber email')
      .lean();

      if (!appointment) {
        return res.status(404).json(ApiResponse.notFound('Appointment not found'));
      }

      res.json(ApiResponse.success('Appointment retrieved', { appointment }));

    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Cancel appointment
  cancelAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.user._id;

      const appointment = await Appointment.findOne({
        _id: id,
        customer: customerId,
        status: { $in: ['PENDING_PAYMENT', 'CONFIRMED'] }
      });

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found or cannot be cancelled')
        );
      }

      // Check if appointment is within 24 hours
      const appointmentTime = new Date(appointment.scheduledDate);
      const [hours, minutes] = appointment.scheduledTime.split(':').map(Number);
      appointmentTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);

      if (hoursDifference < 24 && appointment.status === 'CONFIRMED') {
        return res.status(400).json(
          ApiResponse.error('Appointments can only be cancelled at least 24 hours in advance')
        );
      }

      // Update appointment status
      appointment.status = 'CANCELLED';
      
      // If payment was made, mark for refund
      if (appointment.payment.paymentStatus === 'PARTIAL') {
        appointment.payment.paymentStatus = 'PENDING_REFUND';
      }
      
      await appointment.save();

      res.json(ApiResponse.success('Appointment cancelled successfully', {
        appointmentId: appointment._id,
        status: appointment.status
      }));

    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get available time slots
  getAvailableTimeSlots: async (req, res) => {
    try {
      const { date, serviceId } = req.query;
      
      if (!date || !serviceId) {
        return res.status(400).json(
          ApiResponse.error('Date and service ID are required')
        );
      }

      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.getDay();
      
      // Get working hours
      const workingHour = await WorkingHour.findOne({ dayOfWeek });
      if (!workingHour || workingHour.isClosed) {
        return res.json(ApiResponse.success('No available slots (salon closed)', { slots: [] }));
      }

      // Get service duration
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json(ApiResponse.error('Service not found'));
      }

      // Parse working hours
      const [openHour, openMinute] = workingHour.openingTime.split(':').map(Number);
      const [closeHour, closeMinute] = workingHour.closingTime.split(':').map(Number);
      
      const openTime = new Date(appointmentDate);
      openTime.setHours(openHour, openMinute, 0, 0);
      
      const closeTime = new Date(appointmentDate);
      closeTime.setHours(closeHour, closeMinute, 0, 0);

      // Get existing appointments for this date
      const existingAppointments = await Appointment.find({
        scheduledDate: appointmentDate,
        status: { $nin: ['CANCELLED', 'NO_SHOW'] }
      }).select('scheduledTime estimatedDuration');

      // Generate time slots (every 15 minutes)
      const timeSlots = [];
      const slotDuration = 15; // minutes
      let currentTime = new Date(openTime);

      while (currentTime < closeTime) {
        const slotEnd = new Date(currentTime.getTime() + service.duration * 60000);
        
        // Check if slot ends before closing time
        if (slotEnd <= closeTime) {
          const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
          
          // Check if slot conflicts with existing appointments
          let isAvailable = true;
          
          for (const apt of existingAppointments) {
            const aptStart = new Date(appointmentDate);
            const [aptHour, aptMinute] = apt.scheduledTime.split(':').map(Number);
            aptStart.setHours(aptHour, aptMinute, 0, 0);
            
            const aptEnd = new Date(aptStart.getTime() + apt.estimatedDuration * 60000);
            
            // Check for overlap
            if (!(slotEnd <= aptStart || currentTime >= aptEnd)) {
              isAvailable = false;
              break;
            }
          }

          // Check salon capacity (max 5 appointments per hour)
          if (isAvailable) {
            const hourStart = new Date(currentTime);
            hourStart.setMinutes(0, 0, 0);
            const hourEnd = new Date(hourStart.getTime() + 60 * 60000);
            
            const appointmentsInHour = existingAppointments.filter(apt => {
              const aptTime = new Date(appointmentDate);
              const [aptHour, aptMinute] = apt.scheduledTime.split(':').map(Number);
              aptTime.setHours(aptHour, aptMinute, 0, 0);
              return aptTime >= hourStart && aptTime < hourEnd;
            }).length;

            if (appointmentsInHour >= 5) {
              isAvailable = false;
            }
          }

          timeSlots.push({
            time: timeString,
            available: isAvailable,
            display: `${timeString} - ${slotEnd.getHours().toString().padStart(2, '0')}:${slotEnd.getMinutes().toString().padStart(2, '0')}`
          });
        }

        // Move to next slot
        currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
      }

      res.json(ApiResponse.success('Available time slots retrieved', {
        date: appointmentDate.toISOString().split('T')[0],
        service: {
          id: service._id,
          name: service.name,
          duration: service.duration
        },
        workingHours: {
          opening: workingHour.openingTime,
          closing: workingHour.closingTime,
          isClosed: workingHour.isClosed
        },
        slots: timeSlots
      }));

    } catch (error) {
      console.error('Get available time slots error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { newDate, newTime } = req.body;
      const customerId = req.user._id;

      // Find appointment
      const appointment = await Appointment.findOne({
        _id: id,
        customer: customerId,
        status: { $in: ['CONFIRMED'] }
      }).populate('service');

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found or cannot be rescheduled')
        );
      }

      // Check if rescheduling is allowed (at least 12 hours before)
      const appointmentTime = new Date(appointment.scheduledDate);
      const [hours, minutes] = appointment.scheduledTime.split(':').map(Number);
      appointmentTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);

      if (hoursDifference < 12) {
        return res.status(400).json(
          ApiResponse.error('Appointments can only be rescheduled at least 12 hours in advance')
        );
      }

      // Validate new date and time (reuse logic from createAppointment)
      const newAppointmentDate = new Date(newDate);
      const dayOfWeek = newAppointmentDate.getDay();
      
      const workingHour = await WorkingHour.findOne({ dayOfWeek });
      if (!workingHour || workingHour.isClosed) {
        return res.status(400).json(
          ApiResponse.error('Salon is closed on the selected day')
        );
      }

      // Parse new time
      const [newHours, newMinutes] = newTime.split(':').map(Number);
      if (newHours < parseInt(workingHour.openingTime.split(':')[0]) || 
          newHours >= parseInt(workingHour.closingTime.split(':')[0])) {
        return res.status(400).json(
          ApiResponse.error(`Salon is open from ${workingHour.openingTime} to ${workingHour.closingTime}`)
        );
      }

      // Check for overlapping appointments
      const newStart = new Date(newAppointmentDate);
      newStart.setHours(newHours, newMinutes, 0, 0);
      const newEnd = new Date(newStart.getTime() + appointment.service.duration * 60000);

      const overlappingAppointment = await Appointment.findOne({
        customer: customerId,
        _id: { $ne: id },
        scheduledDate: newAppointmentDate,
        status: { $nin: ['CANCELLED', 'NO_SHOW'] },
        $or: [
          {
            scheduledTime: newTime
          },
          {
            $expr: {
              $and: [
                { $gte: [new Date(`$scheduledDate $scheduledTime`), newStart] },
                { $lt: [new Date(`$scheduledDate $scheduledTime`), newEnd] }
              ]
            }
          }
        ]
      });

      if (overlappingAppointment) {
        return res.status(400).json(
          ApiResponse.error('You already have an appointment at the new time')
        );
      }

      // Check salon capacity
      const hourStart = new Date(newAppointmentDate);
      hourStart.setHours(newHours, 0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60000);

      const appointmentsInHour = await Appointment.countDocuments({
        _id: { $ne: id },
        scheduledDate: newAppointmentDate,
        scheduledTime: { $gte: `${newHours.toString().padStart(2, '0')}:00` },
        scheduledTime: { $lt: `${(newHours + 1).toString().padStart(2, '0')}:00` },
        status: { $nin: ['CANCELLED', 'NO_SHOW'] }
      });

      if (appointmentsInHour >= 5) {
        return res.status(400).json(
          ApiResponse.error('The new time slot is fully booked')
        );
      }

      // Update appointment
      appointment.scheduledDate = newAppointmentDate;
      appointment.scheduledTime = newTime;
      appointment.estimatedEndTime = `${newEnd.getHours().toString().padStart(2, '0')}:${newEnd.getMinutes().toString().padStart(2, '0')}`;
      
      // Reset queue position if date changed
      const oldDate = new Date(appointment.scheduledDate);
      if (oldDate.toDateString() !== newAppointmentDate.toDateString()) {
        appointment.queuePosition = null;
      }

      await appointment.save();

      res.json(ApiResponse.success('Appointment rescheduled successfully', {
        appointmentId: appointment._id,
        newDate: appointment.scheduledDate,
        newTime: appointment.scheduledTime,
        estimatedEndTime: appointment.estimatedEndTime,
        queuePosition: appointment.queuePosition
      }));

    } catch (error) {
      console.error('Reschedule appointment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  }
};

module.exports = appointmentController;