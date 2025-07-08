'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  isAdding: boolean;
}

type CartAction =
  | { type: 'SET_CART'; payload: { items: CartItem[]; total: number } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ADDING'; payload: boolean }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  addToCart: (productId: string, quantity: number, productTitle?: string) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  getSessionId: () => string;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        isLoading: false,
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + (action.payload.price * action.payload.quantity),
      };
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.productId._id !== action.payload);
      const newTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...state,
        items: filteredItems,
        total: newTotal,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ADDING':
      return {
        ...state,
        isAdding: action.payload,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
      };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    isLoading: false,
    isAdding: false,
  });

  const getSessionId = () => {
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
  };

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionId = getSessionId();
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data = await response.json();
      
      dispatch({
        type: 'SET_CART',
        payload: { items: data.items || [], total: data.total || 0 },
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId: string, quantity: number, productTitle?: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_ADDING', payload: true });
      const sessionId = getSessionId();
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, productId, quantity }),
      });
      
      if (response.ok) {
        await fetchCart();
        dispatch({ type: 'SET_ADDING', payload: false });
        return true;
      }
      dispatch({ type: 'SET_ADDING', payload: false });
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ADDING', payload: false });
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, productId }),
      });
      
      if (response.ok) {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      removeFromCart,
      clearCart,
      getSessionId,
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
