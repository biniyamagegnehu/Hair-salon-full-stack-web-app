const crypto = require('crypto');
const ApiResponse = require('../utils/response');

const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for health check
  if (req.path === '/health') {
    return next();
  }
  
  // Get CSRF token from header
  const csrfToken = req.headers['x-csrf-token'];
  const cookieCsrfToken = req.cookies['csrf-token'];
  
  if (!csrfToken || csrfToken !== cookieCsrfToken) {
    return res.status(403).json(
      ApiResponse.forbidden('Invalid CSRF token')
    );
  }
  
  next();
};

const setCsrfToken = (req, res, next) => {
  // Generate new CSRF token if not exists
  if (!req.cookies['csrf-token']) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false, // Must be accessible by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }
  
  next();
};

module.exports = { csrfProtection, setCsrfToken };