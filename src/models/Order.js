const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  image: String
}, { _id: false })

const orderSchema = new mongoose.Schema({
  clerkId: { type: String, index: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  payment: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' }
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
