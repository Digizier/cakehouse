'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cake, Home, Sparkles } from 'lucide-react';
import ProductDetailClientView from './product/[slug]/ProductDetailClientView';
import CategoryClientView from './shop/[category]/CategoryClientView';

export default function NotFound() {
  const [routeType, setRouteType] = useState<'product' | 'category' | '404' | 'loading'>('loading');
  const [slugParam, setSlugParam] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;

    // Check dynamic product route: /product/[slug]
    const productMatch = pathname.match(/^\/product\/([^/]+)/);
    if (productMatch && productMatch[1]) {
      setSlugParam(decodeURIComponent(productMatch[1]));
      setRouteType('product');
      return;
    }

    // Check dynamic category route: /shop/[category]
    const shopMatch = pathname.match(/^\/shop\/([^/]+)/);
    if (shopMatch && shopMatch[1]) {
      setSlugParam(decodeURIComponent(shopMatch[1]));
      setRouteType('category');
      return;
    }

    setRouteType('404');
  }, []);

  if (routeType === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream-50">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (routeType === 'product' && slugParam) {
    return <ProductDetailClientView slug={slugParam} />;
  }

  if (routeType === 'category' && slugParam) {
    return <CategoryClientView categorySlug={slugParam} />;
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-cream-50/60 p-6 text-center">
      <div className="max-w-md bg-white rounded-3xl p-8 border border-cream-200 shadow-md space-y-4">
        <div className="w-16 h-16 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mx-auto">
          <Cake className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-200">
            404 &bull; Page Not Found
          </span>
          <h1 className="text-2xl font-serif font-bold text-chocolate-900 mt-2">
            Oops! This Slice is Missing
          </h1>
          <p className="text-xs text-chocolate-900/60 mt-1">
            The page you are looking for might have been eaten, moved, or never baked in the first place.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-chocolate-900 hover:bg-chocolate-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4 text-gold-400" />
            <span>Go to Homepage</span>
          </Link>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore All Cakes</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
