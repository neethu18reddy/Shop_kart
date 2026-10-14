const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token and attaches it as an HttpOnly cookie to the response.
 * 
 * @param {Object} res - Express response object
 * @param {string|Object} customerId - Customer's MongoDB ObjectId
 * @returns {string} - The generated JWT token
 */
const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || 'shopkart_jwt_secret_default_key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );

  const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
    secure: process.env.NODE_ENV === 'production', // Send over HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  };

  res.cookie('token', token, cookieOptions);

  return token;
};

module.exports = generateTokenAndSetCookie;
