import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Unique filename to prevent overwriting
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    // Upload to the bucket you just created
    const { data, error } = await supabase.storage
      .from('email-images')
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('email-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}