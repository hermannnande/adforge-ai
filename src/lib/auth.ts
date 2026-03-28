import { createClerkClient, verifyToken } from '@clerk/backend';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

const secretKey = process.env.CLERK_SECRET_KEY!;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const clerk = createClerkClient({ secretKey, publishableKey });

type AuthResult = { userId: string } | null;

async function verifyJwt(token: string): Promise<AuthResult> {
  try {
    const payload = await verifyToken(token, { secretKey });
    if (payload?.sub) return { userId: payload.sub };
  } catch {}
  return null;
}

async function verifyBearer(authHeader: string | null): Promise<AuthResult> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyJwt(authHeader.slice(7));
}

async function verifySession(
  userId: string | null,
  sessionId: string | null,
): Promise<AuthResult> {
  if (!userId || !sessionId) return null;
  try {
    const session = await clerk.sessions.getSession(sessionId);
    if (session.userId === userId && session.status === 'active') {
      return { userId };
    }
  } catch {}
  return null;
}

async function verifyFromCookie(
  cookieHeader: string | null,
): Promise<AuthResult> {
  if (!cookieHeader) return null;
  const patterns = [/__session=([^;]+)/, /__session_\w+=([^;]+)/];
  for (const re of patterns) {
    const m = cookieHeader.match(re);
    if (m?.[1]) {
      const result = await verifyJwt(m[1]);
      if (result) return result;
    }
  }
  return null;
}

function trustClerkHeader(req: { get(name: string): string | null }) {
  const uid = req.get('x-clerk-user-id');
  if (uid?.startsWith('user_')) return { userId: uid };
  return null;
}

export async function getServerAuth(req: NextRequest): Promise<AuthResult> {
  const fromBearer = await verifyBearer(req.headers.get('Authorization'));
  if (fromBearer) return fromBearer;

  const fromSession = await verifySession(
    req.headers.get('x-clerk-user-id'),
    req.headers.get('x-clerk-session-id'),
  );
  if (fromSession) return fromSession;

  const fromCookie = await verifyFromCookie(req.headers.get('cookie'));
  if (fromCookie) return fromCookie;

  try {
    const result = await clerk.authenticateRequest(req);
    if (result.isSignedIn) return { userId: result.toAuth().userId };
  } catch {}

  return trustClerkHeader(req.headers);
}

export async function getActionAuth(): Promise<AuthResult> {
  const h = await headers();

  const fromBearer = await verifyBearer(h.get('Authorization'));
  if (fromBearer) return fromBearer;

  const fromSession = await verifySession(
    h.get('x-clerk-user-id'),
    h.get('x-clerk-session-id'),
  );
  if (fromSession) return fromSession;

  const fromCookie = await verifyFromCookie(h.get('cookie'));
  if (fromCookie) return fromCookie;

  try {
    const url =
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://adforge-ai-one.vercel.app';
    const req = new Request(url, { headers: h });
    const result = await clerk.authenticateRequest(req);
    if (result.isSignedIn) return { userId: result.toAuth().userId };
  } catch {}

  return trustClerkHeader(h);
}
