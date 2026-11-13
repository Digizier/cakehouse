'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Award, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function AboutPage() {
  const { settings } = useCart();

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      {/* Banner */}
      <div className="bg-chocolate-900 text-cream-100 py-10 md:py-16 px-4 border-b border-gold-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Our Bakery Story
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            Every Bite, A Little Happiness
          </h1>
          <p className="text-xs md:text-sm text-cream-200/80 max-w-lg mx-auto">
            From our family oven in Landhi to celebrations across Karachi &mdash; crafted with pure butter, rich Belgian cocoa, and heartfelt love.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-12">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 md:p-10 border border-cream-200 shadow-sm">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
              Meet Head Baker Sobia
            </span>
            <h2 className="text-xl md:text-3xl font-serif font-bold text-chocolate-900 leading-tight">
              Baking Dreams into Celebration Masterpieces
            </h2>
            <p className="text-xs md:text-sm text-chocolate-900/70 leading-relaxed">
              Cake House began not as a commercial factory, but as an affectionate home kitchen passion in Landhi, Karachi. Head baker Sobia started with a simple commitment: <em>&ldquo;Every cake that leaves our kitchen must taste as wholesome, pure, and rich as what we serve our own children.&rdquo;</em>
            </p>
            <p className="text-xs md:text-sm text-chocolate-900/70 leading-relaxed">
              Over the years, what started with cozy birthday cakes for neighborhood families blossomed into one of Karachi’s most trusted bespoke cake studios. Today, we handcraft hundreds of multi-tier wedding cakes, whimsical kids’ birthday themes, and gourmet Belgian fudge creations every month.
            </p>
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gold-300 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
              alt="Cake House Artisan Creation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-chocolate-900">
              Pure Dairy & Butter
            </h3>
            <p className="text-xs text-chocolate-900/60 leading-relaxed">
              We never cut corners with cheap vegetable shortenings or artificial cake mixes. Only real dairy butter and fresh cream.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-chocolate-900">
              Belgian Cocoa & Truffle
            </h3>
            <p className="text-xs text-chocolate-900/60 leading-relaxed">
              Our signature chocolate fudge cakes are layered with imported Belgian couverture chocolate and velvety dark ganache.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-chocolate-900">
              100% Halal Verified
            </h3>
            <p className="text-xs text-chocolate-900/60 leading-relaxed">
              Strict Islamic preparation hygiene, alcohol-free vanillas, and certified halal gelatin where applicable.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-chocolate-900">
              Artisan Fondant Craft
            </h3>
            <p className="text-xs text-chocolate-900/60 leading-relaxed">
              Every crown, flower petal, and themed character is hand-sculpted with painstaking patience and attention to detail.
            </p>
          </div>
        </div>

        {/* Location & Contact CTA Banner */}
        <div className="bg-chocolate-950 text-cream-100 rounded-3xl p-6 md:p-10 border border-gold-900/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg text-center md:text-left">
            <h3 className="font-serif font-bold text-lg md:text-2xl text-cream-50">
              Visit Us in Landhi or Order for Home Delivery
            </h3>
            <p className="text-xs text-cream-300/80 leading-relaxed">
              House A-200, Sector 36/B, Zamanabad, Landhi #4, Karachi. Delivering across DHA, Clifton, Gulshan, Malir, and all Karachi sectors.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/custom-cake"
              className="px-5 py-2.5 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs shadow-md transition-colors"
            >
              Order Custom Cake
            </Link>
            <a
              href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-cream-100 font-semibold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              <span>WhatsApp: 0302-9257271</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
