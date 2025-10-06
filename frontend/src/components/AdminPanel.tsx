'use client';

import { useConfigStore } from '@/lib/store';
import { UIConfig } from '@/types/config';
import { useEffect, useState } from 'react';

export default function AdminPanel() {
  const { allConfigs, user, fetchAllConfigs, updateConfig, loading, error } = useConfigStore();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [editingConfig, setEditingConfig] = useState<UIConfig | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllConfigs();
    }
  }, [user, fetchAllConfigs]);

  const handleEditConfig = (country: string) => {
    setSelectedCountry(country);
    setEditingConfig(allConfigs[country] || getDefaultConfig());
  };

  const handleSaveConfig = async () => {
    if (selectedCountry && editingConfig) {
      await updateConfig(selectedCountry, editingConfig);
      setSelectedCountry('');
      setEditingConfig(null);
    }
  };

  const handleAddCountry = () => {
    const country = prompt('Enter country code (e.g., US, UK, CA):');
    if (country) {
      setSelectedCountry(country);
      setEditingConfig(getDefaultConfig());
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p>Admin privileges required to access this panel.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Configuration Panel</h1>
        <button
          onClick={handleAddCountry}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Country
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Countries</h2>
          <div className="space-y-2">
            {Object.keys(allConfigs).map((country) => (
              <div key={country} className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium">{country}</span>
                <button
                  onClick={() => handleEditConfig(country)}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Editor */}
        {editingConfig && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Edit Configuration - {selectedCountry}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingConfig.showTabs}
                    onChange={(e) => setEditingConfig({
                      ...editingConfig,
                      showTabs: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Show Tabs
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingConfig.showNavBar}
                    onChange={(e) => setEditingConfig({
                      ...editingConfig,
                      showNavBar: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Show Navigation Bar
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingConfig.showInputField}
                    onChange={(e) => setEditingConfig({
                      ...editingConfig,
                      showInputField: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Show Input Field
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingConfig.showButton}
                    onChange={(e) => setEditingConfig({
                      ...editingConfig,
                      showButton: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Show Button
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  value={editingConfig.theme}
                  onChange={(e) => setEditingConfig({
                    ...editingConfig,
                    theme: e.target.value as 'light' | 'dark'
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tabs (comma-separated)</label>
                <input
                  type="text"
                  value={editingConfig.tabs.join(', ')}
                  onChange={(e) => setEditingConfig({
                    ...editingConfig,
                    tabs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Home, About, Contact"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Navigation Items (comma-separated)</label>
                <input
                  type="text"
                  value={editingConfig.navItems.join(', ')}
                  onChange={(e) => setEditingConfig({
                    ...editingConfig,
                    navItems: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Dashboard, Profile, Settings"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
                <button
                  onClick={() => {
                    setSelectedCountry('');
                    setEditingConfig(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultConfig(): UIConfig {
  return {
    showTabs: true,
    showNavBar: true,
    showInputField: true,
    showButton: true,
    tabs: ['Home', 'About', 'Contact'],
    navItems: ['Dashboard', 'Profile', 'Settings'],
    theme: 'light',
    features: {
      'Feature A': true,
      'Feature B': false,
      'Feature C': true
    }
  };
}