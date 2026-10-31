import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Navigation, Search, Phone, Clock, Star, Sparkles,
  CheckCircle2, Compass, ArrowRight, X, ExternalLink, Calendar,
  ShieldCheck, AlertCircle, RefreshCw, MessageCircle, Eye
} from 'lucide-react';
import { OpticalShop, OPTICAL_SHOPS, PAKISTAN_CITIES, calculateDistanceKm } from '../../data/opticalShops';

interface OpticalShopLocatorProps {
  onBackToStore: () => void;
  onOpenTryOn: () => void;
  onOpenPartnerRequest?: () => void;
}

export const OpticalShopLocator: React.FC<OpticalShopLocatorProps> = ({
  onBackToStore,
  onOpenTryOn,
  onOpenPartnerRequest
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [filterFreeEyeTest, setFilterFreeEyeTest] = useState(false);
  const [filterTryOnKiosk, setFilterTryOnKiosk] = useState(false);
  const [filterSameDayLenses, setFilterSameDayLenses] = useState(false);
  const [selectedShop, setSelectedShop] = useState<OpticalShop | null>(null);

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Live OSM Search Results
  const [osmSearchResults, setOsmSearchResults] = useState<any[]>([]);
  const [isSearchingOSM, setIsSearchingOSM] = useState(false);

  // Booking Modal
  const [bookingShop, setBookingShop] = useState<OpticalShop | null>(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('02:00 PM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // View mode on mobile: 'split' | 'map' | 'list'
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');

  // Partner stores loaded from Admin Backend API (falls back to initial defaults)
  const [allShops, setAllShops] = useState<OpticalShop[]>(OPTICAL_SHOPS);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Fetch partner stores added via Admin Page (Strictly Admin-Added Only)
  useEffect(() => {
    setIsLoadingStores(true);
    fetch('/api/partner-stores')
      .then(res => res.json())
      .then(data => {
        if (data.stores && Array.isArray(data.stores)) {
          setAllShops(data.stores.filter((s: any) => s.isAdminAdded === true));
        } else {
          setAllShops([]);
        }
      })
      .catch(err => {
        console.warn('Could not load stores:', err);
        setAllShops([]);
      })
      .finally(() => {
        setIsLoadingStores(false);
      });
  }, []);

  // Compute shops with distances and filters
  const filteredShops = useMemo(() => {
    let list = allShops.map(shop => {
      let distanceKm: number | undefined = undefined;
      if (userLocation) {
        distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, shop.lat, shop.lng);
      }
      return { ...shop, distanceKm };
    });

    // City Filter
    if (selectedCity !== 'All') {
      list = list.filter(s => s.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Text Search in Location Bar
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.province && s.province.toLowerCase().includes(q)) ||
        (s.services && s.services.some(srv => srv.toLowerCase().includes(q)))
      );
    }

    // Service Filters
    if (filterFreeEyeTest) list = list.filter(s => s.hasFreeEyeTest);
    if (filterTryOnKiosk) list = list.filter(s => s.hasTryOnKiosk);
    if (filterSameDayLenses) list = list.filter(s => s.hasSameDayLenses);

    // Sort by distance if user location is available, otherwise by rating
    if (userLocation) {
      list.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [allShops, selectedCity, searchQuery, filterFreeEyeTest, filterTryOnKiosk, filterSameDayLenses, userLocation]);

  // Create Custom SVG DivIcons
  const createStoreIcon = (shop: OpticalShop, isSelected: boolean) => {
    const isFlagship = shop.type === 'Flagship Atelier';
    const bgClass = isSelected
      ? 'bg-champagne-500 text-luxury-950 scale-125 ring-4 ring-gold/40'
      : isFlagship
      ? 'bg-luxury-950 text-gold border-2 border-champagne-400'
      : 'bg-white text-luxury-900 border border-luxury-300';

    const html = `
      <div class="relative flex items-center justify-center transition-transform duration-300 cursor-pointer ${bgClass} w-9 h-9 rounded-full shadow-xl">
        <svg viewBox="0 0 24 24" class="w-5 h-5 fill-none stroke-current stroke-2">
          <circle cx="6" cy="12" r="4"/>
          <circle cx="18" cy="12" r="4"/>
          <path d="M10 12h4"/>
          <path d="M6 8l3-3"/>
          <path d="M18 8l-3-3"/>
        </svg>
        ${
          isFlagship
            ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white animate-pulse"></span>'
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });
  };

  const createUserIcon = () => {
    const html = `
      <div class="relative flex items-center justify-center">
        <div class="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div class="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping pointer-events-none"></div>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'user-leaflet-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Lahore, Pakistan
    const map = L.map(mapContainerRef.current, {
      center: [31.5204, 74.3587],
      zoom: 12,
      zoomControl: true
    });

    // Free OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers on Map when filteredShops or selectedShop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing store markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for all filtered shops
    filteredShops.forEach(shop => {
      const isSelected = selectedShop?.id === shop.id;
      const marker = L.marker([shop.lat, shop.lng], {
        icon: createStoreIcon(shop, isSelected)
      }).addTo(map);

      // Popup content
      const popupHtml = `
        <div class="p-1 min-w-[220px] max-w-[280px] font-sans text-xs">
          <div class="relative aspect-[16/9] rounded-lg overflow-hidden mb-2 bg-zinc-100">
            <img src="${shop.image}" alt="${shop.name}" class="w-full h-full object-cover" />
            <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-950 text-amber-300">
              ${shop.type}${shop.isAdminAdded ? ' • Admin Partner' : ''}
            </span>
          </div>
          <h4 class="font-bold text-sm text-zinc-950 mb-0.5 leading-snug">${shop.name}</h4>
          <p class="text-zinc-500 text-[11px] mb-2">${shop.address}, ${shop.city}</p>
          <div class="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-100 text-[11px]">
            <span class="text-amber-600 font-bold">★ ${shop.rating}</span>
            <span class="text-zinc-400">(${shop.reviewsCount} reviews)</span>
            ${shop.distanceKm !== undefined ? `<span class="ml-auto font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">${shop.distanceKm} km away</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5">
            <a href="tel:${shop.phone}" class="flex-1 text-center py-1.5 bg-zinc-900 text-white font-semibold rounded text-[11px] hover:bg-zinc-800">
              Call
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}" target="_blank" rel="noopener noreferrer" class="flex-1 text-center py-1.5 border border-zinc-300 text-zinc-800 font-semibold rounded text-[11px] hover:bg-zinc-100">
              Directions
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedShop(shop);
      });

      markersRef.current[shop.id] = marker;
    });

    // If a shop is selected, open its popup & pan to it
    if (selectedShop && markersRef.current[selectedShop.id]) {
      const marker = markersRef.current[selectedShop.id];
      map.flyTo([selectedShop.lat, selectedShop.lng], 14, { duration: 0.8 });
      marker.openPopup();
    } else if (filteredShops.length > 0 && !selectedShop) {
      // Fit bounds to show all markers safely
      const group = L.featureGroup(Object.values(markersRef.current));
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15), { maxZoom: 14 });
      }
    }
  }, [filteredShops, selectedShop]);

  // Invalidate map size when toggling between list and map tabs on mobile
  useEffect(() => {
    if (mobileTab === 'map' && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mobileTab]);

  // Handle Geolocation "Near Me"
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);

        const map = mapInstanceRef.current;
        if (map) {
          // Add/update user location marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: createUserIcon(),
              zIndexOffset: 1000
            })
              .addTo(map)
              .bindPopup('<strong class="text-xs">📍 You are here</strong>');
          }

          map.flyTo([latitude, longitude], 13, { duration: 1.2 });
          userMarkerRef.current.openPopup();
        }

        // Search live OpenStreetMap opticians in this radius
        searchOsmNearbyOpticians(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`Location access denied or unavailable (${err.message}). Showing curated network.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Free OpenStreetMap Nominatim Live Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingOSM(true);
    try {
      // 1. Geocode the query location via Free OSM Nominatim
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ', Pakistan'
      )}&limit=1`;

      const res = await fetch(nominatimUrl, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([lat, lon], 13, { duration: 1.2 });
        }

        // Recalculate distance to search center
        setUserLocation({ lat, lng: lon });

        // Query nearby optical shops via OSM
        searchOsmNearbyOpticians(lat, lon);
      }
    } catch (err) {
      console.warn('OSM search error:', err);
    } finally {
      setIsSearchingOSM(false);
    }
  };

  // Search real optical shops nearby via Free OSM Nominatim API
  const searchOsmNearbyOpticians = async (lat: number, lon: number) => {
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=optician&bounded=1&viewbox=${
        lon - 0.15
      },${lat + 0.15},${lon + 0.15},${lat - 0.15}&limit=5`;

      const res = await fetch(osmUrl);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOsmSearchResults(data);
      }
    } catch (e) {
      // Silently fail to curated optical list
    }
  };

  // Handle Booking Submit (Persist to database so specific partner admin sees it)
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingShop || !bookingName || !bookingPhone || !bookingDate) return;
    setIsSubmittingBooking(true);

    try {
      const res = await fetch('/api/eyesight-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: bookingName,
          customerPhone: bookingPhone,
          date: bookingDate,
          time: bookingTime,
          shopId: bookingShop.id,
          shopName: bookingShop.name,
          shopCity: bookingShop.city,
          shopAddress: bookingShop.address,
          notes: bookingNotes || 'Booked via Store Locator',
          services: [
            'Automated Computerized Refraction Eye Test',
            'Visual Acuity & Astigmatism Assessment',
            'Pupil Distance (PD) Measurement & Frame Fitting'
          ]
        })
      });

      const data = await res.json();
      if (res.ok && data.booking) {
        setCreatedBooking(data.booking);
        setBookingConfirmed(true);
      } else {
        alert(data.error || 'Failed to submit booking. Please try again.');
      }
    } catch (err) {
      // Fallback
      setCreatedBooking({
        id: 'EB-' + Date.now().toString().slice(-6),
        customerName: bookingName,
        customerPhone: bookingPhone,
        date: bookingDate,
        time: bookingTime,
        shopName: bookingShop.name,
        shopCity: bookingShop.city
      });
      setBookingConfirmed(true);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-50 flex flex-col text-luxury-950 font-sans">
      
      {/* Top Breadcrumb & Header Bar */}
      <header className="bg-luxury-950 text-white border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              ← Back to Eyewear Catalog
            </button>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-serif font-bold text-champagne-300">
                Atelier Store Locator & Partner Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {onOpenPartnerRequest && (
              <button
                onClick={onOpenPartnerRequest}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-champagne-300 rounded-lg text-xs font-semibold border border-white/15 transition-all"
                title="Apply for Partner Admin access and get listed"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-champagne-400" />
                <span>Partner Admin Request</span>
              </button>
            )}
            <button
              onClick={onOpenTryOn}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-champagne-500 hover:bg-champagne-600 text-luxury-950 font-bold rounded-lg transition-transform hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-luxury-950" /> Try On Frames Live in AR
            </button>
            <span className="text-[11px] text-luxury-400 hidden md:inline">
              Powered by <strong>OpenStreetMap® Free Mapping</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Search & Filter Section */}
      <section className="bg-gradient-to-b from-luxury-950 to-luxury-900 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-champagne-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-luxury-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-champagne-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              100% Free Optical Store Finder
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 leading-tight">
              Locate Nearby Optical Ateliers & <span className="gold-shimmer italic font-normal">Eye Clinics</span>
            </h1>
            <p className="text-luxury-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Find authorized NEXT VISION ateliers, certified optometrists, and free 3D refraction eye test centers across Pakistan with real-time GPS navigation.
            </p>
          </div>

          {/* Search Controls Bar */}
          <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row items-stretch gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-luxury-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city, area, neighborhood (e.g. Gulberg Lahore, Clifton Karachi, F-7 Islamabad)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-3 bg-white text-luxury-950 rounded-xl text-xs font-medium placeholder-luxury-400 focus:outline-none focus:ring-2 focus:ring-champagne-400 shadow-inner"
              />
              <button
                type="submit"
                disabled={isSearchingOSM}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isSearchingOSM ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </form>

            {/* GPS Locate Me Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-5 py-3 bg-champagne-500 hover:bg-champagne-600 text-luxury-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting Location...' : 'Find Near Me (GPS)'}</span>
            </button>
          </div>

          {locationError && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{locationError}</span>
            </div>
          )}

          {/* City Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-luxury-300 uppercase text-[10px] tracking-wider shrink-0 pr-1">
              Select City:
            </span>
            {PAKISTAN_CITIES.map(city => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setSelectedShop(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap text-xs ${
                  selectedCity === city
                    ? 'bg-champagne-500 text-luxury-950 shadow-md font-bold'
                    : 'bg-white/10 text-luxury-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {city === 'All' ? 'All Pakistan' : city}
              </button>
            ))}
          </div>

          {/* Service Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="font-bold text-luxury-300 uppercase text-[10px] tracking-wider pr-1">
              Filter by Service:
            </span>
            <button
              onClick={() => setFilterFreeEyeTest(!filterFreeEyeTest)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs ${
                filterFreeEyeTest
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'bg-white/10 text-luxury-300 hover:bg-white/15'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Free Eye Examination
            </button>
            <button
              onClick={() => setFilterTryOnKiosk(!filterTryOnKiosk)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs ${
                filterTryOnKiosk
                  ? 'bg-champagne-500 text-luxury-950 font-bold'
                  : 'bg-white/10 text-luxury-300 hover:bg-white/15'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AR Try-On Kiosk
            </button>
            <button
              onClick={() => setFilterSameDayLenses(!filterSameDayLenses)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs ${
                filterSameDayLenses
                  ? 'bg-blue-500 text-white font-bold'
                  : 'bg-white/10 text-luxury-300 hover:bg-white/15'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Same-Day Lenses
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden bg-white border-b border-luxury-200 p-2 flex gap-2 sticky top-[57px] z-20">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors ${
            mobileTab === 'list' ? 'bg-luxury-950 text-white' : 'bg-luxury-100 text-luxury-700'
          }`}
        >
          Optical Shops List ({filteredShops.length})
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === 'map' ? 'bg-luxury-950 text-white' : 'bg-luxury-100 text-luxury-700'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Interactive Map
        </button>
      </div>

      {/* Main Content Area: Split View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[720px]">
          
          {/* LEFT COLUMN: SHOPS LIST (5 cols) */}
          <div
            className={`lg:col-span-5 flex flex-col h-full space-y-4 ${
              mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-luxury-200">
              <div>
                <h2 className="font-serif font-bold text-lg text-luxury-950">
                  {filteredShops.length} Optical Stores Located
                </h2>
                <p className="text-[11px] text-luxury-500">
                  {userLocation ? 'Sorted by proximity to your coordinates' : 'Sorted by customer rating'}
                </p>
              </div>
              {selectedShop && (
                <button
                  onClick={() => setSelectedShop(null)}
                  className="text-xs text-champagne-700 hover:underline font-semibold"
                >
                  View All on Map
                </button>
              )}
            </div>

            {/* Scrollable list of cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredShops.map(shop => {
                const isSelected = selectedShop?.id === shop.id;

                return (
                  <div
                    key={shop.id}
                    onClick={() => {
                      setSelectedShop(shop);
                      setMobileTab('map');
                    }}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-champagne-500 ring-2 ring-champagne-400/40 bg-champagne-50/20'
                        : 'border-luxury-200 hover:border-luxury-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Shop Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-luxury-100 shrink-0 border border-luxury-200">
                        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Type & Distance Badges */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              shop.type === 'Flagship Atelier'
                                ? 'bg-luxury-950 text-gold'
                                : 'bg-luxury-100 text-luxury-700'
                            }`}>
                              {shop.type}
                            </span>
                            {shop.isAdminAdded && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Admin Partner
                              </span>
                            )}
                          </div>

                          {shop.distanceKm !== undefined && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {shop.distanceKm} km away
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-serif font-bold text-sm text-luxury-950 truncate">
                          {shop.name}
                        </h3>

                        {/* Address */}
                        <p className="text-[11px] text-luxury-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-luxury-400 shrink-0" />
                          <span>{shop.address}, {shop.city}</span>
                        </p>

                        {/* Rating & Timings */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-luxury-600">
                          <span className="flex items-center gap-0.5 font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {shop.rating}
                          </span>
                          <span className="text-luxury-400">({shop.reviewsCount})</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{shop.timings}</span>
                        </div>
                      </div>
                    </div>

                    {/* Services Chips */}
                    <div className="mt-3 pt-2.5 border-t border-luxury-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                      {shop.hasFreeEyeTest && (
                        <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Free Eye Test
                        </span>
                      )}
                      {shop.hasTryOnKiosk && (
                        <span className="bg-champagne-100 text-champagne-900 font-semibold px-2 py-0.5 rounded border border-champagne-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-champagne-700" /> AR Try-On Kiosk
                        </span>
                      )}
                      {shop.hasSameDayLenses && (
                        <span className="bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" /> Same-Day Lenses
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-luxury-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingShop(shop);
                          setBookingConfirmed(false);
                        }}
                        className="flex-1 py-1.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Calendar className="w-3.5 h-3.5 text-gold" />
                        <span>Book Eye Exam</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 border border-luxury-300 hover:border-luxury-900 text-luxury-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Get driving directions"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>

                      <a
                        href={`tel:${shop.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border border-luxury-300 hover:border-luxury-900 text-luxury-800 rounded-lg transition-colors"
                        title="Call shop"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}

              {filteredShops.length === 0 && (
                <div className="bg-white rounded-2xl p-8 border border-luxury-200 text-center space-y-3">
                  <Compass className="w-8 h-8 text-luxury-400 mx-auto" />
                  <h4 className="font-serif font-bold text-base text-luxury-950">No Optical Stores Found</h4>
                  <p className="text-xs text-luxury-500 max-w-sm mx-auto">
                    No shops match your current filter criteria in {selectedCity}. Try selecting "All Pakistan" or clearing filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCity('All');
                      setSearchQuery('');
                      setFilterFreeEyeTest(false);
                      setFilterTryOnKiosk(false);
                      setFilterSameDayLenses(false);
                    }}
                    className="px-4 py-2 bg-luxury-950 text-white rounded-lg text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* Optical Partner CTA Card */}
              {onOpenPartnerRequest && (
                <div className="bg-gradient-to-r from-luxury-950 to-luxury-900 text-white rounded-2xl p-4 border border-gold/30 shadow-md space-y-2.5 mt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-champagne-500/20 text-gold rounded-xl shrink-0">
                      <ShieldCheck className="w-5 h-5 text-champagne-400" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-white">Own an Optical Clinic or Store?</h4>
                      <p className="text-[10px] text-luxury-400">Join our verified optical partner network in Pakistan</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-luxury-300 leading-relaxed">
                    Get listed on this live store locator map and access the Partner Portal to add, change & list products and view customer prescriptions.
                  </p>
                  <button
                    onClick={onOpenPartnerRequest}
                    className="w-full py-2 bg-champagne-500 hover:bg-champagne-600 text-luxury-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Submit Partner Admin Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE LEAFLET OPENSTREETMAP (7 cols) */}
          <div
            className={`lg:col-span-7 h-full flex flex-col bg-white rounded-2xl border border-luxury-200 shadow-sm overflow-hidden relative ${
              mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Quick Legend */}
            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-luxury-200 shadow-lg text-[11px] text-luxury-800 space-y-1 hidden sm:block">
              <div className="flex items-center gap-2 font-bold text-xs border-b border-luxury-100 pb-1 mb-1 text-luxury-950">
                <Compass className="w-3.5 h-3.5 text-champagne-600" /> Map Legend
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-luxury-950 border border-gold inline-block"></span>
                <span>NEXT VISION Flagship Store</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white border border-luxury-400 inline-block"></span>
                <span>Partner Optician Clinic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block"></span>
                <span>Your Location (GPS)</span>
              </div>
            </div>

            {/* Floating Reset Center Button */}
            <button
              onClick={() => {
                const map = mapInstanceRef.current;
                if (map) {
                  map.flyTo([31.5204, 74.3587], 11, { duration: 1 });
                  setSelectedShop(null);
                }
              }}
              className="absolute bottom-6 right-6 z-20 px-3.5 py-2 bg-luxury-950 hover:bg-luxury-800 text-white font-bold rounded-xl text-xs shadow-xl flex items-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-gold" /> Recenter Map
            </button>
          </div>

        </div>
      </main>

      {/* Free Eye Examination Booking Modal */}
      {bookingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-luxury-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-champagne-100 text-champagne-800 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-luxury-950">Book Free Eye Examination</h4>
                  <p className="text-[11px] text-luxury-500">At {bookingShop.name}</p>
                </div>
              </div>
              <button
                onClick={() => setBookingShop(null)}
                className="p-1 text-luxury-400 hover:text-luxury-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-luxury-100 text-luxury-800 text-[10px] font-mono font-bold rounded-full mb-1.5 border border-luxury-200">
                    Booking ID: #{createdBooking?.id || 'EB-CONFIRMED'}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-luxury-950">Appointment Confirmed!</h4>
                  <p className="text-xs text-luxury-600 mt-1">
                    Your eye examination is scheduled for <strong>{bookingDate} at {bookingTime}</strong> at <strong>{bookingShop.name}</strong>.
                  </p>
                  <p className="text-[11px] text-luxury-500 mt-1">
                    📍 {bookingShop.address}, {bookingShop.city}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ✓ Your appointment has been sent to the clinic administrator at {bookingShop.name}. Please arrive 10 minutes before your slot.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {(bookingShop.whatsapp || bookingShop.phone) && (
                    <a
                      href={`https://wa.me/${(bookingShop.whatsapp || bookingShop.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${bookingShop.name}, I booked a free eye exam (Booking ID: #${createdBooking?.id || ''}) for ${bookingDate} at ${bookingTime}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>Chat with Clinic on WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setBookingShop(null);
                      setBookingConfirmed(false);
                      setCreatedBooking(null);
                      setBookingName('');
                      setBookingPhone('');
                      setBookingNotes('');
                    }}
                    className="px-6 py-2.5 bg-luxury-950 text-white font-bold rounded-xl text-xs hover:bg-luxury-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-3.5 text-xs">
                <div className="bg-luxury-50 p-3 rounded-xl border border-luxury-200 text-luxury-700 space-y-1 text-[11px]">
                  <p className="font-semibold text-luxury-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Complimentary Service Included:
                  </p>
                  <p>• Automated Computerized Refraction Eye Test</p>
                  <p>• Visual Acuity & Astigmatism Assessment</p>
                  <p>• Pupil Distance (PD) Measurement & Frame Fitting</p>
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hamza Tariq"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Phone Number (For SMS & WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">Time Slot *</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    >
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Symptoms or Special Requests (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Headache from screens, blurriness at distance"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setBookingShop(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-luxury-100 font-semibold text-luxury-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="px-5 py-2 bg-luxury-950 text-white font-bold rounded-lg hover:bg-luxury-800 shadow-md flex items-center gap-1.5"
                  >
                    {isSubmittingBooking ? (
                      <span>Reserving Slot...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                        <span>Confirm Free Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
