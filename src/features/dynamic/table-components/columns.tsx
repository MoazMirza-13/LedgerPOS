'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { itemData, itemTable } from 'types';

type Entity = itemData;

export const columns = <T extends Entity>(type: itemTable): ColumnDef<T>[] => {
  const baseColumns: ColumnDef<T>[] = [];

  if (type === 'categories' || type === 'brands') {
    baseColumns.push(
      { accessorKey: 'title', header: 'TITLE' },
      { accessorKey: 'description', header: 'DESCRIPTION' }
    );
  }

  if (type === 'products') {
    baseColumns.push(
      {
        accessorKey: 'img_url',
        header: 'IMAGE',
        cell: ({ row }) => (
          <div className='relative aspect-square'>
            <Image
              src={row.getValue('img_url')}
              alt='Product image'
              priority
              fill
              className='rounded-lg object-contain'
            />
          </div>
        )
      },
      { accessorKey: 'title', header: 'Title' },
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
