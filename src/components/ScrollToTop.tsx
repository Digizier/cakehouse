'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Universal Scroll-to-Top Component:
 * Fixes the bug where navigating to product, catalog, or service pages
 * opened at the bottom of the viewport instead of the top.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant jump to top on route change
    });
  }, [pathname]);

  return null;
}
