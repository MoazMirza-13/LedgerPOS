'use client';

import { useTransition } from 'react';
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
import { invoiceSubmit } from '@/lib/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { warehouses } from '@/constants/data';
import { Invoice } from 'types';
import { toast } from 'sonner';
import { toastMsg } from '@/utils/utils';
import { useRouter } from 'next/navigation';

const invoiceItemSchema = z.object({
  id: z.string().optional(),
  product_code: z.string().min(1, {
    message: 'Product code is required'
  }),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1),
  boxes: z.coerce.number().optional(),
  price: z.coerce.number().min(1),
  warehouse: z.string().min(1, 'Warehouse is required')
});

const formSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_number: z.string().optional(),
  customer_address: z.string().optional(),
  invoice_items: z.array(invoiceItemSchema).min(1)
});

export default function InvoiceForm({
  initialData,
  pageTitle
}: {
  initialData: Invoice | null;
  pageTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: initialData?.customer_name || '',
      customer_number: initialData?.customer_number || '',
      customer_address: initialData?.customer_address || '',
      invoice_items: initialData?.invoice_items || []
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
      const seen = new Set<string>();
      const duplicates: { code: string; warehouse: string }[] = [];

      for (const item of values.invoice_items) {
        const key = `${item.product_code}_${item.warehouse}`;
        if (seen.has(key)) {
          duplicates.push({
            code: item.product_code,
            warehouse: item.warehouse
          });
        } else {
          seen.add(key);
        }
      }

      if (duplicates.length > 0) {
        toast.error(toastMsg.error);

        // console.log(
        //   `Duplicate entries found:\n${duplicates
        //     .map((d) => `Code "${d.code}" in Warehouse "${d.warehouse}"`)
        //     .join('\n')}`
        // );
        return;
      }

      const totalPrice = calculateTotal();
      const finalData = { ...values, total_price: totalPrice };

      const res = await invoiceSubmit(finalData, initialData);

      if (res?.successNew) toast.success(toastMsg.newInvoice);
      else if (res?.successUpdate) toast.success(toastMsg.updateInvoice);
      else if (res?.error) toast.error(toastMsg.error);

      if (!res?.error) {
        router.push(`/dashboard/invoices`);
      }
    });
  };

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
            {/* Customer Information */}
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
            {/* Invoice Items */}
            <div>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-foreground'>
                  Invoice Items
                </h2>
                <Button
                  type='button'
                  disabled={!!initialData}
                  onClick={() =>
                    append({
                      id: String(Date.now()),
                      product_code: '',
                      description: '',
                      quantity: 0,
                      boxes: 0,
                      price: 0,
                      warehouse: ''
                    })
                  }
                  className='gap-2'
                >
                  <Plus className='h-4 w-4' />
                  Add Item
                </Button>
              </div>

              <div className='overflow-x-auto rounded-lg border'>
                <fieldset disabled={!!initialData}>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b bg-muted'>
                        <th className='px-4 py-3 text-left text-sm font-semibold'>
                          Code Number
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-semibold'>
                          Description
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Quantity
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Boxes
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Warehouse
                        </th>
                        <th className='px-4 py-3 text-right text-sm font-semibold'>
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
                      {fields.map((field, index) => (
                        <tr
                          key={field.id}
                          className='border-b hover:bg-muted/50'
                        >
                          <td className='px-4 py-3'>
                            <FormField
                              control={control}
                              name={`invoice_items.${index}.product_code`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder='Code' {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className='px-4 py-3'>
                            <FormField
                              control={control}
                              name={`invoice_items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
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
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className='px-4 py-3'>
                            <FormField
                              control={control}
                              name={`invoice_items.${index}.boxes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      min='0'
                                      className='text-center'
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className='w-[16%] px-4 py-3'>
                            <FormField
                              control={form.control}
                              name={`invoice_items.${index}.warehouse`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(
                                        value === 'null' ? '' : value
                                      )
                                    }
                                    value={
                                      field.value ? String(field.value) : ''
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder='Warehouse' />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className='max-h-60 overflow-y-auto'>
                                      <SelectItem value='null'>None</SelectItem>
                                      {warehouses?.map((warehouse) => (
                                        <SelectItem
                                          key={warehouse.key}
                                          value={warehouse.key}
                                        >
                                          {warehouse.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className='px-4 py-3 text-right font-semibold'>
                            {/* $ */}
                            {(
                              items[index].quantity * items[index].price
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2
                            })}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <button
                              type='button'
                              onClick={() => remove(index)}
                              disabled={items.length === 1}
                              className='rounded p-2 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </fieldset>
              </div>
            </div>

            {/* Summary Section */}
            <div className='flex justify-end'>
              <div className='w-full space-y-4 rounded-lg bg-muted p-6 md:w-80'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>Subtotal:</span>
                  <span className='font-semibold'>
                    {/* $ */}
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
                      {/* $*/}
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
            <div className='pt-4'>
              <Button
                type='submit'
                disabled={!form.formState.isValid || isPending || !isDirty}
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
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
