const express = require('express');
const router = express.Router();
const adviceController = require('../controllers/adviceController');

// Generate new advice
router.post('/generate', adviceController.generateAdvice);

// Get advice history
router.get('/history', adviceController.getHistory);

// Get latest advice
router.get('/latest', adviceController.getLatest);

// Evaluate past advice
router.post('/evaluate', adviceController.evaluateAdvice);

// Get performance stats
router.get('/performance', adviceController.getPerformance);

// Get advice by ID
router.get('/:id', adviceController.getById);

module.exports = router;
