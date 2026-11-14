'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  Settings,
  Tag,
  Image as ImageIcon,
  Eye,
  Trash2,
  Edit,
  Plus,
  Download,
  RefreshCw,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  EyeOff,
  Phone,
  Truck,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import {
  Product,
  ProductSizeOption,
  parseSizeOption,
  formatSizeOption,
  ProductFlavorOption,
  parseFlavorOption,
  formatFlavorOption,
  Category,
  SubCategory,
  Banner,
  Order,
  OrderStatus,
  PaymentStatus,
  CustomCakeBooking,
  SiteSettings,
  Coupon,
} from '@/lib/types';
import {
  getAllProductsAdmin,
  saveProduct,
  deleteProduct,
  getCategories,
  saveCategory,
  deleteCategory,
  getSubCategories,
  saveSubCategory,
  deleteSubCategory,
  getBanners,
  saveBanner,
  deleteBanner,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getCustomCakeBookings,
  updateCustomCakeBookingStatus,
  deleteCustomCakeBooking,
  getSiteSettings,
  saveSiteSettings,
  getCoupons,
  saveCoupon,
  deleteCoupon,
} from '@/lib/db';
import { uploadImageAndGetUrl } from '@/lib/imageCompression';

const DEFAULT_ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PIN || 'cakehouse_sweetbites2026';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function AdminPage() {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Active Tab: 'dashboard' | 'products' | 'categories' | 'banners' | 'orders' | 'bookings' | 'settings' | 'coupons'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<CustomCakeBooking[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [productModal, setProductModal] = useState<{ open: boolean; item: Partial<Product> | null }>({
    open: false,
    item: null,
  });

  // Section toggle switches & structured attributes
  const [productHasSizes, setProductHasSizes] = useState<boolean>(true);
  const [productHasFlavors, setProductHasFlavors] = useState<boolean>(true);
  const [productHasDietary, setProductHasDietary] = useState<boolean>(true);
  const [productSizeRows, setProductSizeRows] = useState<ProductSizeOption[]>([
    { name: '2.5 lbs', price: 0 },
    { name: '3.5 lbs', price: 500 },
  ]);
  const [productFlavorRows, setProductFlavorRows] = useState<ProductFlavorOption[]>([
    { name: 'Chocolate Fudge', price: 0 },
    { name: 'Red Velvet', price: 0 },
  ]);
  const [productDietaryInput, setProductDietaryInput] = useState('Fresh Cream');

  const openAddProductModal = () => {
    setProductHasSizes(true);
    setProductHasFlavors(true);
    setProductHasDietary(true);
    setProductSizeRows([
      { name: '2.5 lbs', price: 0 },
      { name: '3.5 lbs', price: 500 },
    ]);
    setProductFlavorRows([
      { name: 'Chocolate Fudge', price: 0 },
      { name: 'Red Velvet', price: 0 },
    ]);
    setProductDietaryInput('Fresh Cream');
    setProductModal({
      open: true,
      item: {
        name: '',
        slug: '',
        description: '',
        price: 2500,
        discount_price: null,
        category_id: categories[0]?.id || 'cat-birthday',
        sub_category_id: null,
        has_sizes: true,
        has_flavors: true,
        has_dietary: true,
        sizes: [
          { name: '2.5 lbs', price: 0 },
          { name: '3.5 lbs', price: 500 },
        ],
        flavors: [
          { name: 'Chocolate Fudge', price: 0 },
          { name: 'Red Velvet', price: 0 },
        ],
        dietary_tags: ['Fresh Cream'],
        is_available: true,
        is_featured: false,
        is_flash_deal: false,
        thumbnail_url: '',
        gallery_urls: [],
      },
    });
  };

  const openEditProductModal = (prod: Product) => {
    setProductHasSizes(prod.has_sizes !== false);
    setProductHasFlavors(prod.has_flavors !== false);
    setProductHasDietary(prod.has_dietary !== false);

    const parsedSizes = (prod.sizes || []).map(parseSizeOption).filter((s) => s.name.length > 0);
    setProductSizeRows(
      parsedSizes.length > 0 ? parsedSizes : [{ name: '2.5 lbs', price: 0 }]
    );

    const parsedFlavors = (prod.flavors || []).map(parseFlavorOption).filter((f) => f.name.length > 0);
    setProductFlavorRows(
      parsedFlavors.length > 0 ? parsedFlavors : [{ name: 'Chocolate Fudge', price: 0 }]
    );

    setProductDietaryInput((prod.dietary_tags || []).join(', '));
    setProductModal({
      open: true,
      item: { ...prod },
    });
  };
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; item: Partial<Category> | null }>({
    open: false,
    item: null,
  });
  const [subCategoryModal, setSubCategoryModal] = useState<{ open: boolean; item: Partial<SubCategory> | null }>({
    open: false,
    item: null,
  });
  const [bannerModal, setBannerModal] = useState<{ open: boolean; item: Partial<Banner> | null }>({
    open: false,
    item: null,
  });
  const [couponModal, setCouponModal] = useState<{ open: boolean; item: Partial<Coupon> | null }>({
    open: false,
    item: null,
  });
  const [quotingBookingId, setQuotingBookingId] = useState<string | null>(null);
  const [quoteInput, setQuoteInput] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    title: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: '',
    onConfirm: async () => {},
  });
  const [imagePreviewModal, setImagePreviewModal] = useState<string | null>(null);
  const [printableInvoiceOrder, setPrintableInvoiceOrder] = useState<Order | null>(null);

  // Check auth session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('ch_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all admin data
  const loadAdminData = async () => {
    setIsSyncing(true);
    try {
      const [prods, cats, subs, bans, ords, books, sets, coups] = await Promise.all([
        getAllProductsAdmin(),
        getCategories(),
        getSubCategories(),
        getBanners(),
        getOrders(),
        getCustomCakeBookings(),
        getSiteSettings(),
        getCoupons(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setSubCategories(subs);
      setBanners(bans);
      setOrders(ords);
      setBookings(books);
      setSettings(sets);
      setCoupons(coups);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();

      // Silent 30s auto-sync refresh per user mandate
      const interval = setInterval(() => {
        loadAdminData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DEFAULT_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ch_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Master Password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ch_admin_auth');
  };

  // CSV Export for Products
  const handleExportProductsCSV = () => {
    if (products.length === 0) return;
    const headers = [
      'ID',
      'Name',
      'Slug',
      'Price (PKR)',
      'Discount Price',
      'Category ID',
      'SubCategory ID',
      'Available',
      'Featured',
      'Flash Deal',
      'Sizes',
      'Flavors',
      'Thumbnail URL',
    ];

    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.slug}"`,
      p.price,
      p.discount_price || '',
      `"${p.category_id}"`,
      `"${p.sub_category_id || ''}"`,
      p.is_available,
      p.is_featured,
      p.is_flash_deal,
      `"${p.sizes.join('; ')}"`,
      `"${p.flavors.join('; ')}"`,
      `"${p.thumbnail_url}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cake_house_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. PIN / Hard Password Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-chocolate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gold-300 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center mx-auto text-gold-700 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-serif font-bold text-xl md:text-2xl text-chocolate-900">
              Cake House Management Gate
            </h1>
            <p className="text-xs text-chocolate-900/60 mt-1">
              Authorized bakery administrators only. Enter your Master PIN to access the control panel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Master Password..."
                className="w-full text-xs md:text-sm px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-chocolate-900/50 hover:text-chocolate-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError && (
              <p className="text-xs text-red-600 font-semibold">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-chocolate-900 hover:bg-chocolate-800 text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition-all active:scale-[0.99]"
            >
              Unlock Admin Dashboard
            </button>
          </form>

          <div className="pt-2 border-t border-cream-200">
            <Link
              href="/"
              className="text-xs text-chocolate-900/50 hover:text-gold-600 transition-colors"
            >
              &larr; Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate High-Level Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.net_total, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Floating Animated Toast Notifications Container */}
      <div className="fixed top-5 right-5 z-[100] space-y-2 pointer-events-none max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all animate-slideIn ${
              t.type === 'success'
                ? 'bg-slate-900/95 text-emerald-300 border-emerald-500/40'
                : t.type === 'error'
                ? 'bg-slate-900/95 text-rose-300 border-rose-500/40'
                : 'bg-slate-900/95 text-gold-300 border-gold-500/40'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === 'info' && <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Fixed Left Sidebar Navigation (Does NOT scroll with right content) */}
      <aside className="w-64 bg-chocolate-950 text-cream-100 flex flex-col justify-between fixed inset-y-0 left-0 z-30 border-r border-gold-900/60 shadow-xl">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-chocolate-800 flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Cake House"
              className="w-10 h-10 rounded-full border border-gold-400"
            />
            <div>
              <h2 className="font-serif font-bold text-sm text-white">Cake House</h2>
              <p className="text-[10px] text-gold-400 font-medium">Administration</p>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="p-3 space-y-1 text-xs">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'products', label: 'Products & Cakes Hub', icon: Package, badge: products.length },
              { id: 'categories', label: 'Categories & Subcategories', icon: Layers },
              { id: 'banners', label: 'Banners Hub', icon: ImageIcon },
              { id: 'orders', label: 'Order Manager', icon: ShoppingBag, badge: pendingOrdersCount, badgeColor: 'bg-gold-500' },
              { id: 'bookings', label: 'Custom Cake Studio', icon: Sparkles, badge: pendingBookingsCount, badgeColor: 'bg-berry-500' },
              { id: 'coupons', label: 'Coupons & Vouchers', icon: Tag },
              { id: 'settings', label: 'Store & Payment Settings', icon: Settings },
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-gold-500 text-white font-bold shadow-sm'
                      : 'text-cream-200/80 hover:bg-chocolate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{menu.label}</span>
                  </div>
                  {menu.badge !== undefined && menu.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                        menu.badgeColor || 'bg-chocolate-800'
                      }`}
                    >
                      {menu.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Live Sync status & Logout */}
        <div className="p-4 border-t border-chocolate-800 space-y-3 bg-chocolate-900/60">
          <div className="flex items-center justify-between text-[11px] text-cream-300/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Cloud Database Sync</span>
            </span>
            <button
              onClick={loadAdminData}
              disabled={isSyncing}
              title="Manual Refresh"
              className="p-1 hover:text-gold-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-gold-400 hover:underline flex items-center gap-1"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              Lock & Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Right Scrollable Content Area */}
      <main className="flex-1 ml-64 p-6 md:p-8 min-h-screen">
        {/* ====================================================================
            TAB 1: DASHBOARD OVERVIEW
        ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                Dashboard Overview
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time snapshot of Karachi sales, active inventory, and pending celebrations.
              </p>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Total Revenue (Karachi)</span>
                <p className="text-2xl font-serif font-bold text-slate-900">
                  Rs. {totalRevenue.toLocaleString()}
                </p>
                <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
                  {orders.filter((o) => o.status === 'delivered').length} Delivered Orders
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Pending Orders</span>
                <p className="text-2xl font-serif font-bold text-gold-600">
                  {pendingOrdersCount}
                </p>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-[11px] text-gold-700 font-semibold hover:underline"
                >
                  Manage Orders &rarr;
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Custom Cake Requests</span>
                <p className="text-2xl font-serif font-bold text-berry-600">
                  {pendingBookingsCount}
                </p>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-[11px] text-berry-700 font-semibold hover:underline"
                >
                  View Custom Studio &rarr;
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Active Cake Products</span>
                <p className="text-2xl font-serif font-bold text-slate-900">
                  {products.length}
                </p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-[11px] text-slate-700 font-semibold hover:underline"
                >
                  Products Catalog &rarr;
                </button>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-serif font-bold text-sm text-slate-900">
                  Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-gold-600 hover:underline font-semibold"
                >
                  View All Orders &rarr;
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No orders placed yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">#{ord.order_number}</strong>
                          <span className="text-slate-500 font-medium">&bull; {ord.customer_name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {ord.delivery_date} ({ord.delivery_time_slot}) &bull; {ord.area}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">
                          Rs. {ord.net_total.toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            ord.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : ord.status === 'pending'
                              ? 'bg-gold-100 text-gold-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: PRODUCTS MANAGER (CSV Export, WebP uploader, Edit/Delete)
        ==================================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                  Products & Cakes Manager
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage cake offerings, prices, flavors, sizes, and multiple photos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportProductsCSV}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>

                <button
                  onClick={openAddProductModal}
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Cake</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Cake</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Flavors / Sizes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.thumbnail_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <strong className="block text-slate-900 font-semibold">{prod.name}</strong>
                              <span className="text-[10px] text-slate-400">/{prod.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">
                            {categories.find((c) => c.id === prod.category_id)?.name || prod.category_id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900">
                            Rs. {(prod.discount_price || prod.price).toLocaleString()}
                          </span>
                          {prod.discount_price && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              Rs. {prod.price.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs space-y-0.5">
                            <p className="truncate text-slate-600 font-medium">
                              {prod.has_flavors === false ? (
                                <span className="text-slate-400 italic text-[11px]">No flavors (Off)</span>
                              ) : (
                                (prod.flavors || [])
                                  .map(parseFlavorOption)
                                  .map(formatFlavorOption)
                                  .join(', ') || 'Standard'
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Sizes:{' '}
                              {prod.has_sizes === false ? (
                                <span className="italic">No sizes (Off)</span>
                              ) : (
                                (prod.sizes || [])
                                  .map(parseSizeOption)
                                  .map(formatSizeOption)
                                  .join(', ') || 'Standard'
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {prod.is_available ? (
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                                Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                                Sold Out
                              </span>
                            )}
                            {prod.is_flash_deal && (
                              <span className="text-[10px] font-bold text-berry-700 bg-berry-50 px-1.5 py-0.5 rounded">
                                Flash
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-gold-600 transition-colors"
                            title="Edit Cake"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                title: `Delete "${prod.name}"?`,
                                onConfirm: async () => {
                                  await deleteProduct(prod.id);
                                  await loadAdminData();
                                },
                              })
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Cake"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 3: CATEGORIES & SUBCATEGORIES (Daraz-Style Multi-Level)
        ==================================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                  Categories & Subcategories
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-tier Daraz-style hierarchy. Control homepage top categories and sub-sections.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setSubCategoryModal({
                      open: true,
                      item: {
                        category_id: categories[0]?.id || '',
                        name: '',
                        slug: '',
                        display_order: 1,
                      },
                    })
                  }
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  + Add Subcategory
                </button>
                <button
                  onClick={() =>
                    setCategoryModal({
                      open: true,
                      item: {
                        name: '',
                        slug: '',
                        description: '',
                        image_url: '',
                        is_top_category: true,
                        display_order: categories.length + 1,
                      },
                    })
                  }
                  className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  + Add Main Category
                </button>
              </div>
            </div>

            {/* Categories & Nested Subcategories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const subs = subCategories.filter((s) => s.category_id === cat.id);
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image_url}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="font-serif font-bold text-sm text-slate-900">
                            {cat.name}
                          </h3>
                          <span className="text-[10px] text-slate-400">/{cat.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCategoryModal({ open: true, item: cat })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-gold-600"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              title: `Delete Category "${cat.name}"?`,
                              onConfirm: async () => {
                                await deleteCategory(cat.id);
                                await loadAdminData();
                              },
                            })
                          }
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories (Daraz-style nested items) */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Subcategories ({subs.length}):
                      </h4>
                      {subs.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No subcategories yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {subs.map((sub) => (
                            <span
                              key={sub.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                            >
                              <span>{sub.name}</span>
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    open: true,
                                    title: `Delete Subcategory "${sub.name}"?`,
                                    onConfirm: async () => {
                                      await deleteSubCategory(sub.id);
                                      await loadAdminData();
                                    },
                                  })
                                }
                                className="text-slate-400 hover:text-red-600 ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 4: BANNERS HUB (Clean images, size mention, WebP compression)
        ==================================================================== */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                  Banners Hub
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage homepage visual hero banners. Recommended image size: <strong>1920 &times; 600 px (16:9 / 21:9)</strong>.
                </p>
              </div>

              <button
                onClick={() =>
                  setBannerModal({
                    open: true,
                    item: {
                      title: '',
                      image_url: '',
                      link_url: '/shop',
                      is_active: true,
                      display_order: banners.length + 1,
                    },
                  })
                }
                className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Banner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((ban) => (
                <div
                  key={ban.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-2 p-3"
                >
                  <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={ban.image_url}
                      alt={ban.title || 'Banner'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900">
                        {ban.title || 'Pure Image Banner'}
                      </h4>
                      <p className="text-[10px] text-slate-400">Links to: {ban.link_url || 'None'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBannerModal({ open: true, item: ban })}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-gold-600 transition-colors"
                        title="Edit Banner"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            title: `Delete banner "${ban.title || 'Untitled'}"?`,
                            onConfirm: async () => {
                              await deleteBanner(ban.id);
                              await loadAdminData();
                              showToast('Banner deleted successfully!', 'info');
                            },
                          })
                        }
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 5: ORDER MANAGER (Eye Proof viewer + Printable PDF Invoice)
        ==================================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                Customer Orders Hub
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Process orders, inspect JazzCash/EasyPaisa screenshots via the Eye button, and generate printable PDF invoices.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer & Location</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Payment & Proof</th>
                      <th className="py-3 px-4">Net Total</th>
                      <th className="py-3 px-4">Status Pipeline</th>
                      <th className="py-3 px-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 font-mono text-xs">
                            #{ord.order_number}
                          </strong>
                          <span className="block text-[10px] text-slate-400">
                            {ord.items.length} item(s)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="block text-slate-900 font-medium">
                            {ord.customer_name}
                          </strong>
                          <span className="text-[11px] text-slate-500 block">
                            {ord.customer_phone}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                            {ord.address}, {ord.area}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {ord.delivery_date}
                          </span>
                          <span className="text-[10px] text-slate-400">{ord.delivery_time_slot}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="uppercase font-bold text-slate-800 text-[11px] block">
                            {ord.payment_method}
                          </span>
                          {/* Payment proof Eye icon button */}
                          {ord.payment_proof_url ? (
                            <button
                              onClick={() => setImagePreviewModal(ord.payment_proof_url!)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-gold-700 bg-gold-100 hover:bg-gold-200 px-2 py-0.5 rounded-full mt-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Proof</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">No screenshot</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="font-serif text-slate-900 font-bold">
                            Rs. {ord.net_total.toLocaleString()}
                          </strong>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={ord.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as OrderStatus;
                              await updateOrderStatus(ord.id, newStatus);
                              await loadAdminData();
                              showToast(`Order #${ord.order_number} updated to "${newStatus}"!`, 'success');
                            }}
                            className="text-xs font-semibold py-1 px-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Baking</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPrintableInvoiceOrder(ord)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-gold-600 transition-colors inline-flex items-center gap-1"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">Invoice</span>
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  open: true,
                                  title: `Delete Order #${ord.order_number} for customer ${ord.customer_name}?`,
                                  onConfirm: async () => {
                                    await deleteOrder(ord.id);
                                    await loadAdminData();
                                    showToast(`Order #${ord.order_number} deleted!`, 'info');
                                  },
                                })
                              }
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* ====================================================================
            TAB 6: CUSTOM CAKE BOOKING STUDIO
        ==================================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                Custom Cake Request Studio
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review bespoke customer requests, inspect uploaded Pinterest/Instagram photos, and quote prices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gold-700 bg-gold-100 px-2 py-0.5 rounded">
                        {book.booking_reference}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-slate-900 mt-1">
                        {book.customer_name}
                      </h3>
                      <p className="text-xs text-slate-500">{book.customer_phone}</p>
                    </div>

                    {/* Reference photo Eye button */}
                    {book.reference_image_url && (
                      <button
                        onClick={() => setImagePreviewModal(book.reference_image_url!)}
                        className="flex items-center gap-1 text-xs font-bold text-gold-700 bg-gold-50 border border-gold-200 hover:bg-gold-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Photo</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Event Date:</span>
                      <strong>{book.event_date} ({book.pickup_time})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Weight & Tiers:</span>
                      <strong>{book.size_lbs} &bull; {book.tiers}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Flavor:</span>
                      <strong>{book.flavor}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Base:</span>
                      <strong>{book.cake_base}</strong>
                    </div>
                  </div>

                  {book.custom_message && (
                    <p className="text-xs text-gold-800 italic">
                      Message: &ldquo;{book.custom_message}&rdquo;
                    </p>
                  )}

                  {book.notes && (
                    <p className="text-xs text-slate-600 bg-cream-50 p-2 rounded-lg border border-cream-200">
                      Notes: {book.notes}
                    </p>
                  )}

                  {/* Quoted Price Manager */}
                  <div className="flex items-center justify-between p-2.5 bg-gold-50/60 rounded-xl border border-gold-200">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-chocolate-900">Quoted Price:</span>
                      <span className="font-serif font-bold text-xs text-gold-700">
                        {book.quoted_price ? `Rs. ${book.quoted_price.toLocaleString()}` : 'Not quoted yet'}
                      </span>
                    </div>
                    {quotingBookingId === book.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="PKR"
                          value={quoteInput}
                          onChange={(e) => setQuoteInput(e.target.value)}
                          className="w-24 p-1 text-xs border border-gold-300 rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const price = Number(quoteInput);
                            if (price > 0) {
                              await updateCustomCakeBookingStatus(book.id, 'quoted', price);
                              await loadAdminData();
                              setQuotingBookingId(null);
                              setQuoteInput('');
                              showToast(`Quoted Rs. ${price.toLocaleString()} for ${book.booking_reference}!`, 'success');
                            }
                          }}
                          className="px-2 py-1 bg-gold-600 hover:bg-gold-700 text-white font-bold rounded-md text-[10px]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuotingBookingId(null)}
                          className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setQuotingBookingId(book.id);
                          setQuoteInput(book.quoted_price ? String(book.quoted_price) : '');
                        }}
                        className="text-[10px] font-bold text-gold-700 hover:underline"
                      >
                        {book.quoted_price ? 'Update Price' : '+ Quote Price'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <a
                      href={`https://wa.me/92${book.customer_phone.replace(/[^0-9]/g, '').slice(1)}?text=Hello%20${encodeURIComponent(book.customer_name)},%20this%20is%20Sobia%20from%20Cake%20House%20regarding%20your%20custom%20cake%20booking%20(${book.booking_reference}).`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Customer</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <select
                        value={book.status}
                        onChange={async (e) => {
                          await updateCustomCakeBookingStatus(book.id, e.target.value);
                          await loadAdminData();
                          showToast(`Custom booking status set to "${e.target.value}"`, 'success');
                        }}
                        className="text-xs font-semibold py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="quoted">Quoted</option>
                        <option value="approved">Approved</option>
                        <option value="in_progress">Baking</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            title: `Delete custom cake request ${book.booking_reference} for ${book.customer_name}?`,
                            onConfirm: async () => {
                              await deleteCustomCakeBooking(book.id);
                              await loadAdminData();
                              showToast(`Booking ${book.booking_reference} deleted!`, 'info');
                            },
                          })
                        }
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 7: STORE SETTINGS & PAYMENT CHANNELS
        ==================================================================== */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                Store & Payment Accounts Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized management for contact info, delivery thresholds, and JazzCash/EasyPaisa/Bank accounts.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveSiteSettings(settings);
                showToast('Store & payment settings saved successfully to cloud database!', 'success');
              }}
              className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6"
            >
              {/* Identity & Delivery Rules */}
              <div>
                <h3 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 mb-4">
                  1. Store Identity & Delivery Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Helpline</label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Base Delivery Fee (PKR)</label>
                    <input
                      type="number"
                      value={settings.base_delivery_fee}
                      onChange={(e) => setSettings({ ...settings, base_delivery_fee: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Free Delivery Spend Threshold (PKR)</label>
                    <input
                      type="number"
                      value={settings.free_delivery_threshold}
                      onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Accounts */}
              <div>
                <h3 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 mb-4">
                  2. Payment Accounts Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* JazzCash */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <strong className="block text-slate-900">JazzCash Account</strong>
                    <div>
                      <label className="block text-[10px] text-slate-500">Account Title</label>
                      <input
                        type="text"
                        value={settings.jazzcash_account_title}
                        onChange={(e) => setSettings({ ...settings, jazzcash_account_title: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Mobile Account Number</label>
                      <input
                        type="text"
                        value={settings.jazzcash_account_number}
                        onChange={(e) => setSettings({ ...settings, jazzcash_account_number: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* EasyPaisa */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <strong className="block text-slate-900">EasyPaisa Account</strong>
                    <div>
                      <label className="block text-[10px] text-slate-500">Account Title</label>
                      <input
                        type="text"
                        value={settings.easypaisa_account_title}
                        onChange={(e) => setSettings({ ...settings, easypaisa_account_title: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Mobile Account Number</label>
                      <input
                        type="text"
                        value={settings.easypaisa_account_number}
                        onChange={(e) => setSettings({ ...settings, easypaisa_account_number: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div className="col-span-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <strong className="block text-slate-900">Bank Transfer (IBAN)</strong>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500">Bank Name</label>
                        <input
                          type="text"
                          value={settings.bank_name}
                          onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Account Title</label>
                        <input
                          type="text"
                          value={settings.bank_account_title}
                          onChange={(e) => setSettings({ ...settings, bank_account_title: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">IBAN / Account #</label>
                        <input
                          type="text"
                          value={settings.bank_iban}
                          onChange={(e) => setSettings({ ...settings, bank_iban: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Save All Settings
              </button>
            </form>
          </div>
        )}

        {/* ====================================================================
            TAB 8: COUPONS & VOUCHERS HUB
        ==================================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                  Coupons & Promo Codes
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage promotional discount codes for celebrations and marketing campaigns.
                </p>
              </div>

              <button
                onClick={() =>
                  setCouponModal({
                    open: true,
                    item: {
                      code: '',
                      discount_type: 'fixed',
                      discount_value: 300,
                      min_spend: 2500,
                      is_free_delivery: false,
                      is_active: true,
                    },
                  })
                }
                className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-gold-700 bg-gold-50 border border-gold-200 px-2.5 py-1 rounded-lg">
                      {cp.code}
                    </span>
                    <button
                      onClick={async () => {
                        await saveCoupon({ ...cp, is_active: !cp.is_active });
                        await loadAdminData();
                        showToast(`Coupon ${cp.code} is now ${!cp.is_active ? 'Active' : 'Inactive'}`, 'info');
                      }}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                        cp.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                      }`}
                      title="Click to toggle status"
                    >
                      {cp.is_active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {cp.is_free_delivery
                        ? 'Free Delivery in Karachi'
                        : cp.discount_type === 'percentage'
                        ? `${cp.discount_value}% Off`
                        : `Rs. ${cp.discount_value.toLocaleString()} Off`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Min Order Spend: Rs. {cp.min_spend.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setCouponModal({ open: true, item: cp })}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-gold-600 transition-colors"
                      title="Edit Coupon"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          open: true,
                          title: `Delete coupon code "${cp.code}"?`,
                          onConfirm: async () => {
                            await deleteCoupon(cp.id);
                            await loadAdminData();
                            showToast(`Coupon "${cp.code}" deleted successfully!`, 'info');
                          },
                        })
                      }
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          PRODUCT MODAL (Add / Edit Cake with WebP File Upload, Multi-Gallery & Full Specs)
      ==================================================================== */}
      {productModal.open && productModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 my-8 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-base md:text-lg text-slate-900">
                  {productModal.item.id ? 'Edit Cake Details' : 'Add New Celebration Cake'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fill in cake title, pricing, flavors, sizes, and upload multiple WebP photos.
                </p>
              </div>
              <button
                onClick={() => setProductModal({ open: false, item: null })}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const cleanSizes = productSizeRows
                  .map((s) => ({ name: s.name.trim(), price: Math.max(0, Number(s.price) || 0) }))
                  .filter((s) => s.name.length > 0);

                const cleanFlavors = productFlavorRows
                  .map((f) => ({ name: f.name.trim(), price: Math.max(0, Number(f.price) || 0) }))
                  .filter((f) => f.name.length > 0);

                const parsedDietary = productDietaryInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);

                const itemToSave: Partial<Product> = {
                  ...productModal.item!,
                  has_sizes: productHasSizes,
                  has_flavors: productHasFlavors,
                  has_dietary: productHasDietary,
                  sizes: productHasSizes
                    ? cleanSizes.length > 0
                      ? cleanSizes
                      : [{ name: 'Standard', price: 0 }]
                    : [],
                  flavors: productHasFlavors
                    ? cleanFlavors.length > 0
                      ? cleanFlavors
                      : [{ name: 'Standard Flavor', price: 0 }]
                    : [],
                  dietary_tags: productHasDietary
                    ? parsedDietary.length > 0
                      ? parsedDietary
                      : ['Handcrafted']
                    : [],
                };

                await saveProduct(itemToSave);
                await loadAdminData();
                setProductModal({ open: false, item: null });
                showToast(`Cake "${itemToSave.name}" saved successfully to cloud database!`, 'success');
              }}
              className="space-y-4 text-xs"
            >
              {/* Cake Name & Slug preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cake Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belgian Truffle Royale Cake"
                  value={productModal.item.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    setProductModal({
                      ...productModal,
                      item: { ...productModal.item, name, slug: autoSlug },
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-gold-500"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Catalog Link: /product/{productModal.item.slug || 'cake-title'}
                </p>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productModal.item.price || ''}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        item: { ...productModal.item, price: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Price (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={productModal.item.discount_price || ''}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        item: {
                          ...productModal.item,
                          discount_price: e.target.value ? Number(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="Leave blank if no discount"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Category & Dependent Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Category *</label>
                  <select
                    value={productModal.item.category_id || categories[0]?.id}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        item: {
                          ...productModal.item,
                          category_id: e.target.value,
                          sub_category_id: null,
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subcategory (Optional)</label>
                  <select
                    value={productModal.item.sub_category_id || ''}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        item: { ...productModal.item, sub_category_id: e.target.value || null },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">-- General (No Subcategory) --</option>
                    {subCategories
                      .filter((s) => s.category_id === (productModal.item?.category_id || categories[0]?.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Cover Photo Upload with Auto-WebP Compression */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">
                  Primary Thumbnail Photo (Auto-compressed to WebP in KBs) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        showToast('Compressing cover photo to WebP...', 'info');
                        const res = await uploadImageAndGetUrl(e.target.files[0], 'cake-images', 'products');
                        if (res.url) {
                          setProductModal({
                            ...productModal,
                            item: { ...productModal.item, thumbnail_url: res.url },
                          });
                          showToast('Cover photo uploaded successfully!', 'success');
                        }
                      }
                    }}
                    className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white file:font-semibold"
                  />
                  {productModal.item.thumbnail_url && (
                    <img
                      src={productModal.item.thumbnail_url}
                      alt="Thumbnail"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0 shadow-2xs"
                    />
                  )}
                </div>
              </div>

              {/* Multiple Gallery Images */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">
                  Multiple Gallery Photos (Upload multiple angles, auto-compressed)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const files = Array.from(e.target.files);
                      showToast(`Compressing & uploading ${files.length} gallery image(s)...`, 'info');
                      const newUrls: string[] = [];
                      for (const file of files) {
                        const res = await uploadImageAndGetUrl(file, 'cake-images', 'products/gallery');
                        if (res.url) newUrls.push(res.url);
                      }
                      setProductModal({
                        ...productModal,
                        item: {
                          ...productModal.item,
                          gallery_urls: [...(productModal.item?.gallery_urls || []), ...newUrls],
                        },
                      });
                      showToast(`Added ${newUrls.length} image(s) to gallery!`, 'success');
                    }
                  }}
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-chocolate-800 file:text-white file:font-semibold"
                />

                {/* Gallery Previews with Delete Pill */}
                {productModal.item.gallery_urls && productModal.item.gallery_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {productModal.item.gallery_urls.map((url, gIdx) => (
                      <div key={gIdx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-300">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = (productModal.item?.gallery_urls || []).filter((_, idx) => idx !== gIdx);
                            setProductModal({
                              ...productModal,
                              item: { ...productModal.item, gallery_urls: filtered },
                            });
                          }}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 1. SIZES & WEIGHTS SECTION (Toggle ON/OFF & Additional Price) */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">
                      Available Sizes / Weights &amp; Pricing
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Enable to offer weight tiers (e.g. 1.5 lbs, 2.5 lbs) with optional additional prices.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productHasSizes}
                      onChange={(e) => setProductHasSizes(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-600"></div>
                    <span className={`ml-2 text-[11px] font-bold ${productHasSizes ? 'text-gold-700' : 'text-slate-400'}`}>
                      {productHasSizes ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>

                {productHasSizes ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      {productSizeRows.map((row, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Size name (e.g. 2.5 lbs, Pack of 6)"
                              value={row.name}
                              onChange={(e) => {
                                const updated = [...productSizeRows];
                                updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                                setProductSizeRows(updated);
                              }}
                              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                          <div className="w-36 relative">
                            <span className="absolute left-2.5 top-2 text-[11px] text-slate-400 font-bold">
                              +Rs.
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              placeholder="0"
                              value={row.price === 0 ? '' : row.price}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                const updated = [...productSizeRows];
                                updated[sIdx] = { ...updated[sIdx], price: val };
                                setProductSizeRows(updated);
                              }}
                              className="w-full pl-10 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = productSizeRows.filter((_, idx) => idx !== sIdx);
                              setProductSizeRows(updated.length > 0 ? updated : [{ name: '', price: 0 }]);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove size option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProductSizeRows([...productSizeRows, { name: '', price: 0 }]);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-800 font-bold text-xs border border-gold-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Another Size Option
                      </button>
                      <span className="text-[11px] text-slate-500">
                        Enter <strong>0</strong> for base price, or extra PKR (e.g. <strong>500</strong>).
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Sizes are <strong>turned OFF</strong>. Customers will not see size options on the product page (ideal for gift boxes, accessories, or fixed items).
                    </span>
                  </div>
                )}
              </div>

              {/* 2. FLAVOR CHOICES SECTION (Toggle ON/OFF & Additional Price) */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">
                      Available Flavors &amp; Pricing
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Enable to offer flavor options (e.g. Belgian Fudge, Nutella) with optional additional prices.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productHasFlavors}
                      onChange={(e) => setProductHasFlavors(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-600"></div>
                    <span className={`ml-2 text-[11px] font-bold ${productHasFlavors ? 'text-gold-700' : 'text-slate-400'}`}>
                      {productHasFlavors ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>

                {productHasFlavors ? (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      {productFlavorRows.map((row, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Flavor name (e.g. Belgian Chocolate Ganache, Nutella Ferrero)"
                              value={row.name}
                              onChange={(e) => {
                                const updated = [...productFlavorRows];
                                updated[fIdx] = { ...updated[fIdx], name: e.target.value };
                                setProductFlavorRows(updated);
                              }}
                              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                          <div className="w-36 relative">
                            <span className="absolute left-2.5 top-2 text-[11px] text-slate-400 font-bold">
                              +Rs.
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              placeholder="0"
                              value={row.price === 0 ? '' : row.price}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                const updated = [...productFlavorRows];
                                updated[fIdx] = { ...updated[fIdx], price: val };
                                setProductFlavorRows(updated);
                              }}
                              className="w-full pl-10 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = productFlavorRows.filter((_, idx) => idx !== fIdx);
                              setProductFlavorRows(updated.length > 0 ? updated : [{ name: '', price: 0 }]);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove flavor option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProductFlavorRows([...productFlavorRows, { name: '', price: 0 }]);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-800 font-bold text-xs border border-gold-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Another Flavor Option
                      </button>
                      <span className="text-[11px] text-slate-500">
                        Enter <strong>0</strong> for base price, or extra PKR (e.g. <strong>300</strong>).
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Flavors are <strong>turned OFF</strong>. Flavor choice selector will be hidden on the product page.
                    </span>
                  </div>
                )}
              </div>

              {/* 3. QUALITY & DIETARY BADGES SECTION (Toggle ON/OFF) */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">
                      Quality &amp; Dietary Badges (Comma Separated)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Show highlight trust pills on product detail page (e.g. Fresh Cream, 100% Halal).
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productHasDietary}
                      onChange={(e) => setProductHasDietary(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-600"></div>
                    <span className={`ml-2 text-[11px] font-bold ${productHasDietary ? 'text-gold-700' : 'text-slate-400'}`}>
                      {productHasDietary ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>

                {productHasDietary ? (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. Fresh Cream, 100% Halal, Pure Butter, Eggless Available"
                      value={productDietaryInput}
                      onChange={(e) => setProductDietaryInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:border-gold-500 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {productDietaryInput
                        .split(',')
                        .map((b) => b.trim())
                        .filter(Boolean)
                        .map((badge, bIdx) => (
                          <span
                            key={bIdx}
                            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            {badge}
                          </span>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Badges are <strong>turned OFF</strong>. No dietary badges will be displayed on the product page.
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the layers, rich ganache, sponge softness, and celebration vibes..."
                  value={productModal.item.description || ''}
                  onChange={(e) =>
                    setProductModal({
                      ...productModal,
                      item: { ...productModal.item, description: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={productModal.item.is_available ?? true}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        item: { ...productModal.item, is_available: e.target.checked },
                      })
                    }
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <span>In Stock (Customer Can Order)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={productModal.item.is_featured ?? false}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        item: { ...productModal.item, is_featured: e.target.checked },
                      })
                    }
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <span>Featured Cake</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={productModal.item.is_flash_deal ?? false}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        item: { ...productModal.item, is_flash_deal: e.target.checked },
                      })
                    }
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <span>Flash Deal (Homepage Showcase)</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-bold shadow-sm transition-colors text-xs active:scale-[0.99]"
                >
                  Save Cake Product to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          CATEGORY MODAL
      ==================================================================== */}
      {categoryModal.open && categoryModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                {categoryModal.item.id ? 'Edit Category' : 'Add Main Category'}
              </h3>
              <button
                onClick={() => setCategoryModal({ open: false, item: null })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveCategory(categoryModal.item!);
                await loadAdminData();
                setCategoryModal({ open: false, item: null });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryModal.item.name || ''}
                  onChange={(e) =>
                    setCategoryModal({
                      ...categoryModal,
                      item: { ...categoryModal.item, name: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const res = await uploadImageAndGetUrl(e.target.files[0], 'cake-images', 'categories');
                      if (res.url) {
                        setCategoryModal({
                          ...categoryModal,
                          item: { ...categoryModal.item, image_url: res.url },
                        });
                      }
                    }
                  }}
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white file:font-semibold"
                />
                {categoryModal.item.image_url && (
                  <img
                    src={categoryModal.item.image_url}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 mt-2"
                  />
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={categoryModal.item.is_top_category ?? true}
                  onChange={(e) =>
                    setCategoryModal({
                      ...categoryModal,
                      item: { ...categoryModal.item, is_top_category: e.target.checked },
                    })
                  }
                  className="rounded text-gold-600"
                />
                <span>Show in Top Categories Marquee on Homepage</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUBCATEGORY MODAL
      ==================================================================== */}
      {subCategoryModal.open && subCategoryModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Add Subcategory
              </h3>
              <button
                onClick={() => setSubCategoryModal({ open: false, item: null })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveSubCategory(subCategoryModal.item!);
                await loadAdminData();
                setSubCategoryModal({ open: false, item: null });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent Main Category *</label>
                <select
                  value={subCategoryModal.item.category_id}
                  onChange={(e) =>
                    setSubCategoryModal({
                      ...subCategoryModal,
                      item: { ...subCategoryModal.item, category_id: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Lambeth, Belgian Fudge..."
                  value={subCategoryModal.item.name || ''}
                  onChange={(e) =>
                    setSubCategoryModal({
                      ...subCategoryModal,
                      item: { ...subCategoryModal.item, name: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                Save Subcategory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          BANNER MODAL (Add / Edit Hero Carousel Banner)
      ==================================================================== */}
      {bannerModal.open && bannerModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                {bannerModal.item.id ? 'Edit Homepage Banner' : 'Upload Homepage Banner'}
              </h3>
              <button
                onClick={() => setBannerModal({ open: false, item: null })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveBanner(bannerModal.item!);
                await loadAdminData();
                setBannerModal({ open: false, item: null });
                showToast('Banner saved successfully to cloud database!', 'success');
              }}
              className="space-y-4 text-xs"
            >
              <div className="p-3 bg-cream-100 rounded-xl text-chocolate-900 border border-gold-200">
                <p className="font-bold">Recommended Banner Dimensions:</p>
                <p className="text-[11px] text-chocolate-900/70 mt-0.5">
                  1920 &times; 600 px (or 16:9 ratio). Uploaded images are compressed to WebP automatically in KBs.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Title (For reference) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corporate Cake Orders Banner"
                  value={bannerModal.item.title || ''}
                  onChange={(e) =>
                    setBannerModal({
                      ...bannerModal,
                      item: { ...bannerModal.item, title: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination URL / Link</label>
                <input
                  type="text"
                  placeholder="e.g. /shop, /custom-cake, or /product/slug"
                  value={bannerModal.item.link_url || '/shop'}
                  onChange={(e) =>
                    setBannerModal({
                      ...bannerModal,
                      item: { ...bannerModal.item, link_url: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload Banner Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      showToast('Compressing banner to WebP...', 'info');
                      const res = await uploadImageAndGetUrl(e.target.files[0], 'cake-images', 'banners');
                      if (res.url) {
                        setBannerModal({
                          ...bannerModal,
                          item: { ...bannerModal.item, image_url: res.url },
                        });
                        showToast('Banner image uploaded successfully!', 'success');
                      }
                    }
                  }}
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white file:font-semibold"
                />
                {bannerModal.item.image_url && (
                  <img
                    src={bannerModal.item.image_url}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border border-slate-200 mt-2"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ban_active"
                  checked={bannerModal.item.is_active ?? true}
                  onChange={(e) =>
                    setBannerModal({
                      ...bannerModal,
                      item: { ...bannerModal.item, is_active: e.target.checked },
                    })
                  }
                  className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                />
                <label htmlFor="ban_active" className="cursor-pointer font-semibold text-slate-800">
                  Active (Show on Homepage Hero Carousel)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                Save Banner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          COUPON MODAL (Create / Edit Promotional Discount Code)
      ==================================================================== */}
      {couponModal.open && couponModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                {couponModal.item.id ? 'Edit Coupon Code' : 'Create New Promo Coupon'}
              </h3>
              <button
                onClick={() => setCouponModal({ open: false, item: null })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveCoupon(couponModal.item!);
                await loadAdminData();
                setCouponModal({ open: false, item: null });
                showToast(`Coupon "${couponModal.item?.code}" saved successfully!`, 'success');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EIDSPECIAL, SWEET20"
                  value={couponModal.item.code || ''}
                  onChange={(e) =>
                    setCouponModal({
                      ...couponModal,
                      item: { ...couponModal.item, code: e.target.value.toUpperCase() },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={couponModal.item.discount_type || 'fixed'}
                    onChange={(e) =>
                      setCouponModal({
                        ...couponModal,
                        item: { ...couponModal.item, discount_type: e.target.value as any },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="fixed">Fixed Amount (PKR)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponModal.item.discount_value || ''}
                    onChange={(e) =>
                      setCouponModal({
                        ...couponModal,
                        item: { ...couponModal.item, discount_value: Number(e.target.value) },
                      })
                    }
                    placeholder={couponModal.item.discount_type === 'percentage' ? 'e.g. 15' : 'e.g. 300'}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Order Spend (PKR)</label>
                <input
                  type="number"
                  min={0}
                  value={couponModal.item.min_spend || ''}
                  onChange={(e) =>
                    setCouponModal({
                      ...couponModal,
                      item: { ...couponModal.item, min_spend: Number(e.target.value) },
                    })
                  }
                  placeholder="e.g. 2500"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={couponModal.item.is_free_delivery ?? false}
                    onChange={(e) =>
                      setCouponModal({
                        ...couponModal,
                        item: { ...couponModal.item, is_free_delivery: e.target.checked },
                      })
                    }
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <span>Free Delivery Coupon (Waives Rs. 250 fee)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={couponModal.item.is_active ?? true}
                    onChange={(e) =>
                      setCouponModal({
                        ...couponModal,
                        item: { ...couponModal.item, is_active: e.target.checked },
                      })
                    }
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <span>Coupon Active (Customer can apply at checkout)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
              >
                Save Coupon Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          CUSTOM DELETE CONFIRMATION MODAL (NO WINDOW.CONFIRM / NO LOCALHOST POPUP)
      ==================================================================== */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                Confirm Permanent Deletion
              </h3>
              <p className="text-xs text-slate-500 mt-1">{deleteModal.title}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, title: '', onConfirm: async () => {} })}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteModal.onConfirm();
                  setDeleteModal({ open: false, title: '', onConfirm: async () => {} });
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          PAYMENT PROOF / REFERENCE PHOTO PREVIEW MODAL ("EYE" BUTTON)
      ==================================================================== */}
      {imagePreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setImagePreviewModal(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImagePreviewModal(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imagePreviewModal}
              alt="Payment Screenshot / Reference Photo"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          PRINTABLE HIGH-CONTRAST PURE-WHITE INVOICE MODAL (#printable-invoice)
      ==================================================================== */}
      {printableInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Actions Bar (Hidden during print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Cake House Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-chocolate-900 hover:bg-chocolate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4 text-gold-400" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setPrintableInvoiceOrder(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Container Styled for Crisp Printing */}
            <div
              id="printable-invoice"
              className="bg-white text-slate-900 p-6 border border-slate-200 rounded-xl space-y-6 text-xs"
            >
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h2 className="font-serif font-bold text-xl text-slate-900 tracking-tight">
                    Cake House
                  </h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Every Bite, A Little Happiness
                  </p>
                  <p className="text-slate-600 text-[11px] mt-1">
                    House A-200, Sector 36/B, Zamanabad, Landhi #4, Karachi
                  </p>
                  <p className="text-slate-600 text-[11px]">WhatsApp Helpline: 0302-9257271</p>
                </div>
                <div className="text-right">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    INVOICE
                  </h3>
                  <p className="font-mono text-slate-700 font-bold">
                    #{printableInvoiceOrder.order_number}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Date: {new Date(printableInvoiceOrder.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer & Delivery Spec */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="font-bold text-slate-500 text-[10px] uppercase">Billed / Delivered To:</span>
                  <p className="font-bold text-slate-900 text-sm">{printableInvoiceOrder.customer_name}</p>
                  <p className="text-slate-700">{printableInvoiceOrder.customer_phone}</p>
                  <p className="text-slate-600">{printableInvoiceOrder.address}, {printableInvoiceOrder.area}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-500 text-[10px] uppercase">Delivery Schedule:</span>
                  <p className="font-bold text-slate-900">{printableInvoiceOrder.delivery_date}</p>
                  <p className="text-slate-700">{printableInvoiceOrder.delivery_time_slot}</p>
                  <p className="text-slate-600 uppercase font-semibold text-[10px]">
                    Method: {printableInvoiceOrder.payment_method}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="text-[10px] uppercase text-slate-500 font-bold bg-slate-100">
                    <tr>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {printableInvoiceOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3">
                          <strong className="block text-slate-900">{it.product_name}</strong>
                          <span className="text-[10px] text-slate-500">
                            {it.selected_size} &bull; {it.selected_flavor}
                          </span>
                          {it.custom_message && (
                            <span className="block text-[10px] text-slate-600 italic">
                              Message: &ldquo;{it.custom_message}&rdquo;
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right">Rs. {it.unit_price.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          Rs. {it.total_price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="border-t border-slate-200 pt-3 space-y-1 text-right max-w-xs ml-auto">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>Rs. {printableInvoiceOrder.total_amount.toLocaleString()}</span>
                </div>
                {printableInvoiceOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Discount:</span>
                    <span>-Rs. {printableInvoiceOrder.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Karachi Delivery:</span>
                  <span>
                    {printableInvoiceOrder.delivery_fee === 0
                      ? 'FREE'
                      : `Rs. ${printableInvoiceOrder.delivery_fee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between font-serif font-bold text-base text-slate-900 pt-2 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span>Rs. {printableInvoiceOrder.net_total.toLocaleString()}</span>
                </div>
              </div>

              {/* Bakery Seal & Greeting */}
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
                <p>Thank you for letting Cake House sweeten your milestone celebration!</p>
                <p className="mt-0.5">Freshly baked in Landhi, Karachi &bull; Helpline: 0302-9257271</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
