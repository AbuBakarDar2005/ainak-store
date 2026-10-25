import React from 'react';
import { MapPin, Navigation, Compass, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { OPTICAL_SHOPS } from '../../data/opticalShops';

interface StoreLocatorTeaserProps {
  onOpenLocator: () => void;
}

export const StoreLocatorTeaser: React.FC<StoreLocatorTeaserProps> = ({ onOpenLocator }) => {
  const [shops, setShops] = React.useState<any[]>(OPTICAL_SHOPS);

  React.useEffect(() => {
    fetch('/api/partner-stores')
      .then(r => r.json())
      .then(d => {
        if (d.stores && Array.isArray(d.stores) && d.stores.length > 0) {
          setShops(d.stores);
        }
      })
      .catch(() => {});
  }, []);

  const featuredShops = shops.slice(0, 3);

  return (
    <section className="py-20 bg-luxury-950 text-white relative overflow-hidden border-t border-b border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-champagne-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-luxury-800/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-champagne-300">
              <Compass className="w-3.5 h-3.5 text-gold" />
              <span>Interactive Optical Map • 100% Free OpenStreetMap API</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Visit an Optical Atelier <span className="gold-shimmer italic font-normal">Near You</span>
            </h2>
            <p className="text-luxury-300 text-xs sm:text-sm font-light leading-relaxed">
              Step into an authorized NEXT VISION atelier or certified partner clinic for complimentary computerized eye testing, real-time bespoke frame adjustments, and same-day lens fitting.
            </p>
          </div>

          <button
            onClick={onOpenLocator}
            className="px-6 py-3.5 bg-champagne-500 hover:bg-champagne-600 text-luxury-950 font-bold rounded-2xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Navigation className="w-4 h-4 text-luxury-950" />
            <span>Search Nearby Shops on Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Stores Cards Grid */}
        {featuredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {featuredShops.map((shop) => (
              <div
                key={shop.id}
                onClick={onOpenLocator}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-champagne-400/50 transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 border border-white/10">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-luxury-950/90 text-gold border border-white/15 shadow">
                      {shop.city}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-white group-hover:text-champagne-300 transition-colors">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-luxury-400 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-champagne-500 shrink-0 mt-0.5" />
                    <span>{shop.address}</span>
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-luxury-300">
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {shop.services?.[0] || 'Authorized Optician'}
                  </span>
                  <span className="text-champagne-300 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View On Map →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-10 p-8 rounded-2xl bg-white/5 border border-white/10 text-center max-w-xl mx-auto space-y-3">
            <Compass className="w-10 h-10 text-gold mx-auto" />
            <h3 className="font-serif font-bold text-lg text-white">Interactive Optical Locator</h3>
            <p className="text-xs text-luxury-300 leading-relaxed">
              Find verified optical shops, eye exams, and same-day lens fitting near your location using our free OpenStreetMap GPS locator.
            </p>
            <button
              onClick={onOpenLocator}
              className="px-5 py-2.5 bg-champagne-500 hover:bg-champagne-600 text-luxury-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 shadow-lg"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Launch Live Map</span>
            </button>
          </div>
        )}

        {/* Metric Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs">
          <div>
            <p className="text-xl sm:text-2xl font-bold font-serif text-white">Live GPS</p>
            <p className="text-luxury-400 text-[11px] mt-0.5">Interactive Pakistan Map</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold font-serif text-champagne-400">100% Free</p>
            <p className="text-luxury-400 text-[11px] mt-0.5">OpenStreetMap GPS Search</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-400">Free Exam</p>
            <p className="text-luxury-400 text-[11px] mt-0.5">3D Refraction at all Flagships</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold font-serif text-white">Same-Day</p>
            <p className="text-luxury-400 text-[11px] mt-0.5">Prescription Lens Glazing</p>
          </div>
        </div>

      </div>
    </section>
  );
};
