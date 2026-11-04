const { validationResult } = require('express-validator');
const User = require('../models/User');
const { CreateJwtToken } = require('../utils/jwt');

// ─── Helper: Send token response ──────────────────────────────────────────────
const sendTokenResponse = async (user, statusCode, res) => {
  // Use jose-based token creator — passes email + id into the payload
  const token = await CreateJwtToken(user.email, user._id.toString());

  // Set the token on response headers
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('x-auth-token', token);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
    },
  });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────────
/**
 * Register a new user
 * Body: { name, email, password }
 */
const register = async (req, res, next) => {
  try {
    // Check validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user (password gets hashed in pre-save hook)
    const user = await User.create({ name, email, password });

    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
/**
 * Log in an existing user
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password (normally excluded via select: false)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare entered password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
/**
 * Get the currently logged-in user's profile
 * Requires: protect middleware
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id)
      .populate('createdEvents', 'title date status')   // Show created event titles
      .populate('joinedEvents', 'title date status');   // Show joined event titles

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/update-profile ─────────────────────────────────────────────
/**
 * Update logged-in user's profile (name, bio, avatar)
 * Requires: protect middleware
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true, runValidators: true } // Return updated doc and run schema validators
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
