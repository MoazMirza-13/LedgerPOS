import { createClient as Client } from './supabase/client';
import { redirect } from 'next/navigation';

export const signOut = async () => {
  const supabase = Client();
  await supabase.auth.signOut();
  redirect(`/`);
};
