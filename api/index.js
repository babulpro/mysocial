require('dotenv').config();
const connectDB = require('../src/config/db');
const app = require('../src/app');

// This is the Vercel serverless handler.
// Vercel calls this function on every request — NOT app.listen().
// We await DB connection BEFORE passing the request to Express.
module.exports = async (req, res) => {
  await connectDB(); // Safe to call multiple times — cached after first connect
  return app(req, res);
};
