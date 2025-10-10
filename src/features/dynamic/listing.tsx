import TableClientSide from '@/features/dynamic/table-components/tableClient';
import { itemData, itemTable } from 'types';
import { filterListingData } from './fetchListingData';
import { SearchParams } from 'nuqs/server';
import RefetchKBar from '@/components/kbar/RefetchKBar';

type ListingPageProps = {
  type: itemTable;
  data: itemData[];
  searchParams: SearchParams;
};

export default async function ListingPage({
  type,
  data,
  searchParams
}: ListingPageProps) {
  const updated = searchParams.updated === 'true';

  const { paginatedData, total_length } = filterListingData(data, type);

  return (
    <>
      {updated && <RefetchKBar />}
      <TableClientSide type={type} data={paginatedData} total={total_length} />
    </>
  );
}
