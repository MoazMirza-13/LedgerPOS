'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { useTableFilters } from '../dynamic/table-components/use-table-filters';
import { Product, Category, Brand } from 'types';
import { useMemo } from 'react';

interface Props {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export function LowStockProducts({ products, categories, brands }: Props) {
  const {
    categoriesFilter,
    setCategoriesFilter,
    brandsFilter,
    setBrandsFilter,
    isAnyFilterActive,
    resetFilters
  } = useTableFilters();

  const filteredProducts = useMemo(() => {
    if (!isAnyFilterActive) {
      return products;
    }

    return products.filter((product) => {
      const hasSelectedCategory =
        categoriesFilter.length === 0 ||
        (product.categories?.title &&
          categoriesFilter.includes(product.categories.title));

      const hasSelectedBrand =
        brandsFilter.length === 0 ||
        (product.brands?.title && brandsFilter.includes(product.brands.title));

      if (categoriesFilter.length > 0 && brandsFilter.length > 0) {
        return hasSelectedCategory || hasSelectedBrand;
      } else if (categoriesFilter.length > 0) {
        return hasSelectedCategory;
      } else if (brandsFilter.length > 0) {
        return hasSelectedBrand;
      }

      return true;
    });
  }, [products, categoriesFilter, brandsFilter, isAnyFilterActive]);

  return (
    <Card className='flex h-[70vh] flex-col'>
      <CardHeader>
        <div className='flex items-center gap-8'>
          <div className='flex flex-col gap-[6px]'>
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>Products with less quantity</CardDescription>
          </div>
          {/* Filters */}
          <div className='flex flex-wrap gap-4'>
            <DataTableFilterBox
              filterKey='categories'
              title='Categories'
              options={categories}
              setFilterValue={setCategoriesFilter}
              filterValue={categoriesFilter}
            />
            <DataTableFilterBox
              filterKey='brands'
              title='Brands'
              options={brands}
              setFilterValue={setBrandsFilter}
              filterValue={brandsFilter}
            />
            <DataTableResetFilter
              isFilterActive={isAnyFilterActive}
              onReset={resetFilters}
            />
          </div>
        </div>
      </CardHeader>

      {products.length > 0 && (
        <CardContent className='overflow-y-auto'>
          <div className='space-y-4'>
            {/* Product List */}
            {filteredProducts.length === 0 ? (
              <div className='py-8 text-center text-muted-foreground'>
                No low-stock products match the selected filters
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  className='flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50'
                  href={`/dashboard/products/${product.id}`}
                >
                  {product.img_url && (
                    <div className='flex-shrink-0'>
                      <Image
                        src={
                          Array.isArray(product.img_url)
                            ? (product.img_url[0] ?? '')
                            : product.img_url
                        }
                        alt='low_stock_product'
                        width={80}
                        height={80}
                        className='rounded-md object-cover'
                      />
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm'>{product.title}</p>
                    <div className='text-sm text-muted-foreground'>
                      Code:
                      <Badge variant='secondary' className='ml-1'>
                        {product.product_code}
                      </Badge>
                    </div>
                    <div className='mt-2 flex flex-col items-start gap-2'>
                      <Badge variant='outline'>Qty: {product.quantity}</Badge>
                      <Badge variant='destructive'>
                        Min: {product.min_quantity}
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
