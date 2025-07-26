'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { predefinedThemes } from '@/lib/predefinedThemes';
import { predefinedLayouts } from '@/lib/predefinedLayouts';
import { Palette, Type, Layout, Save, RefreshCw, Download, Store } from 'lucide-react';

interface Theme {
  _id?: string;
  name: string;
  isActive?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: {
      small: string;
      base: string;
      large: string;
      xl: string;
      xxl: string;
    };
  };
  layout: {
    containerMaxWidth: string;
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      xl: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
      xl: string;
    };
    grid: {
      columns: {
        mobile: number;
        tablet: number;
        desktop: number;
        large: number;
      };
      gap: string;
    };
    header: {
      height: string;
      sticky: boolean;
      blur: boolean;
    };
    buttons: {
      size: {
        small: { height: string; padding: string; fontSize: string };
        medium: { height: string; padding: string; fontSize: string };
        large: { height: string; padding: string; fontSize: string };
      };
      style: string;
    };
    cards: {
      padding: string;
      borderWidth: string;
      hoverEffect: string;
    };
  };
}

export default function ThemeCustomizer() {
  const { theme, setTheme, refreshTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout'>('colors');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeName, setThemeName] = useState('');
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (theme) {
      setCurrentTheme({ ...theme });
      setThemeName(theme.name || '');
    }
  }, [theme]);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [colorKey]: value,
      },
    });
  };

  const handleTypographyChange = (key: string, value: string) => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      typography: {
        ...currentTheme.typography,
        [key]: value,
      },
    });
  };

  const handleFontSizeChange = (sizeKey: string, value: string) => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      typography: {
        ...currentTheme.typography,
        fontSize: {
          ...currentTheme.typography.fontSize,
          [sizeKey]: value,
        },
      },
    });
  };

  const handleLayoutChange = (key: string, value: string | number | boolean | object) => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      layout: {
        ...currentTheme.layout,
        [key]: value,
      },
    });
  };

  const saveTheme = async () => {
    if (!currentTheme || !themeName) return;
    
    try {
      const themeData = {
        ...currentTheme,
        name: themeName,
      };
      
      const response = await fetch('/api/themes', {
        method: currentTheme._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTheme._id ? { id: currentTheme._id, ...themeData } : themeData),
      });
      
      if (response.ok) {
        await fetchThemes();
        alert('Theme saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Failed to save theme');
    }
  };

  const activateTheme = async (themeId: string) => {
    try {
      const response = await fetch('/api/themes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: themeId, isActive: true }),
      });
      
      if (response.ok) {
        await fetchThemes();
        await refreshTheme();
        alert('Theme activated successfully!');
      }
    } catch (error) {
      console.error('Failed to activate theme:', error);
      alert('Failed to activate theme');
    }
  };

  const applyPreview = () => {
    if (currentTheme) {
      setTheme(currentTheme);
    }
  };

  if (!currentTheme) {
    return <div>Loading theme customizer...</div>;
  }

  return (
    <div className="theme-surface rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Theme Customizer</h2>
        <div className="flex gap-2">
          <button
            onClick={applyPreview}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:filter hover:brightness-90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={saveTheme}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-success)] text-white rounded-md hover:filter hover:brightness-90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Theme
          </button>
        </div>
      </div>

      {/* Theme Name Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme Name
        </label>
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter theme name"
        />
      </div>

      {/* Predefined Themes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Predefined Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {predefinedThemes.map((predefinedTheme, index) => (
            <div
              key={index}
              className="p-3 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => {
                setCurrentTheme(predefinedTheme);
                setThemeName(predefinedTheme.name);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{predefinedTheme.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTheme(predefinedTheme);
                    setThemeName(predefinedTheme.name);
                    setTheme(predefinedTheme);
                  }}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Preview
                </button>
              </div>
              <div className="flex gap-1">
                {Object.values(predefinedTheme.colors).slice(0, 6).map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Themes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Saved Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map((savedTheme) => (
            <div
              key={savedTheme._id}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                savedTheme.isActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-500'
              }`}
              onClick={() => {
                setCurrentTheme(savedTheme);
                setThemeName(savedTheme.name);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{savedTheme.name}</span>
                {savedTheme.isActive ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Active
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      activateTheme(savedTheme._id!);
                    }}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Activate
                  </button>
                )}
              </div>
              <div className="flex gap-1 mt-2">
                {Object.values(savedTheme.colors).slice(0, 5).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'colors'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette className="w-4 h-4" />
          Colors
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'typography'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Type className="w-4 h-4" />
          Typography
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'layout'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layout className="w-4 h-4" />
          Layout
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(currentTheme.colors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'typography' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={currentTheme.typography.fontFamily}
                onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="Roboto, system-ui, sans-serif">Roboto</option>
                <option value="Poppins, system-ui, sans-serif">Poppins</option>
                <option value="Nunito, system-ui, sans-serif">Nunito</option>
                <option value="Open Sans, system-ui, sans-serif">Open Sans</option>
                <option value="Lato, system-ui, sans-serif">Lato</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading Font
              </label>
              <select
                value={currentTheme.typography.headingFont}
                onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="Roboto, system-ui, sans-serif">Roboto</option>
                <option value="Poppins, system-ui, sans-serif">Poppins</option>
                <option value="Nunito, system-ui, sans-serif">Nunito</option>
                <option value="Playfair Display, serif">Playfair Display</option>
                <option value="Merriweather, serif">Merriweather</option>
              </select>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Font Sizes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentTheme.typography.fontSize).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key} Size
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFontSizeChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 1rem, 16px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'layout' && (
        <div className="space-y-8">
          {/* Store Type Layouts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Store Type Layouts
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose a layout optimized for your store type. Each layout includes specialized features and styling.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predefinedLayouts.map((layout) => (
                <div
                  key={layout.variation}
                  className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200 hover:shadow-md"
                >
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1">{layout.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{layout.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: layout.colorScheme.primary }}
                      ></span>
                      <span 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: layout.colorScheme.accent }}
                      ></span>
                      <span className="text-xs text-gray-500 capitalize">{layout.storeType}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    <div>Grid: {layout.layout.grid.columns.mobile}→{layout.layout.grid.columns.desktop} cols</div>
                    <div>Style: {layout.layout.productCard.style}</div>
                    <div>Navigation: {layout.layout.navigation.style}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (currentTheme) {
                          // Apply layout properties
                          const updated = { 
                            ...currentTheme, 
                            layout: {
                              ...currentTheme.layout,
                              ...layout.layout,
                              storeType: layout.storeType
                            }
                          };
                          setCurrentTheme(updated);
                        }
                      }}
                      className="flex-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Apply Layout
                    </button>
                    <button
                      onClick={() => {
                        if (currentTheme) {
                          // Apply both layout and color scheme
                          const updated = { 
                            ...currentTheme,
                            colors: {
                              ...currentTheme.colors,
                              ...layout.colorScheme
                            },
                            layout: {
                              ...currentTheme.layout,
                              ...layout.layout,
                              storeType: layout.storeType
                            }
                          };
                          setCurrentTheme(updated);
                          setTheme(updated);
                        }
                      }}
                      className="flex-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      Full Theme
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Customization */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Customization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Container Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Container</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Width
                  </label>
                  <input
                    type="text"
                    value={currentTheme.layout.containerMaxWidth}
                    onChange={(e) => handleLayoutChange('containerMaxWidth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g., 1200px"
                  />
                </div>
              </div>

              {/* Grid Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Grid</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gap
                  </label>
                  <input
                    type="text"
                    value={currentTheme.layout.grid.gap}
                    onChange={(e) => handleLayoutChange('grid', { ...currentTheme.layout.grid, gap: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g., 1rem"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentTheme.layout.grid.columns).map(([device, value]) => (
                    <div key={device}>
                      <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                        {device}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleLayoutChange('grid', {
                          ...currentTheme.layout.grid,
                          columns: {
                            ...currentTheme.layout.grid.columns,
                            [device]: parseInt(e.target.value) || 1
                          }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        min="1"
                        max="6"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Header Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Header</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="text"
                    value={currentTheme.layout.header.height}
                    onChange={(e) => handleLayoutChange('header', { ...currentTheme.layout.header, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g., 4rem"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentTheme.layout.header.sticky}
                      onChange={(e) => handleLayoutChange('header', { ...currentTheme.layout.header, sticky: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Sticky</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentTheme.layout.header.blur}
                      onChange={(e) => handleLayoutChange('header', { ...currentTheme.layout.header, blur: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Blur</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
