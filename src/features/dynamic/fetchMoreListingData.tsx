'use client';
import { createClient } from '@/utils/supabase/client';
import { itemTable } from 'types';
import {
  fetchListingDataShared,
  type ListingFilters
} from './fetchListingDataShared';

export async function fetchMoreListingData(
  type: itemTable,
  offset: number,
  limit: number = 900,
  id?: string,
  filters?: ListingFilters
) {
  const supabase = createClient();
  return fetchListingDataShared(supabase, type, offset, limit, id, filters);
}
