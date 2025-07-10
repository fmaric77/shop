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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          </div>

          {/* Account Info */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Email</h3>
                </div>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Member Since</h3>
                </div>
                <p className="text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Order History</div>
                    <div className="text-sm text-gray-600">View your past orders</div>
                  </div>
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Continue Shopping</div>
                    <div className="text-sm text-gray-600">Browse our products</div>
                  </div>
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">Shopping Cart</div>
                    <div className="text-sm text-gray-600">Complete your purchase</div>
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
