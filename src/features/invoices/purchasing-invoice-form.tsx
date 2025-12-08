'use client';

import { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Trash2, Plus } from 'lucide-react';
import {
  getMaxInvoiceNumber,
  getProductByCode,
  purchasingInvoiceSubmit
} from '@/lib/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { warehouses } from '@/constants/data';
import { toast } from 'sonner';
import { toastMsg } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { Product, PurchasingInvoice, Supplier } from 'types';

export default function PurchasingInvoiceForm({
  initialData,
  suppliers,
  pageTitle,
  products
}: {
  initialData: PurchasingInvoice;
  suppliers: Supplier[] | null;
  pageTitle: string;
  products: Product[] | null;
}) {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const warehouseQtySchema = z.record(z.string(), z.coerce.number().min(0));

  const itemSchema = z.object({
    type: z.enum(['product', 'optional']).default('product'),
    product_code: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(1),
    warehouse_distribution: warehouseQtySchema.optional(),
    product: z.any().optional(),
    optional_item: z.string().optional()
  });

  const formSchema = z.object({
    supplier: z
      .string()
      .transform((v) => (v === '' ? null : v))
      .nullable()
      .optional(),
    purchasing_items: z.array(itemSchema).min(1)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: initialData?.supplier || null,
      purchasing_items: initialData?.purchasing_invoice_items || []
    }
  });

  const { control, handleSubmit, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchasing_items'
  });

  const items = watch('purchasing_items');

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const totalQty = item.warehouse_distribution
        ? Object.values(item.warehouse_distribution).reduce(
            (a, b) => a + (Number(b) || 0),
            0
          )
        : 1; // optional items count as 1

      return sum + totalQty * (Number(item.price) || 0);
    }, 0);
  };

  //todo: refactor and remove `handleGetProduct` logic as now we are getting all products
  const handleGetProduct = async (index: number) => {
    if (!items[index].product_code) return;
    const product = await getProductByCode(items[index].product_code);
    if (!product) {
      toast.error('Product not found');
      return;
    }
    form.setValue(`purchasing_items.${index}.product`, product);
    if (!items[index].price) {
      form.setValue(`purchasing_items.${index}.price`, product.cost_price || 0);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      // Check for duplicate product codes
      const productCodes = values.purchasing_items.map(
        (item) => item.product_code
      );
      const hasDuplicate = productCodes.some(
        (code, idx) => productCodes.indexOf(code) !== idx
      );

      if (hasDuplicate) {
        toast.error(toastMsg.error);
        return;
      }
      const totalPrice = calculateTotal();
      const maxNum = await getMaxInvoiceNumber('purchasing_invoices');
      const newInvoiceNumber = maxNum + 1;

      const payload = {
        supplier: values.supplier || null,
        total_price: totalPrice,
        invoice_number: newInvoiceNumber,
        purchasing_invoice_items: values.purchasing_items.map((item) => ({
          product_code: item.product_code,
          description: item.description,
          price: item.price,
          warehouse_distribution: item.warehouse_distribution,
          optional_item: item.optional_item
        }))
      };

      const res = await purchasingInvoiceSubmit(payload);
      const entity = 'Purchase Invoice';

      if (res?.success) {
        toast.success(toastMsg.dynamicNew(entity));
        router.push('/dashboard/purchasing-invoices');
      } else toast.error(toastMsg.error);
    });
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='mb-4 text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            {/* Supplier Info */}
            <div className='md:w-[50%] lg:w-[25%]'>
              <h2 className='mb-2 text-xl font-semibold text-foreground'>
                Supplier
              </h2>
              <FormField
                control={control}
                name='supplier'
                render={({ field }) => (
                  <FormItem>
                    <Select
                      disabled={!!initialData}
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Choose supplier' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id!}
                            className='cursor-pointer'
                          >
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items */}
            <div className='grid'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-foreground'>
                  Purchased Items
                </h2>
                <div className='flex flex-col gap-2 md:flex-row'>
                  {/* Add Optional Item */}
                  <Button
                    type='button'
                    disabled={!!initialData}
                    onClick={() =>
                      append({
                        type: 'optional',
                        optional_item: '',
                        description: '',
                        price: 0
                      })
                    }
                    variant='outline'
                    className='gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Add Optional Item
                  </Button>
                  {/* Add Product Item */}
                  <Button
                    type='button'
                    disabled={!!initialData}
                    onClick={() =>
                      append({
                        type: 'product',
                        product_code: '',
                        description: '',
                        price: 0,
                        warehouse_distribution: {}
                      })
                    }
                    className='gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className='overflow-x-auto rounded-lg border'>
                <fieldset disabled={!!initialData}>
                  <table className='w-max lg:w-full'>
                    <thead>
                      <tr className='border-b bg-muted'>
                        <th className='w-[15%] px-4 py-3 text-left text-sm font-semibold'>
                          Product
                        </th>
                        <th className='w-[13%] px-4 py-3 text-left text-sm font-semibold'>
                          Description
                        </th>
                        {warehouses.map((wh) => (
                          <th
                            key={wh.key}
                            className='px-4 py-3 text-center text-sm font-semibold'
                          >
                            {wh.label}
                          </th>
                        ))}
                        <th className='w-[10%] px-4 py-3 text-sm font-semibold'>
                          Price
                        </th>
                        <th className='px-4 py-3 text-right text-sm font-semibold'>
                          Total
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => {
                        const dist = items[index].warehouse_distribution || {};
                        const totalQty = Object.values(dist).reduce(
                          (a, b) => a + (Number(b) || 0),
                          0
                        );
                        return (
                          <tr
                            key={field.id}
                            className='border-b hover:bg-muted/50'
                          >
                            <td className='px-4 py-3'>
                              <div
                                className={`flex gap-2 ${
                                  items[index].product
                                    ? 'lg:w-[125px]'
                                    : 'w-[30rem]'
                                }`}
                              >
                                {/* type product */}
                                {(items[index].type === 'product' ||
                                  items[index].product_code) && (
                                  <>
                                    <FormField
                                      control={control}
                                      name={`purchasing_items.${index}.product_code`}
                                      render={({ field }) => (
                                        <FormItem className='w-full'>
                                          <FormControl>
                                            <div className='relative'>
                                              <Input
                                                placeholder='Product'
                                                disabled={items[index].product}
                                                {...field}
                                                onChange={(e) => {
                                                  field.onChange(
                                                    e.target.value
                                                  );

                                                  // open dropdown on typing
                                                  setOpenDropdownIndex(index);
                                                }}
                                                onFocus={() =>
                                                  setOpenDropdownIndex(index)
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleGetProduct(index);
                                                  }
                                                }}
                                              />

                                              {openDropdownIndex === index && (
                                                <div className='relative z-50 mt-1 h-[200px] w-full overflow-y-auto overflow-x-hidden rounded-md border shadow'>
                                                  {products
                                                    ?.filter((p) =>
                                                      p.product_code
                                                        ?.toLowerCase()
                                                        .includes(
                                                          (
                                                            field.value ?? ''
                                                          ).toLowerCase()
                                                        )
                                                    )
                                                    .slice(-5)
                                                    .map((p) => (
                                                      <div
                                                        key={p.id}
                                                        className='cursor-pointer px-3 py-2 hover:opacity-60'
                                                        onClick={() => {
                                                          field.onChange(
                                                            p.product_code
                                                          );
                                                          setOpenDropdownIndex(
                                                            null
                                                          );
                                                          handleGetProduct(
                                                            index
                                                          ); // existing logic
                                                        }}
                                                      >
                                                        {p.product_code}
                                                      </div>
                                                    ))}

                                                  {/* No results */}
                                                  {products &&
                                                    products.filter((p) =>
                                                      p.product_code
                                                        ?.toLowerCase()
                                                        .includes(
                                                          (
                                                            field.value ?? ''
                                                          ).toLowerCase()
                                                        )
                                                    ).length === 0 && (
                                                      <div className='px-3 py-2 text-sm text-gray-500'>
                                                        No results
                                                      </div>
                                                    )}
                                                </div>
                                              )}
                                            </div>
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </>
                                )}

                                {/* type optional */}
                                {(items[index].type === 'optional' ||
                                  items[index].optional_item) && (
                                  <FormField
                                    control={control}
                                    name={`purchasing_items.${index}.optional_item`}
                                    render={({ field }) => (
                                      <FormItem className='w-full'>
                                        <FormControl>
                                          <Input
                                            placeholder='Optional'
                                            disabled={items[index].product}
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                )}

                                {items[index].type === 'product' &&
                                  !items[index].product &&
                                  !initialData && (
                                    <Button
                                      type='button'
                                      onClick={() => handleGetProduct(index)}
                                      className='px-2'
                                    >
                                      GET
                                    </Button>
                                  )}
                              </div>
                            </td>

                            {(items[index].type === 'product' &&
                              items[index].product &&
                              !initialData) ||
                            (initialData && items[index].product_code) ? (
                              <>
                                <td className='px-4 py-3'>
                                  <FormField
                                    control={control}
                                    name={`purchasing_items.${index}.description`}
                                    render={({ field }) => (
                                      <FormItem className='w-auto lg:w-[115px]'>
                                        <FormControl>
                                          <Input
                                            placeholder='Description'
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                {warehouses.map((wh) => (
                                  <td key={wh.key} className='px-2 py-3'>
                                    <Input
                                      type='number'
                                      min='0'
                                      className='w-auto text-center lg:w-[75px]'
                                      value={dist[wh.key] || ''}
                                      onChange={(e) => {
                                        const val = Number(e.target.value) || 0;
                                        form.setValue(
                                          `purchasing_items.${index}.warehouse_distribution.${wh.key}`,
                                          val
                                        );
                                      }}
                                    />
                                  </td>
                                ))}
                                <td className='px-4 py-3 text-right'>
                                  <FormField
                                    control={control}
                                    name={`purchasing_items.${index}.price`}
                                    render={({ field }) => (
                                      <FormItem className='w-auto lg:w-[75px]'>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            min='0'
                                            {...field}
                                            className='text-right'
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                <td className='px-4 py-3 text-right font-semibold'>
                                  {(
                                    totalQty * (items[index].price || 0)
                                  ).toLocaleString()}
                                </td>
                              </>
                            ) : items[index].type === 'optional' ||
                              (initialData && items[index].optional_item) ? (
                              <>
                                {/* OPTIONAL ITEM UI */}
                                <td className='px-4 py-3'>
                                  <FormField
                                    control={control}
                                    name={`purchasing_items.${index}.description`}
                                    render={({ field }) => (
                                      <FormItem className='w-auto lg:w-[115px]'>
                                        <FormControl>
                                          <Input
                                            placeholder='Description'
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className='px-4 py-3 text-right'>
                                  <FormField
                                    control={control}
                                    name={`purchasing_items.${index}.price`}
                                    render={({ field }) => (
                                      <FormItem className='w-auto lg:w-[70px]'>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            min='0'
                                            {...field}
                                            className='text-right'
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                <td className='px-4 py-3 text-right font-semibold'>
                                  {(items[index].price || 0).toLocaleString()}
                                </td>
                              </>
                            ) : (
                              <>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </>
                            )}
                            <td className='px-4 py-3 text-center'>
                              <button
                                type='button'
                                onClick={() => remove(index)}
                                className='cursor-pointer rounded p-2 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50'
                              >
                                <Trash2 className='h-4 w-4' />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </fieldset>
              </div>
            </div>

            {/* Summary */}
            <div className='flex justify-start'>
              <div className='w-80 space-y-2 rounded-lg bg-muted p-4'>
                <div className='flex justify-between'>
                  <span className='font-medium'>Total:</span>
                  <span className='font-bold text-primary'>
                    {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {!initialData && (
              <div className='flex gap-4 pt-4'>
                <Button
                  type='submit'
                  disabled={
                    !form.formState.isValid ||
                    isPending ||
                    calculateTotal() === 0
                  }
                  className='bg-primary text-primary-foreground hover:bg-primary/90'
                >
                  {isPending ? (
                    <div className='flex gap-2'>
                      Adding <LoaderCircle className='h-5 w-5 animate-spin' />
                    </div>
                  ) : (
                    'Add Purchase Invoice'
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
