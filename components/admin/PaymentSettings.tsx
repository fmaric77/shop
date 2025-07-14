"use client";

import React, { useState, useEffect } from 'react';

interface StripeSettings {
  publishableKey: string;
  secretKey: string;
}

export default function PaymentSettings() {
  const [keys, setKeys] = useState<StripeSettings>({ publishableKey: '', secretKey: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStripe = async () => {
      try {
        const response = await fetch('/api/store-settings');
        if (response.ok) {
          const data = await response.json();
          const stripe = data.stripe || { publishableKey: '', secretKey: '' };
          setKeys({ publishableKey: stripe.publishableKey, secretKey: stripe.secretKey });
        }
      } catch (error) {
        console.error('Error fetching stripe settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStripe();
  }, []);

  const handleChange = (field: 'publishableKey' | 'secretKey', value: string) => {
    setKeys(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/store-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripe: keys }),
      });
      if (response.ok) {
        const data = await response.json();
        // Safely extract stripe settings, defaulting to empty object
        const { stripe = {} } = data as any;
        setKeys({
          publishableKey: stripe.publishableKey ?? '',
          secretKey: stripe.secretKey ?? '',
        });
        alert('Stripe settings saved');
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save Stripe settings');
      }
    } catch (error) {
      console.error('Error saving stripe:', error);
      alert('Failed to save Stripe settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading Stripe settings...</div>;

  return (
    <div className="theme-surface p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text)]">Payment Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Publishable Key</label>
          <input
            type="text"
            value={keys.publishableKey}
            onChange={e => handleChange('publishableKey', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="pk_live_..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Secret Key</label>
          <input
            type="password"
            value={keys.secretKey}
            onChange={e => handleChange('secretKey', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="sk_live_..."
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
      >
        {saving ? 'Saving...' : 'Save Stripe Keys'}
      </button>
    </div>
  );
}
