
import React, { useState, useEffect } from 'react';
import { getAppSettings, saveAppSettings, getItems, saveItems } from '../services/storageService.ts';
import { requestNotificationPermission, triggerManualNotification } from '../services/notificationService.ts';
import { AppSettings } from '../types.ts';

interface SettingsViewProps {
  onRefresh: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [message, setMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Notification permission denied. Please enable it in browser settings.');
        return;
      }
    }
    const newSettings = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const handleTestNotification = async () => {
    if (Notification.permission !== 'granted') {
      alert('Please enable notifications first.');
      return;
    }
    setIsTesting(true);
    setMessage('Sending test alert...');
    
    // Give user 2 seconds to minimize the app if they want to test background behavior
    setTimeout(async () => {
      await triggerManualNotification(
        'Test Alert! 🔔', 
        'If you see this, ExpiryReminder notifications are working perfectly on your device.'
      );
      setMessage('Test alert sent!');
      setIsTesting(false);
      setTimeout(() => setMessage(''), 3000);
    }, 2000);
  };

  const exportData = () => {
    const data = JSON.stringify(getItems(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expiry_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (window.confirm('This will replace all your current data. Continue?')) {
            saveItems(json);
            onRefresh();
            setMessage('Data imported successfully!');
            setTimeout(() => setMessage(''), 3000);
          }
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Alert Notifications</h3>
            <p className="text-xs text-slate-500">Get notified when items are about to expire</p>
          </div>
          <button 
            onClick={handleToggleNotifications}
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${settings.notificationsEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform mx-1 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {settings.notificationsEnabled && (
          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <svg className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>{isTesting ? 'Sending...' : 'Send Test Notification'}</span>
          </button>
        )}

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-2">Default Reorder Link</label>
          <input 
            type="text" 
            value={settings.affiliateLinkBase}
            onChange={(e) => {
              const newS = {...settings, affiliateLinkBase: e.target.value};
              setSettings(newS);
              saveAppSettings(newS);
            }}
            placeholder="e.g. https://www.amazon.in/s?k="
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <p className="text-[10px] text-slate-400 mt-2">Item name will be appended to this link for reordering.</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Data Management</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={exportData}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all"
          >
            <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-xs font-bold text-slate-700">Backup JSON</span>
          </button>
          
          <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer">
            <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs font-bold text-slate-700">Restore JSON</span>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
        
        {message && <p className="mt-4 text-center text-sm font-bold text-blue-600">{message}</p>}
      </section>

      <section className="text-center pb-8">
        <p className="text-xs text-slate-400">Version 1.0.1 (BETA)</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Made for India with ❤️</p>
      </section>
    </div>
  );
};

export default SettingsView;
