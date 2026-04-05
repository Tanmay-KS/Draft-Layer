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

export async function GET() {
  try {
    // 🔍 Fetch all templates, sorted by the newest first
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase GET Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" }, 
      { status: 500 }
    );
  }
}