'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { itemData, itemTable } from 'types';
import Link from 'next/link';

type Entity = itemData;

export const columns = <T extends Entity>(type: itemTable): ColumnDef<T>[] => {
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
      {
        header: 'CATEGORY',
        accessorFn: (row) =>
          'categories' in row ? row.categories?.title || '' : ''
      },
      {
        header: 'BRAND',
        accessorFn: (row) => ('brands' in row ? row.brands?.title || '' : '')
      },
      { accessorKey: 'price', header: 'PRICE' },
      { accessorKey: 'description', header: 'DESCRIPTION' }
    );
  }

  return [
    ...baseColumns,
    {
      id: 'actions',
      cell: ({ row }) => <CellAction itemTable={type} itemData={row.original} />
    }
  ];
};
