'use client';

import { useState, useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { Save, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface FooterLink {
  title: string;
  url: string;
  openInNewTab: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export default function ContentEditor() {
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'branding' | 'footer' | 'seo'>('branding');
  const [saving, setSaving] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all changed content
      const promises = [];
      
      if (localContent.storeName !== content.storeName) {
        promises.push(updateContent('storeName', localContent.storeName));
      }
      if (localContent.storeTagline !== content.storeTagline) {
        promises.push(updateContent('storeTagline', localContent.storeTagline));
      }
      if (localContent.storeLogo !== content.storeLogo) {
        promises.push(updateContent('storeLogo', localContent.storeLogo));
      }
      if (localContent.storeDescription !== content.storeDescription) {
        promises.push(updateContent('storeDescription', localContent.storeDescription));
      }
      if (JSON.stringify(localContent.footerLinks) !== JSON.stringify(content.footerLinks)) {
        promises.push(updateContent('footerLinks', localContent.footerLinks));
      }
      if (JSON.stringify(localContent.socialLinks) !== JSON.stringify(content.socialLinks)) {
        promises.push(updateContent('socialLinks', localContent.socialLinks));
      }
      if (JSON.stringify(localContent.contactInfo) !== JSON.stringify(content.contactInfo)) {
        promises.push(updateContent('contactInfo', localContent.contactInfo));
      }
      if (localContent.footerText !== content.footerText) {
        promises.push(updateContent('footerText', localContent.footerText));
      }
      if (localContent.metaTitle !== content.metaTitle) {
        promises.push(updateContent('metaTitle', localContent.metaTitle));
      }
      if (localContent.metaDescription !== content.metaDescription) {
        promises.push(updateContent('metaDescription', localContent.metaDescription));
      }
      if (localContent.metaKeywords !== content.metaKeywords) {
        promises.push(updateContent('metaKeywords', localContent.metaKeywords));
      }

      await Promise.all(promises);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const addFooterLink = () => {
    setLocalContent(prev => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { title: '', url: '', openInNewTab: false }]
    }));
  };

  const updateFooterLink = (index: number, field: keyof FooterLink, value: any) => {
    setLocalContent(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeFooterLink = (index: number) => {
    setLocalContent(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.filter((_, i) => i !== index)
    }));
  };

  const addSocialLink = () => {
    setLocalContent(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '', icon: '' }]
    }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: any) => {
    setLocalContent(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index: number) => {
    setLocalContent(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const updateContactInfo = (field: keyof ContactInfo, value: string) => {
    setLocalContent(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value }
    }));
  };

  return (
    <div className="theme-surface rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Content Manager</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:filter hover:brightness-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'branding'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-textSecondary)] hover:text-[var(--color-text)]'
          }`}
        >
          Store Branding
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'footer'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-textSecondary)] hover:text-[var(--color-text)]'
          }`}
        >
          Footer Content
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'seo'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-textSecondary)] hover:text-[var(--color-text)]'
          }`}
        >
          SEO Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={localContent.storeName}
              onChange={(e) => setLocalContent(prev => ({ ...prev, storeName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your store name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Tagline
            </label>
            <input
              type="text"
              value={localContent.storeTagline}
              onChange={(e) => setLocalContent(prev => ({ ...prev, storeTagline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A short tagline for your store"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Logo URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={localContent.storeLogo}
                onChange={(e) => setLocalContent(prev => ({ ...prev, storeLogo: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Upload className="h-4 w-4" />
              </button>
            </div>
            {localContent.storeLogo && (
              <div className="mt-2">
                <img 
                  src={localContent.storeLogo} 
                  alt="Store Logo Preview" 
                  className="h-12 w-auto border border-gray-200 rounded"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Description
            </label>
            <textarea
              value={localContent.storeDescription}
              onChange={(e) => setLocalContent(prev => ({ ...prev, storeDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description of your store"
            />
          </div>
        </div>
      )}

      {/* Footer Tab */}
      {activeTab === 'footer' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Text
            </label>
            <input
              type="text"
              value={localContent.footerText}
              onChange={(e) => setLocalContent(prev => ({ ...prev, footerText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="© 2024 Your Store. All rights reserved."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Links
            </label>
            <div className="space-y-3">
              {localContent.footerLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateFooterLink(index, 'title', e.target.value)}
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Link title"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                    className="col-span-6 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Link URL"
                  />
                  <label className="col-span-2 flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={link.openInNewTab}
                      onChange={(e) => updateFooterLink(index, 'openInNewTab', e.target.checked)}
                      className="mr-1"
                    />
                    New tab
                  </label>
                  <button
                    onClick={() => removeFooterLink(index)}
                    className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addFooterLink}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add Footer Link
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Links
            </label>
            <div className="space-y-3">
              {localContent.socialLinks.map((social, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={social.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Platform"
                  />
                  <input
                    type="text"
                    value={social.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="col-span-6 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Social URL"
                  />
                  <input
                    type="text"
                    value={social.icon}
                    onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Icon"
                  />
                  <button
                    onClick={() => removeSocialLink(index)}
                    className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addSocialLink}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add Social Link
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <div className="space-y-3">
              <input
                type="email"
                value={localContent.contactInfo.email}
                onChange={(e) => setLocalContent(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
              />
              <input
                type="tel"
                value={localContent.contactInfo.phone}
                onChange={(e) => setLocalContent(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              />
              <textarea
                value={localContent.contactInfo.address}
                onChange={(e) => setLocalContent(prev => ({ 
                  ...prev, 
                  contactInfo: { ...prev.contactInfo, address: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Physical address"
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={localContent.metaTitle}
              onChange={(e) => setLocalContent(prev => ({ ...prev, metaTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO title for your store"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={localContent.metaDescription}
              onChange={(e) => setLocalContent(prev => ({ ...prev, metaDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="SEO description for your store"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              value={localContent.metaKeywords}
              onChange={(e) => setLocalContent(prev => ({ ...prev, metaKeywords: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO keywords (comma separated)"
            />
          </div>
        </div>
      )}
    </div>
  );
}
