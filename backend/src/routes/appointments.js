const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

const appointmentController = require('../controllers/appointmentController');

// Customer appointment routes
router.post('/',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('scheduledDate').isISO8601().withMessage('Valid date is required'),
    body('scheduledTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required')
  ]),
  appointmentController.createAppointment
);

router.get('/',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn([
      'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    ])
  ]),
  appointmentController.getCustomerAppointments
);

router.get('/available-slots',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    query('date').isISO8601().withMessage('Valid date is required'),
    query('serviceId').notEmpty().withMessage('Service ID is required')
  ]),
  appointmentController.getAvailableTimeSlots
);

router.get('/:id',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    param('id').notEmpty().withMessage('Appointment ID is required')
  ]),
  appointmentController.getAppointmentById
);

router.put('/:id/cancel',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    param('id').notEmpty().withMessage('Appointment ID is required')
  ]),
  appointmentController.cancelAppointment
);

router.put('/:id/reschedule',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    param('id').notEmpty().withMessage('Appointment ID is required'),
    body('newDate').isISO8601().withMessage('Valid new date is required'),
    body('newTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid new time format (HH:MM) is required')
  ]),
  appointmentController.rescheduleAppointment
);

module.exports = router;