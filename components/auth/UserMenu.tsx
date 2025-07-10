'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            
            <div className="py-1">
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
              
              <Link
                href="/orders"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Package className="h-4 w-4" />
                Order History
              </Link>
              
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </div>
            
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
