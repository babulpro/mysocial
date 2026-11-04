const mongoose = require('mongoose');

/**
 * Event Schema
 * - A user (organizer) creates an event
 * - Other users can join (attendees array)
 * - Supports max capacity and event status
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // Who created this event
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // List of users who joined
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    // Max number of people who can join (0 = unlimited)
    maxAttendees: {
      type: Number,
      default: 0,
      min: [0, 'Max attendees cannot be negative'],
    },
    category: {
      type: String,
      enum: ['social', 'sports', 'education', 'music', 'food', 'tech', 'art', 'other'],
      default: 'other',
    },
    // Cover image URL for the event
    coverImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    isPublic: {
      type: Boolean,
      default: true,          // Public events visible to everyone
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    // Virtual fields (like attendee count) are included in JSON responses
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual Field ─────────────────────────────────────────────────────────────
// attendeeCount is calculated on the fly — not stored in DB
eventSchema.virtual('attendeeCount').get(function () {
  return Array.isArray(this.attendees) ? this.attendees.length : 0;
});

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Speed up common searches
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
