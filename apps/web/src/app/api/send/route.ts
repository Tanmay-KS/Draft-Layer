import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Paste your actual key inside the quotes here!
const resend = new Resend('re_7T8KMQwd_7ce7VciGhKgksiBPLv7VTNfQ'); 

export async function POST(req: Request) {
  try {
    const { html, email } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Draft-Layer <onboarding@resend.dev>', // You can update this later with a custom domain
      to: [email],
      subject: 'Your Draft-Layer Design 🚀',
      html: html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}