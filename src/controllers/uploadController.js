const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')

const uploadController = {
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        res.status(400)
        throw new Error('No file uploaded')
      }

      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'shopeasy',
            },
            (error, result) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            }
          )
          streamifier.createReadStream(buffer).pipe(stream)
        })
      }

      const result = await streamUpload(req.file.buffer)
      
      res.json({
        url: result.secure_url,
        public_id: result.public_id,
      })
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  deleteImage: async (req, res) => {
    try {
      const { public_id } = req.body

      if (!public_id) {
        res.status(400)
        throw new Error('No public_id provided')
      }

      const result = await cloudinary.uploader.destroy(public_id)
      res.json(result)
    } catch (error) {
      res.status(400)
      throw error
    }
  },
}

module.exports = uploadController 