const Cart = require('../models/Cart')
const User = require('../models/User')

const getOrCreateCart = async (clerkId) => {
  let cart = await Cart.findOne({ clerkId })
  if (!cart) {
    cart = await Cart.create({ clerkId, items: [] })
  }
  return cart
}

exports.getCart = async (req, res) => {
  try {
    const { id: clerkId } = req.user
    const cart = await getOrCreateCart(clerkId)
    res.json(cart)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

exports.setCart = async (req, res) => {
  try {
    const { id: clerkId } = req.user
    const { items } = req.body
    const cart = await getOrCreateCart(clerkId)
    cart.items = Array.isArray(items) ? items : []
    await cart.save()
    res.json(cart)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

exports.addItem = async (req, res) => {
  try {
    const { id: clerkId } = req.user
    const item = req.body
    const cart = await getOrCreateCart(clerkId)
    const existing = cart.items.find(i => i.id === item.id)
    if (existing) existing.quantity += item.quantity || 1
    else cart.items.push({ ...item, quantity: item.quantity || 1 })
    await cart.save()
    res.json(cart)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

exports.removeItem = async (req, res) => {
  try {
    const { id: clerkId } = req.user
    const { itemId } = req.params
    const cart = await getOrCreateCart(clerkId)
    cart.items = cart.items.filter(i => i.id !== itemId)
    await cart.save()
    res.json(cart)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

exports.clearCart = async (req, res) => {
  try {
    const { id: clerkId } = req.user
    const cart = await getOrCreateCart(clerkId)
    cart.items = []
    await cart.save()
    res.json(cart)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
