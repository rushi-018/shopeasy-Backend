const express = require('express')
const router = express.Router()
const profileController = require('../controllers/profileController')
const { protect } = require('../middleware/auth')
const { validateProfile, validatePasswordChange } = require('../middleware/validation')

router.put('/', protect, validateProfile, profileController.updateProfile)
router.put('/password', protect, validatePasswordChange, profileController.changePassword)
router.put('/preferences', protect, profileController.updatePreferences)
router.delete('/', protect, profileController.deleteAccount)

module.exports = router 