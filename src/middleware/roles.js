// Attach DB user and enforce roles using Clerk user id on req.user.id
const User = require('../models/User')

const attachDbUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const dbUser = await User.findOne({ clerkId: req.user.id })
    if (!dbUser) {
      return res.status(401).json({ message: 'User not provisioned' })
    }
    req.dbUser = dbUser
    next()
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

const requireRole = (roles = []) => {
  const allowed = Array.isArray(roles) ? roles : [roles]
  return async (req, res, next) => {
    try {
      // Ensure db user is attached
      if (!req.dbUser) {
        await attachDbUser(req, res, () => {})
        if (!req.dbUser) return // attachDbUser handles response
      }
      const role = req.dbUser.role || 'customer'
      if (!allowed.includes(role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' })
      }
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}

module.exports = { attachDbUser, requireRole }
