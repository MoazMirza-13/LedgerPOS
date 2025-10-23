import { LowStockProducts } from '@/components/dashboard/low-stock-products';
import { UnpaidInvoices } from '@/components/dashboard/unpaid_invoices';
import PageContainer from '@/components/layout/page-container';

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='w-full'>
        <main className='min-h-screen bg-background'>
          <div className='max-w-7xl space-y-8'>
            <div>
              <h1 className='mb-2 text-3xl font-bold text-foreground'>
                Dashboard
              </h1>
              <p className='text-muted-foreground'>
                Monitor low-stock products and unpaid invoices
              </p>
            </div>

            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
              <LowStockProducts />
              <UnpaidInvoices />
            </div>
          </div>
        </main>
      </div>
    </PageContainer>
  );
}
