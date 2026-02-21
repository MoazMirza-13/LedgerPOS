import { ProfitViewer } from '@/features/overview/profit-viewer';
import { createClient } from '@/utils/supabase/server';
import { Invoice_items } from 'types';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const normalize = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function page(props: PageProps) {
  const searchParams = await props.searchParams;
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Karachi'
  });
  const last7 = new Date(
    Date.now() - 6 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
  const from = normalize(searchParams.from) || last7;
  const to = normalize(searchParams.to) || today;
  const reference = normalize(searchParams.reference) || 'all';

  const supabase = await createClient();
  let invoicesQuery = supabase
    .from('invoices')
    .select(
      'id, customer_name, created_at, reference, invoice_number, references(name)'
    )
    .gte('created_at', `${from}T00:00:00+05:00`)
    .lte('created_at', `${to}T23:59:59.999+05:00`)
    .order('created_at', { ascending: false });

  if (reference !== 'all') {
    invoicesQuery = invoicesQuery.eq('reference', reference);
  }

  const { data: invoices } = await invoicesQuery;
  const invoiceIds = invoices?.map((i: { id: string }) => i.id) || [];

  const invoiceItems: Invoice_items[] = invoiceIds.length
    ? (
        await supabase
          .from('invoice_items')
          .select('invoice_id, product_id, product_code, quantity, price')
          .in('invoice_id', invoiceIds)
      ).data || []
    : [];

  const productIds = Array.from(
    new Set(invoiceItems.map((item) => item.product_id).filter(Boolean))
  ) as string[];

  const products = productIds.length
    ? (
        await supabase
          .from('products')
          .select('id, product_code, cost_price')
          .in('id', productIds)
      ).data || []
    : [];

  const { data: references } = await supabase
    .from('references')
    .select('id, name')
    .order('name', { ascending: true });

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
          invoiceItems={invoiceItems}
          products={products || []}
          references={references || []}
          from={from}
          to={to}
          selectedReference={reference}
        />
      </div>
    </main>
  );
}
