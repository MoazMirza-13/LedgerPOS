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
        accessorKey: 'img',
        header: 'IMAGE',
        cell: ({ row }) => {
          const url = row.getValue('img') as string;

          return (
            <div className='relative h-[110px] w-[110px]'>
              {url && (
                <Image
                  src={url}
                  alt='B/C image'
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
    // if (currentRole === 'super_admin') {
    baseColumns.push({ accessorKey: 'cost_price', header: 'COST' });
    // }
    baseColumns.push(
      { accessorKey: 'selling_price', header: 'SELLING' },
      {
        header: 'QUANTITY',
        accessorKey: 'quantity'
      },
      {
        header: 'Stock',
        accessorFn: (row) => {
          const product = row as Product;
          return product.in_stock ? '✅' : '❌';
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
