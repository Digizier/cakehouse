'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Cake, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/db';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      getProducts({ searchQuery: query }).then((data) => {
        setResults(data.slice(0, 6));
        setLoading(false);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-chocolate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gold-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-cream-200 bg-cream-50/50">
          <Search className="w-5 h-5 text-gold-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cakes (e.g. chocolate fudge, bday cake, bento)..."
            className="w-full bg-transparent text-chocolate-900 placeholder:text-chocolate-900/40 focus:outline-none text-sm md:text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 mr-1 text-chocolate-900/40 hover:text-chocolate-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream-200/60 text-chocolate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[65vh] overflow-y-auto p-4 divide-y divide-cream-100">
          {loading && (
            <div className="py-8 text-center text-sm text-gold-600 font-medium animate-pulse">
              Finding fresh delights...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center">
              <Cake className="w-10 h-10 text-gold-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-chocolate-900">
                No cakes found matching &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-chocolate-900/60 mt-1">
                Try searching &ldquo;fudge&rdquo;, &ldquo;bento&rdquo;, or &ldquo;birthday&rdquo;
              </p>
            </div>
          )}

          {!loading &&
            results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-3.5 py-2.5 px-2 hover:bg-cream-50 rounded-xl transition-colors group"
              >
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border border-cream-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-chocolate-900 truncate group-hover:text-gold-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-gold-600">
                      Rs. {(product.discount_price || product.price).toLocaleString()}
                    </span>
                    {product.discount_price && (
                      <span className="text-xs text-chocolate-900/40 line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-chocolate-900/30 group-hover:text-gold-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}

          {!query && (
            <div className="py-4">
              <p className="text-xs font-semibold text-chocolate-900/50 uppercase tracking-wider mb-2.5">
                Popular Searches in Karachi
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Chocolate Fudge',
                  'Fallen Angel',
                  'Vintage Heart',
                  'Lotus Biscoff',
                  'Bento Cake',
                  'Crown Cake',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-3 py-1.5 rounded-full bg-cream-100/80 hover:bg-gold-100 text-chocolate-900/80 hover:text-gold-700 transition-colors border border-cream-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
