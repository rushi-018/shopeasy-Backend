const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

// Public routes
router.get('/', storeController.getStores)
router.get('/:id', storeController.getStoreById)

// Protected routes
router.post('/', protect, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), storeController.registerStore)

router.put('/:id', protect, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), storeController.updateStore)

// Store reviews
router.post('/:id/reviews', protect, storeController.addReview)

// Store owner specific routes
router.post('/:id/deals', protect, storeController.addDeal)
router.put('/:id/inventory', protect, storeController.updateInventory)
router.get('/:id/analytics', protect, storeController.getStoreAnalytics)
router.put('/:id/settings', protect, storeController.updateStoreSettings)

module.exports = router 