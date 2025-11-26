'use client';

import { ReactNode } from 'react';
import { useRole } from '@/context/RoleContext';

interface RoleGateClient {
  allow: string | string[];
  children: ReactNode;
}

export default function RoleGate({ allow, children }: RoleGateClient) {
  const currentRole = useRole();
  const allowedRoles = Array.isArray(allow) ? allow : [allow];

  if (!allowedRoles.includes(currentRole)) return null;

  return <>{children}</>;
}
