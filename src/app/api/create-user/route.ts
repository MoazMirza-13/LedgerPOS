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

    // 4️⃣ Parse request body
    const { email, password, tenantId, role } = await req.json();

    // 5️⃣ Validate role from frontend
    if (!['admin', 'super_admin'].includes(role)) {
      return new Response('Bad Request', { status: 400 });
    }

    // 6️⃣ Create user
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (userError || !userData.user) {
      return new Response('Auth error', { status: 400 });
    }

    // 7️⃣ Create profile
    const { error: newProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        user_email: email,
        tenant_id: tenantId,
        role
      });

    if (newProfileError) {
      // Rollback auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      } catch (rollbackErr) {}
      return new Response(newProfileError.message, { status: 400 });
    }

    // 8️⃣ Return success
    return Response.json({ message: 'New user has been created' });
  } catch (err: any) {
    return new Response('Internal Server Error', {
      status: 500
    });
  }
}
