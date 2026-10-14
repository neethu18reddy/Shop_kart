import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import { loadRazorpayScript } from '../utils/loadRazorpay';
import { ShieldCheck, Truck, ShoppingBag, CreditCard, Lock, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalUnits, loading: cartLoading, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error as user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setErrorMessage('');
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Main Checkout & Razorpay Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Add products before placing an order.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call Backend to validate cart, stock, and calculate server-side order total
      const response = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = response.data;

      // 2. Load official Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded || !window.Razorpay) {
        setIsProcessing(false);
        setErrorMessage('Razorpay Checkout SDK failed to load. Please check your internet connection.');
        return;
      }

      // 3. Open Official Razorpay Checkout Modal
      const options = {
        key: key || 'rzp_test_shopkart12345',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: '#0f172a',
        },
        handler: async function (paymentResponse) {
          try {
            await handleVerifyPayment({
              shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
          } catch (err) {
            console.error('Payment verification failed:', err);
            setIsProcessing(false);
            setErrorMessage(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setErrorMessage('Payment was cancelled. Your cart has been preserved.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse.error);
        setIsProcessing(false);
        setErrorMessage(
          `Payment failed: ${failResponse.error?.description || 'Transaction unsuccessful'}. Your cart was not cleared.`
        );
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setErrorMessage(
        err.response?.data?.message || 'Failed to initiate checkout. Please check product availability.'
      );
    }
  };

  // Helper to verify payment on backend and navigate to order confirmation
  const handleVerifyPayment = async (verificationPayload) => {
    try {
      const verifyRes = await verifyPayment(verificationPayload);
      if (verifyRes.data.success) {
        // Reset global cart state and Navbar count
        await refreshCart();
        // Navigate to confirmation page
        const confirmedId = verifyRes.data.order?._id || verificationPayload.shopKartOrderId;
        navigate(`/order-success/${confirmedId}`);
      }
    } catch (error) {
      setIsProcessing(false);
      setErrorMessage(
        error.response?.data?.message || 'Payment signature verification failed. Cart preserved.'
      );
    }
  };

  if (cartLoading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading checkout studio...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '12px' }}>
          Your Cart is Empty
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          You have no items in your cart to checkout.
        </p>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.85rem 1.6rem', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1140px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="products-badge">
            <Lock size={12} />
            <span>Secure Spatial Gateway</span>
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#ffffff', letterSpacing: '-0.7px' }}>
          Checkout
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '1.05rem' }}>
          Enter your delivery destination and finalize your order via Razorpay Test Gateway.
        </p>
      </div>

      {errorMessage && (
        <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
        {/* Left Column: Shipping Details Form */}
        <div className="spatial-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="#ffffff" />
            <span>Shipping Details</span>
          </h2>

          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="form-group">
              <label className="form-label">
                Full Name <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                className={`form-input ${formErrors.fullName ? 'input-error' : ''}`}
                style={{ paddingLeft: '1.15rem' }}
              />
              {formErrors.fullName && (
                <span style={{ color: '#fb7185', fontSize: '0.825rem', marginTop: '4px' }}>
                  {formErrors.fullName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                style={{ paddingLeft: '1.15rem' }}
              />
              {formErrors.phone && (
                <span style={{ color: '#fb7185', fontSize: '0.825rem', marginTop: '4px' }}>
                  {formErrors.phone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Address Line 1 <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                className={`form-input ${formErrors.addressLine1 ? 'input-error' : ''}`}
                style={{ paddingLeft: '1.15rem' }}
              />
              {formErrors.addressLine1 && (
                <span style={{ color: '#fb7185', fontSize: '0.825rem', marginTop: '4px' }}>
                  {formErrors.addressLine1}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  City <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className={`form-input ${formErrors.city ? 'input-error' : ''}`}
                  style={{ paddingLeft: '1.15rem' }}
                />
                {formErrors.city && (
                  <span style={{ color: '#fb7185', fontSize: '0.825rem', marginTop: '4px' }}>
                    {formErrors.city}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  State <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className={`form-input ${formErrors.state ? 'input-error' : ''}`}
                  style={{ paddingLeft: '1.15rem' }}
                />
                {formErrors.state && (
                  <span style={{ color: '#fb7185', fontSize: '0.825rem', marginTop: '4px' }}>
                    {formErrors.state}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">
                Pincode (6 digits) <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 560001"
                className={`form-input ${formErrors.pincode ? 'input-error' : ''}`}
                style={{ paddingLeft: '1.15rem' }}
              />
              {formErrors.pincode && (
                <span style={{ color: '#fb7185', fontSize: '0.825rem', marginTop: '4px' }}>
                  {formErrors.pincode}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {isProcessing ? (
                <>
                  <div className="spinner" style={{ width: '22px', height: '22px', borderWidth: '2px' }}></div>
                  Opening Razorpay Checkout...
                </>
              ) : (
                <>💳 Place Order & Pay with Razorpay</>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="spatial-card" style={{ padding: '2rem', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '18px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="#ffffff" />
              <span>Order Review ({totalUnits} {totalUnits === 1 ? 'item' : 'items'})</span>
            </h2>

            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '6px' }}>
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'}
                    alt={item.product.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--glass-border)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Qty: {item.quantity} × ₹{item.product.price?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif' }}>
                    ₹{(item.quantity * item.product.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '700', color: '#ffffff' }}>₹{subtotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span>Shipping:</span>
              <span style={{ color: '#34d399', fontWeight: '700' }}>FREE</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span>GST & Handling:</span>
              <span style={{ fontWeight: '700', color: '#ffffff' }}>Included</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '16px',
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#ffffff',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              <span>Total Amount:</span>
              <span style={{ color: '#ffffff', textShadow: '0 0 16px rgba(255, 255, 255, 0.4)' }}>
                ₹{subtotal.toLocaleString()}
              </span>
            </div>

            <div style={{ marginTop: '22px', padding: '14px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#ffffff" />
              <span><strong>Razorpay Test Mode</strong>. Instant simulated payment with zero real deduction.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
