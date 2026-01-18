import React, { useState, useEffect } from 'react';
import { getAppSettings, saveAppSettings, getItems, saveItems } from '../services/storageService.ts';
import { requestNotificationPermission } from '../services/notificationService.ts';
import { AppSettings } from '../types.ts';

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
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
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
        alert('Notification permission denied. Please enable it in browser settings.');
        return;
      }
    }
    const newSettings = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
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
          setMessage('Data restored successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (err) { alert('Invalid backup file'); }
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
            <p className="text-xs text-slate-500">Auto-alerts for upcoming expiries</p>
          </div>
          <button 
            onClick={handleToggleNotifications}
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${settings.notificationsEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform mx-1 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

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
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800">Data Management</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={exportData} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 active:bg-slate-100 transition-colors">
            <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="text-xs font-bold">Backup</span>
          </button>
          <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer active:bg-slate-100 transition-colors">
            <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span className="text-xs font-bold">Restore</span>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
        {message && <p className="text-center text-xs font-bold text-blue-600">{message}</p>}
      </section>

      <section className="text-center pb-8 pt-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ExpiryReminder v1.0.4</p>
      </section>
    </div>
  );
};

export default SettingsView;