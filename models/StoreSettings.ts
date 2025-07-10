import mongoose from 'mongoose';

const StoreSettingsSchema = new mongoose.Schema({
  currency: {
    code: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      maxlength: 3,
    },
    symbol: {
      type: String,
      required: true,
      default: '$',
    },
    name: {
      type: String,
      required: true,
      default: 'US Dollar',
    },
    position: {
      type: String,
      enum: ['before', 'after'],
      default: 'before',
    },
    decimalPlaces: {
      type: Number,
      default: 2,
      min: 0,
      max: 4,
    },
    thousandsSeparator: {
      type: String,
      default: ',',
    },
    decimalSeparator: {
      type: String,
      default: '.',
    },
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY',
  },
  ai: {
    provider: {
      type: String,
      enum: ['none', 'grok'],
      default: 'none',
    },
    grok: {
      apiKey: {
        type: String,
        default: '',
      },
      model: {
        type: String,
        default: 'grok-beta',
      },
      enabled: {
        type: Boolean,
        default: false,
      },
      features: {
        productRecommendations: {
          type: Boolean,
          default: true,
        },
        productDescriptions: {
          type: Boolean,
          default: true,
        },
        customerSupport: {
          type: Boolean,
          default: true,
        },
        searchAssistant: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  // Make this a singleton - only one settings document
  _id: {
    type: String,
    default: 'store-settings',
  },
}, {
  timestamps: true,
});

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
