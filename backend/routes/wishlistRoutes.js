const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) { next(error); }
});

router.post('/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) { next(error); }
});

router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) { next(error); }
});

module.exports = router;
