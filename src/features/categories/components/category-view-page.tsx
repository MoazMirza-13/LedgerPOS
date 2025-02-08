import { notFound } from 'next/navigation';
import CategoryForm from './category-form';
import { Category } from '@/constants/data';

type TProductViewPageProps = {
  categoryId: string;
};

export default async function CategoryViewPage({
  categoryId
}: TProductViewPageProps) {
  let category = null;
  let pageTitle = 'Create New Category';

  // if (categoryId !== 'new') {
  //   const data = await fakeProducts.getProductById(Number(categoryId));
  //   category = data.category as Category;
  //   if (!category) {
  //     notFound();
  //   }
  //   pageTitle = `Edit category`;
  // }

  return <CategoryForm initialData={category} pageTitle={pageTitle} />;
}
