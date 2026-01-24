import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const folder = formData.get('folder')?.toString() || 'uploads';

    if (!file)
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize with Sharp
    const optimizedBuffer = await sharp(buffer)
      .rotate() // <-- auto-rotates according to EXIF
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();

    const supabase = createClient();
    const fileName = `${Date.now()}.webp`;

    const { data, error } = await (await supabase).storage
      .from('imgs')
      .upload(`${folder}/${fileName}`, optimizedBuffer, {
        contentType: 'image/webp'
      });

    if (error) throw error;

    return NextResponse.json({ path: data.path });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
