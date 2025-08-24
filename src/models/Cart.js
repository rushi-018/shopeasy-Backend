const mongoose = require('mongoose')

const CartItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // frontend product id
    title: { type: String },
    price: { type: Number },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const CartSchema = new mongoose.Schema(
  {
    // Store Clerk user id and also reference DB user if exists
  // Use the schema-level unique index defined below; avoid field-level index duplication
  clerkId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
)

CartSchema.index({ clerkId: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Cart', CartSchema)
