import { createClient } from '@supabase/supabase-js';

const url = 'https://abearjwgkahpaemmueur.supabase.co';
const key = 'sb_publishable_32sPBMYWu4uW203lzzj3tA_EfAoyf1U';
const supabase = createClient(url, key);

async function run() {
  console.log('Seeding new Gift Boxes & Cake Decorations into Supabase...');

  // 1. Categories
  const categories = [
    {
      id: 'cat-gift-boxes',
      name: 'Gift Boxes',
      slug: 'gift-boxes',
      description: 'Luxury celebration cake gift boxes, personalized sweet treat hampers, and satin ribbon packaging.',
      image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
      is_top_category: true,
      display_order: 7,
    },
    {
      id: 'cat-cake-decorations',
      name: 'Cake Decorations',
      slug: 'cake-decorations',
      description: 'Premium acrylic cake toppers, sparkling metallic candles, birthday numbers, and celebration decoration accessories.',
      image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
      is_top_category: true,
      display_order: 8,
    },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat);
    if (error) console.error('Cat error:', cat.name, error);
    else console.log('Upserted cat:', cat.name);
  }

  // 2. Subcategories
  const subCategories = [
    { id: 'sub-14', category_id: 'cat-gift-boxes', name: 'Luxury Rigid Boxes', slug: 'luxury-rigid-boxes', display_order: 1 },
    { id: 'sub-15', category_id: 'cat-gift-boxes', name: 'Celebration Hampers', slug: 'celebration-hampers', display_order: 2 },
    { id: 'sub-16', category_id: 'cat-cake-decorations', name: 'Acrylic Cake Toppers', slug: 'cake-toppers', display_order: 1 },
    { id: 'sub-17', category_id: 'cat-cake-decorations', name: 'Birthday Candles', slug: 'birthday-candles', display_order: 2 },
    { id: 'sub-18', category_id: 'cat-cake-decorations', name: 'Party Accessories', slug: 'party-accessories', display_order: 3 },
  ];

  for (const sub of subCategories) {
    const { error } = await supabase.from('sub_categories').upsert(sub);
    if (error) console.error('Sub error:', sub.name, error);
    else console.log('Upserted sub:', sub.name);
  }

  // 3. Products
  const products = [
    {
      id: 'prod-dec-1',
      name: 'Luxury Happy Birthday Gold Acrylic Topper',
      slug: 'luxury-happy-birthday-gold-acrylic-topper',
      description: 'Stunning mirror-finish gold acrylic cake topper that elevates any birthday celebration cake with elegance and shine.',
      price: 650,
      discount_price: 490,
      category_id: 'cat-cake-decorations',
      sub_category_id: 'sub-16',
      thumbnail_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80',
      ],
      is_available: true,
      is_featured: true,
      is_flash_deal: false,
      rating: 5.0,
      reviews_count: 24,
      sizes: ['Standard (6-8 inch cake)', 'Large (10-12 inch cake)'],
      flavors: ['Mirror Gold', 'Rose Gold', 'Glossy Silver'],
      dietary_tags: ['Reusable Acrylic', 'Food-Safe Stem'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-dec-2',
      name: 'Champagne Metallic Birthday Sparkler Candles (Pack of 6)',
      slug: 'champagne-metallic-birthday-sparkler-candles',
      description: 'Slow-burning, smokeless metallic champagne gold sparkler candles that add unforgettable magic and golden sparkle to your cake cutting ceremony.',
      price: 750,
      discount_price: 590,
      category_id: 'cat-cake-decorations',
      sub_category_id: 'sub-17',
      thumbnail_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=700&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=700&q=80',
      ],
      is_available: true,
      is_featured: true,
      is_flash_deal: false,
      rating: 4.9,
      reviews_count: 31,
      sizes: ['Pack of 6', 'Pack of 12'],
      flavors: ['Champagne Gold', 'Rose Gold Metallic', 'Pastel Multi-Color'],
      dietary_tags: ['Smokeless Burn', 'Food-Grade Base'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-gift-1',
      name: 'Premium Rigid Celebration Cake Gift Box with Gold Foil & Satin Ribbon',
      slug: 'premium-rigid-celebration-cake-gift-box',
      description: 'Heavyweight luxury keepsake presentation gift box with gold-embossed Cake House branding, clear viewing window, and pure satin ribbon bow.',
      price: 1200,
      discount_price: 950,
      category_id: 'cat-gift-boxes',
      sub_category_id: 'sub-14',
      thumbnail_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=80',
      ],
      is_available: true,
      is_featured: true,
      is_flash_deal: false,
      rating: 5.0,
      reviews_count: 19,
      sizes: ['Fits 2-3 lbs Cake', 'Fits 4-6 lbs Cake'],
      flavors: ['Ivory Cream & Gold', 'Blush Pink & Rose Gold', 'Midnight Chocolate & Gold'],
      dietary_tags: ['Heavy Rigid Board', 'Clear Window Included'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-dec-3',
      name: 'Rose Gold Number Celebration Birthday Candles (0-9)',
      slug: 'rose-gold-number-celebration-birthday-candles',
      description: 'High-gloss metallic 3D sculpted number candles for milestone birthdays and anniversaries.',
      price: 450,
      discount_price: 350,
      category_id: 'cat-cake-decorations',
      sub_category_id: 'sub-17',
      thumbnail_url: 'https://images.unsplash.com/photo-1583875762487-5f8f7c718d14?auto=format&fit=crop&w=700&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1583875762487-5f8f7c718d14?auto=format&fit=crop&w=700&q=80',
      ],
      is_available: true,
      is_featured: false,
      is_flash_deal: false,
      rating: 4.8,
      reviews_count: 15,
      sizes: ['Single Digit', 'Double Digits'],
      flavors: ['Rose Gold', 'Royal Gold', 'Silver Chrome'],
      dietary_tags: ['Drip-Free Wax', 'Extended Burn Time'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const prod of products) {
    const { error } = await supabase.from('products').upsert(prod);
    if (error) console.error('Prod error:', prod.name, error);
    else console.log('Upserted prod:', prod.name);
  }

  console.log('Seeding completed successfully!');
}

run();
