import { createClient as sessionClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserSession() {
  try {
    const supabase = await sessionClient();
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    return user;
  } catch (err) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // 1️⃣ Check env vars
    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      throw new Error('Server Misconfiguration');
    }

    // 2️⃣ Get current session
    const currentUser = await getUserSession();
    if (!currentUser) return new Response('Unauthorized', { status: 401 });

    // 3️⃣ Check current user's role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'super_owner') {
      return new Response('Forbidden', { status: 403 });
    }

    // all checks are passed, now do the job

    const { userId } = await req.json();
    if (!userId) return new Response('User ID required', { status: 400 });

    // Delete user profile
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileErr) return new Response(profileErr.message, { status: 400 });

    // Delete user from Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) return new Response(authError.message, { status: 400 });

    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(err.message || 'Internal Server Error', {
      status: 500
    });
  }
}
