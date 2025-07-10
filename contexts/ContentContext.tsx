'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ContentData {
  // Branding
  storeName: string;
  storeTagline: string;
  storeLogo: string;
  storeDescription: string;
  
  // Footer
  footerText: string;
  footerLinks: Array<{
    title: string;
    url: string;
    openInNewTab: boolean;
  }>;
  socialLinks: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface ContentContextType {
  content: ContentData;
  loading: boolean;
  updateContent: (key: string, value: any) => Promise<boolean>;
  refreshContent: () => Promise<void>;
}

const defaultContent: ContentData = {
  storeName: 'My Store',
  storeTagline: 'Your favorite online store',
  storeLogo: '',
  storeDescription: 'Welcome to our amazing store',
  footerText: '© 2024 My Store. All rights reserved.',
  footerLinks: [
    { title: 'About Us', url: '/about', openInNewTab: false },
    { title: 'Contact', url: '/contact', openInNewTab: false },
    { title: 'Privacy Policy', url: '/privacy', openInNewTab: false },
    { title: 'Terms of Service', url: '/terms', openInNewTab: false }
  ],
  socialLinks: [
    { platform: 'Facebook', url: '#', icon: 'facebook' },
    { platform: 'Twitter', url: '#', icon: 'twitter' },
    { platform: 'Instagram', url: '#', icon: 'instagram' }
  ],
  contactInfo: {
    email: 'contact@mystore.com',
    phone: '+1 (555) 123-4567',
    address: '123 Store Street, City, State 12345'
  },
  metaTitle: 'My Store - Your favorite online store',
  metaDescription: 'Discover amazing products at great prices',
  metaKeywords: 'online store, shopping, products'
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentData>(defaultContent);
  const [loading, setLoading] = useState(true);

  const refreshContent = async () => {
    try {
      const response = await fetch('/api/content');
      if (response.ok) {
        const contentData = await response.json();
        
        // Merge fetched content with defaults
        const mergedContent = { ...defaultContent };
        
        contentData.forEach((item: any) => {
          switch (item.key) {
            case 'storeName':
              mergedContent.storeName = item.value;
              break;
            case 'storeTagline':
              mergedContent.storeTagline = item.value;
              break;
            case 'storeLogo':
              mergedContent.storeLogo = item.value;
              break;
            case 'storeDescription':
              mergedContent.storeDescription = item.value;
              break;
            case 'footerText':
              mergedContent.footerText = item.value;
              break;
            case 'footerLinks':
              mergedContent.footerLinks = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              break;
            case 'socialLinks':
              mergedContent.socialLinks = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              break;
            case 'contactInfo':
              mergedContent.contactInfo = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              break;
            case 'metaTitle':
              mergedContent.metaTitle = item.value;
              break;
            case 'metaDescription':
              mergedContent.metaDescription = item.value;
              break;
            case 'metaKeywords':
              mergedContent.metaKeywords = item.value;
              break;
          }
        });
        
        setContent(mergedContent);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (key: string, value: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (response.ok) {
        // Update local state
        setContent(prev => ({ ...prev, [key]: value }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update content:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, updateContent, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
