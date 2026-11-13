'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const activePrice = product.discount_price || product.price;
  const hasDiscount = !!product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const defaultWeight = product.sizes?.[0] || '2.5 lbs';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="group relative bg-white rounded-xl md:rounded-2xl border border-cream-200 hover:border-gold-300 transition-all duration-300 hover:shadow-md flex flex-col justify-between overflow-hidden">
      {/* Product Image & Badges Container */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-cream-50">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-berry-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Flash Deal / Featured Ribbon */}
        {product.is_flash_deal && (
          <span className="absolute top-2 right-2 bg-gold-600 text-white text-[9px] md:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 inline" /> Flash
          </span>
        )}

        {/* Weight / Size Pill at bottom of image */}
        <span className="absolute bottom-1.5 right-1.5 bg-chocolate-900/80 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded">
          {defaultWeight}
        </span>
      </Link>

      {/* Product Details & Action Area */}
      <div className="p-2.5 md:p-3.5 flex flex-col justify-between flex-1">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] text-gold-600 mb-1">
            <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
            <span className="font-bold">{product.rating || '5.0'}</span>
            <span className="text-chocolate-900/40 text-[10px]">
              ({product.reviews_count || 14})
            </span>
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product.slug}`}
            className="block text-xs md:text-sm font-semibold text-chocolate-900 group-hover:text-gold-600 transition-colors line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="pt-2 mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap mb-2">
            <span className="text-xs md:text-base font-bold text-gold-700">
              Rs. {activePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[10px] md:text-xs text-chocolate-900/40 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Compact Add to Cart Button */}
          <button
            onClick={handleQuickAdd}
            className="w-full py-1.5 md:py-2 px-2 bg-cream-100 hover:bg-gold-500 text-chocolate-900 hover:text-white border border-gold-300/80 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
