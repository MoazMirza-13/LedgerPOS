'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { Invoice, itemData, itemTable, Product } from 'types';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { formatToPKTDate } from '@/utils/utils';
import { usePathname } from 'next/navigation';

type Entity = itemData;

export const useColumns = <T extends Entity>(
  type: itemTable
): ColumnDef<T>[] => {
  const currentRole = useRole();
  const pathname = usePathname();

  const referenceSubRoute = pathname.includes('/references/');
  const supplierSubRoute = pathname.includes('/suppliers/');

  const baseColumns: ColumnDef<T>[] = [];

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
            <div className='relative h-[110px] w-[110px]'>
              {firstUrl && (
                <Image
                  src={firstUrl}
                  alt='Product image'
                  loading='lazy'
                  fill
                  className='rounded-lg object-contain'
                  sizes='(max-width: 768px) 100vw, 110px'
                  quality={35}
                />
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'title',
        header: 'PRODUCT',
        cell: ({ row }) => (
          <Link href={`/dashboard/${type}/${row.original.id}`}>
            {row.getValue('title')}
          </Link>
        )
      },
      {
        accessorKey: 'product_code',
        header: 'CODE',
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
      { accessorKey: 'selling_price', header: 'SELLING' },
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
      { accessorKey: 'description', header: 'DESCRIPTION' },
      {
        header: 'STOCK',
        cell: ({ row }) => {
          const product = row.original as Product;
          const quantity = row.getValue('QUANTITY') as number;
          const minQuantity = product.min_quantity;
          return quantity > minQuantity ? '✅' : '❌';
        }
      }
    );
  }

  if (type === 'invoices') {
    baseColumns.push(
      {
        accessorKey: 'created_at',
        header: 'DATE',
        cell: ({ row }) => (
          <span className='block w-max'>
            {formatToPKTDate(row.getValue('created_at'))}
          </span>
        )
      },
      {
        accessorKey: 'invoice_number',
        header: '#',
        cell: ({ row }) => {
          const invoice = row.original as Invoice;
          return (
            <Link
              href={`/dashboard/${type}/${invoice.id}`}
              className='flex items-center gap-1'
            >
              {row.getValue('invoice_number')}
              {invoice.edited && (
                <span className='rounded bg-gray-400 px-1 text-xs font-bold text-white'>
                  E
                </span>
              )}
            </Link>
          );
        }
      },
      { accessorKey: 'customer_name', header: 'CUSTOMER NAME' },
      { accessorKey: 'customer_number', header: 'CUSTOMER PH. NO.' },
      { accessorKey: 'customer_address', header: 'CUSTOMER ADDRESS' },
      {
        header: 'REFERENCE',
        accessorFn: (row) =>
          'references' in row ? row.references?.name || '' : ''
      },
      { accessorKey: 'total_price', header: 'TOTAL' }
    );
  }

  if (type === 'purchasing_invoices') {
    baseColumns.push(
      {
        accessorKey: 'created_at',
        header: 'DATE',
        cell: ({ row }) => (
          <span>{formatToPKTDate(row.getValue('created_at'))}</span>
        )
      },
      {
        accessorKey: 'invoice_number',
        header: '#',
        cell: ({ row }) => (
          <Link href={`/dashboard/purchasing-invoices/${row.original.id}`}>
            {row.getValue('invoice_number')}
          </Link>
        )
      },
      {
        header: 'Supplier',
        accessorFn: (row) =>
          'suppliers' in row ? row.suppliers?.name || '' : ''
      },
      { accessorKey: 'total_price', header: 'TOTAL' }
    );
  }

  if (type === 'references' || type === 'suppliers') {
    baseColumns.push(
      {
        accessorKey: 'name',
        header: `${type === 'references' ? 'REFERENCE' : 'SUPPLIER'} NAME`,
        cell: ({ row }) => (
          //! ledger screen for suppliers is under dev
          <Link href={`/dashboard/${type}/${row.original.id}`}>
            {row.getValue('name')}
          </Link>
        )
      },
      { accessorKey: 'balance', header: 'BALANCE' }
    );
  }

  if (type === 'references_ledger' || type === 'suppliers_ledger') {
    baseColumns.push(
      {
        accessorKey: 'created_at',
        header: 'DATE',
        cell: ({ row }) => (
          <span>{formatToPKTDate(row.getValue('created_at'))}</span>
        )
      },
      { accessorKey: 'name', header: 'NAME' },
      { accessorKey: 'invoice_number', header: 'INVOICE #' },
      { accessorKey: 'description', header: 'DESCRIPTION' },
      { accessorKey: 'dr', header: 'DR' },
      { accessorKey: 'cr', header: 'CR' },
      { accessorKey: 'balance', header: 'BALANCE' }
    );
  }

  if (
    currentRole === 'super_admin' &&
    !referenceSubRoute &&
    !supplierSubRoute
  ) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => <CellAction itemTable={type} itemData={row.original} />
    });
  }

  return baseColumns;
};
