'use client';
import { Category } from '@/constants/data';
import { CellAction } from '@/features/dynamic/table-components/cell-action';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'title',
    header: 'TITLE'
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION'
  },

  {
    id: 'actions',
    cell: ({ row }) => (
      <CellAction itemType={'categories'} itemData={row.original} />
    )
  }
];
