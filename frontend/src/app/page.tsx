'use client';

import { useConfigStore } from '@/lib/store';
import DynamicUI from '@/components/DynamicUI';
import AdminPanel from '@/components/AdminPanel';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, fetchUserInfo } = useConfigStore();
  const [view, setView] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user.role === 'admin' && (
        <div className="bg-gray-100 p-4 border-b">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setView('user')}
                className={`px-4 py-2 rounded ${
                  view === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                User View
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded ${
                  view === 'admin' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Admin Panel
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Logged in as: {user.userId} ({user.role}) - {user.country}
            </div>
          </div>
        </div>
      )}

      {view === 'admin' && user.role === 'admin' ? (
        <AdminPanel />
      ) : (
        <DynamicUI />
      )}
    </div>
  );
}