import PageContainer from '@/components/layout/page-container';
import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { itemData } from 'types';
import { PageContent } from '@/components/layout/page-content';

export const metadata = {
  title: 'Dashboard: Reference Bills'
};

type PageProps = { params: Promise<{ reference: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  const data = await fetchListingData('invoices');
  const items_data: itemData[] = data ? data : [];

  return (
    <PageContainer scrollable={false}>
      <PageContent
        title='Reference Bills'
        description={`Manage ${params.reference} pending bills`}
        type='invoices'
        itemsData={items_data}
        reference_bills={params.reference}
      />
    </PageContainer>
  );
}
