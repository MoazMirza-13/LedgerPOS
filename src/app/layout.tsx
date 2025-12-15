import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import Providers from '@/components/layout/providers';

export const metadata: Metadata = {
  title: 'LedgerPOS | Admin Panel',
  description: 'Admin panel for LedgerPOS.'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  console.log('m');
  return (
    <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
      <body className={'overflow-hidden'} suppressHydrationWarning>
        <NextTopLoader showSpinner={false} color='#808080' />
        <NuqsAdapter>
          <Providers>
            <Toaster position='top-center' expand={true} />
            {children}
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
