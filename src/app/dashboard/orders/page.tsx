// orders page is diff and separate than other pages
import PageContainer from '@/components/layout/page-container';
import OrdersPage from '@/features/orders/orders-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard: Orders',
  description: 'Admin panel for NS.'
};

const ACTIVE_ORDER_STATUSES = ['pending', 'processing'];

export default async function Page() {
  return (
    <PageContainer>
      <OrdersPage
        title='Orders'
        description='Manage orders'
        statuses={ACTIVE_ORDER_STATUSES}
        showTenantSettings={true}
        emptyMessage='You Have No New Orders'
        showStatusColumn={true}
        showMessageColumn={true}
      />
    </PageContainer>
  );
}
