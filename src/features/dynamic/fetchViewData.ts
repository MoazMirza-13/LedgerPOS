import { getCategoriesBrandsData, getDataById } from '@/lib/actions';
import { formatTitle, getImageUrl } from '@/lib/utils';
import { QueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Brand, Category, itemTable, Product } from 'types';

export async function fetchViewData(
  queryClient: QueryClient,
  type: itemTable,
  id: string
) {
  try {
    let data = null;
    let categories = null;
    let brands = null;
    let showUploader = type === 'products';
    let pageTitle = formatTitle('Add New', type);

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
        // TODO: check to make sure
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

          showUploader = false;
        } else {
          data = fetchedData as Category | Brand;
        }

        pageTitle = formatTitle('Edit', type);
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

    return { data, categories, brands, showUploader, pageTitle };
  } catch (error) {
    notFound();
  }
}
