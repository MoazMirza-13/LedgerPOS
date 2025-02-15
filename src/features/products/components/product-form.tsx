'use client';

import { FileUploader } from '@/components/file-uploader';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Brand, Category, Product } from '@/constants/data';
import { createClient } from '@/utils/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ProductSizes } from './product-sizes';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export default function ProductForm({
  initialData,
  pageTitle,
  categories,
  brands,
  showUploader
}: {
  initialData: Product | null;
  pageTitle: string;
  categories: Category[] | null;
  brands: Brand[] | null;
  showUploader: boolean;
}) {
  const defaultValues = {
    name: initialData?.title || '',
    category: initialData?.category_id || '',
    brand: initialData?.brand_id || '',
    price: initialData?.price || 0,
    description: initialData?.description || '',
    productVariants: initialData?.variants || []
  };

  // Conditional image validation
  const imageValidation = initialData
    ? z
        .any()
        .optional()
        .refine(
          (files) =>
            !files ||
            (files.length === 1 &&
              files[0].size <= MAX_FILE_SIZE &&
              ACCEPTED_IMAGE_TYPES.includes(files[0].type)),
          {
            message:
              'Max file size is 5MB. Only .jpg, .jpeg, .png, and .webp files are accepted.'
          }
        )
    : z
        .any()
        .refine((files) => files?.length === 1, 'Image is required.')
        .refine(
          (files) => files?.[0]?.size <= MAX_FILE_SIZE,
          'Max file size is 5MB.'
        )
        .refine(
          (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
          'Only .jpg, .jpeg, .png, and .webp files are accepted.'
        );

  const formSchema = z.object({
    image: imageValidation,
    name: z.string().min(1, {
      message: 'Product name is required'
    }),
    category: z.string().nullable(),
    brand: z.string().nullable(),
    price: z.coerce.number(),
    description: z.string().optional(),
    productVariants: z.array(z.string()).optional()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  const [showUploaderState, setShowUploaderState] = useState(showUploader);

  const supabase = createClient();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let imgPath;

    if (initialData) {
      if (showUploaderState && values.image?.length) {
        imgPath = await uploadFile(values?.image[0]);
      }

      const { data, error } = await supabase
        .from('products')
        .update([
          {
            title: values.name,
            price: values.price,
            description: values.description,
            category_id: values.category ? values.category : null,
            brand_id: values.brand ? values.brand : null,
            ...(imgPath && { img_url: imgPath }),
            variants: values.productVariants
          }
        ])
        .eq('id', initialData.id)
        .select();
      console.log('🚀 ~ onSubmit if ~ error:', error);
      console.log('🚀 ~ onSubmit if ~ data:', data);
    } else {
      // new
      imgPath = await uploadFile(values.image[0]);
      if (imgPath) {
        const { data, error } = await supabase
          .from('products')
          .insert([
            {
              title: values.name,
              price: values.price,
              description: values.description,
              img_url: imgPath,
              category_id: values.category ? values.category : null,
              brand_id: values.brand ? values.brand : null,
              variants: values.productVariants
            }
          ])
          .select();
        console.log('🚀 ~ onSubmit else ~ error:', error);
        console.log('🚀 ~ onSubmit else ~ data:', data);
      }
    }
  }

  async function uploadFile(file: File) {
    const imgFile = file;
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('product_imgs')
      .upload(`ns_imgs/${fileName}`, imgFile);
    if (error) {
      console.log('🚀 ~ uploadFile ~ error:', error);
    } else {
      console.log('🚀 ~ uploadFile ~ data:', data);
      return data.path;
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
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    {/* currently single img, will add multiple functionality later */}
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      {!showUploaderState ? (
                        <div className='m-auto flex w-[24%] justify-between'>
                          <Button
                            type='button'
                            onClick={() =>
                              window.open(initialData?.img_url, '_blank')
                            }
                          >
                            View Image
                          </Button>
                          <Button
                            type='button'
                            onClick={() => setShowUploaderState(true)}
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFiles={1} // currently only 1 file, will do 4 files later
                          maxSize={4 * 1024 * 1024}
                          // disabled={loading}
                          // progresses={progresses}
                          // pass the onUpload function here for direct upload
                          // onUpload={uploadFiles}
                          // disabled={isUploading}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter product name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'null' ? null : value)
                      }
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select categories' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='null'>None</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0'
                        placeholder='Enter price'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='brand'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'null' ? null : value)
                      }
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select brands' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='null'>None</SelectItem>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='productVariants'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Variants</FormLabel>
                    <ProductSizes name={field.name} />
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
                      placeholder='Enter product description'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>
              {initialData ? `Edit Product` : `Add Product`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
