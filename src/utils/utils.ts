import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { validate as uuidValidate } from 'uuid';
import { createClient } from '@/utils/supabase/client';
import { itemData, itemTable } from 'types';
import { formatInTimeZone } from 'date-fns-tz';
import { getSupabaseClient } from '@/lib/actions';

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
  dynamicNew: (type: string) => `New ${type} has been added`,
  dynamicUpdate: (type: string) => `${type} has been updated`,
  error: 'Something went wrong',
  imageUploadError: 'Image upload failed',
  signIn: 'Signed In Successfully!',
  deleteItem: 'Item has been deleted',
  addCredit: 'Credit has been added'
};

export const getImageUrl = async (img: string) => {
  if (img?.includes('supabase.co/storage/')) {
    // return if url is already correct
    return img;
  }

  const supabase = await getSupabaseClient();
  const imgUrl = img
    ? supabase.storage.from('product_imgs').getPublicUrl(img).data.publicUrl
    : null;
  return imgUrl;
};

// for client side components
export const getClientImageUrl = async (img: string) => {
  if (img?.includes('supabase.co/storage/')) {
    // return if url is already correct
    return img;
  }

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
    case 'invoices':
      formattedType = 'Invoice';
      break;
    case 'references':
      formattedType = 'Reference';
      break;
    case 'suppliers':
      formattedType = 'Supplier';
      break;
  }

  return `${text} ${formattedType}`;
};

export async function imageUpload(file: File) {
  try {
    const supabase = createClient();
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

export function formatToPKTDate(utcDate: string | Date): string {
  try {
    return formatInTimeZone(new Date(utcDate), 'Asia/Karachi', 'dd-MM-yyyy');
  } catch {
    return '';
  }
}

export function filterWithDate(
  data: itemData[],
  from: Date,
  to: Date
): itemData[] {
  const start = new Date(from);
  const end = new Date(to);

  // normalize times for comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return data.filter(
    (item) =>
      item.created_at &&
      new Date(item.created_at) >= start &&
      new Date(item.created_at) <= end
  );
}
