import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, LogOut, Package, ShoppingCart, Settings,
  DollarSign, TrendingUp, Users, AlertTriangle, Plus, Edit, Trash2,
  Check, X, Eye, Phone, MapPin, Key, RefreshCw, FileSpreadsheet,
  Download, Copy, ExternalLink, MessageCircle, Send, CheckCircle2, Sparkles,
  Upload, Image as ImageIcon, Link as LinkIcon, Star, Compass,
  UserCheck, UserX, Clock, Building, Mail, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { Product, Order, StoreSettings, AutomationLog, OpticalShop, PartnerAdminAccount, AdminUser } from '../../types';
import { formatCurrency } from '../../utils/format';

const LUXURY_PRESET_IMAGES = [
  { label: 'Obsidian Square Acetate', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gold Teardrop Aviator', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Amber Tortoise Cat-Eye', url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80' },
  { label: 'Japanese Beta-Titanium', url: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cyber BlueShield Round', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80' },
  { label: 'Heritage Horn-Rimmed', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' }
];

interface AdminDashboardProps {
  onExit: () => void;
  currency: 'PKR' | 'USD';
  exchangeRate: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit, currency, exchangeRate }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nextvision_admin_token') || localStorage.getItem('ainak_admin_token'));
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('nextvision_admin_user') || localStorage.getItem('ainak_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Auth Card Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Partner Self-Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    storeName: '',
    city: 'Lahore',
    address: '',
    password: '',
    confirmPassword: '',
    notes: ''
  });
  const [regStatus, setRegStatus] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Tabs: 'stats' | 'products' | 'orders' | 'partnerStores' | 'partnerAdmins' | 'automation' | 'settings'
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'partnerStores' | 'partnerAdmins' | 'automation' | 'settings'>('stats');

  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [partnerStores, setPartnerStores] = useState<OpticalShop[]>([]);
  const [partnerStoreSearch, setPartnerStoreSearch] = useState('');
  const [editingPartnerStore, setEditingPartnerStore] = useState<Partial<OpticalShop> | null>(null);
  const [isPartnerStoreModalOpen, setIsPartnerStoreModalOpen] = useState(false);
  const [partnerStoreStatus, setPartnerStoreStatus] = useState<{ text: string; isError: boolean } | null>(null);

  // Partner Admins State (Managed & Verified by Main Admin)
  const [partnerAdmins, setPartnerAdmins] = useState<PartnerAdminAccount[]>([]);
  const [pendingAdminsCount, setPendingAdminsCount] = useState<number>(0);
  const [partnerAdminSearch, setPartnerAdminSearch] = useState('');
  const [partnerAdminFilter, setPartnerAdminFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [isAddPartnerAdminModalOpen, setIsAddPartnerAdminModalOpen] = useState(false);
  const [partnerAdminActionStatus, setPartnerAdminActionStatus] = useState<{ text: string; isError: boolean } | null>(null);

  // Main Admin Direct Provisioning Form State
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    storeName: '',
    city: 'Lahore',
    address: '',
    password: '',
    notes: '',
    isDirectlyVerified: true
  });

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [testPingStatus, setTestPingStatus] = useState<{ text: string; isError: boolean } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Product edit/create modal state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'presets'>('upload');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ text: string; isError: boolean } | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Partial<StoreSettings>>({});
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);

  // Load data when authenticated
  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('nextvision_admin_token', data.token);
        if (data.user) {
          localStorage.setItem('nextvision_admin_user', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }
        setToken(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server connection error. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nextvision_admin_token');
    localStorage.removeItem('ainak_admin_token');
    localStorage.removeItem('nextvision_admin_user');
    setCurrentUser(null);
    setToken(null);
  };

  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // 2. Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products);
      }

      // 3. Orders
      const orderRes = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData.orders);
      }

      // 4. Settings
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData.settings);
        setSettingsForm(setData.settings);
      }

      // 5. Automation Logs
      const autoRes = await fetch('/api/admin/automation/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (autoRes.ok) {
        const autoData = await autoRes.json();
        setAutomationLogs(autoData.logs || []);
      }

      // 6. Partner Stores
      const storesRes = await fetch('/api/partner-stores');
      if (storesRes.ok) {
        const storesData = await storesRes.json();
        setPartnerStores(storesData.stores || []);
      }

      // 7. Partner Admins (SuperAdmin only)
      try {
        const partnerAdminsRes = await fetch('/api/admin/partner-admins', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (partnerAdminsRes.ok) {
          const paData = await partnerAdminsRes.json();
          setPartnerAdmins(paData.partnerAdmins || []);
          setPendingAdminsCount(paData.pendingCount || 0);
        }
      } catch (e) {
        // Non-superadmin or network error
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Partner Admin Actions (Main Admin Verification & Management) ---
  const handleVerifyPartnerAdmin = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/partner-admins/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPartnerAdminActionStatus({ text: `Partner Admin "${name}" has been successfully verified!`, isError: false });
        fetchAdminData();
      } else {
        setPartnerAdminActionStatus({ text: data.error || 'Failed to verify partner admin', isError: true });
      }
    } catch (err: any) {
      setPartnerAdminActionStatus({ text: `Network error: ${err.message}`, isError: true });
    }
  };

  const handleRejectPartnerAdmin = async (id: string, name: string) => {
    const reason = prompt(`Enter reason for declining verification for "${name}" (optional):`, "Verification criteria not met or unverified clinic license");
    if (reason === null) return; // user cancelled

    try {
      const res = await fetch(`/api/admin/partner-admins/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        setPartnerAdminActionStatus({ text: `Partner Admin "${name}" status marked as rejected.`, isError: false });
        fetchAdminData();
      } else {
        setPartnerAdminActionStatus({ text: data.error || 'Failed to reject partner admin', isError: true });
      }
    } catch (err: any) {
      setPartnerAdminActionStatus({ text: `Network error: ${err.message}`, isError: true });
    }
  };

  const handleDeletePartnerAdmin = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete partner admin account for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/partner-admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPartnerAdminActionStatus({ text: `Partner admin account removed.`, isError: false });
        setPartnerAdmins(prev => prev.filter(pa => pa.id !== id));
        fetchAdminData();
      } else {
        alert('Could not delete partner admin.');
      }
    } catch (err: any) {
      alert(`Error deleting partner admin: ${err.message}`);
    }
  };

  const handleAddPartnerAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.name || !newPartnerForm.username || !newPartnerForm.email || !newPartnerForm.password || !newPartnerForm.storeName) {
      setPartnerAdminActionStatus({ text: 'Please fill in all required fields (Name, Store, Username, Email, Password).', isError: true });
      return;
    }

    try {
      const res = await fetch('/api/admin/partner-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPartnerForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPartnerAdminActionStatus({
          text: `Partner Admin "${newPartnerForm.name}" created successfully (${newPartnerForm.isDirectlyVerified ? 'Verified' : 'Pending Verification'})!`,
          isError: false
        });
        setIsAddPartnerAdminModalOpen(false);
        setNewPartnerForm({
          name: '',
          username: '',
          email: '',
          phone: '',
          storeName: '',
          city: 'Lahore',
          address: '',
          password: '',
          notes: '',
          isDirectlyVerified: true
        });
        fetchAdminData();
      } else {
        setPartnerAdminActionStatus({ text: data.error || 'Failed to create partner admin', isError: true });
      }
    } catch (err: any) {
      setPartnerAdminActionStatus({ text: `Network error: ${err.message}`, isError: true });
    }
  };

  const handleSelfRegisterPartnerAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus(null);

    if (!regForm.name || !regForm.username || !regForm.email || !regForm.password || !regForm.storeName) {
      setRegStatus({ text: 'Please complete all required fields (Full Name, Store Name, Username, Email, Password).', isSuccess: false });
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      setRegStatus({ text: 'Passwords do not match.', isSuccess: false });
      return;
    }

    if (regForm.password.length < 6) {
      setRegStatus({ text: 'Password must be at least 6 characters long.', isSuccess: false });
      return;
    }

    setIsSubmittingReg(true);
    try {
      const res = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name,
          username: regForm.username,
          email: regForm.email,
          phone: regForm.phone,
          storeName: regForm.storeName,
          city: regForm.city,
          address: regForm.address,
          password: regForm.password,
          notes: regForm.notes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setRegStatus({
          text: data.message || 'Registration request submitted! Your account is pending verification from the Main Admin.',
          isSuccess: true
        });
        setRegForm({
          name: '',
          username: '',
          email: '',
          phone: '',
          storeName: '',
          city: 'Lahore',
          address: '',
          password: '',
          confirmPassword: '',
          notes: ''
        });
      } else {
        setRegStatus({ text: data.error || 'Registration failed.', isSuccess: false });
      }
    } catch (err: any) {
      setRegStatus({ text: 'Network connection error. Please ensure backend is running.', isSuccess: false });
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Google Sheets Ping Test Handler
  const handleTestSheetsPing = async () => {
    const url = settingsForm.googleSheetsWebhookUrl;
    if (!url || !url.startsWith('http')) {
      setTestPingStatus({ text: "Please enter a valid Google Sheets Webhook URL starting with https://", isError: true });
      return;
    }

    setIsTestingPing(true);
    setTestPingStatus(null);
    try {
      const res = await fetch('/api/admin/automation/google-sheets/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ webhookUrl: url })
      });
      const data = await res.json();
      if (res.ok) {
        setTestPingStatus({ text: data.message || "Test order pinged successfully to Google Sheets!", isError: false });
        fetchAdminData();
      } else {
        setTestPingStatus({ text: data.error || "Failed to reach Google Sheets webhook", isError: true });
      }
    } catch (err: any) {
      setTestPingStatus({ text: `Network error: ${err.message}`, isError: true });
    } finally {
      setIsTestingPing(false);
    }
  };

  // Download All Orders as CSV for Google Sheets
  const handleDownloadCSV = async () => {
    try {
      const res = await fetch('/api/admin/orders/export-csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `nextvision-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      alert("Failed to export orders to CSV");
    }
  };

  // Image Upload & Gallery Handlers
  const handleFileUpload = async (file: File, target: 'product' | 'logo' | 'banner') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            image: base64Data,
            filename: file.name
          })
        });

        const data = await res.json();
        const finalUrl = res.ok && data.url ? data.url : base64Data;

        if (target === 'product' && editingProduct) {
          const currentImages = editingProduct.images ? [...editingProduct.images] : [];
          setEditingProduct({
            ...editingProduct,
            images: [...currentImages, finalUrl]
          });
        } else if (target === 'logo') {
          setSettingsForm(prev => ({ ...prev, logoUrl: finalUrl }));
        } else if (target === 'banner') {
          setSettingsForm(prev => ({ ...prev, bannerUrl: finalUrl }));
        }
      } catch (err) {
        // Safe fallback to base64 if network error
        if (target === 'product' && editingProduct) {
          const currentImages = editingProduct.images ? [...editingProduct.images] : [];
          setEditingProduct({
            ...editingProduct,
            images: [...currentImages, base64Data]
          });
        } else if (target === 'logo') {
          setSettingsForm(prev => ({ ...prev, logoUrl: base64Data }));
        } else if (target === 'banner') {
          setSettingsForm(prev => ({ ...prev, bannerUrl: base64Data }));
        }
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      alert('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = (urlToAdd: string) => {
    if (!urlToAdd.trim()) return;
    if (!editingProduct) return;
    const currentImages = editingProduct.images ? [...editingProduct.images] : [];
    setEditingProduct({
      ...editingProduct,
      images: [...currentImages, urlToAdd.trim()]
    });
    setNewImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!editingProduct) return;
    const currentImages = editingProduct.images ? [...editingProduct.images] : [];
    setEditingProduct({
      ...editingProduct,
      images: currentImages.filter((_, i) => i !== indexToRemove)
    });
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    if (!editingProduct) return;
    const currentImages = editingProduct.images ? [...editingProduct.images] : [];
    if (indexToPrimary <= 0 || indexToPrimary >= currentImages.length) return;
    const [selected] = currentImages.splice(indexToPrimary, 1);
    currentImages.unshift(selected);
    setEditingProduct({
      ...editingProduct,
      images: currentImages
    });
  };

  // Product CRUD Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.basePrice) return;

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const imagesToSave = editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80'];

      const payload = {
        ...editingProduct,
        images: imagesToSave
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save product.');
      }
    } catch (err) {
      alert("Failed to save product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you wish to delete this frame from catalog?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // Order Status Handler
  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, trackingNumber })
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert("Status update failed.");
    }
  };

  // Store Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        setSettingsStatus("Store settings updated successfully!");
        setTimeout(() => setSettingsStatus(null), 3000);
        fetchAdminData();
      }
    } catch (err) {
      alert("Failed to save store settings.");
    }
  };

  // --- Partner Store Handlers ---
  const CITY_COORDINATES: Record<string, { lat: number; lng: number; province: string }> = {
    'Lahore': { lat: 31.5204, lng: 74.3587, province: 'Punjab' },
    'Karachi': { lat: 24.8607, lng: 67.0011, province: 'Sindh' },
    'Islamabad': { lat: 33.6844, lng: 73.0479, province: 'Islamabad Capital Territory' },
    'Rawalpindi': { lat: 33.5651, lng: 73.0169, province: 'Punjab' },
    'Faisalabad': { lat: 31.4504, lng: 73.1350, province: 'Punjab' },
    'Multan': { lat: 30.1575, lng: 71.5249, province: 'Punjab' },
    'Peshawar': { lat: 34.0151, lng: 71.5249, province: 'Khyber Pakhtunkhwa' },
    'Sialkot': { lat: 32.4945, lng: 74.5229, province: 'Punjab' },
    'Quetta': { lat: 30.1798, lng: 66.9750, province: 'Balochistan' }
  };

  const handleOpenAddPartnerStore = () => {
    setEditingPartnerStore({
      name: '',
      type: 'Authorized Partner',
      city: 'Lahore',
      province: 'Punjab',
      address: '',
      phone: '+92 42 ',
      whatsapp: '+92 300 ',
      timings: '10:30 AM - 10:00 PM (Daily)',
      lat: 31.5204,
      lng: 74.3587,
      rating: 4.8,
      reviewsCount: 1,
      image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
      services: ['Free Computerized Eye Exam', 'Same-Day Lens Fitting'],
      hasFreeEyeTest: true,
      hasTryOnKiosk: true,
      hasSameDayLenses: true,
      isOpenNow: true
    });
    setPartnerStoreStatus(null);
    setIsPartnerStoreModalOpen(true);
  };

  const handleEditPartnerStore = (store: OpticalShop) => {
    setEditingPartnerStore({ ...store });
    setPartnerStoreStatus(null);
    setIsPartnerStoreModalOpen(true);
  };

  const handleAutofillCityCoords = (city: string) => {
    if (CITY_COORDINATES[city] && editingPartnerStore) {
      setEditingPartnerStore({
        ...editingPartnerStore,
        city,
        province: CITY_COORDINATES[city].province,
        lat: CITY_COORDINATES[city].lat,
        lng: CITY_COORDINATES[city].lng
      });
    }
  };

  const handleSavePartnerStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartnerStore?.name || !editingPartnerStore?.city || !editingPartnerStore?.address || !editingPartnerStore?.phone) {
      setPartnerStoreStatus({ text: 'Please fill in store name, city, address, and contact phone.', isError: true });
      return;
    }

    try {
      const isNew = !editingPartnerStore.id;
      const url = isNew ? '/api/admin/partner-stores' : `/api/admin/partner-stores/${editingPartnerStore.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingPartnerStore)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsPartnerStoreModalOpen(false);
        setEditingPartnerStore(null);
        fetchAdminData();
      } else {
        setPartnerStoreStatus({ text: data.error || 'Failed to save store.', isError: true });
      }
    } catch (err: any) {
      setPartnerStoreStatus({ text: `Network error: ${err.message}`, isError: true });
    }
  };

  const handleDeletePartnerStore = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove partner store "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/partner-stores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPartnerStores(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Could not delete partner store.');
      }
    } catch (err: any) {
      alert(`Error deleting store: ${err.message}`);
    }
  };

  // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ text: "New passwords do not match", isError: true });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordStatus({ text: "Admin password successfully updated!", isError: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({ text: data.error || "Update failed", isError: true });
      }
    } catch (err) {
      setPasswordStatus({ text: "Network error", isError: true });
    }
  };

  // If not logged in, show portal authentication & partner registration card
  if (!token) {
    return (
      <div className="min-h-screen bg-luxury-950 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-luxury-800">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-luxury-950 text-gold flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-luxury-950">NEXT VISION Portal</h2>
            <p className="text-xs text-luxury-500 mt-1">Main Administration & Partner Clinic Management</p>
          </div>

          {/* Mode Switcher: Sign In vs Register Partner Admin */}
          <div className="flex bg-luxury-100 p-1 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setLoginError(null); }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'login'
                  ? 'bg-white text-luxury-950 shadow-sm font-bold'
                  : 'text-luxury-500 hover:text-luxury-950'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-gold" />
              <span>Sign In to Portal</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setRegStatus(null); }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'register'
                  ? 'bg-white text-luxury-950 shadow-sm font-bold'
                  : 'text-luxury-500 hover:text-luxury-950'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-champagne-600" />
              <span>Register Partner Admin</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                Verify Req.
              </span>
            </button>
          </div>

          {/* TAB 1: SIGN IN (Main Admin & Verified Partner Admins) */}
          {authMode === 'login' && (
            <div>
              {/* Quick Preset Credentials Chip Bar for Testing */}
              <div className="mb-5 p-2.5 bg-luxury-50 border border-luxury-200 rounded-xl text-[11px]">
                <span className="text-[10px] font-bold text-luxury-400 uppercase tracking-wider block mb-1.5">
                  ⚡ Quick Test Profiles:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setUsername('admin'); setPassword('admin123456'); setLoginError(null); }}
                    className="px-2.5 py-1 bg-white hover:bg-luxury-950 hover:text-white border border-luxury-200 text-luxury-800 rounded-lg font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>👑 Main Admin</span>
                    <span className="text-[9px] opacity-60">(Full Access)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUsername('dr_kamran'); setPassword('partner123456'); setLoginError(null); }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg font-medium transition-colors flex items-center gap-1 shadow-2xs"
                    title="Click to test what happens when an unverified partner admin attempts to log in"
                  >
                    <span>⏳ Pending Partner</span>
                    <span className="text-[9px] text-amber-700">(dr_kamran)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUsername('optician_tariq'); setPassword('partner123456'); setLoginError(null); }}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>🛡️ Verified Partner</span>
                    <span className="text-[9px] text-emerald-700">(optician_tariq)</span>
                  </button>
                </div>
              </div>

              {/* Login Error / Pending Verification Notification */}
              {loginError && (
                <div
                  className={`mb-4 p-3.5 border rounded-xl text-xs flex items-start gap-2.5 ${
                    loginError.toLowerCase().includes('pending') || loginError.toLowerCase().includes('verification')
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {loginError.toLowerCase().includes('pending') || loginError.toLowerCase().includes('verification') ? (
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-bold mb-0.5">
                      {loginError.toLowerCase().includes('pending') ? 'Account Verification Pending Main Admin Approval' : 'Authentication Notice'}
                    </strong>
                    <span>{loginError}</span>
                    {loginError.toLowerCase().includes('pending') && (
                      <p className="mt-1 text-[11px] text-amber-700 font-medium">
                        💡 Tip for testing: Log in with the <strong>Main Admin</strong> profile (admin / admin123456) to review, verify, and approve pending partner admin accounts!
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin or partner username"
                    className="w-full p-2.5 text-xs border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 text-xs border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-gold" />
                  {isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-luxury-200 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-champagne-700 hover:text-champagne-900 font-semibold"
                >
                  Are you an optical partner? Apply for Partner Admin Access →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PARTNER ADMIN REGISTRATION (Submits with Status: Pending) */}
          {authMode === 'register' && (
            <div>
              {/* Mandatory Verification Advisory Notice */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Main Admin Verification Required</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    All partner accounts must be verified and approved by the Main Administrator before portal access is activated.
                  </p>
                </div>
              </div>

              {regStatus && (
                <div
                  className={`mb-4 p-3.5 border rounded-xl text-xs flex items-start gap-2 ${
                    regStatus.isSuccess
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {regStatus.isSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-bold">
                      {regStatus.isSuccess ? 'Partner Request Submitted!' : 'Submission Error'}
                    </strong>
                    <span>{regStatus.text}</span>
                    {regStatus.isSuccess && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setRegStatus(null); }}
                          className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
                        >
                          Proceed to Sign In
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSelfRegisterPartnerAdmin} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Full Name / Optician <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="e.g. Dr. Asif Mehmood"
                      className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Optical Store / Clinic Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.storeName}
                      onChange={(e) => setRegForm({ ...regForm, storeName: e.target.value })}
                      placeholder="e.g. Apex Eye Optics"
                      className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={regForm.city}
                      onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                      className="w-full p-2 border border-luxury-300 rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Sialkot">Sialkot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Contact Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Official Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="optician@clinic.pk"
                      className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Desired Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.username}
                      onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                      placeholder="e.g. apex_optics"
                      className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Password (min 6 chars) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Store / Clinic Physical Address
                  </label>
                  <input
                    type="text"
                    value={regForm.address}
                    onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                    placeholder="Shop #, Plaza, Street, Commercial Area"
                    className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Optometry License / Application Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={regForm.notes}
                    onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                    placeholder="e.g. License #, optical services offered, years in business"
                    className="w-full p-2 border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="w-full py-3 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-gold" />
                  {isSubmittingReg ? 'Submitting Application...' : 'Submit Partner Admin Application'}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-luxury-200 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-luxury-500 hover:text-luxury-950 font-medium"
                >
                  ← Already registered? Return to Sign In
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={onExit}
              className="text-xs text-luxury-500 hover:text-luxury-950 font-medium"
            >
              ← Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === 'superadmin' || !currentUser || currentUser?.username === 'admin';

  return (
    <div className="min-h-screen bg-luxury-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-luxury-950 text-white px-6 py-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-champagne-500/20 text-gold flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base tracking-wide flex items-center gap-2">
              NEXT VISION Control Console
              {isSuperAdmin ? (
                <span className="text-[10px] bg-champagne-500/20 text-gold px-2.5 py-0.5 rounded-full border border-champagne-500/40 font-sans font-semibold flex items-center gap-1">
                  <span>👑 Main SuperAdmin</span>
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-sans font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Partner Admin</span>
                </span>
              )}
            </h1>
            <p className="text-[11px] text-luxury-400">
              {isSuperAdmin
                ? 'Master Storefront Catalog, Inventory & Partner Accounts'
                : `Partner Optician: ${currentUser?.name || currentUser?.username} • ${currentUser?.storeName || 'Authorized Clinic'} (${currentUser?.city || 'Pakistan'})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Main Admin Pending Partner Verification Quick Notification Button */}
          {isSuperAdmin && pendingAdminsCount > 0 && (
            <button
              onClick={() => setActiveTab('partnerAdmins')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-luxury-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm animate-pulse"
              title="Click to view and verify pending partner admin accounts"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingAdminsCount} Partner Verification{pendingAdminsCount > 1 ? 's' : ''} Pending</span>
            </button>
          )}

          <button
            onClick={fetchAdminData}
            className="p-2 text-luxury-400 hover:text-white rounded-lg hover:bg-white/10 text-xs flex items-center gap-1 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onExit}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            View Live Store
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-white/10 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div className="bg-white border-b border-luxury-200 px-6 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-luxury-950 text-luxury-950 font-bold'
              : 'border-transparent text-luxury-500 hover:text-luxury-950'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'products'
              ? 'border-luxury-950 text-luxury-950 font-bold'
              : 'border-transparent text-luxury-500 hover:text-luxury-950'
          }`}
        >
          <Package className="w-4 h-4" /> Catalog Management ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-luxury-950 text-luxury-950 font-bold'
              : 'border-transparent text-luxury-500 hover:text-luxury-950'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Orders & Lab Prescriptions ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('partnerStores')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'partnerStores'
              ? 'border-luxury-950 text-luxury-950 font-bold'
              : 'border-transparent text-luxury-500 hover:text-luxury-950'
          }`}
        >
          <MapPin className="w-4 h-4 text-gold" /> Partner Stores ({partnerStores.length})
        </button>

        {/* Partner Admins Management (Main Admin Only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('partnerAdmins')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors relative ${
              activeTab === 'partnerAdmins'
                ? 'border-luxury-950 text-luxury-950 font-bold'
                : 'border-transparent text-luxury-500 hover:text-luxury-950'
            }`}
          >
            <UserCheck className="w-4 h-4 text-champagne-600" />
            <span>Partner Admins ({partnerAdmins.length})</span>
            {pendingAdminsCount > 0 && (
              <span className="bg-amber-500 text-luxury-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs animate-pulse">
                {pendingAdminsCount} Pending
              </span>
            )}
          </button>
        )}

        {/* Business Automations (SuperAdmin only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('automation')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'automation'
                ? 'border-luxury-950 text-luxury-950 font-bold'
                : 'border-transparent text-luxury-500 hover:text-luxury-950'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Business Automations (Sheets & WhatsApp)
          </button>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-luxury-950 text-luxury-950 font-bold'
              : 'border-transparent text-luxury-500 hover:text-luxury-950'
          }`}
        >
          <Settings className="w-4 h-4" />
          {isSuperAdmin ? 'Store Settings & Credentials' : 'My Profile & Password'}
        </button>
      </div>

      {/* Main Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-luxury-200 shadow-sm">
                <div className="flex items-center justify-between text-luxury-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-luxury-950 font-serif">
                  {formatCurrency(stats.totalRevenue, currency, exchangeRate)}
                </div>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">↑ 18.4% from last week</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-200 shadow-sm">
                <div className="flex items-center justify-between text-luxury-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                  <ShoppingCart className="w-4 h-4 text-luxury-700" />
                </div>
                <div className="text-2xl font-bold text-luxury-950 font-serif">
                  {stats.totalOrders}
                </div>
                <p className="text-[11px] text-luxury-500 mt-1">{orders.filter(o => o.status === 'Pending').length} Pending Dispatch</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-200 shadow-sm">
                <div className="flex items-center justify-between text-luxury-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">AR Try-On Sessions</span>
                  <Eye className="w-4 h-4 text-champagne-600" />
                </div>
                <div className="text-2xl font-bold text-luxury-950 font-serif">
                  {stats.tryOnSessions}
                </div>
                <p className="text-[11px] text-champagne-700 mt-1 font-medium">High conversion driver</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-200 shadow-sm">
                <div className="flex items-center justify-between text-luxury-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Catalog Inventory</span>
                  <Package className="w-4 h-4 text-luxury-700" />
                </div>
                <div className="text-2xl font-bold text-luxury-950 font-serif">
                  {stats.totalProducts} Frames
                </div>
                <p className="text-[11px] text-amber-600 mt-1 font-medium">{stats.lowStockCount} items near low-stock threshold</p>
              </div>
            </div>

            {/* Main Admin Urgent Verification Alert Banner */}
            {isSuperAdmin && pendingAdminsCount > 0 && (
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-luxury-950 flex items-center gap-2">
                      <span>Action Required: {pendingAdminsCount} Partner Admin Account{pendingAdminsCount > 1 ? 's' : ''} Awaiting Main Admin Verification</span>
                      <span className="bg-amber-500 text-luxury-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Pending Approval
                      </span>
                    </h4>
                    <p className="text-[11px] text-luxury-600 mt-0.5">
                      Partner opticians have registered their clinics and are waiting for your verification to access store inventory and orders.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('partnerAdmins')}
                  className="px-4 py-2 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5 text-gold" />
                  Review & Verify ({pendingAdminsCount})
                </button>
              </div>
            )}

            {/* Partner Admin Welcome Banner */}
            {!isSuperAdmin && (
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-luxury-950">
                      Welcome, {currentUser?.name || currentUser?.username}!
                    </h4>
                    <p className="text-[11px] text-luxury-600 mt-0.5">
                      You are logged in as a <strong>Verified Partner Administrator</strong> for {currentUser?.storeName || 'Authorized Optical Clinic'}. You have access to real-time customer orders, prescription records, and store inventory.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders Overview */}
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm">
              <h3 className="font-serif font-bold text-base text-luxury-950 mb-4">Recent Inbound Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-luxury-50 text-luxury-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-100">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-luxury-50">
                        <td className="p-3 font-mono font-bold">{o.id}</td>
                        <td className="p-3">{o.customer.name} ({o.customer.city})</td>
                        <td className="p-3">{o.items.length} frame(s)</td>
                        <td className="p-3 font-bold">{formatCurrency(o.total, currency, exchangeRate)}</td>
                        <td className="p-3">{o.paymentMethod}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            o.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                            o.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                            o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-luxury-950">Eyewear Catalog</h3>
                <p className="text-xs text-luxury-500">Manage frame inventory, try-on calibrations, and pricing</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    title: '',
                    category: 'Prescription Glasses',
                    frameShape: 'Square',
                    material: 'Italian Acetate',
                    gender: 'Unisex',
                    basePrice: 5000,
                    salePrice: 4200,
                    stock: 20,
                    description: '',
                    images: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80'],
                    vtoOverlayType: 'square_acetate',
                    vtoOverlayColor: '#121215',
                    vtoScaleMultiplier: 1.05,
                    vtoVerticalOffset: 0,
                    faceShapesRecommended: ['Round', 'Oval'],
                    colors: [{ name: 'Classic Black', hex: '#121215' }]
                  });
                  setNewImageUrlInput('');
                  setImageTab('upload');
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-gold" /> Add New Frame
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-luxury-50 text-luxury-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Frame</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Shape</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-luxury-50">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80'}
                          alt={p.title}
                          className="w-12 h-10 object-cover rounded bg-luxury-100"
                        />
                        <div>
                          <p className="font-semibold text-luxury-950">{p.title}</p>
                          <p className="text-[10px] text-luxury-500">{p.material}</p>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-luxury-600">{p.sku}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-luxury-100 text-luxury-700 text-[10px]">
                          {p.frameShape}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${p.stock <= 15 ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {formatCurrency(p.salePrice || p.basePrice, currency, exchangeRate)}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct({
                              ...p,
                              images: p.images && p.images.length > 0
                                ? [...p.images]
                                : ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80']
                            });
                            setNewImageUrlInput('');
                            setImageTab('upload');
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-luxury-600 hover:text-luxury-950 hover:bg-luxury-100 rounded"
                          title="Edit Frame"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete Frame"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-luxury-950">Customer Orders & Optical Lab Queue</h3>
              <p className="text-xs text-luxury-500">Track shipments, verify doctor prescriptions, and issue courier tracking IDs</p>
            </div>

            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="p-4 rounded-xl border border-luxury-200 bg-luxury-50/60 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-luxury-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-luxury-950">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-luxury-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span>Update Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="p-1.5 text-xs rounded border border-luxury-300 bg-white"
                      >
                        <option>Pending</option>
                        <option>Confirmed</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <h5 className="font-bold text-luxury-700 mb-1">Customer & Delivery:</h5>
                      <p className="font-semibold text-luxury-950">{order.customer.name}</p>
                      <p className="text-luxury-600">{order.customer.phone}</p>
                      <p className="text-luxury-600">{order.customer.address}, {order.customer.city}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-luxury-700 mb-1">Items & Lenses:</h5>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="mb-1">
                          <p className="font-semibold text-luxury-950">{item.title} ({item.color}) x{item.quantity}</p>
                          {item.lensOption && (
                            <p className="text-[11px] text-champagne-700 bg-champagne-50 p-1 rounded border border-champagne-200 mt-0.5">
                              {item.lensOption.type} {item.lensOption.pd && `• PD: ${item.lensOption.pd}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h5 className="font-bold text-luxury-700 mb-1">Financials & Courier:</h5>
                      <p className="font-bold text-sm text-luxury-950">Total: {formatCurrency(order.total, currency, exchangeRate)}</p>
                      <p className="text-luxury-600">{order.paymentMethod}</p>
                      {order.trackingNumber ? (
                        <p className="text-emerald-700 font-mono mt-1">Tracking: {order.trackingNumber}</p>
                      ) : (
                        <button
                          onClick={() => {
                            const track = prompt("Enter courier tracking number (e.g. TCS-99281726):");
                            if (track) handleUpdateOrderStatus(order.id, order.status, track);
                          }}
                          className="text-[11px] text-blue-600 hover:underline mt-1 block"
                        >
                          + Add Tracking Number
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PARTNER STORES (Added & Managed through Admin Page) */}
        {activeTab === 'partnerStores' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-luxury-950 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gold" /> Authorized Partner Stores & Clinics
                  </h3>
                  <p className="text-xs text-luxury-500">
                    Stores added here are instantly indexed and searchable through the storefront <strong>Location Bar</strong> on the live map.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddPartnerStore}
                  className="px-4 py-2 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4 text-gold" /> Add Partner Store
                </button>
              </div>

              {/* Search Bar for Partner Stores */}
              <div className="flex items-center gap-2 max-w-md bg-luxury-50 border border-luxury-200 px-3 py-2 rounded-xl text-xs">
                <MapPin className="w-4 h-4 text-luxury-400" />
                <input
                  type="text"
                  value={partnerStoreSearch}
                  onChange={(e) => setPartnerStoreSearch(e.target.value)}
                  placeholder="Filter by store name, city, or address..."
                  className="bg-transparent border-none focus:outline-none w-full text-luxury-900"
                />
                {partnerStoreSearch && (
                  <button onClick={() => setPartnerStoreSearch('')} className="text-luxury-400 hover:text-luxury-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Partner Stores Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-luxury-50 text-luxury-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Store & Atelier</th>
                      <th className="p-3">City & Province</th>
                      <th className="p-3">Contact & Timings</th>
                      <th className="p-3">GPS Location</th>
                      <th className="p-3">Services</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-100">
                    {partnerStores
                      .filter(s => {
                        if (!partnerStoreSearch.trim()) return true;
                        const q = partnerStoreSearch.toLowerCase();
                        return (
                          s.name.toLowerCase().includes(q) ||
                          s.city.toLowerCase().includes(q) ||
                          s.address.toLowerCase().includes(q)
                        );
                      })
                      .map(store => (
                        <tr key={store.id} className="hover:bg-luxury-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={store.image || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'}
                                alt={store.name}
                                className="w-10 h-10 object-cover rounded-lg bg-luxury-100 border border-luxury-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-luxury-950 block">{store.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    store.type === 'Flagship Atelier'
                                      ? 'bg-luxury-950 text-gold'
                                      : 'bg-champagne-100 text-champagne-900 border border-champagne-300'
                                  }`}>
                                    {store.type}
                                  </span>
                                  {store.isAdminAdded && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      Admin Added
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-luxury-900 block">{store.city}</span>
                            <span className="text-[11px] text-luxury-500 line-clamp-1">{store.address}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-luxury-800 block">{store.phone}</span>
                            <span className="text-[10px] text-luxury-500">{store.timings}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] text-luxury-700 bg-luxury-100 px-2 py-1 rounded">
                              {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {store.hasFreeEyeTest && (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px]">
                                  Free Eye Test
                                </span>
                              )}
                              {store.hasTryOnKiosk && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px]">
                                  AR Kiosk
                                </span>
                              )}
                              {store.hasSameDayLenses && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px]">
                                  Same-Day
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditPartnerStore(store)}
                                className="p-1.5 text-luxury-600 hover:text-luxury-950 hover:bg-luxury-200 rounded-lg transition-colors"
                                title="Edit Partner Store"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePartnerStore(store.id, store.name)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove Store"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PARTNER ADMIN ACCOUNTS MANAGEMENT & MAIN ADMIN VERIFICATION */}
        {activeTab === 'partnerAdmins' && isSuperAdmin && (
          <div className="space-y-6">
            {/* Header & Provision Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-luxury-950 flex items-center gap-2">
                  <span>Partner Admin Accounts & Verification</span>
                  <span className="text-xs font-sans font-semibold bg-champagne-500/20 text-gold px-2.5 py-0.5 rounded-full border border-champagne-500/30">
                    Main Admin Console
                  </span>
                </h2>
                <p className="text-xs text-luxury-500 mt-1">
                  Authorize, verify, and manage optical clinic and store partner administrator accounts across Pakistan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPartnerAdminActionStatus(null);
                  setIsAddPartnerAdminModalOpen(true);
                }}
                className="px-4 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-gold" />
                <span>+ Add Partner Admin Directly</span>
              </button>
            </div>

            {/* Notification / Toast */}
            {partnerAdminActionStatus && (
              <div
                className={`p-3.5 border rounded-xl text-xs flex items-center justify-between ${
                  partnerAdminActionStatus.isError
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {partnerAdminActionStatus.isError ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="font-medium">{partnerAdminActionStatus.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPartnerAdminActionStatus(null)}
                  className="text-luxury-400 hover:text-luxury-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Top KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-luxury-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-100 text-luxury-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">
                    Total Partner Admins
                  </span>
                  <span className="text-xl font-serif font-bold text-luxury-950">
                    {partnerAdmins.length}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs flex items-center gap-3 bg-gradient-to-br from-amber-500/10 to-transparent">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                    Pending Verification
                  </span>
                  <span className="text-xl font-serif font-bold text-amber-950">
                    {pendingAdminsCount}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-3 bg-gradient-to-br from-emerald-500/10 to-transparent">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                    Verified & Active
                  </span>
                  <span className="text-xl font-serif font-bold text-emerald-950">
                    {partnerAdmins.filter(p => p.status === 'verified').length}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-luxury-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">
                    Rejected / Declined
                  </span>
                  <span className="text-xl font-serif font-bold text-luxury-950">
                    {partnerAdmins.filter(p => p.status === 'rejected').length}
                  </span>
                </div>
              </div>
            </div>

            {/* PENDING VERIFICATION ACTION SECTION (High Priority Review Cards) */}
            {pendingAdminsCount > 0 && (
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-800">
                      <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-luxury-950 flex items-center gap-2">
                        <span>Awaiting Main Admin Verification & Approval</span>
                        <span className="bg-amber-500 text-luxury-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                          {pendingAdminsCount} Request{pendingAdminsCount > 1 ? 's' : ''}
                        </span>
                      </h3>
                      <p className="text-[11px] text-amber-800">
                        Review the partner optical clinic credentials below and click "Verify & Approve" to activate portal access.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerAdmins
                    .filter(pa => pa.status === 'pending')
                    .map(pa => (
                      <div
                        key={pa.id}
                        className="bg-white rounded-xl p-4 border border-amber-300/80 shadow-sm flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-sm text-luxury-950">{pa.name}</h4>
                              <p className="text-[11px] text-luxury-500 font-mono">@{pa.username}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Verification</span>
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-luxury-600 bg-luxury-50/70 p-3 rounded-lg border border-luxury-100">
                            <div className="flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-champagne-600 shrink-0" />
                              <span className="font-semibold text-luxury-900">{pa.storeName}</span>
                              <span className="text-[10px] bg-luxury-200 text-luxury-700 px-1.5 py-0.2 rounded font-sans">
                                {pa.city}
                              </span>
                            </div>
                            {pa.address && (
                              <div className="flex items-start gap-2 text-[11px] text-luxury-500">
                                <MapPin className="w-3.5 h-3.5 text-luxury-400 shrink-0 mt-0.5" />
                                <span>{pa.address}</span>
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                              <a
                                href={`tel:${pa.phone}`}
                                className="flex items-center gap-1 text-champagne-700 hover:underline font-medium"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{pa.phone}</span>
                              </a>
                              <a
                                href={`mailto:${pa.email}`}
                                className="flex items-center gap-1 text-champagne-700 hover:underline font-medium"
                              >
                                <Mail className="w-3 h-3" />
                                <span>{pa.email}</span>
                              </a>
                            </div>
                          </div>

                          {pa.notes && (
                            <div className="mt-2.5 p-2 bg-amber-50/80 rounded-lg text-[11px] text-amber-900 border border-amber-200/60">
                              <span className="font-semibold block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">
                                License & Registration Remarks:
                              </span>
                              <span>"{pa.notes}"</span>
                            </div>
                          )}

                          <div className="mt-2 text-[10px] text-luxury-400">
                            Application received: {new Date(pa.createdAt).toLocaleDateString()} at {new Date(pa.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Action Buttons: Verify vs Reject */}
                        <div className="pt-2 border-t border-luxury-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeletePartnerAdmin(pa.id, pa.name)}
                            className="p-2 text-luxury-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 text-[11px]"
                            title="Delete Account Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRejectPartnerAdmin(pa.id, pa.name)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyPartnerAdmin(pa.id, pa.name)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>✓ Verify & Approve Account</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* FULL PARTNER ADMIN DIRECTORY */}
            <div className="bg-white rounded-xl border border-luxury-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-luxury-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-luxury-950">
                    All Partner Admin Accounts ({partnerAdmins.length})
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Status Filters */}
                  <div className="flex bg-luxury-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setPartnerAdminFilter('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        partnerAdminFilter === 'all'
                          ? 'bg-white text-luxury-950 shadow-2xs font-bold'
                          : 'text-luxury-500 hover:text-luxury-950'
                      }`}
                    >
                      All ({partnerAdmins.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerAdminFilter('pending')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        partnerAdminFilter === 'pending'
                          ? 'bg-white text-amber-900 shadow-2xs font-bold'
                          : 'text-luxury-500 hover:text-luxury-950'
                      }`}
                    >
                      Pending ({pendingAdminsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerAdminFilter('verified')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        partnerAdminFilter === 'verified'
                          ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                          : 'text-luxury-500 hover:text-luxury-950'
                      }`}
                    >
                      Verified ({partnerAdmins.filter(p => p.status === 'verified').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerAdminFilter('rejected')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        partnerAdminFilter === 'rejected'
                          ? 'bg-white text-rose-900 shadow-2xs font-bold'
                          : 'text-luxury-500 hover:text-luxury-950'
                      }`}
                    >
                      Rejected ({partnerAdmins.filter(p => p.status === 'rejected').length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search optician, clinic, city..."
                      value={partnerAdminSearch}
                      onChange={(e) => setPartnerAdminSearch(e.target.value)}
                      className="p-1.5 pl-3 text-xs border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950 w-48 sm:w-60"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-luxury-50 text-luxury-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Partner Optician</th>
                      <th className="p-3">Clinic / Store & City</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Verification Status</th>
                      <th className="p-3">Timeline</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-100">
                    {partnerAdmins
                      .filter(pa => {
                        if (partnerAdminFilter !== 'all' && pa.status !== partnerAdminFilter) return false;
                        if (!partnerAdminSearch) return true;
                        const q = partnerAdminSearch.toLowerCase();
                        return (
                          pa.name.toLowerCase().includes(q) ||
                          pa.username.toLowerCase().includes(q) ||
                          pa.storeName.toLowerCase().includes(q) ||
                          pa.city.toLowerCase().includes(q) ||
                          (pa.email && pa.email.toLowerCase().includes(q))
                        );
                      })
                      .map(pa => (
                        <tr key={pa.id} className="hover:bg-luxury-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-luxury-950 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                                {pa.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-luxury-950 block">{pa.name}</span>
                                <span className="font-mono text-[10px] text-luxury-400">@{pa.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-luxury-900 block">{pa.storeName}</span>
                            <span className="text-[11px] text-luxury-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-luxury-400" />
                              <span>{pa.city}</span>
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5">
                            <div className="text-[11px] font-medium text-luxury-800">{pa.phone}</div>
                            <div className="text-[10px] text-luxury-400">{pa.email}</div>
                          </td>
                          <td className="p-3">
                            {pa.status === 'pending' && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold border border-amber-300 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                <span>Pending Verification</span>
                              </span>
                            )}
                            {pa.status === 'verified' && (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold border border-emerald-300 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified by Main Admin</span>
                              </span>
                            )}
                            {pa.status === 'rejected' && (
                              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold border border-rose-300 inline-flex items-center gap-1">
                                <UserX className="w-3 h-3 text-rose-600" />
                                <span>Rejected</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-luxury-500">
                            <div>Applied: {new Date(pa.createdAt).toLocaleDateString()}</div>
                            {pa.verifiedAt && (
                              <div className="text-[10px] text-emerald-700 font-medium">
                                Verified: {new Date(pa.verifiedAt).toLocaleDateString()} ({pa.verifiedBy || 'Main Admin'})
                              </div>
                            )}
                            {pa.rejectionReason && (
                              <div className="text-[10px] text-rose-600 italic">
                                Declined: {pa.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {pa.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPartnerAdmin(pa.id, pa.name)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                                  title="Approve and verify account"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Verify</span>
                                </button>
                              )}
                              {pa.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectPartnerAdmin(pa.id, pa.name)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold transition-colors"
                                  title="Decline registration request"
                                >
                                  Decline
                                </button>
                              )}
                              {pa.status === 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectPartnerAdmin(pa.id, pa.name)}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold transition-colors"
                                  title="Suspend / Revoke verification"
                                >
                                  Revoke
                                </button>
                              )}
                              {pa.status === 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPartnerAdmin(pa.id, pa.name)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                                  title="Re-verify account"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Re-Verify</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeletePartnerAdmin(pa.id, pa.name)}
                                className="p-1 text-luxury-400 hover:text-red-600 rounded transition-colors"
                                title="Delete account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {partnerAdmins.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-luxury-400">
                          No partner admin accounts found. Click "+ Add Partner Admin Directly" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BUSINESS AUTOMATIONS (GOOGLE SHEETS & WHATSAPP) */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-luxury-200 shadow-sm flex items-start gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-luxury-950">Google Sheets Sync</h4>
                  <p className="text-[11px] text-luxury-500 mt-0.5">Real-time webhook sync on every customer order</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    settingsForm.googleSheetsWebhookUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {settingsForm.googleSheetsWebhookUrl ? 'Webhook Configured' : 'Setup Required'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-200 shadow-sm flex items-start gap-3">
                <div className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-luxury-950">WhatsApp Order Dispatch</h4>
                  <p className="text-[11px] text-luxury-500 mt-0.5">Automated pre-formatted order confirmations</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    Active ({settingsForm.whatsapp || '+92 300 8472910'})
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-luxury-200 shadow-sm flex items-start gap-3">
                <div className="p-3 bg-luxury-100 text-luxury-950 rounded-xl">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-luxury-950">Direct CSV / Excel Export</h4>
                  <p className="text-[11px] text-luxury-500 mt-0.5">Instant offline spreadsheet backup</p>
                  <button
                    onClick={handleDownloadCSV}
                    className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Orders CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Google Sheets Webhook Configuration */}
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-100 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-luxury-950 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Google Sheets Webhook Automation
                  </h3>
                  <p className="text-xs text-luxury-500 mt-0.5">
                    Every incoming order with customer details, prescription specs, and total is automatically sent to your Google Sheet in real time.
                  </p>
                </div>
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Export All to CSV
                </button>
              </div>

              {testPingStatus && (
                <div className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  testPingStatus.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {testPingStatus.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{testPingStatus.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form */}
                <div className="lg:col-span-7 space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">
                      Google Sheets Webhook URL (Google Apps Script Web App / Make / Zapier)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.googleSheetsWebhookUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleSheetsWebhookUrl: e.target.value })}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="w-full p-2.5 border rounded-lg bg-white font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-luxury-400 mt-1">
                      Paste the Web App URL from your Google Sheet (instructions on the right).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="autoSync"
                      checked={settingsForm.autoSyncGoogleSheets !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, autoSyncGoogleSheets: e.target.checked })}
                      className="rounded accent-luxury-950"
                    />
                    <label htmlFor="autoSync" className="text-luxury-800 font-medium">
                      Automatically sync new orders to Google Sheets upon checkout
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveSettings}
                      className="px-5 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg font-bold shadow transition-all"
                    >
                      Save Webhook URL
                    </button>

                    <button
                      type="button"
                      onClick={handleTestSheetsPing}
                      disabled={isTestingPing || !settingsForm.googleSheetsWebhookUrl}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isTestingPing ? 'Pinging Sheet...' : 'Test Webhook Ping'}
                    </button>
                  </div>
                </div>

                {/* 30-Second Setup Guide */}
                <div className="lg:col-span-5 bg-luxury-50 p-4 rounded-xl border border-luxury-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-luxury-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold" /> 30-Second Google Sheet Setup
                    </span>
                    <button
                      onClick={() => {
                        const scriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Order ID", "Customer Name", "Phone", "Email", "Address", "City", "Items", "Lens Package", "Prescription", "Subtotal", "Shipping", "Total", "Payment Method", "Status"]);
  }
  sheet.appendRow([
    data.timestamp || new Date(),
    data.orderId || "",
    data.customerName || "",
    data.phone || "",
    data.email || "",
    data.address || "",
    data.city || "",
    data.items || "",
    data.lensPackage || "",
    data.prescription || "",
    data.subtotal || 0,
    data.shipping || 0,
    data.total || 0,
    data.paymentMethod || "",
    data.status || "Pending"
  ]);
  return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);
}`;
                        navigator.clipboard.writeText(scriptCode);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2500);
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedScript ? 'Copied Code!' : 'Copy Apps Script'}
                    </button>
                  </div>

                  <ol className="list-decimal pl-4 space-y-1 text-luxury-600 text-[11px] leading-relaxed">
                    <li>Create a new spreadsheet at <strong>sheets.new</strong>.</li>
                    <li>Click <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Click <strong>Copy Apps Script</strong> above and paste into the editor.</li>
                    <li>Click <strong>Deploy &gt; New deployment</strong> &gt; Select type <strong>Web app</strong>.</li>
                    <li>Set <em>"Who has access"</em> to <strong>Anyone</strong>, click Deploy, and paste the URL here.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* WhatsApp Business Automation Controls */}
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-luxury-950 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" /> WhatsApp Business Helpline & Order Automation
                </h3>
                <p className="text-xs text-luxury-500 mt-0.5">
                  Customers receive an instant prefilled WhatsApp order dispatch link on checkout. Customers can also send doctor slips and track orders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">WhatsApp Store Helpline Phone Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    placeholder="+92 300 8472910"
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                  <p className="text-[10px] text-luxury-400 mt-1">Must include country code (e.g. +92 300 ...)</p>
                </div>

                <div className="flex flex-col justify-end">
                  <a
                    href={`https://wa.me/${(settingsForm.whatsapp || '923008472910').replace(/[\s\+\-]/g, '')}?text=${encodeURIComponent("👓 *NEXT VISION Test Ping:* WhatsApp business connection active and running.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow w-fit"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Test WhatsApp Connection</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Live Automation Logs */}
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-luxury-950">Live Automation Activity Stream</h3>
                  <p className="text-xs text-luxury-500">History of Google Sheets webhooks and WhatsApp order dispatches</p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="text-xs text-luxury-500 hover:text-luxury-950 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-luxury-50 text-luxury-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Channel</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Log Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-100">
                    {automationLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-luxury-400">
                          No automation events logged yet. Place an order or click "Test Webhook Ping".
                        </td>
                      </tr>
                    ) : (
                      automationLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-luxury-50">
                          <td className="p-2.5 text-luxury-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-2.5 font-semibold text-luxury-900">
                            {log.type === 'google_sheets' && (
                              <span className="flex items-center gap-1 text-emerald-700">
                                <FileSpreadsheet className="w-3.5 h-3.5" /> Google Sheets
                              </span>
                            )}
                            {log.type === 'whatsapp' && (
                              <span className="flex items-center gap-1 text-[#25D366]">
                                <MessageCircle className="w-3.5 h-3.5 fill-current" /> WhatsApp
                              </span>
                            )}
                            {log.type === 'system' && (
                              <span className="text-luxury-600">System</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                              log.status === 'Failed' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-luxury-700 font-mono text-[11px] truncate max-w-md">
                            {log.message}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: STORE SETTINGS & ADMIN PASSWORD */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Store Information Form (User Requirement) */}
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-luxury-950 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-champagne-600" /> Store Contact Information
                </h3>
                <p className="text-xs text-luxury-500">Updates live store footer, header helpline & customer receipts</p>
              </div>

              {settingsStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" /> {settingsStatus}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settingsForm.storeName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Store Physical Address</label>
                  <textarea
                    rows={2}
                    value={settingsForm.address || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">Phone Helpline</label>
                    <input
                      type="text"
                      value={settingsForm.phone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-luxury-700 mb-1">WhatsApp Concierge</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Concierge Email</label>
                  <input
                    type="email"
                    value={settingsForm.email || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                {/* Store / Project Logo Picture */}
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Store / Project Logo Picture
                  </label>
                  <p className="text-[10px] text-luxury-500 mb-1.5">Displayed on store navigation bar and header</p>
                  <div className="flex items-center gap-2">
                    {settingsForm.logoUrl ? (
                      <div className="relative group">
                        <img
                          src={settingsForm.logoUrl}
                          alt="Logo Preview"
                          className="w-10 h-10 object-contain rounded-lg border bg-luxury-950 p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow hover:scale-110"
                          title="Clear Logo"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-dashed border-luxury-300 flex items-center justify-center text-luxury-400 bg-luxury-50">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="https://... or upload picture below"
                      value={settingsForm.logoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      className="flex-1 p-2 border rounded-lg bg-white text-xs"
                    />
                    <label className="cursor-pointer px-3 py-2 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-lg font-semibold flex items-center gap-1 whitespace-nowrap text-xs transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'logo');
                          e.target.value = '';
                        }}
                      />
                      <Upload className="w-3.5 h-3.5" /> Upload Logo
                    </label>
                  </div>
                </div>

                {/* Store / Project Hero Showcase Picture */}
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Project Hero Banner / Showcase Picture
                  </label>
                  <p className="text-[10px] text-luxury-500 mb-1.5">Displayed prominently on the homepage hero showcase</p>
                  <div className="flex items-center gap-2">
                    {settingsForm.bannerUrl ? (
                      <div className="relative group">
                        <img
                          src={settingsForm.bannerUrl}
                          alt="Banner Preview"
                          className="w-16 h-10 object-cover rounded-lg border bg-luxury-950"
                        />
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, bannerUrl: '' })}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow hover:scale-110"
                          title="Clear Banner"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-10 rounded-lg border border-dashed border-luxury-300 flex items-center justify-center text-luxury-400 bg-luxury-50">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="https://... or upload picture below"
                      value={settingsForm.bannerUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerUrl: e.target.value })}
                      className="flex-1 p-2 border rounded-lg bg-white text-xs"
                    />
                    <label className="cursor-pointer px-3 py-2 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-lg font-semibold flex items-center gap-1 whitespace-nowrap text-xs transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'banner');
                          e.target.value = '';
                        }}
                      />
                      <Upload className="w-3.5 h-3.5" /> Upload Banner
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Save Store Contact Changes
                </button>
              </form>
            </div>

            {/* Admin Password Change (User Requirement) */}
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-luxury-950 flex items-center gap-2">
                  <Key className="w-4 h-4 text-champagne-600" /> Admin Password & Security
                </h3>
                <p className="text-xs text-luxury-500">Securely rotate admin access credentials (stored with bcrypt salt rounds)</p>
              </div>

              {passwordStatus && (
                <div className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                  passwordStatus.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {passwordStatus.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  <span>{passwordStatus.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">New Password (Min 6 chars) *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new strong password"
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full p-2.5 border rounded-lg bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Update Admin Password
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-luxury-200 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-100 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-luxury-100 rounded-lg text-luxury-900">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-luxury-950">
                    {editingProduct.id ? 'Edit Eyewear Model' : 'Add New Eyewear Frame'}
                  </h4>
                  <p className="text-[11px] text-luxury-500">Configure frame specs, pricing, and high-definition photography</p>
                </div>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-luxury-400 hover:text-luxury-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Product Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Model Title *</label>
                  <input
                    type="text"
                    value={editingProduct.title || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    required
                    placeholder="e.g. Aura Obsidian Square"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="e.g. AK-OPT-009"
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* SECTION: PRODUCT PICTURES / FRAME PHOTOGRAPHY */}
              <div className="bg-luxury-50 p-3.5 rounded-xl border border-luxury-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-luxury-950 flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-champagne-600" />
                      Frame Photography & Pictures
                    </label>
                    <p className="text-[11px] text-luxury-500">
                      Add pictures for catalog cards, AR previews, and checkout. First photo serves as primary cover picture.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-luxury-700 bg-white px-2 py-0.5 rounded border border-luxury-200">
                    {editingProduct.images?.length || 0} Picture(s)
                  </span>
                </div>

                {/* Pictures Gallery Preview Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {(editingProduct.images || []).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden border border-luxury-200 bg-white aspect-[4/3] flex items-center justify-center shadow-sm"
                    >
                      <img
                        src={imgUrl}
                        alt={`Frame photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      {/* Primary Cover Badge or Make Cover Action */}
                      {idx === 0 ? (
                        <span className="absolute top-1 left-1 bg-luxury-950/90 text-gold text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          ★ Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="absolute top-1 left-1 bg-white/95 hover:bg-white text-luxury-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Set as primary cover"
                        >
                          Make Cover
                        </button>
                      )}
                      {/* Delete / Remove Photo */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Picture"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Empty state alert if no pictures */}
                  {(!editingProduct.images || editingProduct.images.length === 0) && (
                    <div className="col-span-3 sm:col-span-4 p-4 border border-dashed border-amber-300 bg-amber-50 rounded-lg text-center text-amber-800 text-[11px]">
                      No picture added yet. Please upload from your computer, paste an image link, or choose from optical presets below.
                    </div>
                  )}
                </div>

                {/* Add Picture Options Bar */}
                <div className="bg-white p-3 rounded-lg border border-luxury-200 space-y-2.5">
                  <div className="flex items-center gap-1 border-b border-luxury-100 pb-2">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                        imageTab === 'upload' ? 'bg-luxury-950 text-white' : 'text-luxury-600 hover:bg-luxury-100'
                      }`}
                    >
                      <Upload className="w-3 h-3" /> Upload Picture File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                        imageTab === 'url' ? 'bg-luxury-950 text-white' : 'text-luxury-600 hover:bg-luxury-100'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" /> Picture URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('presets')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                        imageTab === 'presets' ? 'bg-luxury-950 text-white' : 'text-luxury-600 hover:bg-luxury-100'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-gold" /> Eyewear Presets
                    </button>
                  </div>

                  {/* MODE 1: FILE UPLOAD */}
                  {imageTab === 'upload' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-luxury-600">
                        Select an image file from your device (PNG, JPG, WebP):
                      </label>
                      <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-luxury-300 hover:border-luxury-600 rounded-lg p-3 text-center bg-luxury-50/50 hover:bg-luxury-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'product');
                            e.target.value = '';
                          }}
                          disabled={isUploadingImage}
                        />
                        {isUploadingImage ? (
                          <div className="flex items-center gap-2 text-champagne-700">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="font-semibold text-xs">Uploading picture to server...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-luxury-700">
                            <Upload className="w-4 h-4 text-champagne-600" />
                            <span className="font-semibold text-xs">Click to browse & upload frame picture from computer</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}

                  {/* MODE 2: IMAGE URL */}
                  {imageTab === 'url' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-luxury-600">
                        Paste external image link (Unsplash, CDN, or Cloud Storage):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={newImageUrlInput}
                          onChange={(e) => setNewImageUrlInput(e.target.value)}
                          className="flex-1 p-2 border rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddImageUrl(newImageUrlInput)}
                          disabled={!newImageUrlInput.trim()}
                          className="px-3 py-2 bg-luxury-950 hover:bg-luxury-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Picture
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MODE 3: PRESETS */}
                  {imageTab === 'presets' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-luxury-600">
                        Click any frame style to immediately attach its photo:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {LUXURY_PRESET_IMAGES.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleAddImageUrl(preset.url)}
                            className="flex items-center gap-2 p-1.5 border border-luxury-200 hover:border-luxury-900 rounded-lg text-left bg-luxury-50/50 hover:bg-white transition-all text-[11px]"
                          >
                            <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            <span className="font-medium text-luxury-800 truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category, Shape, Gender */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'Prescription Glasses'}
                    onChange={(e: any) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option>Prescription Glasses</option>
                    <option>Sunglasses</option>
                    <option>Blue-Light Glasses</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Frame Shape</label>
                  <select
                    value={editingProduct.frameShape || 'Square'}
                    onChange={(e: any) => setEditingProduct({ ...editingProduct, frameShape: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option>Square</option>
                    <option>Aviator</option>
                    <option>Cat-Eye</option>
                    <option>Rectangle</option>
                    <option>Round</option>
                    <option>Geometric</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Gender</label>
                  <select
                    value={editingProduct.gender || 'Unisex'}
                    onChange={(e: any) => setEditingProduct({ ...editingProduct, gender: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option>Unisex</option>
                    <option>Men</option>
                    <option>Women</option>
                  </select>
                </div>
              </div>

              {/* Material */}
              <div>
                <label className="block font-semibold text-luxury-700 mb-1">Material Composition</label>
                <input
                  type="text"
                  placeholder="e.g. Hand-Polished Italian Acetate or Pure Japanese Titanium"
                  value={editingProduct.material || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Pricing & Inventory */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Base Price (PKR) *</label>
                  <input
                    type="number"
                    value={editingProduct.basePrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Sale Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-luxury-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe optical craftsmanship, lens protection, and aesthetics..."
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-luxury-100 font-semibold text-luxury-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-950 text-white font-bold rounded-lg hover:bg-luxury-800 shadow-md"
                >
                  Save Frame & Photography
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Store Edit / Create Modal */}
      {isPartnerStoreModalOpen && editingPartnerStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-luxury-200 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-100 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-luxury-100 rounded-lg text-luxury-900">
                  <MapPin className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-luxury-950">
                    {editingPartnerStore.id ? 'Edit Partner Store' : 'Add New Partner Store'}
                  </h4>
                  <p className="text-[11px] text-luxury-500">Configure store location, operating hours, and in-store amenities</p>
                </div>
              </div>
              <button onClick={() => setIsPartnerStoreModalOpen(false)} className="p-1 text-luxury-400 hover:text-luxury-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            {partnerStoreStatus && (
              <div className={`p-3 text-xs rounded-xl mb-3 flex items-center gap-2 ${
                partnerStoreStatus.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {partnerStoreStatus.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>{partnerStoreStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePartnerStore} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block font-semibold text-luxury-700 mb-1">Store / Clinic Name *</label>
                <input
                  type="text"
                  value={editingPartnerStore.name || ''}
                  onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, name: e.target.value })}
                  required
                  placeholder="e.g. Al-Huda Optics & Vision Clinic"
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Store Category</label>
                  <select
                    value={editingPartnerStore.type || 'Authorized Partner'}
                    onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, type: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Authorized Partner">Authorized Partner</option>
                    <option value="Flagship Atelier">Flagship Atelier</option>
                    <option value="Certified Clinic">Certified Clinic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">City *</label>
                  <select
                    value={editingPartnerStore.city || 'Lahore'}
                    onChange={(e) => {
                      const c = e.target.value;
                      handleAutofillCityCoords(c);
                    }}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    {Object.keys(CITY_COORDINATES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-luxury-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={editingPartnerStore.address || ''}
                  onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, address: e.target.value })}
                  required
                  placeholder="e.g. Shop 14, Commercial Plaza, Main Boulevard, Gulberg III"
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">Helpline Phone *</label>
                  <input
                    type="text"
                    value={editingPartnerStore.phone || ''}
                    onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, phone: e.target.value })}
                    required
                    placeholder="+92 42 35789012"
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">WhatsApp Concierge</label>
                  <input
                    type="text"
                    value={editingPartnerStore.whatsapp || ''}
                    onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, whatsapp: e.target.value })}
                    placeholder="+92 305 4323059"
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-luxury-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={editingPartnerStore.timings || ''}
                  onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, timings: e.target.value })}
                  placeholder="10:00 AM - 10:00 PM (Daily)"
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              {/* Coordinates with Autofill */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-luxury-700">GPS Coordinates (Map Pin)</label>
                  <button
                    type="button"
                    onClick={() => handleAutofillCityCoords(editingPartnerStore.city || 'Lahore')}
                    className="text-[11px] text-champagne-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Compass className="w-3 h-3" /> Autofill {editingPartnerStore.city} Coords
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-luxury-400 block mb-0.5">Latitude</span>
                    <input
                      type="number"
                      step="any"
                      value={editingPartnerStore.lat || 0}
                      onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-400 block mb-0.5">Longitude</span>
                    <input
                      type="number"
                      step="any"
                      value={editingPartnerStore.lng || 0}
                      onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* In-Store Amenities */}
              <div>
                <label className="block font-semibold text-luxury-700 mb-1.5">In-Store Services & Amenities</label>
                <div className="space-y-2 bg-luxury-50 p-3 rounded-xl border border-luxury-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPartnerStore.hasFreeEyeTest)}
                      onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, hasFreeEyeTest: e.target.checked })}
                      className="rounded text-luxury-950 focus:ring-luxury-950"
                    />
                    <span>Complimentary Computerized Eye Testing (Optometrist On-Duty)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPartnerStore.hasTryOnKiosk)}
                      onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, hasTryOnKiosk: e.target.checked })}
                      className="rounded text-luxury-950 focus:ring-luxury-950"
                    />
                    <span>In-Store AR Virtual Try-On Screen Kiosk</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPartnerStore.hasSameDayLenses)}
                      onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, hasSameDayLenses: e.target.checked })}
                      className="rounded text-luxury-950 focus:ring-luxury-950"
                    />
                    <span>Same-Day Prescription Lens Edging & Glazing Lab</span>
                  </label>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-semibold text-luxury-700 mb-1">Store Front Image URL</label>
                <input
                  type="url"
                  value={editingPartnerStore.image || ''}
                  onChange={(e) => setEditingPartnerStore({ ...editingPartnerStore, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPartnerStoreModalOpen(false)}
                  className="px-4 py-2 text-luxury-600 hover:text-luxury-950 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  {editingPartnerStore.id ? 'Save Store Changes' : 'Publish Partner Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PARTNER ADMIN DIRECTLY (MAIN ADMIN PROVISIONING) */}
      {isAddPartnerAdminModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-luxury-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-luxury-950 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-champagne-600" />
                  <span>Provision New Partner Admin Account</span>
                </h3>
                <p className="text-xs text-luxury-500">
                  Directly create an optical clinic administrator account with custom credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPartnerAdminModalOpen(false)}
                className="p-1 text-luxury-400 hover:text-luxury-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartnerAdminSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Partner Optician Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.name}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, name: e.target.value })}
                    placeholder="e.g. Dr. Tariq Shah"
                    className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Optical Store / Clinic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.storeName}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, storeName: e.target.value })}
                    placeholder="e.g. Al-Noor Optics & Eyewear"
                    className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newPartnerForm.city}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, city: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Gujranwala">Gujranwala</option>
                    <option value="Sialkot">Sialkot</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.phone}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newPartnerForm.email}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, email: e.target.value })}
                    placeholder="optician@store.pk"
                    className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Login Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.username}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, username: e.target.value })}
                    placeholder="e.g. alnoor_optics"
                    className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-luxury-700 mb-1">
                  Initial Password (min 6 characters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPartnerForm.password}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, password: e.target.value })}
                  placeholder="Set initial password"
                  className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-luxury-700 mb-1">
                  Store / Clinic Physical Address
                </label>
                <input
                  type="text"
                  value={newPartnerForm.address}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, address: e.target.value })}
                  placeholder="Shop #, Plaza, Street, Commercial Area"
                  className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-luxury-700 mb-1">
                  Admin Verification Notes / License Details
                </label>
                <textarea
                  rows={2}
                  value={newPartnerForm.notes}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, notes: e.target.value })}
                  placeholder="e.g. Verified optical license #, authorized clinic agreement"
                  className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-luxury-950 resize-none"
                />
              </div>

              {/* Instant Verification Toggle */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPartnerForm.isDirectlyVerified}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, isDirectlyVerified: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-emerald-950 block">
                      Auto-Verify Account Now (Recommended)
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Check this to grant immediate portal login access. If unchecked, this account will be created with status 'Pending Verification' from Main Admin.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerAdminModalOpen(false)}
                  className="px-4 py-2 text-luxury-600 hover:text-luxury-950 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-gold" />
                  <span>Create Partner Admin Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
