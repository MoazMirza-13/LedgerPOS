'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export function useProductTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault('')
  );

  const [categoriesFilter, setCategoriesFilter] = useQueryState(
    'categories',
    searchParams.categories.withOptions({ shallow: false }).withDefault('')
  );

  const [brandsFilter, setBrandsFilter] = useQueryState(
    'brands',
    searchParams.brands.withOptions({ shallow: false }).withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setCategoriesFilter(null);
    setBrandsFilter(null);
    setPage(1);
  }, [setSearchQuery, setCategoriesFilter, setPage, setBrandsFilter]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!categoriesFilter || !!brandsFilter;
  }, [searchQuery, categoriesFilter, brandsFilter]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
    categoriesFilter,
    setCategoriesFilter,
    brandsFilter,
    setBrandsFilter
  };
}
