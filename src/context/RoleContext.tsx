'use client';
import { createContext, useContext } from 'react';

const RoleContext = createContext<string>('');

export const RoleProvider = ({
  children,
  value
}: {
  children: React.ReactNode;
  value: string;
}) => <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;

export const useRole = () => useContext(RoleContext);
