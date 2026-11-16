const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/electrical_hardware_shop')
  .then(async () => {
    console.log('Connected to MongoDB');

    // Fix 1: All delivered orders → paymentStatus = paid
    const r1 = await Order.updateMany(
      { status: 'delivered', paymentStatus: { $ne: 'paid' } },
      { $set: { paymentStatus: 'paid' } }
    );
    console.log(`Delivered orders fixed: ${r1.modifiedCount}`);

    // Fix 2: All whatsapp orders → paymentStatus = paid
    const r2 = await Order.updateMany(
      { paymentMethod: 'whatsapp', paymentStatus: { $ne: 'paid' } },
      { $set: { paymentStatus: 'paid' } }
    );
    console.log(`WhatsApp orders fixed: ${r2.modifiedCount}`);

    // Show all orders
    const orders = await Order.find().select('orderNumber status paymentMethod paymentStatus total');
    console.log('\nAll Orders:');
    orders.forEach(o => {
      console.log(`  ${o.orderNumber} | Status: ${o.status} | Payment: ${o.paymentMethod} | PaymentStatus: ${o.paymentStatus} | Total: Rs.${o.total}`);
    });

    mongoose.disconnect();
    console.log('\nDone! Restart your backend server.');
  })
  .catch(err => { console.error(err); process.exit(1); });
