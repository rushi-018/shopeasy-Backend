const express = require('express')
const router = express.Router()
const { createOrder, verifyPayment, getPaymentHistory } = require('../controllers/paymentController')
const { requireAuth } = require('../middleware/clerk')
const { attachDbUser } = require('../middleware/roles')

// Payment routes
router.post('/create-order', createOrder)
router.post('/verify-payment', verifyPayment)
router.get('/payment-history', requireAuth, attachDbUser, getPaymentHistory)

module.exports = router 