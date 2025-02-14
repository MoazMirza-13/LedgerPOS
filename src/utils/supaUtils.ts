import { createClient as Sever } from '@/utils/supabase/server';

export async function getUserSession() {
  const supabase = await Sever();
  const { data: user, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return user;
}
