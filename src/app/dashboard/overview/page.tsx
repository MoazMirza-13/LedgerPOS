import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function page() {
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
                Monitor product stock levels and your profit reports below
              </p>
            </div>

            <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4'>
              <Link href={`/dashboard/overview/low-stock-products`}>
                <Button>View Low Stock Products</Button>
              </Link>
              <Link href={`/dashboard/overview/profit`}>
                <Button>View Profit</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </PageContainer>
  );
}
