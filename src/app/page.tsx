'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  Quote,
  Cake,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/db';
import { HeroBannerSlider } from '@/components/HeroBannerSlider';
import { TopCategoriesCarousel } from '@/components/TopCategoriesCarousel';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ShimmerSkeleton';
import { BrandTrustTicker } from '@/components/BrandTrustTicker';

export default function HomePage() {
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [featuredCakes, setFeaturedCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Flash Deals (top 4 for homepage, newest first)
        const flash = await getProducts({ flashDeals: true, limit: 4 });
        setFlashDeals(flash);

        // Load Featured Cakes (strictly 8 items max for homepage, prioritizing is_featured)
        let featured = await getProducts({ featured: true, limit: 8 });
        if (featured.length < 8) {
          const recent = await getProducts({ limit: 8 });
          const existingIds = new Set(featured.map((f) => f.id));
          const additional = recent.filter((r) => !existingIds.has(r.id));
          featured = [...featured, ...additional].slice(0, 8);
        }
        setFeaturedCakes(featured);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('kb_products_updated', handleUpdate);
    return () => window.removeEventListener('kb_products_updated', handleUpdate);
  }, []);

  return (
    <main className="min-h-screen bg-cream-50/40 pb-16">
      {/* 1. Hero Banners Slider */}
      <HeroBannerSlider />

      {/* 2. Top Categories Auto-Scrolling Marquee */}
      <TopCategoriesCarousel />

      {/* 3. Flash Deals Section (Top 4 Products in 2-Col Mobile Grid) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="bg-gradient-to-r from-berry-50 via-cream-100 to-gold-50/60 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-berry-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-berry-500 text-white flex items-center justify-center shadow-sm animate-bounce">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-serif font-bold text-chocolate-900 flex items-center gap-2">
                  <span>Sweet Flash Deals</span>
                  <span className="text-[10px] md:text-xs font-sans font-extrabold bg-berry-500 text-white px-2 py-0.5 rounded-full uppercase">
                    Limited Time
                  </span>
                </h2>
                <p className="text-[11px] md:text-xs text-chocolate-900/60">
                  Exclusive celebration discounts on our bestselling creations
                </p>
              </div>
            </div>

            <Link
              href="/shop?filter=flash"
              className="flex items-center gap-1 text-xs md:text-sm font-bold text-berry-600 hover:text-berry-700 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 2 Products Per Row on Mobile Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : flashDeals.length > 0 ? (
              flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-xs text-chocolate-900/60 py-4">
                No active flash deals right now. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 4. Signature Delights (8 Products strictly on Homepage) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="text-center max-w-xl mx-auto mb-6 md:mb-8">
          <div className="inline-flex items-center gap-1.5 text-gold-600 text-xs font-bold uppercase tracking-widest bg-gold-100/70 border border-gold-200 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trending Bakery Creations</span>
          </div>
          <h2 className="text-xl md:text-3xl font-serif font-bold text-chocolate-900">
            Our Signature Delights
          </h2>
          <p className="text-xs md:text-sm text-chocolate-900/60 mt-1">
            Handcrafted with love, pure cream, and authentic Belgian chocolate in Karachi.
          </p>
        </div>

        {/* 2 Columns on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : featuredCakes.length > 0 ? (
            featuredCakes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-xs text-chocolate-900/60 py-8">
              Fresh cakes are currently in the oven. Check back shortly!
            </p>
          )}
        </div>

        {/* Explore All Cakes CTA Button */}
        <div className="mt-8 md:mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-chocolate-900 hover:bg-chocolate-800 text-white font-bold text-xs md:text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <Cake className="w-4 h-4 text-gold-400" />
            <span>Explore All Cakes & Menu ({'>'})</span>
          </Link>
        </div>
      </section>

      {/* 5. Custom Cake Highlight Banner ("Your Cake Your Way") */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-chocolate-900 via-chocolate-950 to-chocolate-900 text-cream-100 border border-gold-500/30 shadow-lg p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-3">
            <span className="inline-block text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
              Custom Celebration Studio
            </span>
            <h3 className="text-xl md:text-3xl font-serif font-bold text-white leading-tight">
              Your Cake, Your Way &mdash; Designed to Perfection
            </h3>
            <p className="text-xs md:text-sm text-cream-200/80 leading-relaxed">
              Have a dream cake design from Pinterest, Instagram, or a custom birthday theme? Upload your reference photo, pick your favorite flavors, and let Sobia handcraft your masterpiece.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/custom-cake"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Design Custom Cake Now</span>
              </Link>
              <a
                href="https://wa.me/923029257271?text=Hello%20Cake%20House,%20I%20have%20a%20custom%20cake%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-cream-100 font-semibold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>Discuss on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 border-gold-400/40 shadow-xl flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80"
              alt="Custom Cake House Design"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews & Social Proof */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="bg-chocolate-950 text-cream-100 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-gold-900/60 shadow-md">
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="flex items-center justify-center gap-1 text-gold-400 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold-400" />
              ))}
              <span className="ml-1 text-xs font-bold text-cream-100">4.9 / 5.0</span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-cream-50">
              Customer Love from Across Karachi
            </h2>
            <p className="text-xs text-cream-300/70 mt-1">
              Real reviews from families celebrating birthdays, anniversaries, and sweet moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: 'Hijab Ejaz',
                location: 'DHA Phase 6, Karachi',
                comment:
                  'Hands down one of the best cakes we’ve ever had in Karachi! The design matched our Pinterest picture 100%, and the chocolate fudge was incredibly moist and rich.',
              },
              {
                name: 'Sadaf Rafiq',
                location: 'Gulshan-e-Iqbal, Karachi',
                comment:
                  'Ordered a 2-tier crown cake for my daughter’s 16th birthday. Sobia’s attention to detail, timely delivery, and professional packaging exceeded all our expectations!',
              },
              {
                name: 'Muhammad Daniyal',
                location: 'Malir Cantt, Karachi',
                comment:
                  'The Lotus Biscoff cheesecake and Korean bento cake are simply world class. Ordering through the website and confirming on WhatsApp was completely frictionless.',
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-chocolate-900/80 rounded-xl p-4 md:p-5 border border-gold-900/40 flex flex-col justify-between"
              >
                <div>
                  <Quote className="w-5 h-5 text-gold-400/50 mb-2" />
                  <p className="text-xs text-cream-100/90 leading-relaxed italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-chocolate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-cream-50">{review.name}</h4>
                    <p className="text-[10px] text-gold-400">{review.location}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Brand Trust & Commitment Ticker */}
      <BrandTrustTicker />
    </main>
  );
}
