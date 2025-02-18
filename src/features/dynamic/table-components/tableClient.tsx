'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { columns } from '@/features/dynamic/table-components/columns';
import { itemData, itemTable } from 'types';

interface TableClientProps {
  data: itemData[];
  type: itemTable;
}

export default function TableClientSide({ data, type }: TableClientProps) {
  return (
    <DataTable columns={columns(type)} data={data} totalItems={data.length} />
  );
}
