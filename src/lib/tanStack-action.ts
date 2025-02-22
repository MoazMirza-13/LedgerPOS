import { getDataById } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';

export function useItemQuery(type: string, id: string) {
  return useQuery({
    queryKey: [type, id], // Must match prefetch key
    queryFn: () => getDataById(type, id),
    enabled: !!type && !!id // Prevent query when invalid
  });
}

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false
    }
  }
};
