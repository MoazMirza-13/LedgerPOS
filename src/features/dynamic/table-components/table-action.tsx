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
};

export default function TableAction({
  categories = [],
  brands = []
}: TableActionProps) {
  const {
    categoriesFilter,
    setCategoriesFilter,
    brandsFilter,
    setBrandsFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useTableFilters();

  const pathname = usePathname();
  const productsRoute = pathname.includes('/products');
  const searchKey = productsRoute ? 'code, title' : 'title';

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey={searchKey}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />

      {productsRoute && (
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
        </>
      )}

      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
