import { getClientImageUrl, toastMsg } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Brand, Category } from 'types';

export const getProducts = async (
  initialData: Category | Brand,
  pathname: string
) => {
  const supabase = createClient();
  let data;
  const { data: productsData, error } = await supabase.from('products').select(`
            *,
            categories (title),
            brands (title)
          `);
  if (error) toast.error(toastMsg.error);

  const productsWithImg = productsData
    ? await Promise.all(
        productsData.map(async (product) => ({
          ...product,
          img_url: await getClientImageUrl(product.img_url)
        }))
      )
    : null;

  data = productsWithImg;

  const brandsPath = pathname.includes('brands');
  const categoriesPath = pathname.includes('categories');

  if (brandsPath) {
    data = data?.filter(
      (product) => product.brands?.title === initialData?.title
    );
  }

  if (categoriesPath) {
    data = data?.filter(
      (product) => product.categories?.title === initialData?.title
    );
  }

  return data?.reverse();
};
