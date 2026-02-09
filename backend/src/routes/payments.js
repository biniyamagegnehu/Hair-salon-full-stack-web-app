const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

const paymentController = require('../controllers/paymentController');

// Public webhook route (no auth required for Chapa)
router.post('/webhook', 
  express.raw({ type: 'application/json' }), // Raw body for signature verification
  paymentController.handleWebhook
);

// Protected routes
router.post('/initialize',
  authenticate,
  authorize('CUSTOMER'),
  validate([
    body('appointmentId').notEmpty().withMessage('Appointment ID is required')
  ]),
  paymentController.initializePayment
);

router.get('/verify/:transactionId',
  authenticate,
  validate([
    param('transactionId').notEmpty().withMessage('Transaction ID is required')
  ]),
  paymentController.verifyPayment
);

router.get('/methods',
  authenticate,
  paymentController.getPaymentMethods
);

router.post('/complete/:appointmentId',
  authenticate,
  authorize('ADMIN'),
  validate([
    param('appointmentId').notEmpty().withMessage('Appointment ID is required'),
    body('amountPaid').isFloat({ min: 1 }).withMessage('Amount paid must be at least 1 ETB')
  ]),
  paymentController.completePayment
);

router.post('/refund/:appointmentId',
  authenticate,
  authorize('ADMIN'),
  validate([
    param('appointmentId').notEmpty().withMessage('Appointment ID is required'),
    body('reason').notEmpty().withMessage('Refund reason is required')
  ]),
  paymentController.refundPayment
);

module.exports = router;