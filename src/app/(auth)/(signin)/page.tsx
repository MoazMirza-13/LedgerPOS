import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title: 'Kashmir Tiles | Sign in',
  description: 'Admin panel for Kashmir Tiles.'
};

export default async function Page() {
  return <SignInViewPage />;
}
