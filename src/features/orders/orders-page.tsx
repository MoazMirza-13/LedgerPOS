'use client';

import { useEffect, useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { OrdersTable } from '@/features/orders/orders-table';
import { OrderDetailsModal } from '@/features/orders/order-details-modal';
import { MinOrderAmountInput } from '@/features/orders/min-order-amount-input';

import { Order } from 'types';

const POLL_INTERVAL = 1 * 60 * 1000; // 1 minute

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const highestOrderRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new_order.mp3');
    audioRef.current.load();
  }, []);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const fetchOrders = async (notify = false) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      toast.error('Failed to fetch orders.');
      return;
    }

    const maxOrderNumber = Math.max(...data.map((o) => o.order_number ?? 0), 0);

    if (
      notify &&
      initializedRef.current &&
      maxOrderNumber > highestOrderRef.current
    ) {
      // Play sound even if tab is hidden
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log('Audio play failed:', err);
        });
      }

      toast.success('New Order Received!');

      // Try to show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order Received!', {
          body: `Order #${maxOrderNumber}`,
          icon: '/icon.png', // Add your icon path
          tag: 'new-order'
        });
      }
    }

    highestOrderRef.current = Math.max(highestOrderRef.current, maxOrderNumber);
    initializedRef.current = true;
    setOrders(data as Order[]);
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders(false);
  }, []);

  // Polling - ALWAYS runs, regardless of visibility
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true); // Always notify
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className='min-h-screen'>
      <div className='px-6 py-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight'>Orders</h1>
          <p className='mb-4 text-sm text-muted-foreground'>Manage orders</p>
          <Separator />
        </div>
        <MinOrderAmountInput />
        <OrdersTable
          orders={orders}
          onOrderClick={handleOrderClick}
          onOrdersUpdated={() => fetchOrders(false)}
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
