const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/uploadController')
const { requireAuth } = require('../middleware/clerk')
const { attachDbUser } = require('../middleware/roles')
const upload = require('../middleware/upload')

router.post(
  '/image',
  requireAuth,
  attachDbUser,
  upload.single('image'),
  uploadController.uploadImage
)

router.delete('/image', requireAuth, attachDbUser, uploadController.deleteImage)

module.exports = router 