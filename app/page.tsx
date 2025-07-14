'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Plus, ShoppingCart, Check, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useContent } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category: Category;
  tags: string[];
  image?: string;
  slug: string;
  inStock: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  // AI search functionality state (commented out until implemented)
  // const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  // const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  // const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const { state: cartState, addToCart } = useCart();
  const { theme } = useTheme();
  const { content } = useContent();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  // Get grid classes based on store type and theme
  const getGridClasses = () => {
    const storeType = theme?.layout?.storeType;
    const variation = theme?.variation;
    
    if (variation === 'masonry') {
      return 'columns-1 sm:columns-2 lg:columns-3 gap-4';
    }
    
    // Store-type specific grid layouts
    switch (storeType) {
      case 'fashion':
      case 'luxury':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
      case 'electronics':
      case 'automotive':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'food':
      case 'beauty':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3';
      case 'books':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';
      case 'sports':
      case 'home':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'outdoor':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  // Get product card styling based on store type
  const getProductCardClass = (storeType: string) => {
    switch (storeType) {
      case 'fashion':
      case 'luxury':
        return 'aspect-[3/4]'; // Portrait for clothing/luxury
      case 'electronics':
      case 'automotive':
      case 'sports':
      case 'home':
        return 'aspect-[4/3]'; // Landscape for tech/equipment
      case 'books':
        return 'aspect-[2/3]'; // Portrait for books
      case 'food':
      case 'beauty':
        return 'aspect-[3/4]'; // Portrait for packages
      case 'outdoor':
        return 'aspect-square'; // Square for gear
      default:
        return 'aspect-[4/3]';
    }
  };

  // Get image styling based on store type
  const getImageClass = (storeType: string) => {
    const baseClass = 'w-full object-cover transition-transform duration-300';
    
    switch (storeType) {
      case 'fashion':
        return `${baseClass} hover:scale-105`;
      case 'luxury':
        return `${baseClass} hover:scale-110`;
      case 'electronics':
      case 'automotive':
        return `${baseClass} hover:translate-y-[-2px]`;
      case 'food':
        return `${baseClass} hover:scale-105`;
      case 'beauty':
        return `${baseClass} hover:scale-105 hover:brightness-110`;
      case 'sports':
        return `${baseClass} hover:scale-105`;
      case 'books':
        return `${baseClass} hover:rotate-1`;
      case 'home':
        return `${baseClass} hover:scale-105`;
      case 'outdoor':
        return `${baseClass}`;
      default:
        return baseClass;
    }
  };

  // Enhanced add to cart with visual feedback
  const handleAddToCart = async (productId: string, productTitle: string) => {
    setAddingToCart(productId);
    
    try {
      const success = await addToCart(productId, 1, productTitle);
      
      if (success) {
        setJustAdded(productId);
        
        // Reset the "just added" state after animation
        setTimeout(() => {
          setJustAdded(null);
        }, 2000);
      } else {
        console.log('Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleSearchWithAI = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      // Filter products based on current category selection
      const availableProducts = products.filter((product) => {
        if (selectedCategory && product.category._id !== selectedCategory) {
          return false;
        }
        return true;
      });

      const response = await fetch('/api/ai/search-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          products: availableProducts.slice(0, 10), // Send a subset of products
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.searchSuggestions) {
          // Parse suggestions from the AI response
          const suggestions = data.searchSuggestions.split('\n')
            .map((s: string) => s.replace(/^\d+\.\s*/, '').trim())
            .filter((s: string) => s.length > 0)
            .slice(0, 5);
          setSearchSuggestions(suggestions);
        }
        if (data.recommendations) {
          setAiRecommendations(data.recommendations);
        }
      }
    } catch (error) {
      console.error('Error with AI search assistance:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 2) {
      setShowSearchSuggestions(true);
      // Debounce AI search
      const timer = setTimeout(() => {
        handleSearchWithAI(value);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowSearchSuggestions(false);
      setSearchSuggestions([]);
      setAiRecommendations('');
    }
  };

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // Ensure products is always an array
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        console.error('Failed to fetch products:', productsRes.status);
        setProducts([]);
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        // Ensure categories is always an array
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        console.error('Failed to fetch categories:', categoriesRes.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // fetchProducts function removed as it was unused

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header className="theme-surface border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {content.storeLogo ? (
                <img 
                  src={content.storeLogo} 
                  alt={content.storeName}
                  className="h-8 w-auto mr-2"
                />
              ) : (
                <ShoppingBag className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              )}
              <h1 className="ml-2 text-2xl font-bold theme-heading">{content.storeName}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 hover:opacity-70" style={{ color: 'var(--color-text)' }} />
                {cartState.items.length > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {cartState.items.length}
                  </span>
                )}
              </Link>
              
              {/* Authentication UI */}
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('register');
                      setShowAuthModal(true);
                    }}
                    className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: 'var(--borderRadius)'
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              {/* Admin Panel - only show to admins */}
              {user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center gap-2 transition-opacity"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    borderRadius: 'var(--borderRadius)'
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-store-type={theme?.layout?.storeType || 'default'}>
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" 
              style={{ color: 'var(--color-textSecondary)' }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="theme-input w-full pl-10 pr-4 py-2"
            />
          </div>
          
          {/* Category Filter: adapt based on store type */}
          {theme?.layout?.navigation?.style === 'dropdown' || theme?.variation === 'list' ? (
            <select
              className="theme-input w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === '' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedCategory === '' ? 'white' : 'var(--color-text)',
                  borderRadius: 'var(--border-radius-medium)',
                  border: selectedCategory === '' ? 'none' : `1px solid var(--color-border)`
                }}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: selectedCategory === category._id ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: selectedCategory === category._id ? 'white' : 'var(--color-text)',
                    borderRadius: 'var(--border-radius-medium)',
                    border: selectedCategory === category._id ? 'none' : `1px solid var(--color-border)`
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products List */}
        <div className={getGridClasses()}>
          {(() => {
            const filteredProducts = products.filter((product) => {
              // Filter by selected category
              if (selectedCategory && product.category._id !== selectedCategory) {
                return false;
              }
              
              // Filter by search term
              if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                  product.title.toLowerCase().includes(searchLower) ||
                  product.description?.toLowerCase().includes(searchLower) ||
                  product.category.name.toLowerCase().includes(searchLower) ||
                  product.tags.some(tag => tag.toLowerCase().includes(searchLower))
                );
              }
              
              return true;
            });

            if (filteredProducts.length === 0) {
              return (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p>
                      {searchTerm 
                        ? `No products match "${searchTerm}"${selectedCategory ? ' in this category' : ''}. Try adjusting your search or category filter.`
                        : selectedCategory 
                          ? 'No products found in this category.'
                          : 'No products available.'}
                    </p>
                  </div>
                  {(searchTerm || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              );
            }

            return filteredProducts.map((product) => {
            const storeType = theme?.layout?.storeType || 'default';
            const cardAspectClass = getProductCardClass(storeType);
            const imageClass = getImageClass(storeType);
            
            return (
              <div key={product._id} className="theme-card group" data-hover="lift">
                <Link href={`/product/${product.slug}`}>
                  {product.image && (
                    <div className={`${cardAspectClass} overflow-hidden`} style={{ borderRadius: 'var(--border-radius-medium)' }}>
                      <img
                        src={product.image}
                        alt={product.title}
                        className={imageClass}
                      />
                    </div>
                  )}
                  <div style={{ padding: 'var(--spacing)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold theme-heading line-clamp-2">{product.title}</h3>
                      <span 
                        className={`px-2 py-1 text-xs`}
                        style={{ 
                          backgroundColor: product.inStock ? 'var(--color-success)' : 'var(--color-error)',
                          color: 'white',
                          borderRadius: 'var(--borderRadius)'
                        }}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    {/* Store-type specific content */}
                    {storeType === 'electronics' && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          {'★'.repeat(4)}{'☆'.repeat(1)}
                          <span className="ml-1 text-gray-500">(124)</span>
                        </div>
                      </div>
                    )}
                    
                    {storeType === 'books' && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">Author: Sample Author</p>
                      </div>
                    )}
                    
                    {storeType === 'food' && (
                      <div className="mb-2 flex gap-1">
                        <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">Organic</span>
                        <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Local</span>
                      </div>
                    )}
                    
                    {storeType === 'beauty' && (
                      <div className="mb-2">
                        <div className="flex gap-1">
                          <span className="w-3 h-3 rounded-full bg-red-400"></span>
                          <span className="w-3 h-3 rounded-full bg-pink-400"></span>
                          <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                          <span className="text-xs text-gray-500 ml-1">+5 shades</span>
                        </div>
                      </div>
                    )}
                    
                    {storeType === 'sports' && (
                      <div className="mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Professional Grade
                        </span>
                      </div>
                    )}
                    
                    {storeType === 'automotive' && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">Part #: {product._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-green-600">✓ OEM Compatible</p>
                      </div>
                    )}
                    
                    {product.description && (
                      <p className="theme-text-secondary text-sm mb-3 line-clamp-2">{product.description}</p>
                    )}
                    
                    <div className="mb-3">
                      <span 
                        className={`${storeType === 'luxury' ? 'text-xl' : 'text-2xl'} font-bold`}
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {storeType === 'food' && (
                        <span className="text-sm text-gray-500 ml-1">/unit</span>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm theme-text-secondary">Category: </span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {product.category.name}
                      </span>
                    </div>
                    
                    {product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-textSecondary)',
                              borderRadius: 'var(--borderRadius)'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product._id, product.title);
                      }}
                      disabled={!product.inStock || addingToCart === product._id}
                      className={`w-full py-2 px-4 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                        storeType === 'luxury' ? 'font-light text-sm' : 'font-medium'
                      } ${
                        justAdded === product._id ? 'animate-pulse-success' : ''
                      } ${
                        addingToCart === product._id ? 'button-loading' : ''
                      }`}
                      style={{
                        backgroundColor: 
                          justAdded === product._id ? 'var(--color-success)' :
                          product.inStock ? 'var(--color-primary)' : 'var(--color-border)',
                        color: product.inStock ? 'white' : 'var(--color-textSecondary)',
                        borderRadius: 'var(--borderRadius)'
                      }}
                    >
                      {addingToCart === product._id ? (
                        <>
                          <span className="opacity-0">
                            <Plus className="h-4 w-4" />
                          </span>
                          <span className="opacity-0">Adding...</span>
                        </>
                      ) : justAdded === product._id ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added!
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          {storeType === 'luxury' ? 'Add to Collection' : 
                           storeType === 'automotive' ? 'Add to Garage' :
                           storeType === 'food' ? 'Add to Basket' :
                           storeType === 'books' ? 'Add to Library' :
                           product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              </div>
            );
          });
          })()}
        </div>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
