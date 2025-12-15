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

    // const currentRole = request.cookies.get('currentRole')?.value;

    // // invalid / missing role
    // if (!user.error) {
    //   const { data: userRoleData } = await supabase
    //     .from('user_roles')
    //     .select('role')
    //     .eq('user_id', user.data.user?.id)
    //     .single();

    //   const userRole = userRoleData?.role;

    //   if (currentRole !== userRole) {
    //     await supabase.auth.signOut();
    //     const redirect = NextResponse.redirect(new URL('/', request.url));
    //     redirect.cookies.delete('currentRole');
    //     return redirect;
    //   }
    // }

    // protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') && user.error) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    //  const homePage = currentRole === 'super_admin' ? 'overview' : 'products';
    const homePage = 'overview';

    if (request.nextUrl.pathname === '/' && !user.error) {
      return NextResponse.redirect(
        new URL(`/dashboard/${homePage}`, request.url)
      );
    }

    // if (
    //       request.nextUrl.pathname.includes('new') &&
    //       !user.error &&
    //       currentRole !== 'super_admin'
    //     ) {
    //       return NextResponse.redirect(
    //         new URL(`/dashboard/${homePage}`, request.url)
    //       );
    //     }

    //     // keep them separate as might need to add complex logic in future

    //     if (
    //       request.nextUrl.pathname.includes('overview') &&
    //       !user.error &&
    //       currentRole !== 'super_admin'
    //     ) {
    //       return NextResponse.redirect(
    //         new URL(`/dashboard/${homePage}`, request.url)
    //       );
    //     }

    //     if (
    //       request.nextUrl.pathname.includes('invoices') &&
    //       !user.error &&
    //       currentRole !== 'super_admin'
    //     ) {
    //       return NextResponse.redirect(
    //         new URL(`/dashboard/${homePage}`, request.url)
    //       );
    //     }

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
