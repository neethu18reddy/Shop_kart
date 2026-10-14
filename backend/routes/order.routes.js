const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// Protect all order routes with JWT authentication
router.use(protect);

// POST /orders/create-payment-order
router.post('/create-payment-order', orderController.createPaymentOrder);

// POST /orders/verify-payment
router.post('/verify-payment', orderController.verifyPayment);

// GET /orders
router.get('/', orderController.getMyOrders);

// GET /orders/:id
router.get('/:id', orderController.getOrderById);

// PATCH /orders/:id/status (Bonus progression)
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
