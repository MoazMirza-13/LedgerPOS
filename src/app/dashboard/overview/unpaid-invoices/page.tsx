import PageContainer from '@/components/layout/page-container';
import { UnpaidInvoices } from '@/features/overview/unpaid_invoices';

export default async function Page() {
  return (
    <PageContainer scrollable>
      <div className='w-full'>
        <main className='min-h-screen bg-background'>
          <div className='space-y-8'>
            <div>
              <h1 className='mb-2 text-3xl font-bold text-foreground'>
                Dashboard
              </h1>
              <p className='text-muted-foreground'>Monitor unpaid invoices</p>
            </div>

            <div className='mx-auto grid grid-cols-1 gap-8 lg:grid-cols-1'>
              <UnpaidInvoices />
            </div>
          </div>
        </main>
      </div>
    </PageContainer>
  );
}
