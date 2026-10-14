import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';
import { getWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlist();

      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError("We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserWishlist();
  }, []);

  const handleItemRemoved = (removedProductId) => {
    // Optimistically update list without full page reload
    setWishlist((prev) => prev.filter((item) => item._id !== removedProductId));
  };

  return (
    <div className="wishlist-page-container">
      {/* Header */}
      <div className="wishlist-header">
        <div className="wishlist-header-title-group">
          <div className="wishlist-badge">
            <Heart size={14} fill="#ef4444" color="#ef4444" />
            <span>Saved Items</span>
          </div>
          <h1>My Wishlist</h1>
          <p>
            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved in your personal collection
          </p>
        </div>

        {wishlist.length > 0 && (
          <Link to="/products" className="btn-continue-browsing">
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        )}
      </div>

      {/* States: Loading / Error / Empty / Grid */}
      {loading ? (
        <div className="state-container state-loading">
          <Loader2 size={42} className="spinner-icon" />
          <h3>Loading your wishlist...</h3>
          <p>Fetching your saved products from MongoDB</p>
        </div>
      ) : error ? (
        <div className="state-container state-error">
          <div className="state-icon-wrapper error">
            <AlertTriangle size={38} />
          </div>
          <h3>Something went wrong.</h3>
          <p>{error}</p>
          <button onClick={fetchUserWishlist} className="btn-state-action">
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="state-container state-empty">
          <div className="wishlist-empty-heart-wrapper">
            <Heart size={44} fill="#fca5a5" color="#ef4444" />
          </div>
          <h3>Your wishlist is empty ❤️</h3>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn-state-action">
            <ShoppingBag size={16} />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="products-grid wishlist-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={handleItemRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
