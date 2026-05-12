import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  const url = request.nextUrl;
  if (
    url.pathname === '/dashboard/products' &&
    url.searchParams.get('updated') === 'true'
  ) {
    return NextResponse.next(); // skip middleware
  }

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
    let currentRole = request.cookies.get('currentRole')?.value;
    let currentStore = request.cookies.get('currentStore')?.value;

    if (!user.error) {
      const { data } = await supabase.rpc('current_user_role_and_tenant');
      const userRole = data?.[0]?.role;
      const userStore = data?.[0]?.tenant_name;
      const tenantStatus = data?.[0]?.tenant_active;

      if (userRole !== 'super_owner' && tenantStatus === false) {
        await supabase.auth.signOut();
        const redirect = NextResponse.redirect(new URL('/', request.url));
        redirect.cookies.delete('currentRole');
        redirect.cookies.delete('currentStore');
        return redirect;
      }

      if (!currentRole || !currentStore) {
        // if its a first time req
        response.cookies.set('currentRole', userRole, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30 * 13
        });
        response.cookies.set('currentStore', userStore, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30 * 13
        });

        // Update local variables
        currentRole = userRole;
        currentStore = userStore;
      }

      if (currentRole !== userRole) {
        await supabase.auth.signOut();
        const redirect = NextResponse.redirect(new URL('/', request.url));
        redirect.cookies.delete('currentRole');
        redirect.cookies.delete('currentStore');
        return redirect;
      }

      if (userRole !== 'super_owner' && currentStore !== userStore) {
        await supabase.auth.signOut();
        const redirect = NextResponse.redirect(new URL('/', request.url));
        redirect.cookies.delete('currentRole');
        redirect.cookies.delete('currentStore');
        return redirect;
      }
    }

    // protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') && user.error) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const homePage =
      currentRole === 'super_owner'
        ? 'super-user'
        : currentRole === 'super_admin'
          ? // ? 'overview'
            'products'
          : 'products';

    if (request.nextUrl.pathname === '/' && !user.error) {
      return NextResponse.redirect(
        new URL(`/dashboard/${homePage}`, request.url)
      );
    }

    const superAdminOnly = ['new', 'overview', 'invoices'];

    if (
      !user.error &&
      currentRole !== 'super_admin' &&
      superAdminOnly.some((p) => request.nextUrl.pathname.includes(p))
    ) {
      return NextResponse.redirect(
        new URL(`/dashboard/${homePage}`, request.url)
      );
    }

    if (
      !user.error &&
      currentRole !== 'super_owner' &&
      request.nextUrl.pathname.includes('super')
    ) {
      return NextResponse.redirect(
        new URL(`/dashboard/${homePage}`, request.url)
      );
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
