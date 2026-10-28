import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, LogOut, Package, ShoppingCart, Settings,
  DollarSign, TrendingUp, Users, AlertTriangle, Plus, Edit, Trash2,
  Check, X, Eye, Phone, MapPin, Key, RefreshCw, FileSpreadsheet,
  Download, Copy, ExternalLink, MessageCircle, Send, CheckCircle2, Sparkles,
  Upload, Image as ImageIcon, Link as LinkIcon, Star, Compass,
  UserCheck, UserX, Clock, Building, Mail, ShieldAlert, BadgeCheck,
  Sun, Palette, Layers, Sliders, Calendar, Search
} from 'lucide-react';
import { Product, Order, StoreSettings, AutomationLog, OpticalShop, PartnerAdminAccount, AdminUser, LensCategory, LensTint, EyesightBooking } from '../../types';
import { formatCurrency } from '../../utils/format';

const LUXURY_PRESET_IMAGES = [
  { label: 'Obsidian Square Acetate', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gold Teardrop Aviator', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Amber Tortoise Cat-Eye', url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80' },
  { label: 'Japanese Beta-Titanium', url: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cyber BlueShield Round', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80' },
  { label: 'Heritage Horn-Rimmed', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' }
];

const getTintInfo = (tint: string | LensTint): { name: string; color: string } => {
  if (typeof tint === 'string') {
    const knownColors: Record<string, string> = {
      'Obsidian Black': '#1E2024',
      'Sapphire Blue': '#1E3A8A',
      'Amber Brown': '#78350F',
      'Emerald Green': '#065F46',
      'Graphite Grey': '#4B5563',
      'Ruby Amber': '#991B1B'
    };
    return { name: tint, color: knownColors[tint] || '#4B5563' };
  }
  return { name: tint.name, color: tint.color || '#4B5563' };
};

interface AdminDashboardProps {
  onExit: () => void;
  currency: 'PKR' | 'USD';
  exchangeRate: number;
  initialAuthMode?: 'login' | 'register';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit, currency, exchangeRate, initialAuthMode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nextvision_admin_token') || localStorage.getItem('ainak_admin_token'));
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('nextvision_admin_user') || localStorage.getItem('ainak_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Auth Card Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialAuthMode || 'login');

  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
    }
  }, [initialAuthMode]);

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

  // Tabs: 'stats' | 'products' | 'orders' | 'eyesightBookings' | 'partnerStores' | 'partnerAdmins' | 'automation' | 'settings' | 'lensCategories'
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'eyesightBookings' | 'partnerStores' | 'partnerAdmins' | 'automation' | 'settings' | 'lensCategories'>('stats');

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.username === 'darmuhammadabubakar9' || currentUser?.username === 'admin';

  // Guard activeTab if Partner Admin
  useEffect(() => {
    if (!isSuperAdmin && currentUser && ['orders', 'partnerStores', 'partnerAdmins', 'automation', 'lensCategories'].includes(activeTab)) {
      setActiveTab('stats');
    }
  }, [isSuperAdmin, currentUser, activeTab]);

  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [partnerStores, setPartnerStores] = useState<OpticalShop[]>([]);
  const [partnerStoreSearch, setPartnerStoreSearch] = useState('');
  const [editingPartnerStore, setEditingPartnerStore] = useState<Partial<OpticalShop> | null>(null);
  const [isPartnerStoreModalOpen, setIsPartnerStoreModalOpen] = useState(false);
  const [partnerStoreStatus, setPartnerStoreStatus] = useState<{ text: string; isError: boolean } | null>(null);

  // Eyesight Examination Bookings State (Specific Partner Bookings for Partner Admin, All Bookings for Main Admin)
  const [eyesightBookings, setEyesightBookings] = useState<EyesightBooking[]>([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedPartnerStoreFilter, setSelectedPartnerStoreFilter] = useState('All');
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [eyesightBookingStatus, setEyesightBookingStatus] = useState<{ text: string; isError: boolean } | null>(null);

  // Lens Categories State (SuperAdmin Only)
  const [lensCategories, setLensCategories] = useState<LensCategory[]>([]);
  const [editingLensCategory, setEditingLensCategory] = useState<Partial<LensCategory> | null>(null);
  const [isLensCategoryModalOpen, setIsLensCategoryModalOpen] = useState(false);
  const [lensCategoryStatus, setLensCategoryStatus] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSavingLensCategory, setIsSavingLensCategory] = useState(false);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newTintNameInput, setNewTintNameInput] = useState('');
  const [newTintHexInput, setNewTintHexInput] = useState('#2563EB');

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
      // 0. Fetch & verify current user profile
      try {
        const meRes = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setCurrentUser(meData.user);
            localStorage.setItem('nextvision_admin_user', JSON.stringify(meData.user));
          }
        } else if (meRes.status === 401 || meRes.status === 403) {
          handleLogout();
          return;
        }
      } catch (meErr) {
        console.warn("Could not refresh admin profile:", meErr);
      }

      // 1. Stats (Dashboards)
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // 2. Products (Catalog List)
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products);
      }

      // 3. Orders (Orders List - SuperAdmin Only)
      if (isSuperAdmin) {
        const orderRes = await fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData.orders || []);
        }
      } else {
        setOrders([]);
      }

      // 4. Settings
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData.settings);
        setSettingsForm(setData.settings);
      }

      // 5. Automation Logs (SuperAdmin only)
      if (isSuperAdmin) {
        try {
          const autoRes = await fetch('/api/admin/automation/logs', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (autoRes.ok) {
            const autoData = await autoRes.json();
            setAutomationLogs(autoData.logs || []);
          }
        } catch (e) {}

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
        } catch (e) {}
      }

      // 6. Partner Stores
      const storesRes = await fetch('/api/partner-stores');
      if (storesRes.ok) {
        const storesData = await storesRes.json();
        const validStores = (storesData.stores || []).filter((s: any) => s.isAdminAdded === true);
        setPartnerStores(validStores);
      }

      // 7. Lens Categories & Types (Live Store Configuration)
      try {
        const lensRes = await fetch('/api/lens-types');
        if (lensRes.ok) {
          const lensData = await lensRes.json();
          setLensCategories(lensData.categories || []);
        }
      } catch (lensErr) {
        console.warn("Could not fetch lens categories:", lensErr);
      }

      // 8. Eyesight Exam Bookings (Partner Admin gets appointments for their clinic; SuperAdmin gets all)
      try {
        const bookingsRes = await fetch('/api/admin/eyesight-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setEyesightBookings(bookingsData.bookings || []);
        }
      } catch (bookErr) {
        console.warn("Could not fetch eyesight bookings:", bookErr);
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

  // --- Eyesight Examination Booking Handlers ---
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: EyesightBooking['status'], notes?: string) => {
    setIsUpdatingBooking(true);
    setEyesightBookingStatus(null);
    try {
      const res = await fetch(`/api/admin/eyesight-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEyesightBookings(prev => prev.map(b => b.id === bookingId ? data.booking : b));
        setEyesightBookingStatus({
          text: `Booking #${bookingId.slice(-6).toUpperCase()} marked as ${newStatus}.`,
          isError: false
        });
      } else {
        setEyesightBookingStatus({
          text: data.error || 'Failed to update appointment status.',
          isError: true
        });
      }
    } catch (err: any) {
      setEyesightBookingStatus({
        text: err.message || 'Network error updating booking.',
        isError: true
      });
    } finally {
      setIsUpdatingBooking(false);
      setTimeout(() => setEyesightBookingStatus(null), 4000);
    }
  };

  const handleDeleteBooking = async (bookingId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete the appointment for ${patientName} (#${bookingId.slice(-6).toUpperCase()})?`)) {
      return;
    }
    setIsUpdatingBooking(true);
    try {
      const res = await fetch(`/api/admin/eyesight-bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEyesightBookings(prev => prev.filter(b => b.id !== bookingId));
        setEyesightBookingStatus({
          text: `Appointment for ${patientName} deleted successfully.`,
          isError: false
        });
      } else {
        setEyesightBookingStatus({
          text: data.error || 'Failed to delete booking.',
          isError: true
        });
      }
    } catch (err: any) {
      setEyesightBookingStatus({
        text: err.message || 'Network error deleting booking.',
        isError: true
      });
    } finally {
      setIsUpdatingBooking(false);
      setTimeout(() => setEyesightBookingStatus(null), 4000);
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

  // --- Lens Categories & Types Management Handlers (Main Admin) ---
  const handleOpenEditLensCategory = (cat: LensCategory) => {
    setEditingLensCategory({
      id: cat.id,
      name: cat.name,
      categoryKey: cat.categoryKey,
      badge: cat.badge || '',
      description: cat.description || '',
      price: cat.price || 0,
      features: [...(cat.features || [])],
      supportsPhotochromicTints: !!cat.supportsPhotochromicTints,
      availableTints: cat.availableTints ? [...cat.availableTints] : [],
      supportsPhotochromicToggle: !!cat.supportsPhotochromicToggle,
      photochromicAddonPrice: cat.photochromicAddonPrice || 0,
      isActive: cat.isActive !== false
    });
    setNewFeatureInput('');
    setNewTintNameInput('');
    setNewTintHexInput('#2563EB');
    setLensCategoryStatus(null);
    setIsLensCategoryModalOpen(true);
  };

  const handleOpenCreateLensCategory = () => {
    const nextNum = lensCategories.length + 1;
    setEditingLensCategory({
      name: `Custom Premium Optics Tier ${nextNum}`,
      categoryKey: `custom_lens_${Date.now()}`,
      badge: 'Custom Coating',
      description: 'High-index precision optical lens engineered for crystal visual clarity and durability.',
      price: 2500,
      features: [
        'Multi-layer anti-reflective coating',
        'Hydrophobic water & smudge resistance',
        '100% UV Protection'
      ],
      supportsPhotochromicTints: false,
      availableTints: [],
      supportsPhotochromicToggle: false,
      photochromicAddonPrice: 1500,
      isActive: true
    });
    setNewFeatureInput('');
    setNewTintNameInput('');
    setNewTintHexInput('#2563EB');
    setLensCategoryStatus(null);
    setIsLensCategoryModalOpen(true);
  };

  const handleSaveLensCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLensCategory || !editingLensCategory.name) {
      alert("Lens category name is required.");
      return;
    }

    setIsSavingLensCategory(true);
    try {
      const isNew = !editingLensCategory.id;
      const url = isNew ? '/api/admin/lens-types' : `/api/admin/lens-types/${editingLensCategory.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingLensCategory)
      });

      const data = await res.json();
      if (res.ok) {
        setLensCategoryStatus({
          text: `Lens Category "${editingLensCategory.name}" saved successfully!`,
          isError: false
        });
        setIsLensCategoryModalOpen(false);
        fetchAdminData();
      } else {
        alert(data.error || "Failed to save lens category.");
      }
    } catch (err: any) {
      alert(`Network error saving lens category: ${err.message}`);
    } finally {
      setIsSavingLensCategory(false);
    }
  };

  const handleDeleteLensCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the lens category "${name}" from customer options?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/lens-types/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLensCategoryStatus({
          text: `Lens Category "${name}" was deleted.`,
          isError: false
        });
        fetchAdminData();
      } else {
        alert(data.error || "Failed to delete lens category.");
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleResetLensCategories = async () => {
    if (!confirm("Are you sure you want to reset all lens categories back to the 5 official types (Blue Light, Photochromic with Tints, Anti-Glare + Blue-Cut, Ultra-HD Master with/without Photochromic, and Tri-Active Smart Glasses)? Any custom categories will be replaced.")) {
      return;
    }

    try {
      const res = await fetch('/api/admin/lens-types/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLensCategoryStatus({
          text: "Official 5 Lens Categories restored successfully!",
          isError: false
        });
        fetchAdminData();
      } else {
        alert(data.error || "Failed to reset lens categories.");
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleAddFeatureToEditingCategory = () => {
    if (!newFeatureInput.trim() || !editingLensCategory) return;
    const currentFeatures = editingLensCategory.features || [];
    setEditingLensCategory({
      ...editingLensCategory,
      features: [...currentFeatures, newFeatureInput.trim()]
    });
    setNewFeatureInput('');
  };

  const handleRemoveFeatureFromEditingCategory = (index: number) => {
    if (!editingLensCategory || !editingLensCategory.features) return;
    const updated = [...editingLensCategory.features];
    updated.splice(index, 1);
    setEditingLensCategory({ ...editingLensCategory, features: updated });
  };

  const handleAddTintToEditingCategory = () => {
    if (!newTintNameInput.trim() || !editingLensCategory) return;
    const currentTints = editingLensCategory.availableTints || [];
    const newTint: LensTint = {
      name: newTintNameInput.trim(),
      color: newTintHexInput || '#1E2024',
      description: `Transitions to deep ${newTintNameInput.trim()} in direct sunlight`
    };
    setEditingLensCategory({
      ...editingLensCategory,
      availableTints: [...currentTints, newTint]
    });
    setNewTintNameInput('');
  };

  const handleRemoveTintFromEditingCategory = (index: number) => {
    if (!editingLensCategory || !editingLensCategory.availableTints) return;
    const updated = [...editingLensCategory.availableTints];
    updated.splice(index, 1);
    setEditingLensCategory({ ...editingLensCategory, availableTints: updated });
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
                        Please contact the <strong>Main Store Administrator</strong> to review and approve your account.
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
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="w-full p-2.5 text-xs border border-luxury-300 rounded-lg focus:outline-none focus:border-luxury-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
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

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-white text-zinc-950 px-6 py-3.5 flex items-center justify-between border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {isSuperAdmin ? (
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-300 shrink-0">
              <ShieldCheck className="w-5 h-5 text-zinc-900" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-300 shrink-0">
              <Building className="w-5 h-5 text-zinc-800" />
            </div>
          )}

          <div>
            {isSuperAdmin ? (
              <>
                <h1 className="font-bold text-base tracking-wide flex items-center gap-2 text-zinc-950">
                  <span>NEXT VISION Control Console</span>
                  <span className="text-xs bg-zinc-100 text-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
                    <span>Main SuperAdmin</span>
                  </span>
                </h1>
                <p className="text-xs text-zinc-600 font-medium">
                  Master Storefront Catalog, Inventory & Partner Accounts
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-extrabold text-base sm:text-lg tracking-wide text-zinc-950 flex items-center gap-1.5">
                    <span className="uppercase tracking-wider font-extrabold text-zinc-950">
                      {currentUser?.storeName || 'Authorized Optical Clinic'}
                    </span>
                  </h1>
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Authorized Partner Clinic</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-700 flex items-center gap-2 mt-0.5 flex-wrap font-medium">
                  <span className="text-zinc-900 font-semibold">
                    <span className="text-zinc-500 font-normal">Optician:</span> {currentUser?.name || currentUser?.username}
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="flex items-center gap-1 text-zinc-800 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span>{currentUser?.city || 'Pakistan'}</span>
                  </span>
                  {currentUser?.address && (
                    <>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-600 hidden sm:inline truncate max-w-sm">{currentUser.address}</span>
                    </>
                  )}
                  {currentUser?.phone && (
                    <>
                      <span className="text-zinc-400">•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{currentUser.phone}</span>
                      </span>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Main Admin Pending Partner Verification Quick Notification Button */}
          {isSuperAdmin && pendingAdminsCount > 0 && (
            <button
              onClick={() => setActiveTab('partnerAdmins')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs animate-pulse"
              title="Click to view and verify pending partner admin accounts"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingAdminsCount} Partner Verification{pendingAdminsCount > 1 ? 's' : ''} Pending</span>
            </button>
          )}

          <button
            onClick={fetchAdminData}
            className="p-2 text-zinc-700 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 text-xs flex items-center gap-1 transition-colors border border-zinc-200 font-medium"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onExit}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-lg transition-colors border border-zinc-300 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> View Live Store
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div className="bg-white border-b border-zinc-200 px-6 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-zinc-950 text-zinc-950 font-bold'
              : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'products'
              ? 'border-zinc-950 text-zinc-950 font-bold'
              : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
          }`}
        >
          <Package className="w-4 h-4" /> Catalog Management ({products.length})
        </button>
        {/* Orders & Lab Prescriptions (Main Admin Only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-zinc-950 text-zinc-950 font-bold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
            }`}
          >
            <ShoppingCart className="w-4 h-4" /> Orders & Lab Prescriptions ({orders.length})
          </button>
        )}

        {/* Eyesight Examination Bookings (Specific Partner Clinic for Partner Admin, All Clinics for SuperAdmin) */}
        <button
          onClick={() => setActiveTab('eyesightBookings')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors relative ${
            activeTab === 'eyesightBookings'
              ? 'border-zinc-950 text-zinc-950 font-bold'
              : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>Eyesight Bookings</span>
          <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
            {eyesightBookings.length}
          </span>
        </button>

        {/* Store Locations (SuperAdmin only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('partnerStores')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'partnerStores'
                ? 'border-zinc-950 text-zinc-950 font-bold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
            }`}
          >
            <MapPin className="w-4 h-4 text-zinc-800" /> Store Locations ({partnerStores.filter(s => s.isAdminAdded === true).length})
          </button>
        )}

        {/* Partner Admins Management (Main Admin Only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('partnerAdmins')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors relative ${
              activeTab === 'partnerAdmins'
                ? 'border-zinc-950 text-zinc-950 font-bold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
            }`}
          >
            <UserCheck className="w-4 h-4 text-zinc-800" />
            <span>Partner Admins ({partnerAdmins.length})</span>
            {pendingAdminsCount > 0 && (
              <span className="bg-amber-500 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
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
                ? 'border-zinc-950 text-zinc-950 font-bold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Business Automations (Sheets & WhatsApp)
          </button>
        )}

        {/* Lens Categories & Types (SuperAdmin only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('lensCategories')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'lensCategories'
                ? 'border-zinc-950 text-zinc-950 font-bold'
                : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
            }`}
          >
            <Eye className="w-4 h-4 text-cyan-700" />
            <span>Lens Categories & Types</span>
            <span className="bg-cyan-100 text-cyan-900 text-xs font-bold px-2 py-0.5 rounded-full border border-cyan-300">
              {lensCategories.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-zinc-950 text-zinc-950 font-bold'
              : 'border-transparent text-zinc-600 hover:text-zinc-950 font-medium'
          }`}
        >
          <Settings className="w-4 h-4 text-zinc-700" />
          {isSuperAdmin ? 'Store Settings & Credentials' : 'My Profile & Password'}
        </button>
      </div>

      {/* Main Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 font-sans">

        {/* Partner Clinic Header Banner (Prominently displaying the partner's optical shop / clinic name) */}
        {!isSuperAdmin && (
          <div className="bg-white rounded-2xl p-6 border-2 border-zinc-200 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Authorized Optical Shop & Clinic</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Verified Partner</span>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-sans uppercase">
                  {currentUser?.storeName || 'Authorized Partner Optical Clinic'}
                </h2>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-zinc-700">
                  <span className="flex items-center gap-1.5 font-semibold text-zinc-900">
                    <MapPin className="w-4 h-4 text-zinc-700 shrink-0" />
                    <span>
                      {currentUser?.address ? `${currentUser.address}, ${currentUser?.city || 'Pakistan'}` : `${currentUser?.city || 'Pakistan'}`}
                    </span>
                  </span>

                  {currentUser?.phone && (
                    <span className="flex items-center gap-1.5 font-bold text-zinc-950">
                      <Phone className="w-4 h-4 text-zinc-700 shrink-0" />
                      <span>{currentUser.phone}</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                    <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Optician: <strong className="text-zinc-950 font-bold">{currentUser?.name || currentUser?.username}</strong> (@{currentUser?.username})</span>
                  </span>
                </div>
              </div>

              {/* Quick Clinic Stats / Navigation */}
              <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                <div
                  onClick={() => setActiveTab('eyesightBookings')}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl px-5 py-3 text-center cursor-pointer transition-colors"
                  title="Click to view scheduled eyesight examinations"
                >
                  <div className="text-xs text-emerald-800 uppercase tracking-wider font-bold">Clinic Eye Exams</div>
                  <div className="text-2xl font-extrabold font-sans text-emerald-950">{eyesightBookings.length}</div>
                </div>
                <div
                  onClick={() => setActiveTab('products')}
                  className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl px-5 py-3 text-center cursor-pointer transition-colors"
                  title="Click to view catalog inventory"
                >
                  <div className="text-xs text-zinc-700 uppercase tracking-wider font-bold">Catalog Frames</div>
                  <div className="text-2xl font-extrabold font-sans text-zinc-950">{products.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            {isSuperAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans">
                    {formatCurrency(stats.totalRevenue || 0, currency, exchangeRate)}
                  </div>
                  <p className="text-xs text-emerald-700 mt-1 font-bold">↑ 18.4% from last week</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider">Total Orders</span>
                    <ShoppingCart className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans">
                    {stats.totalOrders || 0}
                  </div>
                  <p className="text-xs text-zinc-600 mt-1 font-semibold">{orders.filter(o => o.status === 'Pending').length} Pending Dispatch</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider">AR Try-On Sessions</span>
                    <Eye className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans">
                    {stats.tryOnSessions}
                  </div>
                  <p className="text-xs text-zinc-600 mt-1 font-medium">Virtual optical fitting</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider">Catalog Inventory</span>
                    <Package className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans">
                    {stats.totalProducts} Frames
                  </div>
                  <p className="text-xs text-amber-700 mt-1 font-bold">{stats.lowStockCount} items near low-stock threshold</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider">Catalog Inventory</span>
                    <Package className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans">
                    {stats.totalProducts} Frames
                  </div>
                  <p className="text-xs text-amber-700 mt-1 font-bold">{stats.lowStockCount} items near low-stock threshold</p>
                </div>

                <div
                  onClick={() => setActiveTab('eyesightBookings')}
                  className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs cursor-pointer hover:border-emerald-600 hover:shadow-md transition-all group"
                  title="Click to view scheduled eyesight examination bookings"
                >
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Clinic Eye Exams</span>
                    <Calendar className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans flex items-center justify-between">
                    <span>{eyesightBookings.length} Booked</span>
                    <span className="text-xs text-emerald-700 font-bold group-hover:underline">View &rarr;</span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 font-bold">
                    {eyesightBookings.filter(b => b.status === 'Confirmed').length} Confirmed for {currentUser?.storeName || 'your clinic'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider">AR Try-On Sessions</span>
                    <Eye className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans">
                    {stats.tryOnSessions}
                  </div>
                  <p className="text-xs text-zinc-600 mt-1 font-medium">Virtual optical fitting</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-300 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-600 mb-2 font-bold">
                    <span className="text-xs uppercase tracking-wider">Optical Lens Types</span>
                    <Sparkles className="w-4 h-4 text-cyan-700" />
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950 font-sans">
                    {lensCategories.length} Active Options
                  </div>
                  <p className="text-xs text-cyan-800 mt-1 font-bold">Available in store customizer</p>
                </div>
              </div>
            )}

            {/* Main Admin Urgent Verification Alert Banner */}
            {isSuperAdmin && pendingAdminsCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                    <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-950 flex items-center gap-2">
                      <span>Action Required: {pendingAdminsCount} Partner Admin Account{pendingAdminsCount > 1 ? 's' : ''} Awaiting Main Admin Verification</span>
                      <span className="bg-amber-500 text-zinc-950 text-xs px-2 py-0.5 rounded-full font-bold">
                        Pending Approval
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-700 mt-0.5 font-medium">
                      Partner opticians have registered their clinics and are waiting for your verification to access store inventory.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('partnerAdmins')}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5 text-white" />
                  Review & Verify ({pendingAdminsCount})
                </button>
              </div>
            )}

            {/* Partner Admin Welcome Banner */}
            {!isSuperAdmin && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                    <BadgeCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950">
                      Welcome, {currentUser?.name || currentUser?.username}!
                    </h4>
                    <p className="text-xs text-zinc-700 mt-0.5 font-medium">
                      You are logged in as a <strong className="text-zinc-950 font-bold">Verified Partner Administrator</strong> for {currentUser?.storeName || 'Authorized Optical Clinic'}. You have access to add, update, and manage the eyewear product catalog and inventory.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders Overview (SuperAdmin Only) */}
            {isSuperAdmin ? (
              <div className="bg-white p-6 rounded-xl border border-zinc-300 shadow-xs">
                <h3 className="font-bold text-lg text-zinc-950 mb-4 font-sans">Recent Inbound Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 text-zinc-800 uppercase text-xs tracking-wider font-bold border-b border-zinc-200">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-zinc-900 font-medium">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-zinc-50">
                          <td className="p-3 font-mono font-bold text-zinc-950">{o.id}</td>
                          <td className="p-3 font-semibold text-zinc-950">{o.customer.name} ({o.customer.city})</td>
                          <td className="p-3">{o.items.length} frame(s)</td>
                          <td className="p-3 font-bold text-zinc-950 font-mono text-sm">{formatCurrency(o.total, currency, exchangeRate)}</td>
                          <td className="p-3">{o.paymentMethod}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              o.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              o.status === 'Shipped' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                              o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                              'bg-amber-100 text-amber-900 border border-amber-300'
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
            ) : (
              <div className="space-y-6">
                {/* Clinic Eyesight Exam Appointments Card (Partner Admin Specific Clinic View) */}
                <div className="bg-white p-6 rounded-xl border border-zinc-300 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-zinc-950 flex items-center gap-2 font-sans">
                        <Calendar className="w-5 h-5 text-emerald-700" />
                        <span>Clinic Eyesight Exam Appointments</span>
                        <span className="text-xs bg-emerald-100 text-emerald-900 font-sans font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                          {eyesightBookings.length} Booked
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-600 font-medium mt-0.5">
                        Patients scheduled for computerized eye exams and prescription tests at {currentUser?.storeName || 'your optical clinic'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('eyesightBookings')}
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Calendar className="w-3.5 h-3.5 text-white" />
                      <span>Manage All Bookings ({eyesightBookings.length})</span>
                    </button>
                  </div>

                  {eyesightBookings.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300 text-xs">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                      <p className="font-bold text-sm text-zinc-800">No eyesight exam appointments yet for your clinic.</p>
                      <p className="text-xs text-zinc-600 font-medium mt-1">When customers book eye tests via the Store Locator, they will appear here in real time.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-100 text-zinc-800 uppercase text-xs tracking-wider font-bold border-b border-zinc-200">
                          <tr>
                            <th className="p-3">Ref #</th>
                            <th className="p-3">Patient</th>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Services</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Quick Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-zinc-900 font-medium">
                          {eyesightBookings.slice(0, 5).map(b => (
                            <tr key={b.id} className="hover:bg-zinc-50">
                              <td className="p-3 font-mono font-bold text-zinc-950">#{b.id.slice(-6).toUpperCase()}</td>
                              <td className="p-3">
                                <span className="font-bold text-zinc-950 block">{b.customerName}</span>
                                <span className="text-zinc-600 font-medium text-xs">{b.customerPhone}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-zinc-900 block">{b.date}</span>
                                <span className="text-xs text-zinc-600 font-medium">{b.time}</span>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {b.services.slice(0, 2).map((s, idx) => (
                                    <span key={idx} className="bg-zinc-100 text-zinc-900 font-semibold border border-zinc-300 text-xs px-2 py-0.5 rounded">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  b.status === 'Completed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                  b.status === 'Cancelled' ? 'bg-zinc-100 text-zinc-700 border border-zinc-300' :
                                  'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <a
                                  href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${b.customerName}, regarding your eyesight exam appointment (#${b.id.slice(-6).toUpperCase()}) at ${b.shopName}...`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>WhatsApp</span>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Store Frame Inventory Quick View */}
                <div className="bg-white p-6 rounded-xl border border-zinc-300 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-zinc-950 font-sans">Store Frame Inventory Quick View</h3>
                      <p className="text-xs text-zinc-600 font-medium mt-0.5">Live eyewear models available for listing, editing and pricing</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5 text-white" />
                      <span>Manage Full Catalog</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-100 text-zinc-800 uppercase text-xs tracking-wider font-bold border-b border-zinc-200">
                        <tr>
                          <th className="p-3">Model</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Material</th>
                          <th className="p-3">Retail Price</th>
                          <th className="p-3">Stock Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-900 font-medium">
                        {products.slice(0, 5).map(p => (
                          <tr key={p.id} className="hover:bg-zinc-50">
                            <td className="p-3 font-bold text-zinc-950 flex items-center gap-2">
                              {p.images?.[0] && (
                                <img src={p.images[0]} alt="" className="w-9 h-9 rounded-md object-cover border border-zinc-300" />
                              )}
                              <span>{p.title}</span>
                            </td>
                            <td className="p-3 text-zinc-800 font-medium">{p.category}</td>
                            <td className="p-3 text-zinc-700 font-medium">{p.material}</td>
                            <td className="p-3 font-extrabold text-zinc-950 font-mono text-sm">{formatCurrency(p.basePrice, currency, exchangeRate)}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                p.stock > 10 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                                p.stock > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                'bg-red-100 text-red-900 border border-red-300'
                              }`}>
                                {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
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
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-2xl border-2 border-zinc-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100">
              <div>
                <h3 className="font-sans font-extrabold text-xl text-zinc-950 flex items-center gap-2">
                  <span>Eyewear Catalog Management</span>
                  {!isSuperAdmin && (
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-sans font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                      {currentUser?.storeName || 'Authorized Optical Clinic'}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-700 font-medium mt-0.5">Manage frame inventory, try-on calibrations, and customer pricing</p>
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
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Add New Frame</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 text-zinc-800 uppercase text-[11px] font-bold tracking-wider border-b-2 border-zinc-200">
                  <tr>
                    <th className="p-3">Frame</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Shape</th>
                    <th className="p-3">Stock Status</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80'}
                          alt={p.title}
                          className="w-12 h-10 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-sm text-zinc-950">{p.title}</p>
                          <p className="text-[11px] text-zinc-600 font-medium">{p.material}</p>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-zinc-800">{p.sku}</td>
                      <td className="p-3 font-semibold text-zinc-900">{p.category}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold text-[10px]">
                          {p.frameShape}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold inline-block ${
                          p.stock <= 15
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3 font-sans font-extrabold text-sm text-zinc-950">
                        {formatCurrency(p.salePrice || p.basePrice, currency, exchangeRate)}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
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
                          className="px-2.5 py-1.5 text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors"
                          title="Edit Frame"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg inline-flex items-center transition-colors"
                            title="Delete Frame (SuperAdmin only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT (SuperAdmin Only) */}
        {activeTab === 'orders' && isSuperAdmin && (
          <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-luxury-950">Customer Orders & Optical Lab Queue</h3>
                <p className="text-xs text-luxury-500">
                  {isSuperAdmin
                    ? 'Track shipments, verify doctor prescriptions, and issue courier tracking IDs'
                    : 'Real-time customer orders list, prescription details, and lab glazing records'}
                </p>
              </div>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="px-3.5 py-2 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              )}
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
                      {isSuperAdmin ? (
                        <>
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
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-luxury-600 font-medium">
                          <span>Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      )}
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
                      ) : isSuperAdmin ? (
                        <button
                          onClick={() => {
                            const track = prompt("Enter courier tracking number (e.g. TCS-99281726):");
                            if (track) handleUpdateOrderStatus(order.id, order.status, track);
                          }}
                          className="text-[11px] text-blue-600 hover:underline mt-1 block"
                        >
                          + Add Tracking Number
                        </button>
                      ) : (
                        <p className="text-luxury-400 text-[11px] mt-1">Tracking: Pending dispatch</p>
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
                    <MapPin className="w-5 h-5 text-gold" /> Store Locations (Admin Managed Only)
                  </h3>
                  <p className="text-xs text-luxury-500">
                    Only store locations directly added by the Administrator are displayed across the storefront and on the live map. Zero random stores.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddPartnerStore}
                  className="px-4 py-2 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4 text-gold" /> Add Store Location
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
                      .filter(s => s.isAdminAdded === true)
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

                    {partnerStores.filter(s => s.isAdminAdded === true).length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-luxury-400">
                          No store locations added yet. Click "+ Add Store Location" above to add your physical store address and map coordinates.
                        </td>
                      </tr>
                    )}
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
              <div className="bg-white p-5 rounded-2xl border-2 border-zinc-200 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0 border border-zinc-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-extrabold text-zinc-700 block tracking-wider">
                    Total Partner Admins
                  </span>
                  <span className="text-2xl font-sans font-extrabold text-zinc-950">
                    {partnerAdmins.length}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-xs flex items-center gap-3.5 bg-gradient-to-br from-amber-50 to-transparent">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
                  <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-extrabold text-amber-900 block tracking-wider">
                    Pending Verification
                  </span>
                  <span className="text-2xl font-sans font-extrabold text-amber-950">
                    {pendingAdminsCount}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-xs flex items-center gap-3.5 bg-gradient-to-br from-emerald-50 to-transparent">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-extrabold text-emerald-900 block tracking-wider">
                    Verified & Active
                  </span>
                  <span className="text-2xl font-sans font-extrabold text-emerald-950">
                    {partnerAdmins.filter(p => p.status === 'verified').length}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-zinc-200 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-extrabold text-zinc-700 block tracking-wider">
                    Rejected / Declined
                  </span>
                  <span className="text-2xl font-sans font-extrabold text-zinc-950">
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
            
            {/* Store Information Form (SuperAdmin only) or Partner Admin Clinic Profile (!isSuperAdmin) */}
            {isSuperAdmin ? (
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
            ) : (
              <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-champagne-100 text-champagne-800 rounded-full text-[11px] font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Authorized Partner Admin
                  </div>
                  <h3 className="font-serif font-bold text-lg text-luxury-950">
                    {currentUser?.storeName || 'Partner Optical Store'}
                  </h3>
                  <p className="text-xs text-luxury-500">
                    Verified optical clinic partnership managed under NEXT VISION Luxury Eyewear Network.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-luxury-50 p-4 rounded-xl border border-luxury-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">Optician In-Charge</span>
                    <span className="font-semibold text-luxury-900 text-sm">{currentUser?.name || 'Authorized Partner'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">Portal Username</span>
                    <span className="font-mono font-semibold text-luxury-800">@{currentUser?.username || 'partner'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">Assigned City</span>
                    <span className="font-medium text-luxury-800">{currentUser?.city || 'Pakistan'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">Account Status</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                      <Check className="w-3 h-3" /> Verified by Main Admin
                    </span>
                  </div>
                  {currentUser?.address && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">Clinic Address</span>
                      <span className="text-luxury-700">{currentUser.address}</span>
                    </div>
                  )}
                  {currentUser?.phone && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">Clinic Helpline</span>
                      <span className="text-luxury-700">{currentUser.phone}</span>
                    </div>
                  )}
                  {currentUser?.email && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-luxury-400 block tracking-wider">Registered Email</span>
                      <span className="text-luxury-700">{currentUser.email}</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-luxury-100/70 border border-luxury-200 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-luxury-900 flex items-center gap-1.5 text-xs">
                    <Check className="w-4 h-4 text-emerald-600" /> Active Role Privileges
                  </h4>
                  <ul className="text-[11px] text-luxury-700 space-y-1 list-disc list-inside">
                    <li><strong>Add New Eyewear:</strong> Create frames with specs, materials & images</li>
                    <li><strong>Change Eyewear:</strong> Edit pricing, stock availability, and specs</li>
                    <li><strong>List Products:</strong> Complete view of eyewear catalog</li>
                    <li><strong>Orders & Prescriptions:</strong> Full view of customer orders and optical prescriptions</li>
                    <li><strong>Overview Dashboard:</strong> View business metrics and sales analytics</li>
                  </ul>
                  <p className="text-[10px] text-luxury-500 pt-1 border-t border-luxury-200">
                    * Frame deletions, order status dispatch changes, store locator coordinates, and global store branding remain strictly governed by the Main Admin.
                  </p>
                </div>
              </div>
            )}

            {/* Admin Password Change (User Requirement) */}
            <div className="bg-white p-6 rounded-xl border border-luxury-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-luxury-950 flex items-center gap-2">
                  <Key className="w-4 h-4 text-champagne-600" />
                  {isSuperAdmin ? 'Main Admin Password & Security' : 'My Personal Partner Admin Password'}
                </h3>
                <p className="text-xs text-luxury-500">
                  {isSuperAdmin
                    ? 'Securely rotate Master Store Administrator access credentials (darmuhammadabubakar9)'
                    : `Update your personal Partner Admin account password for @${currentUser?.username || 'partner'} (Partner Admin can only change their personal password)`}
                </p>
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
                  {isSuperAdmin ? 'Update Main Admin Password' : 'Update My Personal Password'}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB: LENS CATEGORIES & TYPES CONFIGURATOR (SuperAdmin Only) */}
        {activeTab === 'lensCategories' && isSuperAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Control Header */}
            <div className="bg-white p-6 rounded-2xl border border-luxury-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
                    <Eye className="w-5 h-5" />
                  </span>
                  <h3 className="font-serif font-bold text-xl text-luxury-950">
                    Lens Categories & Optical Customizer
                  </h3>
                </div>
                <p className="text-xs text-luxury-600 mt-1 max-w-2xl">
                  Configure and <strong>rename live lens categories</strong> available to customers when customizing eyewear in the store. You can customize descriptions, upgrade pricing, daylight transition color palettes, and dual-ability photochromic toggles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetLensCategories}
                  className="px-4 py-2.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  title="Restore standard 5 lens types requested by store specs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-luxury-600" />
                  <span>Restore Standard 5 Types</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateLensCategory}
                  className="px-4 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-gold" />
                  <span>Add New Lens Category</span>
                </button>
              </div>
            </div>

            {/* Status Alert */}
            {lensCategoryStatus && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                  lensCategoryStatus.isError
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {lensCategoryStatus.isError ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{lensCategoryStatus.text}</span>
                </div>
                <button
                  onClick={() => setLensCategoryStatus(null)}
                  className="text-luxury-400 hover:text-luxury-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Overview of the 5 Core Store Types */}
            <div className="bg-gradient-to-r from-luxury-950 to-luxury-900 text-white p-5 rounded-2xl shadow-lg border border-luxury-800">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-gold" />
                <h4 className="font-serif font-bold text-sm tracking-wide text-gold">
                  Standard Optics Architecture (5 Built-in Types)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-cyan-300 mb-1">1. Blue Lens</div>
                  <p className="text-luxury-300 text-[11px] leading-relaxed">
                    Filters harmful screen glare from mobile phones, laptops & desktop monitors.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-purple-300 mb-1">2. Photochromic</div>
                  <p className="text-luxury-300 text-[11px] leading-relaxed">
                    Sunlight adaptive lens turning into black, sapphire blue, amber, or green in daylight.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-emerald-300 mb-1">3. Anti-Glare + Blue Cut</div>
                  <p className="text-luxury-300 text-[11px] leading-relaxed">
                    16-layer vacuum AR coating eliminating night headlight halos with blue cut defense.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-amber-300 mb-1">4. High-Quality Master</div>
                  <p className="text-luxury-300 text-[11px] leading-relaxed">
                    UV400 + mobile/laptop + anti-glare, with or without photochromic customer toggle.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-gold mb-1">5. Smart Glasses</div>
                  <p className="text-luxury-300 text-[11px] leading-relaxed">
                    Tri-active smart optics: blue cut + photochromic + anti-glare all in one lens.
                  </p>
                </div>
              </div>
            </div>

            {/* Lens Categories Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lensCategories.map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between p-5 relative overflow-hidden ${
                    cat.isActive === false ? 'opacity-60 border-luxury-200 bg-luxury-50/50' : 'border-luxury-200'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-champagne-100 text-champagne-900 border border-champagne-200">
                        {cat.badge || 'Precision Optics'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {cat.isActive !== false ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-luxury-500 bg-luxury-100 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category Title & Price */}
                    <div className="mb-2">
                      <h4 className="font-serif font-bold text-lg text-luxury-950 flex items-center gap-1.5">
                        <span>{cat.name}</span>
                      </h4>
                      <p className="font-sans font-extrabold text-champagne-700 text-base">
                        {formatCurrency(cat.price, currency, exchangeRate)}
                        <span className="text-[10px] font-normal text-luxury-500 ml-1">lens upgrade</span>
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-luxury-600 mb-4 leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>

                    {/* Bullet Features */}
                    <div className="space-y-1.5 mb-4 border-t border-luxury-100 pt-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-luxury-400 block mb-1">
                        Included Optical Features
                      </span>
                      {(cat.features || []).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5 text-xs text-luxury-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Sunlight Transition Tints (Photochromic) */}
                    {cat.supportsPhotochromicTints && (
                      <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200/80 mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sun className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span className="text-[11px] font-bold text-purple-950">
                            Sunlight Transition Tint Options ({cat.availableTints?.length || 0})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(cat.availableTints || []).map((tint, tIdx) => {
                            const tintInfo = getTintInfo(tint);
                            return (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-purple-200 text-[10px] font-semibold text-purple-950 shadow-xs"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: tintInfo.color }}
                                />
                                <span>{tintInfo.name}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Dual-Ability (With / Without Photochromic Toggle) */}
                    {cat.supportsPhotochromicToggle && (
                      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 mb-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sliders className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="text-[11px] font-bold text-amber-950">
                            Customer Dual-Ability Selection
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-tight">
                          Customer can choose <strong>With Photochromic</strong> (+{formatCurrency(cat.photochromicAddonPrice || 1500, currency, exchangeRate)}) or <strong>Without Photochromic</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-luxury-100 flex items-center justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditLensCategory(cat)}
                      className="flex-1 py-2 px-3 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-gold" />
                      <span>Rename / Edit Category</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLensCategory(cat.id, cat.name)}
                      className="p-2 text-luxury-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: EYESIGHT EXAMINATION BOOKINGS (Scored by Specific Partner Clinic for Partner Admin; All Clinics with Clinic Selector for Main Admin) */}
        {activeTab === 'eyesightBookings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-luxury-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-luxury-950 flex items-center gap-2">
                      <span>Eyesight Examination Bookings</span>
                      {!isSuperAdmin ? (
                        <span className="text-xs font-sans font-semibold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{currentUser?.storeName || 'Partner Clinic'}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-sans font-semibold bg-zinc-100 text-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Master Network View</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-luxury-600 mt-1">
                      {!isSuperAdmin
                        ? `Patients scheduled for computerized eyesight exams, lens fitting, and power check at ${currentUser?.storeName || 'your optical clinic'} (${currentUser?.city || 'Pakistan'}).`
                        : 'Oversee and manage customer eyesight exam appointments across all verified optical partner clinics in Pakistan.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Admin Clinic Switcher or Partner Info */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isSuperAdmin ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-luxury-600 whitespace-nowrap">Filter Clinic:</span>
                    <select
                      value={selectedPartnerStoreFilter}
                      onChange={(e) => setSelectedPartnerStoreFilter(e.target.value)}
                      className="p-2.5 text-xs font-semibold border border-luxury-300 rounded-xl bg-white focus:outline-none focus:border-luxury-950 shadow-xs"
                    >
                      <option value="All">All Partner Optical Shops ({eyesightBookings.length} total)</option>
                      {Array.from(new Set([
                        ...partnerStores.map(s => s.name),
                        ...eyesightBookings.map(b => b.shopName)
                      ])).filter(Boolean).map(shopName => {
                        const count = eyesightBookings.filter(b => b.shopName.toLowerCase() === shopName.toLowerCase()).length;
                        return (
                          <option key={shopName} value={shopName}>
                            {shopName} ({count} appointment{count === 1 ? '' : 's'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-900 font-medium">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Clinic: <strong>{currentUser?.storeName}</strong> ({currentUser?.city})</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={fetchAdminData}
                  className="p-2.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-700 rounded-xl transition-all"
                  title="Refresh Appointments"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Feedback Notification */}
            {eyesightBookingStatus && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                  eyesightBookingStatus.isError
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {eyesightBookingStatus.isError ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{eyesightBookingStatus.text}</span>
                </div>
                <button
                  onClick={() => setEyesightBookingStatus(null)}
                  className="text-luxury-400 hover:text-luxury-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* KPI Metric Cards */}
            {(() => {
              const scopedBookings = eyesightBookings.filter(b => {
                if (isSuperAdmin && selectedPartnerStoreFilter !== 'All') {
                  return b.shopName.toLowerCase() === selectedPartnerStoreFilter.toLowerCase();
                }
                return true;
              });

              const totalCount = scopedBookings.length;
              const confirmedCount = scopedBookings.filter(b => b.status === 'Confirmed').length;
              const completedCount = scopedBookings.filter(b => b.status === 'Completed').length;
              const cancelledCount = scopedBookings.filter(b => b.status === 'Cancelled').length;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    onClick={() => setBookingStatusFilter('all')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      bookingStatusFilter === 'all'
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                        : 'bg-white text-zinc-950 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="text-[11px] uppercase font-bold tracking-wider opacity-80 mb-1">
                      Total Bookings
                    </div>
                    <div className="text-3xl font-extrabold font-sans">{totalCount}</div>
                    <div className="text-xs font-semibold opacity-80 mt-1">All scheduled patients</div>
                  </div>

                  <div
                    onClick={() => setBookingStatusFilter('Confirmed')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      bookingStatusFilter === 'Confirmed'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                        : 'bg-white text-zinc-950 border-zinc-200 hover:border-emerald-500'
                    }`}
                  >
                    <div className="text-[11px] uppercase font-bold tracking-wider opacity-80 mb-1 flex items-center justify-between">
                      <span>Confirmed</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <div className="text-3xl font-extrabold font-sans">
                      <span className={bookingStatusFilter === 'Confirmed' ? 'text-white' : 'text-emerald-800'}>
                        {confirmedCount}
                      </span>
                    </div>
                    <div className="text-xs font-semibold opacity-80 mt-1">Upcoming appointments</div>
                  </div>

                  <div
                    onClick={() => setBookingStatusFilter('Completed')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      bookingStatusFilter === 'Completed'
                        ? 'bg-blue-800 text-white border-blue-800 shadow-md'
                        : 'bg-white text-zinc-950 border-zinc-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="text-[11px] uppercase font-bold tracking-wider opacity-80 mb-1">
                      Completed Exams
                    </div>
                    <div className="text-3xl font-extrabold font-sans">
                      <span className={bookingStatusFilter === 'Completed' ? 'text-white' : 'text-blue-800'}>
                        {completedCount}
                      </span>
                    </div>
                    <div className="text-xs font-semibold opacity-80 mt-1">Tests successfully done</div>
                  </div>

                  <div
                    onClick={() => setBookingStatusFilter('Cancelled')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      bookingStatusFilter === 'Cancelled'
                        ? 'bg-zinc-800 text-white border-zinc-800 shadow-md'
                        : 'bg-white text-zinc-950 border-zinc-200 hover:border-zinc-500'
                    }`}
                  >
                    <div className="text-[11px] uppercase font-bold tracking-wider opacity-80 mb-1">
                      Cancelled
                    </div>
                    <div className="text-3xl font-extrabold font-sans">
                      <span className={bookingStatusFilter === 'Cancelled' ? 'text-white' : 'text-zinc-700'}>
                        {cancelledCount}
                      </span>
                    </div>
                    <div className="text-xs font-semibold opacity-80 mt-1">Void / rescheduled</div>
                  </div>
                </div>
              );
            })()}

            {/* Filter Pills and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-luxury-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status Filter Tabs */}
              <div className="flex bg-luxury-100 p-1 rounded-xl text-xs font-semibold">
                {(['all', 'Confirmed', 'Completed', 'Cancelled'] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setBookingStatusFilter(tabKey)}
                    className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                      bookingStatusFilter === tabKey
                        ? 'bg-white text-luxury-950 shadow-xs font-bold'
                        : 'text-luxury-600 hover:text-luxury-950'
                    }`}
                  >
                    {tabKey === 'all' ? 'All Statuses' : tabKey}
                  </button>
                ))}
              </div>

              {/* Text Search Bar */}
              <div className="flex items-center gap-2 max-w-sm w-full bg-luxury-50 border border-luxury-200 px-3 py-2 rounded-xl text-xs">
                <Search className="w-4 h-4 text-luxury-400 shrink-0" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search patient, phone, booking ref #, or service..."
                  className="bg-transparent border-none focus:outline-none w-full text-luxury-900"
                />
                {bookingSearch && (
                  <button onClick={() => setBookingSearch('')} className="text-luxury-400 hover:text-luxury-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Appointments List / Table */}
            {(() => {
              const filteredList = eyesightBookings.filter(b => {
                if (isSuperAdmin && selectedPartnerStoreFilter !== 'All') {
                  if (b.shopName.toLowerCase() !== selectedPartnerStoreFilter.toLowerCase()) return false;
                }
                if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) {
                  return false;
                }
                if (bookingSearch.trim()) {
                  const q = bookingSearch.toLowerCase();
                  const matchName = b.customerName?.toLowerCase().includes(q);
                  const matchPhone = b.customerPhone?.toLowerCase().includes(q);
                  const matchEmail = b.customerEmail?.toLowerCase().includes(q);
                  const matchShop = b.shopName?.toLowerCase().includes(q);
                  const matchCity = b.shopCity?.toLowerCase().includes(q);
                  const matchId = b.id?.toLowerCase().includes(q);
                  const matchServices = (b.services || []).some(s => s.toLowerCase().includes(q));
                  if (!matchName && !matchPhone && !matchEmail && !matchShop && !matchCity && !matchId && !matchServices) {
                    return false;
                  }
                }
                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="bg-white rounded-2xl border border-luxury-200 p-12 text-center text-luxury-500 shadow-sm">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
                    <h4 className="font-serif font-bold text-base text-luxury-950 mb-1">
                      No Eyesight Exam Appointments Found
                    </h4>
                    <p className="text-xs text-luxury-500 max-w-md mx-auto">
                      {bookingSearch
                        ? `No bookings match your search query "${bookingSearch}". Try adjusting your keywords.`
                        : !isSuperAdmin
                        ? `There are currently no eye examination appointments scheduled for ${currentUser?.storeName || 'your clinic'}. When customers book online, they will appear here.`
                        : 'No appointments match the selected clinic filter.'}
                    </p>
                    {bookingSearch && (
                      <button
                        onClick={() => setBookingSearch('')}
                        className="mt-3 px-3 py-1.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-lg text-xs font-semibold"
                      >
                        Clear Search Filter
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredList.map(booking => {
                    const cleanPhone = booking.customerPhone.replace(/[^0-9]/g, '');
                    const whatsAppMsg = `Assalam-o-Alaikum ${booking.customerName},\nThis is ${booking.shopName} regarding your Free Computerized Eyesight Exam appointment (#${booking.id.slice(-6).toUpperCase()}) on ${booking.date} at ${booking.time}.\n\nPlease let us know if you need directions to our clinic. See you soon!`;
                    const whatsAppLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppMsg)}`;

                    return (
                      <div
                        key={booking.id}
                        className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md ${
                          booking.status === 'Completed'
                            ? 'border-blue-200 bg-blue-50/15'
                            : booking.status === 'Cancelled'
                            ? 'border-zinc-200 opacity-70 bg-zinc-50/40'
                            : 'border-luxury-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-luxury-100">
                          {/* Booking Ref & Clinic Name */}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              booking.status === 'Cancelled' ? 'bg-zinc-100 text-zinc-600' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-luxury-950">
                                  #{booking.id.slice(-6).toUpperCase()}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  booking.status === 'Completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  booking.status === 'Cancelled' ? 'bg-zinc-100 text-zinc-700 border border-zinc-200' :
                                  'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}>
                                  {booking.status === 'Confirmed' && '● '}
                                  {booking.status}
                                </span>
                              </div>
                              <p className="text-xs text-luxury-500 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                                <strong>{booking.shopName}</strong>
                                <span>• {booking.shopCity}</span>
                              </p>
                            </div>
                          </div>

                          {/* Quick Actions (WhatsApp, Direct Call, Status Change, Delete) */}
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={whatsAppLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                              title="Message patient on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Patient</span>
                            </a>

                            <a
                              href={`tel:${booking.customerPhone}`}
                              className="px-3 py-1.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              title="Call patient phone"
                            >
                              <Phone className="w-3.5 h-3.5 text-luxury-600" />
                              <span>{booking.customerPhone}</span>
                            </a>

                            {/* Status Changer Dropdown */}
                            <select
                              value={booking.status}
                              disabled={isUpdatingBooking}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as any)}
                              className="p-1.5 text-xs font-semibold rounded-lg border border-luxury-300 bg-white text-luxury-900 focus:outline-none focus:border-luxury-950"
                            >
                              <option value="Confirmed">Mark Confirmed</option>
                              <option value="Completed">Mark Completed</option>
                              <option value="Cancelled">Mark Cancelled</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(booking.id, booking.customerName)}
                              disabled={isUpdatingBooking}
                              className="p-2 text-luxury-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Appointment Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                          {/* Col 1: Patient Information */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-luxury-400 tracking-wider block">
                              Patient Details
                            </span>
                            <div className="font-bold text-sm text-luxury-950">{booking.customerName}</div>
                            <div className="text-luxury-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-luxury-400" />
                              <span>{booking.customerPhone}</span>
                            </div>
                            {booking.customerEmail && (
                              <div className="text-luxury-500 text-[11px] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-luxury-400" />
                                <span>{booking.customerEmail}</span>
                              </div>
                            )}
                          </div>

                          {/* Col 2: Appointment Time & Location */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-luxury-400 tracking-wider block">
                              Appointment Slot
                            </span>
                            <div className="font-semibold text-luxury-950 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{booking.date}</span>
                            </div>
                            <div className="text-luxury-700 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-champagne-600" />
                              <span>Time: <strong>{booking.time}</strong></span>
                            </div>
                            <div className="text-[11px] text-luxury-500 mt-1">
                              Address: {booking.shopAddress}
                            </div>
                          </div>

                          {/* Col 3: Services & Special Instructions */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-luxury-400 tracking-wider block">
                              Requested Services
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {booking.services.map((service, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold bg-luxury-100 text-luxury-800 px-2 py-0.5 rounded-md"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                            {booking.notes && (
                              <div className="mt-2 p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                                <strong>Patient Note:</strong> {booking.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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

      {/* Lens Category Edit / Rename Modal (SuperAdmin Only) */}
      {isLensCategoryModalOpen && editingLensCategory && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-luxury-200 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-luxury-100 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-50 rounded-lg text-cyan-700">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-luxury-950">
                    {editingLensCategory.id ? 'Rename & Configure Lens Category' : 'Create New Lens Category'}
                  </h4>
                  <p className="text-[11px] text-luxury-500">
                    Directly updates the customer-facing prescription & lens customizer options in the store
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLensCategoryModalOpen(false)}
                className="p-1 text-luxury-400 hover:text-luxury-950 rounded-lg hover:bg-luxury-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLensCategory} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Category Name (Rename field) */}
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
                <label className="block font-bold text-luxury-950 mb-1">
                  Category Display Name * (Customer Facing)
                </label>
                <input
                  type="text"
                  required
                  value={editingLensCategory.name || ''}
                  onChange={(e) => setEditingLensCategory({ ...editingLensCategory, name: e.target.value })}
                  placeholder="e.g. Photochromic Sunlight Adaptive Lenses"
                  className="w-full p-2.5 border border-amber-300 rounded-lg bg-white font-medium text-luxury-950 focus:outline-none focus:border-luxury-950 shadow-xs"
                />
                <p className="text-[10px] text-amber-800 mt-1">
                  You can rename this lens category to whatever title you want customers to see in the store customizer.
                </p>
              </div>

              {/* Badge & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Badge / Tagline
                  </label>
                  <input
                    type="text"
                    value={editingLensCategory.badge || ''}
                    onChange={(e) => setEditingLensCategory({ ...editingLensCategory, badge: e.target.value })}
                    placeholder="e.g. Screen Specialist, Light Adaptive"
                    className="w-full p-2 border border-luxury-300 rounded-lg bg-white focus:outline-none focus:border-luxury-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-luxury-700 mb-1">
                    Base Upgrade Price (PKR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={editingLensCategory.price !== undefined ? editingLensCategory.price : 0}
                    onChange={(e) => setEditingLensCategory({ ...editingLensCategory, price: Number(e.target.value) })}
                    className="w-full p-2 border border-luxury-300 rounded-lg bg-white font-mono focus:outline-none focus:border-luxury-950"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-luxury-700 mb-1">
                  Customer Description
                </label>
                <textarea
                  rows={2}
                  value={editingLensCategory.description || ''}
                  onChange={(e) => setEditingLensCategory({ ...editingLensCategory, description: e.target.value })}
                  placeholder="Explain optical defense, clarity, and daily benefits..."
                  className="w-full p-2 border border-luxury-300 rounded-lg bg-white focus:outline-none focus:border-luxury-950 resize-none"
                />
              </div>

              {/* Optical Features List */}
              <div className="bg-luxury-50 p-3.5 rounded-xl border border-luxury-200 space-y-2.5">
                <label className="block font-bold text-luxury-900">
                  Included Optical Features & Specs
                </label>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {(editingLensCategory.features || []).map((feat, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-luxury-200 rounded-lg text-luxury-800 text-[11px]"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureFromEditingCategory(fIdx)}
                        className="text-luxury-400 hover:text-red-600 ml-1"
                        title="Remove feature"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(!editingLensCategory.features || editingLensCategory.features.length === 0) && (
                    <span className="text-luxury-400 italic text-[11px]">No features added yet</span>
                  )}
                </div>

                {/* Add Feature Row */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeatureToEditingCategory();
                      }
                    }}
                    placeholder="e.g. 100% UV400 Protection or Anti-Glare Nano Layer"
                    className="flex-1 p-2 border border-luxury-300 rounded-lg bg-white text-xs focus:outline-none focus:border-luxury-950"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureToEditingCategory}
                    className="px-3 py-2 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-semibold"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Photochromic Daylight Tints Section */}
              <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950">
                  <input
                    type="checkbox"
                    checked={editingLensCategory.supportsPhotochromicTints || false}
                    onChange={(e) => setEditingLensCategory({
                      ...editingLensCategory,
                      supportsPhotochromicTints: e.target.checked
                    })}
                    className="rounded text-purple-700 focus:ring-purple-600"
                  />
                  <Sun className="w-4 h-4 text-purple-700" />
                  <span>Enable Sunlight Reactive Color Tints (Photochromic)</span>
                </label>

                {editingLensCategory.supportsPhotochromicTints && (
                  <div className="pl-6 space-y-3">
                    <p className="text-[11px] text-purple-800">
                      Customers will be able to select their preferred tint when choosing this lens (e.g. turning into Black, Blue, Amber, or Green under sunlight).
                    </p>

                    {/* Available Tints List */}
                    <div className="flex flex-wrap gap-2">
                      {(editingLensCategory.availableTints || []).map((tint, tIdx) => {
                        const tintInfo = getTintInfo(tint);
                        return (
                          <div
                            key={tIdx}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-purple-200 rounded-lg shadow-xs"
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: tintInfo.color }}
                            />
                            <span className="font-semibold text-purple-950 text-[11px]">{tintInfo.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTintFromEditingCategory(tIdx)}
                              className="text-luxury-400 hover:text-red-600 ml-1"
                              title="Remove color tint"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      {(!editingLensCategory.availableTints || editingLensCategory.availableTints.length === 0) && (
                        <span className="text-purple-600 italic text-[11px]">No transition tints configured yet</span>
                      )}
                    </div>

                    {/* Add Custom Tint */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newTintNameInput}
                        onChange={(e) => setNewTintNameInput(e.target.value)}
                        placeholder="Tint Name (e.g. Sapphire Blue)"
                        className="flex-1 p-2 border border-purple-300 rounded-lg bg-white text-xs focus:outline-none focus:border-purple-800"
                      />
                      <div className="flex items-center gap-1 bg-white p-1 border border-purple-300 rounded-lg">
                        <input
                          type="color"
                          value={newTintHexInput}
                          onChange={(e) => setNewTintHexInput(e.target.value)}
                          className="w-6 h-6 border-0 p-0 rounded cursor-pointer"
                          title="Pick hex color"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTintToEditingCategory}
                        className="px-3 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold"
                      >
                        + Add Tint
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-purple-700 font-medium">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingLensCategory.availableTints || [];
                          if (!current.some(t => getTintInfo(t).name.toLowerCase().includes('black'))) {
                            setEditingLensCategory({
                              ...editingLensCategory,
                              availableTints: [...current, { name: 'Obsidian Black', color: '#1E2024', description: 'Deep obsidian shade' }]
                            });
                          }
                        }}
                        className="px-2 py-0.5 bg-white border border-purple-200 rounded text-[10px] text-purple-900 hover:bg-purple-100"
                      >
                        + Black
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingLensCategory.availableTints || [];
                          if (!current.some(t => getTintInfo(t).name.toLowerCase().includes('blue'))) {
                            setEditingLensCategory({
                              ...editingLensCategory,
                              availableTints: [...current, { name: 'Sapphire Blue', color: '#1E3A8A', description: 'Vibrant sapphire blue shade' }]
                            });
                          }
                        }}
                        className="px-2 py-0.5 bg-white border border-purple-200 rounded text-[10px] text-purple-900 hover:bg-purple-100"
                      >
                        + Blue
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingLensCategory.availableTints || [];
                          if (!current.some(t => getTintInfo(t).name.toLowerCase().includes('amber') || getTintInfo(t).name.toLowerCase().includes('brown'))) {
                            setEditingLensCategory({
                              ...editingLensCategory,
                              availableTints: [...current, { name: 'Amber Brown', color: '#78350F', description: 'Rich amber brown shade' }]
                            });
                          }
                        }}
                        className="px-2 py-0.5 bg-white border border-purple-200 rounded text-[10px] text-purple-900 hover:bg-purple-100"
                      >
                        + Amber
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingLensCategory.availableTints || [];
                          if (!current.some(t => getTintInfo(t).name.toLowerCase().includes('green'))) {
                            setEditingLensCategory({
                              ...editingLensCategory,
                              availableTints: [...current, { name: 'Emerald Green', color: '#065F46', description: 'Sleek emerald green shade' }]
                            });
                          }
                        }}
                        className="px-2 py-0.5 bg-white border border-purple-200 rounded text-[10px] text-purple-900 hover:bg-purple-100"
                      >
                        + Green
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dual-Ability Option (With / Without Photochromic Toggle - Type 4) */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                  <input
                    type="checkbox"
                    checked={editingLensCategory.supportsPhotochromicToggle || false}
                    onChange={(e) => setEditingLensCategory({
                      ...editingLensCategory,
                      supportsPhotochromicToggle: e.target.checked
                    })}
                    className="rounded text-amber-700 focus:ring-amber-600"
                  />
                  <Sliders className="w-4 h-4 text-amber-700" />
                  <span>Enable Dual-Ability Customer Toggle (With vs Without Photochromic)</span>
                </label>

                {editingLensCategory.supportsPhotochromicToggle && (
                  <div className="pl-6 space-y-2">
                    <p className="text-[11px] text-amber-800">
                      Customer can toggle between "Without Photochromic (Standard)" and "With Photochromic (Daylight Adaptive)".
                    </p>
                    <div>
                      <label className="block font-semibold text-amber-950 mb-1">
                        Photochromic Upgrade Add-on Price (PKR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={editingLensCategory.photochromicAddonPrice !== undefined ? editingLensCategory.photochromicAddonPrice : 1500}
                        onChange={(e) => setEditingLensCategory({
                          ...editingLensCategory,
                          photochromicAddonPrice: Number(e.target.value)
                        })}
                        className="w-full p-2 border border-amber-300 rounded-lg bg-white font-mono focus:outline-none focus:border-amber-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-luxury-50 rounded-xl border border-luxury-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-luxury-950 block">Active Status</span>
                  <span className="text-[11px] text-luxury-500">
                    When active, customers can choose this lens option in the store customizer.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLensCategory.isActive !== false}
                    onChange={(e) => setEditingLensCategory({
                      ...editingLensCategory,
                      isActive: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-luxury-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-luxury-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLensCategoryModalOpen(false)}
                  className="px-4 py-2 text-luxury-600 hover:text-luxury-950 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLensCategory}
                  className="px-5 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {isSavingLensCategory ? (
                    <span>Saving Category...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-gold" />
                      <span>{editingLensCategory.id ? 'Save & Apply Changes' : 'Create Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
