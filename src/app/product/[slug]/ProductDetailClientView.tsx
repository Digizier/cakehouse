'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  Phone,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { getProductBySlug, getProducts } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailClientView({ slug }: { slug: string }) {
  const router = useRouter();
  const { addToCart, settings } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prod = await getProductBySlug(slug);
        setProduct(prod);
        if (prod) {
          setActiveImage(prod.thumbnail_url);
          setSelectedSize(prod.sizes[0] || '2.5 lbs');
          setSelectedFlavor(prod.flavors[0] || 'Chocolate Fudge');

          const related = await getProducts({
            categoryId: prod.category_id,
            limit: 4,
          });
          setRelatedProducts(related.filter((r) => r.id !== prod.id).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-chocolate-900/70">
            Baking cake details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-cream-50">
        <h2 className="text-xl font-serif font-bold text-chocolate-900 mb-2">
          Cake Not Found
        </h2>
        <p className="text-xs text-chocolate-900/60 mb-6 max-w-sm">
          The requested cake may have been retired or moved to another section.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-full bg-gold-500 text-white font-bold text-xs hover:bg-gold-600 transition-colors shadow-sm"
        >
          Explore All Available Cakes
        </Link>
      </div>
    );
  }

  const activePrice = product.discount_price || product.price;
  const hasDiscount = !!product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedFlavor, customMessage, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedFlavor, customMessage, quantity);
    router.push('/checkout');
  };

  const gallery = [
    product.thumbnail_url,
    ...(product.gallery_urls || []).filter((u) => u !== product.thumbnail_url),
  ];

  const whatsappInquiryUrl = `https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}?text=Hello%20Cake%20House,%20I%20am%20interested%20in%20ordering%20*${encodeURIComponent(product.name)}*%20(${selectedSize},%20${selectedFlavor}).`;

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-chocolate-900/60 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-gold-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-gold-600 transition-colors">
            Cakes
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-700 font-semibold truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-cream-200 shadow-sm">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Main Featured Image Container */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream-100 border border-cream-200 shadow-2xs">
              <img
                src={activeImage || product.thumbnail_url}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-berry-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail Switcher Gallery */}
            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === img
                        ? 'border-gold-500 shadow-sm scale-105'
                        : 'border-cream-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Customizations & Actions */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              {/* Reviews & Star Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
                  ))}
                </div>
                <span className="text-xs font-bold text-chocolate-900">
                  {product.rating || '5.0'}
                </span>
                <span className="text-xs text-chocolate-900/40">
                  ({product.reviews_count || 18} Verified Karachi Reviews)
                </span>
              </div>

              {/* Title & Tagline */}
              <h1 className="text-xl md:text-3xl font-serif font-bold text-chocolate-900 leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 my-3">
                <span className="text-2xl md:text-3xl font-serif font-bold text-gold-700">
                  Rs. {activePrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm md:text-base text-chocolate-900/40 line-through">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
                {product.is_available ? (
                  <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    Freshly Baked to Order
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs md:text-sm text-chocolate-900/70 leading-relaxed pt-1 border-t border-cream-200">
                {product.description}
              </p>

              {/* Size / Weight Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <label className="block text-xs font-bold text-chocolate-900 uppercase tracking-wide">
                    Select Cake Weight / Size: <span className="text-gold-600">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                          selectedSize === size
                            ? 'bg-gold-500 text-white border-gold-600 font-bold shadow-2xs'
                            : 'bg-white border-cream-300 text-chocolate-900/80 hover:bg-cream-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavor Selection */}
              {product.flavors && product.flavors.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <label className="block text-xs font-bold text-chocolate-900 uppercase tracking-wide">
                    Select Delicious Flavor: <span className="text-gold-600">{selectedFlavor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.flavors.map((flv) => (
                      <button
                        key={flv}
                        type="button"
                        onClick={() => setSelectedFlavor(flv)}
                        className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                          selectedFlavor === flv
                            ? 'bg-gold-500 text-white border-gold-600 font-bold shadow-2xs'
                            : 'bg-white border-cream-300 text-chocolate-900/80 hover:bg-cream-100'
                        }`}
                      >
                        {flv}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Message on Cake Input */}
              <div className="mt-4 space-y-1.5">
                <label className="block text-xs font-bold text-chocolate-900 uppercase tracking-wide">
                  Custom Message on Cake (Optional):
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday Fatima! (Free piping)"
                  maxLength={50}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/50"
                />
              </div>

              {/* Quantity Selector & Add to Cart Buttons */}
              <div className="mt-6 pt-4 border-t border-cream-200 space-y-3">
                <div className="flex items-center gap-3">
                  {product.is_available && (
                    <div className="flex items-center border border-cream-300 rounded-xl bg-white shadow-2xs">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-chocolate-900/60 hover:text-chocolate-900 hover:bg-cream-100 rounded-l-xl"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-xs text-chocolate-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-2 text-chocolate-900/60 hover:text-chocolate-900 hover:bg-cream-100 rounded-r-xl"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.is_available}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                      product.is_available
                        ? 'bg-chocolate-900 hover:bg-chocolate-800 text-white active:scale-98'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-gold-400" />
                    <span>
                      {product.is_available
                        ? `Add to Cart — Rs. ${(activePrice * quantity).toLocaleString()}`
                        : 'Currently Out of Stock'}
                    </span>
                  </button>
                </div>

                {/* Direct Buy Now Button */}
                {product.is_available && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3 px-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Buy Now (Instant Checkout)</span>
                  </button>
                )}

                {/* Single Contextual WhatsApp Button */}
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-green-50 hover:bg-green-100 text-green-800 border border-green-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Have questions? Ask Sobia on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Quality & Delivery Assurance Pills */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cream-200 text-[11px] text-chocolate-900/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span>100% Halal & Pure Butter</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                <span>Karachi Chilled Delivery</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                <span>Secure Bank / COD / JazzCash</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-berry-500 flex-shrink-0" />
                <span>Candle & Knife Included</span>
              </span>
            </div>
          </div>
        </div>

        {/* Related Cakes Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h3 className="font-serif text-lg md:text-2xl font-bold text-chocolate-900 mb-6">
              You May Also Love
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
