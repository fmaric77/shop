'use client';

import { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  stripeSessionId: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  const fetchOrders = async () => {
    try {
      const endpoint = isAuthenticated ? '/api/orders/user' : '/api/orders';
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401 && isAuthenticated) {
        // Authentication failed, show message
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const endpoint = isAuthenticated ? '/api/orders/user' : '/api/orders';
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          // Authentication failed, show message
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrdersData();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-lg theme-text">Loading orders...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold theme-heading">
                {isAuthenticated ? 'My Orders' : 'Order History'}
              </h1>
              {isAuthenticated && user && (
                <p className="theme-text-secondary mt-1">
                  Orders for {user.email}
                </p>
              )}
            </div>
            <Link 
              href="/"
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--border-radius-medium)'
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div 
            className="theme-surface rounded-lg shadow-md p-12 text-center"
            style={{ borderRadius: 'var(--border-radius-large)' }}
          >
            <Package 
              className="h-24 w-24 mx-auto mb-4" 
              style={{ color: 'var(--color-border)' }}
            />
            <h2 className="text-xl font-semibold theme-text-secondary mb-2">
              {isAuthenticated ? 'No orders yet' : 'No orders found'}
            </h2>
            <p className="theme-text-secondary mb-6">
              {isAuthenticated 
                ? 'Start shopping to see your orders here!' 
                : 'Sign in to view your order history or start shopping!'
              }
            </p>
            {!isAuthenticated && (
              <p className="text-sm theme-text-secondary mb-6">
                This page shows all orders when not signed in (admin view).
              </p>
            )}
            <Link 
              href="/"
              className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--border-radius-medium)'
              }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="theme-surface rounded-lg shadow-md p-6"
                style={{ borderRadius: 'var(--border-radius-large)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package 
                      className="h-5 w-5" 
                      style={{ color: 'var(--color-textSecondary)' }}
                    />
                    <span className="font-semibold theme-text">
                      Order #{order.stripeSessionId.slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-medium`}
                      style={{
                        backgroundColor: 
                          order.status === 'paid' || order.status === 'delivered' ? 'var(--color-success)' :
                          order.status === 'pending' ? 'var(--color-warning)' :
                          order.status === 'shipped' ? 'var(--color-primary)' :
                          'var(--color-error)',
                        color: 'white',
                        borderRadius: 'var(--border-radius-full)'
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm theme-text-secondary">
                    <DollarSign className="h-4 w-4" />
                    Total: {formatPrice(order.total)}
                  </div>
                  <div className="text-sm theme-text-secondary">
                    Items: {order.items.length}
                  </div>
                </div>

                <div 
                  className="border-t pt-4"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <h3 className="font-semibold theme-text mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div>
                          <span className="font-medium theme-text">{item.title}</span>
                          <span className="theme-text-secondary text-sm"> × {item.quantity}</span>
                        </div>
                        <span className="font-medium theme-text">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shippingAddress && (
                  <div 
                    className="border-t pt-4 mt-4"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <h3 className="font-semibold theme-text mb-2">Shipping Address</h3>
                    <div className="text-sm theme-text-secondary">
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
