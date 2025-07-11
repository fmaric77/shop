'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? null;

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div 
        className="max-w-md mx-auto theme-surface rounded-lg shadow-md p-8 text-center"
        style={{ borderRadius: 'var(--border-radius-large)' }}
      >
        <CheckCircle 
          className="h-16 w-16 mx-auto mb-4" 
          style={{ color: 'var(--color-success)' }}
        />
        
        <h1 className="text-2xl font-bold theme-heading mb-2">
          Payment Successful!
        </h1>
        
        <p className="theme-text-secondary mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>
        
        {sessionId && (
          <p className="text-sm theme-text-secondary mb-6">
            Order ID: {sessionId.slice(-8)}
          </p>
        )}
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--border-radius-medium)'
            }}
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/orders"
            className="block w-full px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderRadius: 'var(--border-radius-medium)'
            }}
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
