'use client';
import { Product } from '@/constants/data';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'img_url',
    header: 'IMAGE',
    cell: ({ row }) => {
      return (
        <div className='relative aspect-square'>
          <Image
            src={row.getValue(`img_url`)}
            alt={`img`}
            fill
            className='rounded-lg'
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'title',
    header: 'Title'
  },
  {
    accessorKey: `categories.title`,
    header: 'CATEGORY'
  },
  {
    accessorKey: 'price',
    header: 'PRICE'
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION'
  },

  {
    id: 'actions',
    cell: ({ row }) => (
      <CellAction itemType={'products'} itemData={row.original} />
    )
  }
];
