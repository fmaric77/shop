export const predefinedLayouts = [
  {
    name: 'Fashion & Clothing Store',
    variation: 'fashion',
    description: 'Elegant layout optimized for showcasing fashion items with large imagery and sophisticated styling',
    storeType: 'fashion',
    layout: {
      containerMaxWidth: '1400px',
      grid: { 
        columns: { mobile: 1, tablet: 2, desktop: 3, large: 4 }, 
        gap: '2rem',
        aspectRatio: '3/4', // Portrait aspect for clothing items
        imageSize: 'large'
      },
      header: { 
        height: '5rem', 
        sticky: true, 
        blur: true,
        transparent: true
      },
      productCard: {
        style: 'minimal',
        imageFirst: true,
        showBadges: true,
        hoverEffect: 'zoom',
        borderRadius: 'small',
        padding: '1rem'
      },
      navigation: {
        style: 'sidebar',
        categories: 'featured',
        filters: ['size', 'color', 'brand', 'price']
      },
      typography: {
        headingStyle: 'elegant',
        priceDisplay: 'prominent',
        descriptionLength: 'short'
      }
    },
    colorScheme: {
      primary: '#1a1a1a',
      secondary: '#f5f5f5',
      accent: '#d4af37',
      background: '#ffffff',
      surface: '#fafafa'
    }
  },
  {
    name: 'Electronics & Tech Store',
    variation: 'electronics',
    description: 'Modern tech-focused layout with detailed specifications and comparison features',
    storeType: 'electronics',
    layout: {
      containerMaxWidth: '1600px',
      grid: { 
        columns: { mobile: 1, tablet: 2, desktop: 3, large: 4 }, 
        gap: '1.5rem',
        aspectRatio: '4/3', // Landscape for tech products
        imageSize: 'medium'
      },
      header: { 
        height: '4.5rem', 
        sticky: true, 
        blur: false,
        transparent: false
      },
      productCard: {
        style: 'detailed',
        imageFirst: true,
        showSpecs: true,
        showRatings: true,
        hoverEffect: 'lift',
        borderRadius: 'medium',
        padding: '1.5rem'
      },
      navigation: {
        style: 'topbar',
        categories: 'dropdown',
        filters: ['brand', 'price', 'rating', 'features']
      },
      typography: {
        headingStyle: 'modern',
        priceDisplay: 'comparison',
        descriptionLength: 'detailed'
      }
    },
    colorScheme: {
      primary: '#0066cc',
      secondary: '#333333',
      accent: '#00ff88',
      background: '#f8f9fa',
      surface: '#ffffff'
    }
  },
  {
    name: 'Outdoor & Fishing Store',
    variation: 'outdoor',
    description: 'Rugged, nature-inspired layout perfect for outdoor gear and fishing equipment',
    storeType: 'outdoor',
    layout: {
      containerMaxWidth: '1300px',
      grid: { 
        columns: { mobile: 1, tablet: 2, desktop: 3, large: 3 }, 
        gap: '2rem',
        aspectRatio: '1/1', // Square for gear items
        imageSize: 'large'
      },
      header: { 
        height: '4rem', 
        sticky: true, 
        blur: false,
        transparent: false
      },
      productCard: {
        style: 'rugged',
        imageFirst: true,
        showDurability: true,
        showWeatherResistance: true,
        hoverEffect: 'subtle',
        borderRadius: 'large',
        padding: '1.25rem'
      },
      navigation: {
        style: 'sidebar',
        categories: 'expandable',
        filters: ['activity', 'season', 'material', 'price', 'brand']
      },
      typography: {
        headingStyle: 'bold',
        priceDisplay: 'clear',
        descriptionLength: 'practical'
      }
    },
    colorScheme: {
      primary: '#2d5016',
      secondary: '#8b4513',
      accent: '#ff6b35',
      background: '#f4f1e8',
      surface: '#ffffff'
    }
  },
  {
    name: 'Luxury & Jewelry Store',
    variation: 'luxury',
    description: 'Premium, sophisticated layout designed for high-end luxury items and jewelry',
    storeType: 'luxury',
    layout: {
      containerMaxWidth: '1200px',
      grid: { 
        columns: { mobile: 1, tablet: 1, desktop: 2, large: 3 }, 
        gap: '3rem',
        aspectRatio: '1/1', // Square for jewelry
        imageSize: 'extra-large'
      },
      header: { 
        height: '6rem', 
        sticky: true, 
        blur: true,
        transparent: true
      },
      productCard: {
        style: 'premium',
        imageFirst: true,
        showCertification: true,
        showMaterials: true,
        hoverEffect: 'glow',
        borderRadius: 'none',
        padding: '2rem'
      },
      navigation: {
        style: 'minimal',
        categories: 'elegant',
        filters: ['material', 'collection', 'price', 'occasion']
      },
      typography: {
        headingStyle: 'luxury',
        priceDisplay: 'discreet',
        descriptionLength: 'detailed'
      }
    },
    colorScheme: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#d4af37',
      background: '#fefefe',
      surface: '#f9f9f9'
    }
  },
  {
    name: 'Food & Grocery Store',
    variation: 'food',
    description: 'Fresh, appetizing layout optimized for food products with emphasis on freshness and nutrition',
    storeType: 'food',
    layout: {
      containerMaxWidth: '1500px',
      grid: { 
        columns: { mobile: 2, tablet: 3, desktop: 4, large: 5 }, 
        gap: '1rem',
        aspectRatio: '3/4', // Portrait for food packaging
        imageSize: 'medium'
      },
      header: { 
        height: '4rem', 
        sticky: true, 
        blur: false,
        transparent: false
      },
      productCard: {
        style: 'fresh',
        imageFirst: true,
        showNutrition: true,
        showFreshness: true,
        showOrigin: true,
        hoverEffect: 'bounce',
        borderRadius: 'medium',
        padding: '1rem'
      },
      navigation: {
        style: 'categories',
        categories: 'aisles',
        filters: ['dietary', 'brand', 'price', 'organic', 'local']
      },
      typography: {
        headingStyle: 'friendly',
        priceDisplay: 'per-unit',
        descriptionLength: 'nutritional'
      }
    },
    colorScheme: {
      primary: '#2e7d32',
      secondary: '#ff9800',
      accent: '#e53935',
      background: '#ffffff',
      surface: '#f1f8e9'
    }
  },
  {
    name: 'Books & Media Store',
    variation: 'books',
    description: 'Literary-inspired layout perfect for books, magazines, and media products',
    storeType: 'books',
    layout: {
      containerMaxWidth: '1400px',
      grid: { 
        columns: { mobile: 2, tablet: 3, desktop: 4, large: 5 }, 
        gap: '1.5rem',
        aspectRatio: '2/3', // Portrait for books
        imageSize: 'medium'
      },
      header: { 
        height: '4rem', 
        sticky: true, 
        blur: false,
        transparent: false
      },
      productCard: {
        style: 'literary',
        imageFirst: true,
        showAuthor: true,
        showRating: true,
        showGenre: true,
        hoverEffect: 'page-flip',
        borderRadius: 'small',
        padding: '1rem'
      },
      navigation: {
        style: 'library',
        categories: 'genres',
        filters: ['author', 'genre', 'rating', 'price', 'publication-year']
      },
      typography: {
        headingStyle: 'serif',
        priceDisplay: 'standard',
        descriptionLength: 'synopsis'
      }
    },
    colorScheme: {
      primary: '#5d4037',
      secondary: '#8d6e63',
      accent: '#d32f2f',
      background: '#fff8e1',
      surface: '#ffffff'
    }
  },
  {
    name: 'Sports & Fitness Store',
    variation: 'sports',
    description: 'Dynamic, energetic layout designed for sports equipment and fitness gear',
    storeType: 'sports',
    layout: {
      containerMaxWidth: '1500px',
      grid: { 
        columns: { mobile: 1, tablet: 2, desktop: 3, large: 4 }, 
        gap: '1.5rem',
        aspectRatio: '4/3', // Landscape for sports equipment
        imageSize: 'large'
      },
      header: { 
        height: '4.5rem', 
        sticky: true, 
        blur: false,
        transparent: false
      },
      productCard: {
        style: 'athletic',
        imageFirst: true,
        showPerformance: true,
        showSport: true,
        hoverEffect: 'pulse',
        borderRadius: 'medium',
        padding: '1.25rem'
      },
      navigation: {
        style: 'sports',
        categories: 'sports-type',
        filters: ['sport', 'brand', 'size', 'price', 'level']
      },
      typography: {
        headingStyle: 'dynamic',
        priceDisplay: 'bold',
        descriptionLength: 'performance'
      }
    },
    colorScheme: {
      primary: '#1976d2',
      secondary: '#424242',
      accent: '#ff5722',
      background: '#f5f5f5',
      surface: '#ffffff'
    }
  },
  {
    name: 'Home & Garden Store',
    variation: 'home',
    description: 'Warm, homey layout perfect for home decor, furniture, and garden supplies',
    storeType: 'home',
    layout: {
      containerMaxWidth: '1400px',
      grid: { 
        columns: { mobile: 1, tablet: 2, desktop: 3, large: 3 }, 
        gap: '2rem',
        aspectRatio: '4/3', // Landscape for home items
        imageSize: 'large'
      },
      header: { 
        height: '4rem', 
        sticky: true, 
        blur: true,
        transparent: false
      },
      productCard: {
        style: 'cozy',
        imageFirst: true,
        showRoom: true,
        showDimensions: true,
        hoverEffect: 'warm',
        borderRadius: 'large',
        padding: '1.5rem'
      },
      navigation: {
        style: 'rooms',
        categories: 'room-based',
        filters: ['room', 'style', 'color', 'price', 'material']
      },
      typography: {
        headingStyle: 'welcoming',
        priceDisplay: 'comfortable',
        descriptionLength: 'lifestyle'
      }
    },
    colorScheme: {
      primary: '#8bc34a',
      secondary: '#795548',
      accent: '#ff9800',
      background: '#fafafa',
      surface: '#ffffff'
    }
  },
  {
    name: 'Beauty & Cosmetics Store',
    variation: 'beauty',
    description: 'Elegant, beauty-focused layout optimized for cosmetics and skincare products',
    storeType: 'beauty',
    layout: {
      containerMaxWidth: '1300px',
      grid: { 
        columns: { mobile: 2, tablet: 3, desktop: 4, large: 5 }, 
        gap: '1.25rem',
        aspectRatio: '3/4', // Portrait for beauty products
        imageSize: 'medium'
      },
      header: { 
        height: '4.5rem', 
        sticky: true, 
        blur: true,
        transparent: true
      },
      productCard: {
        style: 'glamorous',
        imageFirst: true,
        showShades: true,
        showSkinType: true,
        showIngredients: true,
        hoverEffect: 'shimmer',
        borderRadius: 'medium',
        padding: '1rem'
      },
      navigation: {
        style: 'beauty',
        categories: 'beauty-type',
        filters: ['category', 'brand', 'skin-type', 'price', 'concern']
      },
      typography: {
        headingStyle: 'elegant',
        priceDisplay: 'beautiful',
        descriptionLength: 'benefits'
      }
    },
    colorScheme: {
      primary: '#e91e63',
      secondary: '#9c27b0',
      accent: '#ff6f00',
      background: '#fce4ec',
      surface: '#ffffff'
    }
  },
  {
    name: 'Automotive Parts Store',
    variation: 'automotive',
    description: 'Technical, professional layout designed for automotive parts and accessories',
    storeType: 'automotive',
    layout: {
      containerMaxWidth: '1600px',
      grid: { 
        columns: { mobile: 1, tablet: 2, desktop: 3, large: 4 }, 
        gap: '1.5rem',
        aspectRatio: '4/3', // Landscape for auto parts
        imageSize: 'medium'
      },
      header: { 
        height: '4rem', 
        sticky: true, 
        blur: false,
        transparent: false
      },
      productCard: {
        style: 'technical',
        imageFirst: true,
        showCompatibility: true,
        showPartNumber: true,
        showWarranty: true,
        hoverEffect: 'none',
        borderRadius: 'small',
        padding: '1.25rem'
      },
      navigation: {
        style: 'technical',
        categories: 'vehicle-type',
        filters: ['vehicle', 'brand', 'year', 'price', 'oem']
      },
      typography: {
        headingStyle: 'technical',
        priceDisplay: 'professional',
        descriptionLength: 'specifications'
      }
    },
    colorScheme: {
      primary: '#424242',
      secondary: '#ff5722',
      accent: '#2196f3',
      background: '#fafafa',
      surface: '#ffffff'
    }
  }
];
