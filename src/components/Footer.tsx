'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Footer() {
  const pathname = usePathname();
  const { settings } = useCart();

  // Admin panel has NO public footer!
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#FAF7F2] text-[#4A3525] pt-10 pb-20 md:pb-8 border-t border-[#E8DEC8]">
      {/* 1. Value Pillars Banner (Light Luxury Theme) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8 border-b border-[#E8DEC8]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-2xl border border-[#EFE7D8] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-gold-700" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-[#2B1B10]">Fresh Daily</h4>
              <p className="text-[11px] text-[#7A6350]">Baked to order with love</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-2xl border border-[#EFE7D8] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-gold-700" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-[#2B1B10]">Karachi Delivery</h4>
              <p className="text-[11px] text-[#7A6350]">Chilled safe transit</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-2xl border border-[#EFE7D8] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold-700" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-[#2B1B10]">Pure Ingredients</h4>
              <p className="text-[11px] text-[#7A6350]">Real dairy & Belgian cocoa</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/70 p-3 rounded-2xl border border-[#EFE7D8] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-gold-700" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-bold text-[#2B1B10]">Custom Artistry</h4>
              <p className="text-[11px] text-[#7A6350]">Any theme or occasion</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Story Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Cake House Logo"
                className="w-11 h-11 rounded-full border border-gold-400/60 object-contain shadow-2xs"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B1B10] tracking-tight">
                  Cake House
                </h3>
                <p className="text-[11px] text-gold-700 uppercase tracking-widest font-semibold">
                  Every Bite, A Little Happiness
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5A4332] leading-relaxed max-w-sm">
              Cake House is an artisanal homemade cake business run with love by Sobia in Karachi.
              Specializing in custom birthday cakes, wedding tiers, Belgian chocolate fudge, and
              unforgettable celebration memories.
            </p>

            {/* Contact Details */}
            <div className="pt-1 space-y-1.5 text-xs text-[#4A3525]">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-700 mt-0.5 flex-shrink-0" />
                <span>House A-200, Sector 36/B, Zamanabad, Landhi #4, Karachi</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" />
                <a
                  href={`tel:${settings?.phone || '0302-9257271'}`}
                  className="hover:text-gold-700 transition-colors font-medium"
                >
                  {settings?.phone || '0302-9257271'} (Call / WhatsApp)
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" />
                <a
                  href={`mailto:${settings?.email || 'admin@cakehouse.shop'}`}
                  className="hover:text-gold-700 transition-colors"
                >
                  {settings?.email || 'admin@cakehouse.shop'}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links in 2 Columns on Mobile */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {/* Column 1: Popular Delights */}
            <div className="space-y-2.5">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-gold-800 border-b border-gold-300 pb-1">
                Sweet Cakes
              </h4>
              <ul className="space-y-1.5 text-xs text-[#5A4332]">
                <li>
                  <Link href="/shop/birthday-cakes" className="hover:text-gold-700 transition-colors">
                    Birthday Cakes
                  </Link>
                </li>
                <li>
                  <Link href="/shop/chocolate-cakes" className="hover:text-gold-700 transition-colors">
                    Chocolate Fudge
                  </Link>
                </li>
                <li>
                  <Link href="/shop/gift-boxes" className="hover:text-gold-700 transition-colors">
                    Gift Boxes
                  </Link>
                </li>
                <li>
                  <Link href="/shop/cake-decorations" className="hover:text-gold-700 transition-colors">
                    Cake Decorations
                  </Link>
                </li>
                <li>
                  <Link href="/custom-cake" className="hover:text-gold-700 transition-colors text-gold-700 font-medium">
                    Your Cake Your Way &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-gold-700 transition-colors font-semibold text-gold-800">
                    Explore All Menu
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Customer Care */}
            <div className="space-y-2.5">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-gold-800 border-b border-gold-300 pb-1">
                Help & Info
              </h4>
              <ul className="space-y-1.5 text-xs text-[#5A4332]">
                <li>
                  <Link href="/track-order" className="hover:text-gold-700 transition-colors font-medium">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-gold-700 transition-colors">
                    Our Story & Chef
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gold-700 transition-colors">
                    Google Maps & Directions
                  </Link>
                </li>
                <li>
                  <Link href="/delivery-policy" className="hover:text-gold-700 transition-colors">
                    Karachi Delivery Policy
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-gold-700 transition-colors">
                    Cake Care & FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/admin" prefetch={false} className="text-[#9C8A7B] hover:text-gold-700 transition-colors text-[10px]">
                    Admin Portal Gate
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Hours & Socials */}
            <div className="col-span-2 sm:col-span-1 space-y-2.5">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-gold-800 border-b border-gold-300 pb-1">
                Bakery Hours
              </h4>
              <div className="text-xs text-[#5A4332] space-y-1">
                <p className="flex items-center gap-1 text-gold-800 font-medium">
                  <Clock className="w-3.5 h-3.5 text-gold-700" />
                  <span>Open 7 Days a Week</span>
                </p>
                <p>Mon &ndash; Sun: 10:00 AM &ndash; 11:00 PM</p>
                <p className="text-[11px] text-[#7A6350] pt-1">
                  Deliveries scheduled across all Karachi areas (DHA, Clifton, Gulshan, Landhi, Korangi, Nazimabad, Malir).
                </p>
              </div>

              {/* Social Links */}
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://www.facebook.com/CakeHousebysobia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white hover:bg-gold-600 border border-gold-300/80 flex items-center justify-center text-chocolate-900 hover:text-white transition-colors text-xs font-bold shadow-2xs"
                  aria-label="Facebook"
                >
                  f
                </a>
                <a
                  href="https://www.instagram.com/cakehousebysobia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white hover:bg-gold-600 border border-gold-300/80 flex items-center justify-center text-chocolate-900 hover:text-white transition-colors text-xs font-bold shadow-2xs"
                  aria-label="Instagram"
                >
                  ig
                </a>
                <a
                  href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-colors shadow-2xs"
                  aria-label="WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-5 border-t border-[#E8DEC8] text-center text-xs text-[#7A6350] flex flex-col md:flex-row items-center justify-between gap-2">
        <p>
          &copy; {new Date().getFullYear()} Cake House Karachi (cakehouse.shop). All rights reserved.
        </p>
        <p className="text-[11px] flex items-center justify-center gap-1 text-gold-800">
          Handcrafted with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> for sweet celebrations.
        </p>
      </div>
    </footer>
  );
}
