// for suppliers_ledger listing
import PageContainer from '@/components/layout/page-container';
import { fetchListingData } from '@/features/dynamic/fetchListingData';
import { Suppliers_ledger } from 'types';
import { PageContent } from '@/components/layout/page-content';
import { getDataById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import { checkUUID } from '@/utils/utils';

export const metadata = {
  title: 'Dashboard: Supplier Ledger'
};

type PageProps = { params: Promise<{ suppliersId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  if (!checkUUID(params.suppliersId)) notFound();

  const supplierData = await getDataById('suppliers', params.suppliersId);
  if (!supplierData) notFound();

  const data = await fetchListingData('suppliers_ledger', params.suppliersId);
  const items_data: Suppliers_ledger[] = data ? data : [];

  return (
    <PageContainer scrollable={false}>
      <PageContent
        title={`${items_data[0]?.name ? `Ledger of ${items_data[0]?.name}` : ``}`}
        description={`${items_data[0]?.name ? `Manage Ledger` : `Add new entries to view the Ledger`}`}
        type='suppliers_ledger'
        itemsData={items_data}
        supplierData={supplierData}
      />
    </PageContainer>
  );
}
