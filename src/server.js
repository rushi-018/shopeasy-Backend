require('dotenv').config()
const express = require('express')
const { errorHandler } = require('./middleware/errorHandler')
const uploadRoutes = require('./routes/upload')
const profileRoutes = require('./routes/profile')
const paymentRoutes = require('./routes/paymentRoutes')
const productRoutes = require('./routes/products')
const storeRoutes = require('./routes/stores')
const authRoutes = require('./routes/auth')
const webScraperRoutes = require('./routes/webScraperRoutes')
const cartRoutes = require('./routes/cart')
const clerkRoutes = require('./routes/clerkRoutes')
const orderRoutes = require('./routes/orders')
const wishlistRoutes = require('./routes/wishlist')

console.log('🚀 Starting server...')
console.log('🔧 Environment:', process.env.NODE_ENV || 'development')

// Connect to MongoDB
const connectDB = require('./config/db')
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopeasy'
console.log('📊 Attempting to connect to MongoDB with URI:', mongoURI.replace(/:([^:@]+)@/, ':****@'))
connectDB()
  .then(() => console.log('📊 MongoDB connected successfully'))
  .catch(err => {
    console.error('📊 MongoDB connection error:', err.message)
    console.warn('⚠️ Continuing without database connection - some features will be unavailable')
  })

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
app.use('/api/clerk', clerkRoutes)
app.use('/api/products', productRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api', paymentRoutes)
app.use('/api/scraper', webScraperRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/wishlist', wishlistRoutes)

// Error Handler
app.use(errorHandler)

// Start the server if not being imported for serverless
if (require.main === module) {
  const PORT = process.env.PORT || 5000
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌎 API available at http://localhost:${PORT}/api`)
    console.log(`🧪 Health check: http://localhost:${PORT}/api/health`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const newPort = PORT + 1
      console.log(`⚠️ Port ${PORT} is in use, trying port ${newPort}`)
      const newServer = app.listen(newPort, () => {
        console.log(`🚀 Server running on alternate port ${newPort}`)
        console.log(`🌎 API available at http://localhost:${newPort}/api`)
        console.log(`🧪 Health check: http://localhost:${newPort}/api/health`)
      })
    } else {
      console.error('❌ Server failed to start:', err)
    }
  })
}

// Export serverless function handler for Vercel
module.exports = app