const { verifyAccessToken } = require('../utils/jwt');
const ApiResponse = require('../utils/response');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Get token from HttpOnly cookie
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json(ApiResponse.unauthorized('No access token provided'));
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json(ApiResponse.unauthorized('Invalid or expired token'));
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json(ApiResponse.unauthorized('User not found'));
    }
    
    // Check if user is active
    if (!user.isVerified) {
      return res.status(403).json(ApiResponse.forbidden('Account not verified'));
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json(ApiResponse.serverError());
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.unauthorized());
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(ApiResponse.forbidden('Insufficient permissions'));
    }
    
    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        if (user && user.isVerified) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuthenticate };