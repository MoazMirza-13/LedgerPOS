import { Brand, Category, Product } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { createClient } from '@/utils/supabase/server';
import TableClientSide from '@/features/dynamic/table-components/tableClient';

type ListingPage = {
  type: 'categories' | 'products' | 'brands';
};

export default async function ListingPage({ type }: ListingPage) {
  const supabase = await createClient();
  let data;
  if (type === 'categories' || type === 'brands') {
    const { data: fetchedData, error: serverError } = await supabase
      .from(type)
      .select('*');
    data = fetchedData;
  } else if (type === 'products') {
    const { data: productsData, error: productsError } = await supabase.from(
      'products'
    ).select(`
      *,
     categories (title),
    brands (title)
    `);
    data = productsData?.map((product) => ({
      ...product,
      img_url: product.img_url
        ? supabase.storage.from('product_imgs').getPublicUrl(product.img_url)
            .data.publicUrl
        : null // Fallback if no image
    }));
  }

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

  const items_data: Category[] | Product[] | Brand[] = data ? data : [];

  return (
    <>
      <TableClientSide type={type} data={items_data} />
    </>
  );
}
