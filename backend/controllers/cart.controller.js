const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * @desc    Add product to cart or increment quantity
 * @route   POST /cart/:productId
 * @access  Protected
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Stock validation
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
      });
    }

    // 4. Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    // Initialize cart if undefined
    if (!customer.cart) customer.cart = [];

    // 5. Check if product already exists in cart
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Validate that new quantity does not exceed stock
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Available stock limit is ${product.stock}`,
        });
      }
      existingItem.quantity += 1;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await customer.save();

    // Populate product details for client response
    await customer.populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: customer.cart,
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding product to cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Get authenticated customer's cart
 * @route   GET /cart
 * @access  Protected
 */
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    // Filter out items whose referenced product was deleted
    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Update product quantity in cart
 * @route   PATCH /cart/:productId
 * @access  Protected
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Validate quantity is a number and >= 1
    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number of at least 1',
      });
    }

    // 3. Find product to check stock limit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock of ${product.stock}`,
      });
    }

    // 4. Find customer and item in cart
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    const item = (customer.cart || []).find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 5. Update quantity & save
    item.quantity = parsedQty;
    await customer.save();

    await customer.populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: customer.cart,
    });
  } catch (error) {
    console.error('Error in updateCartQuantity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart quantity',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /cart/:productId
 * @access  Protected
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Find customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    const itemIndex = (customer.cart || []).findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 3. Remove product from cart
    customer.cart.splice(itemIndex, 1);
    await customer.save();

    await customer.populate({
      path: 'cart.product',
      select: 'name price image stock category description',
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: customer.cart,
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing product from cart',
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
