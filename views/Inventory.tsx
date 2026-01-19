import React, { useState, useMemo, useEffect } from 'react';
import { Item, ExpiryStatus } from '../types.ts';
import { getExpiryStatus, deleteItem, snoozeItem } from '../services/storageService.ts';
import { getAffiliateLinkAsync, AffiliateResult } from '../services/affiliateService.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import { APP_ICONS } from '../constants.tsx';
import AffiliateDisclosure from './AffiliateDisclosure.tsx';

interface InventoryProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onRefresh: () => void;
  onNavigateDisclosure: () => void;
}

type FilterType = ExpiryStatus | 'All' | 'Today' | 'Needs Reorder';

const Inventory: React.FC<InventoryProps> = ({ items, onEdit, onRefresh, onNavigateDisclosure }) => {
  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');
  
  // Modal & Processing states
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [finalRedirect, setFinalRedirect] = useState<AffiliateResult | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(false);

  // Handle back button for disclosure modal
  useEffect(() => {
    if (showDisclosure) {
      window.history.pushState({ modal: 'disclosure' }, '');
      const handlePopState = () => setShowDisclosure(false);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showDisclosure]);

  const closeDisclosure = () => {
    if (window.history.state?.modal === 'disclosure') {
      window.history.back();
    } else {
      setShowDisclosure(false);
    }
  };

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

  const startReorderFlow = async (item: Item) => {
    setLoadingItemId(item.id);
    try {
      const result = await getAffiliateLinkAsync(item);
      setFinalRedirect(result);
      setConfirmItem(item); // Only show modal AFTER link is determined
    } catch (err) {
      alert('Failed to generate link. Please try again.');
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleExecuteRedirect = () => {
    if (finalRedirect) {
      window.open(finalRedirect.url, '_blank');
      setConfirmItem(null);
      setFinalRedirect(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Affiliate Disclosure Overlay */}
      {showDisclosure && (
        <div className="fixed inset-0 z-[300] bg-slate-50 overflow-y-auto pt-[env(safe-area-inset-top)] animate-in slide-in-from-bottom duration-300">
          <div className="p-4">
            <AffiliateDisclosure onBack={closeDisclosure} />
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      {confirmItem && finalRedirect && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmItem(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black text-slate-800">Redirecting to store</h3>
              <button 
                onClick={() => setShowDisclosure(true)}
                className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                aria-label="Affiliate Disclosure Information"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              {finalRedirect.isAffiliate ? (
                <>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    We’re redirecting you using an <strong>affiliate link</strong> for <span className="font-bold text-slate-800">{confirmItem.name}</span>.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl relative">
                    <p className="text-sm text-blue-700 font-medium">
                      Purchases made through these links help us maintain and improve this app. We appreciate your support!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    We’re redirecting you to a <strong>direct product search</strong> for <span className="font-bold text-slate-800">{confirmItem.name}</span>.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <p className="text-sm text-slate-600 font-medium italic">
                      This link does not earn us any commission.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleExecuteRedirect}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all"
              >
                Continue
              </button>
              <button 
                onClick={() => setConfirmItem(null)}
                className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest active:bg-slate-50 rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="flex-shrink-0 w-2 h-1"></div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4 pt-2">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const status = getExpiryStatus(item);
            const isSnoozed = item.snoozedUntil && new Date(item.snoozedUntil) > new Date();
            const isCurrentLoading = loadingItemId === item.id;

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
                   <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
                      <div className="flex justify-between items-center w-full">
                        <button 
                          onClick={() => handleSnooze(item.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest"
                        >
                          Snooze
                        </button>
                        <button 
                          disabled={isCurrentLoading}
                          onClick={() => startReorderFlow(item)}
                          className={`text-[11px] font-black uppercase tracking-widest flex items-center transition-all ${isCurrentLoading ? 'text-slate-300' : 'text-blue-600 active:scale-95'}`}
                        >
                          {isCurrentLoading ? (
                             <>
                               <svg className="animate-spin h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               Linking...
                             </>
                          ) : (
                            <>
                              {status === ExpiryStatus.Expired ? 'Buy Again' : 'Reorder Now'}
                              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </>
                          )}
                        </button>
                      </div>
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