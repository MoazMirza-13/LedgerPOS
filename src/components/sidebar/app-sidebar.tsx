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
  currentStore: string;
}

export const company = {
  name: 'NS',
  logo: Store,
  plan: 'Admin Panel'
};

export default function AppSidebar({ currentStore }: AppSidebarProps) {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group'>
        <div className='flex gap-2 py-2 text-sidebar-accent-foreground dark:text-sidebar-foreground'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <company.logo className='size-4' />
          </div>
          <div className='grid flex-1 overflow-hidden text-left text-sm leading-tight transition-all duration-200 group-data-[state=collapsed]:max-h-0 group-data-[state=expanded]:max-h-20 group-data-[state=collapsed]:opacity-0 group-data-[state=expanded]:opacity-100 group-data-[state=expanded]:delay-150'>
            <span className='line-clamp-2 font-semibold'>
              {currentStore || company.name}
            </span>
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
        <RoleGate allow={['super_admin', 'admin']}>
          <SidebarGroupSection
            title='Stock Management'
            items={navItems.filter((item) => item.group === 'Stock Management')}
          />
        </RoleGate>
        <RoleGate allow='super_admin'>
          <SidebarGroupSection
            title='Billing'
            items={navItems.filter((item) => item.group === 'Billing')}
          />
        </RoleGate>
        <RoleGate allow='super_owner'>
          <SidebarGroupSection
            title='Super User Dashboard'
            items={navItems.filter((item) => item.group === 'Super User')}
          />
        </RoleGate>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
