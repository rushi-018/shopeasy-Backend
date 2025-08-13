const webScraperService = require('../services/webScraperService');

// helper to set CORS per-response
const setCors = (req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
};

// Get scraper status
const getScraperStatus = async (req, res) => {
  try {
    console.log('🔍 Scraper status request from:', req.headers.origin);
    setCors(req, res);
    const status = webScraperService.getStatus();
    res.json({
      success: true,
      status: status.isScrapingEnabled ? 'active' : 'fallback',
      mode: status.isScrapingEnabled ? 'live' : 'mock',
      message: status.isScrapingEnabled ? 'Web scraper is active' : 'Web scraper is in fallback mode',
      timestamp: new Date().toISOString(),
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Scraper status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraper status',
      error: error.message
    });
  }
};

// Get trending products
const getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    console.log('🔍 Trending products request from:', req.headers.origin, 'Limit:', limit);
    setCors(req, res);
    console.log('Fetching trending products');
    const products = await webScraperService.getTrendingProducts(parseInt(limit));
    const hasMockData = products.some(product => product.isMock);
    res.json({
      success: true,
      data: products,
      mode: hasMockData ? 'fallback' : 'live',
      message: hasMockData ? 'Using fallback data for trending products' : 'Live trending products',
      count: products.length,
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Trending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending products',
      error: error.message
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    console.log('🔍 Search request from:', req.headers.origin, 'Query:', query);
    setCors(req, res);
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }
    console.log(`Searching for products with query: ${query}`);
    const products = await webScraperService.searchProducts(query, parseInt(limit));
    const hasMockData = products.some(product => product.isMock);
    res.json({
      success: true,
      data: products,
      count: products.length,
      query,
      mode: hasMockData ? 'fallback' : 'live',
      message: hasMockData ? 'Using fallback data due to scraping limitations' : 'Live data from e-commerce platforms',
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};

// Search Amazon products
const searchAmazonProducts = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    console.log('🔍 Amazon search request from:', req.headers.origin, 'Query:', query);
    setCors(req, res);
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }
    console.log(`Searching Amazon for: ${query}`);
    const products = await webScraperService.scrapeAmazonProducts(query, parseInt(limit));
    const hasMockData = products.some(product => product.isMock);
    res.json({
      success: true,
      data: products,
      count: products.length,
      source: 'Amazon',
      query,
      mode: hasMockData ? 'fallback' : 'live',
      message: hasMockData ? 'Using fallback data for Amazon products' : 'Live Amazon products',
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Amazon search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search Amazon products',
      error: error.message
    });
  }
};

// Search Flipkart products
const searchFlipkartProducts = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    console.log('🔍 Flipkart search request from:', req.headers.origin, 'Query:', query);
    setCors(req, res);
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }
    console.log(`Searching Flipkart for: ${query}`);
    const products = await webScraperService.scrapeFlipkartProducts(query, parseInt(limit));
    const hasMockData = products.some(product => product.isMock);
    res.json({
      success: true,
      data: products,
      count: products.length,
      source: 'Flipkart',
      query,
      mode: hasMockData ? 'fallback' : 'live',
      message: hasMockData ? 'Using fallback data for Flipkart products' : 'Live Flipkart products',
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Flipkart search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search Flipkart products',
      error: error.message
    });
  }
};

// Get product details
const getProductDetails = async (req, res) => {
  try {
    const { url } = req.query;
    console.log('🔍 Product details request from:', req.headers.origin, 'URL:', url);
    setCors(req, res);
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }
    console.log(`Getting product details from: ${url}`);
    let productDetails;
    if (url.includes('amazon.in')) {
      productDetails = await webScraperService.scrapeAmazonProductDetails(url);
    } else if (url.includes('flipkart.com')) {
      productDetails = await webScraperService.scrapeFlipkartProductDetails(url);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported website. Only Amazon.in and Flipkart.com are supported'
      });
    }
    if (!productDetails) {
      return res.status(404).json({
        success: false,
        message: 'Product details not found'
      });
    }
    res.json({
      success: true,
      data: productDetails,
      mode: productDetails.isMock ? 'fallback' : 'live',
      message: productDetails.isMock ? 'Using fallback data for product details' : 'Live product details',
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product details',
      error: error.message
    });
  }
};

// Toggle scraping mode
const toggleScrapingMode = async (req, res) => {
  try {
    const { enabled } = req.body;
    console.log('🔍 Toggle scraping mode request from:', req.headers.origin);
    setCors(req, res);
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'enabled parameter must be a boolean'
      });
    }
    webScraperService.setScrapingEnabled(enabled);
    res.json({
      success: true,
      message: `Web scraping ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        scrapingEnabled: enabled,
        mode: enabled ? 'live' : 'fallback'
      },
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Toggle scraping mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle scraping mode',
      error: error.message
    });
  }
};

// Health check
const healthCheck = async (req, res) => {
  try {
    const status = webScraperService.getStatus();
    console.log('🔍 Scraper health check from:', req.headers.origin);
    setCors(req, res);
    res.json({
      success: true,
      data: {
        service: 'web-scraper',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        scraping: {
          enabled: status.isScrapingEnabled,
          initialized: status.isInitialized,
          browserConnected: status.browserConnected
        }
      },
      cors: 'Working'
    });
  } catch (error) {
    console.error('❌ Scraper health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

module.exports = {
  getScraperStatus,
  getTrendingProducts,
  searchProducts,
  searchAmazonProducts,
  searchFlipkartProducts,
  getProductDetails,
  toggleScrapingMode,
  healthCheck
}; 