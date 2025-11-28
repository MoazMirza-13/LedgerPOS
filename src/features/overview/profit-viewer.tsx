'use client';

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Invoice, Invoice_items, Product, ProfitData } from 'types';
import { DateRangePicker } from '@/components/ui/date-range-picker-mini';
import { filterWithDate, formatToPKTDate } from '@/utils/utils';

interface ProfitViewerProps {
  invoices: Invoice[];
  invoiceItems: Invoice_items[];
  products: Product[];
}

export function ProfitViewer({
  invoices,
  invoiceItems,
  products
}: ProfitViewerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  // Calculate profit data based on filters
  const profitData = React.useMemo(() => {
    // Filter invoices by date range
    const filteredInvoices = invoices.filter((invoice) => {
      // Date filtering using your util
      const dateMatch =
        !dateRange?.from ||
        filterWithDate(
          [invoice],
          dateRange.from,
          dateRange.to ?? dateRange.from
        ).length > 0;

      return dateMatch && invoice.payment === true;
    });

    // Calculate profit for each invoice
    const profitResults: ProfitData[] = filteredInvoices.map((invoice) => {
      // Get all items for this invoice
      const items = invoiceItems.filter(
        (item) => item.invoice_id === invoice.id
      );

      // Calculate profit for each item
      const itemsWithProfit = items.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        const quantity = item.quantity ?? 0;
        const sellingPrice = item.price ?? 0;
        const costPrice = product?.cost_price ?? 0;

        return {
          productCode: product?.product_code || item.product_code || '',
          quantity,
          sellingPrice,
          costPrice,
          profit: (sellingPrice - costPrice) * quantity
        };
      });

      const totalProfit = itemsWithProfit.reduce(
        (sum, item) => sum + item.profit,
        0
      );

      return {
        invoiceId: invoice.id ?? '',
        invoiceNumber: invoice.invoice_number ?? 0,
        customerName: invoice.customer_name,
        date: invoice.created_at,
        items: itemsWithProfit,
        totalProfit
      };
    });

    return profitResults;
  }, [invoices, invoiceItems, products, dateRange]);

  // Calculate overall totals
  const overallProfit = profitData.reduce(
    (sum, invoice) => sum + invoice.totalProfit,
    0
  );
  const totalInvoices = profitData.length;

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter profit data by date range</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Date Range</label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              PKR {overallProfit.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              Across {totalInvoices} invoice{totalInvoices !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Profit per Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              PKR{' '}
              {totalInvoices > 0
                ? (overallProfit / totalInvoices).toLocaleString(undefined, {
                    maximumFractionDigits: 0
                  })
                : 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              Based on filtered results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Breakdown</CardTitle>
          <CardDescription>
            Detailed profit information for each invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profitData.length === 0 ? (
            <div className='flex items-center justify-center py-8 text-muted-foreground'>
              No invoices found for the selected filters
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className='text-right'>Items</TableHead>
                    <TableHead className='text-right'>Total Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitData.map((invoice) => (
                    <React.Fragment key={invoice.invoiceId}>
                      <TableRow>
                        <TableCell className='font-medium'>
                          #{invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatToPKTDate(invoice.date)}</TableCell>
                        <TableCell className='text-right'>
                          {invoice.items.length}
                        </TableCell>
                        <TableCell className='text-right font-semibold'>
                          PKR {invoice.totalProfit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      {/* Item details */}
                      {invoice.items.map((item, id) => (
                        <TableRow
                          key={`${invoice.invoiceId}-${id}`}
                          className='bg-muted/50'
                        >
                          <TableCell className='pl-8' colSpan={2}>
                            <span className='text-sm text-muted-foreground'>
                              Product: {item.productCode}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            Qty: {item.quantity}
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            Cost: PKR {item.costPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className='text-right text-sm text-muted-foreground'>
                            Sale: PKR {item.sellingPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className='text-right text-sm font-medium'>
                            PKR {item.profit.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
