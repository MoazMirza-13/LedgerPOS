import { searchParamsCache } from '@/lib/searchparams';
import TableClientSide from '@/features/dynamic/table-components/tableClient';
import { fetchListingData } from './fetchListingData';
import { itemData, itemTable } from 'types';

export default async function ListingPage({ type }: { type: itemTable }) {
  const data = await fetchListingData(type);

  const items_data: itemData[] = data ? data : [];

  //   // Showcasing the use of search params cache in nested RSCs
  //   const page = searchParamsCache.get('page');
  //   const search = searchParamsCache.get('q');
  //   const pageLimit = searchParamsCache.get('limit');
  //   const categories = searchParamsCache.get('categories');

  //   const filters = {
  //     page,
  //     limit: pageLimit,
  //     ...(search && { search }),
  //     ...(categories && { categories: categories })
  //   };

  // const data = await fakeProducts.getProducts(filters);

  return (
    <>
      <TableClientSide type={type} data={items_data} />
    </>
  );
}
