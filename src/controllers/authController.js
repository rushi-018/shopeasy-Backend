const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Store = require('../models/Store')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, businessDetails } = req.body

      // Validate role
      if (!['customer', 'store_owner'].includes(role)) {
        return res.status(400).json({
          message: 'Invalid role. Must be either "customer" or "store_owner"'
        })
      }

      const userExists = await User.findOne({ email })
      if (userExists) {
        return res.status(400).json({
          message: 'Email already registered'
        })
      }

      // Validate business details for store owners
      if (role === 'store_owner') {
        if (!businessDetails) {
          return res.status(400).json({
            message: 'Business details are required for store owners'
          })
        }

        const requiredFields = ['businessName', 'businessType', 'gstNumber', 'panNumber']
        const missingFields = requiredFields.filter(field => !businessDetails[field])
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            message: `Missing required business fields: ${missingFields.join(', ')}`
          })
        }

        const requiredAddressFields = ['street', 'city', 'state', 'pincode']
        const missingAddressFields = requiredAddressFields.filter(
          field => !businessDetails.address?.[field]
        )
        
        if (missingAddressFields.length > 0) {
          return res.status(400).json({
            message: `Missing required address fields: ${missingAddressFields.join(', ')}`
          })
        }
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        businessDetails: role === 'store_owner' ? businessDetails : undefined
      })

      if (user) {
        res.status(201).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessDetails: user.businessDetails
          },
          token: generateToken(user._id),
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      res.status(400).json({
        message: error.message || 'Registration failed'
      })
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({
          message: 'Invalid email or password'
        })
      }

      const isMatch = await user.matchPassword(password)
      if (!isMatch) {
        return res.status(401).json({
          message: 'Invalid email or password'
        })
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessDetails: user.businessDetails
        },
        token: generateToken(user._id),
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        message: 'An error occurred during login'
      })
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select('-password')
        .populate('wishlist')
        .populate('orders')
        .populate('reviews')

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      if (user.role === 'store_owner') {
        const stores = await Store.find({ owner: user._id })
        user.stores = stores
      }

      res.json(user)
    } catch (error) {
      console.error('Get current user error:', error)
      res.status(500).json({
        message: 'An error occurred while fetching user data'
      })
    }
  },

  updateProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      user.name = req.body.name || user.name
      user.phone = req.body.phone || user.phone
      user.avatar = req.body.avatar || user.avatar
      user.preferences = req.body.preferences || user.preferences
      user.addresses = req.body.addresses || user.addresses

      const updatedUser = await user.save()
      res.json(updatedUser)
    } catch (error) {
      console.error('Update profile error:', error)
      res.status(400).json({
        message: error.message || 'Failed to update profile'
      })
    }
  },

  updateBusinessDetails: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      if (user.role !== 'store_owner') {
        return res.status(403).json({
          message: 'Only store owners can update business details'
        })
      }

      user.businessDetails = {
        ...user.businessDetails,
        ...req.body
      }

      const updatedUser = await user.save()
      res.json(updatedUser)
    } catch (error) {
      console.error('Update business details error:', error)
      res.status(400).json({
        message: error.message || 'Failed to update business details'
      })
    }
  },

  uploadVerificationDocuments: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      if (user.role !== 'store_owner') {
        return res.status(403).json({
          message: 'Only store owners can upload verification documents'
        })
      }

      const { documents } = req.body
      user.businessDetails.documents = [
        ...user.businessDetails.documents,
        ...documents
      ]

      const updatedUser = await user.save()
      res.json(updatedUser)
    } catch (error) {
      console.error('Upload verification documents error:', error)
      res.status(400).json({
        message: error.message || 'Failed to upload verification documents'
      })
    }
  }
}

module.exports = authController 