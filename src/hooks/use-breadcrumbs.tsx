'use client';

import { checkUUID } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/product': [
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
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const link = path;

      let title = '';
      title = segment.charAt(0).toUpperCase() + segment.slice(1);
      const checkId = checkUUID(title);

      if (checkId) {
        console.log('yes');
        const types = ['brands', 'products', 'categories'];
        const type = types.find((t) => pathname.includes(`/${t}/`)) || null;
        console.log('🚀 ~ returnsegments.map ~ type:', type);
      }

      console.log('🚀 ~  ~ title:', title);
      console.log('🚀 ~  ~ link:', link);
      return {
        title,
        link
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
