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
      root.style.setProperty(`--color-${key}`, value as string);
    });
    
    // Apply typography variables
    root.style.setProperty('--font-family', theme.typography.fontFamily as string);
    root.style.setProperty('--font-heading', theme.typography.headingFont as string);
    
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value as string);
    });
    
    // Apply layout variables
    root.style.setProperty('--container-max-width', theme.layout.containerMaxWidth as string);
    
    // Border radius variables
    Object.entries(theme.layout.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value as string);
    });
    
    // Spacing variables
    Object.entries(theme.layout.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value as string);
    });
    
    // Shadow variables
    Object.entries(theme.layout.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value as string);
    });
    
    // Grid variables
    root.style.setProperty('--grid-gap', theme.layout.grid.gap as string);
    Object.entries(theme.layout.grid.columns).forEach(([device, value]) => {
      root.style.setProperty(`--grid-columns-${device}`, (value as number).toString());
    });
    
    // Header variables
    root.style.setProperty('--header-height', theme.layout.header.height as string);
    root.style.setProperty('--header-sticky', theme.layout.header.sticky ? 'sticky' : 'static');
    root.style.setProperty('--header-blur', theme.layout.header.blur ? 'blur(10px)' : 'none');
    
    // Button variables
    root.style.setProperty('--button-style', theme.layout.buttons.style as string);
    Object.entries(theme.layout.buttons.size).forEach(([size, values]) => {
      root.style.setProperty(`--button-${size}-height`, (values as any).height.toString());
      root.style.setProperty(`--button-${size}-padding`, (values as any).padding.toString());
      root.style.setProperty(`--button-${size}-font-size`, (values as any).fontSize.toString());
    });
    
    // Card variables
    root.style.setProperty('--card-padding', theme.layout.cards.padding as string);
    root.style.setProperty('--card-border-width', theme.layout.cards.borderWidth as string);
    root.style.setProperty('--card-hover-effect', theme.layout.cards.hoverEffect as string);
    
    // Store-specific layout variables
    if (theme.layout.storeType) {
      root.style.setProperty('--store-type', theme.layout.storeType as string);
    }
    
    if (theme.layout.aspectRatio) {
      root.style.setProperty('--product-aspect-ratio', theme.layout.aspectRatio as string);
    }
    
    if (theme.layout.imageSize) {
      root.style.setProperty('--product-image-size', theme.layout.imageSize as string);
    }
    
    if (theme.layout.productCard) {
      Object.entries(theme.layout.productCard).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'boolean') {
          root.style.setProperty(`--product-card-${key}`, (value as any).toString());
        }
      });
    }
    
    if (theme.layout.navigation) {
      Object.entries(theme.layout.navigation).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--navigation-${key}`, value as string);
        }
      });
    }
    
    if (theme.layout.typography) {
      Object.entries(theme.layout.typography).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--layout-typography-${key}`, value as string);
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
