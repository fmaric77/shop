interface CurrencySettings {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

// Common currencies with their symbols and settings
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', position: 'before' as const },
  EUR: { symbol: '€', name: 'Euro', position: 'before' as const },
  GBP: { symbol: '£', name: 'British Pound', position: 'before' as const },
  JPY: { symbol: '¥', name: 'Japanese Yen', position: 'before' as const },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', position: 'before' as const },
  AUD: { symbol: 'A$', name: 'Australian Dollar', position: 'before' as const },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', position: 'before' as const },
  CNY: { symbol: '¥', name: 'Chinese Yuan', position: 'before' as const },
  SEK: { symbol: 'kr', name: 'Swedish Krona', position: 'after' as const },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', position: 'after' as const },
  DKK: { symbol: 'kr', name: 'Danish Krone', position: 'after' as const },
  INR: { symbol: '₹', name: 'Indian Rupee', position: 'before' as const },
  BRL: { symbol: 'R$', name: 'Brazilian Real', position: 'before' as const },
  MXN: { symbol: '$', name: 'Mexican Peso', position: 'before' as const },
  KRW: { symbol: '₩', name: 'South Korean Won', position: 'before' as const },
  PLN: { symbol: 'zł', name: 'Polish Zloty', position: 'after' as const },
  RUB: { symbol: '₽', name: 'Russian Ruble', position: 'after' as const },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', position: 'before' as const },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', position: 'before' as const },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', position: 'before' as const },
  ZAR: { symbol: 'R', name: 'South African Rand', position: 'before' as const },
  TRY: { symbol: '₺', name: 'Turkish Lira', position: 'before' as const },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', position: 'before' as const },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', position: 'before' as const },
  ILS: { symbol: '₪', name: 'Israeli Shekel', position: 'before' as const },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', position: 'before' as const },
  THB: { symbol: '฿', name: 'Thai Baht', position: 'before' as const },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', position: 'before' as const },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', position: 'before' as const },
  PHP: { symbol: '₱', name: 'Philippine Peso', position: 'before' as const },
  VND: { symbol: '₫', name: 'Vietnamese Dong', position: 'after' as const },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', position: 'after' as const },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', position: 'after' as const },
  RON: { symbol: 'lei', name: 'Romanian Leu', position: 'after' as const },
  BGN: { symbol: 'лв', name: 'Bulgarian Lev', position: 'after' as const },
  HRK: { symbol: 'kn', name: 'Croatian Kuna', position: 'after' as const },
};

export function formatPrice(
  price: number,
  currencySettings: CurrencySettings
): string {
  const {
    symbol,
    position,
    decimalPlaces,
    thousandsSeparator,
    decimalSeparator,
  } = currencySettings;

  // Format the number
  const fixedPrice = price.toFixed(decimalPlaces);
  const [integerPart, decimalPart] = fixedPrice.split('.');

  // Add thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Combine integer and decimal parts
  const formattedNumber = decimalPlaces > 0 && decimalPart 
    ? `${formattedInteger}${decimalSeparator}${decimalPart}`
    : formattedInteger;

  // Position the currency symbol
  return position === 'before' 
    ? `${symbol}${formattedNumber}`
    : `${formattedNumber} ${symbol}`;
}

export function getDefaultCurrencySettings(): CurrencySettings {
  return {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  };
}

export function getCurrencyInfo(code: string) {
  return CURRENCIES[code as keyof typeof CURRENCIES] || CURRENCIES.USD;
}
