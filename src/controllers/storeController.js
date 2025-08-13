const Store = require('../models/Store')
const User = require('../models/User')

const storeController = {
  getStores: async (req, res) => {
    try {
      const { lat, lng, radius = 5, category, search } = req.query
      const query = {}

      if (lat && lng) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: radius * 1000,
          },
        }
      }

      if (category) {
        query.category = category
      }

      if (search) {
        query.$text = { $search: search }
      }

      query.isActive = true

      const stores = await Store.find(query)
        .populate('owner', 'name email')
        .select('-inventory -analytics')
        .sort({ rating: -1 })

      res.json(stores)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  getStoreById: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('products')
        .populate('reviews.user', 'name avatar')

      if (!store) {
        res.status(404)
        throw new Error('Store not found')
      }

      // Increment view count
      store.analytics.views += 1
      await store.save()

      res.json(store)
    } catch (error) {
      res.status(404)
      throw error
    }
  },

  registerStore: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)

      if (user.role !== 'store_owner') {
        res.status(403)
        throw new Error('Only store owners can register stores')
      }

      if (!user.businessDetails.isVerified) {
        res.status(403)
        throw new Error('Business verification required before registering a store')
      }

      const store = new Store({
        ...req.body,
        owner: req.user._id,
        verificationDocuments: user.businessDetails.documents
      })

      const createdStore = await store.save()
      res.status(201).json(createdStore)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  updateStore: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)

      if (!store) {
        res.status(404)
        throw new Error('Store not found')
      }

      if (store.owner.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to update this store')
      }

      const updatedStore = await Store.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )

      res.json(updatedStore)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  addReview: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)

      if (!store) {
        res.status(404)
        throw new Error('Store not found')
      }

      const { rating, comment } = req.body

      const review = {
        user: req.user._id,
        rating,
        comment
      }

      store.reviews.push(review)
      store.totalReviews = store.reviews.length
      store.rating = store.reviews.reduce((acc, review) => acc + review.rating, 0) / store.totalReviews

      await store.save()
      res.json(store)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  addDeal: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)

      if (!store) {
        res.status(404)
        throw new Error('Store not found')
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Not authorized to add deals')
      }

      store.deals.push(req.body)
      await store.save()
      res.json(store)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  updateInventory: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)

      if (!store) {
        res.status(404)
        throw new Error('Store not found')
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Not authorized to update inventory')
      }

      const { productId, quantity } = req.body

      const inventoryItem = store.inventory.find(
        item => item.product.toString() === productId
      )

      if (inventoryItem) {
        inventoryItem.quantity = quantity
        inventoryItem.lastUpdated = new Date()
      } else {
        store.inventory.push({
          product: productId,
          quantity,
          lastUpdated: new Date()
        })
      }

      await store.save()
      res.json(store)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  getStoreAnalytics: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)

      if (!store) {
        res.status(404)
        throw new Error('Store not found')
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Not authorized to view analytics')
      }

      res.json(store.analytics)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  updateStoreSettings: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)

      if (!store) {
        res.status(404)
        throw new Error('Store not found')
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Not authorized to update settings')
      }

      store.settings = {
        ...store.settings,
        ...req.body
      }

      await store.save()
      res.json(store)
    } catch (error) {
      res.status(400)
      throw error
    }
  }
}

module.exports = storeController 