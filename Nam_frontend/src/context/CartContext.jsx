import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import toast from 'react-hot-toast';
import { MESSAGES } from '../utils/constants';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const response = await cartService.getCart();
        // Handle response structure { success: true, data: { cart: ... } }
        const cartData = response.data?.cart || response.cart;
        setCart(cartData || { items: [], total: 0, itemCount: 0 });
        setAppliedVoucher(response.data?.voucher || response.voucher);
      } else {
        // Load from local storage
        const localCart = cartService.getLocalCart();
        setCart(localCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        const response = await cartService.addItem(product.id, quantity);
        const cartData = response.data?.cart || response.cart;
        setCart(cartData || { items: [], total: 0, itemCount: 0 });
        toast.success(MESSAGES.SUCCESS.ADD_TO_CART);
      } else {
        // Add to local storage
        const localCart = cartService.getLocalCart();
        const existingItem = localCart.items.find(item => item.productId === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localCart.items.push({
            productId: product.id,
            product: product,
            quantity: quantity,
            price: product.price
          });
        }
        
        // Recalculate total
        localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        localCart.itemCount = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        cartService.saveLocalCart(localCart);
        setCart(localCart);
        toast.success(MESSAGES.SUCCESS.ADD_TO_CART);
      }
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.ADD_TO_CART);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (isAuthenticated) {
        const response = await cartService.updateQuantity(productId, quantity);
        const cartData = response.data?.cart || response.cart;
        setCart(cartData || { items: [], total: 0, itemCount: 0 });
        toast.success(MESSAGES.SUCCESS.UPDATE_CART);
      } else {
        const localCart = cartService.getLocalCart();
        const item = localCart.items.find(item => item.productId === productId);
        
        if (item) {
          if (quantity <= 0) {
            localCart.items = localCart.items.filter(item => item.productId !== productId);
          } else {
            item.quantity = quantity;
          }
          
          localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          localCart.itemCount = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
          
          cartService.saveLocalCart(localCart);
          setCart(localCart);
          toast.success(MESSAGES.SUCCESS.UPDATE_CART);
        }
      }
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.UPDATE_CART);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        const response = await cartService.removeItem(productId);
        const cartData = response.data?.cart || response.cart;
        setCart(cartData || { items: [], total: 0, itemCount: 0 });
        toast.success(MESSAGES.SUCCESS.REMOVE_FROM_CART);
      } else {
        const localCart = cartService.getLocalCart();
        localCart.items = localCart.items.filter(item => item.productId !== productId);
        localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        localCart.itemCount = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        cartService.saveLocalCart(localCart);
        setCart(localCart);
        toast.success(MESSAGES.SUCCESS.REMOVE_FROM_CART);
      }
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.REMOVE_FROM_CART);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await cartService.clearCart();
      } else {
        cartService.clearLocalCart();
      }
      setCart({ items: [], total: 0, itemCount: 0 });
      setAppliedVoucher(null);
      toast.success(MESSAGES.SUCCESS.CLEAR_CART);
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.CLEAR_CART);
      throw error;
    }
  };

  const applyVoucher = async (code) => {
    try {
      const response = await cartService.applyVoucher(code);
      setCart(response.cart);
      setAppliedVoucher(response.voucher);
      toast.success(MESSAGES.SUCCESS.APPLY_VOUCHER);
      return response;
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.APPLY_VOUCHER);
      throw error;
    }
  };

  const removeVoucher = async () => {
    try {
      const response = await cartService.removeVoucher();
      setCart(response.cart);
      setAppliedVoucher(null);
      toast.success('Đã xóa mã giảm giá');
    } catch (error) {
      toast.error('Không thể xóa mã giảm giá');
      throw error;
    }
  };

  const syncCart = async () => {
    try {
      const response = await cartService.syncCart();
      setCart(response.cart);
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const value = {
    cart,
    isLoading,
    appliedVoucher,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyVoucher,
    removeVoucher,
    syncCart,
    loadCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;
