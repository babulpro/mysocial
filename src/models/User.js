const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * - Stores basic user info
 * - Password is hashed before saving (pre-save hook)
 * - Compatible with better-auth on the frontend
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,           // No duplicate emails
      lowercase: true,        // Always store as lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,          // Never return password in queries by default
    },
    avatar: {
      type: String,
      default: '',            // URL to profile picture
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Events this user has created
    createdEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    // Events this user has joined
    joinedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Pre-save Hook ─────────────────────────────────────────────────────────────
// Before saving, hash the password if it was modified
userSchema.pre('save', async function (next) {
  // Only hash when password field is new or changed
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds = strong hashing
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method ───────────────────────────────────────────────────────────
// Compare entered password with stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
