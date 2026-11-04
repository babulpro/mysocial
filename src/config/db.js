const mongoose = require('mongoose');

// Cache the connection across serverless function invocations.
// On Vercel, each request may reuse a warm Lambda — this prevents
// opening a new MongoDB connection on every single request.
let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URL);
    cachedConnection = conn;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
