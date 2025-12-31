import { NextResponse } from 'next/server';

export async function GET() {
  const channelId = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID;
  const redirectUri = process.env.NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI;

  if (!channelId || !redirectUri) {
    return NextResponse.json(
      { error: 'LINE Login configuration is missing' },
      { status: 500 }
    );
  }

  const state = Math.random().toString(36).substring(7);
  const scope = 'profile openid email';
  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

  return NextResponse.redirect(lineAuthUrl);
}

