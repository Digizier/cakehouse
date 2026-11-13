'use client';

import React, { useState } from 'react';
import { Award, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

const TRUST_BADGES = [
  { name: 'Pure Dairy Butter', label: 'No Shortening or Margarine', icon: Sparkles },
  { name: '100% Halal Ingredients', label: 'Strictly Verified Certified', icon: ShieldCheck },
  { name: 'Sobia’s Kitchen Craft', label: 'Homemade with Love Since 2018', icon: Heart },
  { name: 'Belgian Chocolate', label: 'Imported Pure Cocoa Ganache', icon: Award },
  { name: 'Karachi Chilled Transit', label: 'Delivered in Temperature Care', icon: CheckCircle2 },
  { name: 'Custom Fondant Art', label: 'Edible Sculpting Mastery', icon: Sparkles },
];

export function BrandTrustTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="w-full py-4 md:py-6 bg-cream-100/60 border-b border-cream-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-2 text-center">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gold-700">
          Our Quality Commitment to Karachi Families
        </p>
      </div>

      <div
        className="relative flex overflow-x-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className={`flex gap-4 md:gap-8 items-center whitespace-nowrap ${
            isPaused ? '' : 'animate-marquee-slow'
          }`}
        >
          {[...TRUST_BADGES, ...TRUST_BADGES, ...TRUST_BADGES].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/80 border border-gold-200/80 shadow-2xs text-xs font-medium text-chocolate-900 flex-shrink-0"
              >
                <div className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-chocolate-900 block leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-chocolate-900/60 block leading-tight">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
