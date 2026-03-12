'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { formatPakNumber, formatToPKTDate } from '@/utils/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Order } from 'types';
import { printInvoice } from '../invoices/print-invoice';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsModal({
  open,
  onOpenChange,
  order
}: OrderDetailsModalProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  // remove this later

  useEffect(() => {
    if (open && order) {
      const fetchOrderItems = async () => {
        try {
          setLoading(true);

          const supabase = createClient();
          const { data } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order?.id);

          setItems((data as OrderItem[]) || []);
        } catch (error) {
          toast.error('Failed to fetch orders details');
        } finally {
          setLoading(false);
        }
      };

      fetchOrderItems();
    }
  }, [open, order]);

  const handleCreateInvoice = async () => {
    if (!order) return;

    try {
      setCreatingInvoice(true);
      const supabase = createClient();

      const { data, error } = await supabase.rpc('create_invoice_from_order', {
        p_order_id: order.id
      });

      if (error) throw error;

      toast.success('Invoice created successfully!', {
        description: `Invoice has been generated for Order #${order.order_number}`
      });

      // Shape the data for printInvoice
      const invoiceData = {
        invoice_number: data?.invoice_number ?? order.order_number,
        customer_name: order.customer_name,
        customer_number: order.customer_number ?? undefined, // ✅
        customer_address: order.customer_address ?? undefined, // ✅
        total_price: order.total_price,
        created_at: new Date().toISOString(),
        payment: false,
        invoice_items: items.map((item) => ({
          product_code: null,
          optional_item: item.product_name,
          quantity: item.quantity,
          price: item.price,
          product: null
        }))
      };

      await printInvoice(invoiceData);

      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create invoice', {
        description: 'Please try again or contact support'
      });
    } finally {
      setCreatingInvoice(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-hidden overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Order #{order.order_number}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Customer Information */}
          <div className='border-b pb-4'>
            <h3 className='mb-3 font-semibold'>Customer Information</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600'>Name</p>
                <p className='font-medium'>{order.customer_name}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Phone</p>

                {order.customer_number ? (
                  <a
                    href={`https://wa.me/${formatPakNumber(order.customer_number)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium text-green-600 hover:underline'
                  >
                    {order.customer_number}
                  </a>
                ) : (
                  <p className='font-medium'>N/A</p>
                )}
              </div>
              <div className='col-span-2'>
                <p className='text-sm text-gray-600'>Address</p>
                <p className='font-medium'>{order.customer_address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className='border-b pb-4'>
            <h3 className='mb-3 font-semibold'>Order Details</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600'>Status</p>
                <p className='font-medium capitalize'>{order.status}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Total Price</p>
                <p className='font-medium'>Rs {order.total_price}</p>
              </div>
              <div className='col-span-2'>
                <p className='text-sm text-gray-600'>Order Date</p>
                <p className='font-medium'>
                  {formatToPKTDate(order.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className='mb-3 font-semibold'>Ordered Items</h3>
            {loading ? (
              <p className='text-sm text-gray-600'>Loading items...</p>
            ) : items.length === 0 ? (
              <p className='text-sm text-gray-600'>No items found</p>
            ) : (
              <div className='max-h-64 space-y-2 overflow-y-auto pr-1'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between rounded border p-3'
                  >
                    <div>
                      <p className='font-medium'>{item.product_name}</p>
                      <p className='text-sm text-gray-600'>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className='font-medium'>Rs {item.price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Invoice Button */}
          <div className='flex justify-end border-t pt-4'>
            <Button
              onClick={handleCreateInvoice}
              disabled={creatingInvoice || loading || items.length === 0}
              className='gap-2'
            >
              <FileText className='h-4 w-4' />
              {creatingInvoice ? 'Creating Invoice...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
