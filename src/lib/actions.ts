'use server';

import { cookies } from 'next/headers';
import { createClient } from '../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { Brand, Category, itemData, Product } from 'types';

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
    name: string;
    category: string | null;
    brand: string | null;
    price: number;
    description?: string;
    productVariants?: string[];
    inStock: boolean;
    quantity: number;
    product_code?: string;
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
          title: values.name,
          price: values.price,
          description: values.description,
          category_id: values.category ? values.category : null,
          brand_id: values.brand ? values.brand : null,
          img_url: imgPaths,
          variants: values.productVariants,
          in_stock: values.inStock,
          quantity: values.quantity,
          product_code: values.product_code
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
              title: values.name,
              price: values.price,
              description: values.description,
              img_url: imgPaths,
              category_id: values.category ? values.category : null,
              brand_id: values.brand ? values.brand : null,
              variants: values.productVariants,
              in_stock: values.inStock,
              quantity: values.quantity,
              product_code: values.product_code
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

export const getCategoriesBrandsData = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('combined_categories_brands')
    .select('*');

  if (error) throw error;
  return data;
});
