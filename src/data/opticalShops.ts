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

export const PAKISTAN_CITIES = [
  'All',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Quetta'
];

// Clean partner stores list (real stores added via Admin Portal or live OpenStreetMap search)
export const OPTICAL_SHOPS: OpticalShop[] = [
  {
    id: "store-1793047419124",
    name: "Tariq Vision Center",
    type: "Authorized Partner",
    address: "DHA Phase 5, Lahore",
    city: "Lahore",
    province: "Punjab",
    phone: "+92 300 1234567",
    whatsapp: "+92 300 1234567",
    timings: "10:00 AM - 10:00 PM (Daily)",
    lat: 31.5204,
    lng: 74.3587,
    rating: 4.8,
    reviewsCount: 1,
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80",
    services: [
      "Computerized Eye Exam",
      "Same-Day Lens Fitting"
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true,
    isAdminAdded: true
  },
  {
    id: "store-1792953566942",
    name: "TARIQ OPTICAL SERVICE",
    type: "Authorized Partner",
    address: "GT ROAD SHAHDRA LAHORE",
    city: "Lahore",
    province: "Punjab",
    phone: "+92 3486804783",
    whatsapp: "+92 3486804783",
    timings: "10:30 AM - 10:00 PM (Daily)",
    lat: 31.62273,
    lng: 74.28899,
    rating: 4.8,
    reviewsCount: 1,
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80",
    services: [
      "Free Computerized Eye Exam",
      "Same-Day Lens Fitting"
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true,
    isAdminAdded: true
  }
];

// Calculate distance between two lat/lng coordinates in kilometers (Haversine formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
