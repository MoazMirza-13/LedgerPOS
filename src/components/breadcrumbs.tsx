'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from './ui/breadcrumb';
import { Fragment } from 'react';
import { Slash } from 'lucide-react';

export function Breadcrumbs() {
  const { breadcrumbs, loading } = useBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {loading ? (
          <Fragment>
            <Skeleton className='h-6 w-[250px] rounded-md bg-gray-200' />
          </Fragment>
        ) : (
          breadcrumbs?.map((item, index) => (
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
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
