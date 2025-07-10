'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/contexts/AuthContext';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
          </div>

          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some products to get started!</p>
              <Link 
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {item.productId.image && (
                    <div className="w-20 h-20 relative">
                      <Image
                        src={item.productId.image}
                        alt={item.productId.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productId.title}</h3>
                    <p className="text-gray-600">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeFromCart(item.productId._id)}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Total: {formatPrice(state.total)}</span>
                </div>
                
                <div className="space-y-3">
                  {/* User Account Status */}
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      <User className="h-4 w-4" />
                      <span>Signed in as {user?.name}</span>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        Sign in for faster checkout, order tracking, and exclusive offers
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setAuthModalMode('login');
                            setShowAuthModal(true);
                          }}
                          className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            setAuthModalMode('register');
                            setShowAuthModal(true);
                          }}
                          className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors text-sm"
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
                      className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
                    >
                      Continue Shopping
                    </Link>
                    <button
                      onClick={handleCheckout}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isAuthenticated ? 'Checkout' : 'Guest Checkout'}
                    </button>
                  </div>
                  
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 text-center">
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
