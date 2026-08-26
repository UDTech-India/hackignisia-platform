import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Authenticate request using Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, email, data } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let subject = '';
    let htmlContent = '';

    if (type === 'welcome') {
      const name = data?.name || 'there';
      subject = 'Welcome to HackIGNISIA 2026! 🎉';
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to HackIGNISIA 2026, ${name}!</h2>
          <p>Your registration is confirmed. We are thrilled to have you join us for this year's hackathon.</p>
          <p>Next steps:</p>
          <ul>
            <li>Complete your profile on the dashboard.</li>
            <li>Create or join a team using the Team Portal.</li>
          </ul>
          <p>If you have any questions, feel free to reply to this email or join our Discord server (coming soon!).</p>
          <p>Happy hacking,<br/>The HackIGNISIA Team</p>
        </div>
      `;
    } else if (type === 'team_invite') {
      const teamName = data?.teamName || 'a team';
      const teamCode = data?.teamCode || '';
      const inviterName = data?.inviterName || 'A user';
      
      subject = `You've been invited to join ${teamName} at HackIGNISIA 2026!`;
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>You've been invited!</h2>
          <p><strong>${inviterName}</strong> has invited you to join their team, <strong>${teamName}</strong>, at HackIGNISIA 2026.</p>
          <p>To join the team, use the following team code:</p>
          <h3 style="background: #f4f4f5; padding: 10px; display: inline-block; border-radius: 5px;">${teamCode}</h3>
          <p>Log in to your <a href="https://hackignisia.xyz/dashboard/team">Participant Dashboard</a>, enter this code, and you'll be added to the team!</p>
          <p>See you at the hackathon,<br/>The HackIGNISIA Team</p>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Since Aman might not have a verified domain on Resend yet,
    // we use a generic placeholder or the default testing domain.
    // Replace "onboarding@resend.dev" with your verified domain email once you have one.
    const fromAddress = process.env.NODE_ENV === 'development' 
      ? 'HackIGNISIA <onboarding@resend.dev>' 
      : 'HackIGNISIA <hello@hackignisia.xyz>';

    const { data: resendData, error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject,
      html: htmlContent,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resendData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
