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
