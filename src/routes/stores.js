const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')
const { requireAuth } = require('../middleware/clerk')
const { requireRole, attachDbUser } = require('../middleware/roles')
const upload = require('../middleware/upload')

// Public routes
router.get('/', storeController.getStores)
router.get('/:id', storeController.getStoreById)

// Protected routes
router.post('/', requireAuth, attachDbUser, requireRole('store_owner'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), storeController.registerStore)

router.put('/:id', requireAuth, attachDbUser, requireRole('store_owner'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), storeController.updateStore)

// Store reviews
router.post('/:id/reviews', requireAuth, attachDbUser, storeController.addReview)

// Store owner specific routes
router.post('/:id/deals', requireAuth, attachDbUser, requireRole('store_owner'), storeController.addDeal)
router.put('/:id/inventory', requireAuth, attachDbUser, requireRole('store_owner'), storeController.updateInventory)
router.get('/:id/analytics', requireAuth, attachDbUser, requireRole('store_owner'), storeController.getStoreAnalytics)
router.put('/:id/settings', requireAuth, attachDbUser, requireRole('store_owner'), storeController.updateStoreSettings)

module.exports = router 