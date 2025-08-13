const Product = require('../models/Product')
const mongoose = require('mongoose')

const productController = {
  getProducts: async (req, res) => {
    try {
      const { category, search, page = 1, limit = 10 } = req.query
      const query = {}

      if (category) {
        query.category = category
      }

      if (search) {
        query.name = { $regex: search, $options: 'i' }
      }

      const products = await Product.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()

      const count = await Product.countDocuments(query)

      res.json({
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params
      
      // Check if id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // If not a valid ObjectId, try to find by numeric ID
        const product = await Product.findOne({ numericId: parseInt(id) })
        if (!product) {
          return res.status(404).json({ error: 'Product not found' })
        }
        return res.json(product)
      }
      
      // If valid ObjectId, find by _id
      const product = await Product.findById(id)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }
      res.json(product)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  getLocalShops: async (req, res) => {
    try {
      const { id } = req.params
      
      // Check if id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // If not a valid ObjectId, try to find by numeric ID
        const product = await Product.findOne({ numericId: parseInt(id) })
        if (!product) {
          return res.status(404).json({ error: 'Product not found' })
        }
        
        // Mock local shop prices
        const localShops = [
          {
            name: 'Local Store 1',
            price: product.price * 0.9,
            address: '123 Main St',
            distance: '1.2 km',
            rating: 4.2,
            contact: '555-0123'
          },
          {
            name: 'Local Store 2',
            price: product.price * 0.85,
            address: '456 Oak Ave',
            distance: '2.5 km',
            rating: 4.0,
            contact: '555-0124'
          },
          {
            name: 'Local Store 3',
            price: product.price * 0.95,
            address: '789 Pine Rd',
            distance: '3.1 km',
            rating: 4.4,
            contact: '555-0125'
          }
        ]
        
        return res.json(localShops)
      }
      
      // If valid ObjectId, find by _id
      const product = await Product.findById(id)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }
      
      // Mock local shop prices
      const localShops = [
        {
          name: 'Local Store 1',
          price: product.price * 0.9,
          address: '123 Main St',
          distance: '1.2 km',
          rating: 4.2,
          contact: '555-0123'
        },
        {
          name: 'Local Store 2',
          price: product.price * 0.85,
          address: '456 Oak Ave',
          distance: '2.5 km',
          rating: 4.0,
          contact: '555-0124'
        },
        {
          name: 'Local Store 3',
          price: product.price * 0.95,
          address: '789 Pine Rd',
          distance: '3.1 km',
          rating: 4.4,
          contact: '555-0125'
        }
      ]
      
      res.json(localShops)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  createProduct: async (req, res) => {
    try {
      const product = new Product(req.body)
      await product.save()
      res.status(201).json(product)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  updateProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }
      res.json(product)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  getProductPrices: async (req, res) => {
    try {
      const { id } = req.params
      
      // Check if id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // If not a valid ObjectId, try to find by numeric ID
        const product = await Product.findOne({ numericId: parseInt(id) })
        if (!product) {
          return res.status(404).json({ error: 'Product not found' })
        }
        
        // Mock e-commerce store prices
        const prices = [
          {
            store: 'Amazon',
            price: product.price * 1.1,
            link: 'https://amazon.com',
            delivery: '2-3 days',
            rating: 4.5
          },
          {
            store: 'Flipkart',
            price: product.price * 0.95,
            link: 'https://flipkart.com',
            delivery: '3-4 days',
            rating: 4.3
          },
          {
            store: 'Myntra',
            price: product.price * 1.05,
            link: 'https://myntra.com',
            delivery: '4-5 days',
            rating: 4.2
          }
        ]
        
        return res.json(prices)
      }
      
      // If valid ObjectId, find by _id
      const product = await Product.findById(id)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }
      
      // Mock e-commerce store prices
      const prices = [
        {
          store: 'Amazon',
          price: product.price * 1.1,
          link: 'https://amazon.com',
          delivery: '2-3 days',
          rating: 4.5
        },
        {
          store: 'Flipkart',
          price: product.price * 0.95,
          link: 'https://flipkart.com',
          delivery: '3-4 days',
          rating: 4.3
        },
        {
          store: 'Myntra',
          price: product.price * 1.05,
          link: 'https://myntra.com',
          delivery: '4-5 days',
          rating: 4.2
        }
      ]
      
      res.json(prices)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },
}

module.exports = productController 