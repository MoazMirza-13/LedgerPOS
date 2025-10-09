'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { useColumns } from '@/features/dynamic/table-components/columns';
import { itemData, itemTable } from 'types';

interface TableClientProps {
  data: itemData[];
  type: itemTable;
  total: number;
}

export default function TableClientSide({
  data,
  type,
  total
}: TableClientProps) {
  return (
    <DataTable columns={useColumns(type)} data={data} totalItems={total} />
  );
}
