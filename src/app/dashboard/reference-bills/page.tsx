import PageContainer from '@/components/layout/page-container';
import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { itemData } from 'types';
import { PageContent } from '@/components/layout/page-content';

export const metadata = {
  title: 'Dashboard: Reference Bills'
};

export default async function Page() {
  const data = await fetchListingData('invoices');
  const items_data: itemData[] = data ? data : [];

  return (
    <PageContainer scrollable={false}>
      <PageContent
        title='Reference Bills'
        description='Manage pending bills'
        type='invoices'
        itemsData={items_data}
        reference_bills={true}
      />
    </PageContainer>
  );
}
