"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatPrice, getDefaultCurrencySettings } from '@/lib/currency';

interface CurrencySettings {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

interface CurrencyContextType {
  currency: CurrencySettings;
  formatPrice: (price: number) => string;
  refreshCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [currency, setCurrency] = useState<CurrencySettings>(getDefaultCurrencySettings());

  const fetchCurrency = async () => {
    try {
      const response = await fetch('/api/store-settings');
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.currency);
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  const formatPriceWithCurrency = (price: number) => {
    return formatPrice(price, currency);
  };

  const refreshCurrency = () => {
    fetchCurrency();
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        formatPrice: formatPriceWithCurrency,
        refreshCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
