'use client';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { kbarActions } from './kbar-actions';
import { createClient } from '@/utils/supabase/client';
import { Product } from 'types';

export default function KBar({ children }: { children: React.ReactNode }) {
  const [apiData, setApiData] = useState<Product[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router]
  );

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: fetchedData, error } = await supabase
        .from('products')
        .select('*');

      if (fetchedData) setApiData(fetchedData);
    };

    fetchData();
  }, [pathname]);

  // These action are for the navigations, account features
  const actions = useMemo(
    () => kbarActions(navigateTo, apiData),
    [navigateTo, apiData]
  );

  return (
    <KBarProvider key={actions.length} actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='scrollbar-hide fixed inset-0 z-[99999] bg-black/80 !p-0 backdrop-blur-sm'>
          <KBarAnimator className='relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border bg-background text-foreground shadow-lg'>
            <div className='bg-background'>
              <div className='border-x-0 border-b-2'>
                <KBarSearch className='w-full border-none bg-background px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0' />
              </div>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
