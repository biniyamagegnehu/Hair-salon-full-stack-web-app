const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

const serviceController = require('../controllers/serviceController');

// Public routes (get services)
router.get('/',
  validate([
    query('activeOnly').optional().isIn(['true', 'false'])
  ]),
  serviceController.getAllServices
);

router.get('/:id',
  validate([
    param('id').notEmpty().withMessage('Service ID is required')
  ]),
  serviceController.getServiceById
);

// Admin routes (CRUD operations)
router.post('/',
  authenticate,
  authorize('ADMIN'),
  validate([
    body('name.am').notEmpty().withMessage('Amharic name is required'),
    body('name.en').notEmpty().withMessage('English name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('duration').isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes')
  ]),
  serviceController.createService
);

router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Service ID is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price cannot be negative'),
    body('duration').optional().isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes')
  ]),
  serviceController.updateService
);

router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Service ID is required'),
    query('permanent').optional().isIn(['true', 'false'])
  ]),
  serviceController.deleteService
);

router.put('/:id/activate',
  authenticate,
  authorize('ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Service ID is required')
  ]),
  serviceController.activateService
);

module.exports = router;