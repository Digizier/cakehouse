'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/types';
import { getBanners } from '@/lib/db';

export function HeroBannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getBanners().then(setBanners);

    const handleUpdate = () => {
      getBanners().then(setBanners);
    };

    window.addEventListener('kb_banners_updated', handleUpdate);
    return () => window.removeEventListener('kb_banners_updated', handleUpdate);
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  const content = (
    <div className="relative w-full aspect-[21/9] sm:aspect-[16/7] md:aspect-[16/6] rounded-2xl md:rounded-3xl overflow-hidden bg-cream-100 shadow-sm border border-cream-200">
      <img
        src={currentBanner.image_url}
        alt={currentBanner.title || 'Cake House Bakery Banner'}
        className="w-full h-full object-cover object-center transition-all duration-700"
      />
    </div>
  );

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 pt-3 md:pt-5 group">
      {currentBanner.link_url ? (
        <Link href={currentBanner.link_url} className="block cursor-pointer">
          {content}
        </Link>
      ) : (
        content
      )}

      {/* Navigation Arrows (visible on hover) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-6 md:left-9 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white text-chocolate-900 flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-6 md:right-9 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white text-chocolate-900 flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-chocolate-900/40 backdrop-blur-md px-2.5 py-1 rounded-full">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx
                    ? 'w-6 bg-gold-400'
                    : 'w-2 bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
