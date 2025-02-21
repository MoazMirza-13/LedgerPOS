'use client';
import { getDataById } from '@/lib/actions';
import { checkUUID } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// Predefined route mappings
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
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      if (routeMapping[pathname]) {
        setBreadcrumbs(routeMapping[pathname]);
        setLoading(false);
        return;
      }

      const segments = pathname.split('/').filter(Boolean);
      const types = ['brands', 'products', 'categories'];
      const type = types.find((t) => pathname.includes(`/${t}/`)) || null;
      const lastSegment = segments[segments.length - 1];
      const checkId = checkUUID(lastSegment);

      let updatedBreadcrumbs = segments.map((segment, index) => ({
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: `/${segments.slice(0, index + 1).join('/')}`
      }));

      if (checkId && type) {
        const fetchedData = await getDataById(type, lastSegment);
        if (fetchedData?.title) {
          updatedBreadcrumbs[updatedBreadcrumbs.length - 1].title =
            fetchedData.title;
        }
      }

      setBreadcrumbs(updatedBreadcrumbs);
      setLoading(false);
    };

    generateBreadcrumbs();
  }, [pathname]);

  return { breadcrumbs, loading };
}
