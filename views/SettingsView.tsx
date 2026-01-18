import React, { useState, useEffect } from 'react';
import { getAppSettings, saveAppSettings, getItems, saveItems } from '../services/storageService.ts';
import { requestNotificationPermission, triggerManualNotification, getServiceWorkerStatus } from '../services/notificationService.ts';
import { AppSettings } from '../types.ts';

interface SettingsViewProps {
  onRefresh: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [message, setMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const updateStatuses = async () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    const status = await getServiceWorkerStatus();
    setSwStatus(status);
  };

  useEffect(() => {
    updateStatuses();
    window.addEventListener('focus', updateStatuses);
    return () => window.removeEventListener('focus', updateStatuses);
  }, []);

  const handleToggleNotifications = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      updateStatuses();
      if (!granted) {
        alert('Notification permission denied. Go to Settings > Safari > Advanced > Feature Flags (on old iOS) or check your PWA app settings.');
        return;
      }
    }
    const newSettings = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const handleTestNotification = async () => {
    if (Notification.permission !== 'granted') {
      alert('Permission not granted.');
      return;
    }
    
    setIsTesting(true);
    setMessage('Lock your screen now to test! (Wait 3s)');
    
    // 3 seconds delay for iOS testing
    setTimeout(async () => {
      await triggerManualNotification(
        'Test Alert! 🔔', 
        'If you see this, ExpiryReminder is working perfectly on your iOS device.'
      );
      setMessage('Test alert triggered!');
      setIsTesting(false);
      setTimeout(() => setMessage(''), 5000);
    }, 3000);
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
          saveItems(json);
          onRefresh();
          setMessage('Data restored!');
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (err) { alert('Invalid file'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
               <h3 className="font-bold text-slate-800">Alert Notifications</h3>
               <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                 permissionStatus === 'granted' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
               }`}>
                 {permissionStatus}
               </span>
            </div>
            <p className="text-xs text-slate-500">Enable automated alerts</p>
          </div>
          <button 
            onClick={handleToggleNotifications}
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${settings.notificationsEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform mx-1 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Background Engine Status</p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700">{swStatus}</span>
            <button onClick={updateStatuses} className="text-[10px] text-blue-600 font-bold">Refresh</button>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
              settings.notificationsEnabled ? 'bg-blue-600 text-white shadow-md active:scale-95' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <svg className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>{isTesting ? 'Get ready...' : 'Send Test Notification'}</span>
          </button>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800">Data Management</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={exportData} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="text-xs font-bold">Export</span>
          </button>
          <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span className="text-xs font-bold">Import</span>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
        {message && <p className="text-center text-xs font-bold text-blue-600">{message}</p>}
      </section>
    </div>
  );
};

export default SettingsView;