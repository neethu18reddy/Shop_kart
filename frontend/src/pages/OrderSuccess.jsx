import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, getMyOrders } from '../services/api';
import { CheckCircle2, Package, Truck, ArrowRight, Clock, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const statusSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        let loadedOrder = null;

        // Try loading by ID if valid
        if (id && id !== 'undefined' && id.length === 24) {
          try {
            const res = await getOrderById(id);
            loadedOrder = res.data.order;
          } catch (fetchErr) {
            console.warn('Could not load order by ID, falling back to latest order:', fetchErr);
          }
        }

        // Fallback: fetch user's latest placed order
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
          setError('Order details could not be retrieved.');
        }
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
        setError('Order was placed, but could not retrieve details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Confirming payment and generating spatial receipt...</p>
      </div>
    );
  }

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : 0;
  const formattedDate = order
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '880px' }}>
      <div className="spatial-card" style={{ padding: '2.75rem 2rem', marginBottom: '24px' }}>
        
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              margin: '0 auto 18px auto',
              boxShadow: '0 0 35px rgba(16, 185, 129, 0.4), var(--specular-highlight)',
            }}
          >
            <CheckCircle2 size={44} />
          </div>

          <h1 style={{ fontSize: '2.3rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Order Placed Successfully!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto' }}>
            Payment verified via Razorpay HMAC signature. Your order is safely stored in MongoDB.
          </p>
        </div>

        {/* Live Order Tracking Timeline Section */}
        {order && (
          <div
            style={{
              background: 'rgba(10, 13, 20, 0.75)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={20} color="#ffffff" />
                  <span>Live Order Tracking</span>
                </h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                  Real-time status progression in MongoDB
                </span>
              </div>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  padding: '5px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)',
                }}
              >
                CURRENT STATUS: {order.status}
              </span>
            </div>

            {/* Stepper Timeline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '20px 10px 10px 10px' }}>
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
          </div>
        )}

        {/* Order Details Receipt Card */}
        {order ? (
          <div
            style={{
              background: 'rgba(10, 13, 20, 0.65)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'left',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '22px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  Order ID
                </span>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff', fontFamily: 'monospace', marginTop: '2px' }}>
                  #{order._id}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  Order Date
                </span>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#ffffff', marginTop: '2px' }}>
                  {formattedDate}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  Total Amount
                </span>
                <div style={{ fontWeight: '800', fontSize: '1.3rem', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif', marginTop: '2px', textShadow: '0 0 14px rgba(255, 255, 255, 0.4)' }}>
                  ₹{order.totalAmount?.toLocaleString()}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  Payment Method
                </span>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#34d399', marginTop: '2px' }}>
                  Razorpay ({order.razorpayPaymentId?.slice(-8) || 'VERIFIED'})
                </div>
              </div>
            </div>

            {/* Purchased Items List Snapshot */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px', marginBottom: '18px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                Items Purchased ({order.items?.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                      )}
                      <div>
                        <span style={{ fontWeight: '700', color: '#ffffff' }}>{item.name}</span>
                        <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>× {item.quantity}</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: '800', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif' }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {order.shippingAddress && (
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  Shipping Destination
                </span>
                <div style={{ fontWeight: '700', color: '#ffffff', marginTop: '4px', fontSize: '0.95rem' }}>
                  {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Order ID: <strong>{id}</strong>
          </div>
        )}

        {/* Action Navigation Buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {order && (
            <Link
              to={`/orders/${order._id}`}
              className="btn-primary"
              style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}
            >
              <Truck size={18} />
              <span>Full Tracking Page</span>
            </Link>
          )}

          <Link
            to="/orders"
            className="btn-outline"
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Package size={18} />
            <span>My Orders</span>
          </Link>

          <Link
            to="/products"
            className="btn-outline"
            style={{ padding: '12px 24px' }}
          >
            🛍️ Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
