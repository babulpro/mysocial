const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');

// ─── POST /api/events ─────────────────────────────────────────────────────────
/**
 * Create a new event
 * Requires: protect middleware
 */
const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, location, date, endDate, maxAttendees, category, coverImage, isPublic, tags } = req.body;

    // Create event with the logged-in user as organizer
    const event = await Event.create({
      title,
      description,
      location,
      date,
      endDate,
      maxAttendees,
      category,
      coverImage,
      isPublic,
      tags,
      organizer: req.user.id,
    });

    // Add this event to the user's createdEvents list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdEvents: event._id },
    });

    // Populate organizer info before returning
    await event.populate('organizer', 'name email avatar');

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/events ──────────────────────────────────────────────────────────
/**
 * Get all public events (with filtering, sorting, pagination)
 * Query params: category, status, page, limit, sort
 */
const getAllEvents = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 10, sort = '-date' } = req.query;

    // Build the filter object dynamically
    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const total = await Event.countDocuments(filter);

    const events = await Event.find(filter)
      .populate('organizer', 'name avatar')           // Show organizer's name and avatar
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      events,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/events/:id ──────────────────────────────────────────────────────
/**
 * Get a single event by ID with full details
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar bio')
      .populate('attendees', 'name avatar');     // Show who joined

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/events/:id ──────────────────────────────────────────────────────
/**
 * Update an event (only the organizer can do this)
 * Requires: protect middleware
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only organizer or admin can update
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('organizer', 'name avatar');

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────
/**
 * Delete an event (only the organizer or admin)
 * Requires: protect middleware
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only organizer or admin can delete
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    // Remove from organizer's createdEvents list
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { createdEvents: event._id },
    });

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/events/:id/join ────────────────────────────────────────────────
/**
 * Join an event
 * Requires: protect middleware
 */
const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const userId = req.user.id;

    // Can't join your own event
    if (event.organizer.toString() === userId) {
      return res.status(400).json({ success: false, message: 'You cannot join your own event' });
    }

    // Check if already joined
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already joined this event' });
    }

    // Check if event is full (maxAttendees = 0 means unlimited)
    if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    // Check if event is cancelled or completed
    if (['cancelled', 'completed'].includes(event.status)) {
      return res.status(400).json({ success: false, message: `Cannot join a ${event.status} event` });
    }

    // Add user to event attendees
    event.attendees.push(userId);
    await event.save();

    // Add event to user's joinedEvents list
    await User.findByIdAndUpdate(userId, {
      $push: { joinedEvents: event._id },
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the event',
      attendeeCount: event.attendees.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/events/:id/leave ───────────────────────────────────────────────
/**
 * Leave an event
 * Requires: protect middleware
 */
const leaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const userId = req.user.id;

    // Check if user actually joined
    if (!event.attendees.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have not joined this event' });
    }

    // Remove user from attendees
    event.attendees = event.attendees.filter((id) => id.toString() !== userId);
    await event.save();

    // Remove event from user's joinedEvents
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedEvents: event._id },
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left the event',
      attendeeCount: event.attendees.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/events/my-events ────────────────────────────────────────────────
/**
 * Get all events created by the logged-in user
 * Requires: protect middleware
 */
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getMyEvents,
};
