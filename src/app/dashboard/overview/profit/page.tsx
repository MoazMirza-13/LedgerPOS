import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { ProfitViewer } from '@/features/overview/profit-viewer';
import { createClient } from '@/utils/supabase/server';

export default async function page() {
  const invoices = await fetchListingData('invoices');
  const references = await fetchListingData('references');
  const products = await fetchListingData('products');

  // ---- fetch invoice items  ----
  const invoiceIds = invoices?.map((i: any) => i.id) || [];
  const supabase = await createClient();
  const { data: invoiceItems } = await supabase
    .from('invoice_items')
    .select('*')
    .in('invoice_id', invoiceIds);

  return (
    <main className='h-[calc(100dvh-52px)] overflow-y-auto bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='mt-2 text-muted-foreground'>
            Monitor and analyze profit data across invoices, filtered by date
            range and reference
          </p>
        </div>
        <ProfitViewer
          invoices={invoices || []}
          invoiceItems={invoiceItems || []}
          products={products || []}
          references={references || []}
        />
      </div>
    </main>
  );
}
