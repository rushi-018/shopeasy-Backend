const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)

// Protected routes
router.get('/me', protect, authController.getCurrentUser)
router.put('/profile', protect, authController.updateProfile)

// Store owner specific routes
router.put('/business-details', protect, authController.updateBusinessDetails)
router.post('/verification-documents', protect, upload.array('documents', 5), authController.uploadVerificationDocuments)

module.exports = router 