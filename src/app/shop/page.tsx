'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Filter,
  X,
  ChevronRight,
  Sparkles,
  ChevronLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Category, SubCategory } from '@/lib/types';
import { getProducts, getCategories, getSubCategories } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ShimmerSkeleton';

const ITEMS_PER_PAGE = 8; // Strictly 8 products per page per user mandate

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [cats, subs, prods] = await Promise.all([
          getCategories(),
          getSubCategories(),
          getProducts(),
        ]);
        setCategories(cats);
        setSubCategories(subs);
        setProducts(prods);
      } finally {
        setLoading(false);
      }
    }
    init();

    const handleUpdate = () => {
      getProducts().then(setProducts);
      getCategories().then(setCategories);
      getSubCategories().then(setSubCategories);
    };

    window.addEventListener('kb_products_updated', handleUpdate);
    window.addEventListener('kb_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('kb_products_updated', handleUpdate);
      window.removeEventListener('kb_categories_updated', handleUpdate);
    };
  }, []);

  // Filter products
  let filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
      return false;
    }
    if (selectedSubCategory !== 'all' && p.sub_category_id !== selectedSubCategory) {
      return false;
    }
    return true;
  });

  // Sort products
  if (sortBy === 'price-asc') {
    filtered.sort(
      (a, b) =>
        (a.discount_price || a.price) - (b.discount_price || b.price)
    );
  } else if (sortBy === 'price-desc') {
    filtered.sort(
      (a, b) =>
        (b.discount_price || b.price) - (a.discount_price || a.price)
    );
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
  }

  // Strictly 8 products per page pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Active subcategories for selected category (Daraz-style multi-tier)
  const activeSubCategories =
    selectedCategory === 'all'
      ? []
      : subCategories.filter((s) => s.category_id === selectedCategory);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('all');
    setCurrentPage(1);
  };

  const handleSubCategorySelect = (subId: string) => {
    setSelectedSubCategory(subId);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      {/* Shop Header Banner */}
      <div className="bg-chocolate-900 text-cream-100 py-8 md:py-12 px-4 border-b border-gold-900/60">
        <div className="max-w-7xl mx-auto text-center space-y-2">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Karachi Bakery Catalog
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            Handcrafted Cakes & Delights
          </h1>
          <p className="text-xs md:text-sm text-cream-200/80 max-w-lg mx-auto">
            Explore our artisanal homemade collection of fresh celebratory cakes, luxury Belgian fudge, and custom creations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Mobile Filter Bar & Sort Controls */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream-200 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-lg border border-cream-300 text-xs font-semibold text-chocolate-900 shadow-2xs hover:bg-cream-100 transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-gold-600" />
              <span>Filter Categories ({filtered.length})</span>
            </button>
            <p className="hidden md:block text-xs text-chocolate-900/60 font-medium">
              Showing <strong>{paginatedProducts.length}</strong> of <strong>{filtered.length}</strong> cakes
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-chocolate-900/60 hidden sm:inline font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-cream-300 rounded-lg text-chocolate-900 font-medium focus:outline-none focus:border-gold-500 shadow-2xs"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout: Desktop Sidebar + Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Left Sidebar Filter (Daraz-Style Multi-Tier) */}
          <aside className="hidden md:block md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-4">
                <h3 className="font-serif font-bold text-sm text-chocolate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-gold-600" />
                  <span>Categories</span>
                </h3>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="text-[11px] text-gold-600 hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Main Categories List */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-gold-50 text-gold-700 font-bold border-l-4 border-gold-500'
                      : 'text-chocolate-900/80 hover:bg-cream-100 hover:text-chocolate-900'
                  }`}
                >
                  <span>All Cakes</span>
                  <span className="text-[10px] text-chocolate-900/40">({products.length})</span>
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const catProductsCount = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <div key={cat.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-gold-50 text-gold-700 font-bold border-l-4 border-gold-500'
                            : 'text-chocolate-900/80 hover:bg-cream-100 hover:text-chocolate-900'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] text-chocolate-900/40">({catProductsCount})</span>
                      </button>

                      {/* Sub-Categories (Daraz-style nested sub-categories) */}
                      {isSelected && activeSubCategories.length > 0 && (
                        <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-gold-200 ml-2">
                          <button
                            type="button"
                            onClick={() => handleSubCategorySelect('all')}
                            className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition-colors ${
                              selectedSubCategory === 'all'
                                ? 'text-gold-700 font-bold bg-gold-100/60'
                                : 'text-chocolate-900/60 hover:text-chocolate-900 hover:bg-cream-100'
                            }`}
                          >
                            &bull; All {cat.name}
                          </button>
                          {activeSubCategories.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleSubCategorySelect(sub.id)}
                              className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition-colors truncate block ${
                                selectedSubCategory === sub.id
                                  ? 'text-gold-700 font-bold bg-gold-100/60'
                                  : 'text-chocolate-900/60 hover:text-chocolate-900 hover:bg-cream-100'
                              }`}
                            >
                              &bull; {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Product Grid (2-Columns on Mobile, 3-Columns on Desktop) */}
          <section className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Strictly 8-Products Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-cream-200 flex items-center justify-center gap-2">
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
                  Try selecting another category or view all cakes.
                </p>
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="mt-4 px-5 py-2 rounded-full bg-gold-500 text-white text-xs font-bold hover:bg-gold-600 transition-colors"
                >
                  View All Cakes
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Category Filter Drawer (Ergonomic: button selectors + "Done" dismiss) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div
            className="fixed inset-0 bg-chocolate-900/60 backdrop-blur-sm"
            onClick={() => setIsFilterModalOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 p-5 overflow-y-auto animate-slideInRight">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-4">
                <h3 className="font-serif font-bold text-base text-chocolate-900">
                  Filter by Category
                </h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1 rounded-full text-chocolate-900 hover:bg-cream-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-gold-500 text-white font-bold'
                      : 'text-chocolate-900/80 hover:bg-cream-100'
                  }`}
                >
                  <span>All Cakes</span>
                  <span className="text-[10px] opacity-75">({products.length})</span>
                </button>

                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-gold-500 text-white font-bold'
                          : 'text-chocolate-900/80 hover:bg-cream-100'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-75">
                        ({products.filter((p) => p.category_id === cat.id).length})
                      </span>
                    </button>

                    {/* Subcategories */}
                    {selectedCategory === cat.id && activeSubCategories.length > 0 && (
                      <div className="pl-3 py-1 space-y-1">
                        {activeSubCategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSubCategorySelect(sub.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition-colors ${
                              selectedSubCategory === sub.id
                                ? 'bg-gold-100 text-gold-800 font-bold'
                                : 'text-chocolate-900/60 hover:text-chocolate-900 hover:bg-cream-100'
                            }`}
                          >
                            &bull; {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Done (X Cakes) Ergonomic Dismissal Button */}
            <div className="pt-4 border-t border-cream-200 mt-6">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full py-3 bg-chocolate-900 hover:bg-chocolate-800 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-md"
              >
                Done ({filtered.length} Cakes)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
