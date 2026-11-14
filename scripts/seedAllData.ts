import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUB_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_SITE_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
} from '../src/lib/seedData';

const url = 'https://abearjwgkahpaemmueur.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZWFyandna2FocGFlbW11ZXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDQ5ODkxMSwiZXhwIjoyMTEwMDc0OTExfQ.v2XmIGR1zFGSZkou8HYg5-FkfjYYu4CwcizY1SjKT_M';
const supabase = createClient(url, key);

async function runSeed() {
  console.log('Seeding Supabase with live data...');

  // 1. Categories
  console.log('Seeding Categories...');
  const { error: catErr } = await supabase.from('categories').upsert(INITIAL_CATEGORIES);
  if (catErr) console.error('Cat Error:', catErr);

  // 2. SubCategories
  console.log('Seeding SubCategories...');
  const { error: subErr } = await supabase.from('sub_categories').upsert(INITIAL_SUB_CATEGORIES);
  if (subErr) console.error('Sub Error:', subErr);

  // 3. Products
  console.log('Seeding Products...');
  const { error: prodErr } = await supabase.from('products').upsert(INITIAL_PRODUCTS);
  if (prodErr) console.error('Prod Error:', prodErr);

  // 4. Banners
  console.log('Seeding Banners...');
  const { error: banErr } = await supabase.from('banners').upsert(INITIAL_BANNERS);
  if (banErr) console.error('Banner Error:', banErr);

  // 5. Site Settings
  console.log('Seeding Site Settings...');
  const { error: setErr } = await supabase.from('site_settings').upsert(INITIAL_SITE_SETTINGS);
  if (setErr) console.error('Settings Error:', setErr);

  // 6. Coupons
  console.log('Seeding Coupons...');
  const { error: coupErr } = await supabase.from('coupons').upsert(INITIAL_COUPONS);
  if (coupErr) console.error('Coupons Error:', coupErr);

  // 7. Orders
  console.log('Seeding Orders...');
  const { error: ordErr } = await supabase.from('orders').upsert(INITIAL_ORDERS);
  if (ordErr) console.error('Orders Error:', ordErr);

  // 8. Bookings
  console.log('Seeding Custom Cake Bookings...');
  const { error: bookErr } = await supabase.from('custom_cake_bookings').upsert(INITIAL_BOOKINGS);
  if (bookErr) console.error('Bookings Error:', bookErr);

  console.log('✅ Supabase Seeding Complete! Real-time Cloud Database is now live and populated.');
}

runSeed();
