const mongoose = require('mongoose');
const Product = require('../models/product.model');

/**
 * @desc    Create a new product
 * @route   POST /products
 * @access  Public (Open for Lab 03)
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. Validation: Missing required fields
    if (!name || !description || price === undefined || price === null || !category || !image || stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    // 2. Validation: Price must be greater than 0
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than 0',
      });
    }

    // 3. Validation: Stock cannot be negative
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    // 4. Create product in MongoDB
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim(),
      image: image.trim(),
      stock: parsedStock,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

/**
 * @desc    Get all products with dynamic search, category filtering & bonus sorting
 * @route   GET /products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build dynamic query object
    const query = {};

    // Search by product name (case-insensitive)
    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by category (ignore if "All" or "all" or empty)
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all categories') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Build dynamic sorting (Bonus Challenge +10 Marks)
    let sortOption = { createdAt: -1 }; // Default: Newest first

    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    // Fetch matching products from MongoDB
    const products = await Product.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validation: Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Fetch product
    const product = await Product.findById(id);

    // 3. Validation: Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product details',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
