'use client';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from './ui/breadcrumb';
import { Fragment, useEffect, useState } from 'react';
import { Slash } from 'lucide-react';

export function Breadcrumbs() {
  const { breadcrumbs } = useBreadcrumbs();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // Prevent rendering until hydration is complete

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs?.map((item, index) => (
          <Fragment key={item.title}>
            {index !== breadcrumbs.length - 1 && (
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator className='hidden md:block'>
                <Slash />
              </BreadcrumbSeparator>
            )}
            {index === breadcrumbs.length - 1 && (
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
