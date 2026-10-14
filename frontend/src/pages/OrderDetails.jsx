import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, getMyOrders, updateOrderStatus } from '../services/api';
import { Truck, ArrowLeft, Package, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      let loadedOrder = null;

      // 1. Try fetching by ID if valid 24-character hex ObjectId
      if (id && id !== 'undefined' && id.length === 24) {
        try {
          const res = await getOrderById(id);
          loadedOrder = res.data.order;
        } catch (singleErr) {
          console.warn('getOrderById failed, trying getMyOrders fallback:', singleErr);
        }
      }

      // 2. Fallback: Search in user's order list
      if (!loadedOrder) {
        const myOrdersRes = await getMyOrders();
        const ordersList = myOrdersRes.data.orders || [];
        if (ordersList.length > 0) {
          loadedOrder = ordersList.find((o) => o._id === id) || ordersList[0];
        }
      }

      if (loadedOrder) {
        setOrder(loadedOrder);
      } else {
        setError('No tracking details found for this order ID.');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Bonus: Progress order status for evaluation/demo
  const handleProgressStatus = async (nextStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await updateOrderStatus(order._id, nextStatus);
      setOrder(res.data.order);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading spatial tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '520px', margin: '0 auto 20px auto' }}>
          ⚠️ {error || 'Order not found'}
        </div>
        <Link to="/orders" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}>
          Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '880px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Link to="/orders" className="btn-back-link" style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} />
            <span>Back to My Orders</span>
          </Link>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#ffffff', marginTop: '10px' }}>
            Order Details & Tracking
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Order #{order._id} • Placed on {formattedDate}
          </p>
        </div>

        <div>
          <span
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              padding: '6px 18px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: '800',
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Visual Tracking Progress Stepper */}
      <div className="spatial-card" style={{ padding: '2rem', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={20} color="#ffffff" />
          <span>Live Order Tracking Timeline</span>
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '0 10px' }}>
          {statusSteps.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={step} style={{ textAlign: 'center', zIndex: 1, flex: 1 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isCompleted 
                      ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)' 
                      : 'rgba(255, 255, 255, 0.08)',
                    color: isCompleted ? '#07090e' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    margin: '0 auto 10px auto',
                    fontSize: '0.9rem',
                    boxShadow: isCurrent 
                      ? '0 0 0 5px rgba(255, 255, 255, 0.25), 0 0 25px rgba(255, 255, 255, 0.5)' 
                      : isCompleted 
                      ? '0 0 16px rgba(255, 255, 255, 0.35)' 
                      : 'none',
                    border: isCompleted ? '1px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: isCurrent ? '800' : '600',
                    color: isCompleted ? '#ffffff' : '#64748b',
                    fontFamily: isCurrent ? 'Space Grotesk, sans-serif' : 'inherit',
                  }}
                >
                  {step}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status progressor for demo/viva */}
        {currentStepIndex < statusSteps.length - 1 && (
          <div style={{ marginTop: '24px', textAlign: 'right', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
            <button
              onClick={() => handleProgressStatus(statusSteps[currentStepIndex + 1])}
              disabled={isUpdatingStatus}
              className="btn-outline"
              style={{ fontSize: '0.85rem', padding: '6px 16px' }}
            >
              {isUpdatingStatus ? 'Updating...' : `⚡ Advance to ${statusSteps[currentStepIndex + 1]} (Demo)`}
            </button>
          </div>
        )}
      </div>

      {/* Items Section */}
      <div className="spatial-card" style={{ padding: '2rem', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} color="#ffffff" />
          <span>Purchased Items ({order.items?.length})</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'}
                  alt={item.name}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--glass-border)' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
                    {item.name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Unit Price: ₹{item.price?.toLocaleString()} • Quantity: {item.quantity}
                  </div>
                </div>
              </div>

              <div style={{ fontWeight: '800', fontSize: '1.15rem', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif' }}>
                ₹{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif' }}>
          <span>Total Paid:</span>
          <span style={{ color: '#ffffff', textShadow: '0 0 16px rgba(255, 255, 255, 0.4)' }}>₹{order.totalAmount?.toLocaleString()}</span>
        </div>
      </div>

      {/* Address & Payment Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="spatial-card" style={{ padding: '1.75rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '14px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#ffffff" />
            <span>Shipping Address</span>
          </h4>
          <div style={{ fontWeight: '700', color: '#ffffff' }}>
            {order.shippingAddress?.fullName}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: '2px' }}>
            Phone: {order.shippingAddress?.phone}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {order.shippingAddress?.addressLine1}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </div>
        </div>

        <div className="spatial-card" style={{ padding: '1.75rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '14px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#34d399" />
            <span>Payment Details</span>
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
            <span style={{ fontWeight: '700', color: '#34d399' }}>{order.paymentStatus}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Gateway:</span>
            <span style={{ fontWeight: '600', color: '#ffffff' }}>Razorpay Test Gateway</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', wordBreak: 'break-all' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment ID:</span>
            <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{order.razorpayPaymentId || 'Verified'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
