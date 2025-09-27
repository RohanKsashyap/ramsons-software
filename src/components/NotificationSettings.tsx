import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, Play, Clock, Users, AlertCircle, Volume2, VolumeX, Settings, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import { audioService } from '../services/audioService';
import { backgroundNotificationService } from '../services/backgroundNotificationService';
import type { NotificationRule } from '../types';

export const NotificationSettings: React.FC = () => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    fetchRules();
    // Initialize audio service settings
    setSoundEnabled(audioService.isSoundEnabled());
    setVolume(audioService.getVolume());
  }, []);

  const fetchRules = async () => {
    try {
      const data = await apiService.notifications.getRules();
      setRules(data);
    } catch (error) {
      console.error('Error fetching notification rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await apiService.notifications.updateRule(ruleId, { enabled });
      await fetchRules();
    } catch (error) {
      alert('Failed to update rule');
    }
  };

  const handleDeleteRule = async (ruleId: string, ruleName: string) => {
    if (window.confirm(`Are you sure you want to delete the rule "${ruleName}"?`)) {
      try {
        await apiService.notifications.deleteRule(ruleId);
        await fetchRules();
      } catch (error) {
        alert('Failed to delete rule');
      }
    }
  };

  const handleTestRule = async (ruleId: string) => {
    try {
      const result = await apiService.notifications.testRule(ruleId);
      
      // Find the rule to get sound settings
      const rule = rules.find(r => r.id === ruleId);
      
      // Play sound based on rule settings
      if (rule && rule.sound?.enabled) {
        await audioService.playNotificationSound(rule.sound.type, rule.sound.customUrl);
      }
      
      // Show the test notification in the UI
      if (result.notification && typeof window !== 'undefined' && (window as any).addNotification) {
        (window as any).addNotification({
          ...result.notification,
          silent: false // Ensure sound plays
        });
      } else {
        // Fallback if notification object not returned
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to test rule');
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    audioService.setEnabled(enabled);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioService.setVolume(newVolume);
  };

  const handleTestSound = async (soundType: 'notification' | 'urgent' | 'reminder' = 'notification') => {
    await audioService.playNotificationSound(soundType);
  };

  const handleManualCheck = async () => {
    try {
      await backgroundNotificationService.manualCheck();
      alert('Manual notification check completed!');
    } catch (error) {
      console.error('Error during manual check:', error);
      alert('Error during manual check. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-gray-600 mt-1">Manage automated reminders and alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualCheck}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            title="Check for notifications now"
          >
            <RefreshCw className="h-4 w-4" />
            Check Now
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Sound Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sound Settings
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sound Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="h-5 w-5 text-green-600" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
              <span className="text-sm font-medium text-gray-700">Sound Notifications</span>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => handleSoundToggle(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>

          {/* Volume Control */}
          <div className="flex flex-wrap items-center gap-3">
            <Volume2 className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 min-w-[160px] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500 w-8">{Math.round(volume * 100)}%</span>
          </div>

          {/* Test Sounds */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Test:</span>
            <button
              onClick={() => handleTestSound('notification')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Normal
            </button>
            <button
              onClick={() => handleTestSound('urgent')}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Urgent
            </button>
            <button
              onClick={() => handleTestSound('reminder')}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
            >
              Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="grid gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rule.type === 'overdue' 
                      ? 'bg-red-100 text-red-800'
                      : rule.type === 'reminder'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rule.enabled 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {rule.schedule.frequency} at {rule.schedule.time}
                    </span>
                  </div>
                  
                  {rule.conditions.daysOverdue && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{rule.conditions.daysOverdue} days overdue</span>
                    </div>
                  )}
                  
                  {rule.conditions.balanceThreshold && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Balance ≥ ${rule.conditions.balanceThreshold}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{rule.message.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{rule.message.body}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleTestRule(rule.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Test Rule"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingRule(rule);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Rule"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id, rule.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    rule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      rule.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notification rules</h3>
          <p className="text-gray-600">Create your first automated notification rule</p>
        </div>
      )}

      {/* Rule Form Modal */}
      {showForm && (
        <NotificationRuleForm
          rule={editingRule}
          onClose={() => {
            setShowForm(false);
            setEditingRule(null);
          }}
          onSave={fetchRules}
        />
      )}
    </div>
  );
};

interface NotificationRuleFormProps {
  rule?: NotificationRule | null;
  onClose: () => void;
  onSave: () => void;
}

const NotificationRuleForm: React.FC<NotificationRuleFormProps> = ({ rule, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    type: rule?.type || 'overdue' as const,
    enabled: rule?.enabled ?? true,
    daysOverdue: rule?.conditions.daysOverdue?.toString() || '',
    balanceThreshold: rule?.conditions.balanceThreshold?.toString() || '',
    frequency: rule?.schedule.frequency || 'daily' as const,
    time: rule?.schedule.time || '09:00',
    title: rule?.message.title || '',
    body: rule?.message.body || '',
    notification: rule?.actions.notification ?? true,
    email: rule?.actions.email ?? false,
    sms: rule?.actions.sms ?? false,
    soundEnabled: rule?.sound?.enabled ?? true,
    soundType: rule?.sound?.type || 'notification' as const,
    soundCustomUrl: rule?.sound?.customUrl || '',
    soundVolume: rule?.sound?.volume?.toString() || '0.7',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ruleData = {
      name: formData.name,
      type: formData.type,
      enabled: formData.enabled,
      conditions: {
        ...(formData.daysOverdue && { daysOverdue: parseInt(formData.daysOverdue) }),
        ...(formData.balanceThreshold && { balanceThreshold: parseFloat(formData.balanceThreshold) }),
      },
      actions: {
        notification: formData.notification,
        email: formData.email,
        sms: formData.sms,
      },
      sound: {
        enabled: formData.soundEnabled,
        type: formData.soundType,
        ...(formData.soundType === 'custom' && formData.soundCustomUrl && { customUrl: formData.soundCustomUrl }),
        volume: parseFloat(formData.soundVolume),
      },
      schedule: {
        frequency: formData.frequency,
        time: formData.time,
      },
      message: {
        title: formData.title,
        body: formData.body,
      },
    };

    try {
      if (rule) {
        await apiService.notifications.updateRule(rule.id, ruleData);
      } else {
        await apiService.notifications.createRule(ruleData);
      }
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to save notification rule');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {rule ? 'Edit Notification Rule' : 'Create Notification Rule'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Weekly Overdue Reminder"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overdue">Overdue Payments</option>
                <option value="reminder">Payment Reminder</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Overdue
              </label>
              <input
                type="number"
                min="0"
                value={formData.daysOverdue}
                onChange={(e) => setFormData({ ...formData, daysOverdue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 7"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Balance ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.balanceThreshold}
                onChange={(e) => setFormData({ ...formData, balanceThreshold: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 100.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Overdue Payment Alert"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Body *
            </label>
            <textarea
              required
              rows={3}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., You have customers with overdue payments that need attention."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Actions
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notification}
                  onChange={(e) => setFormData({ ...formData, notification: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Desktop Notification</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Email (Coming Soon)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sms}
                  onChange={(e) => setFormData({ ...formData, sms: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">SMS (Coming Soon)</span>
              </label>
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sound Settings
            </label>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.soundEnabled}
                  onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Sound Notification</span>
              </label>

              {formData.soundEnabled && (
                <div className="space-y-3 pl-6 border-l-2 border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sound Type
                    </label>
                    <select
                      value={formData.soundType}
                      onChange={(e) => setFormData({ ...formData, soundType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="notification">Normal Notification</option>
                      <option value="urgent">Urgent Alert</option>
                      <option value="reminder">Reminder Sound</option>
                      <option value="custom">Custom Sound</option>
                    </select>
                  </div>

                  {formData.soundType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Sound URL
                      </label>
                      <input
                        type="url"
                        value={formData.soundCustomUrl}
                        onChange={(e) => setFormData({ ...formData, soundCustomUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/sound.mp3"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume: {Math.round(parseFloat(formData.soundVolume) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.soundVolume}
                      onChange={(e) => setFormData({ ...formData, soundVolume: e.target.value })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => audioService.playNotificationSound(formData.soundType as any, formData.soundCustomUrl)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Test Sound
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {rule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};