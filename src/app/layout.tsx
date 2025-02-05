import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next Shadcn',
  description: 'Basic dashboard with Next.js and Shadcn'
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
  return (
    <html lang='en' className={`${lato.className}`} suppressHydrationWarning>
      <body
        className={'overflow-hidden'}
        data-new-gr-c-s-check-loaded='14.1209.0'
        data-gr-ext-installed=''
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <Toaster />
          {children}
        </NuqsAdapter>
      </body>
    </html>
  );
}
