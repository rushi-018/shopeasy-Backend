const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const { protect } = require('../middleware/auth')

// Get all products
router.get('/', productController.getProducts)

// Get single product
router.get('/:id', productController.getProductById)

// Get product prices from e-commerce stores
router.get('/:id/prices', productController.getProductPrices)

// Get product prices from local shops
router.get('/:id/local-shops', productController.getLocalShops)

// Protected routes
router.post('/', protect, productController.createProduct)
router.put('/:id', protect, productController.updateProduct)

module.exports = router 