import React, { useState } from 'react';
import { MessageCircle, X, Send, FileText, Package, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { StoreSettings } from '../../types';

interface WhatsAppConciergeProps {
  settings?: StoreSettings | null;
}

export const WhatsAppConcierge: React.FC<WhatsAppConciergeProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderTrackId, setOrderTrackId] = useState('');

  const rawPhone = settings?.whatsapp || '+92 300 8472910';
  const cleanPhone = rawPhone.replace(/[\s\+\-]/g, '');

  const openWhatsApp = (customMessage: string) => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderTrackId.trim()) {
      openWhatsApp(`Hi NEXT VISION Concierge, could you please update me on the courier tracking and dispatch status for my Order #${orderTrackId.trim()}?`);
    }
  };

  return (
    <>
      {/* Floating WhatsApp Button (Bottom-Left) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open WhatsApp Business Concierge"
        className="fixed bottom-6 left-6 z-40 p-3.5 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20 group"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
        </div>
        <span className="font-semibold text-xs tracking-wide pr-1 hidden sm:inline">WhatsApp Help</span>
      </button>

      {/* Concierge Action Card */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-50 w-[92vw] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-luxury-200 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm">NEXT VISION WhatsApp Help</h4>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span> Typically replies in &lt; 5 mins
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="p-4 space-y-2.5 bg-luxury-50 text-xs">
            <p className="text-[11px] text-luxury-500 font-medium">How can our optical team assist you today?</p>

            <button
              onClick={() => openWhatsApp("Hi NEXT VISION Concierge, I would like to ask some questions regarding frame sizing and recommendations.")}
              className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-luxury-200 hover:border-emerald-500 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-luxury-900 group-hover:text-emerald-800">Eyewear Consultation</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-luxury-400 group-hover:text-emerald-600" />
            </button>

            <button
              onClick={() => openWhatsApp("Hi NEXT VISION, I would like to upload my doctor's prescription slip / optometrist test card for custom optical lenses.")}
              className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-luxury-200 hover:border-emerald-500 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-luxury-900 group-hover:text-emerald-800">Send Prescription Slip</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-luxury-400 group-hover:text-emerald-600" />
            </button>

            {/* Quick Track Input */}
            <form onSubmit={handleTrackSubmit} className="pt-2 border-t border-luxury-200">
              <span className="block text-[11px] font-semibold text-luxury-700 mb-1 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-600" /> Quick Order Tracking:
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={orderTrackId}
                  onChange={(e) => setOrderTrackId(e.target.value)}
                  placeholder="e.g. ORD-94812"
                  className="flex-1 p-2 text-xs border border-luxury-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-lg font-bold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>

            <div className="text-[10px] text-center text-luxury-400 pt-1">
              Direct line: {rawPhone} (Lahore, Pakistan)
            </div>
          </div>
        </div>
      )}
    </>
  );
};
