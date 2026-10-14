import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import { getMyProfile } from './services/api';
import { CartProvider } from './context/CartContext';

function App() {
  const [user, setUser] = useState(null);

  // Initial check to see if customer session cookie is already active
  const checkAuthStatus = async () => {
    try {
      const res = await getMyProfile();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Navbar user={user} onLogout={() => setUser(null)} />
          <Routes>
            {/* Public Auth Routes (Lab 01 & 02) */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLoginSuccess={checkAuthStatus} />} />

            {/* Protected Home Route */}
            <Route path="/home" element={<Home user={user} setUser={setUser} />} />

            {/* Product Discovery Routes (Lab 03) */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            {/* Wishlist Route (Lab 04) */}
            <Route path="/wishlist" element={<Wishlist />} />

            {/* Shopping Cart Route (Lab 05) */}
            <Route path="/cart" element={<Cart />} />

            {/* Checkout & Orders Routes (Lab 06) */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/tracking" element={<Orders />} />
            <Route path="/tracking/:id" element={<OrderDetails />} />
            <Route path="/order-tracking/:id" element={<OrderDetails />} />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
