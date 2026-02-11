const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate, userRegisterRules, loginRules } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

const authController = require('../controllers/authController');

// Public routes
router.post('/register', validate(userRegisterRules), authController.register);
router.post('/login', validate(loginRules), authController.login);
router.post('/refresh', authController.refreshTokens);
router.post('/logout', authenticate, authController.logout);

// Google OAuth (frontend sends token)
router.post('/google', 
  validate([body('token').notEmpty().withMessage('Google token is required')]),
  authController.googleAuth
);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/language', authenticate, validate([
  body('language').isIn(['am', 'en']).withMessage('Language must be either "am" or "en"')
]), authController.updateLanguage);

router.put('/phone', authenticate, validate([
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+251[79]\d{8}$/).withMessage('Invalid Ethiopian phone number format (+251XXXXXXXXX)')
]), authController.updatePhoneNumber);

router.put('/change-password', authenticate, validate([
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
]), authController.changePassword);

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