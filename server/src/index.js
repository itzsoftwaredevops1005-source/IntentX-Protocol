/**
 * IntentX Backend Server
 * Wave 2 Demo - Mock API Implementation
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const intentRoutes = require('./routes/intentRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', intentRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IntentX API Server - Wave 2 Demo',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      intents: '/api/intents',
      statistics: '/api/statistics',
    },
    documentation: 'See WAVE2.md for full API documentation',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 IntentX Backend Server Started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('');
  console.log('Available Endpoints:');
  console.log(`  GET  /api/health          - Health check`);
  console.log(`  GET  /api/statistics      - Intent statistics`);
  console.log(`  POST /api/intents         - Create new intent`);
  console.log(`  GET  /api/intents         - Get all intents`);
  console.log(`  GET  /api/intents/pending - Get pending intents`);
  console.log(`  GET  /api/intents/:id     - Get intent by ID`);
  console.log(`  POST /api/intents/:id/execute - Execute intent`);
  console.log(`  POST /api/intents/:id/cancel  - Cancel intent`);
  console.log('');
});

module.exports = app;
