import { createClient } from '@/utils/supabase/server';

export async function getUserSession() {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return user;
}
