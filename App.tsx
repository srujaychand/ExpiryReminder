import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './views/Dashboard.tsx';
import Inventory from './views/Inventory.tsx';
import AddEditItem from './views/AddEditItem.tsx';
import SettingsView from './views/SettingsView.tsx';
import { getItems } from './services/storageService.ts';
import { checkAndNotify } from './services/notificationService.ts';
import { Item } from './types.ts';

type ViewState = 'dashboard' | 'items' | 'add' | 'settings' | 'edit';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const refreshItems = () => {
    const fetched = getItems();
    setItems(fetched);
  };

  useEffect(() => {
    refreshItems();
    
    // Run notification check after 1s delay to ensure PWA/SW services are ready
    const timer = setTimeout(() => {
      checkAndNotify().then(() => {
        // Refresh items after notification check because checkAndNotify 
        // updates lastNotifiedStatus in storage.
        refreshItems();
      });
    }, 1000);

    // Check for notifications every hour
    const interval = setInterval(checkAndNotify, 3600000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setCurrentView('edit');
  };

  const handleBackToItems = () => {
    setEditingItem(null);
    setCurrentView('items');
    refreshItems();
    // Re-check notifications immediately after a change
    checkAndNotify();
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard items={items} onNavigate={(view: any) => setCurrentView(view)} />;
      case 'items':
        return <Inventory items={items} onEdit={handleEdit} onRefresh={refreshItems} />;
      case 'add':
        return <AddEditItem onSave={handleBackToItems} onCancel={() => setCurrentView('dashboard')} />;
      case 'edit':
        return <AddEditItem item={editingItem || undefined} onSave={handleBackToItems} onCancel={handleBackToItems} />;
      case 'settings':
        return <SettingsView onRefresh={refreshItems} />;
      default:
        return <Dashboard items={items} onNavigate={(view: any) => setCurrentView(view)} />;
    }
  };

  return (
    <Layout activeTab={currentView === 'edit' ? 'add' : currentView as any} onTabChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;