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
import { Category } from '@/constants/data';
import { createClient } from '@/utils/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Category name must be at least 2 characters.'
  }),
  description: z.string().min(1, {
    message: 'Description must be at least 1 characters.'
  })
});

export default function CategoryForm({
  initialData,
  pageTitle
}: {
  initialData: Category | null;
  pageTitle: string;
}) {
  const defaultValues = {
    title: initialData?.title || '',
    description: initialData?.description || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = await createClient();
    if (!initialData) {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ title: values.title, description: values.description }])
        .select();
    } else {
      const { data, error } = await supabase
        .from('categories')
        .update([{ title: values.title, description: values.description }])
        .eq('id', initialData.id)
        .select();
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter category' {...field} />
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
                      placeholder='Enter category description'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>
              {initialData ? `Edit Category` : `Add Category`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
