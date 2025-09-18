const express = require('express');
const cors = require('cors');
require('dotenv').config();

// importing my route files
const offerRoutes = require('./routes/offer');
const leadsRoutes = require('./routes/leads');
const scoreRoutes = require('./routes/score');
const resultsRoutes = require('./routes/results');

const app = express();
const PORT = process.env.PORT || 3000;

// basic setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// main page
app.get('/', (req, res) => {
  res.json({
    message: 'Lead Scoring API',
    version: '1.0.0',
    endpoints: [
      'POST /api/offer - save product info',
      'POST /api/leads/upload - upload csv file',
      'POST /api/score - score the leads',
      'GET /api/results - get results'
    ],
    note: 'see README for examples'
  });
});

// routes
app.use('/api/offer', offerRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/results', resultsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'not found',
    message: 'wrong url'
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error('error:', err.message);
  res.status(500).json({
    error: 'server error',
    message: 'something went wrong'
  });
});

// start server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  
});

module.exports = app;
