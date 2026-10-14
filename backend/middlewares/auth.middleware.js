const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

/**
 * Authentication Middleware
 * Verifies JWT token from HttpOnly cookie and attaches authenticated customer to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also support Authorization: Bearer <token> header for testing & Postman
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'shopkart_jwt_secret_default_key'
    );

    // Find customer excluding password
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer no longer exists',
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

module.exports = {
  protect,
};
