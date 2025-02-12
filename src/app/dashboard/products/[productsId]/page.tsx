import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import ViewPage from '@/features/dynamic/viewPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Product View'
};

type PageProps = { params: Promise<{ productsId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <ViewPage type={'products'} id={params.productsId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
