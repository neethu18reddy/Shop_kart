import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCart, addToCart, updateCartQuantity, removeFromCart } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart from backend
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCart();
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
      }
    } catch (err) {
      // 401 means user is not authenticated yet; not a fatal error
      if (err.response && err.response.status === 401) {
        setCartItems([]);
      } else {
        console.error('Failed to load cart:', err);
        setError('Unable to load your cart.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Derived Values: Never stored separately in MongoDB or duplicated in state!
  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * (item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  // Add Item
  const addItem = async (productId) => {
    try {
      setError(null);
      const res = await addToCart(productId);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      throw new Error(msg);
    }
  };

  // Update Quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      setError(null);
      const res = await updateCartQuantity(productId, quantity);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      throw new Error(msg);
    }
  };

  // Remove Item
  const removeItem = async (productId) => {
    try {
      setError(null);
      const res = await removeFromCart(productId);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      throw new Error(msg);
    }
  };

  // Helpers
  const isInCart = (productId) => {
    return cartItems.some((item) => (item.product?._id || item.product) === productId);
  };

  const getItemQuantity = (productId) => {
    const found = cartItems.find((item) => (item.product?._id || item.product) === productId);
    return found ? found.quantity : 0;
  };

  const value = {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    itemCount,
    refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
