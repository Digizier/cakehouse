'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { CartDrawer } from './CartDrawer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Header onMobileMenuChange={setIsMobileMenuOpen} />
      <div className="flex-1">{children}</div>
      <Footer />
      <MobileBottomNav isMenuOpen={isMobileMenuOpen} />
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
