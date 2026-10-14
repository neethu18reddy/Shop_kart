import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, Check, AlertCircle, ArrowRight, Heart, Loader2, ShoppingCart } from 'lucide-react';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, initialWishlisted = false, onWishlistChange }) => {
  const navigate = useNavigate();
  const { addItem, isInCart, getItemQuantity } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Cart action state
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState('');

  const isOutOfStock = product.stock <= 0;
  const inCart = isInCart(product._id);
  const cartQty = getItemQuantity(product._id);

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingWishlist) return;

    try {
      setLoadingWishlist(true);
      setFeedbackMessage('');

      const res = await toggleWishlist(product._id);

      if (res.data.success) {
        setIsWishlisted(res.data.saved);
        if (onWishlistChange) {
          onWishlistChange(product._id, res.data.saved);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        setFeedbackMessage('Unable to save product. Please try again.');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart || isOutOfStock) return;

    try {
      setAddingToCart(true);
      setCartSuccessMessage('');
      await addItem(product._id);
      setCartSuccessMessage(inCart ? `Added another (${cartQty + 1})` : 'Added to Cart!');
      setTimeout(() => setCartSuccessMessage(''), 2500);
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        navigate('/login');
      } else {
        setFeedbackMessage(error.message || 'Failed to add to cart');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="product-card">
      {/* Product Image & Wishlist Corner Icon */}
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

        {/* Floating Quick Heart Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={loadingWishlist}
          className={`btn-card-floating-heart ${isWishlisted ? 'active' : ''}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {loadingWishlist ? (
            <Loader2 size={16} className="spinner-icon" />
          ) : (
            <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#64748b'} />
          )}
        </button>
      </div>

      {/* Product Content */}
      <div className="product-card-body">
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        <p className="product-card-description">
          {product.description}
        </p>

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
                <span>{product.stock} left</span>
              </>
            )}
          </div>
        </div>

        {/* Feedback message if wishlist or cart failed */}
        {feedbackMessage && (
          <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            {feedbackMessage}
          </div>
        )}

        {cartSuccessMessage && (
          <div style={{ color: '#059669', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            {cartSuccessMessage}
          </div>
        )}

        {/* Primary Action Buttons: Add to Cart & View Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isOutOfStock}
            className={`btn-card-add-cart ${inCart ? 'in-cart' : ''}`}
          >
            {addingToCart ? (
              <>
                <Loader2 size={15} className="spinner-icon" />
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : inCart ? (
              <>
                <ShoppingCart size={15} />
                <span>Add Another ({cartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <div className="product-card-action-row">
            <Link to={`/products/${product._id}`} className="btn-view-details" style={{ flex: 1 }}>
              <span>Details</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={handleWishlistToggle}
              disabled={loadingWishlist}
              className={`btn-action-wishlist ${isWishlisted ? 'saved' : ''}`}
            >
              <Heart size={14} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
              <span>{isWishlisted ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
