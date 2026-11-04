const User = require('../models/User');
const { DecodedJwtToken } = require('../utils/jwt');

/**
 * protect middleware
 * Verifies the JWT token using jose (DecodedJwtToken).
 * Attaches the logged-in user object to req.user.
 * Usage: add protect before any route that needs authentication.
 */
const protect = async (req, res, next) => {
  let token;

  // Token comes in the header as: "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // DecodedJwtToken verifies signature + expiry using jose
    // Returns payload: { email, id, iat, exp, iss }
    const payload = await DecodedJwtToken(token);

    // Fetch the user from DB using the id stored in the token payload
    req.user = await User.findById(payload.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next(); // ✅ User is authenticated, continue to the route
  } catch (error) {
    // jose throws descriptive errors for expired/invalid tokens
    if (error.code === 'ERR_JWT_EXPIRED') {
      return res.status(401).json({ success: false, message: 'Token expired, please log in again' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

/**
 * adminOnly middleware
 * Use AFTER protect to restrict route to admin users only.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access only' });
  }
};

module.exports = { protect, adminOnly };
