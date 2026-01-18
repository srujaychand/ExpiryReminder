import React, { useState, useEffect, useRef } from 'react';
import { getAppSettings, saveAppSettings, getItems, saveItems } from '../services/storageService.ts';
import { requestNotificationPermission } from '../services/notificationService.ts';
import { AppSettings } from '../types.ts';
import { CATEGORIES, STORE_OPTIONS } from '../constants.tsx';

interface SettingsViewProps {
  onRefresh: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (!granted) alert('Permission denied. Please enable notifications in browser settings.');
        updateStatuses();
      });
    }
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const sendTestNotification = async () => {
    if (!settings.notificationsEnabled) {
      alert('Please enable notifications toggle first.');
      return;
    }
    
    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    const title = 'Test Alert 🔔';
    const options = {
      body: 'This is a test notification from ExpiryReminder. Your alerts are working!',
      icon: 'https://picsum.photos/192/192',
      badge: 'https://picsum.photos/96/96',
      tag: 'test-notification'
    };

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.showNotification(title, options);
        return;
      }
    }
    new Notification(title, options);
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedItems = JSON.parse(content);

        if (!Array.isArray(importedItems)) {
          throw new Error('Invalid backup format: Content is not an array.');
        }

        const isValid = importedItems.every(item => item.id && item.name && item.expiryDate);
        if (!isValid) {
          throw new Error('Invalid backup format: Some items are missing required fields.');
        }

        if (window.confirm(`Found ${importedItems.length} items. This will replace your current inventory. Continue?`)) {
          saveItems(importedItems);
          onRefresh();
          alert('Inventory imported successfully!');
        }
      } catch (err: any) {
        alert('Failed to import data: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>

      {/* Notifications Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Notifications
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-700">Allow Alerts</h4>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Status: <span className={permissionStatus === 'granted' ? 'text-green-600' : 'text-rose-600'}>{permissionStatus}</span>
            </p>
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

        <button 
          onClick={sendTestNotification}
          className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest active:bg-slate-100 transition-all"
        >
          Send Test Notification
        </button>
      </section>

      {/* Store Preferences */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          Store Links
        </h3>
        <p className="text-[10px] text-slate-400 mb-2 italic">Customize the search URL for each category.</p>
        
        <div className="space-y-4">
          {CATEGORIES.map(cat => (
            <div key={cat} className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat}</label>
              <input 
                type="text" 
                value={settings.categoryStorePreferences[cat] || ''}
                onChange={(e) => updateStorePref(cat, e.target.value)}
                placeholder="Paste search URL here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(STORE_OPTIONS[cat] || STORE_OPTIONS['Default']).map(opt => (
                  <button 
                    key={opt.url}
                    onClick={() => updateStorePref(cat, opt.url)}
                    className="text-[9px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors uppercase"
                  >
                    {opt.name}
                  </button>
                ))}
                {settings.categoryStorePreferences[cat] && (
                  <button 
                    onClick={() => updateStorePref(cat, '')}
                    className="text-[9px] font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors uppercase"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Management Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          Data Management
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={exportData} 
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl active:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="text-[10px] font-bold text-slate-600 uppercase">Export</span>
          </button>
          
          <button 
            onClick={handleImportClick} 
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl active:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span className="text-[10px] font-bold text-slate-600 uppercase">Import</span>
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={importData} 
          accept="application/json" 
          className="hidden" 
        />
        <p className="text-[9px] text-slate-400 text-center">Backups are stored as simple JSON files on your device.</p>
      </section>
    </div>
  );
};

export default SettingsView;