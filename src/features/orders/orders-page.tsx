'use client';

import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { OrdersTable } from '@/features/orders/orders-table';
import { OrderDetailsModal } from '@/features/orders/order-details-modal';
import { MinOrderAmountInput } from '@/features/orders/min-order-amount-input';
import { Order } from 'types';

const POLL_INTERVAL = 1 * 60 * 1000;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch orders.');
    }

    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Polling — only for keeping the UI table fresh
  useEffect(() => {
    const interval = setInterval(fetchOrders, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className='min-h-screen w-full'>
      <div className='py-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight'>Orders</h1>
          <p className='mb-4 text-sm text-muted-foreground'>Manage orders</p>
          <Separator />
        </div>
        <MinOrderAmountInput />
        <OrdersTable
          orders={orders}
          loading={loading}
          onOrderClick={(order) => {
            setSelectedOrder(order);
            setModalOpen(true);
          }}
          onOrdersUpdated={fetchOrders}
        />
      </div>

      <OrderDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        order={selectedOrder}
      />
    </main>
  );
}
