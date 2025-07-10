import { useState, useEffect } from 'react';
import { CURRENCIES, formatPrice, getCurrencyInfo } from '@/lib/currency';

interface CurrencySettings {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

interface StoreSettings {
  _id: string;
  currency: CurrencySettings;
  timezone: string;
  dateFormat: string;
}

export default function CurrencySettingsEditor() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/store-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (field: string, value: string | number) => {
    if (!settings) return;

    if (field === 'code') {
      // Auto-update symbol and name when currency code changes
      const currencyInfo = getCurrencyInfo(value as string);
      setSettings({
        ...settings,
        currency: {
          ...settings.currency,
          code: value as string,
          symbol: currencyInfo.symbol,
          name: currencyInfo.name,
          position: currencyInfo.position,
        },
      });
    } else {
      setSettings({
        ...settings,
        currency: {
          ...settings.currency,
          [field]: value,
        },
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="p-4">Failed to load settings</div>;
  }

  const samplePrice = 1234.56;
  const formattedSample = formatPrice(samplePrice, settings.currency);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Currency Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Code
            </label>
            <select
              value={settings.currency.code}
              onChange={(e) => handleCurrencyChange('code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <option key={code} value={code}>
                  {code} - {info.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Symbol
            </label>
            <input
              type="text"
              value={settings.currency.symbol}
              onChange={(e) => handleCurrencyChange('symbol', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="$"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Name
            </label>
            <input
              type="text"
              value={settings.currency.name}
              onChange={(e) => handleCurrencyChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="US Dollar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbol Position
            </label>
            <select
              value={settings.currency.position}
              onChange={(e) => handleCurrencyChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="before">Before amount (e.g., $100)</option>
              <option value="after">After amount (e.g., 100 kr)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decimal Places
            </label>
            <select
              value={settings.currency.decimalPlaces}
              onChange={(e) => handleCurrencyChange('decimalPlaces', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0 (e.g., $100)</option>
              <option value={1}>1 (e.g., $100.1)</option>
              <option value={2}>2 (e.g., $100.12)</option>
              <option value={3}>3 (e.g., $100.123)</option>
              <option value={4}>4 (e.g., $100.1234)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thousands Separator
            </label>
            <select
              value={settings.currency.thousandsSeparator}
              onChange={(e) => handleCurrencyChange('thousandsSeparator', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value=",">Comma (1,000)</option>
              <option value=".">Period (1.000)</option>
              <option value=" ">Space (1 000)</option>
              <option value="">None (1000)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decimal Separator
            </label>
            <select
              value={settings.currency.decimalSeparator}
              onChange={(e) => handleCurrencyChange('decimalSeparator', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value=".">Period (100.50)</option>
              <option value=",">Comma (100,50)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
          <p className="text-lg font-semibold text-gray-900">
            Sample price: {formattedSample}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            This is how prices will appear in your store
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
