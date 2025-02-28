// dynamic for categories and brands
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { categoryBrandSubmit } from '@/lib/actions';
import { getClientImageUrl, getImageUrl, toastMsg } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, use, useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Brand, Category, itemTable, Product } from 'types';
import * as z from 'zod';
import AddProductButton from '../../components/ui/add-product';
import Link from 'next/link';
import TableClientSide from './table-components/tableClient';
import { createClient } from '@/utils/supabase/client';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';

export default function DynamicForm({
  initialData,
  pageTitle,
  type
}: {
  initialData: Category | Brand | null;
  pageTitle: string;
  type: string;
}) {
  const defaultValues = {
    title: initialData?.title || '',
    description: initialData?.description || ''
  };

  const title = type === 'categories' ? 'Category' : 'Brand';

  const formSchema = z.object({
    title: z.string().min(1, {
      message: `${title} name is required`
    }),
    description: z.string().optional()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const res = await categoryBrandSubmit(values, initialData, type);
      const entity = type === 'categories' ? 'Category' : 'Brand';

      if (res?.successNew) toast.success(toastMsg.dynamicNew(entity));
      else if (res?.successUpdate)
        toast.success(toastMsg.dynamicUpdate(entity));
      else if (res?.error) toast.error(toastMsg.error);

      if (!res?.error) router.push(`/dashboard/${type}`);
    });
  };

  const pathname = usePathname();
  const newPath = pathname.includes('new');
  const newLink = `/dashboard/products/new?${title.toLowerCase()}=${initialData?.title}`;

  const getProducts = async () => {
    const supabase = createClient();
    let data;
    const { data: productsData, error } = await supabase.from('products')
      .select(`
            *,
            categories (title),
            brands (title)
          `);
    if (error) return;

    const productsWithImg = productsData
      ? await Promise.all(
          productsData.map(async (product) => ({
            ...product,
            img_url: await getClientImageUrl(product.img_url)
          }))
        )
      : null;

    data = productsWithImg;

    return data?.reverse();
  };

  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', type],
    queryFn: getProducts,
    enabled: false // This prevents auto-fetching on component mount
  });

  return (
    <>
      <Card className='mx-auto w-full'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-left text-2xl font-bold'>
            {pageTitle}
          </CardTitle>
          {!newPath && (
            <Link href={newLink}>
              <AddProductButton />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className='space-y-8'
            >
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${title} Name`}</FormLabel>
                      <FormControl>
                        <Input placeholder={`Enter ${title}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Enter ${title.toLowerCase()} description`}
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <div className='flex gap-2'>
                    {initialData ? `Editing ` : `Adding`}
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                  </div>
                ) : initialData ? (
                  `Edit ${title}`
                ) : (
                  `Add ${title}`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div>
        <Button onClick={() => refetch()}>View Products</Button>
      </div>
      {productsData && (
        <PageContainer scrollable={false}>
          <div
            className='flex flex-1 flex-col space-y-4'
            style={{ minHeight: '400px' }}
          >
            <TableClientSide
              type={'products'}
              data={productsData as Product[]}
              total={productsData?.length as number}
            />
          </div>
        </PageContainer>
      )}
    </>
  );
}
