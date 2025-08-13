const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String
  },
  coverImage: {
    type: String
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'fashion', 'food', 'grocery', 'other']
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  features: [{
    type: String,
    enum: ['parking', 'wifi', 'delivery', 'pickup', 'gift_wrapping', 'returns']
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  deals: [{
    title: String,
    description: String,
    discount: Number,
    validFrom: Date,
    validUntil: Date,
    code: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  inventory: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    lastUpdated: Date
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  settings: {
    autoAcceptOrders: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationDocuments: [{
    type: String,
    url: String,
    verified: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
})

storeSchema.index({ 'location.coordinates': '2dsphere' })
storeSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Store', storeSchema) 