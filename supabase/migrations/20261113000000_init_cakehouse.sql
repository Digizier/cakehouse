-- ============================================================================
-- CAKE HOUSE INITIAL DATABASE SCHEMA
-- ============================================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  is_top_category BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SubCategories Table
CREATE TABLE IF NOT EXISTS public.sub_categories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  sub_category_id TEXT,
  thumbnail_url TEXT NOT NULL,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_flash_deal BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 12,
  sizes JSONB DEFAULT '["1 lb", "2 lbs", "3 lbs"]'::jsonb,
  flavors JSONB DEFAULT '["Chocolate Fudge", "Red Velvet", "Vanilla"]'::jsonb,
  dietary_tags JSONB DEFAULT '["Fresh Cream", "Eggless Available"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_email TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'delivery',
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Karachi',
  delivery_date TEXT NOT NULL,
  delivery_time_slot TEXT NOT NULL,
  order_notes TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_proof_url TEXT,
  total_amount NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 250,
  net_total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Custom Cake Bookings Table
CREATE TABLE IF NOT EXISTS public.custom_cake_bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Karachi',
  event_date TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  size_lbs TEXT NOT NULL,
  tiers TEXT NOT NULL DEFAULT '1 Tier',
  cake_base TEXT NOT NULL,
  flavor TEXT NOT NULL,
  custom_message TEXT,
  notes TEXT,
  reference_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  quoted_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  store_name TEXT NOT NULL DEFAULT 'Cake House',
  tagline TEXT NOT NULL DEFAULT 'Every Bite, A Little Happiness',
  phone TEXT NOT NULL DEFAULT '0302-9257271',
  whatsapp TEXT NOT NULL DEFAULT '0302-9257271',
  email TEXT NOT NULL DEFAULT 'admin@cakehouse.shop',
  address TEXT NOT NULL DEFAULT 'House A-200, Sector 36/B, Zamanabad, Landhi #4, Karachi',
  google_maps_url TEXT NOT NULL DEFAULT 'https://share.google/AodyTtHMJ4ioecLPi',
  facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/CakeHousebysobia',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/cakehousebysobia',
  base_delivery_fee NUMERIC NOT NULL DEFAULT 250,
  free_delivery_threshold NUMERIC NOT NULL DEFAULT 3500,
  cod_enabled BOOLEAN NOT NULL DEFAULT true,
  jazzcash_enabled BOOLEAN NOT NULL DEFAULT true,
  jazzcash_account_title TEXT NOT NULL DEFAULT 'Sobia Khan (Cake House)',
  jazzcash_account_number TEXT NOT NULL DEFAULT '03029257271',
  easypaisa_enabled BOOLEAN NOT NULL DEFAULT true,
  easypaisa_account_title TEXT NOT NULL DEFAULT 'Sobia Khan (Cake House)',
  easypaisa_account_number TEXT NOT NULL DEFAULT '03029257271',
  bank_enabled BOOLEAN NOT NULL DEFAULT true,
  bank_name TEXT NOT NULL DEFAULT 'Meezan Bank Ltd',
  bank_account_title TEXT NOT NULL DEFAULT 'Cake House Bakery',
  bank_iban TEXT NOT NULL DEFAULT 'PK45MEZN0001234567890123',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'fixed',
  discount_value NUMERIC NOT NULL,
  min_spend NUMERIC NOT NULL DEFAULT 0,
  is_free_delivery BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expiry_date TEXT
);

-- 9. Post-Oct 30 Mandatory Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 10. Enable Row Level Security (RLS) and Create Permissive Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_cake_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for categories" ON public.categories;
CREATE POLICY "Allow all for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for sub_categories" ON public.sub_categories;
CREATE POLICY "Allow all for sub_categories" ON public.sub_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for products" ON public.products;
CREATE POLICY "Allow all for products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for banners" ON public.banners;
CREATE POLICY "Allow all for banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for orders" ON public.orders;
CREATE POLICY "Allow all for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for custom_cake_bookings" ON public.custom_cake_bookings;
CREATE POLICY "Allow all for custom_cake_bookings" ON public.custom_cake_bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for site_settings" ON public.site_settings;
CREATE POLICY "Allow all for site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for coupons" ON public.coupons;
CREATE POLICY "Allow all for coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
