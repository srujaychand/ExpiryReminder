import React from 'react';
import { APP_ICONS } from '../constants.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'items' | 'add' | 'settings';
  onTabChange: (tab: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header is fixed at the very top */}
      <header className="fixed top-0 left-0 right-0 z-[60] w-full bg-blue-600 text-white px-4 h-16 flex items-center shadow-md">
        <h1 className="text-xl font-bold tracking-tight">ExpiryReminder</h1>
      </header>

      {/* Main content padding adjusted for both header and nav height + safe areas */}
      <main className="flex-1 pt-16" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <div className="px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom navigation with safe area support */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            {APP_ICONS.Dashboard('w-6 h-6')}
            <span className="text-[10px] font-bold uppercase">Home</span>
          </button>
          
          <button 
            onClick={() => onTabChange('items')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'items' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            {APP_ICONS.Items('w-6 h-6')}
            <span className="text-[10px] font-bold uppercase">Inventory</span>
          </button>
          
          <button 
            onClick={() => onTabChange('add')}
            className={`flex flex-col items-center justify-center -mt-8 bg-blue-600 text-white rounded-full w-14 h-14 shadow-xl active:scale-90 transition-all border-4 border-slate-50 relative z-10`}
          >
            {APP_ICONS.Add('w-8 h-8')}
          </button>
          
          <button 
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            {APP_ICONS.Settings('w-6 h-6')}
            <span className="text-[10px] font-bold uppercase">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;