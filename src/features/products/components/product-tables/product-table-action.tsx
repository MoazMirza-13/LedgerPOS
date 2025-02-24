'use client';

import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useProductTableFilters } from './use-product-table-filters';
import { Brand, Category } from 'types';

type ProductTableActionProps = {
  categories: Category[];
  brands: Brand[];
};

export default function ProductTableAction({
  categories,
  brands
}: ProductTableActionProps) {
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
  } = useProductTableFilters();
  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey='title'
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
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

      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
