'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { columns } from '@/features/dynamic/table-components/columns';
import { Category, Product } from '@/constants/data';

interface TableClientProps {
  data: Product[] | Category[];
  type: 'categories' | 'products';
}

export default function TableClientSide({ data, type }: TableClientProps) {
  return (
    <DataTable columns={columns(type)} data={data} totalItems={data.length} />
  );
}
