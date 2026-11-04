/**
 * Global Error Handler Middleware
 * This catches any error passed via next(error) from any route/controller.
 * Always put this LAST in app.js after all routes.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: bad ObjectId (e.g. /events/invalid-id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose: validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // jose JWT errors — note: use `err` not `error`
  if (err.code === 'ERR_JWT_INVALID' || err.code === 'ERR_JWS_INVALID') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.code === 'ERR_JWT_EXPIRED') {
    statusCode = 401;
    message = 'Token expired, please log in again';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace only in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
