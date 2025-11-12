// for references_ledger listing
import PageContainer from '@/components/layout/page-container';
import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { References_ledger } from 'types';
import { PageContent } from '@/components/layout/page-content';
import { getDataById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import { checkUUID } from '@/utils/utils';

export const metadata = {
  title: 'Dashboard: References Ledger'
};

type PageProps = { params: Promise<{ referencesId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  if (!checkUUID(params.referencesId)) notFound();

  const referenceData = await getDataById('references', params.referencesId);
  if (!referenceData) notFound();

  const data = await fetchListingData('references_ledger', params.referencesId);
  const items_data: References_ledger[] = data ? data : [];

  return (
    <PageContainer scrollable={false}>
      <PageContent
        title={`${items_data[0]?.name ? `Ledger of ${items_data[0]?.name}` : ``}`}
        description={`${items_data[0]?.name ? `Manage Ledger` : `Add new entries to view the Ledger`}`}
        type='references_ledger'
        itemsData={items_data}
        referenceData={referenceData}
      />
    </PageContainer>
  );
}
