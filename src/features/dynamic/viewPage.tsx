import ProductForm from '@/features/products/components/product-form';
import DynamicForm from './dynamic-form';
import { Brand, Category, itemTable, Product } from 'types';
import { fetchViewData } from './fetchViewData';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from '@tanstack/react-query';
import { queryClientConfig } from '@/lib/tanStack-action';

type ViewPage = {
  type: itemTable;
  id: string;
};

export default async function ViewPage({ type, id }: ViewPage) {
  const queryClient = new QueryClient(queryClientConfig);

  const { data, categories, brands, showUploader, pageTitle } =
    await fetchViewData(queryClient, type, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {type === 'categories' || type === 'brands' ? (
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
      )}
    </HydrationBoundary>
  );
}
