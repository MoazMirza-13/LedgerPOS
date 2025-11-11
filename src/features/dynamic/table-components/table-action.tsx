'use client';

import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useTableFilters } from './use-table-filters';
import { Brand, Category } from 'types';
import { usePathname } from 'next/navigation';

type TableActionProps = {
  categories?: Category[];
  brands?: Brand[];
  warehouses?: { key: string; label: string }[];
};

export default function TableAction({
  categories = [],
  brands = [],
  warehouses = []
}: TableActionProps) {
  const {
    categoriesFilter,
    setCategoriesFilter,
    brandsFilter,
    setBrandsFilter,
    setWarehousesFilter,
    warehousesFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useTableFilters();

  const pathname = usePathname();

  let searchKey = 'title';

  if (pathname.includes('/products')) {
    searchKey = 'code, title';
  } else if (pathname.includes('/invoice')) {
    searchKey = 'invoice number, customer name, date';
  } else if (
    pathname.includes('/references') ||
    pathname.includes('/suppliers')
  ) {
    searchKey = 'name';
  }

  const warehousesOptions = warehouses.map((wh) => ({
    key: wh.key,
    title: wh.label
  }));

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey={searchKey}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />

      {pathname.includes('/products') && (
        <>
          <DataTableFilterBox
            filterKey='categories'
            title='Categories'
            options={categories}
            setFilterValue={setCategoriesFilter}
            filterValue={categoriesFilter}
          />
          <DataTableFilterBox
            filterKey='brands'
            title='Brands'
            options={brands}
            setFilterValue={setBrandsFilter}
            filterValue={brandsFilter}
          />
          <DataTableFilterBox
            filterKey='warehouses'
            title='Warehouses'
            options={warehousesOptions}
            setFilterValue={setWarehousesFilter}
            filterValue={warehousesFilter}
          />
        </>
      )}

      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
