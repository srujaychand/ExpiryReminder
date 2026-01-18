
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Inventory from './views/Inventory';
import AddEditItem from './views/AddEditItem';
import SettingsView from './views/SettingsView';
import { getItems, getAppSettings, saveItems } from './services/storageService';
import { checkAndNotify } from './services/notificationService';
import { Item } from './types';

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
    checkAndNotify();
    
    // Check for notifications every hour
    const interval = setInterval(checkAndNotify, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setCurrentView('edit');
  };

  const handleBackToItems = () => {
    setEditingItem(null);
    setCurrentView('items');
    refreshItems();
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
