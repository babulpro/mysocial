const mongoose = require('mongoose');

// Cache the connection across serverless function invocations
let cachedConnection = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
  if (!mongoUri) {
    throw new Error('MONGO_DB_URL or MONGODB_URI is not defined in environment variables');
  }

  // If already connected, reuse existing connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    // serverSelectionTimeoutMS: 5000 prevents serverless functions from hanging
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    cachedConnection = conn;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // DO NOT use process.exit(1) on Vercel / serverless!
    throw error;
  }
};

module.exports = connectDB;
