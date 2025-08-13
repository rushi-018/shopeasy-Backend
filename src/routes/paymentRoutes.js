const express = require('express')
const router = express.Router()
const { createOrder, verifyPayment, getPaymentHistory } = require('../controllers/paymentController')
// const { protect } = require('../middleware/authMiddleware')

// Payment routes
router.post('/create-order', createOrder)
router.post('/verify-payment', verifyPayment)
router.get('/payment-history', getPaymentHistory)

module.exports = router 