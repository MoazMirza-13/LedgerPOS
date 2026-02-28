'use client';

import { useEffect, useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { OrdersTable } from '@/features/orders/orders-table';
import { OrderDetailsModal } from '@/features/orders/order-details-modal';
import { MinOrderAmountInput } from '@/features/orders/min-order-amount-input';
import { Order } from 'types';
import { registerPushSubscription } from '@/utils/push';

const POLL_INTERVAL = 1 * 60 * 1000;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const highestOrderRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio — only used via SW message now
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new_order.mp3');
    audioRef.current.load();

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
    }
  }, []);

  // Register push subscription once
  useEffect(() => {
    registerPushSubscription();
  }, []);

  // Listen for SW message to play sound
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PLAY_ORDER_SOUND') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((err) => {
            console.log('Audio play failed:', err);
          });
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
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
      // ✅ Only show toast — SW handles notification and sound
      if (document.visibilityState === 'visible') {
        toast.success('New Order Received!');
      }
      // ❌ Removed: manual Notification, removed: audioRef.play()
      // Everything is now driven by the service worker push
    }

    highestOrderRef.current = Math.max(highestOrderRef.current, maxOrderNumber);
    initializedRef.current = true;
    setOrders(data as Order[]);
  };

  // Initial load
  useEffect(() => {
    fetchOrders(false);
  }, []);

  // Polling — still needed to refresh the orders table UI
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, POLL_INTERVAL);
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
