const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');

// Get available analysis prompts
router.get('/prompts', promptController.getPrompts);

// Create a new prompt
router.post('/prompts', promptController.createPrompt);

// Update an existing prompt
router.put('/prompts/:id', promptController.updatePrompt);

// Analyze with a specific prompt
router.post('/analyze', promptController.analyzeWithPrompt);

// Real-time analysis with optional query
router.post('/realtime', promptController.analyzeRealTime);

// Self-correct a previous advice
router.post('/correct/:adviceId', promptController.selfCorrect);

// Get correction history
router.get('/corrections', promptController.getCorrectionHistory);

module.exports = router;
