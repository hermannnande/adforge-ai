import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const all: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    if (k.startsWith('x-clerk') || k === 'authorization' || k === 'cookie') {
      all[k] = k === 'cookie' ? v.slice(0, 120) + '...' : v.slice(0, 80);
    }
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    headersReceived: all,
    hasAuthorization: !!req.headers.get('authorization'),
    hasClerkUserId: !!req.headers.get('x-clerk-user-id'),
    hasClerkSessionId: !!req.headers.get('x-clerk-session-id'),
    hasCookie: !!req.headers.get('cookie'),
    cookieKeys: req.headers.get('cookie')
      ?.split(';')
      .map((c) => c.trim().split('=')[0])
      .filter(Boolean) ?? [],
  });
}
