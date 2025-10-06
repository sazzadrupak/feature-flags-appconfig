'use client';

import { useConfigStore } from '@/lib/store';
import { useEffect } from 'react';

export default function DynamicUI() {
  const { config, user, fetchConfig, fetchUserInfo } = useConfigStore();

  useEffect(() => {
    const initializeApp = async () => {
      await fetchUserInfo();
      if (user?.country) {
        await fetchConfig(user.country);
      }
    };
    
    initializeApp();
  }, [fetchUserInfo, fetchConfig, user?.country]);

  if (!config) {
    return <div className="p-4">Loading configuration...</div>;
  }

  return (
    <div className={`min-h-screen ${config.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {config.showNavBar && (
        <nav className="bg-blue-600 text-white p-4">
          <div className="flex space-x-4">
            {config.navItems.map((item, index) => (
              <a key={index} href="#" className="hover:underline">
                {item}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to {user?.country} Dashboard
        </h1>

        {config.showTabs && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {config.tabs.map((tab, index) => (
                  <button
                    key={index}
                    className="py-2 px-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium"
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {config.showInputField && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Sample Input Field
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter text here..."
              />
            </div>
          )}

          {config.showButton && (
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Action Button
            </button>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.entries(config.features).map(([feature, enabled]) => (
              <div
                key={feature}
                className={`p-4 rounded-lg ${
                  enabled 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-gray-100 border-gray-300'
                } border`}
              >
                <h3 className="font-semibold">{feature}</h3>
                <p className="text-sm">
                  {enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}