
import React from 'react';
import { Item, ExpiryStatus } from '../types';
import { getExpiryStatus } from '../services/storageService';
import StatusBadge from '../components/StatusBadge';

interface DashboardProps {
  items: Item[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, onNavigate }) => {
  const statusCounts = items.reduce((acc, item) => {
    const status = getExpiryStatus(item);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<ExpiryStatus, number>);

  const urgentItems = items
    .filter(i => getExpiryStatus(i) !== ExpiryStatus.Active)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold text-slate-700 mb-3">Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-sky-600 text-2xl font-bold">{statusCounts[ExpiryStatus.Active] || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Active</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-amber-600 text-2xl font-bold">{statusCounts[ExpiryStatus.Soon] || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Soon</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-rose-600 text-2xl font-bold">{statusCounts[ExpiryStatus.Expired] || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Expired</span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-slate-700">Action Required</h2>
          <button 
            onClick={() => onNavigate('items')}
            className="text-sm font-semibold text-blue-600"
          >
            View All
          </button>
        </div>
        
        {urgentItems.length > 0 ? (
          <div className="space-y-3">
            {urgentItems.map(item => {
              const status = getExpiryStatus(item);
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <StatusBadge status={status} />
                      <span className="text-xs text-slate-400">Exp: {new Date(item.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a 
                    href={`https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 ${status === ExpiryStatus.Expired ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}
                  >
                    {status === ExpiryStatus.Expired ? 'Buy Again' : 'Reorder'}
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl text-center">
            <p className="text-blue-700 font-medium">All clear! No items expiring soon.</p>
          </div>
        )}
      </section>

      <section className="bg-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Smart Reminders</h2>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Never waste money on expired groceries or medicines again. 
            Set reminders and reorder with one tap.
          </p>
          <button 
            onClick={() => onNavigate('add')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-bold text-white transition-colors"
          >
            Add First Item
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </section>
    </div>
  );
};

export default Dashboard;
