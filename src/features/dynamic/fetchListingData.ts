import { createClient } from '@/utils/supabase/server';
import { getImageUrl } from '@/utils/utils';
import { itemTable } from 'types';

export async function fetchListingData(type: itemTable, id?: string) {
  const supabase = await createClient();
  let data;

  if (
    type === 'categories' ||
    type === 'brands' ||
    type === 'references' ||
    type === 'suppliers'
  ) {
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
  } else if (type === 'purchasing_invoices') {
    const { data: purchasingInvoicesData, error } = await supabase.from(type)
      .select(`
      *,
      suppliers (name)
      `);

    data = purchasingInvoicesData;
  } else if (type === 'suppliers_ledger' && id) {
    const { data: suppliersLedgerData, error } = await supabase
      .from(type)
      .select('*')
      .eq('supplier_id', id);

    data = suppliersLedgerData;
  }

  const sortedData = Array.isArray(data)
    ? data.sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();

        // if ledger type => ascending (a - b)
        // otherwise => descending (b - a)
        return type === 'references_ledger' || type === 'suppliers_ledger'
          ? aTime - bTime
          : bTime - aTime;
      })
    : data;

  return sortedData;
}
