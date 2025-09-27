import React from 'react';
import { Bell } from 'lucide-react';
import { NotificationSettings } from './NotificationSettings';

export const Setting: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Settings Navigation */}
          <div className="w-full md:w-64 bg-gray-50 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Settings</h3>
            <nav className="space-y-1">
              <div className="flex items-center w-full px-3 py-2 text-left rounded-lg bg-blue-50 text-blue-700">
                <span className="mr-3">
                  <Bell size={18} />
                </span>
                Notifications
              </div>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            <NotificationSettings />
          </div>
        </div>
      </div>
    </div>
  );
};