import React, { useEffect } from 'react';

interface AffiliateDisclosureProps {
  onBack: () => void;
}

const AffiliateDisclosure: React.FC<AffiliateDisclosureProps> = ({ onBack }) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Transparency & Privacy | ExpiryReminder";
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-black text-slate-800">Transparency & Privacy</h2>
      </div>

      <div className="space-y-6">
        {/* Affiliate Section */}
        <article className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 text-slate-600 leading-relaxed">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Affiliate Disclosure</h3>
          <p>
            This app may include links to third-party stores. 
            Some of these links are <strong>affiliate links</strong>, which means we may earn a small commission if you make a purchase through them.
          </p>

          <p className="font-semibold text-slate-800">
            This does not affect the price you pay.
          </p>

          <p>
            When affiliate links are unavailable, we redirect you using direct search links, which do not earn us any commission.
          </p>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
            <p className="text-sm text-blue-800 font-medium">
              Any earnings help us maintain, improve, and continue developing this app. We appreciate your support in keeping this tool free for everyone.
            </p>
          </div>
        </article>

        {/* Data Privacy Section */}
        <article className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 text-slate-600 leading-relaxed">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Data Storage & Privacy</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <p>All your inventory and settings data is <strong>stored locally on your device</strong>. It remains under your control at all times.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <p>We do not upload, sync, or backup your personal data to our servers by default. Your data is available offline whenever you need it.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 mb-1">When is data sent to our servers?</p>
                <p>Information is only sent when strictly required for a specific action, such as generating an affiliate reorder link or using optional AI features. In these cases, <strong>only the minimum required information</strong> (like item name and category) is processed.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <p>If AI features are used, they process only the necessary input on-demand. We do not use your personal data for training models.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
            <p className="text-sm text-slate-500 italic">
              Our privacy principle is simple: Your data belongs on your device. We only process what is needed to help you get things done.
            </p>
          </div>
        </article>

        <div className="pt-4 text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Last Updated: February 2024
          </p>
        </div>
      </div>
      
      <button 
        onClick={onBack}
        className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
      >
        Dismiss
      </button>
    </div>
  );
};

export default AffiliateDisclosure;