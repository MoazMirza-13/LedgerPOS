import TableClientSide from '@/features/dynamic/table-components/tableClient';
import { itemData, itemTable } from 'types';
import { filterListingData } from './fetchListingData';
import { SearchParams } from 'nuqs/server';
// import RefetchKBar from '@/components/kbar/RefetchKBar';

type ListingPageProps = {
  type: itemTable;
  data: itemData[];
  searchParams: SearchParams;
  reference_bills?: boolean | string;
};

export default async function ListingPage({
  type,
  data,
  searchParams,
  reference_bills
}: ListingPageProps) {
  // const updated = searchParams.updated === 'true';

  const { filteredData } = filterListingData(
    data,
    type,
    reference_bills ?? false
  );

  return (
    <>
      {/* {updated && <RefetchKBar />} */}
      <TableClientSide type={type} data={filteredData} />
    </>
  );
}
