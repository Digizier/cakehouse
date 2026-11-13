'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Phone,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { getOrders, getOrderByIdOrNumber } from '@/lib/db';
import { useCart } from '@/context/CartContext';

export default function TrackOrderPage() {
  const { settings } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check URL query parameters if navigated directly from checkout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const orderIdParam = urlParams.get('orderId');
      if (orderIdParam) {
        setSearchTerm(orderIdParam);
        handleLookup(orderIdParam);
      }
    }
  }, []);

  const handleLookup = async (lookupTerm?: string) => {
    const term = (lookupTerm || searchTerm).trim();
    if (!term) return;

    setLoading(true);
    setHasSearched(true);
    setErrorMsg('');

    try {
      const cleanTerm = term.replace(/^#/, '');
      const found = await getOrderByIdOrNumber(cleanTerm);

      if (found) {
        setOrder(found);
      } else {
        // Fallback: check phone number match across all orders
        const allOrders = await getOrders();
        const byPhone = allOrders.find(
          (o) =>
            o.customer_phone.replace(/[^0-9]/g, '') ===
            term.replace(/[^0-9]/g, '')
        );
        if (byPhone) {
          setOrder(byPhone);
        } else {
          setOrder(null);
          setErrorMsg('No order found matching this Order Number or Phone Number.');
        }
      }
    } catch (err: any) {
      setErrorMsg('Failed to look up order. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'processing':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const steps = [
    { title: 'Received', desc: 'Order Placed', icon: Clock },
    { title: 'Confirmed', desc: 'Bakery Verified', icon: FileText },
    { title: 'Baking', desc: 'Fresh in Oven', icon: Package },
    { title: 'Out for Delivery', desc: 'With Chilled Rider', icon: Truck },
    { title: 'Delivered', desc: 'Celebration Ready', icon: CheckCircle2 },
  ];

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      {/* Header Banner */}
      <div className="bg-chocolate-900 text-cream-100 py-8 md:py-12 px-4 border-b border-gold-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Live Order Status
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            Track Your Cake Order
          </h1>
          <p className="text-xs md:text-sm text-cream-200/80 max-w-md mx-auto">
            Enter your Cake House Order ID (e.g. CH-8392) or Mobile Number to check real-time baking and delivery updates.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Search Lookup Card */}
        <div className="bg-white rounded-3xl p-5 md:p-8 border border-cream-200 shadow-sm mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gold-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Order ID (e.g. CH-4821) or 0300-1234567..."
                className="w-full text-xs md:text-sm pl-11 pr-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-chocolate-900 hover:bg-chocolate-800 text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Checking...</span>
              ) : (
                <>
                  <Search className="w-4 h-4 text-gold-400" />
                  <span>Track Status</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Order Details & Progress Timeline */}
        {order && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm space-y-8 animate-fadeIn">
            {/* Top Order Badge Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-600 bg-gold-100 px-2.5 py-0.5 rounded-full">
                  Order Details
                </span>
                <h2 className="text-xl font-serif font-bold text-chocolate-900 mt-1">
                  Order #{order.order_number}
                </h2>
                <p className="text-xs text-chocolate-900/60">
                  Customer: <strong>{order.customer_name}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-gold-100 text-gold-800 border border-gold-300'
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
                <p className="text-[11px] text-chocolate-900/50 mt-1">
                  Placed on {new Date(order.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Visual Step Timeline */}
            {order.status !== 'cancelled' ? (
              <div className="py-2">
                <div className="grid grid-cols-5 gap-2 relative">
                  {steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = currentStep >= stepNum;
                    const isCurrent = currentStep === stepNum;
                    const Icon = step.icon;

                    return (
                      <div key={step.title} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all shadow-2xs ${
                            isCompleted
                              ? 'bg-gold-500 text-white border-2 border-gold-600'
                              : 'bg-cream-100 text-chocolate-900/40 border border-cream-300'
                          } ${isCurrent ? 'ring-4 ring-gold-200 scale-105' : ''}`}
                        >
                          <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <h4
                          className={`text-[11px] md:text-xs font-bold mt-2 ${
                            isCompleted ? 'text-chocolate-900' : 'text-chocolate-900/40'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-[9px] md:text-[10px] text-chocolate-900/50 hidden sm:block">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-700">
                This order was cancelled. If you have questions, please reach out via WhatsApp.
              </div>
            )}

            {/* Delivery & Schedule Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream-50/60 p-4 rounded-2xl border border-cream-200 text-xs">
              <div className="space-y-1.5">
                <p className="font-bold text-chocolate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-600" />
                  <span>Scheduled Delivery Date:</span>
                </p>
                <p className="text-chocolate-900/80 font-medium pl-5">
                  {order.delivery_date} &bull; {order.delivery_time_slot}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-chocolate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-600" />
                  <span>Destination (Karachi):</span>
                </p>
                <p className="text-chocolate-900/80 font-medium pl-5">
                  {order.address}, {order.area}
                </p>
              </div>
            </div>

            {/* Ordered Items Summary */}
            <div>
              <h3 className="font-serif font-bold text-sm text-chocolate-900 mb-3">
                Items in this Order
              </h3>
              <div className="divide-y divide-cream-100 border border-cream-200 rounded-2xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <h4 className="font-bold text-chocolate-900">{item.product_name}</h4>
                      <p className="text-[11px] text-chocolate-900/60">
                        Qty: {item.quantity} &bull; {item.selected_size} &bull; {item.selected_flavor}
                      </p>
                      {item.custom_message && (
                        <p className="text-[11px] text-gold-700 italic">
                          Message: &ldquo;{item.custom_message}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-chocolate-900">
                      Rs. {item.total_price.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="p-3.5 bg-cream-50 flex items-center justify-between text-xs font-bold border-t border-cream-200">
                  <span>Grand Total:</span>
                  <span className="text-sm font-serif text-gold-700">
                    Rs. {order.net_total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Helpline Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}?text=Hello%20Cake%20House,%20I%20am%20inquiring%20about%20Order%20*#${order.order_number}*.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Need Instant Help? Contact Bakery on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
