const Customer = require('../models/customer.model');
const generateTokenAndSetCookie = require('../utils/generateToken');

/**
 * @desc    Register a new customer
 * @route   POST /customers/register
 * @access  Public
 */
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Validation: Check missing fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (fullName, email, password, phone) are required',
      });
    }

    // 2. Validation: Check password length
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      });
    }

    // 3. Validation: Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // 4. Create new customer (password hashed automatically by Mongoose pre-save hook)
    const newCustomer = await Customer.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
    });

    // 5. Respond with success (never return password)
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        "_id": newCustomer._id,
        "fullName": newCustomer.fullName,
        "email": newCustomer.email,
        "phone": newCustomer.phone,
      },
    });
  } catch (error) {
    console.error('Error in registerCustomer:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate customer & set HttpOnly cookie
 * @route   POST /customers/login
 * @access  Public
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: Check missing fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

    // Verify customer exists and password matches
    if (!customer || !(await customer.comparePassword(password))) {
      // Do not reveal whether email or password was incorrect
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT & store inside HttpOnly cookie
    generateTokenAndSetCookie(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error in loginCustomer:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * @desc    Get currently logged in customer profile
 * @route   GET /customers/me
 * @access  Protected
 */
const getMyProfile = async (req, res) => {
  try {
    // req.user is set by auth.middleware.js (password is already excluded)
    return res.status(200).json({
      "_id": req.user._id,
      "fullName": req.user.fullName,
      "email": req.user.email,
      "phone": req.user.phone,
    });
  } catch (error) {
    console.error('Error in getMyProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Logout customer & clear cookie
 * @route   POST /customers/logout
 * @access  Protected / Public
 */
const logoutCustomer = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error in logoutCustomer:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message,
    });
  }
};

/**
 * @desc    Change customer password (Bonus Challenge)
 * @route   PATCH /customers/change-password
 * @access  Protected
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required',
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 6 characters',
      });
    }

    // Retrieve customer with password
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Verify old password
    const isOldPasswordMatch = await customer.comparePassword(oldPassword);
    if (!isOldPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect old password',
      });
    }

    // Update password (pre-save hook hashes newPassword)
    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: error.message,
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};
