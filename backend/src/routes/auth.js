const express = require('express');
const router = express.Router();
const { validate, userRegisterRules, loginRules } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

// Import controllers (to be created in next phase)
const authController = require('../controllers/authController');

// Public routes
router.post('/register', validate(userRegisterRules), authController.register);
router.post('/login', validate(loginRules), authController.login);
router.post('/refresh', authController.refreshTokens);
router.post('/logout', authenticate, authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/language', authenticate, validate([
  body('language').isIn(['am', 'en']).withMessage('Language must be either "am" or "en"')
]), authController.updateLanguage);

// Google OAuth routes (to be implemented in next phase)
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

module.exports = router;