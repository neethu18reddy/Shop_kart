const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const { seedProductsIfEmpty } = require('./utils/seedProducts');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Mount Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShopKart Customer Authentication Service is running!',
  });
});

// Handle 404 Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Database Connection and Server Initialization
const startServer = async () => {
  try {
    // Attempt connecting to configured MONGO_URI
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB successfully.');
    await seedProductsIfEmpty();

    app.listen(PORT, () => {
      console.log(`🚀 ShopKart Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log('⚠️ Local MongoDB not detected. Starting embedded MongoDB instance for you...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log('✅ Connected to embedded MongoDB successfully!');
      await seedProductsIfEmpty();

      app.listen(PORT, () => {
        console.log(`🚀 ShopKart Server running on http://localhost:${PORT}`);
      });
    } catch (fallbackError) {
      console.error('❌ Failed to connect to MongoDB:', fallbackError.message);
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
