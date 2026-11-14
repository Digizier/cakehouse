'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, Check, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    deliveryFee,
    netTotal,
    freeShippingProgress,
    amountNeededForFreeShipping,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCouponCode(couponInput);
    setIsApplying(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-chocolate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gold-200 animate-slideInRight">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 bg-cream-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold-600" />
              <h2 className="text-base md:text-lg font-serif font-bold text-chocolate-900">
                Your Sweet Cart ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-cream-200 text-chocolate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Policy Note */}
          <div className="bg-cream-100/90 px-5 py-3 border-b border-cream-200">
            <div className="flex items-center justify-between text-xs font-medium text-chocolate-900">
              <span className="flex items-center gap-1.5 font-semibold text-chocolate-900">
                <Truck className="w-4 h-4 text-gold-600 inline" />
                <span>Delivery Charges Apply Across All Areas</span>
              </span>
              <span className="text-[10px] bg-gold-100 text-gold-800 font-bold px-2 py-0.5 rounded-full border border-gold-300">
                Chilled Safe Transit
              </span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-cream-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-gold-400" />
                </div>
                <h3 className="text-base font-serif font-semibold text-chocolate-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-chocolate-900/60 max-w-xs mb-5">
                  Explore our handcrafted collection of cakes and sweeten your celebration today.
                </p>
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-medium text-xs transition-colors shadow-sm"
                >
                  Explore Delicious Cakes
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-3.5 group">
                  <img
                    src={item.thumbnail_url}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-lg object-cover border border-cream-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="text-xs md:text-sm font-semibold text-chocolate-900 hover:text-gold-600 transition-colors line-clamp-1"
                      >
                        {item.product_name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-chocolate-900/40 hover:text-red-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Variations details */}
                    <div className="text-[11px] text-chocolate-900/60 mt-0.5 space-x-2">
                      <span className="inline-block bg-cream-100 px-1.5 py-0.5 rounded text-chocolate-900/80 font-medium">
                        {item.selected_size}
                      </span>
                      <span className="inline-block bg-cream-100 px-1.5 py-0.5 rounded text-chocolate-900/80">
                        {item.selected_flavor}
                      </span>
                    </div>

                    {item.custom_message && (
                      <p className="text-[11px] text-gold-700 italic mt-0.5 truncate">
                        &ldquo;{item.custom_message}&rdquo;
                      </p>
                    )}

                    {/* Price and quantity row */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-cream-300 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-chocolate-900/60 hover:text-chocolate-900 hover:bg-cream-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-chocolate-900 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-chocolate-900/60 hover:text-chocolate-900 hover:bg-cream-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs md:text-sm font-bold text-gold-700">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-cream-200 bg-cream-50/50 space-y-3.5">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-green-800 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon Code (e.g. SWEETWELCOME)"
                      className="flex-1 uppercase text-xs px-3 py-2 rounded-lg border border-cream-300 focus:outline-none focus:border-gold-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-3 py-2 bg-chocolate-900 hover:bg-chocolate-800 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-green-700 mt-1">{couponSuccess}</p>}
              </div>

              {/* Price Calculation breakdown */}
              <div className="space-y-1.5 text-xs text-chocolate-900/80 pt-2 border-t border-cream-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-chocolate-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Discount</span>
                    <span>-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery (Karachi)</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-700 font-bold uppercase">FREE</span>
                    ) : (
                      `Rs. ${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm md:text-base font-bold text-chocolate-900 pt-2 border-t border-cream-300">
                  <span>Estimated Total</span>
                  <span className="text-gold-700 font-serif">Rs. {netTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
