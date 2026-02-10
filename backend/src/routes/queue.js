const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

const queueController = require('../controllers/queueController');

// Public queue status (no auth required)
router.get('/status',
  queueController.getQueueStatus
);

// Customer queue routes
router.get('/position/:appointmentId',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    param('appointmentId').notEmpty().withMessage('Appointment ID is required')
  ]),
  queueController.getQueuePosition
);

router.post('/:appointmentId/check-in',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    param('appointmentId').notEmpty().withMessage('Appointment ID is required')
  ]),
  queueController.checkIn
);

// Admin queue management routes
router.get('/today',
  authenticate,
  authorize('ADMIN'),
  queueController.getTodayQueue
);

router.put('/:appointmentId/status',
  authenticate,
  authorize('ADMIN'),
  validate([
    param('appointmentId').notEmpty().withMessage('Appointment ID is required'),
    body('status').isIn(['IN_PROGRESS', 'COMPLETED', 'NO_SHOW']).withMessage('Valid status is required')
  ]),
  queueController.updateAppointmentStatus
);

router.put('/reorder',
  authenticate,
  authorize('ADMIN'),
  validate([
    body('appointments').isArray().withMessage('Appointments array is required'),
    body('appointments.*.appointmentId').notEmpty().withMessage('Appointment ID is required'),
    body('appointments.*.newPosition').isInt({ min: 1 }).withMessage('New position must be positive integer')
  ]),
  queueController.reorderQueue
);

module.exports = router;