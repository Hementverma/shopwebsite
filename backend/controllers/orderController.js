const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    let subtotal = 0;
    const items = cart.items.map(item => {
      const itemSubtotal = item.product.discountPrice > 0 ? item.product.discountPrice * item.quantity : item.product.price * item.quantity;
      subtotal += itemSubtotal;
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0]?.url || '',
        price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      };
    });
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
      if (coupon && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity);
        } else {
          couponDiscount = coupon.discountValue;
        }
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal - couponDiscount + deliveryCharge + tax;
    const order = await Order.create({
      user: req.user.id, items, shippingAddress, paymentMethod, subtotal,
      couponCode: couponCode || undefined, couponDiscount, deliveryCharge, tax, total, notes,
      statusHistory: [{ status: 'pending', date: new Date(), note: 'Order placed' }],
      paymentStatus: paymentMethod === 'cod' ? 'pending' : paymentMethod === 'whatsapp' ? 'paid' : 'pending'
    });
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity, sold: item.quantity } });
    }
    await Cart.findOneAndDelete({ user: req.user.id });

    // Notify shop owner via WhatsApp
    try {
      const shopNumber = process.env.WHATSAPP_NUMBER || '919893369932';
      let msg = `*New Order Received!*\n\n`;
      msg += `Order #: ${order.orderNumber}\n`;
      msg += `Customer: ${shippingAddress.fullName}\n`;
      msg += `Phone: ${shippingAddress.phone}\n`;
      msg += `Address: ${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}\n\n`;
      msg += `*Items:*\n`;
      items.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} x ${item.quantity} = Rs.${item.subtotal}\n`;
      });
      msg += `\n*Total: Rs.${total}*\n`;
      msg += `Payment: ${paymentMethod.toUpperCase()}\n`;
      const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodeURIComponent(msg)}`;
      console.log(`\n🔔 NEW ORDER: ${order.orderNumber} - Total: Rs.${total}`);
      console.log(`📱 WhatsApp Notification: ${whatsappUrl}\n`);
    } catch (e) { console.log('WhatsApp notification error:', e.message); }

    res.status(201).json({ success: true, order });
  } catch (error) { next(error); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt').skip((page - 1) * limit).limit(limit);
    res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let query = {};
    if (status) query.status = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).populate('user', 'name email phone').sort('-createdAt').skip((page - 1) * limit).limit(limit);
    res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
};

exports.getOrderNotifications = async (req, res, next) => {
  try {
    const total = await Order.countDocuments({});
    const latest = await Order.findOne({}).sort('-createdAt').select('orderNumber total createdAt status').lean();
    res.json({
      success: true,
      total,
      latest: latest ? { id: latest._id, orderNumber: latest.orderNumber, total: latest.total, createdAt: latest.createdAt, status: latest.status } : null
    });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = status;
    order.statusHistory.push({ status, date: new Date(), note: note || `Status updated to ${status}` });
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') {
      order.deliveryDate = new Date();
      if (['cod', 'whatsapp'].includes(order.paymentMethod)) {
        order.paymentStatus = 'paid';
      }
    }
    if (status === 'cancelled') {
      order.cancelReason = req.body.cancelReason;
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
      }
    }
    await order.save();
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage' });
    }
    order.status = 'cancelled';
    order.cancelReason = req.body.cancelReason || 'Cancelled by user';
    order.statusHistory.push({ status: 'cancelled', date: new Date(), note: req.body.cancelReason || 'Cancelled by user' });
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }
    await order.save();
    res.json({ success: true, order });
  } catch (error) { next(error); }
};
