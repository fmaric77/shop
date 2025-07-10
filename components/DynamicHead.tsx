'use client';

import { useContent } from '@/contexts/ContentContext';
import { useEffect } from 'react';

export default function DynamicHead() {
  const { content } = useContent();

  useEffect(() => {
    // Update document title dynamically
    if (content.metaTitle) {
      document.title = content.metaTitle;
    }
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && content.metaDescription) {
      metaDescription.setAttribute('content', content.metaDescription);
    }
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords && content.metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (metaKeywords && content.metaKeywords) {
      metaKeywords.setAttribute('content', content.metaKeywords);
    }
  }, [content]);

  return null; // This component doesn't render anything
}
