'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { registerPushSubscription } from '@/utils/push';

export function OrderNotifier() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio
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

  // Register push subscription once globally
  useEffect(() => {
    registerPushSubscription();
  }, []);

  // Listen for SW message — plays sound + shows toast from any page
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PLAY_ORDER_SOUND') {
        // Play sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((err) => {
            console.log('Audio play failed:', err);
          });
        }
        // Show toast from any page
        toast.success('New Order Received!', {
          description: event.data?.orderNumber
            ? `Order #${event.data.orderNumber} has been placed.`
            : undefined,
          duration: 8000, // stays longer so admin can notice
          action: {
            label: 'View Orders',
            onClick: () => (window.location.href = '/dashboard/orders')
          }
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return null; // renders nothing, just runs logic
}
