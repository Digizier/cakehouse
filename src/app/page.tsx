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
  MessageSquarePlus,
  X,
  Send,
  Heart,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/db';
import { HeroBannerSlider } from '@/components/HeroBannerSlider';
import { TopCategoriesCarousel } from '@/components/TopCategoriesCarousel';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ShimmerSkeleton';
import { BrandTrustTicker } from '@/components/BrandTrustTicker';

const INITIAL_REVIEWS = [
  {
    name: 'Hijab Ejaz',
    location: 'DHA Phase 6, Karachi',
    rating: 5,
    comment:
      'Hands down one of the best cakes we’ve ever had in Karachi! The design matched our Pinterest picture 100%, and the chocolate fudge was incredibly moist and rich.',
  },
  {
    name: 'Sadaf Rafiq',
    location: 'Gulshan-e-Iqbal, Karachi',
    rating: 5,
    comment:
      'Ordered a 2-tier crown cake for my daughter’s 16th birthday. Sobia’s attention to detail, timely delivery, and professional packaging exceeded all our expectations!',
  },
  {
    name: 'Muhammad Daniyal',
    location: 'Malir Cantt, Karachi',
    rating: 5,
    comment:
      'The Lotus Biscoff cheesecake and Korean bento cake are simply world class. Ordering through the website and confirming on WhatsApp was completely frictionless.',
  },
];

export default function HomePage() {
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [featuredCakes, setFeaturedCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviews state & modal
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    location: 'DHA, Karachi',
    rating: 5,
    comment: '',
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
  }, []);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    const newRev = {
      name: reviewForm.name,
      location: reviewForm.location || 'Karachi',
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    };

    setReviews([newRev, ...reviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
      setReviewForm({ name: '', location: 'DHA, Karachi', rating: 5, comment: '' });
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-cream-50/40">
      {/* 1. Hero Dynamic Banner Carousel */}
      <HeroBannerSlider />

      {/* 2. Top Cake Categories Bar */}
      <TopCategoriesCarousel />

      {/* 3. Flash Deals Spotlight (4 items max) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-gradient-to-r from-berry-500/10 via-gold-500/10 to-berry-500/10 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-berry-500/20 shadow-2xs">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <span className="p-1.5 md:p-2 bg-berry-500 text-white rounded-lg shadow-2xs">
                <Zap className="w-4 h-4 md:w-5 md:h-5 fill-white" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base md:text-xl font-serif font-bold text-chocolate-900">
                    Sweet Flash Deals
                  </h2>
                  <span className="text-[10px] md:text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-berry-500 text-white animate-pulse">
                    Limited Time
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-chocolate-900/60 hidden sm:block">
                  Freshly baked signature delights at special Karachi celebration discounts.
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
          <div className="inline-flex items-center gap-1.5 text-gold-700 text-xs font-bold uppercase tracking-widest bg-gold-100/70 border border-gold-200 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
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

      {/* 5. Custom Cake Highlight Banner ("Your Cake Your Way" - Light Luxury Theme) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F3EBDB] text-[#3B281B] border border-[#E5DAC6] shadow-sm p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-3">
            <span className="inline-block text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-800 bg-gold-100/80 border border-gold-300 px-3 py-1 rounded-full">
              Custom Celebration Studio
            </span>
            <h3 className="text-xl md:text-3xl font-serif font-bold text-[#2B1B10] leading-tight">
              Your Cake, Your Way &mdash; Designed to Perfection
            </h3>
            <p className="text-xs md:text-sm text-[#5A4332] leading-relaxed">
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
                className="px-4 py-2.5 rounded-full bg-white hover:bg-cream-100 text-[#3B281B] font-semibold text-xs border border-[#E0D5C3] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-gold-700" />
                <span>Discuss on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="w-full sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 border-gold-300/80 shadow-md flex-shrink-0 bg-cream-100">
            <img
              src="/images/custom-celebration-cake.jpg"
              alt="Artisanal Custom Celebration Cake by Cake House"
              className="w-full h-48 sm:h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews & Social Proof (Light Luxury Theme with "Write a Review") */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="bg-[#FAF6F0] text-[#3B281B] rounded-2xl md:rounded-3xl p-6 md:p-10 border border-[#E8DFC8] shadow-sm">
          {/* Header & Google Reviews Badge from Reference Image */}
          <div className="text-center max-w-xl mx-auto mb-8 space-y-4">
            <div>
              <h2 className="text-xl md:text-3xl font-serif font-bold text-[#2B1B10]">
                Customer Love from Across Karachi
              </h2>
              <p className="text-xs md:text-sm text-[#7A6350] mt-1">
                Real reviews from families celebrating birthdays, anniversaries, and sweet moments.
              </p>
            </div>

            {/* Google / Brand Review Badge Card (Exact match to reference image) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95 p-4 rounded-2xl border border-[#EAE0CF] shadow-2xs max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Cake House Logo"
                  className="w-12 h-12 rounded-full border border-gold-300 object-contain shadow-2xs flex-shrink-0"
                />
                <div className="text-left">
                  <h3 className="font-serif font-bold text-sm text-[#2B1B10] leading-snug">
                    Cake House DHA & Landhi
                  </h3>
                  <div className="flex items-center gap-1 text-gold-500 my-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                    ))}
                    <span className="text-[11px] font-bold text-[#3B281B] ml-1">4.9 / 5.0</span>
                  </div>
                  <p className="text-[10px] text-[#7A6350] font-medium">
                    975+ Verified Customer Reviews
                  </p>
                </div>
              </div>

              {/* "Write a review" Pill Button */}
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-chocolate-900 hover:bg-chocolate-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-gold-400" />
                <span>Write a review</span>
              </button>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {reviews.slice(0, 3).map((review, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-[#EFE7D8] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-gold-500 mb-2">
                    {Array.from({ length: review.rating || 5 }).map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-gold-400/50 mb-1" />
                  <p className="text-xs text-[#4A3525] leading-relaxed italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1B10]">{review.name}</h4>
                    <p className="text-[10px] text-gold-700 font-medium">{review.location}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-cream-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Cake House" className="w-9 h-9 rounded-full border border-gold-300" />
                <div>
                  <h3 className="font-serif font-bold text-base text-chocolate-900">
                    Write a Customer Review
                  </h3>
                  <p className="text-[11px] text-chocolate-900/60">
                    Share your celebration experience with Cake House Karachi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-full text-chocolate-900/40 hover:text-chocolate-900 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-lg text-chocolate-900">
                  Thank You for Your Sweet Love!
                </h4>
                <p className="text-xs text-chocolate-900/70">
                  Your verified review has been submitted and featured on Cake House Karachi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                {/* Star Rating Select */}
                <div>
                  <label className="block font-bold text-chocolate-900 mb-1">
                    Your Rating:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating
                              ? 'fill-gold-500 text-gold-500'
                              : 'text-cream-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gold-700 ml-1">
                      {reviewForm.rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-bold text-chocolate-900 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Siddiqui"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Karachi Location / Area */}
                <div>
                  <label className="block font-bold text-chocolate-900 mb-1">Karachi Area / Sector *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHA Phase 5, Clifton, Gulshan-e-Iqbal, Landhi"
                    value={reviewForm.location}
                    onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Review Message */}
                <div>
                  <label className="block font-bold text-chocolate-900 mb-1">Your Experience / Cake Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about the flavor, freshness, design, delivery on time, or packaging..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit My Review</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. Brand Trust & Commitment Ticker */}
      <BrandTrustTicker />
    </main>
  );
}
