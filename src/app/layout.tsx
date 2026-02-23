import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider } from '@/firebase';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'Bharat Carbon Exchange (BCX)',
  description: 'A transparent platform for trading and tracking carbon credits in India.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FirebaseClientProvider>
            <CartProvider>
              <AppShell>{children}</AppShell>
              <CartDrawer />
            </CartProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
