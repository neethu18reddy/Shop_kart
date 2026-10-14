const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * @desc    Add product to authenticated customer's wishlist
 * @route   POST /wishlist/:productId
 * @access  Protected
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Validate product existence in MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    // 4. Duplicate Check: Prevent duplicate wishlist entries
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // 5. Add Product reference & persist in MongoDB
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding product to wishlist',
      error: error.message,
    });
  }
};

/**
 * @desc    Get authenticated customer's wishlist with populated product details
 * @route   GET /wishlist
 * @access  Protected
 */
const getWishlist = async (req, res) => {
  try {
    // 1. Fetch customer and populate wishlist product references
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description',
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    // 2. Filter out any null entries (in case referenced products were removed)
    const validWishlist = (customer.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    console.error('Error in getWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove product from authenticated customer's wishlist
 * @route   DELETE /wishlist/:productId
 * @access  Protected
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    // 3. Verify product is in customer's wishlist
    const isPresent = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!isPresent) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // 4. Remove reference and save
    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing product from wishlist',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle product in wishlist (Bonus Challenge +10 Marks)
 * @route   PATCH /wishlist/:productId/toggle
 * @access  Protected
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 2. Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      // Remove
      customer.wishlist = customer.wishlist.filter(
        (id) => id.toString() !== productId
      );
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {
      // Add
      customer.wishlist.push(productId);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    console.error('Error in toggleWishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while toggling wishlist',
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
