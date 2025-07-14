'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ShoppingCart, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import getStripe from '@/lib/stripe';
import AuthModal from '@/components/auth/AuthModal';

export default function CartPage() {
  const { state, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleCheckout = async () => {
    try {
      const stripe = await getStripe();
      
      const items = state.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const { sessionId } = await response.json();
      
      const result = await stripe.redirectToCheckout({ sessionId });
      
      if (result.error) {
        console.error('Stripe error:', result.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (state.isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-lg theme-text">Loading cart...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div 
          className="theme-surface rounded-lg shadow-md p-6"
          style={{ borderRadius: 'var(--border-radius-large)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart 
              className="h-6 w-6" 
              style={{ color: 'var(--color-primary)' }}
            />
            <h1 className="text-2xl font-bold theme-heading">Shopping Cart</h1>
          </div>

          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart 
                className="h-24 w-24 mx-auto mb-4" 
                style={{ color: 'var(--color-border)' }}
              />
              <h2 className="text-xl font-semibold theme-text-secondary mb-2">Your cart is empty</h2>
              <p className="theme-text-secondary mb-6">Add some products to get started!</p>
              <Link 
                href="/"
                className="inline-block text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: 'var(--border-radius-medium)'
                }}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center gap-4 p-4 border rounded-lg"
                  style={{ 
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--border-radius-medium)'
                  }}
                >
                  {item.productId.image && (
                    <div className="w-20 h-20 relative">
                      <Image
                        src={item.productId.image}
                        alt={item.productId.title}
                        fill
                        className="object-cover rounded"
                        style={{ borderRadius: 'var(--border-radius-small)' }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold theme-text">{item.productId.title}</h3>
                    <p className="theme-text-secondary">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm theme-text-secondary">Qty: {item.quantity}</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold theme-text">{formatPrice(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeFromCart(item.productId._id)}
                      className="hover:opacity-70 mt-1 transition-opacity"
                      style={{ color: 'var(--color-error)' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div 
                className="border-t pt-4"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold theme-text">Total: {formatPrice(state.total)}</span>
                </div>
                
                <div className="space-y-3">
                  {/* User Account Status */}
                  {isAuthenticated ? (
                    <div 
                      className="flex items-center gap-2 text-sm p-3 rounded-lg"
                      style={{ 
                        color: 'var(--color-success)',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-medium)'
                      }}
                    >
                      <User className="h-4 w-4" />
                      <span>Signed in as {user?.name}</span>
                    </div>
                  ) : (
                    <div 
                      className="p-4 rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-medium)'
                      }}
                    >
                      <p className="text-sm theme-text-secondary mb-3">
                        Sign in for faster checkout, order tracking, and exclusive offers
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setAuthModalMode('login');
                            setShowAuthModal(true);
                          }}
                          className="flex-1 border px-4 py-2 rounded-md hover:opacity-80 transition-opacity text-sm"
                          style={{ 
                            backgroundColor: 'var(--color-background)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--border-radius-small)'
                          }}
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            setAuthModalMode('register');
                            setShowAuthModal(true);
                          }}
                          className="flex-1 px-4 py-2 rounded-md hover:opacity-80 transition-opacity text-sm"
                          style={{ 
                            backgroundColor: 'var(--color-secondary)',
                            color: 'white',
                            borderRadius: 'var(--border-radius-small)'
                          }}
                        >
                          Sign Up
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Checkout Buttons */}
                  <div className="flex gap-4">
                    <Link 
                      href="/"
                      className="flex-1 px-6 py-3 rounded-lg hover:opacity-80 transition-opacity text-center"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-medium)'
                      }}
                    >
                      Continue Shopping
                    </Link>
                    <button
                      onClick={handleCheckout}
                      className="flex-1 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ 
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: 'var(--border-radius-medium)'
                      }}
                    >
                      {isAuthenticated ? 'Checkout' : 'Guest Checkout'}
                    </button>
                  </div>
                  
                  {!isAuthenticated && (
                    <p className="text-xs theme-text-secondary text-center">
                      You can checkout as a guest without creating an account
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
        />
      </div>
    </div>
  );
}
