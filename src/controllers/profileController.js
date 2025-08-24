const User = require('../models/User')
const bcrypt = require('bcryptjs')
const cloudinary = require('../config/cloudinary')

const profileController = {
  getProfile: async (req, res) => {
    try {
      const user = req.dbUser || await User.findById(req.user?._id)
      if (!user) return res.status(404).json({ message: 'User not found' })
      const { _id, name, email, phone, avatar, role, preferences, addresses } = user
      const primaryAddress = (addresses && addresses.length > 0)
        ? (addresses.find(a => a.isDefault) || addresses[0])
        : null
      res.json({
        _id, name, email, phone, avatar, role, preferences, addresses,
        // flattened for UI convenience
        address: primaryAddress?.street || '',
        city: primaryAddress?.city || '',
        state: primaryAddress?.state || '',
        pincode: primaryAddress?.pincode || ''
      })
    } catch (error) {
      res.status(400)
      throw error
    }
  },
  updateProfile: async (req, res) => {
    try {
  const { name, email, phone, avatar, address, city, state, pincode } = req.body

      // Check if email is already taken by another user
  const currentUser = req.dbUser || await User.findById(req.user?._id)
  if (email && email !== currentUser.email) {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          res.status(400)
          throw new Error('Email already in use')
        }
      }
  const user = currentUser
      
      // If avatar URL has changed and old avatar exists in Cloudinary, delete it
      if (user.avatar && avatar !== user.avatar && user.avatar.includes('shopeasy')) {
        const publicId = user.avatar.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(`shopeasy/${publicId}`)
      }

      user.name = name
      user.email = email
      user.phone = phone
      user.avatar = avatar

      // Update or set default address entry if provided
      if (address || city || state || pincode) {
        if (!Array.isArray(user.addresses)) user.addresses = []
        let primary = user.addresses.find(a => a.isDefault)
        if (!primary) {
          primary = { type: 'home', isDefault: true }
          user.addresses.unshift(primary)
        }
        primary.street = address || primary.street
        primary.city = city || primary.city
        primary.state = state || primary.state
        primary.pincode = pincode || primary.pincode
      }

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        // flattened address
        address: (updatedUser.addresses?.find(a => a.isDefault) || updatedUser.addresses?.[0])?.street || '',
        city: (updatedUser.addresses?.find(a => a.isDefault) || updatedUser.addresses?.[0])?.city || '',
        state: (updatedUser.addresses?.find(a => a.isDefault) || updatedUser.addresses?.[0])?.state || '',
        pincode: (updatedUser.addresses?.find(a => a.isDefault) || updatedUser.addresses?.[0])?.pincode || ''
      })
    } catch (error) {
      res.status(400)
      throw error
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body
  const user = req.dbUser || await User.findById(req.user?._id)

  if (!(await user.comparePassword(currentPassword))) {
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
  const user = req.dbUser || await User.findById(req.user?._id)
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
  const user = req.dbUser || await User.findById(req.user?._id)

      if (!(await user.matchPassword(password))) {
        res.status(401)
        throw new Error('Password is incorrect')
      }

      // Delete user's avatar from Cloudinary if it exists
      if (user.avatar && user.avatar.includes('shopeasy')) {
        const publicId = user.avatar.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(`shopeasy/${publicId}`)
      }

  await user.deleteOne()
      res.json({ message: 'Account deleted successfully' })
    } catch (error) {
      res.status(400)
      throw error
    }
  },
}

module.exports = profileController 