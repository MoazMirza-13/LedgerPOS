import { createClient } from '@/utils/supabase/client';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)));
}

export async function registerPushSubscription(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      // console.warn('Push notifications not supported on this browser');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      // Only save if not already in DB — check by endpoint
      const supabase = createClient();
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('endpoint', existing.endpoint)
        .single();

      if (!data) {
        // Not in DB yet — save it (e.g. new login, DB was cleared)
        await saveSubscriptionToSupabase(existing);
      } else {
        // console.log('✅ Already subscribed, skipping save');
      }
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });

    await saveSubscriptionToSupabase(subscription);
    // console.log('✅ Push subscription registered successfully');
  } catch (err) {
    // console.error('❌ Failed to register push subscription:', err);
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

  if (!user) {
    // console.warn('No user logged in, cannot save push subscription');
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
    // console.error('❌ Failed to save push subscription:', error);
    return;
  }

  // console.log('✅ Subscription saved for user:', user.id);
}

export async function unregisterPushSubscription(): Promise<void> {
  try {
    const supabase = createClient();

    // Get the current subscription endpoint before unsubscribing
    const registration =
      await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();

    if (subscription) {
      // 1. Remove from Supabase DB first
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      if (error) {
        // console.error('❌ Failed to remove push subscription from DB:', error);
      }

      // 2. Unsubscribe browser from push
      await subscription.unsubscribe();
      // console.log('✅ Push subscription removed');
    }
  } catch (err) {
    // console.error('❌ Failed to unregister push subscription:', err);
  }
}
