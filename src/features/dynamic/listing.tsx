import TableClientSide from '@/features/dynamic/table-components/tableClient';
import { itemData, itemTable } from 'types';
import { filterListingData } from './fetchListingData';

type ListingPageProps = {
  type: itemTable;
  data: itemData[];
};

export default async function ListingPage({ type, data }: ListingPageProps) {
  const { paginatedData, total_length } = filterListingData(data);

  return (
    <>
      <TableClientSide type={type} data={paginatedData} total={total_length} />
    </>
  );
}
