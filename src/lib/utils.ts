import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getSupabaseClient } from './actions';
import { validate as uuidValidate } from 'uuid';
import { createClient } from '@/utils/supabase/client';
import { itemTable } from 'types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

export const toastMsg = {
  newProduct: 'New product has been added',
  updateProduct: 'Product has been updated',
  dynamicNew: (type: string) => `New ${type} has been added`,
  dynamicUpdate: (type: string) => `${type} has been updated`,
  error: 'Something went wrong',
  imageUploadError: 'Image upload failed',
  signIn: 'Signed In Successfully!',
  deleteItem: 'Item has been deleted'
};

export const getImageUrl = async (img: string) => {
  const supabase = await getSupabaseClient();
  const imgUrl = img
    ? supabase.storage.from('product_imgs').getPublicUrl(img).data.publicUrl
    : null;
  return imgUrl;
};

// for client side components
export const getClientImageUrl = async (img: string) => {
  const supabase = createClient();
  const imgUrl = img
    ? supabase.storage.from('product_imgs').getPublicUrl(img).data.publicUrl
    : null;
  return imgUrl;
};

export function checkUUID(id: string): boolean {
  return uuidValidate(id);
}

export const formatTitle = (text: string, type: itemTable) => {
  let formattedType;

  switch (type) {
    case 'categories':
      formattedType = 'Category';
      break;
    case 'products':
      formattedType = 'Product';
      break;
    case 'brands':
      formattedType = 'Brand';
      break;
  }

  return `${text} ${formattedType}`;
};
