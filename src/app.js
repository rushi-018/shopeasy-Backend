const express = require('express')
const app = express()
const paymentRoutes = require('./routes/paymentRoutes')

// Add payment routes
app.use('/api', paymentRoutes)

// ... rest of the code ... 