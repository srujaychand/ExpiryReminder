import React, { useState } from 'react';
import { Item, ExpiryStatus } from '../types.ts';
import { getExpiryStatus, deleteItem } from '../services/storageService.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import { APP_ICONS } from '../constants.tsx';

interface InventoryProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onRefresh: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onEdit, onRefresh }) => {
  const [filter, setFilter] = useState<ExpiryStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item => {
    const status = getExpiryStatus(item);
    const matchesFilter = filter === 'All' || status === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (id: string) => {
    // Basic confirmation - handles cases where window.confirm might be restricted in some previewers
    const confirmed = window.confirm('Are you sure you want to remove this item?');
    if (confirmed) {
      deleteItem(id);
      // Immediate refresh for UI feedback
      onRefresh();
      // Secondary refresh to catch any storage lag
      setTimeout(onRefresh, 100);
    }
  };

  return (
    <div className="relative">
      <div className="sticky top-16 bg-slate-50 z-40 -mx-4 px-4 pt-4 pb-4 border-b border-slate-200 shadow-sm">
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 pl-11 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-slate-400"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {['All', ExpiryStatus.Soon, ExpiryStatus.Expired, ExpiryStatus.Active].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                filter === f 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {f === 'All' ? 'All Items' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const status = getExpiryStatus(item);
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden active:bg-slate-50 transition-colors">
                <div className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{item.name}</h3>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-tight">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <StatusBadge status={status} />
                      <span className="text-[11px] text-slate-400 font-medium">Expires: {new Date(item.expiryDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    {item.notes && <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-2 py-1 mt-2">"{item.notes}"</p>}
                  </div>
                  
                  <div className="flex flex-col space-y-1 ml-4">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-400 hover:text-blue-600 active:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Edit item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 active:bg-rose-50 rounded-lg transition-colors"
                      aria-label="Delete item"
                    >
                      {APP_ICONS.Trash('w-5 h-5')}
                    </button>
                  </div>
                </div>
                
                {status !== ExpiryStatus.Active && (
                   <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                      <a 
                        href={`https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] font-black uppercase tracking-widest text-blue-600 flex items-center hover:underline active:opacity-70"
                      >
                        {status === ExpiryStatus.Expired ? 'Buy Again' : 'Reorder Now'}
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                   </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
              {APP_ICONS.Items('w-10 h-10 text-slate-300')}
            </div>
            <p className="text-slate-500 font-medium">No items found.</p>
            <p className="text-xs text-slate-400 mt-1">Try a different filter or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;