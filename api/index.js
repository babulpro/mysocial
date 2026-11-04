require('dotenv').config();

let app;
let initError = null;

try {
  app = require('../src/app');
} catch (error) {
  console.error('Initialization error in Express app:', error);
  initError = error;
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      error: 'SERVERLESS_INIT_ERROR',
      message: initError.message,
      stack: initError.stack,
    });
  }

  try {
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      error: 'SERVERLESS_RUNTIME_ERROR',
      message: error.message,
      stack: error.stack,
    });
  }
};
