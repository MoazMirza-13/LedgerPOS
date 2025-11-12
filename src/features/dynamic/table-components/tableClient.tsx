'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DataTable } from '@/components/ui/table/data-table';
import { useColumns } from '@/features/dynamic/table-components/columns';
import { itemData, itemTable } from 'types';
import { filterWithDate } from '@/utils/utils';

interface TableClientProps {
  data: itemData[];
  type: itemTable;
}

export default function TableClientSide({ data, type }: TableClientProps) {
  const pathname = usePathname();

  // don't use the date util here
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Karachi'
  });

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(today),
    to: new Date(today)
  });

  const tableData = useMemo(() => {
    if (
      !pathname?.includes('/references/') &&
      !pathname?.includes('/suppliers/')
    ) {
      return data;
    }

    //  only filter on ledger screens
    else {
      const filteredData = filterWithDate(data, dateRange.from, dateRange.to);
      return filteredData;
    }
  }, [data, dateRange, pathname]);

  return (
    <>
      {(pathname?.includes('/references/') ||
        pathname?.includes('/suppliers/')) && (
        <div className='flex justify-center'>
          <DateRangePicker
            onUpdate={(values) => {
              if (!values.range.from || !values.range.to) return;
              setDateRange({
                from: new Date(values.range.from),
                to: new Date(values.range.to)
              });
            }}
            initialDateFrom={today}
            initialDateTo={today}
            align='center'
            locale='en-PK'
            showCompare={false}
          />
        </div>
      )}

      <DataTable columns={useColumns(type)} data={tableData} />
    </>
  );
}
