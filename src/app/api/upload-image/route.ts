import { NextResponse } from 'next/server';
import sharp from 'sharp';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function moderateImageForSexualContent(
  optimizedBuffer: Buffer
): Promise<boolean> {
  // Convert the already optimized buffer to base64
  const base64Image = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

  // 10-second timeout for moderation
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const moderation = await openai.moderations.create(
      {
        model: 'omni-moderation-latest',
        input: [
          {
            type: 'image_url',
            image_url: { url: base64Image }
          }
        ]
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const result = moderation.results?.[0];
    const categories = result?.categories || {};

    return Boolean(categories.sexual || categories['sexual/minors']);
  } catch (err: any) {
    clearTimeout(timeout);
    throw new Error(`Moderation failed: ${err.message}`);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const folder = formData.get('folder')?.toString() || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';

    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image uploads are allowed' },
        { status: 400 }
      );
    }

    // 🔹 Resize + optimize first (single Sharp operation)
    const optimizedBuffer = await sharp(buffer)
      .rotate() // auto-rotate EXIF
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();

    // 🔹 Run moderation on the optimized image
    const hasSexualContent =
      await moderateImageForSexualContent(optimizedBuffer);

    if (hasSexualContent) {
      return NextResponse.json(
        { error: 'Image rejected due to sexual or nudity content' },
        { status: 400 }
      );
    }

    // 🔹 Upload the same optimized image to Supabase
    const supabase = await createClient();
    const fileName = `${Date.now()}.webp`;

    const { data, error } = await supabase.storage
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
