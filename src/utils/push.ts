import { createClient } from '@/utils/supabase/client';

const PUSH_REGISTERED_KEY = 'push_subscription_registered';
let registrationPromise: Promise<void> | null = null;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)));
}

// Called on page load — only registers SW, no permission request
export async function initServiceWorker(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    if (registration.active?.state !== 'activated') {
      await new Promise<void>((resolve) => {
        const sw =
          registration.installing ??
          registration.waiting ??
          registration.active;
        if (!sw || sw.state === 'activated') {
          resolve();
          return;
        }
        sw.addEventListener('statechange', function handler(e) {
          if ((e.target as ServiceWorker).state === 'activated') {
            sw.removeEventListener('statechange', handler);
            resolve();
          }
        });
      });
    }

    console.log('[PUSH] SW pre-registered and activated');

    // Check if already subscribed
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      const alreadyRegistered = localStorage.getItem(PUSH_REGISTERED_KEY);
      if (alreadyRegistered === existing.endpoint) {
        console.log('[PUSH] ✅ Already registered — skipping');
        return;
      }
      await saveSubscriptionToSupabase(existing);
      localStorage.setItem(PUSH_REGISTERED_KEY, existing.endpoint);
    }
  } catch (err) {
    console.error('[PUSH] SW init error:', err);
  }
}

// Called DIRECTLY from button tap — no awaits before subscribe
export async function registerPushSubscription(): Promise<void> {
  if (registrationPromise) return registrationPromise;
  registrationPromise = _doRegister();
  try {
    await registrationPromise;
  } finally {
    registrationPromise = null;
  }
}

async function _doRegister(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // Request permission first — must be from user gesture
    const permission = await Notification.requestPermission();
    console.log('[PUSH] permission result:', permission);
    if (permission !== 'granted') return;

    // Get already-initialized registration
    const registration =
      await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) {
      console.error('[PUSH] No SW registration found');
      return;
    }

    // Subscribe immediately — still within gesture call stack
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await saveSubscriptionToSupabase(existing);
      localStorage.setItem(PUSH_REGISTERED_KEY, existing.endpoint);
      return;
    }

    console.log('[PUSH] subscribing...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });

    console.log('[PUSH] ✅ Subscribed:', subscription.endpoint);
    await saveSubscriptionToSupabase(subscription);
    localStorage.setItem(PUSH_REGISTERED_KEY, subscription.endpoint);
  } catch (err: any) {
    console.error('[PUSH] ❌ Error:', err?.name, err?.message);
  }
}

async function saveSubscriptionToSupabase(
  subscription: PushSubscription
): Promise<void> {
  console.log('[PUSH] saveSubscriptionToSupabase called');
  const supabase = createClient();

  console.log('[PUSH] getting current user...');
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  console.log(
    '[PUSH] user:',
    user?.id ?? 'null',
    userError ? `error: ${userError.message}` : ''
  );

  if (!user) {
    console.warn('[PUSH] ❌ No user logged in — cannot save');
    return;
  }

  console.log('[PUSH] upserting to push_subscriptions...');
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      profile_id: user.id
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.error(
      '[PUSH] ❌ DB upsert failed:',
      error.message,
      error.details,
      error.hint
    );
    return;
  }

  console.log('[PUSH] ✅ Saved to DB for user:', user.id);
}

export async function unregisterPushSubscription(): Promise<void> {
  console.log('[PUSH] unregisterPushSubscription called');
  try {
    const supabase = createClient();

    const registration =
      await navigator.serviceWorker.getRegistration('/sw.js');
    console.log('[PUSH] SW registration found:', !!registration);

    const subscription = await registration?.pushManager.getSubscription();
    console.log(
      '[PUSH] subscription to remove:',
      subscription?.endpoint ?? 'none'
    );

    if (subscription) {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('[PUSH] ❌ Failed to delete from DB:', error.message);
      } else {
        console.log('[PUSH] ✅ Deleted from DB');
        localStorage.removeItem(PUSH_REGISTERED_KEY);
      }

      await subscription.unsubscribe();
      console.log('[PUSH] ✅ Browser unsubscribed');
    }
  } catch (err) {
    console.error('[PUSH] ❌ Error in unregister:', err);
  }
}
