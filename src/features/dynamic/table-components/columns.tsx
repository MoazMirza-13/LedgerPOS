'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { Brand, Category, Product } from '@/constants/data';

type itemTable = 'categories' | 'products' | 'brands';
type Entity = Category | Product | Brand;

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
              fill
              className='rounded-lg'
            />
          </div>
        )
      },
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'categories.title', header: 'CATEGORY' },
      { accessorKey: 'brands.title', header: 'BRAND' },
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
