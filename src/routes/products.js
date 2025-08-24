const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const { requireAuth } = require('../middleware/clerk')
const { requireRole, attachDbUser } = require('../middleware/roles')

// Get all products
router.get('/', productController.getProducts)

// Get single product
router.get('/:id', productController.getProductById)

// Get product prices from e-commerce stores
router.get('/:id/prices', productController.getProductPrices)

// Get product prices from local shops
router.get('/:id/local-shops', productController.getLocalShops)

// Protected routes
router.post('/', requireAuth, attachDbUser, requireRole('store_owner'), productController.createProduct)
router.put('/:id', requireAuth, attachDbUser, requireRole('store_owner'), productController.updateProduct)

module.exports = router 