'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { Invoice, itemData, itemTable, Product, Reference_bills } from 'types';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { formatToPKTDate } from '@/utils/utils';
import { usePathname } from 'next/navigation';

type Entity = itemData;

export const useColumns = <T extends Entity>(
  type: itemTable
): ColumnDef<T>[] => {
  const pathname = usePathname();
  const currentRole = useRole();

  const baseColumns: ColumnDef<T>[] = [];

  const reference_bills_path = pathname === '/dashboard/reference-bills';
  const reference_detail_path =
    pathname.startsWith('/dashboard/reference-bills/') &&
    pathname !== '/dashboard/reference-bills';

  if (type === 'categories' || type === 'brands') {
    baseColumns.push(
      {
        accessorKey: 'title',
        header: 'TITLE',
        cell: ({ row }) => (
          <Link href={`/dashboard/${type}/${row.original.id}`}>
            {row.getValue('title')}
          </Link>
        )
      },
      { accessorKey: 'description', header: 'DESCRIPTION' }
    );
  }

  if (type === 'products') {
    baseColumns.push(
      {
        accessorKey: 'img_url',
        header: 'IMAGE',
        cell: ({ row }) => {
          const urls = row.getValue('img_url') as string[];
          const firstUrl =
            Array.isArray(urls) && urls.length > 0 ? urls[0] : null;

          return (
            <div className='relative aspect-square'>
              {firstUrl && (
                <Image
                  src={firstUrl}
                  alt='Product image'
                  priority
                  fill
                  className='rounded-lg object-contain'
                  sizes='(max-width: 768px) 100vw, 110px'
                />
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'product_code',
        header: 'Product',
        cell: ({ row }) => (
          <Link href={`/dashboard/${type}/${row.original.id}`}>
            {row.getValue('product_code')}
          </Link>
        )
      },
      {
        header: 'CATEGORY',
        accessorFn: (row) =>
          'categories' in row ? row.categories?.title || '' : ''
      },
      {
        header: 'BRAND',
        accessorFn: (row) => ('brands' in row ? row.brands?.title || '' : '')
      }
    );
    if (currentRole === 'super_admin') {
      baseColumns.push({ accessorKey: 'cost_price', header: 'COST' });
    }
    baseColumns.push(
      {
        header: 'QUANTITY',
        accessorFn: (row) => {
          const product = row as Product;
          const totalQuantity =
            (product.quantity_in_zafarwal || 0) +
            (product.quantity_in_ghaziwal || 0) +
            (product.quantity_in_lhr_road || 0) +
            (product.quantity_in_eidgah_road || 0) +
            (product.quantity_in_mandi_tile || 0) +
            (product.quantity_in_mandi_bond || 0);
          return totalQuantity;
        }
      },
      { accessorKey: 'selling_price', header: 'SELLING' },
      {
        header: 'Stock',
        cell: ({ row }) => {
          const product = row.original as Product;
          const quantity = row.getValue('QUANTITY') as number;
          const minQuantity = product.min_quantity;
          return quantity > minQuantity ? '✅' : '❌';
        }
      },
      {
        header: 'TOTAL',
        cell: ({ row }) => {
          const product = row.original as Product;
          const quantity = row.getValue('QUANTITY') as number;
          const totalStock = quantity * product.cost_price;
          return totalStock;
        }
      }
    );
  }

  if (type === 'invoices' && (reference_detail_path || !reference_bills_path)) {
    baseColumns.push(
      { accessorKey: 'invoice_number', header: '#' },
      {
        accessorKey: 'customer_name',
        header: 'CUSTOMER NAME',
        cell: ({ row }) => (
          <Link href={`/dashboard/${type}/${row.original.id}`}>
            {row.getValue('customer_name')}
          </Link>
        )
      },
      { accessorKey: 'customer_number', header: 'CUSTOMER PH. NO.' },
      { accessorKey: 'customer_address', header: 'CUSTOMER ADDRESS' },
      {
        accessorKey: 'created_at',
        header: 'DATE',
        cell: ({ row }) => (
          <span>{formatToPKTDate(row.getValue('created_at'))}</span>
        )
      },
      {
        header: 'REFERENCE',
        accessorFn: (row) =>
          'references' in row ? row.references?.name || '' : ''
      },
      { accessorKey: 'total_price', header: 'TOTAL' },
      {
        accessorKey: 'payment',
        header: 'PAYMENT',
        cell: ({ row }) => {
          const invoice = row.original as Invoice;
          return invoice.payment ? '✅' : '❌';
        }
      }
    );
  }

  if (type === 'references') {
    baseColumns.push(
      {
        accessorKey: 'name',
        header: 'REFERENCE NAME',
        cell: ({ row }) => (
          //todo link to reference ledger
          <Link href={`/dashboard/${type}/will-check`}>
            {row.getValue('name')}
          </Link>
        )
      },
      { accessorKey: 'balance', header: 'BALANCE' }
    );
  }

  if (type === 'invoices' && reference_bills_path) {
    return [
      {
        accessorKey: 'reference',
        header: 'REFERENCE NAME',
        cell: ({ row }) => {
          const invoiceRow = row.original as Reference_bills;
          return (
            <Link href={`/dashboard/reference-bills/${invoiceRow.reference}`}>
              {invoiceRow.reference}
            </Link>
          );
        }
      },
      {
        header: 'TOTAL',
        accessorFn: (row) => (row as Reference_bills).total_price
      }
    ];
  }

  if (currentRole === 'super_admin' && !reference_bills_path) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => <CellAction itemTable={type} itemData={row.original} />
    });
  }

  return baseColumns;
};
