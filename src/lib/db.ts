import { supabase } from './supabase';
import {
  Product,
  Category,
  SubCategory,
  Banner,
  Order,
  OrderStatus,
  PaymentStatus,
  CustomCakeBooking,
  SiteSettings,
  Coupon,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUB_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_SITE_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
} from './seedData';

// LocalStorage Keys for resilient tier-2 caching
const STORAGE_KEYS = {
  PRODUCTS: 'ch_products_v1',
  CATEGORIES: 'ch_categories_v1',
  SUB_CATEGORIES: 'ch_sub_categories_v1',
  BANNERS: 'ch_banners_v1',
  ORDERS: 'ch_orders_v1',
  BOOKINGS: 'ch_bookings_v1',
  SETTINGS: 'ch_settings_v1',
  COUPONS: 'ch_coupons_v1',
};

// Helper: Safely get from LocalStorage
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper: Safely set to LocalStorage
function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`LocalStorage write failed for ${key}:`, err);
  }
}

// Helper: Dispatch cross-tab & reactive events
export function dispatchDataEvent(eventName: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {}
}

/* ============================================================================
   1. PRODUCTS CRUD & QUERIES (Selective Projections, Zero SELECT *)
============================================================================ */
const PRODUCT_PROJECTION =
  'id, name, slug, description, price, discount_price, category_id, sub_category_id, thumbnail_url, gallery_urls, is_available, is_featured, is_flash_deal, rating, reviews_count, sizes, flavors, dietary_tags, has_sizes, has_flavors, has_dietary, created_at, updated_at';

export async function getProducts(options?: {
  categoryId?: string;
  subCategoryId?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
  flashDeals?: boolean;
  searchQuery?: string;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select(PRODUCT_PROJECTION)
      .eq('is_available', true);

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.subCategoryId) {
      query = query.eq('sub_category_id', options.subCategoryId);
    }
    if (options?.featured) {
      query = query.eq('is_featured', true);
    }
    if (options?.flashDeals) {
      query = query.eq('is_flash_deal', true);
    }

    // Always order by created_at descending so newest additions appear FIRST
    query = query.order('created_at', { ascending: false });

    if (options?.limit) {
      const from = options.offset || 0;
      query = query.range(from, from + options.limit - 1);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      // Update local storage tier
      const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const merged = [...data, ...current.filter((c) => !data.some((d) => d.id === c.id))];
      setLocal(STORAGE_KEYS.PRODUCTS, merged);
      return filterProductsLocally(data, options?.searchQuery);
    }
  } catch (err) {
    console.warn('Supabase getProducts remote fetch failed, using fallback:', err);
  }

  // Tier 2: Resilient Local Fallback
  let localProducts = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (!localProducts || localProducts.length === 0) {
    localProducts = INITIAL_PRODUCTS;
    setLocal(STORAGE_KEYS.PRODUCTS, localProducts);
  }

  let filtered = localProducts.filter((p) => p.is_available);
  if (options?.categoryId) {
    filtered = filtered.filter((p) => p.category_id === options.categoryId);
  }
  if (options?.subCategoryId) {
    filtered = filtered.filter((p) => p.sub_category_id === options.subCategoryId);
  }
  if (options?.featured) {
    filtered = filtered.filter((p) => p.is_featured);
  }
  if (options?.flashDeals) {
    filtered = filtered.filter((p) => p.is_flash_deal);
  }
  if (options?.searchQuery) {
    filtered = filterProductsLocally(filtered, options.searchQuery);
  }

  // Sort descending by created_at
  filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  if (options?.limit) {
    const from = options.offset || 0;
    filtered = filtered.slice(from, from + options.limit);
  }

  return filtered;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_PROJECTION)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLocal(STORAGE_KEYS.PRODUCTS, data);
      return data;
    }
  } catch {}

  return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_PROJECTION)
      .eq('slug', slug)
      .single();

    if (!error && data) return data;
  } catch {}

  const local = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return local.find((p) => p.slug === slug) || null;
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const isNew = !product.id;
  const id = product.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const completeProduct: Product = {
    id,
    name: product.name || 'New Cake',
    slug: product.slug || slugify(product.name || 'new-cake'),
    description: product.description || '',
    price: Number(product.price) || 0,
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    category_id: product.category_id || 'cat-birthday',
    sub_category_id: product.sub_category_id || null,
    thumbnail_url: product.thumbnail_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80',
    gallery_urls: product.gallery_urls || [],
    is_available: product.is_available ?? true,
    is_featured: product.is_featured ?? false,
    is_flash_deal: product.is_flash_deal ?? false,
    rating: product.rating ?? 5.0,
    reviews_count: product.reviews_count ?? 1,
    has_sizes: product.has_sizes ?? true,
    has_flavors: product.has_flavors ?? true,
    has_dietary: product.has_dietary ?? true,
    sizes: product.sizes !== undefined ? product.sizes : ['2.5 lbs'],
    flavors: product.flavors !== undefined ? product.flavors : ['Chocolate Fudge'],
    dietary_tags: product.dietary_tags !== undefined ? product.dietary_tags : ['Fresh Cream'],
    created_at: product.created_at || now,
    updated_at: now,
  };

  // 1. Write to Remote Database
  try {
    await supabase.from('products').upsert(completeProduct);
  } catch (err) {
    console.warn('Supabase saveProduct write error:', err);
  }

  // 2. Write to LocalStorage
  const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = isNew
    ? [completeProduct, ...current]
    : current.map((p) => (p.id === id ? completeProduct : p));
  setLocal(STORAGE_KEYS.PRODUCTS, updated);

  dispatchDataEvent('kb_products_updated');
  return completeProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteProduct error:', err);
  }

  const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PRODUCTS, updated);

  dispatchDataEvent('kb_products_updated');
  return true;
}

/* ============================================================================
   2. CATEGORIES & SUB-CATEGORIES CRUD
============================================================================ */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, is_top_category, display_order')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.CATEGORIES, data);
      return data;
    }
  } catch {}

  const local = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  return local && local.length > 0 ? local : INITIAL_CATEGORIES;
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const isNew = !category.id;
  const id = category.id || `cat-${Date.now()}`;

  const completeCategory: Category = {
    id,
    name: category.name || 'New Category',
    slug: category.slug || slugify(category.name || 'new-category'),
    description: category.description || '',
    image_url: category.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    is_top_category: category.is_top_category ?? true,
    display_order: Number(category.display_order) || 1,
    created_at: category.created_at || new Date().toISOString(),
  };

  try {
    await supabase.from('categories').upsert(completeCategory);
  } catch (err) {
    console.warn('Supabase saveCategory error:', err);
  }

  const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = isNew
    ? [...current, completeCategory]
    : current.map((c) => (c.id === id ? completeCategory : c));
  setLocal(STORAGE_KEYS.CATEGORIES, updated);

  dispatchDataEvent('kb_categories_updated');
  return completeCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await supabase.from('categories').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteCategory error:', err);
  }

  const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = current.filter((c) => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, updated);

  dispatchDataEvent('kb_categories_updated');
  return true;
}

export async function getSubCategories(categoryId?: string): Promise<SubCategory[]> {
  try {
    let query = supabase
      .from('sub_categories')
      .select('id, category_id, name, slug, display_order')
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setLocal(STORAGE_KEYS.SUB_CATEGORIES, data);
      return data;
    }
  } catch {}

  const local = getLocal<SubCategory[]>(STORAGE_KEYS.SUB_CATEGORIES, INITIAL_SUB_CATEGORIES);
  return categoryId ? local.filter((s) => s.category_id === categoryId) : local;
}

export async function saveSubCategory(sub: Partial<SubCategory>): Promise<SubCategory> {
  const isNew = !sub.id;
  const id = sub.id || `sub-${Date.now()}`;

  const completeSub: SubCategory = {
    id,
    category_id: sub.category_id!,
    name: sub.name || 'New Subcategory',
    slug: sub.slug || slugify(sub.name || 'new-sub'),
    display_order: Number(sub.display_order) || 1,
    created_at: sub.created_at || new Date().toISOString(),
  };

  try {
    await supabase.from('sub_categories').upsert(completeSub);
  } catch (err) {
    console.warn('Supabase saveSubCategory error:', err);
  }

  const current = getLocal<SubCategory[]>(STORAGE_KEYS.SUB_CATEGORIES, INITIAL_SUB_CATEGORIES);
  const updated = isNew
    ? [...current, completeSub]
    : current.map((s) => (s.id === id ? completeSub : s));
  setLocal(STORAGE_KEYS.SUB_CATEGORIES, updated);

  dispatchDataEvent('kb_categories_updated');
  return completeSub;
}

export async function deleteSubCategory(id: string): Promise<boolean> {
  try {
    await supabase.from('sub_categories').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteSubCategory error:', err);
  }

  const current = getLocal<SubCategory[]>(STORAGE_KEYS.SUB_CATEGORIES, INITIAL_SUB_CATEGORIES);
  const updated = current.filter((s) => s.id !== id);
  setLocal(STORAGE_KEYS.SUB_CATEGORIES, updated);

  dispatchDataEvent('kb_categories_updated');
  return true;
}

/* ============================================================================
   3. BANNERS HUB CRUD
============================================================================ */
export async function getBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('id, title, image_url, link_url, is_active, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.BANNERS, data);
      return data;
    }
  } catch {}

  const local = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  return local && local.length > 0 ? local : INITIAL_BANNERS;
}

export async function saveBanner(banner: Partial<Banner>): Promise<Banner> {
  const isNew = !banner.id;
  const id = banner.id || `banner-${Date.now()}`;

  const completeBanner: Banner = {
    id,
    title: banner.title || '',
    image_url: banner.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1920&q=85',
    link_url: banner.link_url || '/shop',
    is_active: banner.is_active ?? true,
    display_order: Number(banner.display_order) || 1,
    created_at: banner.created_at || new Date().toISOString(),
  };

  try {
    await supabase.from('banners').upsert(completeBanner);
  } catch (err) {
    console.warn('Supabase saveBanner error:', err);
  }

  const current = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  const updated = isNew
    ? [...current, completeBanner]
    : current.map((b) => (b.id === id ? completeBanner : b));
  setLocal(STORAGE_KEYS.BANNERS, updated);

  dispatchDataEvent('kb_banners_updated');
  return completeBanner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  try {
    await supabase.from('banners').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteBanner error:', err);
  }

  const current = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  const updated = current.filter((b) => b.id !== id);
  setLocal(STORAGE_KEYS.BANNERS, updated);

  dispatchDataEvent('kb_banners_updated');
  return true;
}

/* ============================================================================
   4. ORDERS MANAGEMENT
============================================================================ */
export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLocal(STORAGE_KEYS.ORDERS, data);
      return data;
    }
  } catch {}

  return getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export async function getOrderByIdOrNumber(identifier: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${identifier},order_number.eq.${identifier}`)
      .single();

    if (!error && data) return data;
  } catch {}

  const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return (
    orders.find(
      (o) => o.id === identifier || o.order_number.toLowerCase() === identifier.toLowerCase()
    ) || null
  );
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  const id = `ord-${Date.now()}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const order_number = `CH-${randomSuffix}`;

  const completeOrder: Order = {
    id,
    order_number,
    customer_name: order.customer_name || 'Valued Customer',
    customer_phone: order.customer_phone || '',
    customer_whatsapp: order.customer_whatsapp || order.customer_phone || '',
    customer_email: order.customer_email || '',
    delivery_type: order.delivery_type || 'delivery',
    address: order.address || '',
    area: order.area || 'Karachi Area',
    city: order.city || 'Karachi',
    delivery_date: order.delivery_date || new Date().toISOString().split('T')[0],
    delivery_time_slot: order.delivery_time_slot || '12:00 PM - 3:00 PM',
    order_notes: order.order_notes || '',
    payment_method: order.payment_method || 'cod',
    payment_status: order.payment_status || 'pending',
    payment_proof_url: order.payment_proof_url || null,
    total_amount: Number(order.total_amount) || 0,
    discount_amount: Number(order.discount_amount) || 0,
    delivery_fee: Number(order.delivery_fee) || 250,
    net_total: Number(order.net_total) || 0,
    status: 'pending',
    items: order.items || [],
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('orders').insert(completeOrder);
  } catch (err) {
    console.warn('Supabase createOrder error:', err);
  }

  const current = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
  setLocal(STORAGE_KEYS.ORDERS, [completeOrder, ...current]);

  dispatchDataEvent('kb_orders_updated');
  return completeOrder;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<boolean> {
  const updates: any = { status };
  if (paymentStatus) updates.payment_status = paymentStatus;

  try {
    await supabase.from('orders').update(updates).eq('id', id);
  } catch (err) {
    console.warn('Supabase updateOrderStatus error:', err);
  }

  const current = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updated = current.map((o) => (o.id === id ? { ...o, ...updates } : o));
  setLocal(STORAGE_KEYS.ORDERS, updated);

  dispatchDataEvent('kb_orders_updated');
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await supabase.from('orders').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteOrder error:', err);
  }

  const current = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updated = current.filter((o) => o.id !== id);
  setLocal(STORAGE_KEYS.ORDERS, updated);

  dispatchDataEvent('kb_orders_updated');
  return true;
}

/* ============================================================================
   5. CUSTOM CAKE BOOKING STUDIO
============================================================================ */
export async function getCustomCakeBookings(): Promise<CustomCakeBooking[]> {
  try {
    const { data, error } = await supabase
      .from('custom_cake_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLocal(STORAGE_KEYS.BOOKINGS, data);
      return data;
    }
  } catch {}

  return getLocal<CustomCakeBooking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
}

export async function createCustomCakeBooking(
  booking: Partial<CustomCakeBooking>
): Promise<CustomCakeBooking> {
  const id = `cust-${Date.now()}`;
  const ref = `CH-CUST-${Math.floor(1000 + Math.random() * 9000)}`;

  const completeBooking: CustomCakeBooking = {
    id,
    booking_reference: ref,
    customer_name: booking.customer_name || 'Customer',
    customer_phone: booking.customer_phone || '',
    customer_whatsapp: booking.customer_whatsapp || booking.customer_phone || '',
    delivery_address: booking.delivery_address || '',
    area: booking.area || 'Karachi',
    city: booking.city || 'Karachi',
    event_date: booking.event_date || '',
    pickup_time: booking.pickup_time || '12:00 PM',
    size_lbs: booking.size_lbs || '2.5 lbs',
    tiers: booking.tiers || '1 Tier',
    cake_base: booking.cake_base || 'Fondant',
    flavor: booking.flavor || 'Chocolate Fudge',
    custom_message: booking.custom_message || '',
    notes: booking.notes || '',
    reference_image_url: booking.reference_image_url || null,
    status: 'pending',
    quoted_price: null,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('custom_cake_bookings').insert(completeBooking);
  } catch (err) {
    console.warn('Supabase createCustomCakeBooking error:', err);
  }

  const current = getLocal<CustomCakeBooking[]>(STORAGE_KEYS.BOOKINGS, []);
  setLocal(STORAGE_KEYS.BOOKINGS, [completeBooking, ...current]);

  dispatchDataEvent('kb_bookings_updated');
  return completeBooking;
}

export async function updateCustomCakeBookingStatus(
  id: string,
  status: any,
  quoted_price?: number
): Promise<boolean> {
  const updates: any = { status };
  if (quoted_price !== undefined) updates.quoted_price = quoted_price;

  try {
    await supabase.from('custom_cake_bookings').update(updates).eq('id', id);
  } catch (err) {
    console.warn('Supabase updateCustomCakeBookingStatus error:', err);
  }

  const current = getLocal<CustomCakeBooking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  const updated = current.map((b) => (b.id === id ? { ...b, ...updates } : b));
  setLocal(STORAGE_KEYS.BOOKINGS, updated);

  dispatchDataEvent('kb_bookings_updated');
  return true;
}

export async function deleteCustomCakeBooking(id: string): Promise<boolean> {
  try {
    await supabase.from('custom_cake_bookings').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteCustomCakeBooking error:', err);
  }

  const current = getLocal<CustomCakeBooking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  const updated = current.filter((b) => b.id !== id);
  setLocal(STORAGE_KEYS.BOOKINGS, updated);

  dispatchDataEvent('kb_bookings_updated');
  return true;
}

/* ============================================================================
   6. SITE SETTINGS & PAYMENT CONFIGURATION
============================================================================ */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'primary')
      .single();

    if (!error && data) {
      setLocal(STORAGE_KEYS.SETTINGS, data);
      return data;
    }
  } catch {}

  return getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SITE_SETTINGS);
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SITE_SETTINGS);
  const updated: SiteSettings = {
    ...current,
    ...settings,
    id: 'primary',
    updated_at: new Date().toISOString(),
  };

  try {
    await supabase.from('site_settings').upsert(updated);
  } catch (err) {
    console.warn('Supabase saveSiteSettings error:', err);
  }

  setLocal(STORAGE_KEYS.SETTINGS, updated);
  dispatchDataEvent('kb_settings_updated');
  return updated;
}

/* ============================================================================
   7. COUPONS MANAGEMENT
============================================================================ */
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase.from('coupons').select('*');
    if (!error && data) {
      setLocal(STORAGE_KEYS.COUPONS, data);
      return data;
    }
  } catch {}

  return getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
}

export async function saveCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const isNew = !coupon.id;
  const id = coupon.id || `cp-${Date.now()}`;
  const completeCoupon: Coupon = {
    id,
    code: (coupon.code || 'SWEETOFF').toUpperCase().trim(),
    discount_type: coupon.discount_type || 'fixed',
    discount_value: Number(coupon.discount_value) || 0,
    min_spend: Number(coupon.min_spend) || 0,
    is_free_delivery: coupon.is_free_delivery ?? false,
    is_active: coupon.is_active ?? true,
    expiry_date: coupon.expiry_date || undefined,
  };

  try {
    await supabase.from('coupons').upsert(completeCoupon);
  } catch (err) {
    console.warn('Supabase saveCoupon error:', err);
  }

  const current = getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  const updated = isNew
    ? [...current, completeCoupon]
    : current.map((c) => (c.id === id ? completeCoupon : c));
  setLocal(STORAGE_KEYS.COUPONS, updated);

  dispatchDataEvent('kb_coupons_updated');
  return completeCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    await supabase.from('coupons').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteCoupon error:', err);
  }

  const current = getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  const updated = current.filter((c) => c.id !== id);
  setLocal(STORAGE_KEYS.COUPONS, updated);

  dispatchDataEvent('kb_coupons_updated');
  return true;
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
  const coupons = await getCoupons();
  const found = coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active
  );

  if (!found) {
    return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
  }

  if (subtotal < found.min_spend) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of Rs. ${found.min_spend.toLocaleString()} required for this coupon.`,
    };
  }

  let discount = 0;
  if (found.discount_type === 'percentage') {
    discount = Math.round((subtotal * found.discount_value) / 100);
  } else {
    discount = found.discount_value;
  }

  return {
    valid: true,
    coupon: found,
    discount,
    message: found.is_free_delivery
      ? 'Free Karachi delivery applied!'
      : `Coupon applied: Rs. ${discount.toLocaleString()} off!`,
  };
}

/* ============================================================================
   HELPERS & LOCAL SEARCH
============================================================================ */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function filterProductsLocally(products: Product[], query?: string): Product[] {
  if (!query || query.trim() === '') return products;
  const q = query.toLowerCase().trim();

  // Smart Hinglish & phonetic synonyms
  const synonyms: { [key: string]: string[] } = {
    choc: ['chocolate', 'fudge', 'ganache', 'dark'],
    choclate: ['chocolate', 'fudge'],
    bday: ['birthday', 'celebration'],
    anniv: ['anniversary', 'wedding'],
    bento: ['mini', 'lunchbox', 'korean'],
    lotus: ['biscoff', 'cheesecake'],
  };

  return products.filter((p) => {
    const searchString = `${p.name} ${p.description} ${p.dietary_tags.join(' ')} ${p.flavors.join(' ')}`.toLowerCase();
    if (searchString.includes(q)) return true;

    // Check synonym matches
    for (const [key, list] of Object.entries(synonyms)) {
      if (q.includes(key)) {
        if (list.some((syn) => searchString.includes(syn))) return true;
      }
    }
    return false;
  });
}
