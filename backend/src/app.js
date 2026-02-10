const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const corsOptions = require('./config/corsOptions');
const ApiResponse = require('./utils/response');
const { setCsrfToken, csrfProtection } = require('./middlewares/csrf');
const { passport: googlePassport } = require('./services/googleOAuth');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL, "https://api.chapa.co"]
    }
  }
}));

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

// Session configuration for OAuth
app.use(session({
  secret: process.env.JWT_ACCESS_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS
app.use(cors(corsOptions));

// Sanitize data
app.use(mongoSanitize());

// CSRF protection
app.use(setCsrfToken);
app.use(csrfProtection);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
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

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/services', require('./routes/services'));
app.use('/api/working-hours', require('./routes/workingHours'));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json(ApiResponse.notFound('API endpoint not found'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.unauthorized('Token expired'));
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json(ApiResponse.error(messages.join(', ')));
  }
  
  // Handle Chapa errors
  if (err.name === 'ChapaError') {
    return res.status(400).json(ApiResponse.error(err.message));
  }
  
  // Default error
  res.status(500).json(ApiResponse.serverError());
});

module.exports = app;