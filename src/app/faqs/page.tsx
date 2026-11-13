'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const FAQS_DATA = [
  {
    q: 'How many days in advance should I order a custom cake?',
    a: 'For standard celebration cakes (fudge, bento, simple birthday designs), 4 to 24 hours is sufficient. For multi-tier fondant, wedding cakes, or sculpted theme cakes, please place your order 2 to 4 days ahead so we can hand-craft and dry all decorative elements.',
  },
  {
    q: 'Do you offer eggless cakes in Karachi?',
    a: 'Yes! All of our popular chocolate fudge, vanilla caramel, and red velvet cakes can be specially baked 100% eggless upon request. Simply select the option or note it in the special instructions box.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD), JazzCash, EasyPaisa, and Direct Bank Transfer (Meezan Bank). For customized fondant orders above Rs. 5,000, a 50% advance deposit via JazzCash or Bank is appreciated.',
  },
  {
    q: 'How should I store and serve my cake?',
    a: 'Keep whipped cream and cheesecake refrigerated until 30 minutes before serving. Buttercream and fondant cakes are best enjoyed at cool room temperature so the sponge remains soft and the buttercream melts naturally on your tongue.',
  },
  {
    q: 'Can I send a custom Pinterest or Instagram cake design photo?',
    a: 'Absolutely! Our "Your Cake Your Way" page allows you to upload any reference photo. Head baker Sobia will replicate the design colors, toppers, and aesthetic to match your vision.',
  },
];

export default function FaqsPage() {
  const { settings } = useCart();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <main className="min-h-screen bg-cream-50/50 pb-20">
      <div className="bg-chocolate-900 text-cream-100 py-8 md:py-12 px-4 border-b border-gold-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Helpful Answers
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-cream-50">
            Frequently Asked Questions
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="space-y-3">
          {FAQS_DATA.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-cream-200 shadow-2xs overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 font-serif font-bold text-xs md:text-sm text-chocolate-900 hover:text-gold-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gold-600 transition-transform duration-200 flex-shrink-0 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-4 pb-4 md:px-5 md:pb-5 text-xs text-chocolate-900/70 leading-relaxed border-t border-cream-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* WhatsApp Help CTA */}
        <div className="mt-10 p-6 bg-cream-100 rounded-3xl border border-gold-200 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-gold-600 mx-auto" />
          <h3 className="font-serif font-bold text-base text-chocolate-900">
            Have a question not listed here?
          </h3>
          <p className="text-xs text-chocolate-900/60 max-w-sm mx-auto">
            Chef Sobia is always available to discuss flavors, sizes, or custom decoration questions directly on WhatsApp.
          </p>
          <a
            href={`https://wa.me/92${settings?.whatsapp?.replace(/[^0-9]/g, '').slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chat with Sobia on WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  );
}
