'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, ChevronLeft } from 'lucide-react';
import { Product, Category, SubCategory } from '@/lib/types';
import { getProducts, getCategories, getSubCategories } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ShimmerSkeleton';

const ITEMS_PER_PAGE = 8; // Strictly 8 products per page per user mandate

export default function CategoryClientView({ categorySlug }: { categorySlug: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const cats = await getCategories();
        const found = cats.find((c) => c.slug === categorySlug) || null;
        setCategory(found);

        if (found) {
          const [subs, prods] = await Promise.all([
            getSubCategories(found.id),
            getProducts({ categoryId: found.id }),
          ]);
          setSubCategories(subs);
          setProducts(prods);
        } else {
          const prods = await getProducts();
          setProducts(prods);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCategoryData();
  }, [categorySlug]);

  const filteredProducts =
    selectedSubCategory === 'all'
      ? products
      : products.filter((p) => p.sub_category_id === selectedSubCategory);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      {/* Category Banner */}
      <div className="bg-chocolate-900 text-cream-100 py-8 md:py-12 px-4 border-b border-gold-900/60">
        <div className="max-w-7xl mx-auto text-center space-y-2">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-cream-300/70 mb-2">
            <Link href="/" className="hover:text-gold-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-gold-400 transition-colors">
              Cakes
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gold-400 font-semibold capitalize">
              {category?.name || categorySlug.replace(/-/g, ' ')}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            {category?.name || 'Artisanal Cakes'}
          </h1>
          <p className="text-xs md:text-sm text-cream-200/80 max-w-lg mx-auto">
            {category?.description ||
              'Freshly handcrafted celebration cakes made with premium butter and love in Karachi.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Subcategories Pills Navigation (Daraz-style) */}
        {subCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button
              onClick={() => {
                setSelectedSubCategory('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubCategory === 'all'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-white border border-cream-300 text-chocolate-900/80 hover:bg-cream-100'
              }`}
            >
              All {category?.name}
            </button>

            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubCategory(sub.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSubCategory === sub.id
                    ? 'bg-gold-500 text-white shadow-sm'
                    : 'bg-white border border-cream-300 text-chocolate-900/80 hover:bg-cream-100'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Count & Sort Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-cream-200 text-xs text-chocolate-900/60 font-medium">
          <span>
            Showing <strong>{paginatedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> cakes
          </span>
          <Link
            href="/custom-cake"
            className="text-gold-700 hover:text-gold-800 font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Need Custom Theme? Book Here &rarr;</span>
          </Link>
        </div>

        {/* Product Grid (Strictly 8 per page, 2-col on mobile) */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 pt-6 border-t border-cream-200 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-cream-300 bg-white text-chocolate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-100 transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-gold-500 text-white shadow-sm'
                          : 'bg-white border border-cream-300 text-chocolate-900 hover:bg-cream-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-cream-300 bg-white text-chocolate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-100 transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream-200 p-8">
            <Sparkles className="w-10 h-10 text-gold-400 mx-auto mb-2 opacity-60" />
            <h3 className="text-base font-serif font-bold text-chocolate-900">
              No cakes found in this category
            </h3>
            <p className="text-xs text-chocolate-900/60 mt-1 max-w-xs mx-auto">
              Check out our complete catalog or request a custom order.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-5 py-2 rounded-full bg-gold-500 text-white text-xs font-bold hover:bg-gold-600 transition-colors"
            >
              View All Cakes
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
