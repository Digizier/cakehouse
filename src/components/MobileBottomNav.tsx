'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Cake, ShoppingBag, Sparkles, Compass } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface MobileBottomNavProps {
  isMenuOpen?: boolean;
}

export function MobileBottomNav({ isMenuOpen = false }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();

  // If in admin panel or if mobile menu is open, do not show bottom bar
  if (pathname?.startsWith('/admin') || isMenuOpen) {
    return null;
  }

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      name: 'Cakes',
      href: '/shop',
      icon: Cake,
      isActive: pathname?.startsWith('/shop') && pathname !== '/custom-cake',
    },
    {
      name: 'Custom',
      href: '/custom-cake',
      icon: Sparkles,
      isActive: pathname === '/custom-cake',
      highlight: true,
    },
    {
      name: 'Cart',
      onClick: openCart,
      icon: ShoppingBag,
      badge: itemCount,
      isActive: false,
    },
    {
      name: 'Track',
      href: '/track-order',
      icon: Compass,
      isActive: pathname === '/track-order',
    },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none md:hidden">
      <nav className="pointer-events-auto flex items-center justify-around w-full max-w-sm px-2.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gold-300/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="relative flex flex-col items-center justify-center py-0.5 px-2">
              {item.highlight ? (
                <div
                  className={`w-9 h-9 -mt-4 rounded-full flex items-center justify-center shadow-md transition-all ${
                    item.isActive
                      ? 'bg-gold-600 text-white scale-110'
                      : 'bg-gradient-to-tr from-gold-500 to-gold-400 text-white hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4 animate-pulse" />
                </div>
              ) : (
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      item.isActive
                        ? 'text-gold-600'
                        : 'text-chocolate-900/60 hover:text-chocolate-900'
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-gold-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  item.isActive
                    ? 'font-bold text-gold-700'
                    : 'font-medium text-chocolate-900/70'
                }`}
              >
                {item.name}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className="focus:outline-none flex-1 flex justify-center active:scale-95 transition-transform"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              className="flex-1 flex justify-center focus:outline-none active:scale-95 transition-transform"
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
