'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { Order } from 'types';
import { formatToPKTDate } from '@/utils/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const STATUS_OPTIONS = ['pending', 'processing', 'delivered', 'confirmed'];

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onOrderClick: (order: Order) => void;
  onOrdersUpdated: () => void;
}

export function OrdersTable({
  orders,
  onOrderClick,
  onOrdersUpdated,
  loading
}: OrdersTableProps) {
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [originalOrders, setOriginalOrders] = useState<Order[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalOrders(orders);
    setOriginalOrders(orders);
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setHasChanges(true);
  };

  const handleCancel = () => {
    setLocalOrders(originalOrders);
    setHasChanges(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const supabase = createClient();

      const changedOrders = localOrders.filter((order) => {
        const original = originalOrders.find((o) => o.id === order.id);
        return original?.status !== order.status;
      });

      for (const order of changedOrders) {
        const { error } = await supabase.rpc('update_order_status', {
          p_order_id: order.id,
          p_status: order.status
        });

        if (error) throw error;
      }

      toast.success('Order status updated');
      setHasChanges(false);
      onOrdersUpdated();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <p className='text-gray-600'>Loading orders...</p>
      </div>
    );
  }

  if (!loading && localOrders.length === 0) {
    return (
      <div className='flex items-center justify-center py-8'>
        <p className='text-gray-600'>You Have No New Orders</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='relative flex flex-1 flex-col'>
          {/* add flex-col */}
          <div className='flex h-[60vh] overflow-scroll rounded-md border md:overflow-auto'>
            {/* remove absolute left-0 right-0 */}
            <ScrollArea className='flex-1'>
              <Table className='relative'>
                <TableHeader className={`sticky top-0 z-10 bg-background`}>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className='text-sm text-gray-600'>
                        {formatToPKTDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => onOrderClick(order)}
                          className='cursor-pointer font-medium text-blue-600 hover:underline'
                        >
                          #{order.order_number}
                        </button>
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>Rs {order.total_price}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          disabled={saving}
                          onValueChange={(value) =>
                            handleStatusChange(order.id, value)
                          }
                        >
                          <SelectTrigger className='w-32'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                <span className='capitalize'>{status}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {order.message ? (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleCopyMessage(order.message || '')
                            }
                            className='h-auto p-1'
                          >
                            <Copy className='h-4 w-4' />
                          </Button>
                        ) : (
                          <span className='text-gray-400'>No message</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>{' '}
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </div>
          {hasChanges && (
            <div className='flex justify-end gap-2 border-t p-4'>
              <Button
                variant='outline'
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
