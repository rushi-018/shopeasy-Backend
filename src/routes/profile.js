const express = require('express')
const router = express.Router()
const profileController = require('../controllers/profileController')
const { requireAuth } = require('../middleware/clerk')
const { attachDbUser } = require('../middleware/roles')
const { validateProfile, validatePasswordChange } = require('../middleware/validation')

router.get('/', requireAuth, attachDbUser, profileController.getProfile)
router.put('/', requireAuth, attachDbUser, validateProfile, profileController.updateProfile)
router.put('/password', requireAuth, attachDbUser, validatePasswordChange, profileController.changePassword)
router.put('/preferences', requireAuth, attachDbUser, profileController.updatePreferences)
router.delete('/', requireAuth, attachDbUser, profileController.deleteAccount)

module.exports = router 