const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, subcategory, brand, minPrice, maxPrice, rating, sort, isNewArrival, isFeatured, isBestSeller, page = 1, limit = 12 } = req.query;
    let query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.category = cat._id;
      } else {
        query.category = null;
      }
    }
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.rating = { $gte: Number(rating) };
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isBestSeller === 'true') query.isBestSeller = true;

    let sortOption = {};
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { rating: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'popularity': sortOption = { sold: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).populate('category', 'name slug').sort(sortOption).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ success: true, products, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const related = await Product.find({ category: product.category._id, _id: { $ne: product._id }, isActive: true }).limit(8);
    res.json({ success: true, product, related });
  } catch (error) { next(error); }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) { next(error); }
};

exports.createProduct = async (req, res, next) => {
  try {
    console.log('--- CREATE PRODUCT ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => {
        const url = file.path.startsWith('http') ? file.path : '/uploads/' + file.filename;
        return { url, alt: req.body.name };
      });
      console.log('Images mapped:', req.body.images);
    }
    if (req.body.specifications && typeof req.body.specifications === 'string') {
      req.body.specifications = JSON.parse(req.body.specifications);
    }
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(t => t.trim());
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) { next(error); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        const url = file.path.startsWith('http') ? file.path : '/uploads/' + file.filename;
        return { url, alt: req.body.name || '' };
      });
      req.body.images = [...(req.body.existingImages ? JSON.parse(req.body.existingImages) : []), ...newImages];
    }
    if (req.body.specifications && typeof req.body.specifications === 'string') {
      req.body.specifications = JSON.parse(req.body.specifications);
    }
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(t => t.trim());
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) { next(error); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) { next(error); }
};

exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, stock } = req.query;
    let query = {};
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }, { brand: { $regex: search, $options: 'i' } }];
    }
    if (category) query.category = category;
    if (stock === 'low') query.$and = [{ stock: { $gt: 0 } }, { stock: { $lte: 10 } }];
    if (stock === 'out') query.stock = 0;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).populate('category', 'name').sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ success: true, products, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    let products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
    if (!products.length) products = await Product.find({ isActive: true }).sort('-createdAt').limit(8);
    res.json({ success: true, products });
  } catch (error) { next(error); }
};

exports.getBestSellers = async (req, res, next) => {
  try {
    let products = await Product.find({ isBestSeller: true, isActive: true }).sort('-sold').limit(8);
    if (!products.length) products = await Product.find({ isActive: true }).sort('-sold').limit(8);
    res.json({ success: true, products });
  } catch (error) { next(error); }
};

exports.getNewArrivals = async (req, res, next) => {
  try {
    let products = await Product.find({ isNewArrival: true, isActive: true }).sort('-createdAt').limit(8);
    if (!products.length) products = await Product.find({ isActive: true }).sort('-createdAt').limit(8);
    res.json({ success: true, products });
  } catch (error) { next(error); }
};
