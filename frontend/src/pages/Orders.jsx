import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';
import { Package, Truck, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' };
      case 'CONFIRMED':
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#ffffff', border: 'rgba(255, 255, 255, 0.3)' };
      case 'SHIPPED':
        return { bg: 'rgba(45, 212, 191, 0.15)', text: '#2dd4bf', border: 'rgba(45, 212, 191, 0.35)' };
      case 'DELIVERED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', text: '#94a3b8', border: 'rgba(255, 255, 255, 0.15)' };
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '520px', margin: '0 auto 20px auto' }}>
          ⚠️ {error}
        </div>
        <button onClick={fetchOrders} className="btn-primary" style={{ width: 'auto', display: 'inline-flex', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-pill)' }}>
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📦</div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '12px' }}>
          No Orders Placed Yet
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Explore our product catalog and start shopping today.
        </p>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '0.85rem 1.6rem', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}>
          🛍️ Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '960px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="products-badge">
            <Package size={12} />
            <span>Order History</span>
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: '#ffffff', letterSpacing: '-0.7px' }}>
          My Orders
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '1.05rem' }}>
          Track and review your purchases ({orders.length} {orders.length === 1 ? 'order' : 'orders'}).
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {orders.map((order) => {
          const statusStyle = getStatusColor(order.status);
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={order._id}
              className="spatial-card"
              style={{
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#ffffff', fontFamily: 'monospace' }}>
                    Order #{order._id}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>
                    Placed on {formattedDate}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      border: `1px solid ${statusStyle.border}`,
                      padding: '4px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {order.status}
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif', textShadow: '0 0 14px rgba(255, 255, 255, 0.35)' }}>
                    ₹{order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.92rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                        />
                      )}
                      <div>
                        <span style={{ fontWeight: '700', color: '#ffffff' }}>{item.name}</span>
                        <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>× {item.quantity}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif' }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                <Link to={`/orders/${order._id}`} className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                  <span>View Tracking & Receipt</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
