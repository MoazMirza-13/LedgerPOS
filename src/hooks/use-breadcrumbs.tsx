'use client';
import { useItemQuery } from '@/lib/tanStack-action';
import { checkUUID } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/products': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Products', link: '/dashboard/products' }
  ],
  '/dashboard/categories': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Categories', link: '/dashboard/categories' }
  ],
  '/dashboard/brands': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Brands', link: '/dashboard/brands' }
  ]
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Memoized values to prevent unnecessary recalculations
  const { type, id, isDynamicRoute } = useMemo(() => {
    const types = ['brands', 'products', 'categories'];
    const lastSegment = segments[segments.length - 1] || '';
    const type = types.find((t) => pathname.includes(`/${t}/`)) || '';
    const checkId = checkUUID(lastSegment);

    return {
      type,
      id: checkId ? lastSegment : '',
      isDynamicRoute: checkId && !!type
    };
  }, [pathname, segments]);

  // Only fetch data when we have a valid dynamic route
  const { data: dynamicData, isLoading } = useItemQuery(type, id);

  // Generate breadcrumbs with memoization
  const breadcrumbs = useMemo(() => {
    // Return predefined routes immediately
    if (routeMapping[pathname]) return routeMapping[pathname];

    return segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const fullPath = `/${segments.slice(0, index + 1).join('/')}`;

      // Handle dynamic segment replacement
      if (isLast && isDynamicRoute) {
        return {
          title:
            !isLoading && dynamicData?.title && !checkUUID(dynamicData.title)
              ? dynamicData.title
              : '',
          link: fullPath
        };
      }

      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: fullPath
      };
    });
  }, [pathname, segments, isDynamicRoute, dynamicData]);

  return {
    breadcrumbs
  };
}
