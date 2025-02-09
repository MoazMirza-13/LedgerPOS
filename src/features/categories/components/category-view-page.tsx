import { notFound } from 'next/navigation';
import CategoryForm from './category-form';
import { Category } from '@/constants/data';
import { createClient } from '@/utils/supabase/server';

type TProductViewPageProps = {
  categoryId: string;
};

export default async function CategoryViewPage({
  categoryId
}: TProductViewPageProps) {
  let category = null;
  let pageTitle = 'Create New Category';

  if (categoryId !== 'new') {
    const supabase = await createClient();

    const { data: fetchedCategory, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    category = fetchedCategory as Category;
    if (!category) {
      notFound();
    }
    pageTitle = `Edit category`;
  }

  return <CategoryForm initialData={category} pageTitle={pageTitle} />;
}
