import { LowStockProducts } from '@/features/overview/low-stock-products';
import PageContainer from '@/components/layout/page-container';
import { getCategoriesBrandsData } from '@/lib/actions';
import { Product } from 'types';
import { getImageUrl, getTotalQuantity } from '@/utils/utils';
import { fetchListingData } from '@/features/dynamic/fetchListingData';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const PAGE_SIZE = 900;
  let offset = 0;
  let fetchedCount = 0;
  const products: Product[] = [];

  do {
    const batch = (await fetchListingData({
      type: 'products',
      offset,
      limit: PAGE_SIZE,
      filters: searchParams
    })) as Product[];

    products.push(...batch);
    fetchedCount = batch.length;
    offset += PAGE_SIZE;
  } while (fetchedCount === PAGE_SIZE);

  const categoryBrandData = await getCategoriesBrandsData();
  const categories = categoryBrandData ? categoryBrandData[0].categories : [];
  const brands = categoryBrandData ? categoryBrandData[0].brands : [];

  const lowStockProducts = products.filter(
    (p: Product) => getTotalQuantity(p) < p.min_quantity
  );

  const productsWithUrls = await Promise.all(
    lowStockProducts.map(async (p) => {
      const url = await getImageUrl(p.img_url?.[0] || '');
      return {
        ...p,
        img_url: url ? [url] : []
      };
    })
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
