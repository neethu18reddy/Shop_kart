import axios from 'axios';

// Create central Axios instance with backend base URL and credentials enabled
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // Allows browser to automatically send & receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication APIs (Lab 01 & 02)
export const registerCustomer = (data) => api.post('/customers/register', data);
export const loginCustomer = (data) => api.post('/customers/login', data);
export const getMyProfile = () => api.get('/customers/me');
export const logoutCustomer = () => api.post('/customers/logout');
export const changePassword = (data) => api.patch('/customers/change-password', data);

// Product APIs (Lab 03)
export const getProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);

// Wishlist APIs (Lab 04)
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const getWishlist = () => api.get('/wishlist');
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const toggleWishlist = (productId) => api.patch(`/wishlist/${productId}/toggle`);

// Shopping Cart APIs (Lab 05)
export const addToCart = (productId) => api.post(`/cart/${productId}`);
export const getCart = () => api.get('/cart');
export const updateCartQuantity = (productId, quantity) => api.patch(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// Order & Checkout APIs (Lab 06)
export const createPaymentOrder = (shippingAddress) => api.post('/orders/create-payment-order', { shippingAddress });
export const verifyPayment = (paymentData) => api.post('/orders/verify-payment', paymentData);
export const getMyOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });

export default api;
