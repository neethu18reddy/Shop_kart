import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, loading, error, subtotal, totalUnits, itemCount, refreshCart } = useCart();

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  // States handling
  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="state-container state-loading">
          <Loader2 size={42} className="spinner-icon" />
          <h3>Loading your cart...</h3>
          <p>Fetching your persistent cart items from MongoDB</p>
        </div>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="state-container state-error">
          <div className="state-icon-wrapper error">
            <AlertTriangle size={38} />
          </div>
          <h3>Unable to load your cart.</h3>
          <p>{error}</p>
          <button onClick={refreshCart} className="btn-state-action">
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="state-container state-empty">
          <div className="cart-empty-icon-wrapper">
            <ShoppingCart size={46} color="var(--primary)" />
          </div>
          <h3>Your cart is empty 🛒</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-state-action">
            <ShoppingBag size={16} />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      {/* Header */}
      <div className="cart-header">
        <div className="cart-header-title-group">
          <div className="cart-badge">
            <ShoppingCart size={14} />
            <span>Shopping Cart</span>
          </div>
          <h1>My Cart</h1>
          <p>
            You have <strong>{totalUnits}</strong> {totalUnits === 1 ? 'unit' : 'units'} across <strong>{itemCount}</strong> {itemCount === 1 ? 'product' : 'products'}
          </p>
        </div>

        <Link to="/products" className="btn-continue-shopping-link">
          <ShoppingBag size={15} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Main Cart Grid: Left Items List + Right Order Summary */}
      <div className="cart-layout-grid">
        {/* Left: Cart Items List */}
        <div className="cart-items-list-card">
          <div className="cart-items-list-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Action</span>
          </div>

          <div className="cart-items-list-body">
            {cartItems.map((item) => (
              <CartItem key={item.product?._id || item._id} item={item} />
            ))}
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="cart-summary-sidebar">
          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Total Items</span>
                <span>{itemCount} {itemCount === 1 ? 'product' : 'products'}</span>
              </div>

              <div className="cart-summary-row">
                <span>Total Units</span>
                <span>{totalUnits} units</span>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <span className="cart-free-shipping">FREE Express</span>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-row total">
                <span>Subtotal</span>
                <span className="cart-total-amount">{formattedSubtotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout Action */}
            <button
              onClick={() => navigate('/checkout')}
              className="btn-checkout"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Trust highlights */}
            <div className="cart-trust-badges">
              <div className="cart-trust-item">
                <ShieldCheck size={16} color="var(--success)" />
                <span>Secure SSL encrypted checkout</span>
              </div>
              <div className="cart-trust-item">
                <Truck size={16} color="var(--primary)" />
                <span>Fast express delivery available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
