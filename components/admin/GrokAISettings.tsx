import { useState, useEffect } from 'react';
import { Eye, EyeOff, TestTube, Check, X } from 'lucide-react';

interface GrokSettings {
  provider: string;
  grok: {
    apiKey: string;
    model: string;
    enabled: boolean;
    features: {
      productRecommendations: boolean;
      productDescriptions: boolean;
      customerSupport: boolean;
      searchAssistant: boolean;
    };
  };
}

interface StoreSettings {
  _id: string;
  ai: GrokSettings;
  // other settings...
}

export default function GrokAISettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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

  const handleAISettingChange = (field: string, value: any) => {
    if (!settings) return;

    const fieldParts = field.split('.');
    const newSettings = { ...settings };
    
    if (fieldParts.length === 1) {
      (newSettings.ai.grok as any)[fieldParts[0]] = value;
    } else if (fieldParts.length === 2 && fieldParts[0] === 'features') {
      (newSettings.ai.grok.features as any)[fieldParts[1]] = value;
    }

    setSettings(newSettings);
  };

  const handleTestConnection = async () => {
    if (!settings?.ai?.grok?.apiKey) {
      setTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Connection failed' });
    } finally {
      setTesting(false);
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
        alert('AI settings saved successfully!');
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
    return <div className="p-4">Loading AI settings...</div>;
  }

  if (!settings) {
    return <div className="p-4">Failed to load AI settings</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Grok AI Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.ai?.grok?.enabled || false}
                onChange={(e) => handleAISettingChange('enabled', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enable Grok AI</span>
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Enable AI-powered features like product descriptions, search assistance, and recommendations
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grok API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.ai?.grok?.apiKey || ''}
                onChange={(e) => handleAISettingChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Grok API key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !settings.ai?.grok?.apiKey}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                title="Test connection"
              >
                <TestTube className="h-4 w-4" />
              </button>
            </div>
            {testResult && (
              <div className={`mt-2 p-2 rounded text-sm ${
                testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className="flex items-center">
                  {testResult.success ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                  {testResult.message}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Get your API key from <a href="https://x.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">x.ai</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={settings.ai?.grok?.model || 'grok-beta'}
              onChange={(e) => handleAISettingChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grok-beta">Grok Beta</option>
              <option value="grok-vision-beta">Grok Vision Beta</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">AI Features</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.ai?.grok?.features?.productDescriptions || false}
                onChange={(e) => handleAISettingChange('features.productDescriptions', e.target.checked)}
                className="mr-2"
                disabled={!settings.ai?.grok?.enabled}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Product Descriptions</span>
                <p className="text-sm text-gray-600">Generate compelling product descriptions automatically</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.ai?.grok?.features?.searchAssistant || false}
                onChange={(e) => handleAISettingChange('features.searchAssistant', e.target.checked)}
                className="mr-2"
                disabled={!settings.ai?.grok?.enabled}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Search Assistant</span>
                <p className="text-sm text-gray-600">Improve search queries and provide better results</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.ai?.grok?.features?.productRecommendations || false}
                onChange={(e) => handleAISettingChange('features.productRecommendations', e.target.checked)}
                className="mr-2"
                disabled={!settings.ai?.grok?.enabled}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Product Recommendations</span>
                <p className="text-sm text-gray-600">AI-powered product recommendations for customers</p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.ai?.grok?.features?.customerSupport || false}
                onChange={(e) => handleAISettingChange('features.customerSupport', e.target.checked)}
                className="mr-2"
                disabled={!settings.ai?.grok?.enabled}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Customer Support</span>
                <p className="text-sm text-gray-600">AI-powered customer support for product questions</p>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">About Grok AI</h4>
          <p className="text-sm text-blue-800">
            Grok AI is xAI&apos;s advanced language model that can help enhance your e-commerce store with intelligent features like automated product descriptions, smart search assistance, and personalized recommendations.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
