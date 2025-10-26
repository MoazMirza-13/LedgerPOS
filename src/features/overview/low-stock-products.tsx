import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Product } from 'types';
import { getSupabaseClient } from '@/lib/actions';
import { getImageUrl } from '@/utils/utils';
import Link from 'next/link';

export async function LowStockProducts() {
  const supabase = await getSupabaseClient();
  const { data: products, error } = await supabase.from('products').select('*');

  const getTotalQuantity = (product: Product) =>
    product.quantity_in_zafarwal +
    product.quantity_in_ghaziwal +
    product.quantity_in_lhr_road +
    product.quantity_in_eidgah_road +
    product.quantity_in_mandi_tile +
    product.quantity_in_mandi_bond;

  const lowStockProducts =
    products?.filter((p: Product) => getTotalQuantity(p) < p.min_quantity) ||
    [];

  const productsWithUrls = await Promise.all(
    lowStockProducts.map(async (p) => ({
      ...p,
      resolvedImgUrl: await getImageUrl(p.img_url?.[0] || '')
    }))
  );

  return (
    <Card className='flex h-[70vh] flex-col'>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
        <CardDescription>Products with less quantity</CardDescription>
      </CardHeader>
      {!error && (
        <CardContent className='overflow-y-auto'>
          <div className='space-y-4'>
            {productsWithUrls.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>
                No low-stock products
              </div>
            ) : (
              productsWithUrls.map((product) => (
                <Link
                  key={product.id}
                  className='flex gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50'
                  href={`products/${product.id}`}
                >
                  {product.resolvedImgUrl && (
                    <div className='flex-shrink-0'>
                      <Image
                        src={product.resolvedImgUrl}
                        alt='low_stock_product'
                        width={80}
                        height={80}
                        className='h-auto w-auto rounded-md object-cover'
                      />
                    </div>
                  )}

                  <div className='min-w-0 flex-1'>
                    <p className='text-sm text-muted-foreground'>
                      Product: {product.product_code}
                    </p>
                    <div className='mt-2 flex items-center gap-2'>
                      <Badge variant='destructive'>
                        Qty: {getTotalQuantity(product)}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
