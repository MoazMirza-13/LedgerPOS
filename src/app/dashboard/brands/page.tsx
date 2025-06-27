import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import ListingPage from '@/features/dynamic/listing';
import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { itemData } from 'types';
import TableAction from '@/features/dynamic/table-components/table-action';

export const metadata = {
  title: 'Dashboard: Brands'
};

type pageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  const key = serialize({ ...searchParams });

  const data = await fetchListingData('brands');
  const items_data: itemData[] = data ? data : [];

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Brands' description='Manage brands' />
          <Link
            href='/dashboard/brands/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
        <Separator />
        <TableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <ListingPage
            type={'brands'}
            data={items_data}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}
