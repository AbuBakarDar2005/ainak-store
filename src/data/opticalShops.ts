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

export const OPTICAL_SHOPS: OpticalShop[] = [
  // --- LAHORE ---
  {
    id: 'lhr-1',
    name: 'NEXT VISION Flagship Optical Atelier',
    type: 'Flagship Atelier',
    address: 'Shop 14, Luxury Promenade, MM Alam Road, Gulberg III',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92 42 35789012',
    whatsapp: '+92 305 4323059',
    timings: '10:00 AM - 10:00 PM (Daily)',
    lat: 31.5126,
    lng: 74.3484,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
    services: [
      'Digital 3D Refraction Eye Test',
      'AR Face-Tracking Try-On Kiosk',
      'Italian Bio-Acetate Customization',
      'Same-Day Blue-Light Lenses'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'lhr-2',
    name: 'NEXT VISION Optical Lounge & Vision Care',
    type: 'Authorized Partner',
    address: 'Plaza 24, Y-Block Commercial Area, DHA Phase 3',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92 42 35742301',
    whatsapp: '+92 300 8472910',
    timings: '11:00 AM - 10:30 PM (Daily)',
    lat: 31.4725,
    lng: 74.3789,
    rating: 4.8,
    reviewsCount: 96,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
    services: [
      'Free Automated Computerized Eye Exam',
      'Progressive & Bifocal Fitting',
      'Ultralight Titanium Adjustments',
      'Anti-Glare Coating Lab'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'lhr-3',
    name: 'Optics Precision Clinic Johar Town',
    type: 'Certified Clinic',
    address: 'Plot 18, Block G-1, Main Boulevard, Johar Town',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92 42 35310984',
    whatsapp: '+92 321 4455667',
    timings: '10:30 AM - 9:30 PM (Mon-Sat)',
    lat: 31.4697,
    lng: 74.2728,
    rating: 4.7,
    reviewsCount: 78,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80',
    services: [
      'Pediatric & Adult Optometry',
      'Custom Cylinder/Axis Lens Glazing',
      'Contact Lens Consultation'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'lhr-4',
    name: 'Heritage Opticians Mall Road',
    type: 'Authorized Partner',
    address: '68 Mall Road, Near Charing Cross',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92 42 36301122',
    whatsapp: '+92 300 1239988',
    timings: '11:00 AM - 9:00 PM (Mon-Sat)',
    lat: 31.5582,
    lng: 74.3265,
    rating: 4.8,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80',
    services: [
      'Classic Vintage Frame Restorations',
      'Zero-Power Computer Glasses',
      'High-Index Lens Fitting'
    ],
    hasFreeEyeTest: false,
    hasTryOnKiosk: false,
    hasSameDayLenses: true,
    isOpenNow: true
  },

  // --- KARACHI ---
  {
    id: 'khi-1',
    name: 'NEXT VISION Luxe Atelier Clifton',
    type: 'Flagship Atelier',
    address: 'Plot 12-C, Block 4, Clifton, Near Bilawal Chowrangi',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92 21 35876091',
    whatsapp: '+92 305 4323059',
    timings: '11:00 AM - 11:00 PM (Daily)',
    lat: 24.8211,
    lng: 67.0315,
    rating: 4.9,
    reviewsCount: 185,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    services: [
      'HD Laser Wavefront Refraction',
      'AR Webcam Try-On Pods',
      'Polarized UV400 Prescription Tinting',
      'Luxury Titanium Bespoke Crafting'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'khi-2',
    name: 'Bukhari Vision Lab DHA',
    type: 'Authorized Partner',
    address: 'Shop 5, 26th Street, Bukhari Commercial, DHA Phase 6',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92 21 35348821',
    whatsapp: '+92 321 8299100',
    timings: '12:00 PM - 11:00 PM (Daily)',
    lat: 24.8138,
    lng: 67.0673,
    rating: 4.8,
    reviewsCount: 92,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
    services: [
      'Digital Pupillary Distance (PD) Scanner',
      'Japanese Memory-Metal Frames',
      'Blue-Cut Screen Glasses'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'khi-3',
    name: 'Tariq Road Optical Gallery',
    type: 'Authorized Partner',
    address: 'Mezzanine Floor, Dolmen Centre, Main Tariq Road, PECHS',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92 21 34551299',
    whatsapp: '+92 333 2244118',
    timings: '11:00 AM - 10:00 PM (Mon-Sat)',
    lat: 24.8728,
    lng: 67.0624,
    rating: 4.7,
    reviewsCount: 134,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
    services: [
      'Express Prescription Lens Fitting',
      'Designer Sunglasses Outlet',
      'Free Frame Sanitization'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'khi-4',
    name: 'North Nazimabad Optic Hub',
    type: 'Certified Clinic',
    address: 'Block H, Main Hyderi Market, North Nazimabad',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92 21 36671044',
    whatsapp: '+92 315 8899221',
    timings: '10:30 AM - 9:30 PM (Daily)',
    lat: 24.9432,
    lng: 67.0421,
    rating: 4.6,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80',
    services: [
      'Slit Lamp Eye Health Screening',
      'Affordable Acetate Frames',
      'Contact Lens Fitting'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: false,
    isOpenNow: true
  },

  // --- ISLAMABAD & RAWALPINDI ---
  {
    id: 'isb-1',
    name: 'Capital Optical Studio F-7 Markaz',
    type: 'Flagship Atelier',
    address: 'Shop 8, Beverly Center, Jinnah Super Market, F-7',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    phone: '+92 51 2654301',
    whatsapp: '+92 305 4323059',
    timings: '10:30 AM - 10:00 PM (Daily)',
    lat: 33.7215,
    lng: 73.0558,
    rating: 4.9,
    reviewsCount: 167,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
    services: [
      'German 3D Eye Refraction',
      'Interactive AR Try-On Display',
      'Ultra-Thin 1.74 Aspheric Lenses',
      'Free Microfiber Cleaning & Cases'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'isb-2',
    name: 'Centaurus Optical Concierge',
    type: 'Authorized Partner',
    address: '1st Floor, The Centaurus Mall, Jinnah Avenue, F-8',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    phone: '+92 51 2604812',
    whatsapp: '+92 301 5566778',
    timings: '11:00 AM - 11:00 PM (Daily)',
    lat: 33.7077,
    lng: 73.0499,
    rating: 4.8,
    reviewsCount: 140,
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80',
    services: [
      'Computerized Refractometry',
      'BlueShield Gaming Glasses',
      'Titanium Screwless Hinges'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'rwp-1',
    name: 'Saddar Precision Opticians',
    type: 'Authorized Partner',
    address: 'Bank Road, Near Shell Petrol Pump, Saddar',
    city: 'Rawalpindi',
    province: 'Punjab',
    phone: '+92 51 5567823',
    whatsapp: '+92 322 9911882',
    timings: '10:00 AM - 9:00 PM (Mon-Sat)',
    lat: 33.5973,
    lng: 73.0531,
    rating: 4.7,
    reviewsCount: 104,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
    services: [
      'Same-Day Single Vision Lenses',
      'Spectacle Frame Repair & Polishing',
      'Free Nosepad Replacements'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: true,
    isOpenNow: true
  },
  {
    id: 'rwp-2',
    name: 'Bahria Town Eyewear Boutique',
    type: 'Certified Clinic',
    address: 'Civic Centre, Phase 4, Bahria Town',
    city: 'Rawalpindi',
    province: 'Punjab',
    phone: '+92 51 5732109',
    whatsapp: '+92 334 5098711',
    timings: '11:00 AM - 10:00 PM (Daily)',
    lat: 33.5258,
    lng: 73.1091,
    rating: 4.8,
    reviewsCount: 79,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
    services: [
      'Optometrist Consultation',
      'Blue Defense Screen Lenses',
      'Designer Sunglasses'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: false,
    isOpenNow: true
  },

  // --- FAISALABAD ---
  {
    id: 'fsd-1',
    name: 'Lyallpur Eyewear Atelier D-Ground',
    type: 'Authorized Partner',
    address: 'Plot 31, D-Ground Commercial Area, Peoples Colony No. 1',
    city: 'Faisalabad',
    province: 'Punjab',
    phone: '+92 41 8541290',
    whatsapp: '+92 300 6688112',
    timings: '10:30 AM - 9:30 PM (Mon-Sat)',
    lat: 31.4116,
    lng: 73.1065,
    rating: 4.8,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    services: [
      'Full Digital Sight Testing',
      'Italian Acetate Frames',
      'Photochromic Transition Lenses'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: true,
    hasSameDayLenses: true,
    isOpenNow: true
  },

  // --- MULTAN ---
  {
    id: 'mul-1',
    name: 'Oasis Vision Studio Gulgasht',
    type: 'Authorized Partner',
    address: 'Gulgashat Colony, Near Gol Bagh, Bosan Road',
    city: 'Multan',
    province: 'Punjab',
    phone: '+92 61 6523901',
    whatsapp: '+92 301 7788990',
    timings: '11:00 AM - 10:00 PM (Daily)',
    lat: 30.2244,
    lng: 71.4883,
    rating: 4.7,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80',
    services: [
      'Free Optical Examination',
      'UV400 Polarized Shades',
      'Same-Day Delivery Available'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: true,
    isOpenNow: true
  },

  // --- PESHAWAR ---
  {
    id: 'pew-1',
    name: 'Khyber Optical Atelier University Road',
    type: 'Authorized Partner',
    address: 'Deans Trade Center, University Road',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    phone: '+92 91 5842109',
    whatsapp: '+92 333 9112233',
    timings: '10:00 AM - 9:00 PM (Mon-Sat)',
    lat: 34.0042,
    lng: 71.5034,
    rating: 4.7,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
    services: [
      'Automated Refraction',
      'Aerospace Titanium Wire Frames',
      'Computer Screen Defense'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: true,
    isOpenNow: true
  },

  // --- SIALKOT ---
  {
    id: 'skt-1',
    name: 'Cantonment Vision Studio',
    type: 'Certified Clinic',
    address: 'Near Aziz Shaheed Chowk, Paris Road',
    city: 'Sialkot',
    province: 'Punjab',
    phone: '+92 52 4298101',
    whatsapp: '+92 300 7102938',
    timings: '10:30 AM - 9:00 PM (Mon-Sat)',
    lat: 32.4972,
    lng: 74.5361,
    rating: 4.8,
    reviewsCount: 54,
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80',
    services: [
      'Refraction Testing',
      'Lightweight Rimless Fitting',
      'Lens Scratch-Guard Coatings'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: true,
    isOpenNow: true
  },

  // --- QUETTA ---
  {
    id: 'qta-1',
    name: 'Bolan Vision House Jinnah Road',
    type: 'Authorized Partner',
    address: 'Main Jinnah Road, Near City Center',
    city: 'Quetta',
    province: 'Balochistan',
    phone: '+92 81 2841908',
    whatsapp: '+92 333 7891234',
    timings: '10:00 AM - 8:30 PM (Mon-Sat)',
    lat: 30.1833,
    lng: 67.0108,
    rating: 4.6,
    reviewsCount: 47,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
    services: [
      'Optometry Checkup',
      'UV Protection Eyewear',
      'Custom Prescription Lenses'
    ],
    hasFreeEyeTest: true,
    hasTryOnKiosk: false,
    hasSameDayLenses: false,
    isOpenNow: true
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
