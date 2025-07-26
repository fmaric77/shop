"use client";

import React, { useState, useEffect } from 'react';

interface StripeSettings {
  publishableKey: string;
  secretKey: string;
}

export default function PaymentSettings() {
  interface PayPalSettings {
    clientId: string;
    secret: string;
    mode: 'sandbox' | 'live';
  }
  const [keys, setKeys] = useState<StripeSettings>({ publishableKey: '', secretKey: '' });
  const [paypal, setPaypal] = useState<PayPalSettings>({ clientId: '', secret: '', mode: 'sandbox' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStripe = async () => {
      try {
        const response = await fetch('/api/store-settings');
        if (response.ok) {
          const data = await response.json();
          const stripe = data.stripe || { publishableKey: '', secretKey: '' };
          const pp = data.paypal || { clientId: '', secret: '', mode: 'sandbox' };
          setKeys({ publishableKey: stripe.publishableKey, secretKey: stripe.secretKey });
          setPaypal({ clientId: pp.clientId, secret: pp.secret, mode: pp.mode });
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
        body: JSON.stringify({ stripe: keys, paypal }),
      });
      if (response.ok) {
        const data = await response.json();
        // Safely extract stripe and PayPal settings
        const responseData = data as {
          stripe?: { publishableKey?: string; secretKey?: string };
          paypal?: { clientId?: string; secret?: string; mode?: 'sandbox' | 'live' };
        };
        const { stripe = {}, paypal: pp = {} } = responseData;
        setKeys({
          publishableKey: stripe.publishableKey ?? '',
          secretKey: stripe.secretKey ?? '',
        });
        setPaypal({
          clientId: pp.clientId ?? '',
          secret: pp.secret ?? '',
          mode: pp.mode ?? 'sandbox',
        });
        alert('Payment settings saved');
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
      <h2 className="text-xl font-semibold text-[var(--color-text)]">Stripe Settings</h2>
      {/* Stripe Settings */}
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
      {/* PayPal Settings */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">PayPal Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Client ID</label>
            <input
              type="text"
              value={paypal.clientId}
              onChange={e => setPaypal(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="PayPal Client ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Secret</label>
            <input
              type="password"
              value={paypal.secret}
              onChange={e => setPaypal(prev => ({ ...prev, secret: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="PayPal Secret"
            />
          </div>
          <div className="col-span-full md:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Mode</label>
            <select
              value={paypal.mode}
              onChange={e => setPaypal(prev => ({ ...prev, mode: e.target.value as 'sandbox' | 'live' }))}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="sandbox">Sandbox</option>
              <option value="live">Live</option>
            </select>
          </div>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
      >
        {saving ? 'Saving...' : 'Save Payment Settings'}
      </button>
    </div>
  );
}
