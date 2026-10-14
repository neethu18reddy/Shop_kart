import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [itemError, setItemError] = useState('');

  const product = item.product;
  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedItemTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price * item.quantity);

  const handleIncrement = async () => {
    if (updating || removing) return;
    if (item.quantity >= product.stock) {
      setItemError(`Only ${product.stock} units available in stock`);
      setTimeout(() => setItemError(''), 2500);
      return;
    }

    try {
      setUpdating(true);
      setItemError('');
      await updateQuantity(product._id, item.quantity + 1);
    } catch (err) {
      setItemError(err.message || 'Failed to update quantity');
      setTimeout(() => setItemError(''), 2500);
    } finally {
      setUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (updating || removing) return;
    if (item.quantity <= 1) return;

    try {
      setUpdating(true);
      setItemError('');
      await updateQuantity(product._id, item.quantity - 1);
    } catch (err) {
      setItemError(err.message || 'Failed to update quantity');
      setTimeout(() => setItemError(''), 2500);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (removing || updating) return;
    try {
      setRemoving(true);
      setItemError('');
      await removeItem(product._id);
    } catch (err) {
      setItemError(err.message || 'Failed to remove item');
      setRemoving(false);
    }
  };

  return (
    <div className="cart-item-row">
      {/* Product Image */}
      <div className="cart-item-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="cart-item-details">
        <Link to={`/products/${product._id}`} className="cart-item-title">
          {product.name}
        </Link>
        <span className="cart-item-category">{product.category}</span>
        <div className="cart-item-unit-price">{formattedPrice} each</div>

        {itemError && (
          <div className="cart-item-error-msg">
            <AlertCircle size={13} />
            <span>{itemError}</span>
          </div>
        )}
      </div>

      {/* Quantity Controls [-] Qty [+] */}
      <div className="cart-item-quantity-controls">
        <button
          onClick={handleDecrement}
          disabled={item.quantity <= 1 || updating || removing}
          className="btn-qty-control"
          title="Decrease quantity"
        >
          <Minus size={14} />
        </button>

        <span className="cart-item-qty-display">
          {updating ? <Loader2 size={14} className="spinner-icon" /> : item.quantity}
        </span>

        <button
          onClick={handleIncrement}
          disabled={item.quantity >= product.stock || updating || removing}
          className="btn-qty-control"
          title="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Item Total Price */}
      <div className="cart-item-total-col">
        <div className="cart-item-total-price">{formattedItemTotal}</div>
      </div>

      {/* Remove Action Button */}
      <div className="cart-item-remove-col">
        <button
          onClick={handleRemove}
          disabled={removing || updating}
          className="btn-cart-remove"
          title="Remove from Cart"
        >
          {removing ? (
            <Loader2 size={16} className="spinner-icon" />
          ) : (
            <Trash2 size={17} />
          )}
        </button>
      </div>
    </div>
  );
};

export default CartItem;
