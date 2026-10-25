import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Eye, Compass, Layers } from 'lucide-react';
import { StoreSettings } from '../../types';

interface HeroProps {
  onOpenTryOn: () => void;
  onExploreCollection: () => void;
  settings?: StoreSettings | null;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTryOn, onExploreCollection, settings }) => {
  return (
    <div className="relative overflow-hidden bg-luxury-950 text-white py-20 lg:py-28 border-b border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-champagne-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-luxury-800/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-champagne-300">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Next-Gen Face-Tracking Virtual Try-On</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15]">
              Architectural Eyewear.<br />
              <span className="gold-shimmer font-serif italic font-normal">Fitted in Real-Time AR.</span>
            </h1>

            <p className="text-sm sm:text-base text-luxury-300 max-w-xl font-light leading-relaxed">
              Experience Pakistan's most advanced optical atelier. Try handcrafted bio-acetate and aerospace titanium frames live via webcam with sub-millimeter face tracking and bespoke prescription lenses.
            </p>

            {/* Primary & Secondary CTAs (Checklist #16) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenTryOn}
                className="px-7 py-4 bg-white hover:bg-champagne-50 text-luxury-950 font-bold rounded-2xl text-xs sm:text-sm shadow-2xl hover:shadow-champagne-500/20 transition-all flex items-center gap-2.5 active:scale-95 border border-champagne-300"
              >
                <Sparkles className="w-4 h-4 text-champagne-700" />
                <span>Try On Live via Webcam</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Live AR
                </span>
              </button>

              <button
                onClick={onExploreCollection}
                className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Metric Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-xs">
              <div>
                <p className="font-bold text-lg text-white font-mono">468 Pts</p>
                <p className="text-[11px] text-luxury-400">Face Mesh Tracking</p>
              </div>
              <div>
                <p className="font-bold text-lg text-white font-mono">100%</p>
                <p className="text-[11px] text-luxury-400">On-Device Privacy</p>
              </div>
              <div>
                <p className="font-bold text-lg text-white font-mono">7 Days</p>
                <p className="text-[11px] text-luxury-400">Exchange Guarantee</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-luxury-900 group">
              <img
                src={settings?.bannerUrl || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80"}
                alt={settings?.storeName ? `${settings.storeName} Eyewear Showcase` : "Luxury Eyewear Virtual Showcase"}
                className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-transparent to-transparent opacity-80" />

              {/* Floating Try-On Overlay Card */}
              <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-luxury-950/90 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider">Featured Model</span>
                  <h4 className="font-serif font-bold text-sm">Aura Obsidian Square</h4>
                  <p className="text-[11px] text-luxury-400">Italian Acetate • 52-18-140</p>
                </div>
                <button
                  onClick={onOpenTryOn}
                  className="px-3.5 py-2 bg-champagne-500 hover:bg-champagne-600 text-luxury-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
                >
                  <Eye className="w-3.5 h-3.5" /> Try On
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
