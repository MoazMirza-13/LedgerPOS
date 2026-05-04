import PageContainer from '@/components/layout/page-container';
import OrdersPage from '@/features/orders/orders-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard: Orders History',
  description: 'Admin panel for NS.'
};

const HISTORY_ORDER_STATUSES = ['confirmed', 'delivered'];

export default async function Page() {
  return (
    <PageContainer>
      <OrdersPage
        title='Orders History'
        description='View confirmed and delivered orders'
        statuses={HISTORY_ORDER_STATUSES}
        showTenantSettings={false}
        emptyMessage='No order history found'
        showStatusColumn={false}
        showMessageColumn={false}
      />
    </PageContainer>
  );
}
