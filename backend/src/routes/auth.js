const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

// Import controllers
const authController = require('../controllers/authController');

// Public routes
router.post('/register', 
  validate([
    body('phoneNumber')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^\+251[79]\d{8}$/).withMessage('Invalid Ethiopian phone number format (+251XXXXXXXXX)'),
    body('fullName')
      .notEmpty().withMessage('Full name is required')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number')
  ]), 
  authController.register
);

router.post('/login', 
  validate([
    body('identifier')
      .notEmpty().withMessage('Email or phone number is required'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ]),
  authController.login
);

router.post('/refresh', authController.refreshTokens);
router.post('/logout', authenticate, authController.logout);

// Google OAuth (frontend sends token)
router.post('/google', 
  validate([
    body('token').notEmpty().withMessage('Google token is required')
  ]),
  authController.googleAuth
);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

router.put('/language', 
  authenticate, 
  validate([
    body('language').isIn(['am', 'en']).withMessage('Language must be either "am" or "en"')
  ]), 
  authController.updateLanguage
);

router.put('/phone', 
  authenticate, 
  validate([
    body('phoneNumber')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^\+251[79]\d{8}$/).withMessage('Invalid Ethiopian phone number format (+251XXXXXXXXX)')
  ]), 
  authController.updatePhoneNumber
);

router.put('/change-password', 
  authenticate, 
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number')
  ]), 
  authController.changePassword
);

// Admin password reset (admin only)
router.post('/admin/reset-password', 
  authenticate, 
  authorize('ADMIN'),
  validate([
    body('userId').notEmpty().withMessage('User ID is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ]), 
  authController.adminResetPassword
);

module.exports = router;