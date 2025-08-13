const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const paymentRoutes = require('./src/routes/paymentRoutes')
const authRoutes = require('./src/routes/authRoutes')

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', paymentRoutes)

// Start server first
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 

// MongoDB connection disabled for now due to connection issues
console.log('MongoDB connection disabled - server running without database') 