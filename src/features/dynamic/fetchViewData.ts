import {
  getCategoriesBrandsData,
  getDataById,
  getSupabaseClient
} from '@/lib/actions';
import { formatTitle, getImageUrl } from '@/utils/utils';
import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  Brand,
  Category,
  Invoice,
  Invoice_items,
  itemTable,
  Product,
  PurchasingInvoice,
  PurchasingInvoiceItems
} from 'types';

export async function fetchViewData(
  queryClient: QueryClient,
  type: itemTable,
  id: string
) {
  try {
    const cookieStore = await cookies();
    const currentRole = cookieStore.get('currentRole')?.value || '';

    let data = null;
    let categories = null;
    let brands = null;
    let references = null;
    let suppliers = null;
    let newProduct = type === 'products';
    let pageTitle = '';

    if (currentRole === 'super_admin') {
      pageTitle = formatTitle(id === 'new' ? 'Add New' : 'Edit', type);
    } else {
      pageTitle = formatTitle('', type);
    }

    if (id !== 'new') {
      try {
        await queryClient.prefetchQuery({
          queryKey: [type, id],
          queryFn: () => getDataById(type, id),
          staleTime: Infinity // Never refetch automatically
        });

        const fetchedData = queryClient.getQueryData<
          Invoice | Product | Category | Brand | PurchasingInvoice
        >([type, id]);

        if (!fetchedData) {
          notFound();
        }

        if (type === 'products' && fetchedData) {
          const imageUrls = await Promise.all(
            ((fetchedData as Product).img_url || []).map((url) =>
              getImageUrl(url)
            )
          );

          data = {
            ...fetchedData,
            img_url: imageUrls
          };

          newProduct = false;
        } else if (type === 'invoices' && fetchedData) {
          const supabase = await getSupabaseClient();
          const { data: invoice_items, error } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', fetchedData.id);

          if (error) throw error;

          data = {
            ...fetchedData,
            invoice_items: (invoice_items as Invoice_items[]) || []
          };
        } else if (type === 'purchasing_invoices' && fetchedData) {
          const supabase = await getSupabaseClient();
          const { data: invoice_items, error } = await supabase
            .from('purchasing_invoice_items')
            .select('*')
            .eq('purchasing_invoice_id', fetchedData.id);

          if (error) throw error;

          data = {
            ...fetchedData,
            purchasing_invoice_items:
              (invoice_items as PurchasingInvoiceItems[]) || []
          };
        } else {
          data = fetchedData as Category | Brand;
        }
      } catch (error) {
        throw error;
      }
    }

    if (type === 'products') {
      const categoryBrandData = await getCategoriesBrandsData();

      if (categoryBrandData) {
        categories = categoryBrandData[0].categories;
        brands = categoryBrandData[0].brands;
      }
    }

    if (type === 'invoices') {
      const supabase = await getSupabaseClient();
      const { data } = await supabase.from('references').select('*');

      if (data) {
        references = data;
      }
    }

    if (type === 'purchasing_invoices') {
      const supabase = await getSupabaseClient();
      const { data } = await supabase.from('suppliers').select('*');

      if (data) {
        suppliers = data;
      }
    }

    return {
      data,
      categories,
      brands,
      references,
      suppliers,
      newProduct,
      pageTitle
    };
  } catch (error) {
    notFound();
  }
}
