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
    items: [
      {
        title: 'Low Stock Products',
        url: '/dashboard/overview/low-stock-products',
        isActive: false,
        group: 'Overview'
      },
      {
        title: 'Unpaid Invoices',
        url: '/dashboard/overview/unpaid-invoices',
        isActive: false,
        group: 'Overview'
      },
      {
        title: 'Profit',
        url: '/dashboard/overview/profit',
        isActive: false,
        group: 'Overview'
      }
    ]
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
