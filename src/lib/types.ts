export interface ProductSizeOption {
  name: string;
  price: number; // additional price in PKR (0 = no additional charge)
}

export function parseSizeOption(item: string | ProductSizeOption | unknown): ProductSizeOption {
  if (typeof item === 'object' && item !== null && 'name' in item) {
    const obj = item as { name?: unknown; price?: unknown };
    return {
      name: String(obj.name || '').trim(),
      price: Math.max(0, Number(obj.price) || 0),
    };
  }
  const str = String(item || '').trim();
  const match = str.match(/^(.*?)\s*(?:\(\+?(?:Rs\.?\s*)?(\d+)(?:\s*PKR)?\)|:\s*(\d+))$/i);
  if (match) {
    return {
      name: match[1].trim(),
      price: Math.max(0, Number(match[2] || match[3]) || 0),
    };
  }
  return { name: str, price: 0 };
}

export function formatSizeOption(option: ProductSizeOption): string {
  if (option.price > 0) {
    return `${option.name} (+Rs. ${option.price.toLocaleString()})`;
  }
  return option.name;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  category_id: string;
  sub_category_id?: string | null;
  thumbnail_url: string;
  gallery_urls: string[];
  is_available: boolean;
  is_featured: boolean;
  is_flash_deal: boolean;
  rating: number;
  reviews_count: number;
  has_sizes?: boolean;
  has_flavors?: boolean;
  has_dietary?: boolean;
  sizes: (string | ProductSizeOption)[];
  flavors: string[];
  dietary_tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  is_top_category: boolean;
  display_order: number;
  created_at?: string;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
}

export interface Banner {
  id: string;
  title?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export interface CartItem {
  id: string; // generated unique key for cart entry (e.g. `${product.id}-${size}-${flavor}`)
  product_id: string;
  product_name: string;
  slug: string;
  thumbnail_url: string;
  price: number;
  quantity: number;
  selected_size: string;
  selected_flavor: string;
  custom_message?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'verified' | 'failed';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_size: string;
  selected_flavor: string;
  custom_message?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email?: string;
  delivery_type: 'delivery' | 'pickup';
  address: string;
  area: string;
  city: string;
  delivery_date: string;
  delivery_time_slot: string;
  order_notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_proof_url?: string | null;
  total_amount: number;
  discount_amount: number;
  delivery_fee: number;
  net_total: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at?: string;
}

export interface CustomCakeBooking {
  id: string;
  booking_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  delivery_address: string;
  area: string;
  city: string;
  event_date: string;
  pickup_time: string;
  size_lbs: string;
  tiers: string;
  cake_base: string;
  flavor: string;
  custom_message?: string;
  notes?: string;
  reference_image_url?: string | null;
  status: 'pending' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  quoted_price?: number | null;
  created_at?: string;
}

export interface SiteSettings {
  id?: string;
  store_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  google_maps_url: string;
  facebook_url: string;
  instagram_url: string;
  base_delivery_fee: number;
  free_delivery_threshold: number;
  cod_enabled: boolean;
  jazzcash_enabled: boolean;
  jazzcash_account_title: string;
  jazzcash_account_number: string;
  easypaisa_enabled: boolean;
  easypaisa_account_title: string;
  easypaisa_account_number: string;
  bank_enabled: boolean;
  bank_name: string;
  bank_account_title: string;
  bank_iban: string;
  updated_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  is_free_delivery: boolean;
  is_active: boolean;
  expiry_date?: string;
}
