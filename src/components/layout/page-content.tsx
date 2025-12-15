import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { cn } from '@/utils/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import ListingPage from '@/features/dynamic/listing';
import TableAction from '@/features/dynamic/table-components/table-action';
// import RoleGate from '@/components/role-gate/RoleGateServer';
import { itemData, itemTable } from 'types';

interface PageContentProps {
  title: string;
  description: string;
  type: itemTable;
  itemsData: itemData[];
  newLink?: string;
  searchParams?: any;
  pageKey?: string | number;
  extraTableProps?: Record<string, any>;
}

export const PageContent: React.FC<PageContentProps> = ({
  title,
  description,
  type,
  newLink,
  itemsData,
  searchParams,
  pageKey,
  extraTableProps
}) => {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading title={title} description={description} />
        {newLink && (
          // <RoleGate allow='super_admin'>
          <Link
            href={newLink}
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New
          </Link>
          // </RoleGate>
        )}
      </div>
      <Separator />
      {searchParams && <TableAction {...extraTableProps} />}
      <Suspense
        key={pageKey}
        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
      >
        <ListingPage type={type} data={itemsData} searchParams={searchParams} />
      </Suspense>
    </div>
  );
};
