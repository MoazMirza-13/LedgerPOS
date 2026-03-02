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

  // Handle push permission + registration
  useEffect(() => {
    if (!('Notification' in window)) return;

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // iOS PWA → ALWAYS require user click
    if (isIos && isStandalone && Notification.permission !== 'granted') {
      showEnableToast();
      return;
    }

    // Other devices
    if (Notification.permission === 'granted') {
      registerPushSubscription();
    } else if (Notification.permission === 'default') {
      showEnableToast();
    }

    function showEnableToast() {
      const toastShown = sessionStorage.getItem('push_toast_shown');
      if (toastShown) return;
      sessionStorage.setItem('push_toast_shown', 'true');

      setTimeout(() => {
        toast('Enable order notifications', {
          description: 'Get notified instantly when new orders arrive.',
          duration: Infinity,
          action: {
            label: 'Enable',
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

  return null;
}
