'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { itemData, itemTable, Product } from 'types';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { formatToPKTDate } from '@/utils/utils';

type Entity = itemData;

export const useColumns = <T extends Entity>(
  type: itemTable
): ColumnDef<T>[] => {
  const baseColumns: ColumnDef<T>[] = [];

  const currentRole = useRole();

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
        accessorKey: 'title',
        header: 'TITLE',
        cell: ({ row }) => (
          <Link href={`/dashboard/${type}/${row.original.id}`}>
            {row.getValue('title')}
          </Link>
        )
      },
      { accessorKey: 'product_code', header: 'CODE #' },
      {
        header: 'CATEGORY',
        accessorFn: (row) =>
          'categories' in row ? row.categories?.title || '' : ''
      },
      {
        header: 'BRAND',
        accessorFn: (row) => ('brands' in row ? row.brands?.title || '' : '')
      },
      { accessorKey: 'cost_price', header: 'COST' },
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
          const quantity = row.getValue('QUANTITY') as number;
          return quantity > 0 ? '✅' : '❌';
        }
      },
      { accessorKey: 'description', header: 'DESCRIPTION' }
    );
  }

  if (type === 'invoices') {
    baseColumns.push(
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
      { accessorKey: 'total_price', header: 'TOTAL' }
    );
  }

  if (currentRole === 'super_admin') {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => <CellAction itemTable={type} itemData={row.original} />
    });
  }

  return baseColumns;
};
