const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    const admin = await User.create({
      name: 'Admin', email: 'admin@electricalshop.com', password: 'admin123', phone: '9876543210', role: 'admin'
    });
    const customer = await User.create({
      name: 'Rahul Kumar', email: 'rahul@example.com', password: 'customer123', phone: '9876543211', role: 'customer'
    });
    console.log('Users seeded');

    const categories = await Category.insertMany([
      {
        name: 'Electrical', slug: 'electrical', description: 'All electrical products and accessories',
        subcategories: [
          { name: 'Wires & Cables', slug: 'wires-cables' },
          { name: 'Switches & Sockets', slug: 'switches-sockets' },
          { name: 'LED Bulbs', slug: 'led-bulbs' },
          { name: 'Fans', slug: 'fans' },
          { name: 'MCB & Distribution Boards', slug: 'mcb-distribution-boards' },
          { name: 'Modular Accessories', slug: 'modular-accessories' },
          { name: 'Motors', slug: 'motors' },
          { name: 'Electrical Tools', slug: 'electrical-tools' },
          { name: 'Plugs & Adapters', slug: 'plugs-adapters' },
          { name: 'Electrical Accessories', slug: 'electrical-accessories' }
        ]
      },
      {
        name: 'Hardware', slug: 'hardware', description: 'All hardware products and tools',
        subcategories: [
          { name: 'Nuts & Bolts', slug: 'nuts-bolts' },
          { name: 'Screws', slug: 'screws' },
          { name: 'Pipes & Fittings', slug: 'pipes-fittings' },
          { name: 'Locks', slug: 'locks' },
          { name: 'Hinges', slug: 'hinges' },
          { name: 'Hand Tools', slug: 'hand-tools' },
          { name: 'Plumbing Items', slug: 'plumbing-items' },
          { name: 'Construction Hardware', slug: 'construction-hardware' },
          { name: 'Adhesives', slug: 'adhesives' },
          { name: 'Safety Equipment', slug: 'safety-equipment' }
        ]
      }
    ]);
    console.log('Categories seeded');

    const electricalId = categories[0]._id;
    const hardwareId = categories[1]._id;

    const products = await Product.insertMany([
      {
        name: 'Havells Lifeline 2.5 sq mm Copper Wire', slug: 'havells-lifeline-2-5mm-copper-wire',
        description: 'Havells Lifeline Plus HRFR single core cable manufactured from high purity electrolytic grade copper.',
        shortDescription: 'Premium copper wire 2.5 sq mm, 90m coil', price: 3499, discountPrice: 2899,
        sku: 'HW-WC-001', brand: 'Havells', category: electricalId, subcategory: 'Wires & Cables',
        images: [{ url: '/placeholder-wire.jpg', alt: 'Havells Copper Wire' }],
        specifications: [{ key: 'Size', value: '2.5 sq mm' }, { key: 'Length', value: '90 meters' }, { key: 'Type', value: 'Single Core' }],
        stock: 150, sold: 320, rating: 4.5, numReviews: 48, isFeatured: true, isBestSeller: true, tags: ['copper wire', '2.5 sq mm', 'havells']
      },
      {
        name: 'Anchor Roma 6A One-Way Switch', slug: 'anchor-roma-6a-one-way-switch',
        description: 'Anchor Roma modular switch made with high-grade polycarbonate, durable and smooth finish.',
        shortDescription: 'Premium modular switch, 6 Ampere', price: 85, discountPrice: 65,
        sku: 'HW-SS-001', brand: 'Anchor', category: electricalId, subcategory: 'Switches & Sockets',
        images: [{ url: '/placeholder-switch.jpg', alt: 'Anchor Switch' }],
        specifications: [{ key: 'Rating', value: '6A 250V' }, { key: 'Type', value: 'One Way' }],
        stock: 500, sold: 890, rating: 4.3, numReviews: 67, isBestSeller: true, tags: ['switch', 'anchor', 'modular']
      },
      {
        name: 'Philips 12W LED Bulb B22 Cool Day Light', slug: 'philips-12w-led-bulb-b22',
        description: 'Philips CorePro LED bulb provides high quality light with energy efficiency.',
        shortDescription: '12W LED bulb, cool day light, B22 base', price: 199, discountPrice: 149,
        sku: 'HW-LED-001', brand: 'Philips', category: electricalId, subcategory: 'LED Bulbs',
        images: [{ url: '/placeholder-led.jpg', alt: 'Philips LED Bulb' }],
        specifications: [{ key: 'Wattage', value: '12W' }, { key: 'Base', value: 'B22' }, { key: 'Lumens', value: '1100' }],
        stock: 300, sold: 1500, rating: 4.4, numReviews: 120, isFeatured: true, isBestSeller: true, tags: ['led bulb', 'philips', '12w']
      },
      {
        name: 'Havells Stealth Air 1200mm Ceiling Fan', slug: 'havells-stealth-air-1200mm-fan',
        description: 'Premium BLDC motor ceiling fan that consumes only 28W with remote control.',
        shortDescription: 'BLDC ceiling fan, remote control, 28W', price: 4999, discountPrice: 3999,
        sku: 'HW-FAN-001', brand: 'Havells', category: electricalId, subcategory: 'Fans',
        images: [{ url: '/placeholder-fan.jpg', alt: 'Havells Ceiling Fan' }],
        specifications: [{ key: 'Sweep', value: '1200mm' }, { key: 'Power', value: '28W' }, { key: 'Type', value: 'BLDC' }],
        stock: 50, sold: 180, rating: 4.6, numReviews: 55, isFeatured: true, isNewArrival: true, tags: ['fan', 'havells', 'bldc']
      },
      {
        name: 'Legrand MCB 32A Single Pole', slug: 'legrand-mcb-32a-single-pole',
        description: 'MCB 32A provides protection against overload and short circuit.',
        shortDescription: 'Miniature Circuit Breaker, 32 Amp', price: 450, discountPrice: 380,
        sku: 'HW-MCB-001', brand: 'Legrand', category: electricalId, subcategory: 'MCB & Distribution Boards',
        images: [{ url: '/placeholder-mcb.jpg', alt: 'Legrand MCB' }],
        specifications: [{ key: 'Current', value: '32A' }, { key: 'Type', value: 'Single Pole' }, { key: 'Capacity', value: '10kA' }],
        stock: 200, sold: 450, rating: 4.7, numReviews: 38, isBestSeller: true, tags: ['mcb', 'legrand', '32a']
      },
      {
        name: 'Stanley 26-Piece Combination Spanner Set', slug: 'stanley-26-piece-spanner-set',
        description: 'Chrome vanadium steel spanner set for professional mechanics and DIY enthusiasts.',
        shortDescription: 'Chrome vanadium steel, 26 pieces', price: 1899, discountPrice: 1499,
        sku: 'HW-HT-001', brand: 'Stanley', category: hardwareId, subcategory: 'Hand Tools',
        images: [{ url: '/placeholder-tools.jpg', alt: 'Stanley Spanner Set' }],
        specifications: [{ key: 'Pieces', value: '26' }, { key: 'Material', value: 'Chrome Vanadium' }, { key: 'Sizes', value: '6mm to 32mm' }],
        stock: 75, sold: 220, rating: 4.5, numReviews: 32, isFeatured: true, isBestSeller: true, tags: ['spanner', 'stanley', 'hand tools']
      },
      {
        name: 'Prince 1/2 inch GI Pipe Fitting Elbow', slug: 'prince-gi-pipe-fitting-elbow',
        description: 'Galvanized iron pipe elbow fitting for plumbing applications.',
        shortDescription: 'GI elbow fitting, 1/2 inch', price: 35, discountPrice: 28,
        sku: 'HW-PF-001', brand: 'Prince', category: hardwareId, subcategory: 'Pipes & Fittings',
        images: [{ url: '/placeholder-pipe.jpg', alt: 'GI Pipe Elbow' }],
        specifications: [{ key: 'Size', value: '1/2 inch' }, { key: 'Material', value: 'Galvanized Iron' }],
        stock: 1000, sold: 2500, rating: 4.2, numReviews: 89, isBestSeller: true, tags: ['pipe fitting', 'elbow', 'gi']
      },
      {
        name: 'Yale 5 Lever Mortice Lock', slug: 'yale-5-lever-mortice-lock',
        description: 'BS3621 insurance approved lock for wooden doors.',
        shortDescription: 'Insurance approved, 5 lever, chrome', price: 1299, discountPrice: 1099,
        sku: 'HW-LOCK-001', brand: 'Yale', category: hardwareId, subcategory: 'Locks',
        images: [{ url: '/placeholder-lock.jpg', alt: 'Yale Lock' }],
        specifications: [{ key: 'Type', value: '5 Lever Mortice' }, { key: 'Approval', value: 'BS3621' }],
        stock: 60, sold: 150, rating: 4.6, numReviews: 42, isFeatured: true, tags: ['lock', 'yale', 'mortice']
      },
      {
        name: 'Fevikwik Instant Adhesive 3g', slug: 'fevikwik-instant-adhesive-3g',
        description: 'Instant adhesive for quick repairs. Bonds rubber, leather, cloth, metal, and plastic.',
        shortDescription: 'Instant adhesive, 3g pack', price: 45, discountPrice: 38,
        sku: 'HW-ADH-001', brand: 'Fevikwik', category: hardwareId, subcategory: 'Adhesives',
        images: [{ url: '/placeholder-adhesive.jpg', alt: 'Fevikwik Adhesive' }],
        specifications: [{ key: 'Weight', value: '3g' }, { key: 'Type', value: 'Cyanoacrylate' }],
        stock: 500, sold: 3000, rating: 4.3, numReviews: 156, isBestSeller: true, tags: ['fevikwik', 'adhesive']
      },
      {
        name: '3M Safety Goggles Anti-Fog', slug: '3m-safety-goggles-anti-fog',
        description: 'Safety goggles with anti-fog coating for industrial use.',
        shortDescription: 'Anti-fog safety goggles, ANSI rated', price: 350, discountPrice: 289,
        sku: 'HW-SE-001', brand: '3M', category: hardwareId, subcategory: 'Safety Equipment',
        images: [{ url: '/placeholder-goggles.jpg', alt: '3M Safety Goggles' }],
        specifications: [{ key: 'Protection', value: 'ANSI Z87.1' }, { key: 'Coating', value: 'Anti-Fog' }],
        stock: 120, sold: 340, rating: 4.4, numReviews: 28, isNewArrival: true, tags: ['safety goggles', '3m']
      },
      {
        name: 'Finolex 1.5 sq mm FRLS Wire', slug: 'finolex-1-5mm-frls-wire',
        description: 'FRLS copper cable ideal for domestic wiring. Meets IS 694 standards.',
        shortDescription: 'FRLS copper wire, 1.5 sq mm, 90m', price: 2299, discountPrice: 1899,
        sku: 'HW-WC-002', brand: 'Finolex', category: electricalId, subcategory: 'Wires & Cables',
        images: [{ url: '/placeholder-wire2.jpg', alt: 'Finolex Wire' }],
        specifications: [{ key: 'Size', value: '1.5 sq mm' }, { key: 'Length', value: '90 meters' }, { key: 'Type', value: 'FRLS' }],
        stock: 200, sold: 480, rating: 4.5, numReviews: 65, isFeatured: true, tags: ['wire', 'finolex', 'frls']
      },
      {
        name: 'Havells Axial Exhaust Fan 150mm', slug: 'havells-axial-exhaust-fan-150mm',
        description: 'Axial fan for continuous extraction of hot air and fumes.',
        shortDescription: 'Exhaust fan, 150mm, 28W', price: 899, discountPrice: 749,
        sku: 'HW-FAN-002', brand: 'Havells', category: electricalId, subcategory: 'Fans',
        images: [{ url: '/placeholder-exhaust.jpg', alt: 'Havells Exhaust Fan' }],
        specifications: [{ key: 'Size', value: '150mm' }, { key: 'Power', value: '28W' }, { key: 'Speed', value: '2200 RPM' }],
        stock: 80, sold: 210, rating: 4.3, numReviews: 35, isNewArrival: true, tags: ['exhaust fan', 'havells']
      }
    ]);
    console.log('Products seeded');

    await Coupon.create({
      code: 'WELCOME10', description: '10% off on first order', discountType: 'percentage',
      discountValue: 10, minOrderAmount: 500, maxDiscount: 200,
      usageLimit: 100, expiresAt: new Date('2027-12-31'), isActive: true
    });
    await Coupon.create({
      code: 'FLAT100', description: 'Flat 100 off on orders above 1000', discountType: 'fixed',
      discountValue: 100, minOrderAmount: 1000, usageLimit: 50,
      expiresAt: new Date('2027-12-31'), isActive: true
    });
    console.log('Coupons seeded');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
