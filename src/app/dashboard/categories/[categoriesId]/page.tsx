import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import CategoryViewPage from '@/features/categories/components/category-view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Category View'
};

type PageProps = { params: Promise<{ categoriesId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CategoryViewPage categoryId={params.categoriesId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
