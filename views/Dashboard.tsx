import React, { useState, useEffect } from 'react';
import { Item, ExpiryStatus } from '../types.ts';
import { getExpiryStatus } from '../services/storageService.ts';
import { getAffiliateLinkAsync, AffiliateResult } from '../services/affiliateService.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import AffiliateDisclosure from './AffiliateDisclosure.tsx';

interface DashboardProps {
  items: Item[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, onNavigate }) => {
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

  const startReorderFlow = async (item: Item) => {
    setLoadingItemId(item.id);
    try {
      const result = await getAffiliateLinkAsync(item);
      setFinalRedirect(result);
      setConfirmItem(item);
    } catch (err) {
      alert('Failed to generate link.');
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
    <div className="space-y-6">
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
            
            <div className="space-y-4 mb-8 text-sm">
              {finalRedirect.isAffiliate ? (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    We’re redirecting you using an <strong>affiliate link</strong> for <span className="font-bold text-slate-800">{confirmItem.name}</span>.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <p className="text-sm text-blue-700 font-medium">
                      Purchases made through these links help us maintain and improve this app.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-600 leading-relaxed">
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
              const isCurrentLoading = loadingItemId === item.id;
              
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <StatusBadge status={status} />
                        <span className="text-xs text-slate-400">Exp: {new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      disabled={isCurrentLoading}
                      onClick={() => startReorderFlow(item)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center ${isCurrentLoading ? 'bg-slate-100 text-slate-400' : (status === ExpiryStatus.Expired ? 'bg-rose-600 text-white active:scale-95' : 'bg-amber-500 text-white active:scale-95')}`}
                    >
                      {isCurrentLoading ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        status === ExpiryStatus.Expired ? 'Buy Again' : 'Reorder'
                      )}
                    </button>
                  </div>
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