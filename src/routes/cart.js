const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/clerk')
const cartController = require('../controllers/cartController')

router.use(requireAuth)

router.get('/', cartController.getCart)
router.put('/', cartController.setCart)
router.post('/items', cartController.addItem)
router.delete('/items/:itemId', cartController.removeItem)
router.delete('/', cartController.clearCart)

module.exports = router
