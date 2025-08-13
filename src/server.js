const express = require('express')
const { errorHandler } = require('./middleware/errorHandler')
const uploadRoutes = require('./routes/upload')
const profileRoutes = require('./routes/profile')
const paymentRoutes = require('./routes/paymentRoutes')
const productRoutes = require('./routes/products')
const storeRoutes = require('./routes/stores')
const authRoutes = require('./routes/auth')
const webScraperRoutes = require('./routes/webScraperRoutes')

console.log('🚀 Starting server...')
console.log('🔧 Environment:', process.env.NODE_ENV || 'development')

// Database connection disabled for now
console.log('📊 MongoDB connection disabled - server running without database')

const app = express()

// Body parsers
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// BULLETPROOF CORS - APPLY TO EVERY SINGLE REQUEST
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin || ''
  console.log(`🌐 ${req.method} ${req.path} from ${requestOrigin}`)

  // Echo the Origin for credentialed requests (never use "*")
  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours

  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request handled')
    res.status(204).end()
    return
  }

  next()
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  const requestOrigin = req.headers.origin || ''
  console.log('🔍 Health check request from:', requestOrigin)

  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not Configured',
    cors: 'BULLETPROOF CORS - ALL ORIGINS ALLOWED',
    origin: requestOrigin,
    message: 'Backend is running with aggressive CORS'
  })
})

// Test scraper endpoint
app.get('/api/scraper/test', (req, res) => {
  const requestOrigin = req.headers.origin || ''
  console.log('🧪 Scraper test endpoint hit from:', requestOrigin)

  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  res.json({
    status: 'OK',
    message: 'Scraper routes are accessible',
    cors: 'Working',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api', paymentRoutes)
app.use('/api/scraper', webScraperRoutes)

// Error Handler
app.use(errorHandler)

// Export serverless function handler for Vercel
module.exports = (req, res) => app(req, res)