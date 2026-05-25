import './globals.css';
import { CartProvider } from '@/components/CartContext';
import { ServiceStatusProvider, ServiceClosedBanner } from '@/components/ServiceStatus';
import WelcomeModal from '@/components/WelcomeModal';

export const metadata = {
  title: 'Jasa Order Kopi Kenangan by Iqbal',
  description: 'Jasa Order Kopi Kenangan by Iqbal — pesan kopi favoritmu dengan diskon 50% (maks Rp 35.000) lewat WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen">
        <ServiceStatusProvider>
          <CartProvider>
            <ServiceClosedBanner>
              {children}
              <WelcomeModal />
            </ServiceClosedBanner>
          </CartProvider>
        </ServiceStatusProvider>
      </body>
    </html>
  );
}
