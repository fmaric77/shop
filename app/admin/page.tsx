'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Tag, ArrowLeft, Palette, Settings, Database, Brain, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import ThemeCustomizer from '@/components/admin/ThemeCustomizer';
import ContentEditor from '@/components/admin/ContentEditor';
import CurrencySettings from '@/components/admin/CurrencySettings';
import DatabaseConfig from '@/components/admin/DatabaseConfig';
import AISettings from '@/components/admin/GrokAISettings';
import PaymentSettings from '@/components/admin/PaymentSettings';

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
  detailedDescription?: string;
  price: number;
  comparePrice?: number;
  category: Category;
  tags: string[];
  image?: string;
  images?: Array<{
    url: string;
    alt?: string;
    order?: number;
  }>;
  slug: string;
  inStock: boolean;
  inventory?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  featured?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  variants?: Array<{
    name: string;
    options: Array<{
      value: string;
      price?: number;
      image?: string;
      inStock?: boolean;
    }>;
  }>;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'themes' | 'content' | 'settings' | 'payment' | 'database' | 'ai'>('payment');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDatabaseConfigured, setIsDatabaseConfigured] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const { formatPrice } = useCurrency();

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    aiPrompt: '',
    description: '',
    detailedDescription: '',
    price: '',
    category: '',
    tags: '',
    imagesCSV: '', // New comma-separated image URLs
  });
  // Track editing mode
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const resetProductForm = () => {
    setProductForm({ title: '', aiPrompt: '', description: '', detailedDescription: '', price: '', category: '', tags: '', imagesCSV: '' });
    setEditingProductId(null);
  };

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
      const imageUrls = productForm.imagesCSV.split(',').map(url => url.trim()).filter(Boolean);
      let response;
      const payload: {
        title: string;
        description: string;
        detailedDescription: string;
        price: number;
        category: string;
        tags: string[];
        imagesCSV: string;
      } = {
        title: productForm.title,
        description: productForm.description,
        detailedDescription: productForm.detailedDescription,
        price: parseFloat(productForm.price),
        category: productForm.category,
        tags: tagsArray,
        images: imageUrls,
      };
      if (editingProductId) {
        // Update existing product
        response = await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new product
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const saved = await response.json();
        if (editingProductId) {
          setProducts(products.map(p => p._id === editingProductId ? saved : p));
          alert('Product updated successfully!');
        } else {
          setProducts([saved, ...products]);
          alert('Product created successfully!');
        }
        resetProductForm();
      } else {
        const error = await response.json();
        alert(error.error || (editingProductId ? 'Failed to update product' : 'Failed to create product'));
      }
    } catch (error) {
      console.error('Error creating/updating product:', error);
      alert('Failed to save product');
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

  // Handler to create a full product template via AI
  const handleCreateProductTemplate = async () => {
    setCreatingTemplate(true);
    try {
      const response = await fetch('/api/ai/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialPrompt: productForm.aiPrompt }),
      });
      const data = await response.json();
      if (response.ok && data.product) {
        const { title, category, price, description, detailedDescription, tags, image } = data.product;
        // Map category name to ID if exists
        // Try exact match by name (case-insensitive)
        let categoryObj = categories.find(
          c => c.name.toLowerCase() === (category || '').toLowerCase()
        );
        // If not found, try matching slugified name
        if (!categoryObj) {
          const slugify = (str: string) =>
            str
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
          const targetSlug = slugify(category || '');
          categoryObj = categories.find(c => c.slug === targetSlug);
        }
        // If still not found, default to first visible category
        if (!categoryObj && categories.length > 0) {
          categoryObj = categories[0];
        }
        setProductForm({
          title: title || '',
          aiPrompt: productForm.aiPrompt,
          description: description || '',
          detailedDescription: detailedDescription || '',
          price: price ? price.toString() : '',
          category: categoryObj?._id || '',
          tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
          imagesCSV: Array.isArray(image) ? image.join(', ') : image || '',
        });
      } else {
        alert(data.error || 'Failed to generate product template');
      }
    } catch (err) {
      console.error('Error generating product template:', err);
      alert('Error generating product template');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCategories(categories.filter(c => c._id !== id));
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
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
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="theme-header theme-surface border-[var(--color-border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-[var(--color-primary)] hover:filter hover:brightness-90">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Store
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Admin Panel</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="theme-container py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-[var(--color-border)]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('database')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'database'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <Database className="h-5 w-5 inline mr-2" />
                Database
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <Package className="h-5 w-5 inline mr-2" />
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <Tag className="h-5 w-5 inline mr-2" />
                Categories ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'themes'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <Palette className="h-5 w-5 inline mr-2" />
                Themes & UI
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <ArrowLeft className="h-5 w-5 inline mr-2 rotate-180" />
                Content
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <Settings className="h-5 w-5 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <CreditCard className="h-5 w-5 inline mr-2" />
                Payment
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ai'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
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
            <div className="theme-surface rounded-lg shadow-md p-6">
              <DatabaseConfig 
                onConfigured={() => {
                  setIsDatabaseConfigured(true);
                  setActiveTab('products');
                }}
              />
            </div>
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
            <div className="theme-surface rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
                <button
                  type="button"
                  onClick={handleCreateProductTemplate}
                  disabled={creatingTemplate}
                  className="ml-4 px-2 py-1 bg-[var(--color-primary)] text-white rounded text-sm hover:filter hover:brightness-90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Brain className="h-4 w-4" />
                  {creatingTemplate ? 'Generating...' : 'Create with AI'}
                </button>
              </h2>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                      Image URLs (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={productForm.imagesCSV}
                      onChange={(e) => setProductForm({ ...productForm, imagesCSV: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-[var(--color-text)]">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generatingDescription}
                      className="text-sm text-[var(--color-primary)] hover:filter hover:brightness-90 disabled:text-[var(--color-textSecondary)] flex items-center gap-1"
                    >
                      <Brain className="h-4 w-4" />
                      {generatingDescription ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={productForm.detailedDescription}
                    onChange={(e) => setProductForm({ ...productForm, detailedDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-[var(--color-text)]">
                      Tags (comma separated)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateTags}
                      disabled={generatingTags}
                      className="text-sm text-[var(--color-primary)] hover:filter hover:brightness-90 disabled:text-[var(--color-textSecondary)] flex items-center gap-1"
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
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var,--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-[var(--color-text)]">
                      AI Prompt (optional)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={productForm.aiPrompt}
                    onChange={(e) => setProductForm({ ...productForm, aiPrompt: e.target.value })}
                    placeholder="Provide context or instructions for AI"
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Images (comma-separated URLs)
                  </label>
                  <textarea
                    value={productForm.imagesCSV}
                    onChange={(e) => setProductForm({ ...productForm, imagesCSV: e.target.value })}
                    rows={2}
                    placeholder="https://.../1.jpg, https://.../2.jpg"
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var,--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-md hover:filter hover:brightness-90 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="theme-surface rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">
                Products ({products.length})
              </h2>
              
              {products.length === 0 ? (
                <p className="text-[var(--color-textSecondary)] text-center py-8">No products yet. Add your first product above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--color-border)]">
                    <thead className="bg-[var(--color-surface)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                          Tags
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--color-background)] divide-y divide-[var(--color-border)]">
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
                                <div className="text-sm font-medium text-[var(--color-text)]">{product.title}</div>
                                {product.description && (
                                  <div className="text-sm text-[var(--color-textSecondary)] truncate max-w-xs">
                                    {product.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text)]">
                            {product.category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text)]">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text)] text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="text-xs text-[var(--color-textSecondary)]">
                                  +{product.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-[var(--color-error)] hover:filter hover:brightness-90 mr-4"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                setEditingProductId(product._id);
                                setProductForm({
                                  title: product.title,
                                  aiPrompt: '',
                                  description: product.description || '',
                                  detailedDescription: product.detailedDescription || '',
                                  price: product.price.toString(),
                                  category: product.category._id,
                                  tags: product.tags.join(', '),
                                  imagesCSV: product.images
                                    ? product.images.map(img => img.url).join(', ')
                                    : (product.image ? product.image : ''),
                                });
                              }}
                              className="text-[var(--color-primary)] hover:filter hover:brightness-90"
                            >
                              Edit
                            </button>
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
            <div className="theme-surface rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Category
              </h2>
              
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-md hover:filter hover:brightness-90 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="theme-surface rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">
                Categories ({categories.length})
              </h2>
              
              {categories.length === 0 ? (
                <p className="text-[var(--color-textSecondary)] text-center py-8">No categories yet. Add your first category above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category._id} className="border border-[var(--color-border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--color-text)] mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-[var(--color-textSecondary)]">{category.description}</p>
                      )}
                      <p className="text-xs text-[var(--color-textSecondary)] mt-2">Slug: {category.slug}</p>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="mt-3 text-[var(--color-error)] hover:filter hover:brightness-90 text-sm"
                      >
                        Delete Category
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className="theme-surface rounded-lg shadow-md p-6">
              <ThemeCustomizer />
            </div>
          </div>
        )}

        {/* Layouts Tab */}
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="theme-surface rounded-lg shadow-md p-6">
              <ContentEditor />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="theme-surface rounded-lg shadow-md p-6">
              <CurrencySettings />
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="theme-surface rounded-lg shadow-md p-6">
              <PaymentSettings />
            </div>
          </div>
        )}
        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="theme-surface rounded-lg shadow-md p-6">
              <AISettings />
            </div>
          </div>
        )}
      </div>

      <footer className="theme-surface text-center p-6 mt-12" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-sm theme-text-secondary">Powered by Shop Store — All text editable</p>
      </footer>
    </div>
  );
}
