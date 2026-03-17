import { getImageUrl } from '@/utils/utils';
import { itemTable, Product } from 'types';

export type ListingFilters = {
  q?: string | null;
  categories?: string | null;
  brands?: string | null;
  warehouses?: string | null;
  from?: string | null;
  to?: string | null;
};

export async function fetchListingDataShared(
  supabase: any,
  type: itemTable,
  offset: number,
  limit: number,
  id?: string,
  filters?: ListingFilters
) {
  const normalizeArray = (value?: string | null) =>
    value
      ? value
          .split('.')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)
      : [];

  const applyRelationFilter = (
    query: any,
    table: string,
    column: string,
    values: string[]
  ) => {
    if (!values.length) return query;

    const conditions = values.map((v) => `${column}.ilike.${v}*`).join(',');

    return query.or(conditions, { foreignTable: table });
  };

  const categories = normalizeArray(filters?.categories);
  const brands = normalizeArray(filters?.brands);
  const warehouses = normalizeArray(filters?.warehouses);

  let selectStr = '*';
  if (type === 'products')
    selectStr = '*, categories!inner (title), brands!inner (title)';
  else if (type === 'invoices') selectStr = '*, references (name)';
  else if (type === 'purchasing_invoices') selectStr = '*, suppliers (name)';

  const ascending = type === 'references_ledger' || type === 'suppliers_ledger';

  let query = supabase
    .from(type)
    .select(selectStr)
    .order('created_at', { ascending })
    .range(offset, offset + limit - 1);

  if (id && type === 'references_ledger') query = query.eq('reference_id', id);
  if (id && type === 'suppliers_ledger') query = query.eq('supplier_id', id);

  const search = filters?.q?.trim() ?? '';

  const from = filters?.from?.trim() ?? '';
  const to = filters?.to?.trim() ?? '';

  if (
    (type === 'references_ledger' || type === 'suppliers_ledger') &&
    from &&
    to
  ) {
    query = query
      .gte('created_at', `${from}T00:00:00+05:00`)
      .lte('created_at', `${to}T23:59:59.999+05:00`);
  }

  if (search) {
    if (type === 'invoices') {
      const parsedInvoiceNumber = Number(search);
      const isInvoiceNumber = Number.isFinite(parsedInvoiceNumber);
      query = isInvoiceNumber
        ? query.or(
            `customer_name.ilike.%${search}%,invoice_number.eq.${parsedInvoiceNumber}`
          )
        : query.ilike('customer_name', `%${search}%`);
    } else if (type === 'purchasing_invoices') {
      const parsedInvoiceNumber = Number(search);
      const isInvoiceNumber = Number.isFinite(parsedInvoiceNumber);
      if (isInvoiceNumber) {
        query = query.eq('invoice_number', parsedInvoiceNumber);
      } else {
        // Purchasing invoice search is invoice-number only; text terms should return no rows.
        query = query.eq('invoice_number', -1);
      }
    } else if (type === 'references' || type === 'suppliers') {
      query = query.ilike('name', `%${search}%`);
    } else if (type === 'products') {
      query = query.ilike('product_code', `%${search}%`);
    } else {
      query = query.ilike('title', `%${search}%`);
    }
  }

  if (type === 'products') {
    const searchOr = search
      ? `product_code.ilike.%${search}%,title.ilike.%${search}%`
      : '';

    if (categories.length) {
      query = applyRelationFilter(query, 'categories', 'title', categories);
    }
    if (brands.length) {
      query = applyRelationFilter(query, 'brands', 'title', brands);
    }

    let warehouseOr = '';
    if (warehouses.length) {
      const warehouseColumnMap: Record<string, string> = {
        Zafarwal: 'quantity_in_zafarwal',
        Ghaziwal: 'quantity_in_ghaziwal',
        LhrRoad: 'quantity_in_lhr_road',
        EidgahRoad: 'quantity_in_eidgah_road',
        MandiTile: 'quantity_in_mandi_tile',
        MandiBond: 'quantity_in_mandi_bond'
      };

      const warehouseConditions = warehouses
        .map((warehouse) => {
          const normalized = warehouse.replace(/\s+/g, '');
          const column = warehouseColumnMap[normalized];
          return column ? `${column}.gt.0` : '';
        })
        .filter(Boolean);

      if (warehouseConditions.length) {
        warehouseOr = warehouseConditions.join(',');
      }
    }

    if (searchOr && warehouseOr) {
      query = query.or(`and(or(${searchOr}),or(${warehouseOr}))`);
    } else if (searchOr) {
      query = query.or(searchOr);
    } else if (warehouseOr) {
      query = query.or(warehouseOr);
    }
  }

  const { data: fetchedData, error } = await query;
  if (error) throw error;

  let processedData = fetchedData;

  if (type === 'products') {
    processedData = await Promise.all(
      fetchedData.map(async (product: Product) => ({
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
    );
  }

  return processedData;
}
