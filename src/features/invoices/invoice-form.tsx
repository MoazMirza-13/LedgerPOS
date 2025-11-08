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
  invoiceSubmit
} from '@/lib/actions';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { warehouses } from '@/constants/data';
import { Invoice, Reference } from 'types';
import { toast } from 'sonner';
import { toastMsg } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { printInvoice } from './print-invoice';

export default function InvoiceForm({
  initialData,
  pageTitle,
  references
}: {
  initialData: Invoice | null;
  pageTitle: string;
  references: Reference[] | null;
}) {
  const [productsLoaded, setProductsLoaded] = useState(!initialData);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const invoiceItemSchema = z.object({
    product_code: z.string().min(1, {
      message: 'Product code is required'
    }),
    quantity: z.coerce.number().min(1),
    boxes: z.coerce.number().optional(),
    price: z.coerce.number().min(1),
    warehouse: z.string().min(1, 'Warehouse is required'),
    product: z.any().optional()
  });

  const formSchema = z.object({
    customer_name: z.string().min(1, 'Customer name is required'),
    customer_number: z.string().optional(),
    customer_address: z.string().optional(),
    invoice_items: z.array(invoiceItemSchema).min(1),
    reference: z.string().optional()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: initialData?.customer_name || '',
      customer_number: initialData?.customer_number || '',
      customer_address: initialData?.customer_address || '',
      reference: initialData?.reference || '',
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
        if (item.price < item.product?.cost_price) {
          toast.error(toastMsg.error);
          return;
        }

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

      let newInvoiceNumber;
      if (!initialData) {
        const maxInvoiceNumber = await getMaxInvoiceNumber();
        newInvoiceNumber = maxInvoiceNumber + 1;
      }

      const finalData = {
        ...values,
        total_price: totalPrice,
        ...(newInvoiceNumber && { invoice_number: newInvoiceNumber }) // include only if defined
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
    const product = await getProductByCode(items[index].product_code);

    if (!product) {
      toast.error('Product not found');
      return;
    }

    form.setValue(`invoice_items.${index}.price`, product.selling_price);
    form.setValue(`invoice_items.${index}.product`, product);
  };

  useEffect(() => {
    const loadProductsForInitialData = async () => {
      if (initialData && initialData.invoice_items) {
        for (let i = 0; i < initialData.invoice_items.length; i++) {
          const product = await getProductByCode(
            initialData.invoice_items[i].product_code
          );
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
                      product_code: '',
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
                        <th className='w-[20%] px-4 py-3 text-left text-sm font-semibold'>
                          Product
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Piece
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Total Quantity
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Warehouse
                        </th>
                        <th className='px-4 py-3 text-sm font-semibold'>
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
                          <td className='flex gap-2 px-4 py-3'>
                            <FormField
                              control={control}
                              name={`invoice_items.${index}.product_code`}
                              render={({ field }) => (
                                <FormItem className='w-full'>
                                  <FormControl>
                                    <Input
                                      placeholder='Product Code'
                                      {...field}
                                      disabled={items[index].product}
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
                            {!items[index].product && !initialData && (
                              <Button
                                type='button'
                                onClick={() => handleGetProduct(index)}
                                className='px-2'
                              >
                                GET
                              </Button>
                            )}
                          </td>
                          {items[index].product || initialData ? (
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
                                            field.value === 0 ? '' : field.value
                                          }
                                          placeholder='Add Piece'
                                          onChange={(e) => {
                                            const value = Number(
                                              e.target.value
                                            );
                                            const itemsPerBox =
                                              items[index].product?.boxes || 1;

                                            field.onChange(value);
                                            form.setValue(
                                              `invoice_items.${index}.boxes`,
                                              value > 0
                                                ? Math.floor(
                                                    value / itemsPerBox
                                                  )
                                                : 0
                                            );
                                          }}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <Input
                                  readOnly
                                  className='w-max cursor-default select-none bg-muted/40 text-center font-medium text-muted-foreground'
                                  value={(() => {
                                    const itemsPerBox =
                                      items[index].product?.boxes || 1;
                                    const totalPieces =
                                      items[index].quantity || 0;
                                    const boxes = Math.floor(
                                      totalPieces / itemsPerBox
                                    );
                                    const pieces = totalPieces % itemsPerBox;
                                    if (
                                      !productsLoaded &&
                                      !items[index].product
                                    )
                                      return '';
                                    if (!totalPieces) return '';
                                    return `${boxes ? boxes + ' Box' + (boxes > 1 ? 'es' : '') : ''}${
                                      boxes && pieces ? ' and ' : ''
                                    }${pieces ? pieces + ' Piece' + (pieces > 1 ? 's' : '') : ''}`;
                                  })()}
                                  placeholder='Total Quantity'
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
                                          <SelectItem value='null'>
                                            None
                                          </SelectItem>
                                          {warehouses?.map((warehouse) => {
                                            const product =
                                              items[index].product;
                                            const qtyMap = {
                                              Ghaziwal:
                                                product?.quantity_in_ghaziwal,
                                              Zafarwal:
                                                product?.quantity_in_zafarwal,
                                              LhrRoad:
                                                product?.quantity_in_lhr_road,
                                              EidgahRoad:
                                                product?.quantity_in_eidgah_road,
                                              MandiTile:
                                                product?.quantity_in_mandi_tile,
                                              MandiBond:
                                                product?.quantity_in_mandi_bond
                                            };

                                            const qty =
                                              qtyMap[
                                                warehouse.key as keyof typeof qtyMap
                                              ] ?? 0;

                                            return (
                                              <SelectItem
                                                key={warehouse.key}
                                                value={warehouse.key}
                                                className='flex cursor-pointer justify-between'
                                              >
                                                <span>{warehouse.label} </span>
                                                {!initialData && (
                                                  <span className='text-sm text-muted-foreground'>
                                                    ({qty})
                                                  </span>
                                                )}
                                              </SelectItem>
                                            );
                                          })}
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
                                          value={
                                            field.value === 0 ? '' : field.value
                                          }
                                          placeholder='Add Price'
                                          onChange={(e) => {
                                            const value = Number(
                                              e.target.value
                                            );
                                            const minPrice =
                                              items[index].product
                                                ?.cost_price ?? 0;

                                            if (value < minPrice) {
                                              field.onChange(minPrice);
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
                                {/* $ */}
                                {(
                                  items[index].quantity * items[index].price
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </>
                          ) : (
                            <>
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
            <div className='flex flex-col justify-end gap-4'>
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
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name={`reference`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === 'null' ? '' : value)
                        }
                        value={field.value ? String(field.value) : ''}
                        disabled={!!initialData}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Reference' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='max-h-60 overflow-y-auto'>
                          <SelectItem value='null'>None</SelectItem>
                          <SelectGroup>
                            {references?.map((reference) => (
                              <SelectItem
                                key={reference.id}
                                value={String(reference.id)}
                                className='cursor-pointer'
                              >
                                {reference.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
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
