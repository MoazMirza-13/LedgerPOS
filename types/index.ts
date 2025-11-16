import { Icons } from '@/components/icons';
import { warehouses } from '@/constants/data';

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
  min_quantity: number;
  boxes: number;
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
  id: string;
  description: string;
};

// currently same as category, schema might get updated later
export type Brand = {
  title: string;
  created_at: string;
  id: string;
  description: string;
};

export type Invoice = {
  id?: string;
  customer_name: string;
  customer_address?: string;
  customer_number?: string; // phone numbers can include "+92" etc
  total_price: number;
  invoice_items: Invoice_items[];
  created_at: string;
  reference?: string;
  invoice_number?: number;
  references?: Reference;
};

export type Invoice_items = {
  product_code: string;
  description?: string;
  quantity: number;
  price: number;
  boxes?: number;
  warehouse: string;
};

export type PurchasingInvoice = {
  id?: string;
  total_price: number;
  created_at?: string;
  supplier?: string | null;
  invoice_number: number;
  purchasing_invoice_items: PurchasingInvoiceItems[];
  suppliers?: Supplier;
};

export type PurchasingInvoiceItems = {
  product_code: string;
  description?: string;
  quantity?: number;
  price: number;
  warehouse_distribution: Partial<
    Record<(typeof warehouses)[number]['key'], number>
  >;
};

export type Reference = {
  name: string;
  balance: number;
  id?: string;
  created_at?: string;
};

// currently same as reference, schema might get updated later
export type Supplier = {
  name: string;
  balance: number;
  id?: string;
  created_at?: string;
};

export type References_ledger = {
  id?: string;
  name: string;
  invoice_number?: number;
  description: string;
  dr?: number;
  cr: number;
  balance?: number;
  reference_id: string;
  created_at: string;
};

export type Suppliers_ledger = {
  id?: string;
  name: string;
  invoice_number?: number;
  description: string;
  dr?: number;
  cr: number;
  balance?: number;
  supplier_id: string;
  created_at: string;
};

export type itemTable =
  | 'categories'
  | 'products'
  | 'brands'
  | 'invoices'
  | 'references'
  | 'references_ledger'
  | 'suppliers'
  | 'purchasing_invoices'
  | 'suppliers_ledger';

export type itemData =
  | Product
  | Category
  | Brand
  | Invoice
  | Reference
  | References_ledger
  | Supplier
  | PurchasingInvoice
  | Suppliers_ledger;

export type nestedArray = {
  products: Product[];
  categories: Category[];
  brands: Brand[];
};
