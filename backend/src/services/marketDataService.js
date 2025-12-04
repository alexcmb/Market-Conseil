const axios = require('axios');
const { CATEGORIES, getAssetInfo, getCategoryBySymbol } = require('../config/categories');

class MarketDataService {
  constructor() {
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    this.baseUrl = 'https://www.alphavantage.co/query';
  }

  async getStockQuote(symbol) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.alphaVantageApiKey
        }
      });

      const data = response.data['Global Quote'];
      if (!data || Object.keys(data).length === 0) {
        // Fallback to demo data if API limit reached
        return this.getDemoQuote(symbol);
      }

      return {
        symbol: data['01. symbol'],
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent']?.replace('%', '')),
        volume: parseInt(data['06. volume']),
        previousClose: parseFloat(data['08. previous close']),
        open: parseFloat(data['02. open']),
        high: parseFloat(data['03. high']),
        low: parseFloat(data['04. low'])
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      return this.getDemoQuote(symbol);
    }
  }

  async getTechnicalIndicators(symbol) {
    try {
      // Get RSI
      const rsiResponse = await axios.get(this.baseUrl, {
        params: {
          function: 'RSI',
          symbol: symbol,
          interval: 'daily',
          time_period: 14,
          series_type: 'close',
          apikey: this.alphaVantageApiKey
        }
      });

      // Get SMA 20
      const sma20Response = await axios.get(this.baseUrl, {
        params: {
          function: 'SMA',
          symbol: symbol,
          interval: 'daily',
          time_period: 20,
          series_type: 'close',
          apikey: this.alphaVantageApiKey
        }
      });

      // Get SMA 50
      const sma50Response = await axios.get(this.baseUrl, {
        params: {
          function: 'SMA',
          symbol: symbol,
          interval: 'daily',
          time_period: 50,
          series_type: 'close',
          apikey: this.alphaVantageApiKey
        }
      });

      // Get MACD
      const macdResponse = await axios.get(this.baseUrl, {
        params: {
          function: 'MACD',
          symbol: symbol,
          interval: 'daily',
          series_type: 'close',
          apikey: this.alphaVantageApiKey
        }
      });

      const rsiData = rsiResponse.data['Technical Analysis: RSI'];
      const sma20Data = sma20Response.data['Technical Analysis: SMA'];
      const sma50Data = sma50Response.data['Technical Analysis: SMA'];
      const macdData = macdResponse.data['Technical Analysis: MACD'];

      // Get latest values
      const latestRsi = rsiData ? parseFloat(Object.values(rsiData)[0]?.RSI) : null;
      const latestSma20 = sma20Data ? parseFloat(Object.values(sma20Data)[0]?.SMA) : null;
      const latestSma50 = sma50Data ? parseFloat(Object.values(sma50Data)[0]?.SMA) : null;
      const latestMacd = macdData ? parseFloat(Object.values(macdData)[0]?.MACD) : null;

      if (!latestRsi && !latestSma20 && !latestMacd) {
        return this.getDemoIndicators();
      }

      return {
        rsi: latestRsi,
        sma20: latestSma20,
        sma50: latestSma50,
        macd: latestMacd
      };
    } catch (error) {
      console.error(`Error fetching indicators for ${symbol}:`, error.message);
      return this.getDemoIndicators();
    }
  }

  getDemoQuote(symbol) {
    // Generate realistic demo data
    const basePrice = this.getBasePriceForSymbol(symbol);
    const change = (Math.random() - 0.5) * basePrice * 0.05;
    
    return {
      symbol: symbol,
      price: basePrice + change,
      change: change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      previousClose: basePrice,
      open: basePrice + (Math.random() - 0.5) * 2,
      high: basePrice + Math.abs(change) + Math.random() * 2,
      low: basePrice - Math.abs(change) - Math.random() * 2
    };
  }

  getDemoIndicators() {
    return {
      rsi: 30 + Math.random() * 40, // RSI between 30-70
      sma20: 150 + Math.random() * 10,
      sma50: 148 + Math.random() * 10,
      macd: (Math.random() - 0.5) * 5
    };
  }

  getBasePriceForSymbol(symbol) {
    const assetInfo = getAssetInfo(symbol);
    if (assetInfo) {
      return assetInfo.basePrice;
    }
    return 100 + Math.random() * 100;
  }

  getWatchlist(categoryId = null) {
    if (categoryId) {
      for (const category of Object.values(CATEGORIES)) {
        if (category.id === categoryId) {
          return Object.keys(category.assets);
        }
      }
    }
    // Return all symbols from all categories
    return Object.values(CATEGORIES).flatMap(cat => Object.keys(cat.assets));
  }

  getCategoryInfo(symbol) {
    return getCategoryBySymbol(symbol);
  }
}

module.exports = new MarketDataService();
