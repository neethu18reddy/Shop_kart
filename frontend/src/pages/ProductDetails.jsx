import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Tag, 
  Check, 
  AlertCircle, 
  ShoppingCart, 
  Shield, 
  Truck, 
  Loader2, 
  PackageX,
  Heart 
} from 'lucide-react';
import { getProductById, toggleWishlist, getWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedNotification, setAddedNotification] = useState('');
  
  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProductById(id);

        if (response.data.success && response.data.product) {
          setProduct(response.data.product);

          // Check if user is logged in and if product is already in their wishlist
          getWishlist()
            .then((wRes) => {
              if (wRes.data?.success && wRes.data.wishlist) {
                const found = wRes.data.wishlist.some(
                  (item) => item._id === id
                );
                setIsWishlisted(found);
              }
            })
            .catch(() => {});
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        if (err.response && err.response.status === 404) {
          setError('The requested product does not exist.');
        } else if (err.response && err.response.status === 400) {
          setError('Invalid product identifier format.');
        } else {
          setError('Failed to load product details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (addingToCart || product.stock <= 0) return;
    try {
      setAddingToCart(true);
      setAddedNotification('');
      await addItem(product._id);
      setAddedNotification('Added to Shopping Cart successfully!');
      setTimeout(() => setAddedNotification(''), 3000);
    } catch (err) {
      if (err.message && err.message.includes('Unauthorized')) {
        navigate('/login');
      } else {
        setAddedNotification(err.message || 'Failed to add to cart');
        setTimeout(() => setAddedNotification(''), 3000);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    try {
      setWishlistLoading(true);
      setWishlistMessage('');
      const res = await toggleWishlist(product._id);
      if (res.data.success) {
        setIsWishlisted(res.data.saved);
        setWishlistMessage(res.data.message);
        setTimeout(() => setWishlistMessage(''), 3000);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setWishlistMessage('Unable to update wishlist. Please try again.');
        setTimeout(() => setWishlistMessage(''), 3000);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="state-container state-loading" style={{ minHeight: '60vh' }}>
        <Loader2 size={42} className="spinner-icon" />
        <h3>Loading product specifications...</h3>
        <p>Retrieving product data from ShopKart API</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="state-container state-error" style={{ minHeight: '60vh' }}>
        <div className="state-icon-wrapper error">
          <PackageX size={40} />
        </div>
        <h3>Product Not Available</h3>
        <p>{error || 'We could not locate this item.'}</p>
        <Link to="/products" className="btn-state-action">
          <ArrowLeft size={16} />
          <span>Back to Product Catalogue</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="product-details-container">
      {/* Navigation Breadcrumb / Back Link */}
      <div className="product-details-back-nav">
        <button onClick={() => navigate('/products')} className="btn-back-link">
          <ArrowLeft size={18} />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="product-details-grid">
        {/* Left: Large Product Image */}
        <div className="product-details-image-panel">
          <div className="product-details-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-details-main-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <span className="product-details-category-pill">
              <Tag size={13} />
              {product.category}
            </span>
          </div>
        </div>

        {/* Right: Product Information & Purchase Actions */}
        <div className="product-details-info-panel">
          <div className="product-details-category-hint">{product.category}</div>
          <h1 className="product-details-title">{product.name}</h1>

          {/* Price & Stock Section */}
          <div className="product-details-price-row">
            <div className="product-details-price">{formattedPrice}</div>
            
            <div className={`product-details-stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
              {isOutOfStock ? (
                <>
                  <AlertCircle size={15} />
                  <span>Out of Stock</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>{product.stock} units in stock</span>
                </>
              )}
            </div>
          </div>

          <hr className="product-details-divider" />

          {/* Description */}
          <div className="product-details-description-block">
            <h3>About this item</h3>
            <p>{product.description}</p>
          </div>

          {/* Trust Highlights */}
          <div className="product-details-trust-grid">
            <div className="trust-item">
              <Truck size={18} color="var(--primary)" />
              <div>
                <strong>Free Express Shipping</strong>
                <p>On all orders above ₹999</p>
              </div>
            </div>
            <div className="trust-item">
              <Shield size={18} color="var(--success)" />
              <div>
                <strong>1 Year Guarantee</strong>
                <p>100% Genuine product</p>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {addedNotification && (
            <div className="alert alert-success" style={{ marginTop: '0.75rem', animation: 'slideDown 0.3s ease-out' }}>
              <Check size={18} />
              <span>{addedNotification}</span>
            </div>
          )}

          {wishlistMessage && (
            <div className={`alert ${isWishlisted ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: '0.75rem', animation: 'slideDown 0.3s ease-out' }}>
              <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
              <span>{wishlistMessage}</span>
            </div>
          )}

          {/* Action Buttons: Add to Cart, Wishlist, Continue Shopping */}
          <div className="product-details-actions">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="btn-add-to-cart"
            >
              {addingToCart ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>{isOutOfStock ? 'Sold Out' : isInCart(product._id) ? `Add Another (${getItemQuantity(product._id)} in Cart)` : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`btn-details-wishlist ${isWishlisted ? 'saved' : ''}`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {wishlistLoading ? (
                <Loader2 size={18} className="spinner-icon" />
              ) : (
                <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#64748b'} />
              )}
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>

            <Link to="/products" className="btn-continue-shopping">
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
