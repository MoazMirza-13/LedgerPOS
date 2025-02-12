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
import { createClient } from '@/utils/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
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
    title: z.string().min(2, {
      message: `${title} name must be at least 2 characters.`
    }),
    description: z.string().min(1, {
      message: 'Description must be at least 1 characters.'
    })
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = await createClient();
    if (!initialData) {
      const { data, error } = await supabase
        .from(type)
        .insert([{ title: values.title, description: values.description }])
        .select();
    } else {
      const { data, error } = await supabase
        .from(type)
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
            <Button type='submit'>
              {initialData ? `Edit ${title}` : `Add ${title}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
