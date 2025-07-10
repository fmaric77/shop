'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Tag, ArrowLeft, Palette, Settings, Database, Brain } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import ThemeCustomizer from '@/components/admin/ThemeCustomizer';
import ContentEditor from '@/components/admin/ContentEditor';
import CurrencySettings from '@/components/admin/CurrencySettings';
import DatabaseConfig from '@/components/admin/DatabaseConfig';
import GrokAISettings from '@/components/admin/GrokAISettings';

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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'themes' | 'content' | 'settings' | 'database' | 'ai'>('database');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDatabaseConfigured, setIsDatabaseConfigured] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const { formatPrice } = useCurrency();

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    image: '',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const checkDatabaseConfig = async () => {
      try {
        const response = await fetch('/api/env-config');
        if (response.ok) {
          const data = await response.json();
          setIsDatabaseConfigured(data.hasMongoConfig);
        }
      } catch (error) {
        console.error('Error checking database config:', error);
      }
    };

    checkDatabaseConfig();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.title || !productForm.price || !productForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const tagsArray = productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productForm,
          tags: tagsArray,
        }),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([newProduct, ...products]);
        setProductForm({
          title: '',
          description: '',
          price: '',
          category: '',
          tags: '',
          image: '',
        });
        alert('Product created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name) {
      alert('Category name is required');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([newCategory, ...categories]);
        setCategoryForm({
          name: '',
          description: '',
        });
        alert('Category created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleGenerateDescription = async () => {
    if (!productForm.title) {
      alert('Please enter a product title first');
      return;
    }

    setGeneratingDescription(true);
    try {
      const selectedCategory = categories.find(c => c._id === productForm.category);
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productTitle: productForm.title,
          category: selectedCategory?.name || '',
          features: productForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProductForm({ ...productForm, description: data.description });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!productForm.title) {
      alert('Please enter a product title first');
      return;
    }

    setGeneratingTags(true);
    try {
      const selectedCategory = categories.find(c => c._id === productForm.category);
      const response = await fetch('/api/ai/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productTitle: productForm.title,
          description: productForm.description,
          category: selectedCategory?.name || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProductForm({ ...productForm, tags: data.tags.join(', ') });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate tags');
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      alert('Failed to generate tags');
    } finally {
      setGeneratingTags(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Store
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('database')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'database'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="h-5 w-5 inline mr-2" />
                Database
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="h-5 w-5 inline mr-2" />
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Tag className="h-5 w-5 inline mr-2" />
                Categories ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'themes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Palette className="h-5 w-5 inline mr-2" />
                Themes & UI
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ArrowLeft className="h-5 w-5 inline mr-2 rotate-180" />
                Content
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-5 w-5 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ai'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Brain className="h-5 w-5 inline mr-2" />
                AI
              </button> 
            </nav>
          </div>
        </div>

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <DatabaseConfig 
              onConfigured={() => {
                setIsDatabaseConfigured(true);
                setActiveTab('products');
              }}
            />
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            {!isDatabaseConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800 font-medium">Database Not Configured</p>
                    <p className="text-yellow-700 text-sm">Please configure your database connection first.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('database')}
                    className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Configure Database
                  </button>
                </div>
              </div>
            )}
            {/* Add Product Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
              </h2>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generatingDescription}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1"
                    >
                      <Brain className="h-4 w-4" />
                      {generatingDescription ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Tags (comma separated)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateTags}
                      disabled={generatingTags}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1"
                    >
                      <Brain className="h-4 w-4" />
                      {generatingTags ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="electronics, gadget, smartphone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Products ({products.length})
              </h2>
              
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products yet. Add your first product above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.image && (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover mr-4"
                                  src={product.image}
                                  alt={product.title}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                {product.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {product.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            {!isDatabaseConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800 font-medium">Database Not Configured</p>
                    <p className="text-yellow-700 text-sm">Please configure your database connection first.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('database')}
                    className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Configure Database
                  </button>
                </div>
              </div>
            )}
            {/* Add Category Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Category
              </h2>
              
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Categories ({categories.length})
              </h2>
              
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No categories yet. Add your first category above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Slug: {category.slug}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div>
            <ThemeCustomizer />
          </div>
        )}

        {/* Layouts Tab */}
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <ContentEditor />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <CurrencySettings />
          </div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <GrokAISettings />
          </div>
        )}
      </div>

      <footer className="theme-surface text-center p-6 mt-12" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-sm theme-text-secondary">Powered by Shop Store — All text editable</p>
      </footer>
    </div>
  );
}
