import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      fetchCart();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !user) {
      setCartItems([]);
    }
  }, [user, loading]);

  const normalizeItem = (item) => ({
    id: item.productId || item.id,
    productId: item.productId || item.id,
    name: item.productName || item.name,
    productName: item.productName || item.name,
    slug: item.slug,
    imageUrl: item.imageUrl,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    subTotal: Number(item.subTotal || item.price * item.quantity || 0)
  });

  const syncCart = (cart) => {
    setCartItems((cart?.items || []).map(normalizeItem));
  };

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const cart = await cartService.getCart();
      syncCart(cart);
    } catch (error) {
      console.error('Failed to fetch cart', error);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      return {
        success: false,
        authRequired: true,
        message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.'
      };
    }

    try {
      const cart = await cartService.addItem(product.id, quantity);
      syncCart(cart);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng.'
      };
    }
  };

  const removeFromCart = async (productId) => {
    const cart = await cartService.removeItem(productId);
    syncCart(cart);
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    const cart = await cartService.updateQuantity(productId, quantity);
    syncCart(cart);
  };

  const clearCart = async () => {
    if (user) {
      await cartService.clearCart();
    }
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      fetchCart,
      cartTotal,
      cartCount,
      cartLoading,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
