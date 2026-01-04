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
import { Invoice, Product, Reference } from 'types';
import { toast } from 'sonner';
import { toastMsg } from '@/utils/utils';
import { useRouter } from 'next/navigation';
import { printInvoice } from './print-invoice';

export default function InvoiceForm({
  initialData,
  pageTitle,
  references,
  products
}: {
  initialData: Invoice | null;
  pageTitle: string;
  references: Reference[] | null;
  products: Product[] | null;
}) {
  const [productsLoaded, setProductsLoaded] = useState(!initialData);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const invoiceItemSchema = z
    .object({
      type: z.enum(['product', 'optional']).default('product'),
      product_code: z.string().optional().nullable(),
      optional_item: z.string().optional().nullable(),
      quantity: z.coerce.number().min(1),
      boxes: z.coerce.number().optional().nullable(),
      price: z.coerce.number().min(1),
      warehouse: z.string().optional().nullable(),
      product: z.any().optional()
    })
    .refine(
      (item) => {
        if (item.type === 'product') {
          return !!item.warehouse; // required
        }
        return true; // optional item doesn't need warehouse
      },
      {
        message: 'Warehouse is required for product items',
        path: ['warehouse']
      }
    );

  const formSchema = z.object({
    customer_name: z.string().optional(),
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
      invoice_items:
        initialData?.invoice_items?.map((item) => ({
          ...item,
          type: item.product_code ? 'product' : 'optional',
          product: undefined // will be loaded later
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
      const seen = new Set<string>();
      const duplicates: { code: string; warehouse: string }[] = [];

      for (const item of values.invoice_items) {
        if (item.type === 'product') {
          if (item.price < item.product?.cost_price) {
            toast.error(toastMsg.error);
            return;
          }

          const key = `${item.product_code}_${item.warehouse}`;
          if (seen.has(key)) {
            duplicates.push({
              code: item.product_code!,
              warehouse: item.warehouse!
            });
          } else {
            seen.add(key);
          }
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
      if (initialData) {
        // Editing existing invoice
        const maxInvoiceNumber = await getMaxInvoiceNumber('invoices');

        if (initialData.invoice_number !== maxInvoiceNumber) {
          //only recent invoice is editable
          toast.error(toastMsg.error);
          return;
        }
      } else {
        // Creating new invoice
        const maxInvoiceNumber = await getMaxInvoiceNumber('invoices');
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

  //todo: refactor and remove `handleGetProduct` logic as now we are getting all products
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

  useEffect(() => {
    const loadProductsForInitialData = async () => {
      if (initialData && initialData.invoice_items) {
        for (let i = 0; i < initialData.invoice_items.length; i++) {
          const code = initialData.invoice_items[i].product_code;
          if (!code) continue;
          const product = await getProductByCode(code);
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
    <>
      {showPasswordPopup && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-80 space-y-4 rounded-lg bg-white p-6 text-black shadow-lg'>
            <h2 className='text-lg font-semibold'>Super Admin Password</h2>
            <Input
              type='password'
              placeholder='Enter Password'
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
            />
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setShowPasswordPopup(false);
                  setAdminPass('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (adminPass === 'super123') {
                    setShowPasswordPopup(false);
                    handleSubmit(onSubmit)();
                  } else {
                    toast.error(toastMsg.error);
                  }
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className='mx-auto w-full'>
        <CardHeader>
          <CardTitle className='mb-4 text-left text-2xl font-bold'>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (initialData) {
                  setShowPasswordPopup(true);
                  return;
                }

                handleSubmit(onSubmit)();
              }}
              className='space-y-8'
            >
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
              <div className='grid'>
                <div className='mb-4 flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-foreground'>
                    Invoice Items
                  </h2>

                  <div className='flex gap-2'>
                    {/* Add Optional Item */}
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
                    {/* Add Product Item */}
                    <Button
                      type='button'
                      onClick={() =>
                        append({
                          type: 'product',
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
                </div>

                <div className='overflow-x-auto rounded-lg border'>
                  <table className='w-max lg:w-full'>
                    <thead>
                      <tr className='border-b bg-muted'>
                        <th className='w-[20%] px-4 py-3 text-left text-sm font-semibold'>
                          Product
                        </th>
                        <th className='px-4 py-3 text-center text-sm font-semibold'>
                          Box
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
                          <td
                            className={`flex gap-2 px-4 py-3 ${
                              items[index].product ? 'w-[160px]' : 'w-[30rem]'
                            }`}
                          >
                            {items[index].type === 'product' && (
                              <FormField
                                control={control}
                                name={`invoice_items.${index}.product_code`}
                                render={({ field }) => (
                                  <FormItem className='w-full'>
                                    <FormControl>
                                      <div className='relative'>
                                        <Input
                                          placeholder='Product Code'
                                          {...field}
                                          value={field.value ?? ''}
                                          disabled={
                                            items[index].product ||
                                            !!initialData?.invoice_items[index]
                                              ?.product_code
                                          }
                                          onChange={(e) => {
                                            field.onChange(e.target.value);

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
                                                    setOpenDropdownIndex(null);
                                                    handleGetProduct(index); // existing logic
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
                            )}
                            {/* optional item field */}
                            {items[index].type === 'optional' && (
                              <FormField
                                control={control}
                                name={`invoice_items.${index}.optional_item`}
                                render={({ field }) => (
                                  <FormItem className='w-full'>
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

                            {items[index].type === 'product' &&
                              !items[index].product &&
                              !initialData?.invoice_items[index]
                                ?.product_code && (
                                <Button
                                  type='button'
                                  onClick={() => handleGetProduct(index)}
                                  className='px-2'
                                >
                                  GET
                                </Button>
                              )}
                          </td>

                          {(items[index].type === 'product' &&
                            items[index].product) ||
                          (initialData?.invoice_items[index]?.product_code &&
                            items[index].type === 'product') ? (
                            <>
                              {items[index].product?.optional ? (
                                <td></td>
                              ) : (
                                <td className='px-4 py-3'>
                                  <div className='flex items-center justify-center'>
                                    <FormField
                                      control={control}
                                      name={`invoice_items.${index}.boxes`}
                                      render={({ field }) => (
                                        <FormItem className='w-auto lg:w-[75px] xl:w-[110px]'>
                                          <FormControl>
                                            <Input
                                              type='number'
                                              min='0'
                                              className='text-center'
                                              {...field}
                                              value={
                                                items[index].product?.optional
                                                  ? 0
                                                  : field.value === 0 &&
                                                      !initialData
                                                    ? ''
                                                    : (field.value ?? '')
                                              }
                                              placeholder='Add Box'
                                              onChange={(e) => {
                                                if (
                                                  items[index].product?.optional
                                                ) {
                                                  // ✅ force boxes to 0 if product is optional
                                                  field.onChange(0);
                                                  return;
                                                }

                                                const value = Number(
                                                  e.target.value
                                                );
                                                const itemsPerBox =
                                                  items[index].product?.boxes ||
                                                  1;

                                                field.onChange(value);
                                                form.setValue(
                                                  `invoice_items.${index}.quantity`,
                                                  value > 0
                                                    ? value * itemsPerBox
                                                    : 0
                                                );
                                              }}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </td>
                              )}

                              <td className='px-4 py-3'>
                                <div className='flex items-center justify-center'>
                                  <FormField
                                    control={control}
                                    name={`invoice_items.${index}.quantity`}
                                    render={({ field }) => (
                                      <FormItem className='w-auto lg:w-[75px] xl:w-[110px]'>
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
                                            placeholder='Add Piece'
                                            onChange={(e) => {
                                              const value = Number(
                                                e.target.value
                                              );
                                              field.onChange(value);

                                              const product =
                                                items[index].product;

                                              // Only update boxes if the product exists and is not optional
                                              if (
                                                product &&
                                                !product.optional
                                              ) {
                                                const itemsPerBox =
                                                  product.boxes || 1;
                                                form.setValue(
                                                  `invoice_items.${index}.boxes`,
                                                  value > 0
                                                    ? Math.floor(
                                                        value / itemsPerBox
                                                      )
                                                    : 0
                                                );
                                              }
                                            }}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </td>
                              <td className='px-4 py-3 text-center'>
                                <div className='flex items-center justify-center'>
                                  <Input
                                    readOnly
                                    className='w-full cursor-default select-none bg-muted/40 text-center font-medium text-muted-foreground md:w-max'
                                    value={(() => {
                                      const product = items[index].product;
                                      if (!product) return '';

                                      const totalPieces =
                                        items[index].quantity || 0;
                                      if (!totalPieces) return '';

                                      // OPTIONAL PRODUCTS → ONLY PIECES
                                      if (product.optional) {
                                        return `${totalPieces} Piece${totalPieces > 1 ? 's' : ''}`;
                                      }

                                      // NORMAL PRODUCTS → BOX + PIECE LOGIC
                                      const itemsPerBox = product.boxes || 1;
                                      const boxes = Math.floor(
                                        totalPieces / itemsPerBox
                                      );
                                      const pieces = totalPieces % itemsPerBox;

                                      return `${boxes ? boxes + ' Box' + (boxes > 1 ? 'es' : '') : ''}${
                                        boxes && pieces ? ' and ' : ''
                                      }${pieces ? pieces + ' Piece' + (pieces > 1 ? 's' : '') : ''}`;
                                    })()}
                                    placeholder='Total Quantity'
                                  />
                                </div>
                              </td>
                              <td className='relative flex w-max justify-center justify-self-center px-4 py-3'>
                                <FormField
                                  control={form.control}
                                  name={`invoice_items.${index}.warehouse`}
                                  render={({ field }) => (
                                    <FormItem className='w-max'>
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
                                                <span className='text-sm text-muted-foreground'>
                                                  ({qty})
                                                </span>
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
                                <div className='flex items-center justify-center'>
                                  <FormField
                                    control={control}
                                    name={`invoice_items.${index}.price`}
                                    render={({ field }) => (
                                      <FormItem className='w-auto lg:w-[75px] xl:w-[110px]'>
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
                                            placeholder='Add Price'
                                            onChange={(e) => {
                                              const value =
                                                e.target.value === ''
                                                  ? ''
                                                  : Number(e.target.value);
                                              field.onChange(value);
                                            }}
                                            onBlur={() => {
                                              const value = Number(field.value);

                                              if (
                                                items[index].type === 'product'
                                              ) {
                                                const minPrice =
                                                  items[index].product
                                                    ?.cost_price ?? 0;
                                                field.onChange(
                                                  Math.max(value, minPrice)
                                                );
                                              }
                                            }}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
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
                          ) : items[index].type === 'optional' ? (
                            <>
                              <td></td>
                              {/* OPTIONAL ITEM UI */}
                              <td className='flex justify-center px-4 py-3'>
                                <FormField
                                  control={control}
                                  name={`invoice_items.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem className='w-auto lg:w-[75px] xl:w-[110px]'>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          min='0'
                                          className='text-center'
                                          {...field}
                                          placeholder='Qty'
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>

                              <td></td>
                              <td></td>

                              <td className='px-4 py-3'>
                                <FormField
                                  control={control}
                                  name={`invoice_items.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem className='w-auto lg:w-[75px] xl:w-[110px]'>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          min='0'
                                          className='text-right'
                                          {...field}
                                          placeholder='Price'
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>

                              <td className='px-4 py-3 text-right font-semibold'>
                                {(
                                  items[index].quantity * items[index].price
                                ).toLocaleString()}
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
                            </>
                          )}

                          <td className='px-4 py-3 text-center'>
                            <button
                              type='button'
                              onClick={() => remove(index)}
                              // disabled={items.length === 1}
                              className='cursor-pointer rounded p-2 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
    </>
  );
}
