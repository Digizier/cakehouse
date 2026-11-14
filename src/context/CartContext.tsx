'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon, SiteSettings } from '@/lib/types';
import { getSiteSettings, validateCoupon } from '@/lib/db';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    selectedSize?: string,
    selectedFlavor?: string,
    customMessage?: string,
    quantity?: number
  ) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  netTotal: number;
  freeShippingProgress: number; // 0 to 100 percentage
  amountNeededForFreeShipping: number;
  settings: SiteSettings | null;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ch_cart_items_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Load cart and settings on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch {}

    getSiteSettings().then(setSettings);

    const handleSettingsUpdate = () => {
      getSiteSettings().then(setSettings);
    };

    window.addEventListener('kb_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('kb_settings_updated', handleSettingsUpdate);
  }, []);

  // Save cart to local storage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (
    product: Product,
    selectedSize?: string,
    selectedFlavor?: string,
    customMessage?: string,
    quantity = 1
  ) => {
    const size = selectedSize || product.sizes[0] || 'Standard';
    const flavor = selectedFlavor || product.flavors[0] || 'Standard Flavor';
    const cartItemId = `${product.id}-${size}-${flavor}-${customMessage || ''}`;
    const activePrice = product.discount_price || product.price;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product_id: product.id,
          product_name: product.name,
          slug: product.slug,
          thumbnail_url: product.thumbnail_url,
          price: activePrice,
          quantity,
          selected_size: size,
          selected_flavor: flavor,
          custom_message: customMessage,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const applyCouponCode = async (code: string) => {
    const result = await validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // Client policy: Delivery Charges Apply Across All Areas (unless coupon has is_free_delivery)
  const isFreeDelivery = appliedCoupon?.is_free_delivery ?? false;
  const deliveryFee = subtotal === 0 || isFreeDelivery ? 0 : settings?.base_delivery_fee || 250;
  const discountAmount = couponDiscount;
  const netTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const freeShippingProgress = 100;
  const amountNeededForFreeShipping = 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        subtotal,
        discountAmount,
        deliveryFee,
        netTotal,
        freeShippingProgress,
        amountNeededForFreeShipping,
        settings,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
