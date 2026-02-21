'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable } from '@/components/ui/table/data-table';
import { useColumns } from '@/features/dynamic/table-components/columns';
import { itemData, itemTable } from 'types';
import { parseAsString, useQueryStates } from 'nuqs';
import { fetchMoreListingData } from '../fetchMoreListingData';

interface TableClientProps {
  data: itemData[];
  type: itemTable;
}

export default function TableClientSide({
  data: initialData,
  type
}: TableClientProps) {
  // don't use the date util here
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Karachi'
  });

  const parsers = {
    q: parseAsString.withDefault(''),
    categories: parseAsString.withDefault(''),
    brands: parseAsString.withDefault(''),
    warehouses: parseAsString.withDefault(''),
    from: parseAsString.withOptions({ shallow: false }).withDefault(today),
    to: parseAsString.withOptions({ shallow: false }).withDefault(today)
  };

  const [searchParams, setSearchParams] = useQueryStates(parsers);
  const pathname = usePathname();
  const isReferenceLedger = pathname?.includes('/references/');
  const isSupplierLedger = pathname?.includes('/suppliers/');
  const isLedgerRoute = isReferenceLedger || isSupplierLedger;
  const ledgerId = useMemo(() => {
    if (!isLedgerRoute || !pathname) return undefined;
    const parts = pathname.split('/').filter(Boolean);
    return parts[parts.length - 1];
  }, [isLedgerRoute, pathname]);

  const [fullData, setFullData] = useState<itemData[]>(initialData);
  const [offset, setOffset] = useState(initialData.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.length === 900);

  useEffect(() => {
    setFullData(initialData);
    setOffset(initialData.length);
    setHasMore(initialData.length === 900);
  }, [initialData]);

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newData = await fetchMoreListingData(type, offset, 900, ledgerId, {
        q: searchParams.q,
        categories: searchParams.categories,
        brands: searchParams.brands,
        warehouses: searchParams.warehouses,
        from: searchParams.from,
        to: searchParams.to
      });
      if (newData.length < 900) setHasMore(false);
      setFullData((prev) => [...prev, ...newData]);
      setOffset((prev: number) => prev + 900);
    } catch (e) {
      // handle error if needed
    } finally {
      setLoading(false);
    }
  };

  const tableData = useMemo(() => fullData, [fullData]);

  return (
    <>
      {isLedgerRoute && (
        <div className='flex justify-center'>
          <DateRangePicker
            key={`${searchParams.from}-${searchParams.to}`}
            onUpdate={(values) => {
              if (!values.range.from || !values.range.to) return;
              const nextFrom = values.range.from.toLocaleDateString('en-CA', {
                timeZone: 'Asia/Karachi'
              });
              const nextTo = values.range.to.toLocaleDateString('en-CA', {
                timeZone: 'Asia/Karachi'
              });
              setSearchParams({ from: nextFrom, to: nextTo });
            }}
            initialDateFrom={searchParams.from || today}
            initialDateTo={searchParams.to || today}
            align='center'
            locale='en-PK'
            showCompare={false}
          />
        </div>
      )}
      <DataTable
        columns={useColumns(type)}
        data={tableData}
        onLoadMore={fetchMore}
        loading={loading}
      />
    </>
  );
}
