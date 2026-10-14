import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Check, AlertCircle, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { removeFromWishlist } from '../services/api';

const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleRemove = async () => {
    if (removing) return;
    try {
      setRemoving(true);
      await removeFromWishlist(product._id);
      if (onRemove) {
        onRemove(product._id);
      }
    } catch (error) {
      console.error('Failed to remove product from wishlist:', error);
      alert('Unable to remove product from wishlist. Please try again.');
      setRemoving(false);
    }
  };

  return (
    <div className="product-card wishlist-card">
      {/* Product Image */}
      <div className="product-card-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <span className="product-card-category-badge">
          <Tag size={12} />
          {product.category}
        </span>
      </div>

      {/* Product Content */}
      <div className="product-card-body">
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-meta">
          <div className="product-card-price">{formattedPrice}</div>
          
          <div className={`product-card-stock ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock ? (
              <>
                <AlertCircle size={13} />
                <span>Out of Stock</span>
              </>
            ) : (
              <>
                <Check size={13} />
                <span>{product.stock} in stock</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons: View Details & Remove */}
        <div className="wishlist-card-actions">
          <Link to={`/products/${product._id}`} className="btn-view-details" style={{ flex: 1 }}>
            <span>View</span>
            <ArrowRight size={15} />
          </Link>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="btn-remove-wishlist"
            title="Remove from Wishlist"
          >
            {removing ? (
              <Loader2 size={16} className="spinner-icon" />
            ) : (
              <>
                <Trash2 size={16} />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
