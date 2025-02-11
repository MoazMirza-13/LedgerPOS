import { notFound } from 'next/navigation';
import ProductForm from './product-form';
import { createClient } from '@/utils/supabase/server';
import { Product } from '@/constants/data';

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId
}: TProductViewPageProps) {
  let product = null;
  let pageTitle = 'Create New Product';

  const supabase = await createClient();

  // Helper function (can be reused elsewhere)
  const getProductImageUrl = (imgPath: string | null) => {
    if (!imgPath) return null;

    return supabase.storage.from('product_imgs').getPublicUrl(imgPath).data
      .publicUrl;
  };

  let showUploader;
  showUploader = true;
  if (productId !== 'new') {
    const { data: fetchedProduct, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    product = {
      ...fetchedProduct,
      img_url: getProductImageUrl(fetchedProduct?.img_url)
    } as Product;

    if (!product) {
      notFound();
    }

    pageTitle = `Edit product`;
    showUploader = false;
  }

  const { data: fetchedCategories, error } = await supabase
    .from('categories')
    .select('*');

  return (
    <ProductForm
      showUploader={showUploader}
      categories={fetchedCategories}
      initialData={product}
      pageTitle={pageTitle}
    />
  );
}
