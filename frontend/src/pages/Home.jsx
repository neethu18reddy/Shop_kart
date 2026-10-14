import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ShoppingBag, 
  KeyRound, 
  CheckCircle, 
  AlertCircle,
  Package,
  Heart,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { getMyProfile, changePassword } from '../services/api';

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getMyProfile();
        setUser(response.data);
      } catch (error) {
        console.warn('Unauthorized or error fetching profile:', error);
        setUser(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, setUser]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!oldPassword || !newPassword) {
      setPwdError('Please enter both current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await changePassword({ oldPassword, newPassword });
      setPwdSuccess(res.data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwdSuccess('');
      }, 2000);
    } catch (error) {
      setPwdError(error.response?.data?.message || 'Failed to change password. Verify your old password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ flexDirection: 'column', gap: '1.25rem' }}>
        <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3 }}></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Authenticating Spatial Session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
      {/* Bespoke Liquid Titanium Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(203, 213, 225, 0.05) 50%, rgba(255, 255, 255, 0.03) 100%)',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.75rem 2.5rem',
        marginBottom: '2.25rem',
        boxShadow: 'var(--spatial-shadow-lg), 0 0 35px rgba(255, 255, 255, 0.1), var(--specular-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Platinum Specular Glow Orb */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '-0.7px',
            color: '#ffffff',
            textShadow: '0 0 25px rgba(255, 255, 255, 0.25)',
            margin: 0
          }}>
            Welcome back, {user.fullName}! 👋
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Link
            to="/products"
            className="btn-primary"
            style={{
              padding: '0.85rem 1.45rem',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              width: 'auto'
            }}
          >
            <Sparkles size={18} />
            <span>Discover Catalog</span>
            <ArrowRight size={16} />
          </Link>

          <button 
            onClick={() => setShowPasswordModal(!showPasswordModal)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              color: '#ffffff',
              border: '1px solid var(--glass-border)',
              padding: '0.85rem 1.35rem',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
            }}
          >
            <KeyRound size={17} color="#ffffff" />
            <span>{showPasswordModal ? 'Close Settings' : 'Change Password'}</span>
          </button>
        </div>
      </div>

      {/* Change Password Spatial Panel */}
      {showPasswordModal && (
        <div className="spatial-card" style={{
          padding: '2rem',
          marginBottom: '2.25rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <KeyRound size={22} color="#ffffff" />
            <span>Update Account Password</span>
          </h3>

          {pwdError && (
            <div className="alert alert-danger" style={{ marginBottom: '1.2rem' }}>
              <AlertCircle size={18} />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '1.2rem' }}>
              <CheckCircle size={18} />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Old Password</label>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '1.15rem' }}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '1.15rem' }}
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={pwdLoading}
              style={{ height: 48, borderRadius: 'var(--radius-pill)' }}
            >
              {pwdLoading ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Profile & Security Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
        
        {/* Customer Identity Card */}
        <div className="spatial-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={20} color="#ffffff" />
            <span>Customer Profile</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem', background: 'rgba(10, 13, 20, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem', borderRadius: '50%', color: '#ffffff' }}>
                <User size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{user.fullName}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem', background: 'rgba(10, 13, 20, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ background: 'rgba(45, 212, 191, 0.15)', padding: '0.6rem', borderRadius: '50%', color: '#2dd4bf' }}>
                <Mail size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem', background: 'rgba(10, 13, 20, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem', borderRadius: '50%', color: '#ffffff' }}>
                <Phone size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{user.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Session Info Card */}
        <div className="spatial-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="#34d399" />
            <span>Authentication Status</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Account ID:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>{user._id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Session Security:</span>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>HttpOnly JWT Cookie</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Payment Engine:</span>
              <span style={{ fontWeight: 700, color: '#2dd4bf', fontSize: '0.92rem' }}>Razorpay Standard Gateway</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Protected Profile:</span>
              <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.92rem' }}>Active (/customers/me)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Feature Navigation Modules Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Products Discovery Card */}
        <div className="spatial-card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', marginBottom: '1rem', boxShadow: '0 0 16px rgba(255, 255, 255, 0.18)' }}>
              <ShoppingBag size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '0.45rem' }}>
              Product Discovery
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Browse curated items with real-time search, category filtering, and sorting.
            </p>
          </div>

          <Link
            to="/products"
            className="btn-primary"
            style={{ width: '100%', textDecoration: 'none', padding: '0.75rem', borderRadius: 'var(--radius-pill)' }}
          >
            <span>Explore Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Wishlist Feature Card */}
        <div className="spatial-card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185', marginBottom: '1rem', boxShadow: '0 0 16px rgba(244, 63, 94, 0.3)' }}>
              <Heart size={20} fill="#fb7185" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '0.45rem' }}>
              Saved Wishlist
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Persistent wishlist saved in MongoDB with instant add/remove controls.
            </p>
          </div>

          <Link
            to="/wishlist"
            className="btn-continue-browsing"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            <Heart size={16} fill="#fb7185" color="#fb7185" />
            <span>Open Wishlist</span>
          </Link>
        </div>

        {/* Shopping Cart Feature Card */}
        <div className="spatial-card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(45, 212, 191, 0.15)', border: '1px solid rgba(45, 212, 191, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', marginBottom: '1rem', boxShadow: '0 0 16px rgba(45, 212, 191, 0.3)' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '0.45rem' }}>
              Shopping Cart
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Dynamic quantity adjustments, live stock limits, and derived total calculation.
            </p>
          </div>

          <Link
            to="/cart"
            className="btn-primary"
            style={{ width: '100%', textDecoration: 'none', padding: '0.75rem', borderRadius: 'var(--radius-pill)' }}
          >
            <span>View Cart</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Orders & Tracking Feature Card */}
        <div className="spatial-card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1rem', boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)' }}>
              <Package size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '0.45rem' }}>
              Orders & Tracking
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Razorpay verified orders with persistent receipt history and live status tracking.
            </p>
          </div>

          <Link
            to="/orders"
            className="btn-continue-browsing"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            <Package size={16} color="#34d399" />
            <span>My Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
