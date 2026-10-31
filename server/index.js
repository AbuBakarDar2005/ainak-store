import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn("Notice: could not create uploads directory:", e.message);
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ainak_default_jwt_secret_token_2026';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Security: Helmet for HTTPS headers and content security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Checklist #14: Rate-limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 AI queries per minute
  message: { error: 'Stylist rate limit reached. Please wait a moment.' }
});

// Middleware: Normalize incoming Vercel serverless URLs
app.use((req, res, next) => {
  if (req.url.startsWith('/uploads') || req.url.startsWith('/api/uploads')) {
    return next();
  }
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Root API Healthcheck
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    store: 'NEXT VISION',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/', apiLimiter);

// Authentication Middleware for Admin routes
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
}

// Middleware: Restrict sensitive routes strictly to Main Admin (SuperAdmin)
function requireSuperAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access restricted: Only the Main Admin can perform this action' });
  }
  next();
}

// ==========================================
// 1. PUBLIC STOREFRONT ROUTES
// ==========================================

// Get all products with optional filters
app.get('/api/products', (req, res) => {
  let products = db.getProducts();
  const { category, shape, gender, search, maxPrice } = req.query;

  if (category && category !== 'All') {
    const catLower = String(category).toLowerCase().trim();
    products = products.filter(p => p.category && p.category.toLowerCase().trim() === catLower);
  }
  if (shape && shape !== 'All') {
    const shapeLower = String(shape).toLowerCase().trim();
    products = products.filter(p => p.frameShape && p.frameShape.toLowerCase().trim() === shapeLower);
  }
  if (gender && gender !== 'All') {
    const genLower = String(gender).toLowerCase().trim();
    products = products.filter(p => (p.gender && p.gender.toLowerCase().trim() === genLower) || p.gender === 'Unisex');
  }
  if (maxPrice) {
    const priceLimit = Number(maxPrice);
    if (!isNaN(priceLimit)) {
      products = products.filter(p => (Number(p.salePrice) || Number(p.basePrice) || 0) <= priceLimit);
    }
  }
  if (search) {
    const q = String(search).toLowerCase().trim();
    products = products.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.material && p.material.toLowerCase().includes(q)) ||
      (p.frameShape && p.frameShape.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  res.json({ products });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

// Get public store settings
app.get('/api/settings', (req, res) => {
  res.json({ settings: db.getSettings() });
});

// Calculate distance in km between two lat/lng coordinates (Haversine formula)
function calcDistanceKm(lat1, lon1, lat2, lon2) {
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

// Get public partner stores (with optional city, search, and GPS location sorting)
app.get('/api/partner-stores', (req, res) => {
  const { city, search, lat, lng } = req.query;
  let stores = db.getPartnerStores({ city, search });

  if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
    const userLat = Number(lat);
    const userLng = Number(lng);
    stores = stores.map(s => ({
      ...s,
      distanceKm: calcDistanceKm(userLat, userLng, s.lat, s.lng)
    })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  res.json({ stores, count: stores.length });
});

// Get single partner store by ID
app.get('/api/partner-stores/:id', (req, res) => {
  const store = db.getPartnerStoreById(req.params.id);
  if (!store) return res.status(404).json({ error: 'Partner store not found' });
  res.json({ store });
});

// ==========================================
// EYESIGHT EXAMINATION BOOKINGS
// ==========================================

// Public: Book Free Eyesight Examination at Chosen Partner Store
app.post('/api/eyesight-bookings', (req, res) => {
  const { customerName, customerPhone, date, shopName } = req.body;
  if (!customerName || !customerPhone || !date) {
    return res.status(400).json({ error: 'Name, phone number, and appointment date are required' });
  }

  const booking = db.addEyesightBooking(req.body);

  // Automation log
  db.addAutomationLog(
    'eyesight_booking',
    'Success',
    `New Eyesight Booking: ${booking.customerName} booked at "${booking.shopName}" (${booking.shopCity}) for ${booking.date} at ${booking.time}`,
    booking
  );

  res.json({
    success: true,
    message: `Your eye examination has been booked successfully at ${booking.shopName}!`,
    booking
  });
});

// Helper to format clean WhatsApp order summary
function formatWhatsAppOrderMessage(order, storeSettings) {
  const itemsText = order.items.map(item => {
    let line = `• ${item.title} (${item.color}) x${item.quantity} — Rs. ${item.price.toLocaleString()}`;
    if (item.lensOption) {
      line += `\n  ↳ Lens: ${item.lensOption.type}`;
      if (item.lensOption.selectedTint) {
        line += ` (Sun Tint: ${item.lensOption.selectedTint})`;
      }
      if (item.lensOption.photochromicEnabled !== undefined) {
        line += ` [${item.lensOption.photochromicEnabled ? 'With Photochromic' : 'Without Photochromic'}]`;
      }
      if (item.lensOption.prescriptionType) {
        line += `\n  ↳ Rx: ${item.lensOption.prescriptionType}`;
      }
      if (item.lensOption.sphereR || item.lensOption.sphereL) {
        line += `\n  ↳ OD(SPH:${item.lensOption.sphereR || '0'}, CYL:${item.lensOption.cylR || '0'}, AXIS:${item.lensOption.axisR || '0'}) | OS(SPH:${item.lensOption.sphereL || '0'}, CYL:${item.lensOption.cylL || '0'}, AXIS:${item.lensOption.axisL || '0'})`;
      }
      if (item.lensOption.pd) {
        line += ` | PD: ${item.lensOption.pd}`;
      }
    }
    return line;
  }).join('\n');

  const text = `👓 *NEXT VISION — NEW ORDER CONFIRMATION* 👓\n` +
    `----------------------------------------\n` +
    `*Order ID:* ${order.id}\n` +
    `*Customer:* ${order.customer.name}\n` +
    `*Phone:* ${order.customer.phone}\n` +
    `*Delivery Address:* ${order.customer.address}, ${order.customer.city}, ${order.customer.province}\n` +
    `----------------------------------------\n` +
    `*ITEMS ORDERED:*\n${itemsText}\n` +
    `----------------------------------------\n` +
    `*Subtotal:* Rs. ${order.subtotal.toLocaleString()}\n` +
    `*Shipping:* ${order.shippingFee === 0 ? 'FREE Express Delivery' : `Rs. ${order.shippingFee}`}\n` +
    `*TOTAL PAYABLE:* Rs. ${order.total.toLocaleString()}\n` +
    `*Payment Mode:* ${order.paymentMethod}\n` +
    (order.notes ? `*Notes:* ${order.notes}\n` : '') +
    `----------------------------------------\n` +
    `Please confirm receipt and dispatch schedule. Thank you!`;

  const cleanPhone = (storeSettings.whatsapp || '923008472910').replace(/[\s\+\-]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// Checklist #14 & #13: Create order with honeypot spam protection, WhatsApp link & Google Sheets sync
app.post('/api/orders', async (req, res) => {
  const { customer, items, paymentMethod, honeypot } = req.body;

  // Invisible Honeypot check - if filled, reject
  if (honeypot) {
    return res.status(400).json({ error: 'Spam detected.' });
  }

  if (!customer || 
      !customer.name?.trim() || 
      !customer.phone?.trim() || 
      !customer.address?.trim() || 
      !customer.city?.trim() ||
      !customer.email?.trim()) {
    return res.status(400).json({ error: 'Customer details required: please provide full name, active phone number, email, and street address.' });
  }

  if (customer.name.trim().length < 3) {
    return res.status(400).json({ error: 'Please enter a valid customer full name (minimum 3 characters).' });
  }

  if (customer.address.trim().length < 8) {
    return res.status(400).json({ error: 'Please provide a complete street delivery address.' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  const settings = db.getSettings();
  let subtotal = 0;
  (items || []).forEach(item => {
    const itemBasePrice = typeof item.price === 'number' && !isNaN(item.price)
      ? item.price
      : (Number(item.price) || 0);
    const itemLensPrice = Number(item.lensOption?.price) || 0;
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    subtotal += (itemBasePrice + itemLensPrice) * qty;
  });

  const discountPercent = Math.max(0, Math.min(100, Number(req.body.discountPercent) || 0));
  const discountAmount = discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0;
  const netSubtotal = Math.max(0, subtotal - discountAmount);

  const shippingFee = netSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = netSubtotal + shippingFee;

  const order = db.createOrder({
    customer,
    items,
    subtotal: netSubtotal,
    rawSubtotal: subtotal,
    discount: discountAmount,
    discountPercent,
    shippingFee,
    total,
    paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
    notes: req.body.notes || ''
  });

  // Generate automated WhatsApp URL
  const whatsAppUrl = formatWhatsAppOrderMessage(order, settings);

  // Automated Google Sheets Sync Webhook (Business Automation)
  if (settings.googleSheetsWebhookUrl && settings.autoSyncGoogleSheets !== false) {
    try {
      const sheetsPayload = {
        action: 'new_order',
        timestamp: order.createdAt,
        orderId: order.id,
        customerName: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        address: `${order.customer.address}, ${order.customer.city}, ${order.customer.province}`,
        city: order.customer.city,
        items: order.items.map(i => `${i.title} (${i.color}) x${i.quantity}`).join('; '),
        lensPackage: order.items.map(i => i.lensOption?.type || 'Standard Clear').join('; '),
        prescription: order.items.map(i => {
          if (!i.lensOption) return 'None';
          const o = i.lensOption;
          return `R(${o.sphereR || '0'},${o.cylR || '0'},${o.axisR || '0'}) L(${o.sphereL || '0'},${o.cylL || '0'},${o.axisL || '0'}) PD:${o.pd || ''}`;
        }).join(' | '),
        subtotal: order.subtotal,
        shipping: order.shippingFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status
      };

      // Fire webhook asynchronously with redirect: follow
      fetch(settings.googleSheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetsPayload),
        redirect: 'follow'
      })
      .then(async resp => {
        const text = await resp.text();
        if (resp.status === 401 || text.includes('accounts.google.com') || text.includes('signin/identifier')) {
          db.addAutomationLog('google_sheets', 'Failed', `Google Sheets Webhook 401: Google Apps Script Web App must be deployed with "Who has access: Anyone". Currently requires Google login.`);
        } else {
          db.addAutomationLog('google_sheets', 'Success', `Order ${order.id} automatically synced to Google Sheets. HTTP ${resp.status}`);
        }
      })
      .catch(err => {
        console.warn("Google Sheets sync warning:", err.message);
        db.addAutomationLog('google_sheets', 'Failed', `Sync error for order ${order.id}: ${err.message}`);
      });
    } catch (e) {
      console.warn("Google sheets dispatch exception:", e);
    }
  } else {
    db.addAutomationLog('google_sheets', 'Pending', `Order ${order.id} recorded. Google Sheets Webhook URL not yet configured in Settings.`);
  }

  // Record WhatsApp notification event
  db.addAutomationLog('whatsapp', 'Success', `Formatted order message prepared for customer ${order.customer.name} (${order.customer.phone})`);

  res.status(201).json({
    success: true,
    order,
    whatsAppUrl
  });
});

// Track analytics events
app.post('/api/analytics/track', (req, res) => {
  const { event } = req.body;
  if (event === 'page_view') db.incrementAnalytics('pageViews');
  if (event === 'try_on_launched') db.incrementAnalytics('tryOnSessions');
  if (event === 'add_to_cart') db.incrementAnalytics('addToCartCount');
  res.json({ success: true });
});

// ==========================================
// 2. AI EYEWEAR STYLIST (GEMINI PROXY + HEURISTICS)
// ==========================================

const OPTICAL_KNOWLEDGE = `
You are the Master Optical Stylist for NEXT VISION, Pakistan's premier luxury eyewear house.
Rules for recommendations:
- Round Face: Needs angular frames (Square, Rectangle, Geometric, Cat-eye) to define cheekbones and sharpen curves.
- Oval Face: Extremely versatile. Fits Aviator, Square, Geometric, and Wayfarer effortlessly.
- Square Face: Has strong jawlines. Recommend Round, Oval, and Thin-wire Titanium frames to soften contours.
- Heart Face: Broader forehead, pointed chin. Recommend Rimless, Aviator, Round, and light-tone metal frames.
- Diamond Face: High cheekbones, narrow forehead and jaw. Recommend Browline, Cat-Eye, and Oval frames.

Prescription Knowledge:
- Single Vision: for distance or reading.
- Bifocal / Progressive: for combined near and distance viewing without distinct lines.
- Blue-Cut nano-coating: blocks 415-455nm blue wavelengths from computer screens.
- Photochromic Transition: darkens automatically in sunlight.

Tone: Professional, warm, aesthetic, knowledgeable, sophisticated. Mention prices in PKR (e.g. Rs. 4,600).
Always recommend 1 or 2 matching frames from the catalog and provide confidence-inspiring advice.
`;

app.post('/api/ai/chat', aiLimiter, async (req, res) => {
  const { message, faceShape, userHistory = [] } = req.body;
  const products = db.getProducts();

  // Find candidate frames matching face shape or query
  let matchingFrames = [];
  if (faceShape) {
    matchingFrames = products.filter(p => 
      p.faceShapesRecommended && p.faceShapesRecommended.includes(faceShape)
    );
  }
  if (matchingFrames.length === 0) {
    matchingFrames = products.slice(0, 3);
  }

  // If Gemini API Key is available, invoke Google Gemini 1.5/2.0 API securely server-side
  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
    try {
      const catalogSummary = products.map(p => 
        `- ID: ${p.id}, "${p.title}" (${p.frameShape || 'Optical'}, ${p.category || 'Eyewear'}, Rs. ${p.salePrice || p.basePrice || 0}, Recommended for: ${(p.faceShapesRecommended || []).join(', ')})`
      ).join('\n');

      const systemPrompt = `${OPTICAL_KNOWLEDGE}\n\nCurrent Store Catalog:\n${catalogSummary}\n\nClient Face Shape: ${faceShape || 'Unspecified'}`;
      
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\nCustomer question: "${message}"\n\nProvide an elegant, helpful answer. If recommending glasses, mention their exact titles.` }
            ]
          }
        ]
      };

      // Call Gemini REST API (gemini-2.0-flash or gemini-1.5-flash)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return res.json({
            reply: replyText,
            recommendedProducts: matchingFrames.slice(0, 3)
          });
        }
      } else {
        console.warn("Gemini API returned error:", await geminiRes.text());
      }
    } catch (apiErr) {
      console.warn("Gemini API call failed, falling back to built-in optical engine:", apiErr.message);
    }
  }

  // Intelligent fallback optical stylist engine
  let fallbackReply = "";
  const lowerMsg = (message || "").toLowerCase();

  if (faceShape === "Round" || lowerMsg.includes("round face")) {
    fallbackReply = "For your soft, curved facial contours, geometric and square frames create striking structural definition. I highly recommend our **Aura Obsidian Square** in hand-polished acetate or the **Eclipse Wayfarer** to sculpt your jawline with effortless elegance.";
  } else if (faceShape === "Square" || lowerMsg.includes("square face")) {
    fallbackReply = "A strong, chiseled square jawline is best complemented by gentle circular silhouettes. The **CyberGuard Pro Round** or the **Titan Ultralight** in Japanese beta-titanium soften angular features while maintaining an architectural presence.";
  } else if (faceShape === "Oval" || lowerMsg.includes("oval face")) {
    fallbackReply = "You have the most versatile face shape in optics! Almost every frame proportions naturally with your cheekbones. The iconic **Aviator Horizon Gold** or our **Aura Obsidian** will accentuate your symmetry beautifully.";
  } else if (faceShape === "Heart" || lowerMsg.includes("heart face")) {
    fallbackReply = "With broader cheekbones and a tapered jawline, lightweight rimless designs or bottom-heavy aviators balance your proportions flawlessly. Try our featherweight **Titan Ultralight Rimless** or the **Aviator Horizon Gold**.";
  } else if (faceShape === "Diamond" || lowerMsg.includes("diamond face")) {
    fallbackReply = "High cheekbones deserve dramatic framing! Our **Solstice Amber Cat-Eye** lifts the temple line, and the **Royal Clubmaster** balances your forehead and chin line with classic poise.";
  } else if (lowerMsg.includes("blue") || lowerMsg.includes("computer") || lowerMsg.includes("screen")) {
    fallbackReply = "Digital screen fatigue is caused by high-energy visible 415-455nm blue light. Our **CyberGuard BlueShield Pro** filters 98% of this radiation with zero yellowish distortion, perfect for long design or programming sessions.";
  } else if (lowerMsg.includes("prescription") || lowerMsg.includes("lens") || lowerMsg.includes("power")) {
    fallbackReply = "All NEXT VISION frames support custom prescription lenses: Single Vision (distance or reading), Bifocals, Progressives, Blue-Cut, and Photochromic Transition lenses. You can easily enter your Sphere, Cylinder, and Axis or attach your doctor's slip during checkout.";
  } else {
    fallbackReply = "Welcome to NEXT VISION. Whether you are seeking precision blue-light protection, ultralight titanium opticals, or polarized sunglasses, I am here to curate your signature eyewear. Try taking our Face Shape Diagnostic Quiz or select any frame to launch the live Virtual Try-On!";
  }

  res.json({
    reply: fallbackReply,
    recommendedProducts: matchingFrames.slice(0, 3)
  });
});

// ==========================================
// 3. ADMIN MANAGEMENT ROUTES (PROTECTED)
// ==========================================

// Partner Admin Self-Registration (Pending Main Admin Verification)
app.post('/api/partner/register', (req, res) => {
  const { name, username, email, phone, storeName, city, address, password, notes } = req.body;
  if (!name || !username || !email || !password || !storeName) {
    return res.status(400).json({ error: 'Full name, desired username, email, password, and optical store name are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  if (/\s/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Username cannot contain spaces. Use letters, numbers, or underscores.' });
  }

  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  try {
    const newPartnerAdmin = db.addPartnerAdmin({
      name,
      username: cleanUsername,
      email,
      phone,
      storeName,
      city: city || 'Lahore',
      address,
      password,
      notes,
      status: 'pending' // Enforce pending status until verified by Main Admin
    });

    db.addAutomationLog(
      'system',
      'Pending',
      `New Partner Admin registration request: ${name} (${storeName}, ${city || 'Lahore'}) - Awaiting Main Admin Verification`,
      { username: cleanUsername, email, phone, storeName }
    );

    res.status(201).json({
      success: true,
      message: 'Admin Partner request submitted successfully! Your account is pending verification from the Main Admin. Once approved, your store will be verified and you can log in.',
      partnerAdmin: newPartnerAdmin
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to register partner admin' });
  }
});

// Admin & Partner Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const cleanUsername = String(username).trim();

  // 1. Check Main Admin (SuperAdmin)
  const isSuperAdminAttempt = cleanUsername.toLowerCase() === 'darmuhammadabubakar9' ||
                              cleanUsername.toLowerCase() === 'admin' ||
                              cleanUsername.toLowerCase() === (db.data.admin?.username || 'darmuhammadabubakar9').toLowerCase();

  if (isSuperAdminAttempt) {
    if (!db.verifyAdminPassword(password)) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const currentAdminUsername = db.data.admin?.username || 'darmuhammadabubakar9';
    const token = jwt.sign(
      { username: currentAdminUsername, role: 'superadmin', name: 'Main Administrator' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        username: currentAdminUsername,
        role: 'superadmin',
        name: 'Main Administrator'
      }
    });
  }

  // 2. Check Partner Admin accounts
  const partnerAdmin = db.getPartnerAdminWithAuth(cleanUsername);
  if (!partnerAdmin) {
    return res.status(401).json({ error: 'Invalid credentials. Account not found.' });
  }

  const isPasswordMatch = bcrypt.compareSync(password, partnerAdmin.passwordHash);
  if (!isPasswordMatch) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Verification Check from Main Admin
  if (partnerAdmin.status === 'pending') {
    return res.status(403).json({
      error: 'Account Pending Verification: Your Partner Admin account is awaiting verification and approval from the Main Admin. Please wait for the Main Administrator to review and approve your account.',
      status: 'pending',
      requiresVerification: true,
      storeName: partnerAdmin.storeName
    });
  }

  if (partnerAdmin.status === 'rejected') {
    return res.status(403).json({
      error: 'Account Registration Declined: Your Partner Admin request was rejected by the Main Admin.' + (partnerAdmin.rejectionReason ? ` Reason: ${partnerAdmin.rejectionReason}` : ''),
      status: 'rejected'
    });
  }

  // Account is Verified!
  const token = jwt.sign(
    {
      id: partnerAdmin.id,
      username: partnerAdmin.username,
      name: partnerAdmin.name,
      role: 'partner_admin',
      storeName: partnerAdmin.storeName,
      status: 'verified'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    token,
    user: {
      id: partnerAdmin.id,
      username: partnerAdmin.username,
      name: partnerAdmin.name,
      role: 'partner_admin',
      storeName: partnerAdmin.storeName,
      city: partnerAdmin.city,
      status: 'verified'
    }
  });
});

// Get Current Authenticated Admin Profile
app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  if (req.admin.role === 'superadmin') {
    return res.json({
      user: {
        username: db.data.admin?.username || 'darmuhammadabubakar9',
        role: 'superadmin',
        name: 'Main Administrator'
      }
    });
  }

  const partnerAdmin = db.getPartnerAdminWithAuth(req.admin.username);
  if (!partnerAdmin) {
    return res.status(404).json({ error: 'Partner admin account not found' });
  }

  res.json({
    user: {
      id: partnerAdmin.id,
      username: partnerAdmin.username,
      name: partnerAdmin.name,
      role: 'partner_admin',
      storeName: partnerAdmin.storeName,
      city: partnerAdmin.city,
      address: partnerAdmin.address,
      phone: partnerAdmin.phone,
      email: partnerAdmin.email,
      status: partnerAdmin.status
    }
  });
});

// Admin Dashboard KPI Stats & Analytics
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  const stats = db.getAnalytics();
  // Partner Admins are restricted: do not expose revenue or orders to partner admins
  if (req.admin.role !== 'superadmin') {
    const { totalRevenue, totalOrders, ...partnerSafeStats } = stats;
    return res.json({ stats: partnerSafeStats });
  }
  res.json({ stats });
});

// Admin Product CRUD
// Image Upload for Products & Project Branding
app.post('/api/admin/upload', authenticateAdmin, (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // If image is already an external HTTP/HTTPS URL, return as-is
    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
      return res.json({ success: true, url: image });
    }

    // Match base64 data URI (e.g. data:image/png;base64,...)
    const matches = typeof image === 'string' ? image.match(/^data:image\/([A-Za-z0-9-+.]+);base64,(.+)$/) : null;
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image format. Expected valid Base64 data URL or HTTP URL' });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext.includes('svg')) ext = 'svg';
    if (ext.includes('webp')) ext = 'webp';
    if (ext.includes('png')) ext = 'png';

    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const targetPath = path.join(uploadsDir, safeName);

    fs.writeFileSync(targetPath, buffer);
    res.json({ success: true, url: `/uploads/${safeName}` });
  } catch (err) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: `Image upload failed: ${err.message}` });
  }
});

app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  const { title, basePrice, category } = req.body;
  if (!title || !basePrice || !category) {
    return res.status(400).json({ error: 'Title, base price, and category are required' });
  }
  const product = db.addProduct(req.body);
  res.status(201).json({ success: true, product });
});

app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, product: updated });
});

app.delete('/api/admin/products/:id', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
});

// Admin Orders Management (Strictly Main Admin / SuperAdmin Only)
app.get('/api/admin/orders', authenticateAdmin, requireSuperAdmin, (req, res) => {
  res.json({ orders: db.getOrders() });
});

app.patch('/api/admin/orders/:id/status', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = db.updateOrderStatus(req.params.id, status, trackingNumber);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, order });
});

// Store Settings & Contact Information (Address, Phone, WhatsApp, Rates - SuperAdmin Only)
app.put('/api/admin/settings', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const settings = db.updateSettings(req.body);
  res.json({ success: true, settings });
});

// ==========================================
// LENS CATEGORIES & OPTICS (Customer Choices & Main Admin Management)
// ==========================================

// Public: Get all active lens categories for user customization
app.get('/api/lens-types', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const categories = db.getLensCategories(true);
  res.json({ categories });
});

// Admin: Get all lens categories (active & inactive)
app.get('/api/admin/lens-types', authenticateAdmin, (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const categories = db.getLensCategories(false);
  res.json({ categories });
});

// Admin: Add new custom lens category (SuperAdmin only)
app.post('/api/admin/lens-types', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Lens category name and price are required' });
  }
  const category = db.addLensCategory(req.body);
  db.addAutomationLog('system', 'Success', `Main Admin added new lens category: ${category.name} (Rs. ${category.price})`);
  res.status(201).json({ success: true, category });
});

// Admin: Rename or update lens category (SuperAdmin only)
app.put('/api/admin/lens-types/:id', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const updated = db.updateLensCategory(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Lens category not found' });
  }
  db.addAutomationLog('system', 'Success', `Main Admin updated lens category: ${updated.name} (Rs. ${updated.price})`);
  res.json({ success: true, category: updated });
});

// Admin: Delete custom lens category (SuperAdmin only)
app.delete('/api/admin/lens-types/:id', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const deleted = db.deleteLensCategory(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Lens category not found or already deleted' });
  }
  db.addAutomationLog('system', 'Success', `Main Admin removed lens category ID ${req.params.id}`);
  res.json({ success: true, message: 'Lens category deleted successfully' });
});

// Admin: Reset to default 5 standard lens categories (SuperAdmin only)
app.post('/api/admin/lens-types/reset', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const categories = db.resetLensCategories();
  db.addAutomationLog('system', 'Success', 'Main Admin restored standard 5 optical lens categories');
  res.json({ success: true, categories });
});

// Admin Partner Stores Management (Add, Edit, Delete Partner Stores - SuperAdmin Only)
app.post('/api/admin/partner-stores', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const { name, city, address, phone } = req.body;
  if (!name || !city || !address || !phone) {
    return res.status(400).json({ error: 'Store name, city, address, and phone number are required' });
  }

  const store = db.addPartnerStore(req.body);
  res.status(201).json({ success: true, store });
});

app.put('/api/admin/partner-stores/:id', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const updated = db.updatePartnerStore(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Partner store not found' });
  }
  res.json({ success: true, store: updated });
});

app.delete('/api/admin/partner-stores/:id', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const deleted = db.deletePartnerStore(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Partner store not found or already deleted' });
  }
  res.json({ success: true, message: 'Partner store deleted successfully' });
});

// ==========================================
// ADMIN EYESIGHT BOOKINGS MANAGEMENT
// ==========================================

// Admin: Get Eyesight Bookings (Filtered to specific partner for Partner Admin, or all for SuperAdmin)
app.get('/api/admin/eyesight-bookings', authenticateAdmin, (req, res) => {
  const { status, search, storeName: queryStoreName, shopId } = req.query;

  // If user is Partner Admin: strictly restrict to their chosen partner clinic/store
  if (req.admin.role !== 'superadmin') {
    const partnerAdmin = db.getPartnerAdminWithAuth(req.admin.username);
    const clinicStoreName = partnerAdmin?.storeName || req.admin.storeName || '';
    const bookings = db.getEyesightBookings({
      storeName: clinicStoreName,
      status,
      search
    });
    return res.json({
      bookings,
      clinicStoreName,
      isPartnerAdmin: true
    });
  }

  // If user is SuperAdmin: can view all or filter by queryStoreName/shopId
  const bookings = db.getEyesightBookings({
    shopId,
    storeName: queryStoreName,
    status,
    search
  });
  res.json({
    bookings,
    isSuperAdmin: true
  });
});

// Admin: Update Eyesight Booking Status (Confirm, Complete, Cancel)
app.patch('/api/admin/eyesight-bookings/:id/status', authenticateAdmin, (req, res) => {
  const { status, notes } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const booking = db.getEyesightBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Eyesight booking not found' });
  }

  // If partner admin, ensure booking belongs to their store
  if (req.admin.role !== 'superadmin') {
    const partnerAdmin = db.getPartnerAdminWithAuth(req.admin.username);
    const clinicStoreName = partnerAdmin?.storeName || req.admin.storeName || '';
    if ((booking.shopName || '').toLowerCase().trim() !== clinicStoreName.toLowerCase().trim()) {
      return res.status(403).json({ error: 'Unauthorized: You can only update bookings for your own clinic' });
    }
  }

  const updated = db.updateEyesightBookingStatus(req.params.id, status, notes);
  db.addAutomationLog(
    'eyesight_booking',
    'Status Updated',
    `Booking ${req.params.id} for "${updated.customerName}" at "${updated.shopName}" marked as ${status}`
  );
  res.json({ success: true, booking: updated });
});

// Admin: Delete Eyesight Booking
app.delete('/api/admin/eyesight-bookings/:id', authenticateAdmin, (req, res) => {
  const booking = db.getEyesightBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Eyesight booking not found' });
  }

  // If partner admin, ensure booking belongs to their store
  if (req.admin.role !== 'superadmin') {
    const partnerAdmin = db.getPartnerAdminWithAuth(req.admin.username);
    const clinicStoreName = partnerAdmin?.storeName || req.admin.storeName || '';
    if ((booking.shopName || '').toLowerCase().trim() !== clinicStoreName.toLowerCase().trim()) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete bookings for your own clinic' });
    }
  }

  const success = db.deleteEyesightBooking(req.params.id);
  res.json({ success, message: 'Booking removed successfully' });
});

// ==========================================
// PARTNER ADMIN ACCOUNTS MANAGEMENT (VERIFICATION & ACCESS CONTROL)
// ==========================================

// List all Partner Admin Accounts & Verification Status (Main Admin only)
app.get('/api/admin/partner-admins', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const partnerAdmins = db.getPartnerAdmins();
  const pendingCount = partnerAdmins.filter(pa => pa.status === 'pending').length;
  res.json({
    success: true,
    partnerAdmins,
    pendingCount
  });
});

// Add Partner Admin directly (Main Admin provision)
app.post('/api/admin/partner-admins', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const { name, username, email, password, storeName, city, phone, address, notes, isDirectlyVerified } = req.body;
  if (!name || !username || !email || !password || !storeName) {
    return res.status(400).json({ error: 'Name, username, email, password, and store name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const verified = isDirectlyVerified !== false;
    const partnerAdmin = db.addPartnerAdmin({
      name,
      username,
      email,
      password,
      storeName,
      city,
      phone,
      address,
      notes,
      isDirectlyVerified: verified,
      verifiedBy: verified ? req.admin.username : null
    });

    db.addAutomationLog(
      'system',
      'Success',
      `Partner Admin account manually created by Main Admin: ${partnerAdmin.name} (${partnerAdmin.storeName}) - Status: ${partnerAdmin.status}`
    );

    res.status(201).json({ success: true, partnerAdmin });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create partner admin' });
  }
});

// Verify & Approve Partner Admin (Main Admin action)
app.patch('/api/admin/partner-admins/:id/verify', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const verified = db.verifyPartnerAdmin(req.params.id, req.admin.username || 'admin');
  if (!verified) {
    return res.status(404).json({ error: 'Partner admin account not found' });
  }

  db.addAutomationLog(
    'system',
    'Success',
    `Partner Admin verified & approved by Main Admin: ${verified.name} (${verified.storeName})`
  );

  res.json({
    success: true,
    message: `Partner Admin "${verified.name}" is now verified and can log in to the dashboard.`,
    partnerAdmin: verified
  });
});

// Reject Partner Admin registration (Main Admin action)
app.patch('/api/admin/partner-admins/:id/reject', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const reason = req.body.reason || 'Declined by Main Administrator.';
  const rejected = db.rejectPartnerAdmin(req.params.id, reason);
  if (!rejected) {
    return res.status(404).json({ error: 'Partner admin account not found' });
  }

  db.addAutomationLog(
    'system',
    'Pending',
    `Partner Admin rejected by Main Admin: ${rejected.name} (${rejected.storeName}) - Reason: ${reason}`
  );

  res.json({
    success: true,
    message: `Partner Admin "${rejected.name}" application rejected.`,
    partnerAdmin: rejected
  });
});

// Delete Partner Admin account (Main Admin action)
app.delete('/api/admin/partner-admins/:id', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const deleted = db.deletePartnerAdmin(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Partner admin not found or already removed' });
  }

  db.addAutomationLog(
    'system',
    'Pending',
    `Partner Admin account deleted by Main Admin: ID ${req.params.id}`
  );

  res.json({ success: true, message: 'Partner admin account removed successfully' });
});

// Admin Password Update (Strictly isolated: Partner Admin can only change their personal credentials)
app.post('/api/admin/change-password', authenticateAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  // 1. SuperAdmin changes the master store administration password
  if (req.admin.role === 'superadmin') {
    if (!db.verifyAdminPassword(currentPassword)) {
      return res.status(401).json({ error: 'Current password does not match' });
    }

    db.updateAdminPassword(newPassword);
    db.addAutomationLog(
      'system',
      'Success',
      `Main Admin (${req.admin.username}) updated master store administrator password`
    );
    return res.json({ success: true, message: 'Main Admin password updated successfully' });
  } 
  
  // 2. Partner Admin can ONLY change their personal partner password (isolated from main admin)
  if (req.admin.role === 'partner_admin') {
    const partner = db.getPartnerAdminWithAuth(req.admin.username);
    if (!partner) {
      return res.status(404).json({ error: 'Partner admin account not found' });
    }

    if (!bcrypt.compareSync(currentPassword, partner.passwordHash)) {
      return res.status(401).json({ error: 'Current password does not match' });
    }

    db.updatePartnerAdminPassword(req.admin.username, newPassword);
    db.addAutomationLog(
      'system',
      'Success',
      `Partner Admin (@${partner.username}) updated personal account password`
    );
    return res.json({ success: true, message: 'Your personal Partner Admin password has been updated successfully' });
  }

  return res.status(403).json({ error: 'Unauthorized to update credentials' });
});

// ==========================================
// 4. BUSINESS AUTOMATIONS (GOOGLE SHEETS & CSV)
// ==========================================

// Get Automation Activity Logs (SuperAdmin only)
app.get('/api/admin/automation/logs', authenticateAdmin, requireSuperAdmin, (req, res) => {
  res.json({ logs: db.getAutomationLogs() });
});

// Test Google Sheets Webhook with sample ping (SuperAdmin only)
app.post('/api/admin/automation/google-sheets/test', authenticateAdmin, requireSuperAdmin, async (req, res) => {
  const { webhookUrl } = req.body;
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Valid Google Sheets Webhook URL required (starts with https://)' });
  }

  const testPayload = {
    action: 'ping_test',
    timestamp: new Date().toISOString(),
    orderId: 'TEST-00001',
    customerName: 'NEXT VISION Test Customer',
    phone: '+92 300 0000000',
    email: 'test@nextvision.pk',
    address: 'Test Promenade, Lahore',
    city: 'Lahore',
    items: 'Aura Obsidian Square (Matte Black) x1',
    lensPackage: 'Cyber Blue-Cut Nano-Shield',
    prescription: 'OD(SPH:-1.00) OS(SPH:-1.00) PD:63mm',
    subtotal: 4600,
    shipping: 0,
    total: 4600,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'Verified Test'
  };

  try {
    const pingRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      redirect: 'follow'
    });

    const bodyText = await pingRes.text();
    if (pingRes.status === 401 || bodyText.includes('accounts.google.com') || bodyText.includes('signin/identifier')) {
      const errMsg = 'Google Sheets Webhook 401: Google Apps Script Web App is deployed with restricted access. To fix, in your Google Apps Script, click: Deploy > Manage deployments > Edit (pencil icon) > change "Who has access" to "Anyone" > Deploy.';
      db.addAutomationLog('google_sheets', 'Failed', `Test ping failed: Deployment access restricted (requires "Anyone"). HTTP ${pingRes.status}`);
      return res.status(401).json({ error: errMsg, requiresPublicAccess: true });
    }

    db.addAutomationLog('google_sheets', 'Success', `Manual test ping successfully dispatched to Google Sheets webhook. HTTP ${pingRes.status}`);
    res.json({ success: true, message: `Ping dispatched successfully. Response status: ${pingRes.status}`, responsePreview: bodyText.slice(0, 150) });
  } catch (err) {
    db.addAutomationLog('google_sheets', 'Failed', `Test ping failed: ${err.message}`);
    res.status(500).json({ error: `Connection failed: ${err.message}` });
  }
});

// Export all orders as CSV (Direct import to Google Sheets or Excel - SuperAdmin only)
app.get('/api/admin/orders/export-csv', authenticateAdmin, requireSuperAdmin, (req, res) => {
  const csv = db.exportOrdersToCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="nextvision-orders-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

// Start Express Server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[NEXT VISION] API Server running securely on http://localhost:${PORT}`);
  });
}

export default app;
export { app };
