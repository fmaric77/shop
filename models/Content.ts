import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Allows strings, objects, arrays
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'html', 'image', 'json', 'boolean'],
    default: 'text'
  },
  category: {
    type: String,
    enum: ['branding', 'footer', 'general', 'seo'],
    default: 'general'
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.models?.Content || mongoose.model('Content', ContentSchema);
