// Asset categories and their symbols configuration
const CATEGORIES = {
  CRYPTO: {
    id: 'crypto',
    name: 'Cryptomonnaies',
    icon: '₿',
    color: '#f7931a',
    assets: {
      'BTC': { name: 'Bitcoin', basePrice: 43000 },
      'ETH': { name: 'Ethereum', basePrice: 2300 },
      'SOL': { name: 'Solana', basePrice: 95 }
    }
  },
  STOCKS: {
    id: 'stocks',
    name: 'Actions',
    icon: '📈',
    color: '#00f5ff',
    assets: {
      'AAPL': { name: 'Apple', basePrice: 175 },
      'GOOGL': { name: 'Google', basePrice: 140 },
      'MSFT': { name: 'Microsoft', basePrice: 370 },
      'AMZN': { name: 'Amazon', basePrice: 150 },
      'TSLA': { name: 'Tesla', basePrice: 240 },
      'META': { name: 'Meta', basePrice: 330 },
      'NVDA': { name: 'Nvidia', basePrice: 470 }
    }
  },
  ETF: {
    id: 'etf',
    name: 'ETF',
    icon: '📊',
    color: '#ff00ff',
    assets: {
      'SPY': { name: 'SPDR S&P 500 ETF', basePrice: 450 },
      'QQQ': { name: 'Invesco QQQ Trust', basePrice: 380 },
      'VTI': { name: 'Vanguard Total Stock Market', basePrice: 220 },
      'IWDA': { name: 'iShares MSCI World', basePrice: 78 }
    }
  },
  INDICES: {
    id: 'indices',
    name: 'Indices',
    icon: '🌍',
    color: '#00ff88',
    assets: {
      'SPX': { name: 'S&P 500', basePrice: 4500 },
      'MSCIWORLD': { name: 'MSCI World', basePrice: 3200 },
      'DJI': { name: 'Dow Jones Industrial', basePrice: 35000 },
      'IXIC': { name: 'NASDAQ Composite', basePrice: 14000 }
    }
  }
};

// Get category by asset symbol
const getCategoryBySymbol = (symbol) => {
  for (const [categoryKey, category] of Object.entries(CATEGORIES)) {
    if (category.assets[symbol]) {
      return category;
    }
  }
  return CATEGORIES.STOCKS; // Default to stocks
};

// Get all symbols in a category
const getSymbolsByCategory = (categoryId) => {
  for (const category of Object.values(CATEGORIES)) {
    if (category.id === categoryId) {
      return Object.keys(category.assets);
    }
  }
  return [];
};

// Get all categories for frontend
const getAllCategories = () => {
  return Object.values(CATEGORIES).map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    symbols: Object.entries(cat.assets).map(([symbol, info]) => ({
      symbol,
      name: info.name
    }))
  }));
};

// Get random symbol from category
const getRandomSymbolFromCategory = (categoryId = null) => {
  if (categoryId) {
    const symbols = getSymbolsByCategory(categoryId);
    return symbols[Math.floor(Math.random() * symbols.length)];
  }
  // Random from all categories
  const allSymbols = Object.values(CATEGORIES).flatMap(cat => Object.keys(cat.assets));
  return allSymbols[Math.floor(Math.random() * allSymbols.length)];
};

// Get asset info
const getAssetInfo = (symbol) => {
  for (const category of Object.values(CATEGORIES)) {
    if (category.assets[symbol]) {
      return {
        symbol,
        ...category.assets[symbol],
        category: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        categoryIcon: category.icon
      };
    }
  }
  return null;
};

module.exports = {
  CATEGORIES,
  getCategoryBySymbol,
  getSymbolsByCategory,
  getAllCategories,
  getRandomSymbolFromCategory,
  getAssetInfo
};
