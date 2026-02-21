import PageContainer from '@/components/layout/page-container';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { itemData } from 'types';
import { getCategoriesBrandsData } from '@/lib/actions';
import { PageContent } from '@/components/layout/page-content';
import { warehouses } from '@/constants/data';

export const metadata = {
  title: 'Dashboard: Products'
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
    type: 'products',
    limit: 900,
    filters: searchParams
  });
  const items_data: itemData[] = data ? data : [];

  const categoryBrandData = await getCategoriesBrandsData();
  const categories = categoryBrandData ? categoryBrandData[0].categories : [];
  const brands = categoryBrandData ? categoryBrandData[0].brands : [];

  return (
    <PageContainer scrollable={false}>
      <PageContent
        title='Products'
        description='Manage products'
        type='products'
        newLink='/dashboard/products/new'
        itemsData={items_data}
        searchParams={searchParams}
        pageKey={key}
        extraTableProps={{ categories, brands, warehouses, items_data }}
      />
    </PageContainer>
  );
}
