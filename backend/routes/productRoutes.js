const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, getAllProductsAdmin, getFeaturedProducts, getBestSellers, getNewArrivals } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/admin', protect, authorize('admin'), getAllProductsAdmin);
router.get('/:slug', getProductBySlug);
router.get('/id/:id', getProductById);
router.post('/', protect, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
