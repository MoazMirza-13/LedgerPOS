// orders page is diff and separate than other pages
import OrdersPage from '@/features/orders/orders-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard: Orders',
  description: 'Admin panel for NS.'
};

export default async function Page() {
  return <OrdersPage />;
}
