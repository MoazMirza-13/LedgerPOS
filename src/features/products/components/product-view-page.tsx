import { fakeProducts } from '@/constants/mock-api';
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

  // if (productId !== 'new') {
  //   const data = await fakeProducts.getProductById(Number(productId));
  //   product = data.product as Product;
  //   if (!product) {
  //     notFound();
  //   }
  //   pageTitle = `Edit Product`;
  // }

  const supabase = await createClient();

  const { data: fetchedCategories, error } = await supabase
    .from('categories')

    .select('*');

  return (
    <ProductForm
      categories={fetchedCategories}
      initialData={product}
      pageTitle={pageTitle}
    />
  );
}
