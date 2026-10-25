import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { INITIAL_PARTNER_STORES } from './initialStores.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'db.json');
const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'db.json')
  : LOCAL_DB_PATH;

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    title: "Aura Obsidian Square",
    sku: "AK-OPT-001",
    category: "Prescription Glasses",
    frameShape: "Square",
    material: "Italian Mazzucchelli Acetate",
    gender: "Unisex",
    basePrice: 5800,
    salePrice: 4600,
    stock: 24,
    rating: 4.9,
    reviewsCount: 38,
    isBestseller: true,
    isFeatured: true,
    description: "Architectural precision meets effortless minimalism. Hand-polished obsidian black acetate featuring custom 5-barrel hinges and spring-flex temples.",
    dimensions: { lensWidth: 52, bridgeWidth: 18, templeLength: 140 },
    faceShapesRecommended: ["Round", "Oval", "Heart"],
    colors: [
      { name: "Matte Black", hex: "#121215" },
      { name: "Amber Tortoise", hex: "#5c3a21" },
      { name: "Crystal Smoke", hex: "#787882" }
    ],
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "square_acetate",
    vtoOverlayColor: "#121215",
    vtoScaleMultiplier: 1.05,
    vtoVerticalOffset: 0
  },
  {
    id: "p2",
    title: "Aviator Horizon Gold",
    sku: "AK-SUN-002",
    category: "Sunglasses",
    frameShape: "Aviator",
    material: "Electroplated Stainless Steel",
    gender: "Men",
    basePrice: 7200,
    salePrice: 5900,
    stock: 18,
    rating: 4.8,
    reviewsCount: 52,
    isBestseller: true,
    isFeatured: true,
    description: "Iconic teardrop aviator silhouette engineered with ultra-lightweight aerospace alloy, polarized UV400 gradient lenses, and silicone air-cushion nose pads.",
    dimensions: { lensWidth: 58, bridgeWidth: 14, templeLength: 145 },
    faceShapesRecommended: ["Square", "Oval", "Heart"],
    colors: [
      { name: "Champagne Gold / Emerald Green", hex: "#d4af37" },
      { name: "Gunmetal / Midnight Blue", hex: "#2f3542" },
      { name: "Matte Silver / Mirror Silver", hex: "#c0c0c0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "aviator",
    vtoOverlayColor: "#d4af37",
    vtoScaleMultiplier: 1.15,
    vtoVerticalOffset: 2
  },
  {
    id: "p3",
    title: "Solstice Amber Cat-Eye",
    sku: "AK-OPT-003",
    category: "Prescription Glasses",
    frameShape: "Cat-Eye",
    material: "Bio-Cellulose Acetate",
    gender: "Women",
    basePrice: 6500,
    salePrice: 5200,
    stock: 15,
    rating: 5.0,
    reviewsCount: 29,
    isBestseller: false,
    isFeatured: true,
    description: "Subtle vintage flair redefined for modern elegance. Uplifting cat-eye corners sculpt cheekbones and add refined glamour to any everyday outfit.",
    dimensions: { lensWidth: 53, bridgeWidth: 16, templeLength: 140 },
    faceShapesRecommended: ["Round", "Diamond", "Square"],
    colors: [
      { name: "Amber Tortoise", hex: "#8c4d1f" },
      { name: "Blush Rose Quartz", hex: "#e8b4b8" },
      { name: "Midnight Onyx", hex: "#0f0f11" }
    ],
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "cateye",
    vtoOverlayColor: "#8c4d1f",
    vtoScaleMultiplier: 1.08,
    vtoVerticalOffset: -2
  },
  {
    id: "p4",
    title: "Titan Ultralight Rimless",
    sku: "AK-OPT-004",
    category: "Prescription Glasses",
    frameShape: "Rectangle",
    material: "Pure Japanese Beta-Titanium",
    gender: "Unisex",
    basePrice: 8900,
    salePrice: 7500,
    stock: 12,
    rating: 4.9,
    reviewsCount: 44,
    isBestseller: true,
    isFeatured: true,
    description: "Featherweight luxury weighing only 8.6 grams. Screwless hinge engineering and Japanese beta-titanium memory wire provide all-day zero-pressure comfort.",
    dimensions: { lensWidth: 51, bridgeWidth: 19, templeLength: 142 },
    faceShapesRecommended: ["Oval", "Round", "Diamond"],
    colors: [
      { name: "Brushed Gunmetal", hex: "#4b4b52" },
      { name: "Champagne Satin", hex: "#d4af37" },
      { name: "Platinum Silver", hex: "#e2e2e8" }
    ],
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "rimless",
    vtoOverlayColor: "#4b4b52",
    vtoScaleMultiplier: 1.0,
    vtoVerticalOffset: 0
  },
  {
    id: "p5",
    title: "CyberGuard BlueShield Pro",
    sku: "AK-BLU-005",
    category: "Blue-Light Glasses",
    frameShape: "Round",
    material: "TR90 Ultra-Flex Polymer",
    gender: "Unisex",
    basePrice: 4500,
    salePrice: 3500,
    stock: 45,
    rating: 4.8,
    reviewsCount: 89,
    isBestseller: true,
    isFeatured: true,
    description: "Engineered for coders, designers, and screen power-users. Filters 98% of harmful 415-455nm blue light with zero color tinting and anti-glare nano-coating.",
    dimensions: { lensWidth: 50, bridgeWidth: 20, templeLength: 142 },
    faceShapesRecommended: ["Square", "Diamond", "Heart"],
    colors: [
      { name: "Crystal Transparent", hex: "#d0d5dd" },
      { name: "Frosted Smoke", hex: "#475467" },
      { name: "Matte Black", hex: "#1d2939" }
    ],
    images: [
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "round",
    vtoOverlayColor: "#344054",
    vtoScaleMultiplier: 1.03,
    vtoVerticalOffset: 0
  },
  {
    id: "p6",
    title: "Royal Clubmaster Browline",
    sku: "AK-OPT-006",
    category: "Prescription Glasses",
    frameShape: "Geometric",
    material: "Handcrafted Acetate & Monel Metal",
    gender: "Men",
    basePrice: 6800,
    salePrice: 5400,
    stock: 20,
    rating: 4.7,
    reviewsCount: 31,
    isBestseller: false,
    isFeatured: false,
    description: "The intellectual classic with a bold upper acetate brow and polished gold rim wire. Equipped with adjustable jade-tone hypoallergenic nose pads.",
    dimensions: { lensWidth: 51, bridgeWidth: 21, templeLength: 145 },
    faceShapesRecommended: ["Oval", "Round", "Diamond"],
    colors: [
      { name: "Ebony & 18K Gold", hex: "#0f0f11" },
      { name: "Vintage Tortoise & Gold", hex: "#633e21" }
    ],
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "clubmaster",
    vtoOverlayColor: "#0f0f11",
    vtoScaleMultiplier: 1.05,
    vtoVerticalOffset: -1
  },
  {
    id: "p7",
    title: "Vanguard Octagon Gold",
    sku: "AK-OPT-007",
    category: "Prescription Glasses",
    frameShape: "Geometric",
    material: "Forged Titanium Wire",
    gender: "Women",
    basePrice: 7800,
    salePrice: 6200,
    stock: 14,
    rating: 4.9,
    reviewsCount: 19,
    isBestseller: false,
    isFeatured: true,
    description: "Geometric octagonal lines that frame the eyes with sculptured symmetry. Ultra-fine laser-etched filigree pattern along the temples.",
    dimensions: { lensWidth: 49, bridgeWidth: 21, templeLength: 142 },
    faceShapesRecommended: ["Round", "Oval", "Heart"],
    colors: [
      { name: "Warm Gold", hex: "#d4af37" },
      { name: "Rose Gold", hex: "#b76e79" }
    ],
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "octagon",
    vtoOverlayColor: "#d4af37",
    vtoScaleMultiplier: 1.02,
    vtoVerticalOffset: 0
  },
  {
    id: "p8",
    title: "Eclipse Polarized Wayfarer",
    sku: "AK-SUN-008",
    category: "Sunglasses",
    frameShape: "Square",
    material: "Recycled Ocean Plastic & Acetate",
    gender: "Men",
    basePrice: 5900,
    salePrice: 4800,
    stock: 30,
    rating: 4.8,
    reviewsCount: 67,
    isBestseller: true,
    isFeatured: false,
    description: "A sustainable take on the timeless summer silhouette. 100% glare-eliminating polarized TAC lenses with hydrophobic anti-saltwater coating.",
    dimensions: { lensWidth: 54, bridgeWidth: 18, templeLength: 145 },
    faceShapesRecommended: ["Round", "Oval", "Heart"],
    colors: [
      { name: "Matte Charcoal", hex: "#1c1c1e" },
      { name: "Deep Navy Blue", hex: "#1c2b46" },
      { name: "Olive Moss", hex: "#2f3d2f" }
    ],
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"
    ],
    vtoOverlayType: "wayfarer",
    vtoOverlayColor: "#1c1c1e",
    vtoScaleMultiplier: 1.08,
    vtoVerticalOffset: 1
  }
];

const INITIAL_SETTINGS = {
  storeName: "NEXT VISION",
  tagline: "Pakistan's Premier Eyewear Destination",
  address: "Shop 14, Luxury Promenade, MM Alam Road, Gulberg III, Lahore, Pakistan",
  phone: "+92 42 35789012",
  whatsapp: "+92 305 4323059",
  email: "concierge@nextvision.pk",
  shippingFee: 250,
  freeShippingThreshold: 5000,
  usdExchangeRate: 0.0036,
  googleSheetsWebhookUrl: "https://script.google.com/macros/s/AKfycbxbNv9TipAFhOGvNgkkroAE5XbG0eI8BnTusyc49buQyio3ftSf2r9Uu4OqSNf1VBBz/exec",
  autoSyncGoogleSheets: true,
  autoWhatsAppNotification: true
};

const INITIAL_ORDERS = [
  {
    id: "ORD-94812",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customer: {
      name: "Hamza Tariq",
      email: "hamza.tariq@gmail.com",
      phone: "+92 321 4455667",
      address: "House 24-B, Street 7, Phase 5, DHA",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54792"
    },
    items: [
      {
        productId: "p1",
        title: "Aura Obsidian Square",
        color: "Matte Black",
        price: 4600,
        quantity: 1,
        lensOption: {
          type: "Blue-Cut Anti-Glare Lenses",
          price: 1500,
          prescriptionType: "Single Vision",
          sphereR: "-1.50",
          sphereL: "-1.25",
          cylR: "0.00",
          cylL: "-0.50",
          axisR: "0",
          axisL: "90",
          pd: "63mm"
        }
      }
    ],
    subtotal: 6100,
    shippingFee: 0,
    total: 6100,
    paymentMethod: "Cash on Delivery (COD)",
    status: "Confirmed",
    notes: "Call before delivery"
  },
  {
    id: "ORD-94813",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    customer: {
      name: "Ayesha Siddiqui",
      email: "ayesha.s@outlook.com",
      phone: "+92 333 9876543",
      address: "Apartment 402, Clifton View, Block 4, Clifton",
      city: "Karachi",
      province: "Sindh",
      postalCode: "75600"
    },
    items: [
      {
        productId: "p3",
        title: "Solstice Amber Cat-Eye",
        color: "Amber Tortoise",
        price: 5200,
        quantity: 1,
        lensOption: {
          type: "Standard Clear UV Lenses (Zero Power)",
          price: 0
        }
      }
    ],
    subtotal: 5200,
    shippingFee: 0,
    total: 5200,
    paymentMethod: "Credit / Debit Card (Online)",
    status: "Shipped",
    trackingNumber: "TCS-9928172635"
  }
];

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (process.env.VERCEL && !fs.existsSync(DB_PATH) && fs.existsSync(LOCAL_DB_PATH)) {
        try {
          fs.copyFileSync(LOCAL_DB_PATH, DB_PATH);
        } catch (copyErr) {
          console.warn("Notice: could not copy seed db.json to /tmp:", copyErr.message);
        }
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.settings = { ...INITIAL_SETTINGS, ...(parsed.settings || {}) };
        parsed.partnerStores = (parsed.partnerStores || []).filter(s => s.isAdminAdded);
        parsed.partnerAdmins = [];
        parsed.automationLogs = (parsed.automationLogs || []).filter(
          l => !l.message?.toLowerCase().includes('partner admin')
        );
        return parsed;
      }
    } catch (err) {
      console.error("Error reading db.json, falling back to defaults:", err);
    }

    const defaultAdminHash = bcrypt.hashSync("admin123456", 10);
    const initialData = {
      admin: {
        username: "admin",
        passwordHash: defaultAdminHash
      },
      partnerAdmins: [],
      settings: INITIAL_SETTINGS,
      products: INITIAL_PRODUCTS,
      partnerStores: INITIAL_PARTNER_STORES,
      orders: INITIAL_ORDERS,
      analytics: {
        pageViews: 1420,
        tryOnSessions: 384,
        addToCartCount: 215,
        ordersCompleted: 2
      }
    };
    this.saveData(initialData);
    return initialData;
  }

  getInitialPartnerAdmins() {
    return [];
  }

  saveData(dataToSave) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn("Notice: db.json write skipped or failed (common in serverless):", err.message);
    }
  }

  save() {
    this.saveData(this.data);
  }

  // --- Products ---
  getProducts() {
    return this.data.products;
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(productData) {
    const newProduct = {
      id: "p" + Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      isBestseller: false,
      isFeatured: false,
      images: productData.images && productData.images.length > 0 
        ? productData.images 
        : ["https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80"],
      dimensions: productData.dimensions || { lensWidth: 52, bridgeWidth: 18, templeLength: 140 },
      colors: productData.colors || [{ name: "Classic Black", hex: "#121215" }],
      faceShapesRecommended: productData.faceShapesRecommended || ["Oval", "Round"],
      vtoOverlayType: productData.vtoOverlayType || "square_acetate",
      vtoOverlayColor: productData.vtoOverlayColor || "#121215",
      vtoScaleMultiplier: Number(productData.vtoScaleMultiplier) || 1.05,
      vtoVerticalOffset: Number(productData.vtoVerticalOffset) || 0,
      ...productData
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id, updates) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.save();
    return this.data.products[index];
  }

  deleteProduct(id) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.save();
    return true;
  }

  // --- Orders ---
  getOrders() {
    return this.data.orders;
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(orderData) {
    const newOrder = {
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
      status: "Pending",
      ...orderData
    };
    this.data.orders.unshift(newOrder);
    this.data.analytics.ordersCompleted += 1;
    this.save();
    return newOrder;
  }

  updateOrderStatus(id, status, trackingNumber = "") {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    this.save();
    return order;
  }

  // --- Store Settings ---
  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // --- Admin Auth ---
  verifyAdminPassword(password) {
    return bcrypt.compareSync(password, this.data.admin.passwordHash);
  }

  updateAdminPassword(newPassword) {
    this.data.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    this.save();
    return true;
  }

  // --- Partner Admins Management (Requires Main Admin Verification) ---
  getPartnerAdmins() {
    if (!this.data.partnerAdmins) {
      this.data.partnerAdmins = [];
    }
    // Return sanitized partner admins without passwordHash
    return this.data.partnerAdmins.map(pa => {
      const { passwordHash, ...safePartnerAdmin } = pa;
      return safePartnerAdmin;
    });
  }

  getPartnerAdminById(id) {
    if (!this.data.partnerAdmins) this.data.partnerAdmins = [];
    const found = this.data.partnerAdmins.find(pa => pa.id === id);
    if (!found) return null;
    const { passwordHash, ...safePartnerAdmin } = found;
    return safePartnerAdmin;
  }

  getPartnerAdminWithAuth(username) {
    if (!this.data.partnerAdmins) this.data.partnerAdmins = [];
    const cleanUsername = String(username).trim().toLowerCase();
    return this.data.partnerAdmins.find(pa => pa.username.toLowerCase() === cleanUsername);
  }

  addPartnerAdmin(partnerData) {
    if (!this.data.partnerAdmins) this.data.partnerAdmins = [];

    const cleanUsername = String(partnerData.username).trim().toLowerCase();

    if (cleanUsername === 'admin') {
      throw new Error('Username "admin" is reserved for the Main Administrator.');
    }

    const existing = this.data.partnerAdmins.find(
      pa => pa.username.toLowerCase() === cleanUsername ||
            (partnerData.email && pa.email && pa.email.toLowerCase() === String(partnerData.email).trim().toLowerCase())
    );

    if (existing) {
      if (existing.username.toLowerCase() === cleanUsername) {
        throw new Error(`Username "${partnerData.username}" is already taken.`);
      }
      throw new Error(`Email "${partnerData.email}" is already registered.`);
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(partnerData.password, salt);
    const isDirectlyVerified = partnerData.isDirectlyVerified === true || partnerData.status === 'verified';

    const newPartnerAdmin = {
      id: 'padmin-' + Date.now(),
      name: String(partnerData.name).trim(),
      username: String(partnerData.username).trim(),
      email: String(partnerData.email).trim().toLowerCase(),
      phone: String(partnerData.phone || '').trim(),
      storeName: String(partnerData.storeName || '').trim(),
      city: String(partnerData.city || 'Lahore').trim(),
      address: String(partnerData.address || '').trim(),
      role: 'partner_admin',
      status: isDirectlyVerified ? 'verified' : 'pending',
      notes: partnerData.notes ? String(partnerData.notes).trim() : '',
      rejectionReason: null,
      createdAt: new Date().toISOString(),
      verifiedAt: isDirectlyVerified ? new Date().toISOString() : null,
      verifiedBy: isDirectlyVerified ? (partnerData.verifiedBy || 'admin') : null
    };

    this.data.partnerAdmins.unshift({
      ...newPartnerAdmin,
      passwordHash
    });

    this.save();

    const { ...safeAdmin } = newPartnerAdmin;
    return safeAdmin;
  }

  verifyPartnerAdmin(id, verifiedBy = 'admin') {
    if (!this.data.partnerAdmins) this.data.partnerAdmins = [];
    const index = this.data.partnerAdmins.findIndex(pa => pa.id === id);
    if (index === -1) return null;

    this.data.partnerAdmins[index].status = 'verified';
    this.data.partnerAdmins[index].verifiedAt = new Date().toISOString();
    this.data.partnerAdmins[index].verifiedBy = verifiedBy;
    this.data.partnerAdmins[index].rejectionReason = null;
    this.save();

    const { passwordHash, ...safePartnerAdmin } = this.data.partnerAdmins[index];
    return safePartnerAdmin;
  }

  rejectPartnerAdmin(id, reason = 'Registration request declined by Main Administrator.') {
    if (!this.data.partnerAdmins) this.data.partnerAdmins = [];
    const index = this.data.partnerAdmins.findIndex(pa => pa.id === id);
    if (index === -1) return null;

    this.data.partnerAdmins[index].status = 'rejected';
    this.data.partnerAdmins[index].rejectionReason = reason;
    this.data.partnerAdmins[index].verifiedAt = null;
    this.data.partnerAdmins[index].verifiedBy = null;
    this.save();

    const { passwordHash, ...safePartnerAdmin } = this.data.partnerAdmins[index];
    return safePartnerAdmin;
  }

  deletePartnerAdmin(id) {
    if (!this.data.partnerAdmins) this.data.partnerAdmins = [];
    const initialLength = this.data.partnerAdmins.length;
    this.data.partnerAdmins = this.data.partnerAdmins.filter(pa => pa.id !== id);
    this.save();
    return this.data.partnerAdmins.length < initialLength;
  }

  updatePartnerAdminPassword(username, newPassword) {
    if (!this.data.partnerAdmins) this.data.partnerAdmins = [];
    const index = this.data.partnerAdmins.findIndex(pa => pa.username.toLowerCase() === String(username).toLowerCase());
    if (index === -1) return false;
    this.data.partnerAdmins[index].passwordHash = bcrypt.hashSync(newPassword, 10);
    this.save();
    return true;
  }

  // --- Analytics ---
  incrementAnalytics(metric) {
    if (this.data.analytics[metric] !== undefined) {
      this.data.analytics[metric] += 1;
      this.save();
    }
  }

  getAnalytics() {
    const totalRevenue = this.data.orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const lowStockCount = this.data.products.filter(p => p.stock <= 15).length;

    return {
      ...this.data.analytics,
      totalOrders: this.data.orders.length,
      totalProducts: this.data.products.length,
      totalRevenue,
      lowStockCount
    };
  }

  // --- Business Automations (Google Sheets & WhatsApp) ---
  addAutomationLog(type, status, message, payload = null) {
    if (!this.data.automationLogs) this.data.automationLogs = [];
    const log = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      type, // 'google_sheets' | 'whatsapp' | 'system'
      status, // 'Success' | 'Pending' | 'Failed'
      message,
      payload
    };
    this.data.automationLogs.unshift(log);
    // Keep last 100 logs
    if (this.data.automationLogs.length > 100) {
      this.data.automationLogs = this.data.automationLogs.slice(0, 100);
    }
    this.save();
    return log;
  }

  getAutomationLogs() {
    return this.data.automationLogs || [];
  }

  exportOrdersToCSV() {
    const orders = this.data.orders;
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Email",
      "Address",
      "City",
      "Province",
      "Items",
      "Lens Types",
      "Prescription Specs",
      "Subtotal (PKR)",
      "Shipping (PKR)",
      "Total (PKR)",
      "Payment Method",
      "Status",
      "Tracking Number"
    ];

    const escapeCsv = (val) => {
      const str = String(val || '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = orders.map(o => {
      const itemTitles = o.items.map(i => `${i.title} (${i.color}) x${i.quantity}`).join('; ');
      const lensTypes = o.items.map(i => i.lensOption?.type || 'Standard Clear').join('; ');
      const rxSpecs = o.items.map(i => {
        if (!i.lensOption) return 'None';
        const opt = i.lensOption;
        return [
          opt.prescriptionType ? `Type: ${opt.prescriptionType}` : '',
          opt.sphereR ? `R(SPH:${opt.sphereR}, CYL:${opt.cylR || '0'}, AXIS:${opt.axisR || '0'})` : '',
          opt.sphereL ? `L(SPH:${opt.sphereL}, CYL:${opt.cylL || '0'}, AXIS:${opt.axisL || '0'})` : '',
          opt.pd ? `PD:${opt.pd}` : ''
        ].filter(Boolean).join(' ');
      }).join(' | ');

      return [
        escapeCsv(o.id),
        escapeCsv(o.createdAt),
        escapeCsv(o.customer?.name),
        escapeCsv(o.customer?.phone),
        escapeCsv(o.customer?.email),
        escapeCsv(o.customer?.address),
        escapeCsv(o.customer?.city),
        escapeCsv(o.customer?.province),
        escapeCsv(itemTitles),
        escapeCsv(lensTypes),
        escapeCsv(rxSpecs),
        o.subtotal || 0,
        o.shippingFee || 0,
        o.total || 0,
        escapeCsv(o.paymentMethod),
        escapeCsv(o.status),
        escapeCsv(o.trackingNumber || 'Unassigned')
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // --- Partner Stores (Added & Managed through Admin Portal) ---
  getPartnerStores(query = {}) {
    let stores = this.data.partnerStores || [];
    const { city, search } = query;
    if (city && city !== 'All') {
      stores = stores.filter(s => s.city.toLowerCase() === String(city).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      stores = stores.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.services && s.services.some(svc => svc.toLowerCase().includes(q)))
      );
    }
    return stores;
  }

  getPartnerStoreById(id) {
    return (this.data.partnerStores || []).find(s => s.id === id);
  }

  addPartnerStore(storeData) {
    this.data.partnerStores = this.data.partnerStores || [];
    const newStore = {
      id: 'store-' + Date.now(),
      name: storeData.name,
      type: storeData.type || 'Authorized Partner',
      address: storeData.address,
      city: storeData.city || 'Lahore',
      province: storeData.province || 'Punjab',
      phone: storeData.phone || '+92 42 35789012',
      whatsapp: storeData.whatsapp || storeData.phone || '+92 305 4323059',
      timings: storeData.timings || '10:00 AM - 10:00 PM (Daily)',
      lat: Number(storeData.lat) || 31.5204,
      lng: Number(storeData.lng) || 74.3587,
      rating: Number(storeData.rating) || 4.8,
      reviewsCount: Number(storeData.reviewsCount) || 1,
      image: storeData.image || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
      services: Array.isArray(storeData.services) && storeData.services.length > 0 ? storeData.services : [
        'Computerized Eye Exam',
        'Same-Day Lens Fitting'
      ],
      hasFreeEyeTest: Boolean(storeData.hasFreeEyeTest),
      hasTryOnKiosk: Boolean(storeData.hasTryOnKiosk),
      hasSameDayLenses: Boolean(storeData.hasSameDayLenses),
      isOpenNow: storeData.isOpenNow !== undefined ? Boolean(storeData.isOpenNow) : true,
      isAdminAdded: true,
      createdAt: new Date().toISOString()
    };
    this.data.partnerStores.unshift(newStore);
    this.save();
    return newStore;
  }

  updatePartnerStore(id, storeData) {
    this.data.partnerStores = this.data.partnerStores || [];
    const index = this.data.partnerStores.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.partnerStores[index] = {
      ...this.data.partnerStores[index],
      ...storeData,
      id,
      lat: storeData.lat !== undefined ? Number(storeData.lat) : this.data.partnerStores[index].lat,
      lng: storeData.lng !== undefined ? Number(storeData.lng) : this.data.partnerStores[index].lng,
      rating: storeData.rating !== undefined ? Number(storeData.rating) : this.data.partnerStores[index].rating,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.partnerStores[index];
  }

  deletePartnerStore(id) {
    this.data.partnerStores = this.data.partnerStores || [];
    const initialLength = this.data.partnerStores.length;
    this.data.partnerStores = this.data.partnerStores.filter(s => s.id !== id);
    this.save();
    return this.data.partnerStores.length < initialLength;
  }
}

export const db = new Database();
