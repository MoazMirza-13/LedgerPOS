import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Brand, Category, Product } from '@/constants/data';
import ProductForm from '@/features/products/components/product-form';
import DynamicForm from './dynamic-form';

type ViewPage = {
  type: 'categories' | 'products' | 'brands';
  id: string;
};

export default async function ViewPage({ type, id }: ViewPage) {
  const supabase = await createClient();

  let data = null;
  let pageTitle = `Create New ${
    type === 'categories'
      ? 'Category'
      : type === 'products'
        ? 'Product'
        : 'Brand'
  }`;
  let showUploader = type === 'products';
  let categories = null;
  let brands = null;

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

    pageTitle = `Edit ${
      type === 'categories'
        ? 'category'
        : type === 'products'
          ? 'product'
          : 'brand'
    }`;
  }

  if (type === 'products') {
    const { data: fetchedCategories } = await supabase
      .from('categories')
      .select('*');
    categories = fetchedCategories;
    const { data: fetchedBrands } = await supabase.from('brands').select('*');
    brands = fetchedBrands;
  }

  return type === 'categories' || type === 'brands' ? (
    <DynamicForm
      type={type}
      initialData={data as Category | Brand}
      pageTitle={pageTitle}
    />
  ) : (
    <ProductForm
      showUploader={showUploader}
      categories={categories}
      brands={brands}
      initialData={data as Product | null}
      pageTitle={pageTitle}
    />
  );
}
