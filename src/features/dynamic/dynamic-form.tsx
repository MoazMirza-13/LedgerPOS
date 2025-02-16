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
import { Brand, Category } from '@/constants/data';
import { categoryBrandSubmit } from '@/utils/supaClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
      const error = await categoryBrandSubmit(values, initialData, type);
      if (!error) {
        router.push(`/dashboard/${type}`);
      }
    });
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
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
  );
}
