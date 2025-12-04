require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./config/database');
const adviceRoutes = require('./routes/adviceRoutes');
const aiAdvisorService = require('./services/aiAdvisorService');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', limiter);

// Routes
app.use('/api/advice', adviceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize AI Advisor
    await aiAdvisorService.initialize();
    console.log('AI Advisor initialized');

    // Schedule daily advice generation at 9:30 AM (market open)
    cron.schedule('30 9 * * 1-5', async () => {
      console.log('Generating daily advice...');
      try {
        const advice = await aiAdvisorService.generateDailyAdvice();
        console.log(`Generated advice: ${advice.action} ${advice.symbol} with ${advice.confidence}% confidence`);
      } catch (error) {
        console.error('Failed to generate daily advice:', error);
      }
    });

    // Schedule advice evaluation at 4:30 PM (after market close)
    cron.schedule('30 16 * * 1-5', async () => {
      console.log('Evaluating past advice...');
      try {
        const results = await aiAdvisorService.evaluatePastAdvice();
        console.log(`Evaluated ${results.length} advice records`);
      } catch (error) {
        console.error('Failed to evaluate advice:', error);
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
