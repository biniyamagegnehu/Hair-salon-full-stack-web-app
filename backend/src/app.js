const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const corsOptions = require('./config/corsOptions');
const ApiResponse = require('./utils/response');
const { setCsrfToken, csrfProtection } = require('./middlewares/csrf');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors(corsOptions));

// Sanitize data
app.use(mongoSanitize());

// CSRF protection (set token first, then verify)
app.use(setCsrfToken);
app.use(csrfProtection);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json(ApiResponse.success('Server is healthy', {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }));
});

// Test route
app.get('/api/test', (req, res) => {
  res.json(ApiResponse.success('API is working!'));
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/services', require('./routes/services'));
app.use('/api/working-hours', require('./routes/working-hours'));

// 404 handler - FIXED: Don't use wildcard pattern
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json(ApiResponse.notFound(`API endpoint not found: ${req.method} ${req.path}`));
  }
  // For non-API routes
  res.status(404).json(ApiResponse.notFound('Resource not found'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.unauthorized('Token expired'));
  }
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json(ApiResponse.error(messages.join(', ')));
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json(
      ApiResponse.error(`${field} already exists`)
    );
  }
  
  res.status(500).json(ApiResponse.serverError());
});

module.exports = app;