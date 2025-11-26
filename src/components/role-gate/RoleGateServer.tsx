import { cookies } from 'next/headers';
import { ReactNode } from 'react';

interface RoleGateProps {
  allow: string | string[];
  children: ReactNode;
}

export default async function RoleGate({ allow, children }: RoleGateProps) {
  const cookieStore = await cookies();
  const currentRole = cookieStore.get('currentRole')?.value || '';
  const allowedRoles = Array.isArray(allow) ? allow : [allow];

  if (!allowedRoles.includes(currentRole)) return null;

  return <>{children}</>;
}
