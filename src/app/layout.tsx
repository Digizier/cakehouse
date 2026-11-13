import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ClientLayoutWrapper } from '@/components/ClientLayoutWrapper';

export const viewport: Viewport = {
  themeColor: '#C58A24',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Cake House | Homemade & Customized Celebration Cakes Karachi',
  description:
    'Fresh homemade cakes baked with love by Sobia in Landhi, Karachi. Order custom birthday cakes, Belgian chocolate fudge, wedding cakes, bento boxes, and brownies. Karachi chilled delivery & WhatsApp ordering.',
  keywords: [
    'Cake House Karachi',
    'Customized cakes Karachi',
    'Birthday cake delivery Karachi',
    'Chocolate fudge cake Karachi',
    'Landhi cake shop',
    'Bakeaway alternative Karachi',
    'Wedding cakes Karachi',
    'Eggless cakes Karachi',
    'Homemade bakery Karachi',
  ],
  authors: [{ name: 'Cake House by Sobia' }],
  metadataBase: new URL('https://cakehouse.shop'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Cake House | Every Bite, A Little Happiness',
    description:
      'Artisanal homemade celebration cakes delivered chilled across Karachi. Custom birthday designs, Belgian fudge, and wedding tiers.',
    url: 'https://cakehouse.shop',
    siteName: 'Cake House',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Cake House Golden Logo',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Cake House',
    image: 'https://cakehouse.shop/logo.png',
    '@id': 'https://cakehouse.shop',
    url: 'https://cakehouse.shop',
    telephone: '+923029257271',
    priceRange: 'PKR 1500 - 15000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'House A-200, Sector 36/B, Zamanabad, Landhi #4',
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      postalCode: '75160',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.8488,
      longitude: 67.2023,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '10:00',
      closes: '23:00',
    },
    servesCuisine: 'Bakery, Homemade Desserts, Custom Cakes',
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-gold-200 selection:text-chocolate-900">
        <CartProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
