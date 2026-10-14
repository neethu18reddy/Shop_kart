import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, User, LogIn, UserPlus, Grid, Heart, ShoppingCart, Package } from 'lucide-react';
import { logoutCustomer, getWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, onLogout, wishlistCount: propWishlistCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnits } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch live wishlist count from backend for authenticated user
  useEffect(() => {
    if (propWishlistCount !== undefined) {
      setWishlistCount(propWishlistCount);
    } else if (user) {
      getWishlist()
        .then((res) => {
          if (res.data?.success) {
            setWishlistCount(res.data.count || 0);
          }
        })
        .catch(() => {});
    } else {
      setWishlistCount(0);
    }
  }, [user, propWishlistCount, location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to={user ? "/home" : "/login"} className="brand-logo">
          <div className="brand-icon-box">
            <ShoppingBag size={18} />
          </div>
          <span>ShopKart</span>
        </Link>

        {/* Floating Dock Navigation Links */}
        <div className="nav-links-dock">
          {user && (
            <Link
              to="/home"
              className={`nav-link ${isActive('/home') ? 'active' : ''}`}
            >
              Home
            </Link>
          )}

          <Link
            to="/products"
            className={`nav-link ${isActive('/products') ? 'active' : ''}`}
          >
            <Grid size={15} style={{ marginRight: 5 }} />
            <span>Products</span>
          </Link>

          {user && (
            <>
              <Link
                to="/wishlist"
                className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}
              >
                <Heart size={15} style={{ marginRight: 5 }} color={isActive('/wishlist') ? '#fb7185' : 'currentColor'} />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="navbar-wishlist-count-badge">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
              >
                <ShoppingCart size={15} style={{ marginRight: 5 }} />
                <span>Cart</span>
                <span className="navbar-cart-count-badge">
                  {totalUnits}
                </span>
              </Link>

              <Link
                to="/orders"
                className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
              >
                <Package size={15} style={{ marginRight: 5 }} />
                <span>Orders</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <div className="user-badge">
              <User size={15} />
              <span>{user.fullName || 'Customer'}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout" title="Logout">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-logout" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <LogIn size={15} />
                <span>Login</span>
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-logout" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', color: '#07090e', fontWeight: 800, borderColor: 'rgba(255,255,255,0.8)', boxShadow: '0 0 16px rgba(255,255,255,0.3)' }}>
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
