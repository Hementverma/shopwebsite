const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name is required'], trim: true, unique: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, maxlength: 500 },
  image: { url: String, alt: String },
  subcategories: [{ name: String, slug: String }],
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

CategorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.subcategories && this.subcategories.length > 0) {
    this.subcategories.forEach(sub => {
      if (!sub.slug) {
        sub.slug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    });
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
