'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { initServiceWorker, registerPushSubscription } from '@/utils/push';
import Script from 'next/script';

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

  useEffect(() => {
    // Pre-register SW silently on page load — no permission request
    initServiceWorker();

    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      registerPushSubscription();
    } else if (Notification.permission === 'default') {
      const toastShown = sessionStorage.getItem('push_toast_shown');
      if (toastShown) return;
      sessionStorage.setItem('push_toast_shown', 'true');

      setTimeout(() => {
        toast('Enable order notifications', {
          description: 'Get notified instantly when new orders arrive.',
          duration: Infinity,
          action: {
            label: 'Enable',
            // This tap directly triggers registerPushSubscription
            // iOS sees this as a valid user gesture ✅
            onClick: () => registerPushSubscription()
          },
          cancel: {
            label: 'Dismiss',
            onClick: () => toast.dismiss()
          }
        });
      }, 1000);
    }
  }, []);

  // Listen for SW message — play sound + show toast
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
        toast.success('New Order Received!', {
          description: event.data?.orderNumber
            ? `Order #${event.data.orderNumber} has been placed.`
            : undefined,
          duration: 8000,
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

  return (
    <>
      <Script
        src='//cdn.jsdelivr.net/npm/eruda'
        onLoad={() => {
          // @ts-ignore
          window.eruda?.init();
        }}
      />
    </>
  );
}
