const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/electrical_hardware_shop')
  .then(async () => {
    console.log('Connected to MongoDB');

    const products = await Product.find({ 'images.0.url': { $exists: true } });
    let fixed = 0;

    for (const product of products) {
      let changed = false;
      for (const img of product.images) {
        if (img.url && !img.url.startsWith('http') && !img.url.startsWith('/uploads/')) {
          const filename = img.url.split(/[/\\]/).pop();
          img.url = '/uploads/' + filename;
          changed = true;
        }
      }
      if (changed) {
        await product.save();
        fixed++;
        console.log(`Fixed: ${product.name}`);
      }
    }

    console.log(`\nFixed ${fixed} products`);
    mongoose.disconnect();
  })
  .catch(err => { console.error(err); process.exit(1); });
