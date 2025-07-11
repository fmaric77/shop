import { useState, useEffect } from 'react';
import { Eye, EyeOff, TestTube, Check, X } from 'lucide-react';

interface AISettings {
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
  azureOpenAI: {
    apiKey: string;
    endpoint: string;
    apiVersion: string;
    model: string;
    enabled: boolean;
    features: {
      productRecommendations: boolean;
      productDescriptions: boolean;
      customerSupport: boolean;
      searchAssistant: boolean;
      imageAnalysis: boolean;
    };
  };
}

interface StoreSettings {
  _id: string;
  ai: AISettings;
  // other settings...
}

export default function AISettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAzureApiKey, setShowAzureApiKey] = useState(false);
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
    
    // Initialize AI structure if it doesn't exist
    if (!newSettings.ai) {
      newSettings.ai = {
        provider: 'grok',
        grok: {
          apiKey: '',
          model: 'grok-beta',
          enabled: false,
          features: {
            productRecommendations: false,
            productDescriptions: false,
            customerSupport: false,
            searchAssistant: false,
          }
        },
        azureOpenAI: {
          apiKey: '',
          endpoint: '',
          apiVersion: '2024-12-01-preview',
          model: 'gpt-4o',
          enabled: false,
          features: {
            productRecommendations: false,
            productDescriptions: false,
            customerSupport: false,
            searchAssistant: false,
            imageAnalysis: false,
          }
        }
      };
    }

    // Initialize azureOpenAI if it doesn't exist
    if (!newSettings.ai.azureOpenAI) {
      newSettings.ai.azureOpenAI = {
        apiKey: '',
        endpoint: '',
        apiVersion: '2024-12-01-preview',
        model: 'gpt-4o',
        enabled: false,
        features: {
          productRecommendations: false,
          productDescriptions: false,
          customerSupport: false,
          searchAssistant: false,
          imageAnalysis: false,
        }
      };
    }

    // Initialize grok if it doesn't exist
    if (!newSettings.ai.grok) {
      newSettings.ai.grok = {
        apiKey: '',
        model: 'grok-beta',
        enabled: false,
        features: {
          productRecommendations: false,
          productDescriptions: false,
          customerSupport: false,
          searchAssistant: false,
        }
      };
    }

    // Initialize features if they don't exist
    if (!newSettings.ai.azureOpenAI.features) {
      newSettings.ai.azureOpenAI.features = {
        productRecommendations: false,
        productDescriptions: false,
        customerSupport: false,
        searchAssistant: false,
        imageAnalysis: false,
      };
    }

    if (!newSettings.ai.grok.features) {
      newSettings.ai.grok.features = {
        productRecommendations: false,
        productDescriptions: false,
        customerSupport: false,
        searchAssistant: false,
      };
    }
    
    if (fieldParts.length === 1) {
      // Handle provider change
      if (field === 'provider') {
        newSettings.ai.provider = value;
      }
    } else if (fieldParts.length === 2) {
      const [provider, setting] = fieldParts;
      if (provider === 'grok') {
        (newSettings.ai.grok as any)[setting] = value;
      } else if (provider === 'azureOpenAI') {
        (newSettings.ai.azureOpenAI as any)[setting] = value;
      }
    } else if (fieldParts.length === 3 && fieldParts[1] === 'features') {
      const [provider, , feature] = fieldParts;
      if (provider === 'grok') {
        (newSettings.ai.grok.features as any)[feature] = value;
      } else if (provider === 'azureOpenAI') {
        (newSettings.ai.azureOpenAI.features as any)[feature] = value;
      }
    }

    setSettings(newSettings);
  };

  const handleTestConnection = async () => {
    const provider = settings?.ai?.provider || 'grok';
    let apiKey = '';
    let endpoint = '';
    let model = '';

    if (provider === 'grok') {
      apiKey = settings?.ai?.grok?.apiKey || '';
      model = settings?.ai?.grok?.model || 'grok-beta';
    } else if (provider === 'azureOpenAI') {
      apiKey = settings?.ai?.azureOpenAI?.apiKey || '';
      endpoint = settings?.ai?.azureOpenAI?.endpoint || '';
      model = settings?.ai?.azureOpenAI?.model || 'gpt-4o';
    }

    if (!apiKey) {
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
        body: JSON.stringify({
          provider,
          apiKey,
          endpoint,
          model,
          apiVersion: settings?.ai?.azureOpenAI?.apiVersion
        }),
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
        <h2 className="text-xl font-semibold mb-4">AI Configuration</h2>
        
        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              value={settings.ai?.provider || 'grok'}
              onChange={(e) => handleAISettingChange('provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grok">Grok AI (xAI)</option>
              <option value="azureOpenAI">Azure OpenAI</option>
            </select>
          </div>

          {/* Grok AI Configuration */}
          {settings.ai?.provider === 'grok' && (
            <>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.ai?.grok?.enabled || false}
                    onChange={(e) => handleAISettingChange('grok.enabled', e.target.checked)}
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
                    onChange={(e) => handleAISettingChange('grok.apiKey', e.target.value)}
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
                  onChange={(e) => handleAISettingChange('grok.model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="grok-beta">Grok Beta</option>
                  <option value="grok-vision-beta">Grok Vision Beta</option>
                </select>
              </div>
            </>
          )}

          {/* Azure OpenAI Configuration */}
          {settings.ai?.provider === 'azureOpenAI' && (
            <>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.ai?.azureOpenAI?.enabled || false}
                    onChange={(e) => handleAISettingChange('azureOpenAI.enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Azure OpenAI</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Enable AI-powered features using Azure OpenAI GPT-4o with vision capabilities
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Azure OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showAzureApiKey ? 'text' : 'password'}
                    value={settings.ai?.azureOpenAI?.apiKey || ''}
                    onChange={(e) => handleAISettingChange('azureOpenAI.apiKey', e.target.value)}
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your Azure OpenAI API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAzureApiKey(!showAzureApiKey)}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showAzureApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || !settings.ai?.azureOpenAI?.apiKey}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                    title="Test connection"
                  >
                    <TestTube className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Get your API key from the Azure Portal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Azure Endpoint
                </label>
                <input
                  type="text"
                  value={settings.ai?.azureOpenAI?.endpoint || ''}
                  onChange={(e) => handleAISettingChange('azureOpenAI.endpoint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-resource.openai.azure.com/"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Version
                </label>
                <select
                  value={settings.ai?.azureOpenAI?.apiVersion || '2024-12-01-preview'}
                  onChange={(e) => handleAISettingChange('azureOpenAI.apiVersion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2024-12-01-preview">2024-12-01-preview</option>
                  <option value="2024-10-21">2024-10-21</option>
                  <option value="2024-08-01-preview">2024-08-01-preview</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Deployment Name
                </label>
                <input
                  type="text"
                  value={settings.ai?.azureOpenAI?.model || ''}
                  onChange={(e) => handleAISettingChange('azureOpenAI.model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="gpt-4o"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter the deployment name of your GPT-4o model in Azure
                </p>
              </div>
            </>
          )}

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
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">AI Features</h3>
          <div className="space-y-3">
            {/* Product Descriptions */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={
                  settings.ai?.provider === 'grok' 
                    ? settings.ai?.grok?.features?.productDescriptions || false
                    : settings.ai?.azureOpenAI?.features?.productDescriptions || false
                }
                onChange={(e) => handleAISettingChange(
                  settings.ai?.provider === 'grok' 
                    ? 'grok.features.productDescriptions' 
                    : 'azureOpenAI.features.productDescriptions', 
                  e.target.checked
                )}
                className="mr-2"
                disabled={
                  settings.ai?.provider === 'grok' 
                    ? !settings.ai?.grok?.enabled
                    : !settings.ai?.azureOpenAI?.enabled
                }
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Product Descriptions</span>
                <p className="text-sm text-gray-600">Generate compelling product descriptions automatically</p>
              </div>
            </label>

            {/* Search Assistant */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={
                  settings.ai?.provider === 'grok' 
                    ? settings.ai?.grok?.features?.searchAssistant || false
                    : settings.ai?.azureOpenAI?.features?.searchAssistant || false
                }
                onChange={(e) => handleAISettingChange(
                  settings.ai?.provider === 'grok' 
                    ? 'grok.features.searchAssistant' 
                    : 'azureOpenAI.features.searchAssistant', 
                  e.target.checked
                )}
                className="mr-2"
                disabled={
                  settings.ai?.provider === 'grok' 
                    ? !settings.ai?.grok?.enabled
                    : !settings.ai?.azureOpenAI?.enabled
                }
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Search Assistant</span>
                <p className="text-sm text-gray-600">Improve search queries and provide better results</p>
              </div>
            </label>

            {/* Product Recommendations */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={
                  settings.ai?.provider === 'grok' 
                    ? settings.ai?.grok?.features?.productRecommendations || false
                    : settings.ai?.azureOpenAI?.features?.productRecommendations || false
                }
                onChange={(e) => handleAISettingChange(
                  settings.ai?.provider === 'grok' 
                    ? 'grok.features.productRecommendations' 
                    : 'azureOpenAI.features.productRecommendations', 
                  e.target.checked
                )}
                className="mr-2"
                disabled={
                  settings.ai?.provider === 'grok' 
                    ? !settings.ai?.grok?.enabled
                    : !settings.ai?.azureOpenAI?.enabled
                }
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Product Recommendations</span>
                <p className="text-sm text-gray-600">AI-powered product recommendations for customers</p>
              </div>
            </label>

            {/* Customer Support */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={
                  settings.ai?.provider === 'grok' 
                    ? settings.ai?.grok?.features?.customerSupport || false
                    : settings.ai?.azureOpenAI?.features?.customerSupport || false
                }
                onChange={(e) => handleAISettingChange(
                  settings.ai?.provider === 'grok' 
                    ? 'grok.features.customerSupport' 
                    : 'azureOpenAI.features.customerSupport', 
                  e.target.checked
                )}
                className="mr-2"
                disabled={
                  settings.ai?.provider === 'grok' 
                    ? !settings.ai?.grok?.enabled
                    : !settings.ai?.azureOpenAI?.enabled
                }
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Customer Support</span>
                <p className="text-sm text-gray-600">AI-powered customer support for product questions</p>
              </div>
            </label>

            {/* Image Analysis (Azure OpenAI only) */}
            {settings.ai?.provider === 'azureOpenAI' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.ai?.azureOpenAI?.features?.imageAnalysis || false}
                  onChange={(e) => handleAISettingChange('azureOpenAI.features.imageAnalysis', e.target.checked)}
                  className="mr-2"
                  disabled={!settings.ai?.azureOpenAI?.enabled}
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Image Analysis</span>
                  <p className="text-sm text-gray-600">Analyze product images and generate descriptions using GPT-4o vision</p>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            About {settings.ai?.provider === 'grok' ? 'Grok AI' : 'Azure OpenAI'}
          </h4>
          {settings.ai?.provider === 'grok' ? (
            <p className="text-sm text-blue-800">
              Grok AI is xAI&apos;s advanced language model that can help enhance your e-commerce store with intelligent features like automated product descriptions, smart search assistance, and personalized recommendations.
            </p>
          ) : (
            <p className="text-sm text-blue-800">
              Azure OpenAI provides access to OpenAI&apos;s powerful GPT-4o model with vision capabilities through Microsoft&apos;s secure cloud platform. This enables advanced features like image analysis, product description generation, and intelligent customer support.
            </p>
          )}
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
