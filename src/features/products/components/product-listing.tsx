import { Product } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as ProductTable } from '@/components/ui/table/data-table';
import { columns } from './product-tables/columns';
import { createClient } from '@/utils/supabase/server';

type ProductListingPage = {};

export default async function ProductListingPage({}: ProductListingPage) {
  const supabase = await createClient();
  // const { data, error } = await supabase.from('products').select('*');
  const { data, error } = await supabase.from('products').select(`
    *,
    categories (title) 
  `);

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
  const products: Product[] = data ? data : [];

  return (
    <ProductTable
      columns={columns}
      data={products}
      totalItems={products.length}
    />
  );
}
