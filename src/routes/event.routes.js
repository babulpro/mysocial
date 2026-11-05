const express = require('express');
const { body } = require('express-validator');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getMyEvents,
} = require('../controllers/event.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// ─── Validation Rules ──────────────────────────────────────────────────────────
const createEventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date (ISO 8601 format)')
    .custom((value) => {
      const eventDate = new Date(value);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (isNaN(eventDate.getTime()) || eventDate < fiveMinutesAgo) {
        throw new Error('Event date cannot be in the past. Please select today or a future date.');
      }
      return true;
    }),
];

// ─── Routes ────────────────────────────────────────────────────────────────────

// Public routes (no login needed)
router.get('/', getAllEvents);                     // GET /api/events

// Protected routes (login required)
// ⚠️ IMPORTANT: specific named routes MUST come before /:id wildcard routes
// otherwise Express matches "my-events" as an :id parameter
router.get('/user/my-events', protect, getMyEvents);       // GET /api/events/user/my-events
router.post('/', protect, createEventValidation, createEvent); // POST /api/events

// Wildcard :id routes — must come AFTER all named routes
router.get('/:id', getEventById);                           // GET /api/events/:id
router.put('/:id', protect, updateEvent);                   // PUT /api/events/:id
router.delete('/:id', protect, deleteEvent);                // DELETE /api/events/:id
router.post('/:id/join', protect, joinEvent);               // POST /api/events/:id/join
router.post('/:id/leave', protect, leaveEvent);             // POST /api/events/:id/leave

module.exports = router;
