'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, Share2, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Reviews from '@/components/Reviews';
import ReviewForm from '@/components/ReviewForm';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

interface ProductVariant {
  name: string;
  options: {
    value: string;
    price?: number;
    image?: string;
    inStock: boolean;
  }[];
}

interface Specification {
  name: string;
  value: string;
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
  images: ProductImage[];
  image?: string; // Legacy field
  specifications: Specification[];
  variants: ProductVariant[];
  slug: string;
  inStock: boolean;
  inventory: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: string;
  };
  rating: {
    average: number;
    count: number;
  };
  featured: boolean;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping' | 'reviews'>('description');
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product) return;
      
      try {
        const response = await fetch(`/api/reviews?productId=${product._id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const checkReviewEligibility = async () => {
      if (!product || !user) {
        setCanReview(false);
        setReviewEligibility('Login required');
        return;
      }
      
      try {
        const response = await fetch(`/api/reviews/can-review?productId=${product._id}`);
        if (response.ok) {
          const data = await response.json();
          setCanReview(data.canReview);
          setReviewEligibility(data.reason);
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      }
    };

    if (product) {
      fetchReviews();
      checkReviewEligibility();
    }
  }, [product, user]);

  const handleReviewSubmitted = () => {
    // Refresh reviews and check eligibility again
    if (product) {
      fetch(`/api/reviews?productId=${product._id}`)
        .then(response => response.json())
        .then(data => setReviews(data.reviews))
        .catch(error => console.error('Error fetching reviews:', error));
        
      setCanReview(false);
      setReviewEligibility('Already reviewed');
    }
  };

  const handleAddToCart = async () => {
    if (product && !isAddingToCart) {
      setIsAddingToCart(true);
      try {
        await addToCart(product._id, quantity);
        setAddedToCart(true);
        setTimeout(() => {
          setAddedToCart(false);
        }, 2000);
      } catch (error) {
        console.error('Failed to add to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const getDisplayImages = () => {
    if (!product) return [];
    
    // Use new images array if available, otherwise fallback to legacy image field
    if (product.images && product.images.length > 0) {
      return product.images.sort((a, b) => a.order - b.order);
    } else if (product.image) {
      return [{ url: product.image, alt: product.title, order: 0 }];
    }
    return [];
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    let price = product.price;
    
    // Add variant price modifiers
    Object.entries(selectedVariants).forEach(([variantName, selectedValue]) => {
      const variant = product.variants.find(v => v.name === variantName);
      const option = variant?.options.find(o => o.value === selectedValue);
      if (option?.price) {
        price += option.price;
      }
    });
    
    return price;
  };

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));
  };

  const getStoreSpecificInfo = () => {
    const storeType = theme?.layout?.storeType || 'default';
    
    switch (storeType) {
      case 'fashion':
        return {
          features: ['Free shipping on orders $50+', 'Easy returns within 30 days', 'Size guide available'],
          shipping: 'Free shipping on orders over $50',
          returns: '30-day return policy'
        };
      case 'electronics':
        return {
          features: ['2-year warranty included', 'Expert tech support', 'Price match guarantee'],
          shipping: 'Free 2-day shipping',
          returns: '14-day return policy'
        };
      case 'luxury':
        return {
          features: ['White glove delivery', 'Certificate of authenticity', 'Lifetime warranty'],
          shipping: 'Complimentary shipping & handling',
          returns: '60-day return policy'
        };
      default:
        return {
          features: ['Fast shipping', 'Easy returns', 'Quality guarantee'],
          shipping: 'Standard shipping',
          returns: '30-day return policy'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to store
          </Link>
        </div>
      </div>
    );
  }

  const displayImages = getDisplayImages();
  const currentPrice = getCurrentPrice();
  const storeInfo = getStoreSpecificInfo();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="hover:underline" style={{ color: 'var(--color-textSecondary)' }}>
            Home
          </Link>
          <span style={{ color: 'var(--color-textSecondary)' }}>/</span>
          <Link href={`/?category=${product.category._id}`} className="hover:underline" style={{ color: 'var(--color-textSecondary)' }}>
            {product.category.name}
          </Link>
          <span style={{ color: 'var(--color-textSecondary)' }}>/</span>
          <span style={{ color: 'var(--color-text)' }}>{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {displayImages.length > 0 && (
              <>
                {/* Main Image */}
                <div className="relative aspect-square overflow-hidden rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <img
                    src={displayImages[selectedImageIndex]?.url}
                    alt={displayImages[selectedImageIndex]?.alt || product.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Navigation */}
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : displayImages.length - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev < displayImages.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {displayImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {displayImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                {product.title}
              </h1>
              
              {product.rating.count > 0 && (
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-2 mb-4 hover:opacity-75 transition-opacity"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                  </span>
                </button>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(currentPrice)}
              </span>
              {product.comparePrice && product.comparePrice > currentPrice && (
                <span className="text-xl line-through" style={{ color: 'var(--color-textSecondary)' }}>
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <p className="text-lg" style={{ color: 'var(--color-textSecondary)' }}>
                {product.description}
              </p>
            )}

            {/* Variants */}
            {product.variants.map((variant) => (
              <div key={variant.name} className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {variant.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVariantChange(variant.name, option.value)}
                      disabled={!option.inStock}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                        selectedVariants[variant.name] === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      } ${!option.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {option.value}
                      {option.price && option.price !== 0 && (
                        <span className="ml-1">
                          ({option.price > 0 ? '+' : ''}${option.price.toFixed(2)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {product.inventory > 0 && (
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {product.inventory} in stock
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className={`flex-1 py-3 px-6 font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    addedToCart ? 'bg-green-500' : ''
                  }`}
                  style={{
                    backgroundColor: addedToCart 
                      ? '#10b981'
                      : product.inStock 
                        ? 'var(--color-primary)' 
                        : 'var(--color-border)',
                    color: addedToCart || product.inStock ? 'white' : 'var(--color-textSecondary)',
                  }}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : addedToCart ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : product.inStock ? (
                    'Add to Cart'
                  ) : (
                    'Out of Stock'
                  )}
                </button>
                
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 border rounded-md transition-colors ${
                    isWishlisted ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                
                <button className="p-3 border border-gray-300 text-gray-500 hover:border-gray-400 rounded-md transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Store-specific features */}
            <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
              {storeInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  <span style={{ color: 'var(--color-text)' }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-textSecondary)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('description')}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'description' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              {product.specifications.length > 0 && (
                <button 
                  onClick={() => setActiveTab('specifications')}
                  className={`py-2 px-1 border-b-2 text-sm font-medium ${
                    activeTab === 'specifications' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Specifications
                </button>
              )}
              <button 
                onClick={() => setActiveTab('shipping')}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'shipping' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Shipping & Returns
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === 'reviews' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>
          
          <div className="py-6">
            {/* Description Tab Content */}
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                {product.detailedDescription ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
                    style={{ color: 'var(--color-text)' }}
                  />
                ) : product.description ? (
                  <p style={{ color: 'var(--color-text)' }}>{product.description}</p>
                ) : (
                  <p style={{ color: 'var(--color-textSecondary)' }}>No detailed description available.</p>
                )}
              </div>
            )}
            
            {/* Specifications Tab Content */}
            {activeTab === 'specifications' && product.specifications.length > 0 && (
              <div className="space-y-4">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {spec.name}
                    </span>
                    <span style={{ color: 'var(--color-textSecondary)' }}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Shipping Tab Content */}
            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Shipping Information
                  </h4>
                  <p style={{ color: 'var(--color-textSecondary)' }}>
                    {storeInfo.shipping}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Return Policy
                  </h4>
                  <p style={{ color: 'var(--color-textSecondary)' }}>
                    {storeInfo.returns}
                  </p>
                </div>
              </div>
            )}
            
            {/* Reviews Tab Content */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Form */}
                {user && canReview && (
                  <ReviewForm 
                    productId={product._id} 
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                )}
                
                {/* Review Eligibility Message */}
                {user && !canReview && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      {reviewEligibility === 'Already reviewed' 
                        ? 'You have already reviewed this product.' 
                        : reviewEligibility === 'Must purchase product first'
                        ? 'You can only review products you have purchased.'
                        : 'Unable to review this product at this time.'}
                    </p>
                  </div>
                )}
                
                {/* Login Message */}
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      Please log in to write a review.
                    </p>
                  </div>
                )}
                
                {/* Reviews List */}
                <Reviews 
                  reviews={reviews}
                  averageRating={product.rating.average}
                  totalReviews={product.rating.count}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
