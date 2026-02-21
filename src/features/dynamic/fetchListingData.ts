import { createClient } from '@/utils/supabase/server';
import { itemTable } from 'types';
import {
  fetchListingDataShared,
  type ListingFilters
} from './fetchListingDataShared';

type FetchListingDataArgs = {
  type: itemTable;
  id?: string;
  offset?: number;
  limit?: number;
  filters?: ListingFilters | Record<string, string | string[] | undefined>;
};

export async function fetchListingData(args: itemTable | FetchListingDataArgs) {
  const {
    type,
    id,
    offset = 0,
    limit = 10,
    filters
  } = typeof args === 'string' ? { type: args } : args;
  const supabase = await createClient();
  const normalizeFilterValue = (
    value: string | string[] | null | undefined
  ): string | null => {
    if (!value) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
  };

  const normalizedFilters: ListingFilters | undefined = filters
    ? {
        q: normalizeFilterValue(filters.q),
        categories: normalizeFilterValue(filters.categories),
        brands: normalizeFilterValue(filters.brands),
        warehouses: normalizeFilterValue(filters.warehouses),
        from: normalizeFilterValue(filters.from),
        to: normalizeFilterValue(filters.to)
      }
    : undefined;

  return fetchListingDataShared(
    supabase,
    type,
    offset,
    limit,
    id,
    normalizedFilters
  );
}
