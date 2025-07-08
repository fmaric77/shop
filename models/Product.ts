import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  detailedDescription: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    }
  }],
  // Legacy field for backward compatibility
  image: {
    type: String,
    trim: true,
  },
  specifications: [{
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    }
  }],
  variants: [{
    name: {
      type: String,
      required: true,
    },
    options: [{
      value: String,
      price: Number,
      image: String,
      inStock: {
        type: Boolean,
        default: true,
      }
    }]
  }],
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  inventory: {
    type: Number,
    default: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm',
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    }
  }
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
