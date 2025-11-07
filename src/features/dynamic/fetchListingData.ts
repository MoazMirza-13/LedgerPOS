import { createClient } from '@/utils/supabase/server';
import { formatToPKTDate, getImageUrl } from '@/utils/utils';
import {
  itemTable,
  itemData,
  Product,
  Category,
  Brand,
  Invoice,
  Reference
} from 'types';
import { searchParamsCache } from '@/lib/searchparams';

export async function fetchListingData(type: itemTable, id?: string) {
  const supabase = await createClient();
  let data;

  if (type === 'categories' || type === 'brands' || type === 'references') {
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
      *,
      references (name)
      `);

    data = invoicesData;
  } else if (type === 'references_ledger' && id) {
    const { data: referencesLedgerData, error } = await supabase
      .from(type)
      .select('*')
      .eq('reference_id', id);

    data = referencesLedgerData;
  }

  const sortedData = Array.isArray(data)
    ? data.sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();

        // if type is references_ledger => ascending (a - b)
        // otherwise => descending (b - a)
        return type === 'references_ledger' ? aTime - bTime : bTime - aTime;
      })
    : data;

  return sortedData;
}

export function filterListingData(data: itemData[], type: string) {
  // Showcasing the use of search params cache in nested RSCs
  const search = searchParamsCache.get('q');
  const categories = searchParamsCache.get('categories')?.split('.') || []; // separate them using "." if multiple
  const brands = searchParamsCache.get('brands')?.split('.') || [];

  const filteredData = data.filter((item) => {
    let value = '';

    if (type === 'products') {
      const product = item as Product;
      value = `${product.product_code ?? ''} ${product.title ?? ''}`;
    } else if (type === 'invoices') {
      const invoice = item as Invoice;
      value = `${invoice.customer_name ?? ''} ${invoice.invoice_number ?? ''} ${invoice.created_at ? formatToPKTDate(invoice.created_at) : ''}`;
    } else if (type === 'references') {
      const reference = item as Reference;
      value = `{${reference.name ?? ''}`;
    } else {
      const entry = item as Category | Brand;
      value = entry.title ?? '';
    }

    const text = value.toLowerCase();
    const matchesSearch = search ? text.includes(search.toLowerCase()) : true;

    const matchesCategoryBrand =
      (categories.length || brands.length) &&
      ('categories' in item || 'brands' in item)
        ? categories.includes(item.categories?.title || '') ||
          brands.includes(item.brands?.title || '')
        : true;

    return matchesSearch && matchesCategoryBrand;
  });
  return { filteredData };
}
