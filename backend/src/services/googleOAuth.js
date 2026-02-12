// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');
// const { generateTokens } = require('../utils/jwt');

// // Configure Passport Google Strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     passReqToCallback: true
//   },
//   async (req, accessToken, refreshToken, profile, done) => {
//     try {
//       // Check if user exists by Google ID
//       let user = await User.findOne({ googleId: profile.id });
      
//       if (!user) {
//         // Check if user exists by email
//         user = await User.findOne({ email: profile.emails[0].value });
        
//         if (user) {
//           // Link Google account to existing user
//           user.googleId = profile.id;
//           await user.save();
//         } else {
//           // Create new user with Google OAuth
//           // Generate Ethiopian phone number placeholder (user must update later)
//           const ethiopianPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
          
//           user = await User.create({
//             email: profile.emails[0].value,
//             phoneNumber: ethiopianPhone,
//             fullName: profile.displayName,
//             googleId: profile.id,
//             role: 'CUSTOMER',
//             isVerified: true
//           });
//         }
//       }
      
//       return done(null, user);
//     } catch (error) {
//       return done(error, null);
//     }
//   }
// ));

// // Serialize user for session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // Deserialize user from session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // Generate tokens and set cookies for OAuth users
// const handleGoogleAuthSuccess = async (user, res) => {
//   // Generate tokens
//   const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  
//   // Save refresh token to user
//   user.refreshToken = refreshToken;
//   user.lastLogin = new Date();
//   await user.save();
  
//   // Set tokens in HttpOnly cookies
//   res.cookie('accessToken', accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//     maxAge: 15 * 60 * 1000
//   });
  
//   res.cookie('refreshToken', refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//     maxAge: 7 * 24 * 60 * 60 * 1000
//   });
  
//   // Set CSRF token
//   const { generateCsrfToken } = require('../utils/jwt');
//   const csrfToken = generateCsrfToken();
  
//   res.cookie('csrf-token', csrfToken, {
//     httpOnly: false,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//     maxAge: 24 * 60 * 60 * 1000
//   });
  
//   return {
//     id: user._id,
//     email: user.email,
//     phoneNumber: user.phoneNumber,
//     fullName: user.fullName,
//     role: user.role,
//     languagePreference: user.languagePreference,
//     requiresPhoneUpdate: !user.phoneNumber.startsWith('+251') || user.phoneNumber.includes('placeholder')
//   };
// };

// module.exports = { passport, handleGoogleAuthSuccess };