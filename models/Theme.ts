import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  variation: {
    type: String,
    enum: ['grid', 'list', 'masonry'],
    default: 'grid',
  },
  colors: {
    primary: { type: String, default: '#3b82f6' },
    secondary: { type: String, default: '#8b5cf6' },
    accent: { type: String, default: '#06b6d4' },
    background: { type: String, default: '#ffffff' },
    surface: { type: String, default: '#f8fafc' },
    text: { type: String, default: '#1f2937' },
    textSecondary: { type: String, default: '#6b7280' },
    border: { type: String, default: '#e5e7eb' },
    success: { type: String, default: '#10b981' },
    warning: { type: String, default: '#f59e0b' },
    error: { type: String, default: '#ef4444' },
  },
  typography: {
    fontFamily: { type: String, default: 'Inter, system-ui, sans-serif' },
    headingFont: { type: String, default: 'Inter, system-ui, sans-serif' },
    fontSize: {
      small: { type: String, default: '0.875rem' },
      base: { type: String, default: '1rem' },
      large: { type: String, default: '1.125rem' },
      xl: { type: String, default: '1.25rem' },
      xxl: { type: String, default: '1.5rem' },
    },
  },
  layout: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
}, {
  timestamps: true,
});

export default mongoose.models?.Theme || mongoose.model('Theme', ThemeSchema);
