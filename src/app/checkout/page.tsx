'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Phone,
  Truck,
  ShieldCheck,
  Upload,
  AlertCircle,
  Sparkles,
  ArrowRight,
  FileText,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/db';
import { uploadImageAndGetUrl } from '@/lib/imageCompression';
import { PaymentMethod } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discountAmount,
    deliveryFee,
    netTotal,
    clearCart,
    closeCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    settings,
  } = useCart();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Gulshan-e-Iqbal');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('12:00 PM - 3:00 PM');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Coupon state for checkout
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Automatically close cart drawer when checkout page is active
  useEffect(() => {
    closeCart();
  }, [closeCart]);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCouponCode(couponInput);
    setIsApplyingCoupon(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const karachiAreas = [
    'Gulshan-e-Iqbal',
    'DHA Phase 1-8',
    'Clifton',
    'Landhi / Korangi',
    'North Nazimabad',
    'PECHS / Tariq Road',
    'Bahria Town Karachi',
    'Malir Cantt',
    'Gulistan-e-Jauhar',
    'Federal B Area',
    'Saddar / Garden',
  ];

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentProofFile(file);
      setPaymentProofPreview(URL.createObjectURL(file));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your cart is empty. Please add items to checkout.');
      return;
    }

    if (!firstName || !phone || !deliveryDate) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (deliveryType === 'delivery' && !address) {
      setErrorMsg('Please provide a delivery street address.');
      return;
    }

    try {
      setSubmitting(true);
      let proofUrl: string | null = null;

      // If online payment method and user attached proof, upload to Supabase storage
      if (paymentMethod !== 'cod' && paymentProofFile) {
        const uploadRes = await uploadImageAndGetUrl(
          paymentProofFile,
          'payment-proofs',
          'proofs'
        );
        proofUrl = uploadRes.url;
      }

      const orderPayload = {
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_phone: phone,
        customer_whatsapp: whatsapp || phone,
        customer_email: email,
        delivery_type: deliveryType,
        address: deliveryType === 'delivery' ? address : 'Bakery Pickup (Landhi, Karachi)',
        area: deliveryType === 'delivery' ? area : 'Landhi',
        city: 'Karachi',
        delivery_date: deliveryDate,
        delivery_time_slot: deliveryTimeSlot,
        order_notes: orderNotes,
        payment_method: paymentMethod,
        payment_status: 'pending' as const,
        payment_proof_url: proofUrl,
        total_amount: subtotal,
        discount_amount: discountAmount,
        delivery_fee: deliveryType === 'pickup' ? 0 : deliveryFee,
        net_total: deliveryType === 'pickup' ? subtotal - discountAmount : netTotal,
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.price,
          total_price: i.price * i.quantity,
          selected_size: i.selected_size,
          selected_flavor: i.selected_flavor,
          custom_message: i.custom_message,
        })),
      };

      const created = await createOrder(orderPayload);
      clearCart();
      setConfirmedOrder(created);

      // Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order placed, show order complete screen
  if (confirmedOrder) {
    const whatsappText = `Hello Cake House, I just placed Order *#${confirmedOrder.order_number}*!
Name: ${confirmedOrder.customer_name}
Total: Rs. ${confirmedOrder.net_total.toLocaleString()}
Delivery Date: ${confirmedOrder.delivery_date} (${confirmedOrder.delivery_time_slot})
Payment Method: ${confirmedOrder.payment_method.toUpperCase()}`;

    const whatsappUrl = `https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}?text=${encodeURIComponent(whatsappText)}`;

    return (
      <main className="min-h-screen bg-cream-50/50 py-12 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-gold-300 shadow-xl text-center space-y-6 animate-scaleIn">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-green-700 bg-green-100 px-3 py-1 rounded-full">
              Order Confirmed
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-chocolate-900 mt-2">
              Thank You, {confirmedOrder.customer_name}!
            </h1>
            <p className="text-xs text-chocolate-900/60 mt-1">
              Your celebration cake order has been scheduled for baking and delivery.
            </p>
          </div>

          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 text-left space-y-2.5 text-xs text-chocolate-900">
            <div className="flex justify-between border-b border-cream-200 pb-2">
              <span className="text-chocolate-900/60">Order Number:</span>
              <strong className="text-gold-700 font-mono text-sm">
                #{confirmedOrder.order_number}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-chocolate-900/60">Delivery Date:</span>
              <span>{confirmedOrder.delivery_date} ({confirmedOrder.delivery_time_slot})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chocolate-900/60">Payment Method:</span>
              <span className="font-semibold uppercase">{confirmedOrder.payment_method}</span>
            </div>
            <div className="flex justify-between border-t border-cream-200 pt-2 text-sm font-bold">
              <span>Total Amount:</span>
              <span className="text-gold-700 font-serif">Rs. {confirmedOrder.net_total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Connect with Bakery on WhatsApp</span>
            </a>

            <Link
              href={`/track-order?orderId=${confirmedOrder.order_number}&phone=${confirmedOrder.customer_phone}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-cream-100 hover:bg-gold-100 text-chocolate-900 rounded-xl font-bold text-xs border border-cream-300 transition-colors"
            >
              <FileText className="w-4 h-4 text-gold-600" />
              <span>Track Live Delivery Status</span>
            </Link>

            <Link
              href="/"
              className="inline-block text-xs font-semibold text-chocolate-900/60 hover:text-chocolate-900 underline pt-1"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      {/* Checkout Breadcrumbs Header */}
      <div className="bg-chocolate-900 text-cream-100 py-6 md:py-8 px-4 border-b border-gold-900/60">
        <div className="max-w-7xl mx-auto text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs text-cream-300/70 font-medium">
            <span>SHOPPING CART</span>
            <span>&rarr;</span>
            <span className="text-gold-400 font-bold underline">CHECKOUT</span>
            <span>&rarr;</span>
            <span>ORDER COMPLETE</span>
          </div>
          <h1 className="text-xl md:text-3xl font-serif font-bold text-cream-50">
            Secure Karachi Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-5 md:p-8 border border-cream-200 shadow-2xs space-y-5">
              <h2 className="font-serif font-bold text-base md:text-lg text-chocolate-900 pb-3 border-b border-cream-200">
                1. Delivery & Billing Information
              </h2>

              {/* Delivery vs Pickup Radio Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    deliveryType === 'delivery'
                      ? 'bg-gold-50 border-gold-500 text-gold-800 shadow-2xs'
                      : 'bg-white border-cream-300 text-chocolate-900/70 hover:bg-cream-50'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Karachi Home Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    deliveryType === 'pickup'
                      ? 'bg-gold-50 border-gold-500 text-gold-800 shadow-2xs'
                      : 'bg-white border-cream-300 text-chocolate-900/70 hover:bg-cream-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bakery Self-Pickup (Free)</span>
                </button>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Fatima"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Ahmed"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!whatsapp) setWhatsapp(e.target.value);
                    }}
                    placeholder="e.g. 0300-1234567"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Same as phone"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1">
                    Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1">
                    Delivery Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                  >
                    <option value="12:00 PM - 3:00 PM">12:00 PM &ndash; 3:00 PM</option>
                    <option value="3:00 PM - 6:00 PM">3:00 PM &ndash; 6:00 PM</option>
                    <option value="6:00 PM - 9:00 PM">6:00 PM &ndash; 9:00 PM</option>
                    <option value="9:00 PM - 11:00 PM">9:00 PM &ndash; 11:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Address Fields (if delivery selected) */}
              {deliveryType === 'delivery' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1">
                      Karachi Delivery Area <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                    >
                      {karachiAreas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1">
                      Full Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Flat #, Building name, Street #, Block"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                    />
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Special Delivery Instructions / Gate Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Ring the bell twice, call on arrival, deliver before 5 PM..."
                  className="w-full text-xs p-3 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Method Accordion */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-5 md:p-8 border border-cream-200 shadow-2xs space-y-5">
              <h2 className="font-serif font-bold text-base md:text-lg text-chocolate-900 pb-3 border-b border-cream-200">
                2. Your Sweet Order ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-cream-100 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.thumbnail_url}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-cream-200 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-semibold text-chocolate-900 line-clamp-1">
                          {item.product_name} &times; {item.quantity}
                        </h4>
                        <p className="text-[10px] text-chocolate-900/60">
                          {[item.selected_size, item.selected_flavor].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-chocolate-900">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="pt-3 border-t border-cream-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5 text-xs shadow-2xs">
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                        <span className="block text-[11px] text-green-700">
                          {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}% OFF (-Rs. ${discountAmount.toLocaleString()})`
                            : `-Rs. ${appliedCoupon.discount_value.toLocaleString()} Flat Discount`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-chocolate-900/40 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Coupon Code (e.g. SWEETWELCOME)"
                          className="w-full uppercase text-xs pl-8 pr-3 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2.5 bg-chocolate-900 hover:bg-chocolate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-600 pl-1">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-green-700 pl-1">{couponSuccess}</p>}
                  </div>
                )}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-1.5 text-xs text-chocolate-900/80 pt-3 border-t border-cream-200">
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
                  <span>Karachi Delivery</span>
                  <span>
                    {deliveryType === 'pickup' || deliveryFee === 0 ? (
                      <span className="text-green-700 font-bold uppercase">FREE</span>
                    ) : (
                      `Rs. ${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm md:text-base font-bold text-chocolate-900 pt-2 border-t border-cream-300">
                  <span>Final Total</span>
                  <span className="text-gold-700 font-serif">
                    Rs.{' '}
                    {(deliveryType === 'pickup'
                      ? subtotal - discountAmount
                      : netTotal
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Methods Accordion */}
              <div className="pt-2 border-t border-cream-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-chocolate-900">
                  Select Payment Method
                </h3>

                {/* COD Option */}
                {settings?.cod_enabled !== false && (
                  <label
                    className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-gold-500 bg-gold-50/60'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-gold-600 focus:ring-gold-500"
                      />
                      <span className="text-xs font-bold text-chocolate-900">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    {paymentMethod === 'cod' && (
                      <p className="text-[11px] text-chocolate-900/70 mt-1 pl-6">
                        Pay cash directly to our delivery rider when your fresh cake arrives.
                      </p>
                    )}
                  </label>
                )}

                {/* JazzCash Option */}
                {settings?.jazzcash_enabled !== false && (
                  <label
                    className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'jazzcash'
                        ? 'border-gold-500 bg-gold-50/60'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'jazzcash'}
                        onChange={() => setPaymentMethod('jazzcash')}
                        className="text-gold-600 focus:ring-gold-500"
                      />
                      <span className="text-xs font-bold text-chocolate-900">
                        JazzCash Mobile Account
                      </span>
                    </div>
                    {paymentMethod === 'jazzcash' && (
                      <div className="mt-2.5 pl-6 space-y-2 text-xs">
                        <div className="bg-cream-100 p-2.5 rounded-lg border border-cream-200 text-[11px]">
                          <p>
                            Account Title: <strong>{settings?.jazzcash_account_title || 'Sobia Khan'}</strong>
                          </p>
                          <p>
                            Account Number: <strong className="text-gold-700">{settings?.jazzcash_account_number || '03029257271'}</strong>
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-chocolate-900 mb-1">
                            Upload JazzCash Screenshot (Optional proof):
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofChange}
                            className="text-[11px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-gold-500 file:text-white hover:file:bg-gold-600"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                )}

                {/* EasyPaisa Option */}
                {settings?.easypaisa_enabled !== false && (
                  <label
                    className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'easypaisa'
                        ? 'border-gold-500 bg-gold-50/60'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'easypaisa'}
                        onChange={() => setPaymentMethod('easypaisa')}
                        className="text-gold-600 focus:ring-gold-500"
                      />
                      <span className="text-xs font-bold text-chocolate-900">
                        EasyPaisa Mobile Account
                      </span>
                    </div>
                    {paymentMethod === 'easypaisa' && (
                      <div className="mt-2.5 pl-6 space-y-2 text-xs">
                        <div className="bg-cream-100 p-2.5 rounded-lg border border-cream-200 text-[11px]">
                          <p>
                            Account Title: <strong>{settings?.easypaisa_account_title || 'Sobia Khan'}</strong>
                          </p>
                          <p>
                            Account Number: <strong className="text-gold-700">{settings?.easypaisa_account_number || '03029257271'}</strong>
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-chocolate-900 mb-1">
                            Upload EasyPaisa Screenshot (Optional proof):
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofChange}
                            className="text-[11px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-gold-500 file:text-white hover:file:bg-gold-600"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                )}

                {/* Bank Transfer Option */}
                {settings?.bank_enabled !== false && (
                  <label
                    className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-gold-500 bg-gold-50/60'
                        : 'border-cream-300 hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="text-gold-600 focus:ring-gold-500"
                      />
                      <span className="text-xs font-bold text-chocolate-900">
                        Direct Bank Transfer (IBAN)
                      </span>
                    </div>
                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-2.5 pl-6 space-y-2 text-xs">
                        <div className="bg-cream-100 p-2.5 rounded-lg border border-cream-200 text-[11px]">
                          <p>Bank: <strong>{settings?.bank_name || 'Meezan Bank Ltd'}</strong></p>
                          <p>Title: <strong>{settings?.bank_account_title || 'Cake House Bakery'}</strong></p>
                          <p>IBAN: <strong className="font-mono text-gold-700">{settings?.bank_iban || 'PK45MEZN0001234567890123'}</strong></p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-chocolate-900 mb-1">
                            Upload Bank Receipt Screenshot:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofChange}
                            className="text-[11px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-gold-500 file:text-white hover:file:bg-gold-600"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {/* Submit Order Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
