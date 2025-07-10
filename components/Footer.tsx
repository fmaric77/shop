'use client';

import { useContent } from '@/contexts/ContentContext';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  email: Mail,
  phone: Phone,
  linkedin: ExternalLink,
  youtube: ExternalLink,
  tiktok: ExternalLink,
};

export default function Footer() {
  const { content } = useContent();

  const getSocialIcon = (iconName: string) => {
    const IconComponent = socialIcons[iconName.toLowerCase() as keyof typeof socialIcons] || ExternalLink;
    return IconComponent;
  };

  return (
    <footer className="mt-auto border-t" style={{ 
      backgroundColor: 'var(--color-surface)', 
      borderColor: 'var(--color-border)',
      color: 'var(--color-text)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Store Info */}
          <div className="space-y-4">
            <div>
              {content.storeLogo ? (
                <img 
                  src={content.storeLogo} 
                  alt={content.storeName}
                  className="h-8 w-auto mb-3"
                />
              ) : (
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-primary)' }}>
                  {content.storeName}
                </h3>
              )}
              <p className="text-sm mb-2" style={{ color: 'var(--color-textSecondary)' }}>
                {content.storeTagline}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                {content.storeDescription}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {content.footerLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.url}
                    target={link.openInNewTab ? '_blank' : '_self'}
                    rel={link.openInNewTab ? 'noopener noreferrer' : ''}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {link.title}
                    {link.openInNewTab && <ExternalLink className="inline ml-1 h-3 w-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              {content.contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  <a 
                    href={`mailto:${content.contactInfo.email}`}
                    className="text-sm hover:underline"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {content.contactInfo.email}
                  </a>
                </div>
              )}
              
              {content.contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  <a 
                    href={`tel:${content.contactInfo.phone}`}
                    className="text-sm hover:underline"
                    style={{ color: 'var(--color-textSecondary)' }}
                  >
                    {content.contactInfo.phone}
                  </a>
                </div>
              )}
              
              {content.contactInfo.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {content.contactInfo.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Follow Us</h4>
            <div className="flex flex-wrap gap-3">
              {content.socialLinks.map((social, index) => {
                if (!social.url || social.url === '#') return null;
                
                const IconComponent = getSocialIcon(social.icon);
                
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-colors hover:opacity-75"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)'
                    }}
                    title={social.platform}
                  >
                    <IconComponent className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            {content.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
