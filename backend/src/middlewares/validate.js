const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    return res.status(400).json(
      ApiResponse.error('Validation failed', 400, errorMessages)
    );
  };
};

// Common validation rules
const userRegisterRules = [
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
];

const loginRules = [
  body('identifier')
    .notEmpty().withMessage('Email or phone number is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

module.exports = {
  validate,
  userRegisterRules,
  loginRules
};