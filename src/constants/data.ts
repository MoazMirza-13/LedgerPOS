import { NavItem } from 'types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    shortcut: ['g', 'd'],
    isActive: false,
    group: 'Overview',
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: 'product',
    shortcut: ['g', 'p'],
    isActive: false,
    group: 'Stock Management',
    items: [] // No child items
  },
  {
    title: 'Categories',
    url: '/dashboard/categories',
    icon: 'category',
    shortcut: ['g', 'c'],
    isActive: false,
    group: 'Stock Management',
    items: [] // No child items
  },
  {
    title: 'Brands',
    url: '/dashboard/brands',
    icon: 'brand',
    shortcut: ['g', 'b'],
    isActive: false,
    group: 'Stock Management',
    items: [] // No child items
  },
  {
    title: 'Invoices',
    url: '/dashboard/invoices',
    icon: 'invoice',
    shortcut: ['g', 'i'],
    isActive: false,
    group: 'Billing',
    items: [] // No child items
  }
];

export const warehouses = [
  { key: 'Ghaziwal', label: 'Ghaziwal' },
  { key: 'Zafarwal', label: 'Zafarwal' },
  { key: 'LhrRoad', label: 'Lhr Road' },
  { key: 'EidgahRoad', label: 'Eidgah Road' },
  { key: 'MandiTile', label: 'Mandi Tile' },
  { key: 'MandiBond', label: 'Mandi Bond' }
];

// demo for dashboard
export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
