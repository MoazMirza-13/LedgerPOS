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
  const page = Number(searchParamsCache.get('page'));
  const limit = Number(searchParamsCache.get('limit'));
  const categories = searchParamsCache.get('categories')?.split('.') || []; // separate them using "." if multiple
  const brands = searchParamsCache.get('brands')?.split('.') || [];

  const filteredData = data.filter((item) => {
    const matchesSearch = search
      ? item.title.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesCategory =
      categories.length && 'categories' in item
        ? categories.includes(item.categories?.title || '')
        : true;

    const matchesBrand =
      brands.length && 'brands' in item
        ? brands.includes(item.brands?.title || '')
        : true;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  const total_length = filteredData.length;

  return (
    <>
      <TableClientSide type={type} data={paginatedData} total={total_length} />
    </>
  );
}
