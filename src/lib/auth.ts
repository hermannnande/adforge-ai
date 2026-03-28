import { createClerkClient, verifyToken } from '@clerk/backend';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

const secretKey = process.env.CLERK_SECRET_KEY!;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const clerk = createClerkClient({ secretKey, publishableKey });

type AuthResult = { userId: string } | null;

function trustHeader(h: { get(name: string): string | null }): AuthResult {
  const uid = h.get('x-clerk-user-id');
  if (uid?.startsWith('user_')) return { userId: uid };
  return null;
}

async function verifyJwt(token: string): Promise<AuthResult> {
  try {
    const payload = await verifyToken(token, { secretKey });
    if (payload?.sub) return { userId: payload.sub };
  } catch {}
  return null;
}

async function verifyBearer(h: { get(name: string): string | null }): Promise<AuthResult> {
  const auth = h.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return verifyJwt(auth.slice(7));
}

async function verifyFromCookie(h: { get(name: string): string | null }): Promise<AuthResult> {
  const cookie = h.get('cookie');
  if (!cookie) return null;
  const m = cookie.match(/__session(?:_\w+)?=([^;]+)/);
  if (!m?.[1]) return null;
  return verifyJwt(m[1]);
}

export async function getServerAuth(req: NextRequest): Promise<AuthResult> {
  const h = req.headers;

  const fast = trustHeader(h);
  if (fast) return fast;

  const bearer = await verifyBearer(h);
  if (bearer) return bearer;

  const cookie = await verifyFromCookie(h);
  if (cookie) return cookie;

  try {
    const result = await clerk.authenticateRequest(req);
    if (result.isSignedIn) return { userId: result.toAuth().userId };
  } catch {}

  return null;
}

export async function getActionAuth(): Promise<AuthResult> {
  const h = await headers();

  const fast = trustHeader(h);
  if (fast) return fast;

  const bearer = await verifyBearer(h);
  if (bearer) return bearer;

  const cookie = await verifyFromCookie(h);
  if (cookie) return cookie;

  try {
    const url =
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://adforge-ai-one.vercel.app';
    const req = new Request(url, { headers: h });
    const result = await clerk.authenticateRequest(req);
    if (result.isSignedIn) return { userId: result.toAuth().userId };
  } catch {}

  return null;
}
