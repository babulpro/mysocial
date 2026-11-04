require('dotenv').config();
const app = require('../src/app');

// Vercel serverless function entrypoint
// Export the Express app directly
module.exports = app;
