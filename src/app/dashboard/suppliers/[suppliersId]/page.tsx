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

type PageProps = {
  params: Promise<{ suppliersId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const normalize = (
    value: string | string[] | undefined
  ): string | undefined => (Array.isArray(value) ? value[0] : value);
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Karachi'
  });
  const filters = {
    ...searchParams,
    from: normalize(searchParams.from) || today,
    to: normalize(searchParams.to) || today
  };
  if (!checkUUID(params.suppliersId)) notFound();

  const supplierData = await getDataById('suppliers', params.suppliersId);
  if (!supplierData) notFound();

  const data = await fetchListingData({
    type: 'suppliers_ledger',
    id: params.suppliersId,
    limit: 900,
    filters
  });
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
