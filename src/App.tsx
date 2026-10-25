import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { ProductGrid } from './components/catalog/ProductGrid';
import { VirtualTryOnModal } from './components/vto/VirtualTryOnModal';
import { PrescriptionModal } from './components/catalog/PrescriptionModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AIStylistWidget } from './components/stylist/AIStylistWidget';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { TermsConditions } from './components/pages/TermsConditions';
import { NotFound } from './components/pages/NotFound';
import { OpticalShopLocator } from './components/locator/OpticalShopLocator';
import { StoreLocatorTeaser } from './components/home/StoreLocatorTeaser';
import { Footer } from './components/layout/Footer';
import { CookieConsent } from './components/common/CookieConsent';
import { WhatsAppConcierge } from './components/common/WhatsAppConcierge';
import { Product, CartItem, ColorVariant, LensOption, Order, StoreSettings } from './types';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';
import { trackEvent } from './utils/analytics';

export function App() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings | null>({
    storeName: "NEXT VISION",
    tagline: "Pakistan's Premier Eyewear Destination",
    address: "Shop 14, Luxury Promenade, MM Alam Road, Gulberg III, Lahore, Pakistan",
    phone: "+92 3054323059",
    whatsapp: "+92 305 4323059",
    email: "darmuhammadabubakar9@gmail.com",
    shippingFee: 250,
    freeShippingThreshold: 5000,
    usdExchangeRate: 0.0036,
    googleSheetsWebhookUrl: "https://script.google.com/macros/s/AKfycbxbNv9TipAFhOGvNgkkroAE5XbG0eI8BnTusyc49buQyio3ftSf2r9Uu4OqSNf1VBBz/exec",
    autoSyncGoogleSheets: true,
    autoWhatsAppNotification: true
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nextvision_cart') || localStorage.getItem('ainak_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(i => i && i.product && i.product.id && i.selectedColor && typeof i.quantity === 'number');
    } catch {
      return [];
    }
  });

  // Routing State: 'store' | 'admin' | 'privacy' | 'terms' | '404' | 'locator'
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'privacy' | 'terms' | '404' | 'locator'>('store');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');

  // Modals
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(DEFAULT_PRODUCTS[0]);

  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [prescriptionProduct, setPrescriptionProduct] = useState<Product | null>(null);
  const [prescriptionColor, setPrescriptionColor] = useState<ColorVariant | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nextvision_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not persist cart:", e);
    }
  }, [cart]);

  // Fetch Products & Settings on Load
  useEffect(() => {
    trackEvent('page_view', { path: window.location.pathname });

    // Fetch products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(err => console.warn("Failed to load products from API:", err));

    // Fetch settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.warn("Failed to load store settings:", err));

    // Check URL path for deep routing
    const path = window.location.pathname;
    if (path === '/admin') setCurrentView('admin');
    else if (path === '/privacy') setCurrentView('privacy');
    else if (path === '/terms') setCurrentView('terms');
    else if (path === '/stores' || path === '/locator') setCurrentView('locator');
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product, color: ColorVariant, lensOption?: LensOption) => {
    const defaultLens: LensOption = lensOption || {
      type: 'Standard Clear UV400 (Zero Power)',
      price: 0
    };

    const newItemId = `${product.id}-${color.name}-${defaultLens.type}`;
    const existingIndex = cart.findIndex(i => i.id === newItemId);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: newItemId,
        product,
        selectedColor: color,
        lensOption: defaultLens,
        quantity: 1
      };
      setCart([...cart, newItem]);
    }

    setIsCartOpen(true);
    trackEvent('add_to_cart', { productId: product.id, title: product.title, lens: defaultLens.type });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart(cart.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
  };

  // Launchers
  const handleLaunchTryOn = (product?: Product) => {
    setTryOnProduct(product || products[0] || DEFAULT_PRODUCTS[0]);
    setIsTryOnOpen(true);
  };

  const handleConfigurePrescription = (product: Product, color: ColorVariant) => {
    setPrescriptionProduct(product);
    setPrescriptionColor(color);
    setIsPrescriptionOpen(true);
  };

  const handleSearch = (query: string) => {
    fetch(`/api/products?search=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      });
  };

  const exchangeRate = settings?.usdExchangeRate || 0.0036;

  // View: Admin Portal
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onExit={() => setCurrentView('store')}
        currency={currency}
        exchangeRate={exchangeRate}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navbar */}
      <Navbar
        cartCount={cart.reduce((total, i) => total + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTryOn={() => handleLaunchTryOn()}
        onOpenLocator={() => setCurrentView('locator')}
        currency={currency}
        onToggleCurrency={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setCurrentView('store');
        }}
        activeCategory={activeCategory}
        onOpenAdmin={() => setCurrentView('admin')}
        onSearch={handleSearch}
        settings={settings}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentView === 'store' && (
          <>
            <Hero
              onOpenTryOn={() => handleLaunchTryOn()}
              onExploreCollection={() => {
                const catalogEl = document.getElementById('catalog');
                catalogEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              settings={settings}
            />
            <ProductGrid
              products={products}
              currency={currency}
              exchangeRate={exchangeRate}
              onLaunchTryOn={handleLaunchTryOn}
              onConfigurePrescription={handleConfigurePrescription}
              onQuickAddToCart={(prod, col) => handleAddToCart(prod, col)}
              selectedCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
            <StoreLocatorTeaser onOpenLocator={() => setCurrentView('locator')} />
          </>
        )}

        {currentView === 'locator' && (
          <OpticalShopLocator
            onBackToStore={() => setCurrentView('store')}
            onOpenTryOn={() => handleLaunchTryOn()}
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyPolicy onBack={() => setCurrentView('store')} />
        )}

        {currentView === 'terms' && (
          <TermsConditions onBack={() => setCurrentView('store')} />
        )}

        {currentView === '404' && (
          <NotFound
            onGoHome={() => setCurrentView('store')}
            onSearch={handleSearch}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setCurrentView('privacy')}
        onOpenTerms={() => setCurrentView('terms')}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setCurrentView('store');
        }}
        onOpenTryOn={() => handleLaunchTryOn()}
        onOpenLocator={() => setCurrentView('locator')}
        onOpenAdmin={() => setCurrentView('admin')}
        settings={settings}
      />

      {/* Virtual Try-On Modal */}
      {isTryOnOpen && (
        <VirtualTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          products={products}
          initialProduct={tryOnProduct}
          currency={currency}
          exchangeRate={exchangeRate}
          onAddToCart={(prod, col) => {
            handleAddToCart(prod, col);
            setIsTryOnOpen(false);
          }}
        />
      )}

      {/* Prescription Lens Configurator Modal */}
      {isPrescriptionOpen && prescriptionProduct && prescriptionColor && (
        <PrescriptionModal
          isOpen={isPrescriptionOpen}
          onClose={() => setIsPrescriptionOpen(false)}
          product={prescriptionProduct}
          selectedColor={prescriptionColor}
          currency={currency}
          exchangeRate={exchangeRate}
          onConfirmAndAddToCart={(prod, col, lens) => {
            handleAddToCart(prod, col, lens);
          }}
        />
      )}

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        currency={currency}
        exchangeRate={exchangeRate}
      />

      {/* Checkout Modal - Unmounted on close to guarantee fresh clean customer details on every purchase */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          onOrderSuccess={handleOrderSuccess}
          currency={currency}
          exchangeRate={exchangeRate}
        />
      )}

      {/* AI Stylist Floating Widget (Gemini Powered) */}
      <AIStylistWidget
        products={products}
        currency={currency}
        exchangeRate={exchangeRate}
        onLaunchTryOn={handleLaunchTryOn}
        onAddToCart={(prod, col) => handleAddToCart(prod, col)}
      />

      {/* WhatsApp Business Floating Concierge */}
      <WhatsAppConcierge settings={settings} />

      {/* Cookie Consent Banner (Checklist #5) */}
      <CookieConsent />
    </div>
  );
}
export default App;
