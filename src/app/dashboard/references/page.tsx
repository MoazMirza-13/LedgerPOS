import PageContainer from '@/components/layout/page-container';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { itemData } from 'types';
import { PageContent } from '@/components/layout/page-content';

export const metadata = {
  title: 'Dashboard: References'
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

  const data = await fetchListingData({
    type: 'references',
    limit: 900,
    filters: searchParams
  });
  const items_data: itemData[] = data ? data : [];

  return (
    <PageContainer scrollable={false}>
      <PageContent
        title='References'
        description='Click on Reference name to open their Ledger'
        type='references'
        newLink='/dashboard/references/new'
        itemsData={items_data}
        searchParams={searchParams}
        pageKey={key}
      />
    </PageContainer>
  );
}
