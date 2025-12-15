import {
  getCategoriesBrandsData,
  getDataById,
  getSupabaseClient
} from '@/lib/actions';
import { formatTitle, getImageUrl } from '@/utils/utils';
import { QueryClient } from '@tanstack/react-query';
// import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  Brand,
  Category,
  Invoice,
  Invoice_items,
  itemTable,
  Product
} from 'types';

export async function fetchViewData(
  queryClient: QueryClient,
  type: itemTable,
  id: string
) {
  try {
    // const cookieStore = await cookies();
    // const currentRole = cookieStore.get('currentRole')?.value || '';

    let data = null;
    let categories = null;
    let brands = null;
    let newProduct = type === 'products';
    let pageTitle = '';

    // if (currentRole === 'super_admin') {
    pageTitle = formatTitle(id === 'new' ? 'Add New' : 'Edit', type);
    // } else {
    // pageTitle = formatTitle('', type);
    // }

    if (id !== 'new') {
      try {
        await queryClient.prefetchQuery({
          queryKey: [type, id],
          queryFn: () => getDataById(type, id),
          staleTime: Infinity // Never refetch automatically
        });

        const fetchedData = queryClient.getQueryData<
          Invoice | Product | Category | Brand
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
        } else {
          const imageUrl = (fetchedData as Category | Brand).img
            ? await getImageUrl((fetchedData as Category | Brand).img)
            : null;

          data = {
            ...fetchedData,
            img: imageUrl
          };
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

    // if (type === 'invoices') {
    //   const supabase = await getSupabaseClient();
    //   const { data } = await supabase.from('references').select('*');

    //   if (data) {
    //   }
    // }

    return {
      data,
      categories,
      brands,
      newProduct,
      pageTitle
    };
  } catch (error) {
    notFound();
  }
}
