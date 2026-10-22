import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase-admin';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').max(150),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
});

// Sanitize helper to eliminate XSS injection
function sanitizeString(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// In-memory rate limiting map for edge/server instance
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting via Cloudflare header
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const rateWindow = 10 * 60 * 1000; // 10 minutes
    const maxRequests = 5;

    const rateEntry = rateLimitMap.get(ip);
    if (rateEntry) {
      if (now < rateEntry.resetTime) {
        if (rateEntry.count >= maxRequests) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait before submitting another message.' },
            { status: 429 }
          );
        }
        rateEntry.count += 1;
      } else {
        rateLimitMap.set(ip, { count: 1, resetTime: now + rateWindow });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + rateWindow });
    }

    // 2. Reject if content-type contains multipart/file upload
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'File attachments are strictly prohibited on public inquiry forms.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const sanitizedData = {
      name: sanitizeString(parsed.data.name.trim()),
      email: parsed.data.email.trim().toLowerCase(),
      subject: sanitizeString(parsed.data.subject.trim()),
      message: sanitizeString(parsed.data.message.trim()),
      ip_address: ip,
      user_agent: request.headers.get('user-agent') || 'unknown',
      status: 'new' as const,
      created_at: new Date().toISOString(),
    };

    // 3. Persist to Supabase Database
    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from('contact_messages').insert(sanitizedData);
    if (dbError) {
      console.error('Database insert error:', dbError);
    }

    // 4. Dispatch Email via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && !resendApiKey.includes('dummy') && resendApiKey.startsWith('re_')) {
      try {
        const resend = new Resend(resendApiKey);
        const ownerEmail = process.env.OWNER_EMAIL || 'panditritesh005@gmail.com';
        const sender = process.env.EMAIL_FROM || 'YouTh Brain News <onboarding@resend.dev>';

        await resend.emails.send({
          from: sender,
          to: [ownerEmail],
          subject: `[YouTh Brain News Inquiry] ${sanitizedData.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e7e7e9; border-radius: 8px;">
              <h2 style="color: #235DBC; margin-top: 0;">New Contact Inquiry Received</h2>
              <p><strong>From:</strong> ${sanitizedData.name} (&lt;${sanitizedData.email}&gt;)</p>
              <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
              <div style="background-color: #f8f7f4; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="white-space: pre-wrap; margin: 0;">${sanitizedData.message}</p>
              </div>
              <p style="font-size: 12px; color: #6E6D7A;">Delivered automatically by YouTh Brain News Portal Security System.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Resend dispatch error:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received by the editorial desk.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
