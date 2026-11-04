const mongoose = require('mongoose');
const User = require('../models/User');
const { DecodedJwtToken } = require('../utils/jwt');

/**
 * protect middleware
 * Supports:
 * 1. Better-Auth session (forwarded securely via x-user-* headers from Next.js server)
 * 2. JWT Bearer token / x-auth-token
 */
const protect = async (req, res, next) => {
  try {
    // 1. Check Better-Auth forwarded session
    const betterAuthUserId = req.headers['x-user-id'];
    const betterAuthUserEmail = req.headers['x-user-email'];
    const betterAuthUserName = req.headers['x-user-name'];

    if (betterAuthUserId) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(betterAuthUserId)) {
        user = await User.findById(betterAuthUserId);
      }
      if (!user && betterAuthUserEmail) {
        user = await User.findOne({ email: betterAuthUserEmail.toLowerCase() });
      }

      // If user document doesn't exist yet in Mongoose, create it
      if (!user) {
        user = await User.create({
          ...(mongoose.Types.ObjectId.isValid(betterAuthUserId) ? { _id: betterAuthUserId } : {}),
          name: betterAuthUserName || 'User',
          email: betterAuthUserEmail || `user_${betterAuthUserId}@social.local`,
          password: 'better_auth_social_user_password',
        });
      }

      req.user = user;
      return next();
    }

    // 2. Check JWT Authorization Header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no session or token provided' });
    }

    // DecodedJwtToken verifies signature + expiry using jose
    const payload = await DecodedJwtToken(token);

    req.user = await User.findById(payload.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return res.status(401).json({ success: false, message: 'Token expired, please log in again' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized, invalid authentication' });
  }
};

/**
 * adminOnly middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access only' });
  }
};

module.exports = { protect, adminOnly };
