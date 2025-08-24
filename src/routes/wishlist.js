const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/clerk')
const { attachDbUser } = require('../middleware/roles')
const wishlist = require('../controllers/wishlistController')

router.use(requireAuth, attachDbUser)

router.get('/', wishlist.getWishlist)
router.post('/', wishlist.addToWishlist)
router.delete('/:productId', wishlist.removeFromWishlist)

module.exports = router
