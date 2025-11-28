import { LowStockProducts } from '@/features/overview/low-stock-products';
import PageContainer from '@/components/layout/page-container';
import { getCategoriesBrandsData } from '@/lib/actions';
import { Product } from 'types';
import { getImageUrl } from '@/utils/utils';
import { fetchListingData } from '@/features/dynamic/fetchListingData';

export default async function Page() {
  const products = await fetchListingData('products');

  const categoryBrandData = await getCategoriesBrandsData();
  const categories = categoryBrandData ? categoryBrandData[0].categories : [];
  const brands = categoryBrandData ? categoryBrandData[0].brands : [];

  const lowStockProducts =
    products?.filter((p: Product) => p.quantity < p.min_quantity) || [];

  const productsWithUrls = await Promise.all(
    lowStockProducts.map(async (p) => ({
      ...p,
      img_url: await getImageUrl(p.img_url?.[0] || '')
    }))
  );
  return (
    <PageContainer scrollable>
      <div className='w-full'>
        <main className='min-h-screen bg-background'>
          <div className='space-y-8'>
            <div>
              <h1 className='mb-2 text-3xl font-bold text-foreground'>
                Dashboard
              </h1>
              <p className='text-muted-foreground'>
                Monitor low-stock products
              </p>
            </div>

            <div className='mx-auto grid grid-cols-1 gap-8 lg:grid-cols-1'>
              <LowStockProducts
                products={productsWithUrls}
                categories={categories}
                brands={brands}
              />
            </div>
          </div>
        </main>
      </div>
    </PageContainer>
  );
}
