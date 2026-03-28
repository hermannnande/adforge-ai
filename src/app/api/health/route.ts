import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env
        .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ? `SET (${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(0, 10)}...)`
        : 'MISSING',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET' : 'MISSING',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'MISSING',
    },
  };

  try {
    const session = await getServerAuth(req);
    checks.clerk = {
      ok: true,
      userId: session?.userId ?? 'not-signed-in',
    };
  } catch (e) {
    checks.clerk = { ok: false, error: String(e) };
  }

  try {
    const { prisma } = await import('@/lib/db/prisma');
    const count = await prisma.user.count();
    checks.database = { ok: true, userCount: count };
  } catch (e) {
    checks.database = { ok: false, error: String(e) };
  }

  return NextResponse.json(checks, { status: 200 });
}
