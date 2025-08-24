const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/clerk')
const { attachDbUser } = require('../middleware/roles')
const orderController = require('../controllers/orderController')

router.use(requireAuth, attachDbUser)

router.post('/', orderController.createOrder)
router.get('/', orderController.getMyOrders)

module.exports = router
