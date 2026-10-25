import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('nextvision_cookie_consent') || localStorage.getItem('ainak_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('nextvision_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('nextvision_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-luxury-950/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-white/10 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-champagne-500/20 text-gold rounded-xl shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-serif font-bold text-sm text-white mb-1">
            Privacy & Performance Preferences
          </h4>
          <p className="text-xs text-luxury-300 leading-relaxed mb-3">
            We use zero-tracking local cookies to remember your frame preferences, pupillary distance calibrations, and cart items. We never sell your personal data.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-white text-luxury-950 hover:bg-champagne-100 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Accept All
            </button>
            <button
              onClick={handleAcceptEssential}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Essential Only
            </button>
          </div>
        </div>
        <button
          onClick={handleAcceptEssential}
          className="text-luxury-400 hover:text-white p-1"
          aria-label="Dismiss cookie notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
