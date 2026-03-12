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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { productSubmit } from '@/lib/actions';
import { LoaderCircle, X, Upload } from 'lucide-react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { imageUpload, toastMsg } from '@/utils/utils';
import { toast } from 'sonner';
import { Brand, Category, Product } from 'types';
import Image from 'next/image';
import { useRef } from 'react';
import RoleGate from '@/components/role-gate/RoleGateClient';
import { useRole } from '@/context/RoleContext';
import { Textarea } from '@/components/ui/textarea';
import { ProductVariants } from './product-variants';
import { Switch } from '@/components/ui/switch';

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
  newProduct
}: {
  initialData: Product | null;
  pageTitle: string;
  categories: Category[] | null;
  brands: Brand[] | null;
  newProduct: boolean;
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
    image: undefined,
    category: category
      ? String(categoryIdFromURL)
      : initialData?.category_id || '',
    brand: brand ? String(brandIdFromURL) : initialData?.brand_id || '',
    costPrice: initialData?.cost_price || 0,
    sellingPrice: initialData?.selling_price || 0,
    // productCode: initialData?.product_code || '',
    productTitle: initialData?.title || '',
    minQuantity: initialData?.min_quantity || 0,
    quantity: initialData?.quantity || 0,
    productVariants: initialData?.variants || [],
    inStock: initialData?.in_stock || false,
    description: initialData?.description || ''
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
        .array(z.any())
        .nullable()
        .refine(
          (files) => files !== null && files.length > 0,
          'Image is required.'
        )
        .refine(
          (files) =>
            files === null ||
            (files.length <= 4 &&
              files.every(
                (file: File) =>
                  file.size <= MAX_FILE_SIZE &&
                  ACCEPTED_IMAGE_TYPES.includes(file.type)
              )),
          'Each image must be under 5MB and be .jpg, .jpeg, .png, or .webp.'
        );

  const formSchema = z.object({
    image: imageValidation,
    category: z.string().nullable(),
    brand: z.string().nullable(),
    costPrice: z.coerce.number(),
    sellingPrice: z.coerce.number(),
    productTitle: z.string().min(1, {
      message: 'Product Title is required'
    }),
    // productCode: z.string().min(1, {
    //   message: 'Product Code is required'
    // }),
    minQuantity: z.coerce.number(),
    quantity: z.coerce.number(),
    productVariants: z.array(z.string()).optional(),
    inStock: z.boolean(),
    description: z.string()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currentRole = useRole();
  const { isDirty } = form.formState;

  const [imageSlots, setImageSlots] = useState<(string | File | null)[]>(() => {
    // Initialize with existing images or empty slots
    const existingImages = initialData?.img_url || [];
    const slots = new Array(4).fill(null);
    existingImages.forEach((url, index) => {
      if (index < 4) slots[index] = url;
    });
    return slots;
  });

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleIndividualImageUpload = (index: number, file: File) => {
    if (file && file.type.startsWith('image/')) {
      const newSlots = [...imageSlots];
      newSlots[index] = file;
      setImageSlots(newSlots);

      // Update form field with current files
      const currentFiles = newSlots.filter(
        (slot) => slot instanceof File
      ) as File[];
      form.setValue('image', currentFiles, { shouldDirty: true });
    }
  };

  const handleIndividualImageRemove = (index: number) => {
    const newSlots = [...imageSlots];
    newSlots[index] = null;
    setImageSlots(newSlots);

    // Update form field with remaining files
    const currentFiles = newSlots.filter(
      (slot) => slot instanceof File
    ) as File[];
    form.setValue('image', currentFiles, { shouldDirty: true });
  };

  const handleIndividualImageReplace = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const getImagePreviewUrl = (slot: string | File | null): string => {
    if (!slot) return '';
    if (typeof slot === 'string') return slot; // existing URL
    const url = URL.createObjectURL(slot); // new file
    return url;
  };

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      // Handle images - only upload new files, keep existing URLs
      const imgPaths: string[] = [];
      let hasImgError = false;

      for (let i = 0; i < imageSlots.length; i++) {
        const slot = imageSlots[i];
        if (!slot) continue; // skip empty slots

        if (typeof slot === 'string') {
          // Existing image URL, keep as is
          imgPaths.push(slot);
        } else if (slot instanceof File) {
          // New file, upload it
          const result = await imageUpload(slot, 'product_imgs');
          if (typeof result === 'string') {
            imgPaths.push(result);
          } else {
            hasImgError = true;
            break;
          }
        }
      }

      if (hasImgError) {
        toast.error(toastMsg.imageUploadError);
        return;
      }

      if (values.costPrice > values.sellingPrice) {
        toast.error(toastMsg.error);
        return;
      }

      // submit fn
      const { image, ...cleanValues } = values; // not using `image` in submit fn anymore
      const res = await productSubmit(cleanValues, initialData, imgPaths);
      const entity = 'Product';

      if (res?.successNew) toast.success(toastMsg.dynamicNew(entity));
      else if (res?.successUpdate)
        toast.success(toastMsg.dynamicUpdate(entity));
      else if (res?.error) toast.error(toastMsg.error);

      if (!res?.error) {
        router.push(`/dashboard/products?updated=true`); // param for nestedData in KBar
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
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                          {Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index} className='relative aspect-[1.5]'>
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[index] = el;
                                }}
                                type='file'
                                accept='image/*'
                                className='hidden'
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file)
                                    handleIndividualImageUpload(index, file);
                                }}
                              />

                              {imageSlots[index] ? (
                                <CardContent className='group relative h-full p-0'>
                                  <Image
                                    src={
                                      getImagePreviewUrl(imageSlots[index]) ||
                                      'null'
                                    }
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    loading='lazy'
                                    className='rounded-lg object-contain'
                                    sizes='(max-width: 768px) 100vw, 110px'
                                  />
                                  <RoleGate allow='super_admin'>
                                    <div className='absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                                      <Button
                                        type='button'
                                        size='sm'
                                        variant='secondary'
                                        onClick={() =>
                                          handleIndividualImageReplace(index)
                                        }
                                      >
                                        <Upload className='h-4 w-4' />
                                      </Button>
                                      <Button
                                        type='button'
                                        size='sm'
                                        variant='destructive'
                                        onClick={() =>
                                          handleIndividualImageRemove(index)
                                        }
                                      >
                                        <X className='h-4 w-4' />
                                      </Button>
                                    </div>
                                  </RoleGate>

                                  {/* Show indicator for new vs existing */}
                                  {!newProduct && (
                                    <div className='absolute right-2 top-2'>
                                      <div
                                        className={`h-2 w-2 rounded-full ${
                                          typeof imageSlots[index] === 'string'
                                            ? 'bg-blue-500'
                                            : 'bg-green-500'
                                        }`}
                                      />
                                    </div>
                                  )}
                                </CardContent>
                              ) : (
                                <CardContent
                                  className='flex h-full cursor-pointer flex-col items-center justify-center rounded-[11px] border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-gray-400'
                                  onClick={() => {
                                    if (currentRole === 'super_admin')
                                      fileInputRefs.current[index]?.click();
                                  }}
                                >
                                  <Upload className='mb-2 h-8 w-8 text-gray-400' />
                                  <p className='text-center text-sm text-gray-500'>
                                    Click to upload
                                  </p>
                                  <p className='mt-1 text-center text-xs text-gray-400'>
                                    Up to 4MB
                                  </p>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='productTitle'
                disabled={currentRole !== 'super_admin'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter product title' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name='productCode'
                disabled={currentRole !== 'super_admin'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Code</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter product code' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <RoleGate allow='super_admin'>
                <FormField
                  control={form.control}
                  name='costPrice'
                  disabled={currentRole !== 'super_admin'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0'
                          placeholder='Enter cost price'
                          {...field}
                          value={
                            field.value === 0 && !initialData ? '' : field.value
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </RoleGate>
              <FormField
                control={form.control}
                name='sellingPrice'
                disabled={currentRole !== 'super_admin'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0'
                        placeholder='Enter selling price'
                        {...field}
                        value={
                          field.value === 0 && !initialData ? '' : field.value
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='brand'
                disabled={currentRole !== 'super_admin'}
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
                        <SelectTrigger disabled={currentRole !== 'super_admin'}>
                          <SelectValue placeholder='Select brands' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-60 overflow-y-auto'>
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
                        <SelectTrigger disabled={currentRole !== 'super_admin'}>
                          <SelectValue placeholder='Select categories' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-60 overflow-y-auto'>
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
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='quantity'
                disabled={currentRole !== 'super_admin'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0'
                        placeholder='Enter quantity'
                        {...field}
                        value={
                          field.value === 0 && !initialData ? '' : field.value
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='minQuantity'
                disabled={currentRole !== 'super_admin'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0'
                        placeholder='Enter min quantity'
                        {...field}
                        value={
                          field.value === 0 && !initialData ? '' : field.value
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name='productVariants'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Variants</FormLabel>
                    <ProductVariants name={field.name} />
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>
            {/* <FormField
              control={form.control}
              name='inStock'
              render={({ field }) => (
                <FormItem className='!mt-3'>
                  <FormLabel>In-Stock Status</FormLabel>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>
                      {field.value ? '✅' : '❌'}
                    </span>
                    <Switch
                      id='stockStatus'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={currentRole !== 'super_admin'}
                      className='data-[state=checked]:bg-green-600'
                    />
                    <span className='text-sm text-gray-400'>
                      {field.value ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name='description'
              disabled={currentRole !== 'super_admin'}
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
            <RoleGate allow='super_admin'>
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
            </RoleGate>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
