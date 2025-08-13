const User = require('../models/User')
const bcrypt = require('bcryptjs')
const cloudinary = require('../config/cloudinary')

const profileController = {
  updateProfile: async (req, res) => {
    try {
      const { name, email, phone, avatar } = req.body

      // Check if email is already taken by another user
      if (email !== req.user.email) {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          res.status(400)
          throw new Error('Email already in use')
        }
      }

      const user = await User.findById(req.user._id)
      
      // If avatar URL has changed and old avatar exists in Cloudinary, delete it
      if (user.avatar && avatar !== user.avatar && user.avatar.includes('shopeasy')) {
        const publicId = user.avatar.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(`shopeasy/${publicId}`)
      }

      user.name = name
      user.email = email
      user.phone = phone
      user.avatar = avatar

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      })
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body
      const user = await User.findById(req.user._id)

      if (!(await user.matchPassword(currentPassword))) {
        res.status(401)
        throw new Error('Current password is incorrect')
      }

      user.password = newPassword
      await user.save()

      res.json({ message: 'Password updated successfully' })
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  updatePreferences: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
      user.preferences = {
        ...user.preferences,
        ...req.body,
      }
      await user.save()
      res.json(user.preferences)
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const { password } = req.body
      const user = await User.findById(req.user._id)

      if (!(await user.matchPassword(password))) {
        res.status(401)
        throw new Error('Password is incorrect')
      }

      // Delete user's avatar from Cloudinary if it exists
      if (user.avatar && user.avatar.includes('shopeasy')) {
        const publicId = user.avatar.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(`shopeasy/${publicId}`)
      }

      await user.remove()
      res.json({ message: 'Account deleted successfully' })
    } catch (error) {
      res.status(400)
      throw error
    }
  },
}

module.exports = profileController 