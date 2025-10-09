import { getCategoriesBrandsData, getDataById } from '@/lib/actions';
import { formatTitle, getImageUrl } from '@/lib/utils';
import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Brand, Category, itemTable, Product } from 'types';

export async function fetchViewData(
  queryClient: QueryClient,
  type: itemTable,
  id: string
) {
  try {
    const cookieStore = await cookies();
    const currentRole = cookieStore.get('currentRole')?.value || '';

    let data = null;
    let categories = null;
    let brands = null;
    let newProduct = type === 'products';
    let pageTitle = '';

    if (currentRole === 'super_admin') {
      pageTitle = formatTitle(id === 'new' ? 'Add New' : 'Edit', type);
    } else {
      pageTitle = formatTitle('', type);
    }

    if (id !== 'new') {
      try {
        await queryClient.prefetchQuery({
          queryKey: [type, id],
          queryFn: () => getDataById(type, id),
          staleTime: Infinity // Never refetch automatically
        });

        const fetchedData = queryClient.getQueryData([type, id]);

        if (!fetchedData) {
          notFound();
        }

        if (type === 'products' && fetchedData) {
          const imageUrls = await Promise.all(
            ((fetchedData as Product).img_url || []).map((url) =>
              getImageUrl(url)
            )
          );

          data = {
            ...fetchedData,
            img_url: imageUrls
          };

          newProduct = false;
        } else {
          data = fetchedData as Category | Brand;
        }
      } catch (error) {
        throw error;
      }
    }

    if (type === 'products') {
      const categoryBrandData = await getCategoriesBrandsData();

      if (categoryBrandData) {
        categories = categoryBrandData[0].categories;
        brands = categoryBrandData[0].brands;
      }
    }

    return { data, categories, brands, newProduct, pageTitle };
  } catch (error) {
    notFound();
  }
}
