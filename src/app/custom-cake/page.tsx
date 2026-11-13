'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Upload,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Cake,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createCustomCakeBooking } from '@/lib/db';
import { uploadImageAndGetUrl } from '@/lib/imageCompression';
import { useCart } from '@/context/CartContext';

export default function CustomCakePage() {
  const { settings } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_whatsapp: '',
    delivery_address: '',
    area: 'Gulshan-e-Iqbal',
    city: 'Karachi',
    event_date: '',
    pickup_time: '2:00 PM',
    size_lbs: '2.5 lbs',
    tiers: '1 Tier',
    cake_base: 'Fondant & Cream',
    flavor: 'Chocolate Fudge',
    custom_message: '',
    notes: '',
  });

  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReferenceFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !formData.customer_name ||
      !formData.customer_phone ||
      !formData.event_date ||
      !formData.delivery_address
    ) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      let referenceImageUrl: string | null = null;

      // Upload reference image if attached (auto-compresses to WebP)
      if (referenceFile) {
        const uploadRes = await uploadImageAndGetUrl(
          referenceFile,
          'cake-images',
          'custom_cake_references'
        );
        referenceImageUrl = uploadRes.url;
      }

      const booking = await createCustomCakeBooking({
        ...formData,
        reference_image_url: referenceImageUrl,
      });

      setSubmittedBooking(booking);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (submittedBooking) {
    const whatsappText = `Hello Cake House, I have submitted a custom cake request (Reference: *${submittedBooking.booking_reference}*).
Name: ${submittedBooking.customer_name}
Date: ${submittedBooking.event_date} (${submittedBooking.pickup_time})
Size: ${submittedBooking.size_lbs} (${submittedBooking.tiers})
Flavor: ${submittedBooking.flavor}
Base: ${submittedBooking.cake_base}
Address: ${submittedBooking.delivery_address}, ${submittedBooking.area}`;

    const whatsappUrl = `https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}?text=${encodeURIComponent(whatsappText)}`;

    return (
      <main className="min-h-screen bg-cream-50/50 py-12 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-gold-300 shadow-xl text-center space-y-5 animate-scaleIn">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 bg-gold-100 px-3 py-1 rounded-full">
              Booking Received
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-chocolate-900 mt-2">
              Thank You, {submittedBooking.customer_name}!
            </h1>
            <p className="text-xs text-chocolate-900/60 mt-1">
              Your custom celebration cake request has been submitted to Sobia at Cake House.
            </p>
          </div>

          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 text-left space-y-2 text-xs text-chocolate-900">
            <div className="flex justify-between border-b border-cream-200 pb-2">
              <span className="text-chocolate-900/60">Booking Reference:</span>
              <strong className="text-gold-700 font-mono text-sm">
                {submittedBooking.booking_reference}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-chocolate-900/60">Event Date:</span>
              <span>{submittedBooking.event_date} ({submittedBooking.pickup_time})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chocolate-900/60">Flavour & Weight:</span>
              <span>{submittedBooking.flavor} &bull; {submittedBooking.size_lbs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chocolate-900/60">Delivery Area:</span>
              <span>{submittedBooking.area}, Karachi</span>
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
              <span>Confirm & Discuss Price on WhatsApp</span>
            </a>

            <Link
              href="/"
              className="inline-block text-xs font-semibold text-chocolate-900/60 hover:text-chocolate-900 underline pt-2"
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
      {/* Banner */}
      <div className="bg-chocolate-900 text-cream-100 py-8 md:py-12 px-4 border-b border-gold-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Custom Celebration Cakes
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            Your Cake, Your Way
          </h1>
          <p className="text-xs md:text-sm text-cream-200/80 max-w-lg mx-auto">
            Design your bespoke cake for birthdays, weddings, bridal showers, or corporate events.
            Share your vision and we will bake your dream into reality.
          </p>
        </div>
      </div>

      {/* Main Request Form Container */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 md:p-10 border border-cream-200 shadow-sm space-y-6"
        >
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Contact Details */}
          <div>
            <h3 className="font-serif font-bold text-sm md:text-base text-chocolate-900 pb-2 border-b border-cream-200 mb-4">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Phone / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer_phone: e.target.value,
                      customer_whatsapp: e.target.value,
                    })
                  }
                  placeholder="e.g. 0300-1234567"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Event Date, Time & Karachi Location */}
          <div>
            <h3 className="font-serif font-bold text-sm md:text-base text-chocolate-900 pb-2 border-b border-cream-200 mb-4">
              2. Delivery Date & Karachi Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Event / Required Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Preferred Delivery Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.pickup_time}
                  onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                >
                  <option value="12:00 PM - 2:00 PM">12:00 PM &ndash; 2:00 PM</option>
                  <option value="2:00 PM - 5:00 PM">2:00 PM &ndash; 5:00 PM</option>
                  <option value="5:00 PM - 8:00 PM">5:00 PM &ndash; 8:00 PM</option>
                  <option value="8:00 PM - 10:00 PM">8:00 PM &ndash; 10:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Karachi Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                >
                  {karachiAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
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
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="House / Apartment #, Street, Block"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cake Specifications */}
          <div>
            <h3 className="font-serif font-bold text-sm md:text-base text-chocolate-900 pb-2 border-b border-cream-200 mb-4">
              3. Cake Flavors & Sizing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Estimated Weight (lbs) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.size_lbs}
                  onChange={(e) => setFormData({ ...formData, size_lbs: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                >
                  <option value="1.5 lbs">1.5 lbs (6-8 persons)</option>
                  <option value="2.5 lbs">2.5 lbs (10-14 persons)</option>
                  <option value="3.5 lbs">3.5 lbs (15-20 persons)</option>
                  <option value="4.5 lbs">4.5 lbs (20-25 persons)</option>
                  <option value="6+ lbs (Grand)">6+ lbs Grand Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Tiers Configuration
                </label>
                <select
                  value={formData.tiers}
                  onChange={(e) => setFormData({ ...formData, tiers: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                >
                  <option value="1 Tier">1 Tier (Standard)</option>
                  <option value="2 Tiers">2 Tiers (Grand)</option>
                  <option value="3 Tiers">3 Tiers (Wedding/Royalty)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Flavor Selection <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.flavor}
                  onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                >
                  <option value="Chocolate Fudge">Belgian Chocolate Fudge</option>
                  <option value="Nutella Belgian">Nutella Hazelnut Ganache</option>
                  <option value="Red Velvet">Red Velvet Cream Cheese</option>
                  <option value="Lotus Biscoff">Lotus Biscoff Crunch</option>
                  <option value="Swiss Vanilla Caramel">Swiss Vanilla Salted Caramel</option>
                  <option value="Pineapple Fresh Cream">Fresh Pineapple Dairy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Cake Base / Finish
                </label>
                <select
                  value={formData.cake_base}
                  onChange={(e) => setFormData({ ...formData, cake_base: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                >
                  <option value="Fondant & Cream">Fondant & Cream (Custom 3D Art)</option>
                  <option value="Smooth Buttercream">Vintage Lambeth Buttercream</option>
                  <option value="Fresh Whipped Cream">Light Fresh Whipped Cream</option>
                  <option value="Semi-Naked Floral">Semi-Naked Rustic Floral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Message on Cake (Optional)
                </label>
                <input
                  type="text"
                  value={formData.custom_message}
                  onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                  placeholder="e.g. Happy 1st Birthday Ayaan!"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Reference Image Upload (Auto WebP Compressed in KB) */}
          <div>
            <h3 className="font-serif font-bold text-sm md:text-base text-chocolate-900 pb-2 border-b border-cream-200 mb-2">
              4. Upload Design Reference Photo
            </h3>
            <p className="text-[11px] text-chocolate-900/60 mb-3">
              Attach a photo from Pinterest, Instagram, or your phone gallery. Our system automatically compresses it in high quality.
            </p>

            <label className="border-2 border-dashed border-gold-300 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-cream-50 transition-colors">
              {filePreview ? (
                <div className="text-center space-y-2">
                  <img
                    src={filePreview}
                    alt="Uploaded Reference Preview"
                    className="w-28 h-28 object-cover rounded-xl border border-gold-400 mx-auto"
                  />
                  <p className="text-xs font-bold text-gold-700">Change Photo</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-gold-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-chocolate-900">
                      Click to upload design image
                    </span>
                    <p className="text-[10px] text-chocolate-900/50 mt-0.5">
                      JPG, PNG, WebP supported
                    </p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-chocolate-900 mb-1">
              Any Special Instructions or Dietary Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Please make it eggless, add golden butterfly toppers, or soft pastel colors..."
              className="w-full text-xs p-3 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Submitting Custom Order...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Custom Cake Request</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-chocolate-900/50 mt-2">
              Our master baker will review your request and confirm the pricing via WhatsApp within 30 minutes.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
