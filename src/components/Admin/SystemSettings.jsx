// src/components/Admin/SystemSettings.js
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { notificationsAPI } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Settings, 
  Bell, 
  Clock, 
  Shield, 
  Database,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  Download
} from 'lucide-react';

function SystemSettings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [systemNotification, setSystemNotification] = useState({
    message: '',
    type: 'system'
  });

  const sendNotificationMutation = useMutation({
    mutationFn: notificationsAPI.sendSystemNotification,
    onSuccess: () => {
      toast.success('System notification sent successfully');
      setSystemNotification({ message: '', type: 'system' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    },
  });

  const sendDeadlineRemindersMutation = useMutation({
    mutationFn: notificationsAPI.sendDeadlineReminders,
    onSuccess: (data) => {
      const count = data?.data?.data?.remindersSent || 0;
      toast.success(`${count} deadline reminders sent`);
    },
    onError: (error) => {
      toast.error('Failed to send deadline reminders');
      console.error('Error sending deadline reminders:', error);
    },
  });  

  const handleSendSystemNotification = (e) => {
    e.preventDefault();
    if (!systemNotification.message.trim()) {
      toast.error('Please enter a notification message');
      return;
    }
    sendNotificationMutation.mutate(systemNotification);
  };

  const handleSendDeadlineReminders = () => {
    if (window.confirm('Send deadline reminders to all users with items expiring soon?')) {
      sendDeadlineRemindersMutation.mutate();
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'maintenance', label: 'Maintenance', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Management</h2>
                
                {/* Send System Notification */}
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Send System Notification</h3>
                  <form onSubmit={handleSendSystemNotification} className="space-y-4">
                    <div>
                      <label className="form-label">Notification Type</label>
                      <select
                        value={systemNotification.type}
                        onChange={(e) => setSystemNotification({
                          ...systemNotification,
                          type: e.target.value
                        })}
                        className="form-input"
                      >
                        <option value="system">System Announcement</option>
                        <option value="maintenance">Maintenance Notice</option>
                        <option value="update">System Update</option>
                        <option value="alert">Important Alert</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="form-label">Message</label>
                      <textarea
                        rows={4}
                        value={systemNotification.message}
                        onChange={(e) => setSystemNotification({
                          ...systemNotification,
                          message: e.target.value
                        })}
                        className="form-input"
                        placeholder="Enter your system notification message..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={sendNotificationMutation.isLoading}
                      className="btn-primary"
                    >
                      {sendNotificationMutation.isLoading ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          Send Notification
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Deadline Reminders */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Deadline Reminders</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Send reminders to users whose items are about to expire (within 3 days).
                  </p>
                  <button
                    onClick={handleSendDeadlineReminders}
                    disabled={sendDeadlineRemindersMutation.isLoading}
                    className="btn-warning"
                  >
                    {sendDeadlineRemindersMutation.isLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Send Deadline Reminders
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-3">Item Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Default Item Expiry (days)</label>
                      <input
                        type="number"
                        defaultValue={30}
                        className="form-input"
                        min="1"
                        max="365"
                      />
                    </div>
                    <div>
                      <label className="form-label">Maximum Images per Item</label>
                      <input
                        type="number"
                        defaultValue={5}
                        className="form-input"
                        min="1"
                        max="10"
                      />
                    </div>

                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-3">Claim Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Claim Review Time (days)</label>
                      <input
                        type="number"
                        defaultValue={7}
                        className="form-input"
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <label className="form-label">Auto Reject Incomplete Claims</label>
                      <select className="form-input">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              

              <div className="flex justify-end">
                <button className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </button>
              </div>
              
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-3">Password Policy</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Minimum Length</label>
                      <input
                        type="number"
                        defaultValue={8}
                        className="form-input"
                        min="6"
                        max="32"
                      />
                    </div>
                    <div>
                      <label className="form-label">Require Special Characters</label>
                      <select className="form-input">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-3">Session Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        defaultValue={30}
                        className="form-input"
                        min="5"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="form-label">Two-Factor Authentication (2FA)</label>
                      <select className="form-input">
                        <option value="optional">Optional</option>
                        <option value="required">Required</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary">
                  <Shield className="w-4 h-4 mr-2" />
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Tools</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-medium text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">
                    Download all system data for backup or external analysis.
                  </p>
                  <button className="btn-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-medium text-gray-900">System Cleanup</h3>
                  <p className="text-sm text-gray-600">
                    Remove expired items and inactive user accounts from the system.
                  </p>
                  <button
                    className="btn-warning"
                    onClick={() => window.confirm('Proceed with system cleanup?') && toast.success('Cleanup started')}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Run Cleanup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
