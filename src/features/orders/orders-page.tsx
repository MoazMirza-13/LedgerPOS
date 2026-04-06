'use client';

import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import Cookies from 'js-cookie';
import { OrdersTable } from '@/features/orders/orders-table';
import { OrderDetailsModal } from '@/features/orders/order-details-modal';
import { TenantAmountInput } from '@/features/orders/tenant-amount-input';
import { Order } from 'types';

const POLL_INTERVAL = 1 * 60 * 1000;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [delivery, setDelivery] = useState<number>(0);

  const fetchOrders = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error('Failed to fetch orders.');
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const fetchTenantAmounts = async () => {
    try {
      const supabase = createClient();
      const encodedStoreName = Cookies.get('currentStore');
      if (!encodedStoreName) throw new Error('Store cookie not found');
      const storeName = decodeURIComponent(encodedStoreName);

      const { data, error } = await supabase
        .from('tenants')
        .select('min_order, delivery')
        .eq('name', storeName)
        .single();

      if (error) throw error;

      setMinOrder(Number(data.min_order) || 0);
      setDelivery(Number(data.delivery) || 0);
    } catch {
      toast.error('Failed to fetch store settings');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTenantAmounts();
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
        <TenantAmountInput
          field='min_order'
          label='Minimum Store Order Amount'
          description='The amount added here will be shown to users on mobile app'
          initialValue={minOrder}
        />
        <TenantAmountInput
          field='delivery'
          label='Delivery Charge'
          description='The delivery fee shown to users on the mobile app'
          initialValue={delivery}
        />
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
