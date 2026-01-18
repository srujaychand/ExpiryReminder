
import React, { useState, useEffect } from 'react';
import { getAppSettings, saveAppSettings, getItems, saveItems } from '../services/storageService.ts';
import { requestNotificationPermission } from '../services/notificationService.ts';
import { AppSettings, Category } from '../types.ts';
import { CATEGORIES, STORE_OPTIONS } from '../constants.tsx';

interface SettingsViewProps {
  onRefresh: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [message, setMessage] = useState('');

  const updateStatuses = () => {
    if ('Notification' in window) setPermissionStatus(Notification.permission);
  };

  useEffect(() => {
    updateStatuses();
    window.addEventListener('focus', updateStatuses);
    return () => window.removeEventListener('focus', updateStatuses);
  }, []);

  const handleToggle = (key: keyof AppSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    if (key === 'notificationsEnabled' && !settings.notificationsEnabled) {
      requestNotificationPermission().then(granted => {
        if (!granted) alert('Permission denied');
        updateStatuses();
      });
    }
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const updateStorePref = (category: string, url: string) => {
    const newSettings = {
      ...settings,
      categoryStorePreferences: { ...settings.categoryStorePreferences, [category]: url }
    };
    setSettings(newSettings);
    saveAppSettings(newSettings);
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        <h3 className="font-bold text-slate-800 border-b pb-2">Notifications</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-700">Allow Alerts</h4>
            <p className="text-[10px] text-slate-400">Push notifications for items</p>
          </div>
          <button 
            onClick={() => handleToggle('notificationsEnabled')}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.notificationsEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-700">Digest Mode</h4>
            <p className="text-[10px] text-slate-400">Single daily summary alert</p>
          </div>
          <button 
            onClick={() => handleToggle('digestModeEnabled')}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.digestModeEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.digestModeEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 border-b pb-2">Store Preferences</h3>
        {CATEGORIES.map(cat => (
          <div key={cat} className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat}</label>
            <select 
              value={settings.categoryStorePreferences[cat] || ''}
              onChange={(e) => updateStorePref(cat, e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Default (Amazon)</option>
              {(STORE_OPTIONS[cat] || STORE_OPTIONS['Default']).map(opt => (
                <option key={opt.url} value={opt.url}>{opt.name}</option>
              ))}
            </select>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 border-b pb-2">Data Management</h3>
        <button onClick={exportData} className="w-full py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600">
          Export Backup JSON
        </button>
      </section>
    </div>
  );
};

export default SettingsView;
