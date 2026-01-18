import React, { useState, useEffect } from 'react';
import { APP_ICONS } from '../constants.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'items' | 'add' | 'settings';
  onTabChange: (tab: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Offline Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-800 text-white text-[10px] font-bold py-1 px-4 text-center uppercase tracking-widest animate-pulse">
          You are offline. Data is still usable.
        </div>
      )}

      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-[60] w-full bg-blue-600 text-white px-4 h-16 flex items-center shadow-md pt-[env(safe-area-inset-top)] h-[calc(4rem+env(safe-area-inset-top))] ${isOffline ? 'mt-6' : ''}`}>
        <h1 className="text-xl font-bold tracking-tight">ExpiryReminder</h1>
      </header>

      {/* Main Content Area */}
      <main 
        className="flex-1" 
        style={{ 
          paddingTop: `calc(${isOffline ? '6rem' : '4.5rem'} + env(safe-area-inset-top))`,
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' 
        }}
      >
        <div className="px-4 py-2">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex justify-around items-center px-2">
          <button 
            onClick={() => onTabChange('items')}
            className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${activeTab === 'items' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            {APP_ICONS.Items('w-6 h-6')}
            <span className="text-[10px] font-bold uppercase tracking-tighter">Inventory</span>
          </button>
          
          <div className="relative w-full flex justify-center -mt-12">
            <button 
              onClick={() => onTabChange('add')}
              className="bg-blue-600 text-white rounded-full w-14 h-14 shadow-xl active:scale-90 transition-all border-4 border-slate-50 flex items-center justify-center"
            >
              {APP_ICONS.Add('w-8 h-8')}
            </button>
          </div>
          
          <button 
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            {APP_ICONS.Settings('w-6 h-6')}
            <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;