'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const { settings } = useCart();

  // Hide in admin panel
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const phone = settings?.whatsapp || '0302-9257271';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const internationalNumber = cleanPhone.startsWith('0')
    ? `92${cleanPhone.slice(1)}`
    : cleanPhone;

  const whatsappUrl = `https://wa.me/${internationalNumber}?text=Hello%20Cake%20House,%20I%20would%20like%20to%20order%20or%20inquire%20about%20a%20cake.`;

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-16 md:bottom-6 right-4 z-30 flex items-center group"
    >
      {/* Tooltip on hover */}
      <span className="hidden md:block mr-2.5 px-3 py-1.5 rounded-full bg-chocolate-900 text-white text-xs font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Order on WhatsApp
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Cake House"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
      >
        <Phone className="w-6 h-6 md:w-7 md:h-7" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gold-400 border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gold-500 border-2 border-white" />
      </a>
    </aside>
  );
}
