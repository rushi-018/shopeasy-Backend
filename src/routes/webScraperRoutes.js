const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getTrendingProducts,
  getProductDetails,
  searchAmazonProducts,
  searchFlipkartProducts,
  getScraperStatus,
  toggleScrapingMode,
  healthCheck
} = require('../controllers/webScraperController');

// Set CORS helper
const setCors = (req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
};

// Error handling middleware for scraper routes
const handleScraperError = (err, req, res, next) => {
  console.error('❌ Scraper route error:', err);
  setCors(req, res);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Health check
router.get('/health', healthCheck);

// Get scraper status
router.get('/status', getScraperStatus);

// Toggle scraping mode
router.post('/toggle', toggleScrapingMode);

// Search products across multiple platforms
router.get('/search', searchProducts);

// Get trending products
router.get('/trending', getTrendingProducts);

// Get product details from URL
router.get('/product-details', getProductDetails);

// Search Amazon products only
router.get('/amazon', searchAmazonProducts);

// Search Flipkart products only
router.get('/flipkart', searchFlipkartProducts);

// Apply error handling to all routes
router.use(handleScraperError);

module.exports = router;