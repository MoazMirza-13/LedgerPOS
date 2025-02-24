import { searchParamsCache } from '@/lib/searchparams';
import TableClientSide from '@/features/dynamic/table-components/tableClient';
import { itemData, itemTable } from 'types';

type ListingPageProps = {
  type: itemTable;
  data: itemData[];
};

export default async function ListingPage({ type, data }: ListingPageProps) {
  // Showcasing the use of search params cache in nested RSCs
  const search = searchParamsCache.get('q');

  const filteredData = search
    ? data.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  // const page = searchParamsCache.get('page');
  // const categories = searchParamsCache.get('categories');
  // const pageLimit = searchParamsCache.get('limit');

  const filters = {
    // page,
    // limit: pageLimit,
    // ...(search && { search }) // ✅
    // ...(categories && { categories: categories })
  };

  return (
    <>
      <TableClientSide type={type} data={filteredData} />
    </>
  );
}
