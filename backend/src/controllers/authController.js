const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const ApiResponse = require('../utils/response');

const authController = {
  register: async (req, res) => {
    try {
      const { email, phoneNumber, fullName, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: email?.toLowerCase() },
          { phoneNumber }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json(
          ApiResponse.error('User with this email or phone number already exists')
        );
      }
      
      // Create new user
      const user = await User.create({
        email: email?.toLowerCase(),
        phoneNumber,
        fullName,
        password,
        role: 'CUSTOMER',
        isVerified: true // Auto-verify for now, can add OTP later
      });
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.role);
      
      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();
      
      // Set tokens in HttpOnly cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data (excluding sensitive info)
      const userData = {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        languagePreference: user.languagePreference
      };
      
      res.status(201).json(ApiResponse.created('Registration successful', userData));
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },
  
  login: async (req, res) => {
    try {
      const { identifier, password } = req.body;
      
      // Find user by email or phone number
      const user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { phoneNumber: identifier }
        ]
      });
      
      if (!user) {
        return res.status(401).json(ApiResponse.error('Invalid credentials'));
      }
      
      // For admin login, require password
      if (user.role === 'ADMIN' && !password) {
        return res.status(401).json(ApiResponse.error('Password required for admin login'));
      }
      
      // Check password if user has one
      if (user.password) {
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return res.status(401).json(ApiResponse.error('Invalid credentials'));
        }
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.role);
      
      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();
      
      // Set tokens in HttpOnly cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      // Return user data
      const userData = {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        languagePreference: user.languagePreference
      };
      
      res.json(ApiResponse.success('Login successful', userData));
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },
  
  refreshTokens: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json(ApiResponse.unauthorized('No refresh token provided'));
      }
      
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json(ApiResponse.unauthorized('Invalid refresh token'));
      }
      
      // Find user with this refresh token
      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken: refreshToken
      });
      
      if (!user) {
        return res.status(401).json(ApiResponse.unauthorized('User not found'));
      }
      
      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);
      
      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await user.save();
      
      // Set new tokens in cookies
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });
      
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.json(ApiResponse.success('Tokens refreshed successfully'));
      
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },
  
  logout: async (req, res) => {
    try {
      // Clear refresh token from database
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
      }
      
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      res.json(ApiResponse.success('Logout successful'));
      
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },
  
  getCurrentUser: async (req, res) => {
    try {
      const user = req.user;
      
      const userData = {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        languagePreference: user.languagePreference,
        createdAt: user.createdAt
      };
      
      res.json(ApiResponse.success('User retrieved successfully', userData));
      
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },
  
  updateLanguage: async (req, res) => {
    try {
      const { language } = req.body;
      const user = req.user;
      
      user.languagePreference = language;
      await user.save();
      
      res.json(ApiResponse.success('Language preference updated', { languagePreference: language }));
      
    } catch (error) {
      console.error('Update language error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },
  
  googleAuth: async (req, res) => {
    // To be implemented in next phase
    res.status(501).json(ApiResponse.error('Google OAuth not implemented yet'));
  },
  
  googleCallback: async (req, res) => {
    // To be implemented in next phase
    res.status(501).json(ApiResponse.error('Google OAuth not implemented yet'));
  }
};

module.exports = authController;