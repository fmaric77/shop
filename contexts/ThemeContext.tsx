'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<any>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<any>(null);

  const setTheme = (newTheme: any) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const refreshTheme = async () => {
    try {
      const response = await fetch('/api/themes/active');
      if (response.ok) {
        const activeTheme = await response.json();
        setTheme(activeTheme);
      }
    } catch (error) {
      console.error('Failed to fetch active theme:', error);
    }
  };

  const applyTheme = (theme: any) => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply typography variables
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-heading', theme.typography.headingFont);
    
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    // Apply layout variables
    root.style.setProperty('--container-max-width', theme.layout.containerMaxWidth);
    
    // Border radius variables
    Object.entries(theme.layout.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // Spacing variables
    Object.entries(theme.layout.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Shadow variables
    Object.entries(theme.layout.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Grid variables
    root.style.setProperty('--grid-gap', theme.layout.grid.gap);
    Object.entries(theme.layout.grid.columns).forEach(([device, value]) => {
      root.style.setProperty(`--grid-columns-${device}`, value.toString());
    });
    
    // Header variables
    root.style.setProperty('--header-height', theme.layout.header.height);
    root.style.setProperty('--header-sticky', theme.layout.header.sticky ? 'sticky' : 'static');
    root.style.setProperty('--header-blur', theme.layout.header.blur ? 'blur(10px)' : 'none');
    
    // Button variables
    root.style.setProperty('--button-style', theme.layout.buttons.style);
    Object.entries(theme.layout.buttons.size).forEach(([size, values]) => {
      root.style.setProperty(`--button-${size}-height`, values.height);
      root.style.setProperty(`--button-${size}-padding`, values.padding);
      root.style.setProperty(`--button-${size}-font-size`, values.fontSize);
    });
    
    // Card variables
    root.style.setProperty('--card-padding', theme.layout.cards.padding);
    root.style.setProperty('--card-border-width', theme.layout.cards.borderWidth);
    root.style.setProperty('--card-hover-effect', theme.layout.cards.hoverEffect);
    
    // Store-specific layout variables
    if (theme.layout.storeType) {
      root.style.setProperty('--store-type', theme.layout.storeType);
    }
    
    if (theme.layout.aspectRatio) {
      root.style.setProperty('--product-aspect-ratio', theme.layout.aspectRatio);
    }
    
    if (theme.layout.imageSize) {
      root.style.setProperty('--product-image-size', theme.layout.imageSize);
    }
    
    if (theme.layout.productCard) {
      Object.entries(theme.layout.productCard).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'boolean') {
          root.style.setProperty(`--product-card-${key}`, value.toString());
        }
      });
    }
    
    if (theme.layout.navigation) {
      Object.entries(theme.layout.navigation).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--navigation-${key}`, value);
        }
      });
    }
    
    if (theme.layout.typography) {
      Object.entries(theme.layout.typography).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--layout-typography-${key}`, value);
        }
      });
    }
  };

  useEffect(() => {
    refreshTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
