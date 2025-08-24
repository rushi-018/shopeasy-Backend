const Razorpay = require('razorpay')
const crypto = require('crypto')

// Check Razorpay configuration
const key_id = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : null;
const key_secret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : null;

console.log('🔧 Razorpay Key ID:', key_id ? 'Set' : 'Not Set');
console.log('🔧 Razorpay Key Secret:', key_secret ? 'Set' : 'Not Set');

// Initialize Razorpay only if keys are available
let razorpay = null;
if (key_id && key_secret) {
  razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.log('❌ Razorpay keys not found. Payment features will be unavailable.');
}

exports.createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ 
        error: 'Payment service not configured. Please contact support.' 
      });
    }

    const { amount, currency = 'INR' } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency,
      receipt: `order_${Date.now()}`,
    }
    
    const order = await razorpay.orders.create(options)
    console.log('✅ Order created successfully:', order.id);
    res.json(order)
  } catch (error) {
    console.error('❌ Error creating order:', error)
    res.status(500).json({ 
      error: 'Failed to create payment order. Please try again.' 
    })
  }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body
    
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')
    
    if (generated_signature === razorpay_signature) {
      // Payment is successful - let client persist order via /api/orders
      res.json({ success: true, verified: true })
    } else {
      // Payment verification failed
      res.json({ success: false, verified: false })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.getPaymentHistory = async (req, res) => {
  try {
    // TODO: Implement payment history retrieval from your database
    const payments = [] // Replace with actual database query
    res.json(payments)
  } catch (error) {
    console.error('Error fetching payment history:', error)
    res.status(500).json({ error: error.message })
  }
} 