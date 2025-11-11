import ProductForm from '@/features/products/components/product-form';
import DynamicForm from './dynamic-form';
import {
  Brand,
  Category,
  Invoice,
  itemTable,
  Product,
  PurchasingInvoice
} from 'types';
import { fetchViewData } from './fetchViewData';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from '@tanstack/react-query';
import { queryClientConfig } from '@/lib/tanStack-action';
import InvoiceForm from '../invoices/invoice-form';
import PartnerForm from './partner-form';
import PurchasingInvoiceForm from '../invoices/purchasing-invoice-form';

type ViewPage = {
  type: itemTable;
  id: string;
};

export default async function ViewPage({ type, id }: ViewPage) {
  const queryClient = new QueryClient(queryClientConfig);

  const {
    data,
    categories,
    brands,
    references,
    suppliers,
    newProduct,
    pageTitle
  } = await fetchViewData(queryClient, type, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {(() => {
        switch (type) {
          case 'categories':
          case 'brands':
            return (
              <DynamicForm
                type={type}
                initialData={data as Category | Brand}
                pageTitle={pageTitle}
              />
            );

          case 'invoices':
            return (
              <InvoiceForm
                initialData={data as Invoice}
                pageTitle={pageTitle}
                references={references}
              />
            );
          case 'purchasing_invoices':
            return (
              <PurchasingInvoiceForm
                initialData={data as PurchasingInvoice}
                pageTitle={pageTitle}
                suppliers={suppliers}
              />
            );

          case 'references':
          case 'suppliers':
            return <PartnerForm pageTitle={pageTitle} type={type} />;

          case 'products':
            return (
              <ProductForm
                newProduct={newProduct}
                categories={categories}
                brands={brands}
                initialData={data as Product}
                pageTitle={pageTitle}
              />
            );
        }
      })()}
    </HydrationBoundary>
  );
}
