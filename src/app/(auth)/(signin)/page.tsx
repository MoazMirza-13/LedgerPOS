import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title: 'LedgerPOS | Sign in',
  description: 'Admin panel for LedgerPOS.'
};

export default async function Page() {
  return <SignInViewPage />;
}
