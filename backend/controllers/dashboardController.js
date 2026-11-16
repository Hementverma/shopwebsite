const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const lowStockProducts = await Product.countDocuments({ $and: [{ stock: { $gt: 0 } }, { stock: { $lte: 10 } }] });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    const monthlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    const recentOrders = await Order.find().populate('user', 'name email').sort('-createdAt').limit(5);

    res.json({
      success: true, stats: {
        totalProducts, totalOrders, totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders, deliveredOrders, lowStockProducts, outOfStockProducts,
        monthlySales, topProducts, recentOrders
      }
    });
  } catch (error) { next(error); }
};
