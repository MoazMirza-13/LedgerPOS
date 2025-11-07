'use server';

import { cookies } from 'next/headers';
import { createClient } from '../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import {
  Brand,
  Category,
  Invoice,
  Invoice_items,
  itemData,
  Product,
  Reference
} from 'types';

export const getSupabaseClient = async () => {
  // for util functions
  return await createClient();
};

export async function signIn(credentials: { email: string; password: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    const { data: userRole, error: urError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user?.id)
      .single();

    if (error || urError) throw error;

    const currentRole = userRole?.role;
    const cookieStore = await cookies();
    cookieStore.set('currentRole', currentRole || '', {
      maxAge: 60 * 60 * 24 * 30 * 13
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete('currentRole');
  redirect('/');
}

export async function getUserSession() {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return user;
}

export async function productSubmit(
  values: {
    product: string;
    category: string | null;
    brand: string | null;
    costPrice: number;
    sellingPrice: number;
    minQuantity: number;
    boxes: number;
    quantityInWarehouses: {
      Zafarwal: number;
      Ghaziwal: number;
      EidgahRoad: number;
      LhrRoad: number;
      MandiBond: number;
      MandiTile: number;
    };
  },
  initialData: Product | null,
  imgPaths: string[]
) {
  try {
    const supabase = await createClient();

    if (initialData) {
      const { error } = await supabase
        .from('products')
        .update({
          product_code: values.product,
          cost_price: values.costPrice,
          selling_price: values.sellingPrice,
          category_id: values.category ? values.category : null,
          brand_id: values.brand ? values.brand : null,
          min_quantity: values.minQuantity,
          boxes: values.boxes,
          img_url: imgPaths,
          quantity_in_zafarwal: values.quantityInWarehouses.Zafarwal,
          quantity_in_ghaziwal: values.quantityInWarehouses.Ghaziwal,
          quantity_in_lhr_road: values.quantityInWarehouses.LhrRoad,
          quantity_in_eidgah_road: values.quantityInWarehouses.EidgahRoad,
          quantity_in_mandi_tile: values.quantityInWarehouses.MandiTile,
          quantity_in_mandi_bond: values.quantityInWarehouses.MandiBond
        })
        .eq('id', initialData.id)
        .select();
      if (error) throw error;

      revalidatePath('/dashboard/products');
      return { successUpdate: true };
    } else {
      if (imgPaths.length > 0) {
        const { error } = await supabase
          .from('products')
          .insert([
            {
              product_code: values.product,
              cost_price: values.costPrice,
              selling_price: values.sellingPrice,
              img_url: imgPaths,
              category_id: values.category ? values.category : null,
              brand_id: values.brand ? values.brand : null,
              min_quantity: values.minQuantity,
              boxes: values.boxes,
              quantity_in_zafarwal: values.quantityInWarehouses.Zafarwal,
              quantity_in_ghaziwal: values.quantityInWarehouses.Ghaziwal,
              quantity_in_lhr_road: values.quantityInWarehouses.LhrRoad,
              quantity_in_eidgah_road: values.quantityInWarehouses.EidgahRoad,
              quantity_in_mandi_tile: values.quantityInWarehouses.MandiTile,
              quantity_in_mandi_bond: values.quantityInWarehouses.MandiBond
            }
          ])
          .select();

        if (error) throw error;
        revalidatePath('/dashboard/products');
        return { successNew: true };
      }
    }
  } catch (error: any) {
    return { error };
  }
}

export async function categoryBrandSubmit(
  values: { title: string; description?: string },
  initialData: (Category | Brand) | null,
  type: string
) {
  try {
    const supabase = await createClient();

    if (!initialData) {
      const { error } = await supabase
        .from(type)
        .insert([{ title: values.title, description: values.description }])
        .select();
      if (error) throw error;
      revalidatePath(`/dashboard/${type}`);
      return { successNew: true };
    } else {
      const { error } = await supabase
        .from(type)
        .update([{ title: values.title, description: values.description }])
        .eq('id', initialData.id)
        .select();
      if (error) throw error;
      revalidatePath(`/dashboard/${type}`);
      return { successUpdate: true };
    }
  } catch (error: any) {
    return { error };
  }
}

export async function deleteContent(itemTable: string, itemData: itemData) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from(itemTable)
      .delete()
      .eq('id', itemData.id);
    if (!error) revalidatePath(`/dashboard/${itemTable}`);
    if (error) throw error;
  } catch (error: any) {
    return error;
  }
}

export const getDataById = async (type: string, id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(type)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getProductByCode = async (code: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_code', code)
    .single();

  if (error) return null;
  return data;
};

export const getCategoriesBrandsData = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('combined_categories_brands')
    .select('*');

  if (error) throw error;
  return data;
});

export const invoiceSubmit = async (
  values: Invoice,
  initialData: Invoice | null
) => {
  try {
    const supabase = await createClient();
    if (!initialData) {
      const { error } = await supabase.rpc(
        'create_invoice_with_items_warehouse',
        {
          customer_name: values.customer_name,
          customer_number: values.customer_number,
          customer_address: values.customer_address,
          total_price: values.total_price,
          invoice_number: values.invoice_number,
          items: values.invoice_items.map((item: Invoice_items) => ({
            product_code: item.product_code,
            description: item.description,
            quantity: item.quantity,
            boxes: item.boxes,
            price: item.price,
            warehouse: item.warehouse
          })),
          ...(values.reference !== '' ? { reference: values.reference } : {})
        }
      );
      if (error) throw error;
      revalidatePath(`/dashboard/invoices`);
      return { successNew: true };
    } else {
      const { error } = await supabase
        .from('invoices')
        .update([
          {
            customer_name: values.customer_name,
            customer_number: values.customer_number,
            customer_address: values.customer_address
          }
        ])
        .eq('id', initialData.id)
        .select();
      if (error) throw error;
      revalidatePath(`/dashboard/invoices`);
      return { successUpdate: true };
    }
  } catch (error: any) {
    return { error };
  }
};

export const getMaxInvoiceNumber = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .order('invoice_number', {
      ascending: false
    })
    .limit(1);

  if (!error) {
    const maxInvoiceNumber = data.length ? data[0].invoice_number : null;
    return maxInvoiceNumber;
  }
};

export async function ReferenceSubmit(values: Reference) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('references')
      .insert([{ name: values.name, balance: values.balance }])
      .select();
    if (error) throw error;
    revalidatePath(`/dashboard/references`);
    return { successNew: true };
  } catch (error: any) {
    return { error };
  }
}
