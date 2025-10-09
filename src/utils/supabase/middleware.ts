import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // handle invalid / missing role
    const currentRole = request.cookies.get('currentRole')?.value;
    const allowedRoles = ['admin', 'super_admin'];
    if (
      request.nextUrl.pathname.startsWith('/dashboard') &&
      (!currentRole || !allowedRoles.includes(currentRole))
    ) {
      await supabase.auth.signOut();

      const redirect = NextResponse.redirect(new URL('/', request.url));
      redirect.cookies.delete('currentRole');
      return redirect;
    }

    // protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') && user.error) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (request.nextUrl.pathname === '/' && !user.error) {
      return NextResponse.redirect(new URL('/dashboard/overview', request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
