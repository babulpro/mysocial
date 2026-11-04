require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Initial DB connection failed (will retry on request):', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 API base URL: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  });
};

// Only run listen when started directly (e.g. `node server.js` or `npm run dev`)
// Never run app.listen() when required by Vercel serverless runtime
if (require.main === module) {
  startServer();
}

module.exports = app;
