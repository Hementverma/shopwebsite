const Cart = require('../models/Cart');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price discountPrice images stock isActive slug brand');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    cart.items = cart.items.filter(item => item.product && item.product.isActive);
    await cart.save();
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [{ product: productId, quantity }] });
    } else {
      const existingItem = cart.items.find(item => item.product.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price discountPrice images stock isActive slug brand');
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const item = cart.items.find(item => item.product.toString() === req.params.productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price discountPrice images stock isActive slug brand');
    res.json({ success: true, cart: updatedCart });
  } catch (error) { next(error); }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price discountPrice images stock isActive slug brand');
    res.json({ success: true, cart: updatedCart });
  } catch (error) { next(error); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) { next(error); }
};
