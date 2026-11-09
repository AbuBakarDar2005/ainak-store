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
    <div className="relative overflow-hidden bg-gradient-to-b from-lens-deep via-luxury-950 to-lens-navy text-white py-20 lg:py-28 border-b border-lens-teal/20">
      {/* Background ambient lighting in Lens Mart Cyan & Deep Navy */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-lens-teal/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-lens-cyan/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lens-teal/10 border border-lens-teal/30 text-[11px] font-bold text-lens-aqua shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-lens-teal" />
              <span>LENS MART • Your Vision, Our Focus</span>
              <span className="w-1.5 h-1.5 rounded-full bg-lens-teal animate-pulse"></span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12]">
              Precision Optics &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lens-aqua via-lens-teal to-white font-serif italic">
                Designer Eyewear.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-200 max-w-xl font-normal leading-relaxed">
              Welcome to <strong>LENS MART</strong>. Where clinical precision meets modern aesthetics. Try handcrafted bio-acetate and aerospace titanium frames live via webcam with sub-millimeter face tracking and custom optical lenses.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenTryOn}
                className="px-7 py-4 bg-gradient-to-r from-lens-teal to-lens-cyan hover:brightness-110 text-luxury-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-lens-teal/25 transition-all flex items-center gap-2.5 active:scale-95 border border-lens-aqua/40"
              >
                <Sparkles className="w-4 h-4 text-luxury-950" />
                <span>Try On Live via Webcam</span>
                <span className="px-2 py-0.5 rounded-full bg-luxury-950/20 text-luxury-950 text-[10px] font-extrabold uppercase tracking-wider">
                  Live AR
                </span>
              </button>

              <button
                onClick={onExploreCollection}
                className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 active:scale-95 hover:border-lens-teal/50"
              >
                <span>Shop Eyewear Catalog</span>
                <ArrowRight className="w-4 h-4 text-lens-teal" />
              </button>
            </div>

            {/* Metric Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-xs">
              <div>
                <p className="font-extrabold text-xl text-lens-aqua font-mono">468 Pts</p>
                <p className="text-xs text-zinc-300 font-medium">Face Mesh Tracking</p>
              </div>
              <div>
                <p className="font-extrabold text-xl text-lens-teal font-mono">100%</p>
                <p className="text-xs text-zinc-300 font-medium">On-Device Privacy</p>
              </div>
              <div>
                <p className="font-extrabold text-xl text-white font-mono">7 Days</p>
                <p className="text-xs text-zinc-300 font-medium">Exchange Guarantee</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden border border-lens-teal/30 shadow-2xl bg-luxury-900 group">
              <img
                src={settings?.bannerUrl || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80"}
                alt={settings?.storeName ? `${settings.storeName} Eyewear Showcase` : "LENS MART Eyewear Showcase"}
                className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-transparent to-transparent opacity-80" />

              {/* Floating Try-On Overlay Card */}
              <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-luxury-950/90 backdrop-blur-md border border-lens-teal/30 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-lens-aqua tracking-wider">Featured Model</span>
                  <h4 className="font-serif font-bold text-sm">Aura Obsidian Square</h4>
                  <p className="text-[11px] text-luxury-400">Italian Acetate • 52-18-140</p>
                </div>
                <button
                  onClick={onOpenTryOn}
                  className="px-3.5 py-2 bg-gradient-to-r from-lens-teal to-lens-cyan text-luxury-950 font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
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
