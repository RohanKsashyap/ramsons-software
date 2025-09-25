import React, { useState } from 'react';
import { Save, User, Building, Bell, Shield, Database, Globe } from 'lucide-react';
import { NotificationSettings } from './NotificationSettings';

export const Setting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formChanged, setFormChanged] = useState(false);
  
  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'business', label: 'Business', icon: <Building size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'data', label: 'Data & Backup', icon: <Database size={18} /> },
    { id: 'regional', label: 'Regional', icon: <Globe size={18} /> },
  ];

  const handleFormChange = () => {
    setFormChanged(true);
  };

  const handleSave = () => {
    // In a real app, this would save the settings
    console.log('Saving settings...');
    setFormChanged(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Settings Navigation */}
          <div className="w-full md:w-64 bg-gray-50 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Settings</h3>
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full px-3 py-2 text-left rounded-lg ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Settings Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Profile Settings</h3>
                  <button 
                    onClick={handleSave}
                    disabled={!formChanged}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${formChanged ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="Admin User"
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="admin@example.com"
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="555-123-4567"
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      id="role" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="admin"
                      onChange={handleFormChange}
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="accountant">Accountant</option>
                      <option value="clerk">Clerk</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'business' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Business Settings</h3>
                  <button 
                    onClick={handleSave}
                    disabled={!formChanged}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${formChanged ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input 
                      type="text" 
                      id="business-name" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="Rasmsons Accounting"
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="business-address" className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                    <textarea 
                      id="business-address" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      rows={3}
                      defaultValue="123 Business St, Suite 101\nAnytown, ST 12345"
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tax-id" className="block text-sm font-medium text-gray-700 mb-1">Tax ID / EIN</label>
                    <input 
                      type="text" 
                      id="tax-id" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="12-3456789"
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                    <select 
                      id="currency" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="usd"
                      onChange={handleFormChange}
                    >
                      <option value="usd">USD - US Dollar</option>
                      <option value="eur">EUR - Euro</option>
                      <option value="gbp">GBP - British Pound</option>
                      <option value="cad">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <NotificationSettings />
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Security Settings</h3>
                  <button 
                    onClick={handleSave}
                    disabled={!formChanged}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${formChanged ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Change Password</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input 
                          type="password" 
                          id="current-password" 
                          className="w-full px-4 py-2 border rounded-lg" 
                          placeholder="Enter current password"
                          onChange={handleFormChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                          type="password" 
                          id="new-password" 
                          className="w-full px-4 py-2 border rounded-lg" 
                          placeholder="Enter new password"
                          onChange={handleFormChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          id="confirm-password" 
                          className="w-full px-4 py-2 border rounded-lg" 
                          placeholder="Confirm new password"
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-700 mb-4">Two-Factor Authentication</h4>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" onChange={handleFormChange} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-700 mb-4">Session Management</h4>
                    
                    <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                      Sign Out All Other Devices
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'data' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Data & Backup Settings</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Backup Data</h4>
                    <p className="text-sm text-gray-600 mb-4">Create a backup of all your accounting data</p>
                    
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Create Backup
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Schedule Automatic Backups
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Import Data</h4>
                    <p className="text-sm text-gray-600 mb-4">Import data from CSV, Excel, or other accounting software</p>
                    
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Import Data
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Export Data</h4>
                    <p className="text-sm text-gray-600 mb-4">Export your data to various formats</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Export to CSV
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Export to Excel
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Export to PDF
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-600 mb-4">Permanently delete your data</p>
                    
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'regional' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Regional Settings</h3>
                  <button 
                    onClick={handleSave}
                    disabled={!formChanged}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${formChanged ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select 
                      id="language" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="en"
                      onChange={handleFormChange}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="date-format" className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                    <select 
                      id="date-format" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="mm/dd/yyyy"
                      onChange={handleFormChange}
                    >
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="time-format" className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                    <select 
                      id="time-format" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="12h"
                      onChange={handleFormChange}
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select 
                      id="timezone" 
                      className="w-full px-4 py-2 border rounded-lg" 
                      defaultValue="utc-5"
                      onChange={handleFormChange}
                    >
                      <option value="utc-8">Pacific Time (UTC-8)</option>
                      <option value="utc-7">Mountain Time (UTC-7)</option>
                      <option value="utc-6">Central Time (UTC-6)</option>
                      <option value="utc-5">Eastern Time (UTC-5)</option>
                      <option value="utc+0">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;