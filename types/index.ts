import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export type Product = {
  title: string;
  description: string;
  created_at: string;
  price: number;
  id: string;
  category_id: string;
  img_url: string;
  brand_id: string;
  variants: string[];
  // for category and brand title in table
  categories?: Category;
  brands?: Brand;
};

export type Category = {
  title: string;
  created_at: string;
  id: number;
  description: string;
};

// currently same, schema might get updated later
export type Brand = {
  title: string;
  created_at: string;
  id: number;
  description: string;
};

export type itemTable = 'categories' | 'products' | 'brands';

export type itemData = Product | Category | Brand;
