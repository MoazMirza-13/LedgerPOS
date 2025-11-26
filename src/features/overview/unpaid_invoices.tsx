import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSupabaseClient } from '@/lib/actions';
import { formatToPKTDate } from '@/utils/utils';
import { Invoice } from 'types';
import Link from 'next/link';

export async function UnpaidInvoices() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from('invoices').select('*');

  const invoices: Invoice[] = (data || []).filter(
    (inv) => inv.payment === false
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  return (
    <Card className='flex h-[70vh] flex-col'>
      <CardHeader>
        <CardTitle>Unpaid Invoices</CardTitle>
        <CardDescription>Invoices awaiting payment</CardDescription>
      </CardHeader>
      {!error && (
        <CardContent className='overflow-y-auto'>
          <div className='space-y-4'>
            {invoices.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>
                No unpaid invoices
              </div>
            ) : (
              invoices.map((invoice) => (
                <Link
                  href={`invoices/${invoice.id}`}
                  key={invoice.id}
                  className='flex items-start justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50'
                >
                  <div className='flex-1'>
                    <h3 className='font-semibold text-foreground'>
                      {invoice.customer_name}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      {formatToPKTDate(invoice.created_at || '')}
                    </p>
                  </div>
                  <div className='text-right'>
                    {invoice.reference && (
                      <Badge variant='outline' className='mb-2'>
                        <span className='text-gray-500'>Reference:</span>
                        <span className='ml-1'>{invoice.reference}</span>
                      </Badge>
                    )}
                    <p className='font-semibold text-foreground'>
                      {formatCurrency(invoice.total_price)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
