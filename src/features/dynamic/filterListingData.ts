import { formatToPKTDate } from '@/utils/utils';
import { Brand, Category, Invoice, itemData, Product } from 'types';

export function filterListingData(
  data: itemData[],
  type: string,
  searchParams: {
    q: string | null;
    categories: string | null;
    brands: string | null;
  }
) {
  // separate them using "." if multiple
  const search = searchParams.q;
  const categories = searchParams.categories
    ? searchParams.categories.split('.').filter((c) => c)
    : [];
  const brands = searchParams.brands
    ? searchParams.brands.split('.').filter((b) => b)
    : [];

  const filteredData = data.filter((item) => {
    let value = '';

    if (type === 'products') {
      const product = item as Product;
      value = `${product.product_code ?? ''} ${product.title ?? ''}`;
    } else if (type === 'invoices') {
      const invoice = item as Invoice;
      value = `${invoice.customer_name ?? ''} ${invoice.invoice_number ?? ''} ${
        invoice.created_at ? formatToPKTDate(invoice.created_at) : ''
      }`;
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
