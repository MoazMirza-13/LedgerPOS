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
  discount: number;
  id: string;
  category_id: string;
  brand_id: string;
  img_url: string[];
  variants: string[];
  in_stock: boolean;
  quantity: number;
  min_quantity: number;
  // for category and brand title in table
  categories?: Category;
  brands?: Brand;
};

export type Category = {
  title: string;
  created_at: string;
  id: string;
  description: string;
  img: string;
};

// currently same as category, schema might get updated later
export type Brand = {
  title: string;
  created_at: string;
  id: string;
  description: string;
  img: string;
};

export type Invoice = {
  id?: string;
  customer_name: string;
  customer_address?: string;
  customer_number?: string; // phone numbers can include "+92" etc
  total_price: number;
  invoice_items: Invoice_items[];
  created_at: string;
  invoice_number?: number;
  edited?: boolean;
  payment: boolean;
};

export type Invoice_items = {
  product_code?: string | null;
  description?: string | null;
  quantity: number;
  price: number;
  boxes?: number | null;
  warehouse?: string | null;
  optional_item?: string | null;
  invoice_id?: string;
  product_id?: string;
};

export type Order = {
  id: string;
  tenant_id: string;
  customer_name: string;
  customer_number?: string | null;
  customer_address?: string | null;
  total_price: number;
  message?: string | null;
  status: 'pending' | 'completed' | 'delivered' | 'canceled' | string;
  created_at: string;
  order_number?: number;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
};

export interface ProfitData {
  invoiceId: string;
  invoiceNumber: number;
  customerName: string;
  date: string;
  items: {
    productCode: string;
    quantity: number;
    sellingPrice: number;
    costPrice: number;
    profit: number;
  }[];
  totalProfit: number;
}

export type itemTable =
  | 'categories'
  | 'products'
  | 'brands'
  | 'invoices'
  | 'orders';

export type itemData = Product | Category | Brand | Invoice | Order;

export type nestedArray = {
  products: Product[];
  categories: Category[];
  brands: Brand[];
};
