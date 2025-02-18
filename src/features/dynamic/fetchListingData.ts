import { createClient } from '@/utils/supabase/server';
import { getImageUrl } from '@/lib/utils';
import { itemTable } from 'types';

export async function fetchListingData(type: itemTable) {
  const supabase = await createClient();
  let data;

  if (type === 'categories' || type === 'brands') {
    const { data: fetchedData, error } = await supabase.from(type).select('*');
    data = fetchedData;
  } else if (type === 'products') {
    const { data: productsData, error } = await supabase.from(type).select(`
      *,
      categories (title),
      brands (title)
    `);

    const productsWithImg = productsData
      ? await Promise.all(
          productsData.map(async (product) => ({
            ...product,
            img_url: await getImageUrl(product.img_url)
          }))
        )
      : null;

    data = productsWithImg;
  }

  return data?.reverse();
}
