'use client';

import { useEffect, useState, useTransition } from 'react';
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
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Trash2, Plus } from 'lucide-react';
import {
  getMaxInvoiceNumber,
  getProductByCode,
  getProductById,
  invoiceSubmit
} from '@/lib/actions';
import { Invoice } from 'types';
import { toast } from 'sonner';
import { toastMsg } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { printInvoice } from './print-invoice';
import { Switch } from '@/components/ui/switch';

export default function InvoiceForm({
  initialData,
  pageTitle
}: {
  initialData: Invoice | null;
  pageTitle: string;
}) {
  const [productsLoaded, setProductsLoaded] = useState(!initialData);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const invoiceItemSchema = z.object({
    type: z.enum(['product', 'optional']).default('product'),
    product_code: z.string().optional().nullable(),
    product_id: z.string().optional(),
    optional_item: z.string().optional().nullable(),
    quantity: z.coerce.number().min(1),
    price: z.coerce.number().min(1),
    product: z.any().optional(),
    payment: z.boolean().default(false).optional()
  });

  const formSchema = z.object({
    customer_name: z.string().min(1, 'Customer name is required'),
    customer_number: z.string().optional(),
    customer_address: z.string().optional(),
    invoice_items: z.array(invoiceItemSchema).min(1),
    payment: z.boolean().default(false)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: initialData?.customer_name || '',
      customer_number: initialData?.customer_number || '',
      customer_address: initialData?.customer_address || '',
      payment: initialData?.payment || false,
      invoice_items:
        initialData?.invoice_items?.map((item) => ({
          ...item,
          // determine type: optional_item present = optional, else product
          type: item.optional_item ? 'optional' : 'product',
          product: undefined // loaded async below
        })) || []
    }
  });

  const { control, handleSubmit, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoice_items'
  });

  const items = watch('invoice_items');
  const { isDirty } = form.formState;

  const calculateTotal = () =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      for (const item of values.invoice_items) {
        if (item.type === 'product') {
          if (item.price < item.product?.cost_price) {
            toast.error(toastMsg.error);
            return;
          }
        }
      }

      const totalPrice = calculateTotal();

      let newInvoiceNumber;
      if (!initialData) {
        const maxInvoiceNumber = await getMaxInvoiceNumber('invoices');
        newInvoiceNumber = maxInvoiceNumber + 1;
      }

      const finalData = {
        ...values,
        total_price: totalPrice,
        ...(newInvoiceNumber && { invoice_number: newInvoiceNumber })
      };

      const res = await invoiceSubmit(finalData, initialData);
      const entity = 'Invoice';

      if (res?.successNew) {
        toast.success(toastMsg.dynamicNew(entity));
        await printInvoice(finalData);
      } else if (res?.successUpdate)
        toast.success(toastMsg.dynamicUpdate(entity));
      else if (res?.error) toast.error(toastMsg.error);

      if (!res?.error) {
        router.push(`/dashboard/invoices`);
      }
    });
  };

  const handleGetProduct = async (index: number) => {
    if (!items[index].product_code) return;

    const product = await getProductByCode(items[index].product_code);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    form.setValue(`invoice_items.${index}.price`, product.selling_price);
    form.setValue(`invoice_items.${index}.product`, product);
  };

  // Load products for existing invoice items using product_id
  useEffect(() => {
    const loadProductsForInitialData = async () => {
      if (initialData?.invoice_items) {
        for (let i = 0; i < initialData.invoice_items.length; i++) {
          const item = initialData.invoice_items[i];

          // Prefer product_id, fall back to product_code for legacy data
          const product = item.product_id
            ? await getProductById(item.product_id)
            : item.product_code
              ? await getProductByCode(item.product_code)
              : null;

          if (product) {
            form.setValue(`invoice_items.${i}.product`, product);
          }
        }
      }
      setProductsLoaded(true);
    };

    if (initialData) loadProductsForInitialData();
  }, [form, initialData]);

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='mb-4 text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            {/* Customer Information — always editable */}
            <div>
              <h2 className='mb-4 text-xl font-semibold text-foreground'>
                Customer Information
              </h2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <FormField
                  control={control}
                  name='customer_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter customer name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='customer_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter phone number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='customer_address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter address' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Invoice Items — read-only when editing */}
            <div className='grid'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-foreground'>
                  Invoice Items
                </h2>

                {/* Only show add buttons when creating a new invoice */}
                {!initialData && (
                  <div className='flex flex-col gap-2 md:flex-row'>
                    <Button
                      type='button'
                      onClick={() =>
                        append({
                          type: 'optional',
                          optional_item: '',
                          quantity: 1,
                          price: 0
                        })
                      }
                      variant='outline'
                      className='gap-2'
                    >
                      <Plus className='h-4 w-4' />
                      Add Optional Item
                    </Button>
                    <Button
                      type='button'
                      onClick={() =>
                        append({
                          type: 'product',
                          product_code: '',
                          quantity: 0,
                          price: 0
                        })
                      }
                      className='gap-2'
                    >
                      <Plus className='h-4 w-4' />
                      Add Item
                    </Button>
                  </div>
                )}
              </div>

              <div className='overflow-x-auto rounded-lg border'>
                {/* fieldset disabled locks all inputs inside when editing */}
                <fieldset disabled={!!initialData}>
                  <table className='w-max lg:w-full'>
                    <thead>
                      <tr className='border-b bg-muted'>
                        <th className='px-4 py-3 text-left text-sm font-semibold'>
                          Product
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Piece
                        </th>
                        <th className='px-4 py-3 text-sm font-semibold'>
                          Price
                        </th>
                        <th className='px-4 py-3 text-right text-sm font-semibold'>
                          Total
                        </th>
                        {!initialData && (
                          <th className='px-4 py-3 text-center text-sm font-semibold'>
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => {
                        const item = items[index];
                        const isProductReady =
                          item.type === 'product' &&
                          (item.product || initialData);
                        const isOptional = item.type === 'optional';

                        return (
                          <tr
                            key={field.id}
                            className='border-b hover:bg-muted/50'
                          >
                            {/* Product name / code cell */}
                            <td className='flex gap-2 px-4 py-3'>
                              {item.type === 'product' && (
                                <>
                                  {initialData ? (
                                    // When editing: show description or product name read-only
                                    <span className='py-1 text-sm'>
                                      {item.product?.name ??
                                        (
                                          initialData.invoice_items[
                                            index
                                          ] as any
                                        )?.description ??
                                        item.product_code ??
                                        '—'}
                                    </span>
                                  ) : (
                                    <FormField
                                      control={control}
                                      name={`invoice_items.${index}.product_code`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              placeholder='Product Code'
                                              {...field}
                                              value={field.value ?? ''}
                                              disabled={!!item.product}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  handleGetProduct(index);
                                                }
                                              }}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  )}

                                  {!initialData && !item.product && (
                                    <Button
                                      type='button'
                                      onClick={() => handleGetProduct(index)}
                                      className='px-2'
                                    >
                                      GET
                                    </Button>
                                  )}
                                </>
                              )}

                              {isOptional && (
                                <FormField
                                  control={control}
                                  name={`invoice_items.${index}.optional_item`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder='Optional Item'
                                          {...field}
                                          value={field.value ?? ''}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              )}
                            </td>

                            {/* Quantity / Price / Total cells */}
                            {isProductReady || isOptional ? (
                              <>
                                <td className='px-4 py-3'>
                                  <FormField
                                    control={control}
                                    name={`invoice_items.${index}.quantity`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            min='0'
                                            className='text-center'
                                            {...field}
                                            value={
                                              field.value === 0
                                                ? ''
                                                : field.value
                                            }
                                            placeholder='Pieces'
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                <td className='px-4 py-3'>
                                  <FormField
                                    control={control}
                                    name={`invoice_items.${index}.price`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type='number'
                                            min='0'
                                            className='text-right'
                                            {...field}
                                            value={
                                              field.value === 0
                                                ? ''
                                                : field.value
                                            }
                                            placeholder='Price'
                                            onChange={(e) => {
                                              const value = Number(
                                                e.target.value
                                              );
                                              if (item.type === 'product') {
                                                const minPrice =
                                                  item.product?.cost_price ?? 0;
                                                field.onChange(
                                                  Math.max(value, minPrice)
                                                );
                                              } else {
                                                field.onChange(value);
                                              }
                                            }}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                <td className='px-4 py-3 text-right font-semibold'>
                                  {(item.quantity * item.price).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 2
                                    }
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td />
                                <td />
                                <td />
                              </>
                            )}

                            {/* Action column — hidden when editing */}
                            {!initialData && (
                              <td className='px-4 py-3 text-center'>
                                <button
                                  type='button'
                                  onClick={() => remove(index)}
                                  className='cursor-pointer rounded p-2 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </fieldset>
              </div>
            </div>

            {/* Payment Status — always editable */}
            <FormField
              control={form.control}
              name='payment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>
                      {field.value ? '✅' : '❌'}
                    </span>
                    <Switch
                      id='payment'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='data-[state=checked]:bg-green-600'
                    />
                    <span className='text-sm text-gray-400'>
                      {field.value ? 'Received' : 'Pending'}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <div className='flex flex-col justify-end gap-4'>
              <div className='w-full space-y-4 rounded-lg bg-muted p-6 md:w-80'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>Subtotal:</span>
                  <span className='font-semibold'>
                    {calculateTotal().toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <div className='border-t pt-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-lg font-bold'>Total:</span>
                    <span className='text-lg font-bold text-primary'>
                      {calculateTotal().toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className='flex gap-4 pt-4'>
              <Button
                type='submit'
                disabled={
                  isPending ||
                  !isDirty ||
                  (!initialData && !form.formState.isValid)
                }
                className='bg-primary text-primary-foreground hover:bg-primary/90'
              >
                {isPending ? (
                  <div className='flex gap-2'>
                    {initialData ? 'Editing' : 'Adding'}
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                  </div>
                ) : initialData ? (
                  'Edit Invoice'
                ) : (
                  'Add Invoice'
                )}
              </Button>

              {initialData && (
                <Button
                  type='button'
                  variant='outline'
                  disabled={!productsLoaded}
                  onClick={() => {
                    const values = form.getValues();
                    const printableInvoice = {
                      ...initialData,
                      invoice_items: values.invoice_items
                    };
                    printInvoice(printableInvoice, initialData.created_at);
                  }}
                >
                  Print Invoice
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
