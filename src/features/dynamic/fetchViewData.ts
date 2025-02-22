import { getDataById } from '@/lib/actions';
import { getImageUrl } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';
import { QueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Brand, Category, itemTable, Product } from 'types';

export async function fetchViewData(
  queryClient: QueryClient,
  type: itemTable,
  id: string
) {
  try {
    const supabase = await createClient();

    let data = null;
    let categories = null;
    let brands = null;
    let showUploader = type === 'products';
    let pageTitle = `Add New ${
      type === 'categories'
        ? 'Category'
        : type === 'products'
          ? 'Product'
          : 'Brand'
    }`;

    if (id !== 'new') {
      try {
        await queryClient.prefetchQuery({
          queryKey: [type, id],
          queryFn: () => getDataById(type, id),
          staleTime: Infinity // Never refetch automatically
        });

        const fetchedData = queryClient.getQueryData([type, id]);

        if (type === 'products' && fetchedData) {
          data = {
            ...fetchedData,
            img_url: await getImageUrl((fetchedData as Product).img_url)
          };
          showUploader = false;
        } else {
          data = fetchedData as Category | Brand;
        }

        pageTitle = `Edit ${type === 'categories' ? 'category' : type === 'products' ? 'product' : 'brand'}`;
      } catch (error) {
        throw error;
      }
    }

    if (type === 'products') {
      const { data: categoryBrandData, error } = await supabase
        .from('combined_categories_brands')
        .select('*');

      if (!error) {
        categories = categoryBrandData[0].categories;
        brands = categoryBrandData[0].brands;
      }
    }

    return { data, categories, brands, showUploader, pageTitle };
  } catch (error) {
    notFound();
  }
}
