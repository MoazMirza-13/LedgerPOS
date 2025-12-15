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
  Product
} from 'types';

export const getSupabaseClient = async () => {
  // for util functions
  return await createClient();
};

export async function signIn(credentials: { email: string; password: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    // const { data: userRole, error: urError } = await supabase
    //   .from('user_roles')
    //   .select('role')
    //   .eq('user_id', data.user?.id)
    //   .single();

    if (error) throw error;

    // const currentRole = userRole?.role;
    // const cookieStore = await cookies();
    // cookieStore.set('currentRole', currentRole || '', {
    //   maxAge: 60 * 60 * 24 * 30 * 13
    // });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // (await cookies()).delete('currentRole');
  redirect('/');
}

export async function forceLogoutAllUsers() {
  const supabase = await createClient();
  await supabase.rpc('force_logout_all_users');
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
    productTitle: string;
    productCode: string;
    category: string | null;
    brand: string | null;
    costPrice: number;
    sellingPrice: number;
    minQuantity: number;
    quantity: number;
    productVariants?: string[];
    inStock: boolean;
    description: string;
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
          product_code: values.productCode,
          title: values.productTitle,
          cost_price: values.costPrice,
          selling_price: values.sellingPrice,
          category_id: values.category ? values.category : null,
          brand_id: values.brand ? values.brand : null,
          min_quantity: values.minQuantity,
          quantity: values.quantity,
          img_url: imgPaths,
          variants: values.productVariants,
          in_stock: values.inStock,
          description: values.description
        })
        .eq('id', initialData.id)
        .select();
      if (error) throw error;

      revalidatePath('/dashboard/products');
      return { successUpdate: true };
    } else {
      const { error } = await supabase
        .from('products')
        .insert([
          {
            product_code: values.productCode,
            title: values.productTitle,
            cost_price: values.costPrice,
            selling_price: values.sellingPrice,
            img_url: imgPaths,
            category_id: values.category ? values.category : null,
            brand_id: values.brand ? values.brand : null,
            min_quantity: values.minQuantity,
            quantity: values.quantity,
            variants: values.productVariants,
            in_stock: values.inStock,
            description: values.description
          }
        ])
        .select();

      if (error) throw error;
      revalidatePath('/dashboard/products');
      return { successNew: true };
    }
  } catch (error: any) {
    return { error };
  }
}

export async function categoryBrandSubmit(
  values: { title: string; description?: string; img: string },
  initialData: (Category | Brand) | null,
  type: string
) {
  try {
    const supabase = await createClient();

    if (!initialData) {
      const { error } = await supabase
        .from(type)
        .insert([
          {
            title: values.title,
            description: values.description,
            img: values.img
          }
        ])
        .select();
      if (error) throw error;
      revalidatePath(`/dashboard/${type}`);
      return { successNew: true };
    } else {
      const { error } = await supabase
        .from(type)
        .update([
          {
            title: values.title,
            description: values.description,
            img: values.img
          }
        ])
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
      const { error } = await supabase.rpc('create_invoice_with_items_ns', {
        customer_name: values.customer_name,
        customer_number: values.customer_number,
        customer_address: values.customer_address,
        total_price: values.total_price,
        invoice_number: values.invoice_number,
        payment: values.payment,
        items: values.invoice_items.map((item: Invoice_items) => ({
          product_code: item.product_code,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          optional_item: item.optional_item
        }))
      });

      if (error) throw error;
      revalidatePath(`/dashboard/invoices`);
      return { successNew: true };
    } else {
      const isCustomerSame =
        values.customer_name === initialData.customer_name &&
        values.customer_number === initialData.customer_number &&
        values.customer_address === initialData.customer_address;

      if (isCustomerSame) {
        {
          const { error } = await supabase
            .from('invoices')
            .update([
              {
                payment: values.payment
              }
            ])
            .eq('id', initialData.id)
            .select();

          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('invoices')
          .update([
            {
              customer_name: values.customer_name,
              customer_number: values.customer_number,
              customer_address: values.customer_address,
              payment: values.payment,
              edited: true
            }
          ])
          .eq('id', initialData.id)
          .select();

        if (error) throw error;
      }

      revalidatePath(`/dashboard/invoices`);
      return { successUpdate: true };
    }
  } catch (error: any) {
    return { error };
  }
};

export const getMaxInvoiceNumber = async (type: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(type)
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
