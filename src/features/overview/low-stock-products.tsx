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
    products?.filter((p: Product) => getTotalQuantity(p) < 50) || [];

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
        <CardDescription>Products with quantity less than 50</CardDescription>
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
                <div
                  key={product.id}
                  className='flex gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50'
                >
                  {product.resolvedImgUrl && (
                    <div className='flex-shrink-0'>
                      <Image
                        src={product.resolvedImgUrl}
                        alt={product.title}
                        width={80}
                        height={80}
                        className='h-auto w-auto rounded-md object-cover'
                      />
                    </div>
                  )}

                  <div className='min-w-0 flex-1'>
                    <h3 className='truncate font-semibold text-foreground'>
                      {product.title}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Code: {product.product_code}
                    </p>
                    <div className='mt-2 flex items-center gap-2'>
                      <Badge variant='destructive'>
                        Qty: {getTotalQuantity(product)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
