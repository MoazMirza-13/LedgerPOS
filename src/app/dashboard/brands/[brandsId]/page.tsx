import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import ViewPage from '@/features/dynamic/viewPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Brand View'
};

type PageProps = { params: Promise<{ brandsId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <ViewPage type={'brands'} id={params.brandsId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
