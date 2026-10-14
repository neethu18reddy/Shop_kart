const Product = require('../models/product.model');

const sampleProducts = [
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical gaming keyboard with durable clicky blue switches and ergonomic wrist rest.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 15,
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Premium wireless over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless regular-fit denim jacket made with 100% breathable organic cotton with chest flap pockets.',
    price: 1999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    stock: 20,
  },
  {
    name: 'Modern Smart Fitness Watch',
    description: 'Water-resistant smartwatch featuring 24/7 heart rate tracking, SpO2 monitor, and built-in GPS.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 8,
  },
  {
    name: 'Minimalist Ceramic Coffee Mug',
    description: 'Handcrafted ceramic mug with heat-resistant matte glaze finish, ideal for specialty coffee and tea.',
    price: 499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    stock: 50,
  },
  {
    name: 'Clean Code Developer Handbook',
    description: 'A handbook of agile software craftsmanship for engineering clean, maintainable, and scalable code.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    name: 'Ergonomic Office Desk Lamp',
    description: 'Dimmable LED architect desk lamp with customizable color temperature and USB fast charging port.',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 18,
  },
  {
    name: 'Urban Canvas Backpack',
    description: 'Waterproof laptop backpack with anti-theft compartments and padded shoulder straps for everyday commute.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 30,
  },
];

const seedProductsIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log('🌱 Seeded 8 initial products into MongoDB.');
    }
  } catch (error) {
    console.warn('⚠️ Product seeding skipped or error:', error.message);
  }
};

module.exports = {
  sampleProducts,
  seedProductsIfEmpty,
};
