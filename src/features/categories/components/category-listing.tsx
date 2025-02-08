import { Category } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as CategoryTable } from '@/components/ui/table/data-table';
import { columns } from './category-tables/columns';
import { createClient } from '@/utils/supabase/server';

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
    <CategoryTable
      columns={columns}
      data={categories_data}
      totalItems={categories_data.length}
    />
  );
}
