'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { OrdersTable } from '@/features/orders/orders-table';
import { OrderDetailsModal } from '@/features/orders/order-details-modal';
import { MinOrderAmountInput } from '@/features/orders/min-order-amount-input';
import { Order } from 'types';
import { Button } from '@/components/ui/button';

const POLL_INTERVAL = 1 * 60 * 1000; // 1 minute

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const highestOrderRef = useRef<number>(0);
  const wasHiddenRef = useRef(false);
  const initializedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new_order.mp3');
  }, []);

  // Enable browser notifications
  const enableNotifications = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notifications permission denied');
      }
    } catch {
      toast.error('Failed to enable notifications');
    }
  }, []);

  // Send browser notification
  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (notificationsEnabled && 'Notification' in window) {
        new Notification(title, { body });
      }
    },
    [notificationsEnabled]
  );

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
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

    if (initializedRef.current && maxOrderNumber > highestOrderRef.current) {
      const newOrdersCount = maxOrderNumber - highestOrderRef.current;

      // Play sound if tab is visible
      if (document.visibilityState === 'visible' && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }

      // Send notification regardless of tab visibility
      sendNotification(
        'New Order Received!',
        `${newOrdersCount} new order(s) added.`
      );

      toast.success(`${newOrdersCount} new order(s) received!`);
    }

    highestOrderRef.current = Math.max(highestOrderRef.current, maxOrderNumber);
    initializedRef.current = true;
    setOrders(data as Order[]);
  }, [sendNotification]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Visibility change handling
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && wasHiddenRef.current) {
        fetchOrders();
        wasHiddenRef.current = false;
      } else if (document.visibilityState === 'hidden') {
        wasHiddenRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchOrders]);

  return (
    <main className='min-h-screen'>
      <div className='px-6 py-4'>
        <div>
          <div className='flex justify-between'>
            <div className='mb-4'>
              <h1 className='text-3xl font-bold tracking-tight'>Orders</h1>
              <p className='mb-4 text-sm text-muted-foreground'>
                Manage orders
              </p>
            </div>

            {/* Enable notifications button */}
            {!notificationsEnabled && (
              <div className='mb-4'>
                <Button onClick={enableNotifications}>
                  Enable Notifications
                </Button>
              </div>
            )}
          </div>
          <Separator className='mb-4' />
        </div>

        <MinOrderAmountInput />
        <OrdersTable
          orders={orders}
          onOrderClick={handleOrderClick}
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
