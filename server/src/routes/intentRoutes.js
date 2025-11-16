/**
 * Intent Routes
 * Define API endpoints for intent operations
 */

const express = require('express');
const router = express.Router();
const intentController = require('../controllers/intentController');

// Health check
router.get('/health', intentController.healthCheck);

// Statistics
router.get('/statistics', intentController.getStatistics);

// Intent operations
router.post('/intents', intentController.createIntent);
router.get('/intents', intentController.getAllIntents);
router.get('/intents/pending', intentController.getPendingIntents);
router.get('/intents/:id', intentController.getIntentById);
router.get('/intents/user/:userAddress', intentController.getIntentsByUser);
router.post('/intents/:id/execute', intentController.executeIntent);
router.post('/intents/:id/cancel', intentController.cancelIntent);

module.exports = router;
