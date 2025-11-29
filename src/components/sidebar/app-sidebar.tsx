'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { Store } from 'lucide-react';
import * as React from 'react';
import { SidebarGroupSection } from './sidebar-group-section';
import RoleGate from '../role-gate/RoleGateClient';

interface AppSidebarProps {
  // props here
}

export const company = {
  name: 'LedgerPOS',
  logo: Store,
  plan: 'Admin Panel'
};

export default function AppSidebar({}: AppSidebarProps) {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className='flex gap-2 py-2 text-sidebar-accent-foreground dark:text-sidebar-foreground'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <company.logo className='size-4' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>{company.name}</span>
            <span className='truncate text-xs'>{company.plan}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <RoleGate allow='super_admin'>
          <SidebarGroupSection
            title='Overview'
            items={navItems.filter((item) => item.group === 'Overview')}
          />
        </RoleGate>
        <SidebarGroupSection
          title='Stock Management'
          items={navItems.filter((item) => item.group === 'Stock Management')}
        />
        <RoleGate allow='super_admin'>
          <SidebarGroupSection
            title='Billing'
            items={navItems.filter((item) => item.group === 'Billing')}
          />
          <SidebarGroupSection
            title='Purchasing'
            items={navItems.filter((item) => item.group === 'Purchasing')}
          />
        </RoleGate>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
