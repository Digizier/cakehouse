import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function DeliveryPolicyPage() {
  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      <div className="bg-chocolate-900 text-cream-100 py-8 md:py-12 px-4 border-b border-gold-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Shipping Information
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            Karachi Delivery Policy
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-cream-200 shadow-2xs space-y-6 text-xs md:text-sm text-chocolate-900/80 leading-relaxed">
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-base md:text-lg text-chocolate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold-600" />
              <span>1. Delivery Coverage in Karachi</span>
            </h2>
            <p>
              Cake House delivers across all major residential and commercial sectors in Karachi, including DHA (Phases 1-8), Clifton, Gulshan-e-Iqbal, Gulistan-e-Jauhar, PECHS, Landhi, Korangi, Malir Cantt, North Nazimabad, Federal B Area, and Bahria Town Karachi.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-base md:text-lg text-chocolate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-600" />
              <span>2. Delivery Slots & Scheduling</span>
            </h2>
            <p>
              Because our cakes are fresh-baked without preservatives, orders must be scheduled at least 4 to 24 hours in advance. For elaborate customized fondant or tiered cakes, we recommend placing orders 2 to 3 days ahead.
            </p>
            <p>
              We provide fixed delivery time slots (e.g. 12:00 PM - 3:00 PM, 3:00 PM - 6:00 PM, 6:00 PM - 9:00 PM) so your cake arrives fresh right before your party or dinner celebration.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-base md:text-lg text-chocolate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-600" />
              <span>3. Temperature-Safe Chilled Transit</span>
            </h2>
            <p>
              Karachi heat can be unforgiving on delicate buttercream and whipped cream. Our riders carry custom insulated, leveled transport cake boxes ensuring that tiers, toppers, and frostings arrive upright, intact, and chilled.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-base md:text-lg text-chocolate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-600" />
              <span>4. Free Self-Pickup Option</span>
            </h2>
            <p>
              Customers are always welcome to pick up their cakes free of delivery charge directly from our kitchen in Zamanabad, Landhi #4, Karachi. Please coordinate your arrival time with us via WhatsApp beforehand.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
