const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart12345';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_razorpay_secret_key_2026';

let razorpay = null;

try {
  razorpay = new Razorpay({
    key_id,
    key_secret,
  });
} catch (error) {
  console.warn('⚠️ Razorpay initialization failed:', error.message);
}

module.exports = razorpay;
