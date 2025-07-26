import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Theme from '@/models/Theme';

export async function GET() {
  try {
    await connectDB();
    const activeTheme = await Theme.findOne({ isActive: true });
    
    if (!activeTheme) {
      // Return default theme if none is active
      const defaultTheme = {
        name: 'Default',
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          textSecondary: '#6b7280',
          border: '#e5e7eb',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          headingFont: 'Inter, system-ui, sans-serif',
          fontSize: {
            small: '0.875rem',
            base: '1rem',
            large: '1.125rem',
            xl: '1.25rem',
            xxl: '1.5rem',
          },
        },
        layout: {
          containerMaxWidth: '1200px',
          borderRadius: {
            small: '0.25rem',
            medium: '0.5rem',
            large: '0.75rem',
            xl: '1rem',
          },
          spacing: {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
            xxl: '3rem',
          },
          shadows: {
            small: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
          grid: {
            columns: {
              mobile: 1,
              tablet: 2,
              desktop: 3,
              large: 4,
            },
            gap: '1rem',
          },
          header: {
            height: '4rem',
            sticky: true,
            blur: false,
          },
          buttons: {
            size: {
              small: { height: '2rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
              medium: { height: '2.5rem', padding: '0.625rem 1rem', fontSize: '1rem' },
              large: { height: '3rem', padding: '0.75rem 1.25rem', fontSize: '1.125rem' },
            },
            style: 'rounded',
          },
          cards: {
            padding: '1.5rem',
            borderWidth: '1px',
            hoverEffect: 'lift',
          },
        },
      };
      return NextResponse.json(defaultTheme);
    }
    
    return NextResponse.json(activeTheme);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch active theme' }, { status: 500 });
  }
}
