import { createClient } from '@/utils/supabase/server';
import { getImageUrl } from '@/lib/utils';
import { itemTable, itemData } from 'types';
import { searchParamsCache } from '@/lib/searchparams';

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
  }

  const sortedData = Array.isArray(data)
    ? data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : data;

  return sortedData;
}

export function filterListingData(data: itemData[]) {
  // Showcasing the use of search params cache in nested RSCs
  const search = searchParamsCache.get('q');
  const page = Number(searchParamsCache.get('page'));
  const limit = Number(searchParamsCache.get('limit'));
  const categories = searchParamsCache.get('categories')?.split('.') || []; // separate them using "." if multiple
  const brands = searchParamsCache.get('brands')?.split('.') || [];

  const filteredData = data.filter((item) => {
    const matchesSearch = search
      ? item.title.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesCategoryBrand =
      (categories.length || brands.length) &&
      ('categories' in item || 'brands' in item)
        ? categories.includes(item.categories?.title || '') ||
          brands.includes(item.brands?.title || '')
        : true;

    return matchesSearch && matchesCategoryBrand;
  });

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  return { paginatedData, total_length: filteredData.length };
}
