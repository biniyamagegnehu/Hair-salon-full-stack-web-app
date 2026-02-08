const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { handleGoogleAuthSuccess } = require('../services/googleOAuth');
const ApiResponse = require('../utils/response');

const authController = {
  // ... existing register, login, refreshTokens, logout methods ...
  
  googleAuth: (req, res, next) => {
    const { passport } = require('../services/googleOAuth');
    
    // Store any state or redirect URL in session
    const state = req.query.redirect || '/';
    const authenticator = passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: JSON.stringify({ redirect: state }),
      prompt: 'select_account'
    });
    
    authenticator(req, res, next);
  },
  
  googleCallback: async (req, res, next) => {
    const { passport } = require('../services/googleOAuth');
    
    passport.authenticate('google', async (err, user) => {
      try {
        if (err) {
          console.error('Google OAuth error:', err);
          // Redirect to frontend with error
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
        
        if (!user) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=user_not_found`);
        }
        
        // Generate tokens and set cookies
        const userData = await handleGoogleAuthSuccess(user, res);
        
        // Parse redirect URL from state
        let redirectUrl = `${process.env.FRONTEND_URL}/`;
        try {
          const state = JSON.parse(req.query.state || '{}');
          if (state.redirect) {
            redirectUrl = `${process.env.FRONTEND_URL}${state.redirect}`;
          }
        } catch (e) {
          console.error('Error parsing state:', e);
        }
        
        // Add user data to redirect URL as query params
        const params = new URLSearchParams({
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          requiresPhoneUpdate: userData.requiresPhoneUpdate
        });
        
        res.redirect(`${redirectUrl}?${params.toString()}`);
        
      } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
      }
    })(req, res, next);
  },
  
  updatePhoneNumber: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const user = req.user;
      
      // Validate Ethiopian phone number
      const ethiopianPhoneRegex = /^\+251[79]\d{8}$/;
      if (!ethiopianPhoneRegex.test(phoneNumber)) {
        return res.status(400).json(
          ApiResponse.error('Invalid Ethiopian phone number format (+251XXXXXXXXX)')
        );
      }
      
      // Check if phone number is already taken
      const existingUser = await User.findOne({ 
        phoneNumber,
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json(
          ApiResponse.error('Phone number already in use')
        );
      }
      
      // Update phone number
      user.phoneNumber = phoneNumber;
      await user.save();
      
      res.json(ApiResponse.success('Phone number updated successfully', {
        phoneNumber: user.phoneNumber
      }));
      
    } catch (error) {
      console.error('Update phone number error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },
  
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);
      
      // Check if user has password (not OAuth only)
      if (!user.password) {
        return res.status(400).json(
          ApiResponse.error('Password change not available for OAuth users')
        );
      }
      
      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json(
          ApiResponse.error('Current password is incorrect')
        );
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      // Invalidate all refresh tokens (optional security measure)
      user.refreshToken = null;
      await user.save();
      
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      res.json(ApiResponse.success('Password changed successfully. Please login again.'));
      
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  }
};

module.exports = authController;