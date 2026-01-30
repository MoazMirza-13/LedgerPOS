import SuperUserDashboard from '@/features/superUser/superUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NS | Super User',
  description: 'Admin panel for NS.'
};

export default async function Page() {
  return <SuperUserDashboard />;
}
