import { createClient } from '@/utils/supabase/server';
import { getImageUrl } from '@/lib/utils';
import { Brand, Category, Product, itemTable } from 'types';
import { notFound } from 'next/navigation';

export async function fetchViewData(type: itemTable, id: string) {
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
    const { data: fetchedData, error } = await supabase
      .from(type)
      .select('*')
      .eq('id', id)
      .single();

    if (!fetchedData) {
      notFound();
    }

    if (type === 'products') {
      data = {
        ...fetchedData,
        img_url: await getImageUrl(fetchedData.img_url)
      } as Product;
      showUploader = false;
    } else {
      data = fetchedData as Category | Brand;
    }

    pageTitle = `Edit ${type === 'categories' ? 'category' : type === 'products' ? 'product' : 'brand'}`;
  }

  if (type === 'products') {
    const { data, error } = await supabase
      .from('combined_categories_brands')
      .select('*');
    if (!error) {
      categories = data[0].categories;
      brands = data[0].brands;
    }
  }

  return { data, categories, brands, showUploader, pageTitle };
}
