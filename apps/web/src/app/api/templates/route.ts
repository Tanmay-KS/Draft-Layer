import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'template';

    const supabase = createClient();

    if (type === 'project') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_project', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_template', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, content, is_project = true, is_template = false } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (is_project && !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insertData: any = { name, content, is_project, is_template };
    if (is_project && user) {
      insertData.user_id = user.id;
    }

    // Admin client for inserts to bypass RLS
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminSupabase
      .from('templates')
      .insert([insertData])
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error("Save Template Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}