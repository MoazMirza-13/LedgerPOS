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
  console.log('[PUSH] registerPushSubscription called');
  if (registrationPromise) {
    console.log('[PUSH] already in progress, waiting...');
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
    console.log('[PUSH] _doRegister started');
    console.log(
      '[PUSH] serviceWorker supported:',
      'serviceWorker' in navigator
    );
    console.log('[PUSH] PushManager supported:', 'PushManager' in window);
    console.log('[PUSH] Notification supported:', 'Notification' in window);

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[PUSH] ❌ Push not supported on this browser — exiting');
      return;
    }

    console.log('[PUSH] requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('[PUSH] permission result:', permission);

    if (permission !== 'granted') {
      console.warn('[PUSH] ❌ Permission not granted — exiting');
      return;
    }

    console.log('[PUSH] registering service worker...');
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[PUSH] SW registered, waiting for ready...');
    await navigator.serviceWorker.ready;
    console.log('[PUSH] SW ready, state:', registration.active?.state);

    console.log('[PUSH] checking existing subscription...');
    const existing = await registration.pushManager.getSubscription();
    console.log(
      '[PUSH] existing subscription:',
      existing ? existing.endpoint : 'none'
    );

    if (existing) {
      const alreadyRegistered = localStorage.getItem(PUSH_REGISTERED_KEY);
      console.log(
        '[PUSH] localStorage entry:',
        alreadyRegistered ? 'found' : 'not found'
      );
      console.log(
        '[PUSH] endpoints match:',
        alreadyRegistered === existing.endpoint
      );

      if (alreadyRegistered === existing.endpoint) {
        console.log('[PUSH] ✅ Already registered and saved — skipping');
        return;
      }

      console.log('[PUSH] saving existing subscription to DB...');
      await saveSubscriptionToSupabase(existing);
      localStorage.setItem(PUSH_REGISTERED_KEY, existing.endpoint);
      console.log('[PUSH] ✅ Existing subscription saved');
      return;
    }

    console.log('[PUSH] no existing subscription, creating new one...');
    console.log(
      '[PUSH] VAPID key present:',
      !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    );

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });

    console.log('[PUSH] new subscription created:', subscription.endpoint);
    await saveSubscriptionToSupabase(subscription);
    localStorage.setItem(PUSH_REGISTERED_KEY, subscription.endpoint);
    console.log('[PUSH] ✅ New subscription saved successfully');
  } catch (err: any) {
    console.error('[PUSH] ❌ Error in _doRegister:', err);
    console.error('[PUSH] error name:', err?.name);
    console.error('[PUSH] error message:', err?.message);
    console.error('[PUSH] error code:', err?.code);
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
