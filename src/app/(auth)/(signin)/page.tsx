import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title: 'NS | Sign in',
  description: 'Admin panel for NS.'
};

export default async function Page() {
  return <SignInViewPage />;
}
