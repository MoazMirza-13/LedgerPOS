'use client';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { kbarActions } from './kbar-actions';
import { createClient } from '@/utils/supabase/client';
import { nestedArray, Product } from 'types';
import { getClientImageUrl } from '@/lib/utils';

export default function KBar({ children }: { children: React.ReactNode }) {
  const [apiData, setApiData] = useState<nestedArray>({
    products: [],
    categories: [],
    brands: []
  });

  const router = useRouter();

  const navigateTo = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router]
  );

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_nested_data');

      if (data) {
        const productsWithImg = data
          ? await Promise.all(
              data.products.map(async (product: Product) => ({
                ...product,
                img_url: await getClientImageUrl(product.img_url)
              }))
            )
          : null;
        const updatedData = {
          ...data,
          products: productsWithImg
        };
        setApiData(updatedData ? updatedData : []);
      }
    };

    fetchData();
  }, []);

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
