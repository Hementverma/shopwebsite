import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      setCart(data.cart);
    } catch (error) { console.error('Cart fetch error'); }
    finally { setLoading(false); }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items to cart'); return false; }
    try {
      const { data } = await API.post('/cart/add', { productId, quantity });
      setCart(data.cart);
      toast.success('Added to cart');
      return true;
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to add'); return false; }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await API.put(`/cart/item/${productId}`, { quantity });
      setCart(data.cart);
    } catch (error) { toast.error('Failed to update'); }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await API.delete(`/cart/item/${productId}`);
      setCart(data.cart);
      toast.success('Removed from cart');
    } catch (error) { toast.error('Failed to remove'); }
  };

  const clearCart = async () => {
    try {
      await API.delete('/cart/clear');
      setCart({ items: [] });
    } catch (error) { toast.error('Failed to clear cart'); }
  };

  const cartTotal = cart?.items?.reduce((acc, item) => {
    const price = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0) || 0;

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, cartTotal, cartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
