import { createClient } from '@/utils/supabase/client';

const PUSH_REGISTERED_KEY = 'push_subscription_registered';

// Promise-based lock — queues concurrent calls instead of dropping them
let registrationPromise: Promise<void> | null = null;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)));
}

export async function registerPushSubscription(): Promise<void> {
  // If already running, wait for it to finish and return — don't start another
  if (registrationPromise) {
    return registrationPromise;
  }

  registrationPromise = _doRegister();

  try {
    await registrationPromise;
  } finally {
    registrationPromise = null;
  }
}

async function _doRegister(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();

    if (existing) {
      const alreadyRegistered = localStorage.getItem(PUSH_REGISTERED_KEY);
      if (alreadyRegistered === existing.endpoint) {
        // Already saved in DB — do nothing
        return;
      }
      // Exists in browser but not saved in DB
      await saveSubscriptionToSupabase(existing);
      localStorage.setItem(PUSH_REGISTERED_KEY, existing.endpoint);
      return;
    }

    // No subscription exists — create exactly one
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });

    await saveSubscriptionToSupabase(subscription);
    localStorage.setItem(PUSH_REGISTERED_KEY, subscription.endpoint);
  } catch (err) {
    console.error('err regarding push');
  }
}

async function saveSubscriptionToSupabase(
  subscription: PushSubscription
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      profile_id: user.id
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.error('push subscription save error');
  }
}

export async function unregisterPushSubscription(): Promise<void> {
  try {
    const supabase = createClient();

    const registration =
      await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();

    if (subscription) {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      if (!error) {
        // Clear localStorage so next login re-registers cleanly
        localStorage.removeItem(PUSH_REGISTERED_KEY);
      }

      await subscription.unsubscribe();
    }
  } catch (err) {
    // silent
  }
}
