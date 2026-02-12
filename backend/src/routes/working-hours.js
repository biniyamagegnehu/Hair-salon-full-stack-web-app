const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize, optionalAuthenticate } = require('../middlewares/auth');

const workingHoursController = require('../controllers/workingHoursController');

// Public routes
router.get('/',
  workingHoursController.getWorkingHours
);

router.get('/today',
  workingHoursController.getTodayWorkingHours
);

router.get('/next-available',
  workingHoursController.getNextAvailableDay
);

// Admin routes
router.put('/',
  authenticate,
  authorize('ADMIN'),
  validate([
    body().isArray().withMessage('Working hours must be an array'),
    body('*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
    body('*.openingTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid opening time required (HH:MM)'),
    body('*.closingTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid closing time required (HH:MM)'),
    body('*.isClosed').isBoolean().withMessage('isClosed must be boolean')
  ]),
  workingHoursController.updateWorkingHours
);

module.exports = router;