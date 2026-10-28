export interface FrameDimensions {
  lensWidth: number;
  bridgeWidth: number;
  templeLength: number;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: 'Prescription Glasses' | 'Sunglasses' | 'Blue-Light Glasses' | 'Reading Glasses';
  frameShape: 'Square' | 'Aviator' | 'Cat-Eye' | 'Rectangle' | 'Round' | 'Geometric';
  material: string;
  gender: 'Men' | 'Women' | 'Unisex';
  basePrice: number;
  salePrice: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  description: string;
  dimensions: FrameDimensions;
  faceShapesRecommended: string[];
  colors: ColorVariant[];
  images: string[];
  vtoOverlayType: string;
  vtoOverlayColor: string;
  vtoScaleMultiplier: number;
  vtoVerticalOffset: number;
}

export interface LensTint {
  name: string;
  color: string;
  description?: string;
}

export interface LensCategory {
  id: string;
  name: string;
  categoryKey: 'blue_light' | 'photochromic' | 'anti_glare_blue_cut' | 'all_in_one' | 'smart_glasses' | 'custom' | string;
  description: string;
  price: number;
  features: string[];
  badge?: string;
  supportsPhotochromicTints?: boolean;
  availableTints?: (string | LensTint)[];
  supportsPhotochromicToggle?: boolean;
  photochromicAddonPrice?: number;
  isActive: boolean;
}

export interface LensOption {
  type: string;
  price: number;
  selectedTint?: string;
  photochromicEnabled?: boolean;
  prescriptionType?: string;
  sphereR?: string;
  sphereL?: string;
  cylR?: string;
  cylL?: string;
  axisR?: string;
  axisL?: string;
  pd?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor: ColorVariant;
  lensOption: LensOption;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  items: {
    productId: string;
    title: string;
    color: string;
    price: number;
    quantity: number;
    lensOption?: LensOption;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  shippingFee: number;
  freeShippingThreshold: number;
  usdExchangeRate: number;
  googleSheetsWebhookUrl?: string;
  autoSyncGoogleSheets?: boolean;
  autoWhatsAppNotification?: boolean;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: 'google_sheets' | 'whatsapp' | 'system';
  status: 'Success' | 'Pending' | 'Failed';
  message: string;
  payload?: any;
}

export interface OpticalShop {
  id: string;
  name: string;
  type: 'Flagship Atelier' | 'Authorized Partner' | 'Certified Clinic';
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp?: string;
  timings: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  image: string;
  services: string[];
  hasFreeEyeTest: boolean;
  hasTryOnKiosk: boolean;
  hasSameDayLenses: boolean;
  isOpenNow: boolean;
  distanceKm?: number;
  isAdminAdded?: boolean;
}

export interface PartnerAdminAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  storeName: string;
  city: string;
  address?: string;
  role: 'partner_admin';
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  rejectionReason?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
}

export interface AdminUser {
  id?: string;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role: 'superadmin' | 'partner_admin';
  storeName?: string;
  city?: string;
  status?: 'pending' | 'verified' | 'rejected';
}

export interface EyesightBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  shopId: string;
  shopName: string;
  shopCity: string;
  shopAddress?: string;
  services?: string[];
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}




