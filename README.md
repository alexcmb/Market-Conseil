# Market-Conseil

**AI-Powered Financial Advisor with Self-Learning Capabilities**

A MERN stack application featuring an avant-garde black/neon design that provides daily AI-generated financial advice (Buy/Sell/Hold) using real market data.

![Market Conseil](https://img.shields.io/badge/MERN-Stack-00f5ff?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-ff00ff?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Powered-00ff88?style=for-the-badge)

## ✨ Features

- **AI-Generated Financial Advice**: Daily Buy/Sell/Hold recommendations with confidence scores
- **Real Market Data Integration**: Alpha Vantage API for live stock data
- **Technical Analysis**: RSI, MACD, SMA crossovers, volume analysis, and momentum tracking
- **Self-Learning AI**: Automatically evaluates past advice and adjusts strategy weights
- **Performance Tracking**: Success rate, average score, and outcome distribution
- **Avant-Garde UI**: Black/neon cyberpunk design with smooth animations
- **Fully Dockerized**: Ready for deployment with Docker Compose

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Axios** for API calls
- **Node-cron** for scheduled tasks

### Frontend
- **React 18** with hooks
- **Chart.js** for data visualization
- **CSS3** with custom neon design system

### DevOps
- **Docker** & **Docker Compose**
- **Nginx** reverse proxy

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/alexcmb/Market-Conseil.git
cd Market-Conseil

# Set up environment variables (optional)
export ALPHA_VANTAGE_API_KEY=your_api_key

# Start all services
docker compose up -d

# Access the application at http://localhost
```

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/advice/generate` | Generate new AI advice |
| GET | `/api/advice/latest` | Get latest advice |
| GET | `/api/advice/history` | Get advice history |
| POST | `/api/advice/evaluate` | Evaluate past advice performance |
| GET | `/api/advice/performance` | Get performance statistics |
| GET | `/api/health` | Health check |

## 🧠 AI Strategy

The AI advisor uses a weighted scoring system to generate recommendations:

| Indicator | Default Weight | Description |
|-----------|---------------|-------------|
| RSI | 20% | Relative Strength Index (overbought/oversold) |
| MACD | 25% | Moving Average Convergence Divergence |
| Trend | 25% | SMA 20/50 crossover analysis |
| Volume | 15% | Volume confirmation signals |
| Momentum | 15% | Daily price momentum |

### Self-Learning

The system automatically:
1. Evaluates advice after 24 hours
2. Calculates performance scores
3. Adjusts strategy weights based on success rate
4. Maintains a learning history log

## 🎨 Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Neon Cyan | `#00f5ff` | Primary accent |
| Neon Magenta | `#ff00ff` | Secondary accent |
| Neon Green | `#00ff88` | Success/Buy |
| Neon Red | `#ff3366` | Danger/Sell |
| Neon Yellow | `#ffff00` | Warning/Hold |

## 📁 Project Structure

```
Market-Conseil/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.js        # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key

#### Frontend
- `REACT_APP_API_URL` - Backend API URL

## 📈 Scheduled Tasks

| Schedule | Task |
|----------|------|
| 9:30 AM (Mon-Fri) | Generate daily advice |
| 4:30 PM (Mon-Fri) | Evaluate past advice |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ and ⚡ neon lights