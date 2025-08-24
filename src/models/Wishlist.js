const mongoose = require('mongoose')

const wishlistItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: String,
  price: Number,
  image: String,
}, { _id: false })

const wishlistSchema = new mongoose.Schema({
  clerkId: { type: String, index: true, required: true },
  items: { type: [wishlistItemSchema], default: [] }
}, { timestamps: true })

wishlistSchema.index({ clerkId: 1 })
wishlistSchema.index({ clerkId: 1, 'items.productId': 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Wishlist', wishlistSchema)
