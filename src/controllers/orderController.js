const Order = require('../models/Order')
const User = require('../models/User')

// Save an order after successful Razorpay verification
exports.createOrder = async (req, res) => {
  try {
    const { items, amount, currency = 'INR', payment } = req.body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' })
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' })
    }
    if (!payment || !payment.razorpay_order_id || !payment.razorpay_payment_id || !payment.razorpay_signature) {
      return res.status(400).json({ message: 'Payment details are incomplete' })
    }

    // Attach DB user
    const dbUser = req.dbUser

    const order = await Order.create({
      clerkId: req.user.id,
      user: dbUser?._id,
      items,
      amount,
      currency,
      payment: {
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
        status: 'paid'
      }
    })

    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

// List orders for current user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ clerkId: req.user.id })
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}