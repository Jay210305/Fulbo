import { createContext, useContext, useState, ReactNode } from 'react';
import { Field, Product } from '../types/field';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ReservationCart {
  field: Field | null;
  selectedTime: string | null;
  selectedDate: string | null;
  duration: number; // Duration in hours (1, 1.5, 2, 3)
  items: CartItem[];
  matchName?: string;
  isPending: boolean;
  pendingExpiresAt: Date | null;
}

interface CartContextType {
  cart: ReservationCart;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setReservationDetails: (field: Field, time: string, date: string) => void;
  setDuration: (duration: number) => void;
  setMatchName: (name: string) => void;
  setPendingReservation: (matchName: string) => void;
  cancelReservation: () => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number;
  getFieldTotal: () => number;
  getRemainingTime: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ReservationCart>({
    field: null,
    selectedTime: null,
    selectedDate: null,
    duration: 1, // Default 1 hour
    items: [],
    matchName: '',
    isPending: false,
    pendingExpiresAt: null
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...prev,
        items: [...prev.items, { product, quantity: 1 }]
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product.id !== productId)
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    }));
  };

  const setReservationDetails = (field: Field, time: string, date: string) => {
    setCart(prev => ({
      ...prev,
      field,
      selectedTime: time,
      selectedDate: date
    }));
  };

  const setDuration = (duration: number) => {
    setCart(prev => ({ ...prev, duration }));
  };

  const setMatchName = (name: string) => {
    setCart(prev => ({ ...prev, matchName: name }));
  };

  const setPendingReservation = (matchName: string) => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    setCart(prev => ({
      ...prev,
      matchName,
      isPending: true,
      pendingExpiresAt: expiresAt
    }));
  };

  const cancelReservation = () => {
    setCart({
      field: null,
      selectedTime: null,
      selectedDate: null,
      duration: 1,
      items: [],
      matchName: '',
      isPending: false,
      pendingExpiresAt: null
    });
  };

  const clearCart = () => {
    setCart({
      field: null,
      selectedTime: null,
      selectedDate: null,
      duration: 1,
      items: [],
      matchName: '',
      isPending: false,
      pendingExpiresAt: null
    });
  };

  const getTotalItems = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getFieldTotal = () => {
    const basePrice = cart.field?.price || 0;
    return basePrice * cart.duration;
  };

  const getRemainingTime = () => {
    if (!cart.pendingExpiresAt) return 0;
    const now = Date.now();
    const remaining = cart.pendingExpiresAt.getTime() - now;
    return Math.max(0, Math.floor(remaining / 1000)); // Segundos restantes
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setReservationDetails,
        setDuration,
        setMatchName,
        setPendingReservation,
        cancelReservation,
        clearCart,
        getTotalItems,
        getCartTotal,
        getFieldTotal,
        getRemainingTime
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
