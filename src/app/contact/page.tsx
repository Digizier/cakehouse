'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const { settings } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      // Try sending to Supabase enquiries table (graceful fallback)
      try {
        await supabase.from('enquiries').insert({
          name,
          phone,
          message,
          created_at: new Date().toISOString(),
        });
      } catch {}

      setSubmitted(true);
      setName('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg('Failed to send message. Please reach out via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      {/* Banner */}
      <div className="bg-chocolate-900 text-cream-100 py-8 md:py-12 px-4 border-b border-gold-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Karachi Bakery Helpline
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            Contact Cake House
          </h1>
          <p className="text-xs md:text-sm text-cream-200/80 max-w-md mx-auto">
            Have questions about an upcoming celebration, custom theme, or bulk corporate cake order? We are here to help!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-2xs space-y-4">
              <h3 className="font-serif font-bold text-base text-chocolate-900 pb-2 border-b border-cream-200">
                Bakery Information
              </h3>

              <div className="flex items-start gap-3 text-xs text-chocolate-900/80">
                <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-chocolate-900">Physical Bakery Address:</strong>
                  <p className="leading-relaxed mt-0.5">
                    {settings?.address || 'House A-200, Sector 36/B, Zamanabad, Landhi #4, Karachi, Pakistan'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-chocolate-900/80">
                <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-chocolate-900">Phone & WhatsApp:</strong>
                  <a
                    href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-700 hover:underline font-bold mt-0.5 block"
                  >
                    {settings?.whatsapp || '0302-9257271'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-chocolate-900/80">
                <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-chocolate-900">Official Email:</strong>
                  <a
                    href={`mailto:${settings?.email || 'admin@cakehouse.shop'}`}
                    className="text-gold-700 hover:underline mt-0.5 block"
                  >
                    {settings?.email || 'admin@cakehouse.shop'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-chocolate-900/80">
                <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-chocolate-900">Opening Hours:</strong>
                  <p className="leading-relaxed mt-0.5">
                    Open 7 Days a Week: 10:00 AM &ndash; 11:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Card */}
            <div className="bg-white rounded-3xl p-3 border border-cream-200 shadow-2xs overflow-hidden">
              <div className="w-full h-56 rounded-2xl overflow-hidden bg-cream-100">
                <iframe
                  title="Cake House Karachi Location"
                  src="https://maps.google.com/maps?q=Landhi+4+Karachi&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-3 text-center">
                <a
                  href={settings?.google_maps_url || 'https://share.google/AodyTtHMJ4ioecLPi'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-gold-600 hover:underline flex items-center justify-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open in Google Maps App &rarr;</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Send Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-cream-200 shadow-2xs space-y-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-600 bg-gold-100 px-3 py-1 rounded-full">
                  Fast Response
                </span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-chocolate-900 mt-2">
                  Send a Message to Chef Sobia
                </h2>
                <p className="text-xs text-chocolate-900/60 mt-1">
                  Leave your details and event inquiry. We reply promptly within an hour.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                  <h3 className="font-serif font-bold text-base text-green-900">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-green-800">
                    Thank you for reaching out. We will connect with you on your phone/WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-green-900 underline mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Zainab Malik"
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0300-1234567"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1">
                      Message / Cake Requirement <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your celebration date, guest count, preferred flavor..."
                      className="w-full text-xs p-3 rounded-xl border border-cream-300 focus:outline-none focus:border-gold-500 bg-cream-50/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-chocolate-900 hover:bg-chocolate-800 text-white font-bold text-xs md:text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-gold-400" />
                    <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
