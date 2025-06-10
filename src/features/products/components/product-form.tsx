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
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ProductVariants } from './product-variants';
import { productSubmit } from '@/lib/actions';
import { LoaderCircle } from 'lucide-react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { imageUpload, toastMsg } from '@/lib/utils';
import { toast } from 'sonner';
import { Brand, Category, Product } from 'types';
import { useQueryClient } from '@tanstack/react-query';

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
  const searchParams = useSearchParams();
  const brand = searchParams.get('brand');
  const category = searchParams.get('category');

  if (
    (brand && !brands?.some((b) => b.title === brand)) ||
    (category && !categories?.some((c) => c.title === category))
  ) {
    notFound();
  }

  const brandIdFromURL = brands?.find((b) => b.title === brand)?.id || '';

  const categoryIdFromURL =
    categories?.find((c) => c.title === category)?.id || '';

  const defaultValues = {
    image: null,
    name: initialData?.title || '',
    category: category
      ? String(categoryIdFromURL)
      : initialData?.category_id || '',
    brand: brand ? String(brandIdFromURL) : initialData?.brand_id || '',
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
            (Array.isArray(files) &&
              files.length <= 4 &&
              files.every(
                (file) =>
                  file.size <= MAX_FILE_SIZE &&
                  ACCEPTED_IMAGE_TYPES.includes(file.type)
              )),
          {
            message:
              'You can upload up to 4 images. Each must be under 5MB and be .jpg, .jpeg, .png, or .webp.'
          }
        )
    : z
        .any()
        .refine(
          (files) =>
            Array.isArray(files) && files.length > 0 && files.length <= 4,
          'You must upload between 1 and 4 images.'
        )
        .refine(
          (files) =>
            files.every(
              (file: File) =>
                file.size <= MAX_FILE_SIZE &&
                ACCEPTED_IMAGE_TYPES.includes(file.type)
            ),
          'Each image must be under 5MB and be .jpg, .jpeg, .png, or .webp.'
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

  const { isDirty } = form.formState;

  const [showUploaderState, setShowUploaderState] = useState(showUploader);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    // handle images
    if (!values.image?.length) return;
    const files = Array.from(values.image as FileList);
    const uploadedImages: (string | { error: any })[] = [];
    let imgPaths: string[] = [];

    for (const file of files) {
      const result = await imageUpload(file);
      uploadedImages.push(result);
    }

    const hasImgError = uploadedImages.some(
      (result) => typeof result !== 'string'
    );
    if (hasImgError) {
      toast.error(toastMsg.imageUploadError);
      return;
    }

    imgPaths = uploadedImages as string[];

    // submit fn
    startTransition(async () => {
      const { image, ...cleanValues } = values; // not using `image` in submit fn anymore

      const res = await productSubmit(
        cleanValues,
        initialData,
        showUploaderState,
        imgPaths
      );
      if (res?.successNew) toast.success(toastMsg.newProduct);
      else if (res?.successUpdate) toast.success(toastMsg.updateProduct);
      else if (res?.error) toast.error(toastMsg.error);

      if (!res?.error) {
        queryClient.invalidateQueries({ queryKey: ['nestedData'] });
        router.push(`/dashboard/products`);
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
                              window.open(initialData?.img_url[0], '_blank')
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
                          maxFiles={4} // currently only 1 file, will do 4 files later
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
                    <ProductVariants name={field.name} />
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
            <Button type='submit' disabled={isPending || !isDirty}>
              {isPending ? (
                <div className='flex gap-2'>
                  {initialData ? 'Editing' : 'Adding'}
                  <LoaderCircle className='h-5 w-5 animate-spin' />
                </div>
              ) : initialData ? (
                'Edit Product'
              ) : (
                'Add Product'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
