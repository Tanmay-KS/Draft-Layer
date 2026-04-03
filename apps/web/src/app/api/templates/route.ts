import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Secure backend connection
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, content } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    // Insert the new template into the database
    // We use .select('id').single() to immediately get the new UUID back
    const { data, error } = await supabase
      .from('templates')
      .insert([{ name, content }])
      .select('id')
      .single();

    if (error) throw error;

    // Send the success response and the new ID back to the frontend
    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error("Save Template Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}