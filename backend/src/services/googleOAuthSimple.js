const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateTokens } = require('../utils/jwt');
const crypto = require('crypto');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      verified: payload.email_verified
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
};

const handleGoogleAuth = async (googleUser, res) => {
  try {
    let user = await User.findOne({ googleId: googleUser.googleId });
    
    if (!user) {
      // Check if user exists by email
      user = await User.findOne({ email: googleUser.email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleUser.googleId;
        await user.save();
      } else {
        // Create new user with Google OAuth
        const ethiopianPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
        
        user = await User.create({
          email: googleUser.email,
          phoneNumber: ethiopianPhone,
          fullName: googleUser.name,
          googleId: googleUser.googleId,
          role: 'CUSTOMER',
          isVerified: true
        });
      }
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
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
    
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    return {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      role: user.role,
      languagePreference: user.languagePreference,
      requiresPhoneUpdate: !user.phoneNumber.startsWith('+251') || user.phoneNumber.includes('placeholder')
    };
    
  } catch (error) {
    console.error('Google auth handling error:', error);
    throw error;
  }
};

module.exports = { verifyGoogleToken, handleGoogleAuth };