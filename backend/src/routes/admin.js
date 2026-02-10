const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

const adminController = require('../controllers/adminController');

// Dashboard routes
router.get('/dashboard/stats',
  authenticate,
  authorize('ADMIN'),
  adminController.getDashboardStats
);

router.get('/dashboard/analytics',
  authenticate,
  authorize('ADMIN'),
  validate([
    query('period').optional().isIn(['week', 'month', 'year'])
  ]),
  adminController.getAppointmentAnalytics
);

// Customer management
router.get('/customers',
  authenticate,
  authorize('ADMIN'),
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim()
  ]),
  adminController.getAllCustomers
);

router.get('/customers/:id',
  authenticate,
  authorize('ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Customer ID is required')
  ]),
  adminController.getCustomerDetails
);

// Salon configuration
router.get('/config',
  authenticate,
  authorize('ADMIN'),
  adminController.getSalonConfig
);

router.put('/config',
  authenticate,
  authorize('ADMIN'),
  validate([
    body('advancePaymentPercentage').optional().isInt({ min: 0, max: 100 })
      .withMessage('Advance payment percentage must be between 0 and 100')
  ]),
  adminController.updateSalonConfig
);

// Admin password change
router.put('/change-password',
  authenticate,
  authorize('ADMIN'),
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  ]),
  adminController.changeAdminPassword
);

module.exports = router;