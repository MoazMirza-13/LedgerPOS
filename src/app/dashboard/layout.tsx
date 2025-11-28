import Header from '@/components/layout/header';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { RoleProvider } from '@/context/RoleContext';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'NS | Dashboard',
  description: 'Admin panel for NS.'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

  const currentRole = cookieStore.get('currentRole')?.value || '';

  return (
    <RoleProvider value={currentRole}>
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </RoleProvider>
  );
}
