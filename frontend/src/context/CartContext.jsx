import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext();

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

export const CartProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const syncCart = useCallback((cart) => {
    setCartItems((cart?.items || []).map(normalizeItem));
  }, []);

  const fetchCart = useCallback(async () => {
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
  }, [syncCart]);

  useEffect(() => {
    if (!loading && user) {
      fetchCart();
    }
  }, [fetchCart, user, loading]);

  useEffect(() => {
    if (!loading && !user) {
      setCartItems([]);
    }
  }, [user, loading]);

  const addToCart = useCallback(async (product, quantity = 1) => {
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
  }, [syncCart, user]);

  const removeFromCart = useCallback(async (productId) => {
    const cart = await cartService.removeItem(productId);
    syncCart(cart);
  }, [syncCart]);

  const removeItemsFromCart = useCallback(async (productIds) => {
    const cart = await cartService.removeItems(productIds);
    syncCart(cart);
  }, [syncCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return;
    const cart = await cartService.updateQuantity(productId, quantity);
    syncCart(cart);
  }, [syncCart]);

  const clearCart = useCallback(async () => {
    if (user) {
      await cartService.clearCart();
    }
    setCartItems([]);
  }, [user]);

  const cartTotal = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    removeItemsFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    cartTotal,
    cartCount,
    cartLoading,
    isCartOpen,
    setIsCartOpen
  }), [
    addToCart,
    cartCount,
    cartItems,
    cartLoading,
    cartTotal,
    clearCart,
    fetchCart,
    isCartOpen,
    removeFromCart,
    removeItemsFromCart,
    updateQuantity
  ]);

  return (
    <CartContext.Provider value={value}>
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
