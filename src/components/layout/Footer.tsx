import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';
import { StoreSettings } from '../../types';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onSelectCategory: (cat: string) => void;
  onOpenTryOn: () => void;
  onOpenLocator?: () => void;
  onOpenAdmin: () => void;
  onOpenPartnerRequest?: () => void;
  settings?: StoreSettings | null;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onSelectCategory,
  onOpenTryOn,
  onOpenLocator,
  onOpenAdmin,
  onOpenPartnerRequest,
  settings
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-luxury-950 text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Pillars Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Nationwide Express Delivery</h5>
              <p className="text-luxury-400 mt-0.5">Complimentary shipping on orders exceeding Rs. 5,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">7-Day Hassle-Free Replacement</h5>
              <p className="text-luxury-400 mt-0.5">Unconditional exchange for any alternate frame</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Real-Time 3D Virtual Try-On</h5>
              <p className="text-luxury-400 mt-0.5">100% on-device face mesh tracking with zero camera storage</p>
            </div>
          </div>
        </div>

        {/* 4-Column Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-white/10 text-xs">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-luxury-950 flex items-center justify-center font-serif font-bold text-lg">
                N
              </div>
              <span className="font-serif text-xl font-bold tracking-tight">
                NEXT <span className="text-zinc-400 font-sans text-sm font-light">VISION</span>
              </span>
            </div>
            <p className="text-luxury-400 text-xs leading-relaxed max-w-sm">
              Pakistan's premier luxury optical atelier. NEXT VISION fuses Italian bio-cellulose acetate and Japanese titanium with artificial intelligence and real-time face tracking.
            </p>
            <div className="space-y-1.5 text-luxury-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>{settings?.address || 'Shop 14, Luxury Promenade, MM Alam Road, Gulberg III, Lahore, Pakistan'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{settings?.phone || '+92 42 35789012'} (10 AM - 9 PM PKT)</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${(settings?.whatsapp || '923008472910').replace(/\+/g, '')}?text=Hi%20NEXT%20VISION%20Concierge`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-emerald-400 font-medium"
                >
                  WhatsApp Concierge: {settings?.whatsapp || '+92 300 8472910'}
                </a>
              </p>
            </div>
          </div>

          {/* Optical Catalog */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-white text-[11px]">Collections</h5>
            <ul className="space-y-2 text-luxury-400">
              <li>
                <button onClick={() => onSelectCategory('Prescription Glasses')} className="hover:text-white transition-colors">
                  Prescription Eyeglasses
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Sunglasses')} className="hover:text-white transition-colors">
                  Polarized Sunglasses
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Blue-Light Glasses')} className="hover:text-white transition-colors">
                  Blue-Cut Screen Frames
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('All')} className="hover:text-white transition-colors">
                  Full Atelier Archive
                </button>
              </li>
            </ul>
          </div>

          {/* AR & Innovation */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-white text-[11px]">Experience</h5>
            <ul className="space-y-2 text-luxury-400">
              <li>
                <button onClick={onOpenTryOn} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" /> Launch AR Try-On
                </button>
              </li>
              {onOpenLocator && (
                <li>
                  <button onClick={onOpenLocator} className="hover:text-white text-zinc-300 transition-colors flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-zinc-300" /> Find Optical Stores (Map)
                  </button>
                </li>
              )}
              <li>
                <span className="text-luxury-500">Free In-Store Eye Exams</span>
              </li>
              <li>
                <span className="text-luxury-500">Pupillary Distance (PD) Tool</span>
              </li>
              <li>
                <span className="text-luxury-500">Face Shape Diagnosis AI</span>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance (Checklist #1, #2, #12) */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-white text-[11px]">Assurance</h5>
            <ul className="space-y-2 text-luxury-400">
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-white transition-colors">
                  Privacy Policy (Checklist #1)
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="hover:text-white transition-colors">
                  Terms & Conditions (Checklist #2)
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-white transition-colors">
                  Admin Control Portal
                </button>
              </li>
              {onOpenPartnerRequest && (
                <li>
                  <button onClick={onOpenPartnerRequest} className="hover:text-white text-zinc-300 transition-colors flex items-center gap-1.5 font-medium">
                    <span>Admin Partner Request</span>
                    <span className="text-[9px] bg-white/10 text-zinc-200 border border-white/20 px-1.5 py-0.5 rounded font-bold">Apply</span>
                  </button>
                </li>
              )}
              <li>
                <a href="/sitemap.xml" target="_blank" className="hover:text-white transition-colors">
                  Sitemap (XML)
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-luxury-500 gap-4">
          <p>© {currentYear} NEXT VISION. Handcrafted in Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-white/5 text-luxury-400 font-mono text-[10px]">
              Cash on Delivery (COD)
            </span>
            <span className="px-2 py-1 rounded bg-white/5 text-luxury-400 font-mono text-[10px]">
              Visa / Mastercard
            </span>
            <span className="px-2 py-1 rounded bg-white/5 text-luxury-400 font-mono text-[10px]">
              PayPak
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
