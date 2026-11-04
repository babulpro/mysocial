// This file is for LOCAL development only.
// Vercel uses api/index.js as its entry point instead.
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API base URL: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  });
};

startServer();
