import React, { useState, useMemo } from 'react';
import { Item, ExpiryStatus } from '../types.ts';
import { getExpiryStatus, deleteItem, snoozeItem, getReorderLink } from '../services/storageService.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import { APP_ICONS } from '../constants.tsx';

interface InventoryProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onRefresh: () => void;
}

type FilterType = ExpiryStatus | 'All' | 'Today' | 'Needs Reorder';

const Inventory: React.FC<InventoryProps> = ({ items, onEdit, onRefresh }) => {
  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');

  const todayStr = new Date().toLocaleDateString();

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const status = getExpiryStatus(item);
      const isToday = new Date(item.expiryDate).toLocaleDateString() === todayStr;
      
      let matchesFilter = true;
      if (filter === 'All') matchesFilter = true;
      else if (filter === 'Today') matchesFilter = isToday;
      else if (filter === 'Needs Reorder') matchesFilter = (status === ExpiryStatus.Soon || status === ExpiryStatus.Expired);
      else matchesFilter = status === filter;

      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search, todayStr]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      deleteItem(id);
      onRefresh();
    }
  };

  const handleSnooze = (id: string) => {
    const days = window.prompt('Snooze alerts for how many days? (1, 3, or 7)', '3');
    if (days && !isNaN(Number(days))) {
      snoozeItem(id, Number(days));
      onRefresh();
      alert(`Alerts snoozed for ${days} days.`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="sticky top-16 bg-slate-50 z-40 -mx-4 px-4 pt-2 pb-4 border-b border-slate-200 shadow-sm">
        <div className="relative mb-3">
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pl-11 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-slate-400"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Improved Horizontal Scroll container */}
        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth -mx-4 px-4">
          {['All', 'Today', 'Needs Reorder', ExpiryStatus.Soon, ExpiryStatus.Expired, ExpiryStatus.Active].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-[10px] font-bold border transition-all active:scale-95 uppercase tracking-wider ${
                filter === f 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'All' ? 'Everything' : f}
            </button>
          ))}
          {/* Spacer to fix right-side padding in overflow-x-auto */}
          <div className="flex-shrink-0 w-2 h-1"></div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4 pt-2">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const status = getExpiryStatus(item);
            const isSnoozed = item.snoozedUntil && new Date(item.snoozedUntil) > new Date();

            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden active:bg-slate-50 transition-colors">
                <div className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{item.name}</h3>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-tight">{item.category}</span>
                      {isSnoozed && (
                        <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded flex items-center space-x-1">
                          {APP_ICONS.Clock('w-3 h-3')}
                          <span>Snoozed</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <StatusBadge status={status} />
                      <span className="text-[11px] text-slate-400 font-medium">Expires: {new Date(item.expiryDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1 ml-4">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-400 hover:text-blue-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      {APP_ICONS.Trash('w-5 h-5')}
                    </button>
                  </div>
                </div>
                
                {status !== ExpiryStatus.Active && (
                   <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                      <button 
                        onClick={() => handleSnooze(item.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest"
                      >
                        Snooze
                      </button>
                      <a 
                        href={getReorderLink(item)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] font-black uppercase tracking-widest text-blue-600 flex items-center hover:underline"
                      >
                        {status === ExpiryStatus.Expired ? 'Buy Again' : 'Reorder Now'}
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                   </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center">
            <p className="text-slate-400 text-sm font-medium">No items match your filter.</p>
            <button 
              onClick={() => {setFilter('All'); setSearch('');}}
              className="mt-4 text-blue-600 text-xs font-bold uppercase tracking-widest"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;