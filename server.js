require('dotenv').config(); // Load .env FIRST before anything else
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API base URL: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  });
};

startServer();

// Export app for Vercel serverless runtime
module.exports = app;
