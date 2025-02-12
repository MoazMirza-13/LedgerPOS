import { Category } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { createClient } from '@/utils/supabase/server';
import TableClientSide from '@/features/dynamic/table-components/tableClient';

type CategoryListingPage = {};

export default async function CategoryListingPage({}: CategoryListingPage) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('*');

  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const pageLimit = searchParamsCache.get('limit');
  const categories = searchParamsCache.get('categories');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  // const data = await fakeProducts.getProducts(filters);
  const categories_data: Category[] = data ? data : [];

  return (
    <>
      <TableClientSide type='categories' data={categories_data} />;
    </>
  );
}
