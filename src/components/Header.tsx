'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Phone,
  Cake,
  Sparkles,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SearchModal } from './SearchModal';

export function Header({
  onMobileMenuChange,
}: {
  onMobileMenuChange?: (isOpen: boolean) => void;
}) {
  const pathname = usePathname();
  const { itemCount, openCart, settings } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Is this the admin route? Admin panel has NO public header!
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen;
    setIsMobileMenuOpen(nextState);
    if (onMobileMenuChange) onMobileMenuChange(nextState);
    if (nextState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    if (onMobileMenuChange) onMobileMenuChange(false);
    document.body.style.overflow = 'auto';
  };

  // If in admin panel, render nothing
  if (isAdmin) return null;

  return (
    <>
      <header className="w-full z-40 bg-white">
        {/* Top Announcement Bar - Light Luxury Palette */}
        <div className="bg-[#FAF5ED] text-[#4A3525] border-b border-[#E8DEC8] text-[11px] md:text-xs py-1.5 px-4 font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-gold-600 flex-shrink-0 animate-pulse" />
              <span className="truncate font-semibold">
                Fresh Homemade Celebration Cakes in Karachi &bull; Delivery Charges Apply Across All Areas.
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[#6B5340] text-xs flex-shrink-0">
              <a
                href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-gold-700 transition-colors font-medium"
              >
                <Phone className="w-3 h-3 text-gold-600" />
                <span>WhatsApp: {settings?.whatsapp || '0302-9257271'}</span>
              </a>
              <span className="text-gold-300">|</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gold-600" />
                <span>Landhi, Karachi</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div
          className={`w-full border-b border-cream-200 transition-all duration-300 ${
            isScrolled
              ? 'sticky top-0 bg-white/95 backdrop-blur-md shadow-sm'
              : 'bg-white'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                aria-label="Open Menu"
                className="p-2 -ml-2 text-chocolate-900 hover:text-gold-600 focus:outline-none"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <img
                src="/logo.png"
                alt="Cake House Golden Logo"
                className="w-10 h-10 md:w-14 md:h-14 object-contain rounded-full border border-gold-300/40 shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-serif text-lg md:text-2xl font-bold tracking-tight text-chocolate-900 group-hover:text-gold-600 transition-colors">
                  Cake House
                </span>
                <span className="text-[10px] md:text-xs text-gold-600 font-medium tracking-wider uppercase -mt-0.5">
                  Made With Love
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-5 text-xs lg:text-sm font-medium text-chocolate-900">
              <Link
                href="/"
                className={`hover:text-gold-600 transition-colors py-1 ${
                  pathname === '/' ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`hover:text-gold-600 transition-colors py-1 ${
                  pathname === '/shop' ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                All Cakes
              </Link>
              <Link
                href="/custom-cake"
                className={`hover:text-gold-600 transition-colors py-1 flex items-center gap-1 ${
                  pathname === '/custom-cake' ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>Your Cake Your Way</span>
              </Link>
              <Link
                href="/shop/gift-boxes"
                className={`hover:text-gold-600 transition-colors py-1 ${
                  pathname?.includes('gift-boxes') ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                Gift Boxes
              </Link>
              <Link
                href="/shop/cake-decorations"
                className={`hover:text-gold-600 transition-colors py-1 ${
                  pathname?.includes('cake-decorations') ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                Cake Decorations
              </Link>
              <Link
                href="/track-order"
                className={`hover:text-gold-600 transition-colors py-1 ${
                  pathname === '/track-order' ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                Track Order
              </Link>
              <Link
                href="/about"
                className={`hover:text-gold-600 transition-colors py-1 ${
                  pathname === '/about' ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`hover:text-gold-600 transition-colors py-1 ${
                  pathname === '/contact' ? 'text-gold-600 font-bold border-b-2 border-gold-500' : ''
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Action Icons (Search, Cart, WhatsApp) */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-chocolate-900 hover:text-gold-600 hover:bg-cream-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2 text-chocolate-900 hover:text-gold-600 hover:bg-cream-100 rounded-full transition-colors focus:outline-none"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-scaleIn">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Desktop WhatsApp Action Button */}
              <a
                href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}?text=Hello%20Cake%20House,%20I%20would%20like%20to%20inquire%20about%20ordering%20a%20cake.`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-cream-100 hover:bg-gold-100 text-chocolate-900 border border-gold-200 rounded-full text-xs font-semibold transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>0302-9257271</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-chocolate-900/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slideInLeft border-r border-gold-200">
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-cream-200 flex items-center justify-between bg-cream-50">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Cake House"
                    className="w-9 h-9 rounded-full border border-gold-300"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-sm text-chocolate-900">
                      Cake House
                    </h3>
                    <p className="text-[10px] text-gold-600 font-medium">
                      Karachi, Pakistan
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-1 rounded-full text-chocolate-900 hover:bg-cream-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="py-3 px-4 space-y-1">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'All Cakes', href: '/shop' },
                  { name: 'Your Cake Your Way', href: '/custom-cake', badge: 'Popular' },
                  { name: 'Gift Boxes', href: '/shop/gift-boxes', badge: 'New' },
                  { name: 'Cake Decorations', href: '/shop/cake-decorations', badge: 'New' },
                  { name: 'Birthday Cakes', href: '/shop/birthday-cakes' },
                  { name: 'Chocolate Cakes', href: '/shop/chocolate-cakes' },
                  { name: 'Track Your Order', href: '/track-order' },
                  { name: 'About Sobia & Bakery', href: '/about' },
                  { name: 'Contact & Location', href: '/contact' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium text-chocolate-900 hover:bg-cream-100 hover:text-gold-600 transition-colors"
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full border border-gold-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Footer Information */}
            <div className="p-4 border-t border-cream-200 bg-cream-50/70 space-y-3">
              <a
                href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>

              <div className="text-[11px] text-chocolate-900/70 space-y-1">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-gold-600 flex-shrink-0" />
                  <span>Landhi #4, Zamanabad, Karachi</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gold-600 flex-shrink-0" />
                  <span>10:00 AM &ndash; 11:00 PM Daily</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
