import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import ViewPage from '@/features/dynamic/viewPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Reference View'
};

export default async function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          {/* for references, there is no update. so, id prop will always be "new" */}
          <ViewPage type={'references'} id={'new'} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
