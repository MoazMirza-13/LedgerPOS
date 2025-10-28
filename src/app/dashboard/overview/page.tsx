import { LowStockProducts } from '@/features/overview/low-stock-products';
import { UnpaidInvoices } from '@/features/overview/unpaid_invoices';
import PageContainer from '@/components/layout/page-container';

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='w-full'>
        <main className='min-h-screen bg-background'>
          <div className='space-y-8'>
            <div>
              <h1 className='mb-2 text-3xl font-bold text-foreground'>
                Dashboard
              </h1>
              <p className='text-muted-foreground'>
                Monitor low-stock products and unpaid invoices
              </p>
            </div>

            <div className='mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2'>
              <LowStockProducts />
              <UnpaidInvoices />
            </div>
          </div>
        </main>
      </div>
    </PageContainer>
  );
}
