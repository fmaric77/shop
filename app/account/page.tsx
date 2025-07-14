'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="theme-container py-8">
        <div className="theme-surface shadow-md">
          {/* Header */}
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">My Account</h1>
          </div>

          {/* Account Info */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">{user.name}</h2>
                <p className="text-[var(--color-textSecondary)]">{user.email}</p>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="theme-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-[var(--color-textSecondary)]" />
                  <h3 className="font-medium text-[var(--color-text)]">Email</h3>
                </div>
                <p className="text-[var(--color-textSecondary)]">{user.email}</p>
              </div>

              <div className="theme-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-[var(--color-textSecondary)]" />
                  <h3 className="font-medium text-[var(--color-text)]">Member Since</h3>
                </div>
                <p className="text-[var(--color-textSecondary)]">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-[var(--color-border)] pt-6">
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-[var(--color-text)]">Order History</div>
                    <div className="text-sm text-[var(--color-textSecondary)]">View your past orders</div>
                  </div>
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-[var(--color-text)]">Continue Shopping</div>
                    <div className="text-sm text-[var(--color-textSecondary)]">Browse our products</div>
                  </div>
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-[var(--color-text)]">Shopping Cart</div>
                    <div className="text-sm text-[var(--color-textSecondary)]">Complete your purchase</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
