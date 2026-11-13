'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types';
import { getCategories } from '@/lib/db';

export function TopCategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then((cats) => {
      const topOnly = cats.filter((c) => c.is_top_category);
      setCategories(topOnly.length > 0 ? topOnly : cats);
    });

    const handleUpdate = () => {
      getCategories().then((cats) => {
        const topOnly = cats.filter((c) => c.is_top_category);
        setCategories(topOnly.length > 0 ? topOnly : cats);
      });
    };

    window.addEventListener('kb_categories_updated', handleUpdate);
    return () => window.removeEventListener('kb_categories_updated', handleUpdate);
  }, []);

  // Smooth continuous auto-scroll for desktop & mobile
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || categories.length <= 4) return;

    let animationFrameId: number;
    let scrollPos = el.scrollLeft;

    const step = () => {
      if (!isPaused && el) {
        scrollPos += 0.6; // Smooth gentle movement
        if (scrollPos >= el.scrollWidth / 2) {
          scrollPos = 0;
        }
        el.scrollLeft = scrollPos;
      } else if (el) {
        scrollPos = el.scrollLeft;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, categories.length]);

  if (categories.length === 0) return null;

  // Duplicate items for continuous seamless loop if > 4 categories
  const displayItems =
    categories.length > 4 ? [...categories, ...categories] : categories;

  return (
    <section className="w-full py-6 md:py-10 bg-cream-50/60 border-y border-cream-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header with Title & View All */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-gold-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Bakery Specialties</span>
            </div>
            <h2 className="text-lg md:text-2xl font-serif font-bold text-chocolate-900">
              Top Cake Categories
            </h2>
          </div>

          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs md:text-sm font-bold text-gold-600 hover:text-gold-700 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Carousel Track with 2.5 items peek on mobile */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-none py-2 px-1 select-none scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {displayItems.map((cat, idx) => (
            <Link
              key={`${cat.id}-${idx}`}
              href={`/shop/${cat.slug}`}
              className="flex-shrink-0 w-[38vw] sm:w-[28vw] md:w-48 lg:w-56 group rounded-2xl bg-white border border-cream-200 hover:border-gold-400 p-2.5 md:p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1 text-center"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-cream-100">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-xs md:text-sm font-bold text-chocolate-900 group-hover:text-gold-600 transition-colors truncate">
                {cat.name}
              </h3>
              <p className="text-[10px] md:text-xs text-chocolate-900/50 mt-0.5 line-clamp-1">
                Freshly Baked
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
