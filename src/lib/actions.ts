'use server';

import { createClient } from '../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Brand, Category, Product } from '@/constants/data';

export async function signIn(credentials: { email: string; password: string }) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
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

export async function imageUpload(file: File) {
  try {
    const supabase = await createClient();
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('product_imgs')
      .upload(`ns_imgs/${fileName}`, file);
    if (error) throw error;
    return data?.path;
  } catch (error: any) {
    return { error };
  }
}

export async function productSubmit(
  values: {
    image?: FileList;
    name: string;
    category: string | null;
    brand: string | null;
    price: number;
    description?: string;
    productVariants?: string[];
  },
  initialData: Product | null,
  showUploaderState: boolean
) {
  try {
    const supabase = await createClient();
    let imgPath;

    if (initialData) {
      if (showUploaderState && values.image?.length) {
        try {
          imgPath = await imageUpload(values?.image[0]);
        } catch (error) {
          return { imgError: true };
        }
      }

      const { error } = await supabase
        .from('products')
        .update({
          title: values.name,
          price: values.price,
          description: values.description,
          category_id: values.category ? values.category : null,
          brand_id: values.brand ? values.brand : null,
          ...(imgPath && { img_url: imgPath }),
          variants: values.productVariants
        })
        .eq('id', initialData.id)
        .select();
      if (error) throw error;

      revalidatePath('/dashboard/products');
      return { successUpdate: true };
    } else {
      if (!values.image?.length) return;

      try {
        imgPath = await imageUpload(values?.image[0]);
      } catch (error) {
        return { imgError: true };
      }

      if (imgPath) {
        const { error } = await supabase
          .from('products')
          .insert([
            {
              title: values.name,
              price: values.price,
              description: values.description,
              img_url: imgPath,
              category_id: values.category ? values.category : null,
              brand_id: values.brand ? values.brand : null,
              variants: values.productVariants
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

export async function deleteContent(
  itemTable: string,
  itemData: Category | Brand | Product
) {
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
