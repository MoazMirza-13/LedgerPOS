import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Category, Product } from '@/constants/data';
import CategoryForm from '@/features/categories/components/category-form';
import ProductForm from '@/features/products/components/product-form';

type ViewPage = {
  type: 'categories' | 'products';
  id: string;
};

export default async function ViewPage({ type, id }: ViewPage) {
  const supabase = await createClient();

  let data = null;
  let pageTitle = `Create New ${type === 'categories' ? 'Category' : 'Product'}`;
  let showUploader = type === 'products';
  let categories = null;

  if (id !== 'new') {
    const tableName = type === 'categories' ? 'categories' : 'products';
    const { data: fetchedData, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (!fetchedData) {
      notFound();
    }

    if (type === 'products') {
      data = {
        ...fetchedData,
        img_url: fetchedData.img_url
          ? supabase.storage
              .from('product_imgs')
              .getPublicUrl(fetchedData.img_url).data.publicUrl
          : null
      } as Product;
      showUploader = false;
    } else {
      data = fetchedData as Category;
    }

    pageTitle = `Edit ${type === 'categories' ? 'category' : 'product'}`;
  }

  if (type === 'products') {
    const { data: fetchedCategories } = await supabase
      .from('categories')
      .select('*');
    categories = fetchedCategories;
  }

  return type === 'categories' ? (
    <CategoryForm initialData={data as Category | null} pageTitle={pageTitle} />
  ) : (
    <ProductForm
      showUploader={showUploader}
      categories={categories}
      initialData={data as Product | null}
      pageTitle={pageTitle}
    />
  );
}
