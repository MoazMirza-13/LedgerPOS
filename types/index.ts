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
  group: string;
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
  product_code: string;
  description: string;
  created_at: string;
  cost_price: number;
  selling_price: number;
  id: string;
  category_id: string;
  img_url: string[];
  brand_id: string;
  variants: string[];
  in_stock: boolean;
  quantity_in_zafarwal: number;
  quantity_in_ghaziwal: number;
  quantity_in_lhr_road: number;
  quantity_in_eidgah_road: number;
  quantity_in_mandi_tile: number;
  quantity_in_mandi_bond: number;
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

export type Invoice = {
  id?: number;
  customer_name: string;
  customer_address?: string;
  customer_number?: string; // phone numbers can include "+92" etc
  total_price: number;
  invoice_items: Invoice_items[];
};

export type Invoice_items = {
  product_code: string;
  description?: string;
  quantity: number;
  price: number;
  boxes?: number;
  warehouse: string;
};

export type itemTable = 'categories' | 'products' | 'brands' | 'invoices';

export type itemData = Product | Category | Brand | Invoice;

export type nestedArray = {
  products: Product[];
  categories: Category[];
  brands: Brand[];
};
