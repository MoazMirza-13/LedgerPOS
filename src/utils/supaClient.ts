import { createClient } from './supabase/client';
import { Brand, Category, Product } from '@/constants/data';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';
import { toastMsg } from '@/lib/utils';

export const signIn = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      throw error;
    }
    toast.success(toastMsg.signIn);
  } catch (error: any) {
    toast.error(error.message);
    return error;
  }
};

export const signOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect(`/`);
};

export const imageUpload = async (file: File) => {
  const supabase = createClient();
  const imgFile = file;
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('product_imgs')
    .upload(`ns_imgs/${fileName}`, imgFile);
  if (error) throw error;
  return data?.path;
};

export async function productSubmit(
  values: {
    image?: FileList | undefined;
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
    const supabase = createClient();
    let imgPath;
    if (initialData) {
      if (showUploaderState && values.image?.length) {
        try {
          imgPath = await imageUpload(values?.image[0]);
        } catch (error) {
          toast.error(toastMsg.imageUploadError);
          return;
        }
      }
      const { data, error } = await supabase
        .from('products')
        .update([
          {
            title: values.name,
            price: values.price,
            description: values.description,
            category_id: values.category ? values.category : null,
            brand_id: values.brand ? values.brand : null,
            ...(imgPath && { img_url: imgPath }),
            variants: values.productVariants
          }
        ])
        .eq('id', initialData.id)
        .select();
      if (error) throw error;
      toast.success(toastMsg.updateProduct);
    } else {
      // new
      if (!values.image?.length) {
        return;
      }
      try {
        imgPath = await imageUpload(values?.image[0]);
      } catch (error) {
        toast.error(toastMsg.imageUploadError);
        return;
      }
      if (imgPath) {
        const { data, error } = await supabase
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
        toast.success(toastMsg.newProduct);
      }
    }
  } catch (error: any) {
    toast.error(toastMsg.error);
    return error;
  }
}

export async function categoryBrandSubmit(
  values: { title: string; description?: string },
  initialData: (Category | Brand) | null,
  type: string
) {
  try {
    const supabase = createClient();
    if (!initialData) {
      const { data, error } = await supabase
        .from(type)
        .insert([{ title: values.title, description: values.description }])
        .select();
      if (error) throw error;
      toast.success(
        toastMsg.dynamicNew(type === 'categories' ? 'Category' : 'Brand')
      );
    } else {
      const { data, error } = await supabase
        .from(type)
        .update([{ title: values.title, description: values.description }])
        .eq('id', initialData.id)
        .select();
      if (error) throw error;
      toast.success(
        toastMsg.dynamicUpdate(type === 'categories' ? 'Category' : 'Brand')
      );
    }
  } catch (error: any) {
    toast.error(toastMsg.error);
    return error;
  }
}
