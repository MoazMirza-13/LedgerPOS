import ProductForm from '@/features/products/components/product-form';
import DynamicForm from './dynamic-form';
import { Brand, Category, itemTable, Product } from 'types';
import { fetchViewData } from './fetchViewData';

type ViewPage = {
  type: itemTable;
  id: string;
};

export default async function ViewPage({ type, id }: ViewPage) {
  const { data, categories, brands, showUploader, pageTitle } =
    await fetchViewData(type, id);

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
      initialData={data as Product}
      pageTitle={pageTitle}
    />
  );
}
