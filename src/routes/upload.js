const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/uploadController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.post(
  '/image',
  protect,
  upload.single('image'),
  uploadController.uploadImage
)

router.delete('/image', protect, uploadController.deleteImage)

module.exports = router 