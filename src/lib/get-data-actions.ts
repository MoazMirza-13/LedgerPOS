import { createClient } from '@/utils/supabase/client';
import { getClientImageUrl } from './utils';
import { Product } from 'types';

export const getNestedData = async () => {
  const supabase = createClient();
  const { data } = await supabase.rpc('get_nested_data');

  if (!data) return { products: [], categories: [], brands: [] };

  const productsWithImg = await Promise.all(
    data.products.map(async (product: Product) => ({
      ...product,
      img_url: await Promise.all(
        (product.img_url || []).map((url) => getClientImageUrl(url))
      )
    }))
  );

  return { ...data, products: productsWithImg };
};
