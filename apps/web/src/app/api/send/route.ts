import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Paste your actual key inside the quotes here!
const resend = new Resend('re_7T8KMQwd_7ce7VciGhKgksiBPLv7VTNfQ'); 

export async function POST(request: Request) {
  try {
    const { html, email } = await request.json();

    const data = await resend.emails.send({
      // Resend requires you to use this specific 'from' address on the free tier
      from: 'Draft-Layer <onboarding@resend.dev>', 
      to: [email],
      subject: 'Look at my Draft-Layer Design!',
      html: html, 
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}