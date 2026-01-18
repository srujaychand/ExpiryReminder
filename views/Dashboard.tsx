
import React from 'react';
import { Item, ExpiryStatus } from '../types.ts';
import { getExpiryStatus, getReorderLink } from '../services/storageService.ts';
import StatusBadge from '../components/StatusBadge.tsx';

interface DashboardProps {
  items: Item[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, onNavigate }) => {
  const today = new Date().toLocaleDateString();
  
  const expiringToday = items.filter(i => 
    new Date(i.expiryDate).toLocaleDateString() === today
  );

  const reorderSoon = items.filter(i => 
    getExpiryStatus(i) === ExpiryStatus.Soon
  );

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
      {/* PWA Widgets */}
      <section className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigate('items')}
          className="bg-rose-600 p-4 rounded-3xl shadow-lg shadow-rose-200 text-white active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-black">{expiringToday.length}</span>
            <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Expiring Today</p>
        </div>
        <div 
          onClick={() => onNavigate('items')}
          className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-200 text-white active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-black">{reorderSoon.length}</span>
            <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Needs Reorder</p>
        </div>
      </section>

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
                    href={getReorderLink(item)} 
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
    </div>
  );
};

export default Dashboard;
