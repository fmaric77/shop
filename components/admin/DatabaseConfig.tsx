import { useState, useEffect } from 'react';
import { Database, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface DatabaseConfigProps {
  onConfigured?: () => void;
}

export default function DatabaseConfig({ onConfigured }: DatabaseConfigProps) {
  const [mongodbUri, setMongodbUri] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    checkCurrentConfig();
  }, []);

  const checkCurrentConfig = async () => {
    try {
      const response = await fetch('/api/env-config');
      if (response.ok) {
        const data = await response.json();
        setIsConfigured(data.hasMongoConfig);
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!mongodbUri.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter a MongoDB URI first',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/env-config/test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mongodbUri }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!mongodbUri.trim()) {
      alert('Please enter a MongoDB URI');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/env-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mongodbUri,
          testConnection: true 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsConfigured(true);
        alert('Database configuration saved successfully! Please restart the application to apply changes.');
        onConfigured?.();
      } else {
        alert(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Checking database configuration...</span>
        </div>
      </div>
    );
  }

  if (isConfigured) {
    return (
      <div className="theme-surface p-6 rounded-lg shadow">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <Database className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Database Configuration</h2>
            <p className="text-sm text-[var(--color-textSecondary)]">Your MongoDB database is configured and ready</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Database connection configured successfully</span>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> To reconfigure the database, you&apos;ll need to edit the .env.local file directly 
            or delete it and restart the application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-surface p-6 rounded-lg shadow">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-full">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Database Configuration</h2>
          <p className="text-sm text-[var(--color-textSecondary)]">Set up your MongoDB database connection</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            MongoDB Connection URI
          </label>
          <input
            type="text"
            value={mongodbUri}
            onChange={(e) => setMongodbUri(e.target.value)}
            placeholder="mongodb://localhost:27017/mystore or mongodb+srv://username:password@cluster.mongodb.net/mystore"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-[var(--color-textSecondary)]">
            Enter your MongoDB connection string. This can be a local MongoDB instance or a cloud service like MongoDB Atlas.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            disabled={testing || !mongodbUri.trim()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <button
            onClick={saveConfiguration}
            disabled={saving || !mongodbUri.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </span>
            </div>
            {testResult.details && (
              <p className={`mt-2 text-sm ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.details}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">MongoDB Setup Options:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Local MongoDB:</strong> mongodb://localhost:27017/yourdatabase</li>
            <li>• <strong>MongoDB Atlas:</strong> mongodb+srv://username:password@cluster.mongodb.net/database</li>
            <li>• <strong>Other Cloud Services:</strong> Use the connection string provided by your service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
