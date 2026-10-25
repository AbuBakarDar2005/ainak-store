import React, { useState } from 'react';
import { Search, Home, ArrowRight, EyeOff } from 'lucide-react';

interface NotFoundProps {
  onGoHome: () => void;
  onSearch: (query: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      onGoHome();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white text-center">
      <div className="max-w-md w-full">
        {/* Eyewear Graphic */}
        <div className="w-20 h-20 rounded-full bg-luxury-100 text-luxury-950 flex items-center justify-center mx-auto mb-6 shadow-sm border border-luxury-200">
          <EyeOff className="w-10 h-10 stroke-[1.4] text-champagne-600" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-champagne-700 bg-champagne-100 px-3 py-1 rounded-full">
          Error 404 • Page Not Found
        </span>

        <h1 className="font-serif text-3xl font-bold text-luxury-950 mt-4 mb-2">
          Out of Visual Focus
        </h1>
        <p className="text-xs text-luxury-500 mb-8 leading-relaxed max-w-sm mx-auto">
          The page you are looking for does not exist or may have been relocated. Search our catalog or return to the main gallery.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-luxury-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search optical frames, aviators, blue-cut..."
            className="w-full pl-10 pr-20 py-2.5 text-xs bg-luxury-50 border border-luxury-300 rounded-xl focus:outline-none focus:border-luxury-950"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-luxury-950 text-white rounded-lg text-xs font-semibold hover:bg-luxury-800"
          >
            Find
          </button>
        </form>

        <button
          onClick={onGoHome}
          className="px-6 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4 text-gold" /> Return to Storefront
        </button>
      </div>
    </div>
  );
};
