import { createClient } from '@/utils/supabase/server';
import { getImageUrl } from '@/utils/utils';
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
            img_url: Array.isArray(product.img_url)
              ? await Promise.all(
                  product.img_url
                    .filter(
                      (path: string) =>
                        typeof path === 'string' && path.trim() !== ''
                    )
                    .map(async (path: string) => await getImageUrl(path))
                )
              : []
          }))
        )
      : null;

    data = productsWithImg;
  } else if (type === 'invoices') {
    const { data: invoicesData, error } = await supabase.from(type).select(`
      *
      `);

    data = invoicesData;
  }

  const sortedData = Array.isArray(data)
    ? data.sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();

        return bTime - aTime;
      })
    : data;

  return sortedData;
}
