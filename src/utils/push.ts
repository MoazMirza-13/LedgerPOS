import { createClient } from '@/utils/supabase/client';

const PUSH_REGISTERED_KEY = 'push_subscription_registered';
let registrationPromise: Promise<void> | null = null;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)));
}

export async function registerPushSubscription(): Promise<void> {
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
      console.warn('[PUSH] ❌ Push not supported on this browser — exiting');
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('[PUSH] ❌ Permission not granted — exiting');
      return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();

    if (existing) {
      const alreadyRegistered = localStorage.getItem(PUSH_REGISTERED_KEY);

      if (alreadyRegistered === existing.endpoint) {
        return;
      }

      await saveSubscriptionToSupabase(existing);
      localStorage.setItem(PUSH_REGISTERED_KEY, existing.endpoint);
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });

    await saveSubscriptionToSupabase(subscription);
    localStorage.setItem(PUSH_REGISTERED_KEY, subscription.endpoint);
  } catch (err: any) {
    console.error('[PUSH] ❌ Error in doRegister');
  }
}

async function saveSubscriptionToSupabase(
  subscription: PushSubscription
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn('[PUSH] ❌ No user logged in');
    return;
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      profile_id: user.id
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.error('[PUSH] ❌ upsert failed');
    return;
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
        localStorage.removeItem(PUSH_REGISTERED_KEY);
      }

      await subscription.unsubscribe();
    }
  } catch (err) {
    console.error('[PUSH] ❌ Error in unregister');
  }
}
