const Wishlist = require('../models/Wishlist')

exports.getWishlist = async (req, res) => {
  try {
    const wl = await Wishlist.findOne({ clerkId: req.user.id })
    res.json(wl?.items || [])
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

exports.addToWishlist = async (req, res) => {
  try {
    const { productId, name, price, image } = req.body
    if (!productId) return res.status(400).json({ message: 'productId required' })
    const wl = await Wishlist.findOneAndUpdate(
      { clerkId: req.user.id },
      { $setOnInsert: { clerkId: req.user.id } },
      { upsert: true, new: true }
    )
    const exists = wl.items.some(i => i.productId.toString() === productId.toString())
    if (!exists) {
      wl.items.push({ productId, name, price, image })
      await wl.save()
    }
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    await Wishlist.findOneAndUpdate(
      { clerkId: req.user.id },
      { $pull: { items: { productId: productId.toString() } } },
      { new: true }
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}