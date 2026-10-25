import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Search, Menu, X, Globe, Shield, Phone, ArrowRight, MapPin } from 'lucide-react';
import { StoreSettings } from '../../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTryOn: () => void;
  onOpenLocator?: () => void;
  currency: 'PKR' | 'USD';
  onToggleCurrency: () => void;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
  onOpenAdmin: () => void;
  onSearch: (q: string) => void;
  settings?: StoreSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenTryOn,
  onOpenLocator,
  currency,
  onToggleCurrency,
  onSelectCategory,
  activeCategory,
  onOpenAdmin,
  onSearch,
  settings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchOpen(false);
    }
  };

  const navCategories = [
    { label: 'All Collection', value: 'All' },
    { label: 'Prescription Glasses', value: 'Prescription Glasses' },
    { label: 'Sunglasses', value: 'Sunglasses' },
    { label: 'Blue-Light Defense', value: 'Blue-Light Glasses' }
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-luxury-950 text-white text-[11px] py-2 px-4 text-center tracking-wider font-medium flex items-center justify-between border-b border-white/5">
        <div className="hidden md:flex items-center gap-2 text-luxury-400">
          <Phone className="w-3 h-3 text-gold" />
          <span>Concierge Helpline: <strong>{settings?.phone || '+92 42 35789012'}</strong></span>
        </div>

        <div className="mx-auto flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-champagne-500 animate-pulse"></span>
          <span>Complimentary Express Delivery Nationwide above Rs. 5,000 • 7-Day Replacements</span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {onOpenLocator && (
            <button
              onClick={onOpenLocator}
              className="flex items-center gap-1.5 text-champagne-400 hover:text-white transition-colors font-medium"
              title="Locate nearby optical stores with free live map"
            >
              <MapPin className="w-3 h-3 text-gold" />
              <span>Find Optical Stores</span>
            </button>
          )}
          <span className="text-luxury-700">|</span>
          {/* Currency Switcher (PKR / USD toggle) */}
          <button
            onClick={onToggleCurrency}
            className="flex items-center gap-1 text-luxury-300 hover:text-white transition-colors"
            title="Toggle currency display"
          >
            <Globe className="w-3 h-3 text-gold" />
            <span className="font-bold">{currency}</span>
          </button>
          <span className="text-luxury-700">|</span>
          <button
            onClick={onOpenAdmin}
            className="text-luxury-400 hover:text-gold transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3" /> Admin
          </button>
        </div>
      </div>

      {/* Main Luxury Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-luxury-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-luxury-800 hover:text-luxury-950"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <a href="/" onClick={(e) => { e.preventDefault(); onSelectCategory('All'); }} className="flex items-center gap-2.5 group">
              {settings?.logoUrl ? (
                <div className="w-10 h-10 rounded-xl bg-luxury-950 flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform overflow-hidden border border-luxury-800">
                  <img src={settings.logoUrl} alt={settings.storeName || "NEXT VISION"} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-luxury-950 text-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 64 64" className="w-6 h-6" fill="none">
                    <rect x="8" y="24" width="20" height="16" rx="8" stroke="#d4af37" strokeWidth="3" fill="#18181b"/>
                    <rect x="36" y="24" width="20" height="16" rx="8" stroke="#d4af37" strokeWidth="3" fill="#18181b"/>
                    <path d="M28 29 C31 26, 33 26, 36 29" stroke="#d4af37" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-luxury-950 block leading-none">
                  {settings?.storeName ? (
                    settings.storeName
                  ) : (
                    <>NEXT <span className="text-champagne-600 font-sans text-lg font-light">VISION</span></>
                  )}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-luxury-500 block font-semibold">
                  {settings?.tagline || 'Luxury Optical House'}
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Category Navigation */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider">
            {navCategories.map(cat => (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`transition-colors relative py-1 ${
                  activeCategory === cat.value
                    ? 'text-luxury-950 font-bold'
                    : 'text-luxury-500 hover:text-luxury-950'
                }`}
              >
                {cat.label}
                {activeCategory === cat.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-950 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right Action Icons & CTAs */}
          <div className="flex items-center gap-3">
            
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-luxury-600 hover:text-luxury-950 rounded-full hover:bg-luxury-100 transition-colors"
              title="Search catalog"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Store Locator Link */}
            {onOpenLocator && (
              <button
                onClick={onOpenLocator}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-luxury-800 hover:text-luxury-950 hover:bg-luxury-100 rounded-full transition-colors border border-luxury-200 shadow-2xs"
                title="Locate nearest optical shop with interactive free map"
              >
                <MapPin className="w-3.5 h-3.5 text-champagne-600" />
                <span>Find Stores</span>
              </button>
            )}

            {/* Virtual Try-On AR Launcher CTA (Checklist #16: Clear CTAs) */}
            <button
              onClick={onOpenTryOn}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-luxury-950 hover:bg-luxury-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 border border-champagne-500/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>Virtual Try-On</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="p-2.5 text-luxury-950 hover:bg-luxury-100 rounded-full relative transition-colors"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-luxury-950 text-gold text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Drawer / Dropdown */}
        {searchOpen && (
          <div className="border-t border-luxury-100 bg-white px-6 py-4 animate-fade-in shadow-inner">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-luxury-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search frames by name, shape (Round, Aviator, Cat-Eye), or material (Titanium, Acetate)..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-luxury-50 border border-luxury-300 rounded-xl focus:outline-none focus:border-luxury-950"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-luxury-950 text-white rounded-xl text-xs font-bold hover:bg-luxury-800"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-luxury-400 hover:text-luxury-950"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-luxury-100 bg-white px-6 py-5 space-y-4 animate-fade-in shadow-xl">
            <div className="space-y-2">
              {navCategories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => {
                    onSelectCategory(cat.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 text-xs font-bold uppercase tracking-wider ${
                    activeCategory === cat.value ? 'text-luxury-950' : 'text-luxury-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-luxury-100 space-y-3">
              <button
                onClick={() => { onOpenTryOn(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-luxury-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" /> Launch Virtual Try-On AR
              </button>

              {onOpenLocator && (
                <button
                  onClick={() => { onOpenLocator(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-luxury-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-champagne-600" /> Find Optical Stores (Live Map)
                </button>
              )}

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  onClick={onToggleCurrency}
                  className="flex items-center gap-1.5 text-luxury-700 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5 text-champagne-600" />
                  <span>Currency: {currency}</span>
                </button>

                <button
                  onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                  className="text-luxury-500 hover:text-luxury-950 font-medium"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
